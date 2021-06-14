import { Field, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { Upvote } from "./Upvote";

// 'User' object handles the data storage of users
@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column({ unique: true })
	username!: string;

	@Field()
	@Column({ unique: true })
	email!: string;

	@Column()
	password!: string;

	@OneToMany(() => Post, post => post.creator)
	posts: Post[];

	@OneToMany(() => Upvote, upvote => upvote.user)
	upvotes: Upvote[];

	@Field(() => String)
	@CreateDateColumn()
	createAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updateAt: Date;
}
