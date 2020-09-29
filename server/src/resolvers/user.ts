import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => UserResponse, { nullable: true })
  async currentUser(
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse | null> {
    if (req.session) {
      if (!req.session.userId) {
        return null;
      }
      const user = await em.findOne(User, { id: req.session.userId });
      if (!user) {
        return {
          errors: [
            {
              field: "username",
              message:
                "Couldn't find user with that username, please try logging in again",
            },
          ],
        };
      }
      return { user };
    }
    return null;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("LoginInput")
    LoginInput: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = LoginInput;
    if (username.length <= 3) {
      return {
        errors: [
          {
            field: "username",
            message: "username must be at least 4 characters",
          },
        ],
      };
    }

    if (password.length <= 6) {
      return {
        errors: [
          {
            field: "password",
            message: "password must be at least 7 characters",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, { username, password: hashedPassword });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505")
        return {
          errors: [
            {
              field: "username",
              message: "username has already been taken",
            },
          ],
        };
    }

    if (req.session) {
      req.session.userId = user.id;
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("LoginInput")
    LoginInput: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = LoginInput;
    const user = await em.findOne(User, { username });
    if (!user) {
      return {
        errors: [{ field: "username", message: "Invalid login." }],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "Invalid login." }],
      };
    }

    if (req.session) {
      req.session.userId = user.id;
    }

    return { user };
  }

  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Query(() => User, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    return em.findOne(User, { id });
  }

  @Mutation(() => Post)
  async createUser(
    @Arg("title", () => String) title: string,
    @Ctx() { em }: MyContext
  ): Promise<User> {
    const user = em.create(User, { title });
    await em.persistAndFlush(user);
    return user;
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    try {
      await em.nativeDelete(User, { id });
      return true;
    } catch {
      console.log("COULD NOT DELETE POST");
      return false;
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session?.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
  }
}
