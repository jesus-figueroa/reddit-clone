import {
	Avatar,
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Spacer,
	Stack,
	Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	const router = useRouter();
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({
		pause: isServer(),
	});
	let body = null;

	if (fetching) {
	} else if (!data?.me) {
		body = (
			<Stack
				flex={{ base: 1, md: 0 }}
				justify={"flex-end"}
				align="center"
				direction={"row"}
			>
				<NextLink href="/login">
					<Button
						display={{ base: "none", md: "inline-flex" }}
						fontSize={"sm"}
						fontWeight={600}
						color={"white"}
						bg={"gray.400"}
						href={"#"}
						_hover={{
							bg: "gray.300",
						}}
					>
						Sign In
					</Button>
				</NextLink>
				<NextLink href="/register">
					<Button
						display={{ base: "none", md: "inline-flex" }}
						fontSize={"sm"}
						fontWeight={600}
						color={"white"}
						bg={"teal.400"}
						href={"#"}
						_hover={{
							bg: "teal.300",
						}}
					>
						Sign Up
					</Button>
				</NextLink>
			</Stack>
		);
	} else {
		body = (
			<Stack
				flex={{ base: 1, md: 0 }}
				align="center"
				justify={"flex-end"}
				direction={"row"}
			>
				<NextLink href="/create-post">
					<Box>
						<Button
							fontSize={"sm"}
							fontWeight={600}
							color={"white"}
							bg={"teal.400"}
							href={"#"}
							_hover={{
								bg: "teal.300",
							}}
						>
							Create Post
						</Button>
					</Box>
				</NextLink>
				<Spacer />
				<Box>
					<Button
						onClick={async () => {
							await logout();
						}}
						isLoading={logoutFetching}
						fontSize={"sm"}
						fontWeight={600}
						color={"white"}
						bg={"red.400"}
						href={"#"}
						_hover={{
							bg: "red.300",
						}}
					>
						Logout
					</Button>
				</Box>
				<Avatar />
				<Box>
					<Text fontWeight="bold" color="gray.100">
						{data.me.username}
					</Text>
					<Text fontSize="sm" color="gray.100">
						Logged in
					</Text>
				</Box>
			</Stack>
		);
	}

	return (
		<Flex zIndex={1} position="sticky" top={0} bg="gray.900" p={4} shadow="lg">
			<Flex margin="auto" flex={1} align="center" maxW={800}>
				<NextLink href="/">
					<Link>
						<Heading color="white">Reddit Clone</Heading>
					</Link>
				</NextLink>
				<Box ml={"auto"}>{body}</Box>
			</Flex>
		</Flex>
	);
};
