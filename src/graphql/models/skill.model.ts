import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Skill {
    @Field(() => ID)
    id: string;

    @Field()
    designation: string;
}
