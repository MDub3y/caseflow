import { prisma } from '../utils/prisma';

export class CaseService {
    async getCases(params: { limit: number; cursor?: string; status?: string; category?: string; search?: string; }) {
        const { limit, cursor, status, category, search } = params;

        const where: any = {};
        if (status) where.status = status;
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { caseId: { contains: search, mode: 'insensitive' } },
                { applicantName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const items = await prisma.case.findMany({
            take: limit + 1, // +1 to check for next page
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

        return { items, pagination: { nextCursor, hasMore: !!nextCursor } };
    }

    async getCaseDetails(id: string) {
        return prisma.case.findUnique({
            where: { id },
            include: { history: { orderBy: { createdAt: 'desc' } } }
        });
    }
}