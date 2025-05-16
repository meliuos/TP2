import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CvResolver } from './resolvers/cv.resolver';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

@Module({
    imports: [
        PrismaModule,
        GraphQLModule.forRoot<YogaDriverConfig>({
            driver: YogaDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            landingPage: false,
            graphqlEndpoint: '/graphql'
        }),
    ],
    providers: [CvResolver],
})
export class GraphqlModule { }
