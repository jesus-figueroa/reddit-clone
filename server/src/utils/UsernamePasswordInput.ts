import { Field, InputType } from "type-graphql";

// Input to type the username and password as one object argument

@InputType()
export class UsernamePasswordInput {
	@Field()
	email: string;
	@Field()
	username: string;
	@Field()
	password: string;
}
