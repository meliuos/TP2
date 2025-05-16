import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async cleanDatabase() {
        // Only use this for testing!
        if (process.env.NODE_ENV === 'test') {
            const models = Reflect.ownKeys(this).filter(key => key[0] !== '_');

            return Promise.all(
                models.map(modelKey => this[modelKey].deleteMany())
            );
        }
    }
}
