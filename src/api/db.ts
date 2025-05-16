import { DB } from "./type";

export const db: DB = {
    users: [
        { id: '1', name: 'qwe', email: 'john@example.com' },
        { id: '2', name: 'Admin', email: 'admin@example.com' },
    ],
    skills: [
        { id: '1', designation: 'TypeScript' },
        { id: '2', designation: 'GraphQL' },
        { id: '3', designation: 'React' },
    ],
    cvs: [
        {
            id: '1',
            name: 'qwe',
            age: 30,
            job: 'Developer',
            userId: '1',
            skillIds: ['1', '2']
        },
        {
            id: '2',
            name: 'Admin',
            age: 35,
            job: 'DB',
            userId: '2',
            skillIds: ['2', '3']
        },
    ],
};