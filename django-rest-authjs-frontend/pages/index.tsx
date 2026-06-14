// pages/index.tsx

import {useRouter} from "next/router";
import {signIn, useSession} from "next-auth/react";
import NextLink from "next/link";
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function Home() {

  const router = useRouter();
  const {data: session, status} = useSession();

  if (status == "loading") {
    return <Spinner size="lg"/>;
  }

  // If the user is authenticated redirect to `/profile`
  if (session) {
    router.push("profile");
    return;
  }

  return (
    <Box minH="100vh" bg="#f5f7fb" px={4} py={12}>
      <VStack
        align="stretch"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        boxShadow="0 18px 48px rgba(15, 23, 42, 0.08)"
        maxW="420px"
        mx="auto"
        p={8}
        spacing={5}
      >
        <Box>
          <Heading color="#151922" fontSize="28px" letterSpacing="0">
            MVideo account
          </Heading>
          <Text color="gray.600" mt={2}>
            Sign in or create an account to continue.
          </Text>
        </Box>
        <ButtonGroup flexDirection="column" gap={3} spacing={0}>
          <Button
            bg="#e30613"
            color="white"
            _hover={{bg: "#bd0010"}}
            onClick={() => signIn(undefined, {callbackUrl: "/profile"})}
          >
            Sign in
          </Button>
          <Button
            variant="outline"
            borderColor="gray.300"
            color="#202938"
            onClick={() => signIn("google", {callbackUrl: "/profile"})}
          >
            Continue with Google
          </Button>
        </ButtonGroup>
        <Text color="gray.600" fontSize="sm" textAlign="center">
          No account yet?{" "}
          <Link as={NextLink} color="#d70010" fontWeight="700" href="/register">
            Create one
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}
