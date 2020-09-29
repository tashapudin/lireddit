import { Box, Link, Flex, Button } from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { useCurrentUserQuery, useLogoutMutation } from "../generated/graphql";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useCurrentUserQuery();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let body = null;

  if (!fetching) {
    if (!data?.currentUser) {
      body = (
        <>
          <NextLink href="/login">
            <Link mr={4}>Login</Link>
          </NextLink>
          <NextLink href="/register">
            <Link mr={4}>Register</Link>
          </NextLink>
        </>
      );
    } else {
      body = (
        <Flex>
          <Box mr={4}>{data.currentUser.user?.username}</Box>
          <Button
            variant="link"
            onClick={() => logout()}
            isLoading={logoutFetching}
          >
            logout
          </Button>
        </Flex>
      );
    }
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
