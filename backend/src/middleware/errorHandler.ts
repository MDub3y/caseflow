import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err);

    if (err instanceof ZodError) {
        res.status(400).json({ message: 'Validation Error', errors: err.errors });
        return;
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({ message });
    return;
};