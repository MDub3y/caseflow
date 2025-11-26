import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export class UserService {
    async login(email: string, pass: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(pass, user.password))) {
            throw new Error('Invalid credentials');
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );

        // Ideally store refresh token hash in DB
        return { user: { id: user.id, email: user.email, role: user.role }, accessToken };
    }
}