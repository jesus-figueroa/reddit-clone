import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";

export const createUpvoteLoader = () =>
	new DataLoader<{ postId: number; userId: number }, Upvote | null>(
		async keys => {
			const upvotes = await Upvote.findByIds(keys as any);
			const upvoteIdToUser: Record<string, Upvote> = {};
			upvotes.forEach(upvote => {
				upvoteIdToUser[`${upvote.userId}|${upvote.postId}`] = upvote;
			});

			return keys.map(key => upvoteIdToUser[`${key.userId}|${key.postId}`]);
		}
	);
