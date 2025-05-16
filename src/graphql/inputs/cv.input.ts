import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddCvInput {
    @Field()
    name: string;

    @Field(() => Int)
    age: number;

    @Field()
    job: string;

    @Field(() => ID)
    userId: string;

    @Field(() => [ID])
    skillIds: string[];
}

@InputType()
export class UpdateCvInput {
    @Field(() => ID)
    id: string;

    @Field({ nullable: true })
    name?: string;

    @Field(() => Int, { nullable: true })
    age?: number;

    @Field({ nullable: true })
    job?: string;

    @Field(() => ID, { nullable: true })
    userId?: string;

    @Field(() => [ID], { nullable: true })
    skillIds?: string[];
}
