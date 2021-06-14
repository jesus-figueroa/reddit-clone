import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		if (root.text.length > 200) {
			return root.text.slice(0, 200) + "...";
		}
		return root.text;
	}

	@FieldResolver(() => User)
	creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(post.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() post: Post,
		@Ctx() { req, upvoteLoader }: MyContext
	) {
		if (!req.session.userId) {
			return null;
		}
		const upvote = await upvoteLoader.load({
			postId: post.id,
			userId: req.session.userId,
		});

		return upvote ? upvote.value : null;
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const { userId } = req.session;
		const vote = await Upvote.findOne({ where: { postId, userId } });
		const isVote = value !== -1;
		const realVote = isVote ? 1 : -1;

		if (vote && vote.value !== realVote) {
			await getConnection().transaction(async tm => {
				await tm.query(
					`
					update upvote
					set value = $1
					where "postId" = $2 and "userId" = $3
				`,
					[realVote, postId, userId]
				);

				tm.query(
					`
					update post
					set points = points + $1
					where id = $2;
				`,
					[2 * realVote, postId]
				);
			});
		} else if (!vote) {
			await getConnection().transaction(async tm => {
				await tm.query(
					`
					insert into upvote ("userId", "postId", value)
					values ($1, $2, $3)
				`,
					[userId, postId, realVote]
				);

				tm.query(
					`
				update post
				set points = points + $1
				where id = $2;
			`,
					[realVote, postId]
				);
			});
		}
		return true;
	}

	// Quary 'posts' method to find all posts
	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;

		const replacements: any[] = [realLimitPlusOne];

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}

		const posts = await getConnection().query(
			`
			select p.* from post p
			${cursor ? `where p."createAt" < $2` : ""}
			order by p."createAt" DESC
			limit $1
		`,
			replacements
		);

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	// Quary 'post' method to find a post based off 'id'
	@Query(() => Post, { nullable: true })
	post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	// Mutation 'createPost' to add a new post
	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("options") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({
			...input,
			creatorId: req.session.userId,
		}).save();
	}

	// Mutation 'updatePost' to update an existing post
	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg("id", () => Int) id: number,
		@Arg("title") title: string,
		@Arg("text") text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const result = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where('id = :id and "creatorId" = :creatorId', {
				id,
				creatorId: req.session.userId,
			})
			.returning("*")
			.execute();

		return result.raw[0];
	}

	// Mutation 'deletePost' to delete a post base of 'id'
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		const post = await Post.findOne(id);
		if (!post) {
			return false;
		}
		if (post.creatorId !== req.session.userId) {
			throw new Error("not authorized");
		}
		await Upvote.delete({ postId: id });
		await Post.delete({ id, creatorId: req.session.userId });
		return true;
	}
}
