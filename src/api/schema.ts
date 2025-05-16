import { Cv } from './type';
import { db } from './db';
import { GraphQLError } from 'graphql';




const resolvers = {

    Cv: {
        user: (parent: Cv) => db.users.find(u => u.id === parent.userId),
        skills: (parent: Cv) => parent.skillIds.map(id =>
            db.skills.find(s => s.id === id)
        ),
    },

    Query: {
        cvs: () => db.cvs,
        cv: (_: any, { id }: { id: string }) =>
            db.cvs.find(cv => cv.id === id),
    },

    Mutation: {
        addCv: (_: any, { input }: { input: Omit<Cv, 'id'> }, ctx) => {
            if (!db.users.some(u => u.id === input.userId)) {
                throw new GraphQLError('User not found');
            }
            input.skillIds.forEach(skillId => {
                if (!db.skills.some(s => s.id === skillId)) {
                    throw new GraphQLError(`Skill ${skillId} not found`);
                }
            });

            const newCv = {
                id: String(db.cvs.length + 1),
                ...input,
            };

            db.cvs.push(newCv);
            ctx.pubSub.publish('CV_CHANGES', {
                cvChanges: {
                    event: 'ADD',
                    cv: newCv
                }
            });
            return newCv;
        },

        updateCv: (_: any, { input }: { input: Partial<Cv> & { id: string } }, ctx) => {
            const index = db.cvs.findIndex(cv => cv.id === input.id);
            if (index === -1) throw new GraphQLError('CV not found');

            if (input.userId && !db.users.some(u => u.id === input.userId)) {
                throw new GraphQLError('User not found');
            }

            if (input.skillIds) {
                input.skillIds.forEach(skillId => {
                    if (!db.skills.some(s => s.id === skillId)) {
                        throw new GraphQLError(`Skill ${skillId} not found`);
                    }
                });
            }

            const updatedCv = { ...db.cvs[index], ...input };
            db.cvs[index] = updatedCv;

            ctx.pubSub.publish('CV_CHANGES', {
                cvChanges: {
                    event: 'UPDATE',
                    cv: updatedCv
                }
            });
            return updatedCv;
        },

        deleteCv: (_: any, { id }: { id: string }, ctx) => {
            const index = db.cvs.findIndex(cv => cv.id === id);
            if (index === -1) throw new GraphQLError('CV not found');

            const deletedCv = db.cvs.splice(index, 1)[0];

            ctx.pubSub.publish('CV_CHANGES', {
                cvChanges: {
                    event: 'DELETE',
                    cv: deletedCv
                }
            });
            return deletedCv;
        }
    }, Subscription: {
        cvChanges: {
            subscribe: (__, _, ctx) => {
                return ctx.pubSub.subscribe('CV_CHANGES');
            },
        }
    }
};

export const typeDefs = `

  type User {
    id: String!
    name: String!
    email: String!
  }

  type Skill {
    id: String!
    designation: String!
  }

  type Cv {
    id: String!
    name: String!
    age: Int!
    job: String!
    user: User!
    skills: [Skill!]!
  }

  input AddCvInput {
    name: String!
    age: Int!
    job: String!
    userId: String!
    skillIds: [String!]!
  }

  input UpdateCvInput {
    id: String!
    name: String
    age: Int
    job: String
    userId: ID
    skillIds: [String!]
  }

  type MutationResult {
    success: Boolean!
  }

  type SubscriptionEvent {
    event: String!
    cv: Cv!
  }

  type Query {
    cvs: [Cv!]!
    cv(id: String!): Cv
  }

  type Mutation {
    addCv(input: AddCvInput!): Cv!
    updateCv(input: UpdateCvInput!): Cv!
    deleteCv(id: String!): Cv!
  }

  type Subscription {
    cvChanges: SubscriptionEvent!
  }
`;

export const context = db;
export default resolvers;