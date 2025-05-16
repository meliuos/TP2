import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';
import { Skill } from './skill.model';

@ObjectType()
export class Cv {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field(() => Number)
    age: number;

    @Field()
    job: string;

    @Field(() => User)
    user: User;

    @Field(() => String)
    userId: string;

    @Field(() => [Skill])
    skills: Skill[];
}
