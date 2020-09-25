import React, { useState } from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/core";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface registerProps {
  username: string;
  password: string;
}

const Register: React.FC<registerProps> = ({}) => {
  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();
  const [{}, register] = useRegisterMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={loginDetails}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
