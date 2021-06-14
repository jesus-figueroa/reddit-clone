import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
	post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		"upvote-loading" | "downvote-loading" | "not-loading"
	>("not-loading");
	const [, vote] = useVoteMutation();
	return (
		<Flex direction="column" justifyContent="normal" alignItems="center" mr={2}>
			<IconButton
				onClick={() => {
					if (post.voteStatus === 1) {
						return;
					}
					setLoadingState("upvote-loading");
					vote({
						postId: post.id,
						value: 1,
					});
					setLoadingState("not-loading");
				}}
				isLoading={loadingState === "upvote-loading"}
				variant="outline"
				colorScheme={post.voteStatus === 1 ? "green" : "blackAlpha"}
				aria-label="Upvote"
				icon={<TriangleUpIcon />}
			/>
			<Text fontSize="xl">{post.points}</Text>
			<IconButton
				onClick={() => {
					if (post.voteStatus === -1) {
						return;
					}
					setLoadingState("downvote-loading");
					vote({
						postId: post.id,
						value: -1,
					});
					console.log(post.voteStatus);
					setLoadingState("not-loading");
				}}
				isLoading={loadingState === "downvote-loading"}
				variant="outline"
				colorScheme={post.voteStatus === -1 ? "red" : "blackAlpha"}
				aria-label="Downvote"
				icon={<TriangleDownIcon />}
			/>
		</Flex>
	);
};
