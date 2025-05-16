import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createPubSub, createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './api/schema';
import { typeDefs } from './api/schema';
import { createServer } from 'http';

const pubSub = createPubSub();
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
const yoga = createYoga({
  schema,
  context: { pubSub },
})
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  const server = createServer(yoga);
  server.listen(4000, () => {
    console.log('GraphQL server is running on http://localhost:4000/graphql');
  });
}
bootstrap();
