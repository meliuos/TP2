import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clean database
    await prisma.cvsOnSkills.deleteMany();
    await prisma.cv.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.user.deleteMany();

    // Create skills
    const typescript = await prisma.skill.create({
        data: { designation: 'TypeScript' },
    });

    const graphql = await prisma.skill.create({
        data: { designation: 'GraphQL' },
    });

    const react = await prisma.skill.create({
        data: { designation: 'React' },
    });

    // Create users
    const john = await prisma.user.create({
        data: {
            name: 'qwe',
            email: 'john@example.com',
        },
    });

    const admin = await prisma.user.create({
        data: {
            name: 'Admin',
            email: 'admin@example.com',
        },
    });

    // Create CVs with skills
    await prisma.cv.create({
        data: {
            name: 'qwe',
            age: 30,
            job: 'Developer',
            userId: john.id,
            skills: {
                create: [
                    { skill: { connect: { id: typescript.id } } },
                    { skill: { connect: { id: graphql.id } } },
                ],
            },
        },
    });

    await prisma.cv.create({
        data: {
            name: 'Admin',
            age: 35,
            job: 'DB',
            userId: admin.id,
            skills: {
                create: [
                    { skill: { connect: { id: graphql.id } } },
                    { skill: { connect: { id: react.id } } },
                ],
            },
        },
    });

    console.log('Database has been seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
