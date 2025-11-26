import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { loginSchema } from '../utils/validation';

const userService = new UserService();

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const result = await userService.login(email, password);
        res.json(result);
    } catch (error: any) {
        if (error.message === 'Invalid credentials') {
            res.status(401).json({ message: error.message });
            return;
        }
        next(error);
    }
};