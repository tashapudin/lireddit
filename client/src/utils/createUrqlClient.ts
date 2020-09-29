import { dedupExchange, fetchExchange } from "urql";
import {
  LogoutMutation,
  CurrentUserQuery,
  CurrentUserDocument,
} from "../generated/graphql";
import betterUpdateQuery from "./betterUpdateQuery";
import { cacheExchange } from "@urql/exchange-graphcache";

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:8000/graphql",
  fetchOptions: { credentials: "include" as const },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, CurrentUserQuery>(
              cache,
              { query: CurrentUserDocument },
              _result,
              () => ({ currentUser: null })
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
