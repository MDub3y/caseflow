import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';

const PORT = process.env.PORT || 3001;

async function start() {
    try {
        await prisma.$connect();
        logger.info('Database connected');

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();