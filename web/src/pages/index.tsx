import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Spacer,
	Stack,
	Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpvoteSection } from "../components/UpvoteSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
	const [variables, setVariables] = useState({ limit: 15, cursor: null });
	const [{ data, error, fetching }] = usePostsQuery({
		variables,
	});

	if (!fetching && !data) {
		return (
			<div>
				<div>Query failed</div>
				<div>{error?.message}</div>
			</div>
		);
	}

	return (
		<Layout>
			{!data && fetching ? (
				<div>Loading data...</div>
			) : (
				<Stack spacing={8}>
					{data.posts.posts.map(p =>
						!p ? null : (
							<Flex
								key={p.id}
								p={3}
								borderRadius="xl"
								shadow="lg"
								borderWidth="1px"
							>
								<UpvoteSection post={p} />
								<Box flex={1}>
									<Flex>
										<NextLink href="/post/[id]" as={`/post/${p.id}`}>
											<Link>
												<Heading fontSize="xl">{p.title}</Heading>
											</Link>
										</NextLink>
										<Spacer />
										<EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
									</Flex>
									<Text>Posted by {p.creator.username}</Text>
									<Text flex={1} mt={4}>
										{p.textSnippet}
									</Text>
								</Box>
							</Flex>
						)
					)}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() => {
							setVariables({
								limit: variables.limit,
								cursor: data.posts.posts[data.posts.posts.length - 1].createAt,
							});
						}}
						isLoading={fetching}
						m="auto"
						my="8"
					>
						Load More Post
					</Button>
				</Flex>
			) : (
				<Flex>
					<Box w="100%" p={8} color="white"></Box>
				</Flex>
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
