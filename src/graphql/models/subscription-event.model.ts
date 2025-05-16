import { Field, ObjectType } from '@nestjs/graphql';
import { Cv } from './cv.model';

@ObjectType()
export class SubscriptionEvent {
    @Field()
    event: string;

    @Field(() => Cv)
    cv: Cv;
}
