import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
// import { Post } from "../entities/Post";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "dotenv-safe/config";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { Upvote } from "./entities/Upvote";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
	// Initialize the database connection
	const conn = await createConnection({
		type: "postgres",
		url: process.env.DATABASE_URL,
		logging: true,
		// synchronize: true,
		migrations: [path.join(__dirname, "./migrations/*")],
		entities: [Post, User, Upvote],
	});

	await conn.runMigrations();

	// await Upvote.delete({});

	// Create thee web application
	const app = express();

	// Connect and create redis storage for cookies
	const RedisStore = connectRedis(session);
	const redis = new Redis(process.env.REDIS_URL);

	app.set("trust proxy", 1);
	app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

	// Configure and initialize cookies for the web application, using redis for storage
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
				httpOnly: true,
				sameSite: "lax",
				secure: __prod__,
			},
			saveUninitialized: false,
			secret: process.env.SESSION_SECRET,
			resave: false,
		})
	);

	// Initialize apollo server
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({
			req,
			res,
			redis,
			userLoader: createUserLoader(),
			upvoteLoader: createUpvoteLoader(),
		}),
	});

	// Apply apollo server middleware to web application
	apolloServer.applyMiddleware({ app, cors: false });

	// Begin listening to port 4000
	app.listen(parseInt(process.env.PORT), () => {
		console.log("server started on localhost:4000");
	});

	// const posts = orm.em.find(Post, {});
	// console.log(posts);
};

main().catch(err => {
	console.error(err);
});
