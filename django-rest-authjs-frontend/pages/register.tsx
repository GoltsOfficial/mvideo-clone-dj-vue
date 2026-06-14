import {FormEvent, useState} from "react";
import NextLink from "next/link";
import {useRouter} from "next/router";
import {signIn, useSession} from "next-auth/react";
import axios from "axios";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";

type RegisterForm = {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
};

const initialForm: RegisterForm = {
  email: "",
  username: "",
  first_name: "",
  last_name: "",
  password: "",
  password_confirm: "",
};

const getBackendUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000/api/";
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      return Object.entries(data)
        .map(([field, value]) => {
          const message = Array.isArray(value) ? value.join(" ") : String(value);
          return `${field}: ${message}`;
        })
        .join(" ");
    }
  }

  if (error instanceof Error) return error.message;
  return "Registration failed. Please try again.";
};

export default function Register() {
  const router = useRouter();
  const toast = useToast();
  const {data: session, status} = useSession();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading") {
    return <Spinner size="lg"/>;
  }

  if (session) {
    router.push("/profile");
    return null;
  }

  const updateField = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({...current, [field]: value}));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await axios.post(`${getBackendUrl()}auth/register/`, form);

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/profile",
      });

      if (result?.error) {
        toast({
          title: "Account created",
          description: "Now sign in with the email and password you used.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        router.push("/");
        return;
      }

      router.push(result?.url || "/profile");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg="#f5f7fb" px={4} py={10}>
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        boxShadow="0 18px 48px rgba(15, 23, 42, 0.08)"
        maxW="520px"
        mx="auto"
        p={{base: 6, md: 8}}
      >
        <VStack align="stretch" spacing={6}>
          <Box>
            <Heading color="#151922" fontSize="28px" letterSpacing="0">
              Create account
            </Heading>
            <Text color="gray.600" mt={2}>
              Use email and password, or continue with Google.
            </Text>
          </Box>

          <Button
            h="44px"
            variant="outline"
            borderColor="gray.300"
            color="#202938"
            onClick={() => signIn("google", {callbackUrl: "/profile"})}
          >
            Continue with Google
          </Button>

          <HStack>
            <Divider/>
            <Text color="gray.500" flexShrink={0} fontSize="sm">
              or
            </Text>
            <Divider/>
          </HStack>

          {error && (
            <Alert status="error" borderRadius="8px">
              <AlertIcon/>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  autoComplete="username"
                  value={form.username}
                  onChange={(event) => updateField("username", event.target.value)}
                />
              </FormControl>

              <SimpleGrid columns={{base: 1, md: 2}} spacing={4}>
                <FormControl>
                  <FormLabel>First name</FormLabel>
                  <Input
                    autoComplete="given-name"
                    value={form.first_name}
                    onChange={(event) => updateField("first_name", event.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Last name</FormLabel>
                  <Input
                    autoComplete="family-name"
                    value={form.last_name}
                    onChange={(event) => updateField("last_name", event.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  autoComplete="new-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Repeat password</FormLabel>
                <Input
                  autoComplete="new-password"
                  type="password"
                  value={form.password_confirm}
                  onChange={(event) => updateField("password_confirm", event.target.value)}
                />
              </FormControl>

              <Button
                bg="#e30613"
                color="white"
                h="44px"
                isLoading={isSubmitting}
                type="submit"
                _hover={{bg: "#bd0010"}}
              >
                Create account
              </Button>
            </VStack>
          </form>

          <Text color="gray.600" fontSize="sm" textAlign="center">
            Already have an account?{" "}
            <Link as={NextLink} color="#d70010" fontWeight="700" href="/">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
