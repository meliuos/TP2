import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { createPubSub } from 'graphql-yoga';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../models/user.model';
import { Skill } from '../models/skill.model';
import { Cv } from '../models/cv.model';
import { AddCvInput, UpdateCvInput } from '../inputs/cv.input';
import { SubscriptionEvent } from '../models/subscription-event.model';

const pubSub = createPubSub();

@Resolver(() => Cv)
export class CvResolver {
    constructor(private prisma: PrismaService) { }

    @ResolveField(() => User)
    async user(@Parent() cv: Cv) {
        return this.prisma.user.findUnique({ where: { id: cv.userId } });
    } @ResolveField(() => [Skill])
    async skills(@Parent() cv: Cv) {
        const cvsWithSkills = await this.prisma.cv.findUnique({
            where: { id: cv.id },
            include: { skills: { include: { skill: true } } },
        });

        return cvsWithSkills?.skills.map(s => s.skill) || [];
    }

    @Query(() => [Cv])
    async cvs() {
        return this.prisma.cv.findMany();
    }

    @Query(() => Cv, { nullable: true })
    async cv(@Args('id') id: string) {
        return this.prisma.cv.findUnique({ where: { id } });
    }

    @Mutation(() => Cv)
    async addCv(@Args('input') input: AddCvInput) {
        const user = await this.prisma.user.findUnique({
            where: { id: input.userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        for (const skillId of input.skillIds) {
            const skill = await this.prisma.skill.findUnique({
                where: { id: skillId },
            });

            if (!skill) {
                throw new Error(`Skill ${skillId} not found`);
            }
        }

        const cv = await this.prisma.cv.create({
            data: {
                name: input.name,
                age: input.age,
                job: input.job,
                user: {
                    connect: { id: input.userId }
                },
                skills: {
                    create: input.skillIds.map(skillId => ({
                        skill: { connect: { id: skillId } }
                    }))
                }
            },
            include: {
                skills: { include: { skill: true } },
            },
        });

        pubSub.publish('CV_CHANGES', {
            cvChanges: {
                event: 'ADD',
                cv
            }
        });

        return cv;
    }

    @Mutation(() => Cv)
    async updateCv(@Args('input') input: UpdateCvInput) {
        const existingCv = await this.prisma.cv.findUnique({
            where: { id: input.id },
        });

        if (!existingCv) {
            throw new Error('CV not found');
        }

        if (input.userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: input.userId },
            });

            if (!user) {
                throw new Error('User not found');
            }
        }

        const updateData: any = {};

        if (input.name !== undefined) updateData.name = input.name;
        if (input.age !== undefined) updateData.age = input.age;
        if (input.job !== undefined) updateData.job = input.job;

        if (input.userId !== undefined) {
            updateData.user = { connect: { id: input.userId } };
        }

        if (input.skillIds !== undefined) {
            for (const skillId of input.skillIds) {
                const skill = await this.prisma.skill.findUnique({
                    where: { id: skillId },
                });

                if (!skill) {
                    throw new Error(`Skill ${skillId} not found`);
                }
            }

            await this.prisma.cvsOnSkills.deleteMany({
                where: { cvId: input.id }
            });

            updateData.skills = {
                create: input.skillIds.map(skillId => ({
                    skill: { connect: { id: skillId } }
                }))
            };
        }

        const updatedCv = await this.prisma.cv.update({
            where: { id: input.id },
            data: updateData,
            include: {
                skills: { include: { skill: true } },
            },
        });

        pubSub.publish('CV_CHANGES', {
            cvChanges: {
                event: 'UPDATE',
                cv: updatedCv
            }
        });

        return updatedCv;
    }

    @Mutation(() => Cv)
    async deleteCv(@Args('id') id: string) {
        const existingCv = await this.prisma.cv.findUnique({
            where: { id },
            include: {
                skills: true
            },
        });

        if (!existingCv) {
            throw new Error('CV not found');
        }

        await this.prisma.cvsOnSkills.deleteMany({
            where: { cvId: id }
        });

        const deletedCv = await this.prisma.cv.delete({
            where: { id },
        });

        pubSub.publish('CV_CHANGES', {
            cvChanges: {
                event: 'DELETE',
                cv: deletedCv
            }
        });

        return deletedCv;
    }

    @Subscription(() => SubscriptionEvent)
    cvChanges() {
        return pubSub.subscribe('CV_CHANGES');
    }
}
