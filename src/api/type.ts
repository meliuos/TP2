
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Skill {
    id: string;
    designation: string;
}

export interface Cv {
    id: string;
    name: string;
    age: number;
    job: string;
    userId: string;
    skillIds: string[];
}

export interface DB {
    users: User[];
    skills: Skill[];
    cvs: Cv[];
}
