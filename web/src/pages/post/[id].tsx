import { Heading } from "@chakra-ui/layout";
import { Box, Flex, Spacer, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { UpvoteSection } from "../../components/UpvoteSection";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = ({}) => {
	const [{ data, error, fetching }] = useGetPostFromUrl();

	if (fetching) {
		return (
			<Layout>
				<div>Loading data...</div>
			</Layout>
		);
	}
	if (error) {
		return <div>{error.message}</div>;
	}
	if (!data?.post) {
		return (
			<Layout>
				<Box>Post not found.</Box>
			</Layout>
		);
	}
	return (
		<Layout>
			<Stack spacing={8}>
				<Flex
					key={data.post.id}
					p={3}
					borderRadius="xl"
					shadow="lg"
					borderWidth="1px"
				>
					<UpvoteSection post={data.post} />
					<Box flex={1}>
						<Flex>
							<Heading fontSize="xl">{data.post.title}</Heading>
							<Spacer />
							<EditDeletePostButtons
								id={data.post.id}
								creatorId={data.post.creator.id}
							/>
						</Flex>
						<Text>Posted by {data.post.creator.username}</Text>
						<Text flex={1} mt={4}>
							{data.post.text}
						</Text>
					</Box>
				</Flex>
			</Stack>
		</Layout>
	);
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
