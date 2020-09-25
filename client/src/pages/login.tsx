import React, { useState } from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/core";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface loginProps {
  username: string;
  password: string;
}

const Login: React.FC<loginProps> = ({}) => {
  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();
  const [{}, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={loginDetails}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ loginInput: values });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label="Username"
              placeholder="type username here"
              name="username"
            ></InputField>
            <Box mt={4}>
              <InputField
                label="Password"
                placeholder="type password here"
                name="password"
                type="password"
              ></InputField>
            </Box>
            <Button
              mt={8}
              type="submit"
              variantColor="teal"
              isLoading={isSubmitting}
            >
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
