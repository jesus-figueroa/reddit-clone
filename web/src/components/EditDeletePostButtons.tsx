import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Flex,
	IconButton,
	Link,
	useDisclosure,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React, { useRef } from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
	id: number;
	creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
	id,
	creatorId,
}) => {
	const [, deletePost] = useDeletePostMutation();
	const [{ data }] = useMeQuery();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = useRef();
	if (data?.me?.id !== creatorId) {
		return null;
	}
	return (
		<Flex direction="row" ml={2}>
			<NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
				<Link>
					<IconButton
						size="xs"
						variant="outline"
						colorScheme="yellow"
						aria-label="Edit Post"
						icon={<EditIcon />}
					/>
				</Link>
			</NextLink>
			<>
				<IconButton
					onClick={onOpen}
					ml={2}
					size="xs"
					variant="outline"
					colorScheme="red"
					aria-label="Delete Post"
					icon={<DeleteIcon />}
				/>
				<AlertDialog
					isOpen={isOpen}
					leastDestructiveRef={cancelRef}
					onClose={onClose}
				>
					<AlertDialogOverlay>
						<AlertDialogContent>
							<AlertDialogHeader fontSize="lg" fontWeight="bold">
								Delete Post
							</AlertDialogHeader>

							<AlertDialogBody>
								Are you sure? You can't undo this action afterwards.
							</AlertDialogBody>

							<AlertDialogFooter>
								<Button ref={cancelRef} onClick={onClose}>
									Cancel
								</Button>
								<Button
									colorScheme="red"
									onClick={() => {
										deletePost({ id: id });
									}}
									ml={3}
								>
									Delete
								</Button>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialogOverlay>
				</AlertDialog>
			</>
		</Flex>
	);
};
