import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const getCases = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = Number(req.query.limit) || 20;
        const cursor = req.query.cursor as string | undefined;
        const status = req.query.status as string | undefined;
        const category = req.query.category as string | undefined;
        const search = req.query.search as string | undefined;

        const where: any = {};

        if (status && status !== 'ALL') where.status = status;
        if (category && category !== 'ALL') where.category = category;

        if (search) {
            where.OR = [
                { caseId: { contains: search, mode: 'insensitive' } },
                { applicantName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const totalCount = await prisma.case.count({ where });

        const items = await prisma.case.findMany({
            take: limit + 1,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            where,
            orderBy: { createdAt: 'desc' },
        });

        let nextCursor: string | undefined = undefined;
        if (items.length > limit) {
            const nextItem = items.pop();
            nextCursor = nextItem?.id;
        }

        res.json({
            items,
            total: totalCount,
            pagination: {
                nextCursor,
                hasMore: !!nextCursor,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getCaseDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const caseData = await prisma.case.findUnique({
            where: { id },
            include: {
                history: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!caseData) {
            res.status(404).json({ message: 'Case not found' });
            return;
        }

        res.json(caseData);
    } catch (error) {
        next(error);
    }
};

export const deleteCase = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const existing = await prisma.case.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ message: "Case not found" });
            return;
        }

        await prisma.$transaction([
            prisma.caseHistory.deleteMany({ where: { caseId: id } }),
            prisma.case.delete({ where: { id } })
        ]);

        res.json({ message: "Case deleted successfully" });
    } catch (error) {
        next(error);
    }
};