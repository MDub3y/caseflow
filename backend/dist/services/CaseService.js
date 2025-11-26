"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseService = void 0;
const prisma_1 = require("../utils/prisma");
class CaseService {
    async getCases(params) {
        const { limit, cursor, status, category, search } = params;
        const where = {};
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        if (search) {
            where.OR = [
                { caseId: { contains: search, mode: 'insensitive' } },
                { applicantName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const items = await prisma_1.prisma.case.findMany({
            take: limit + 1, // +1 to check for next page
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            where,
            orderBy: { createdAt: 'desc' },
        });
        let nextCursor = undefined;
        if (items.length > limit) {
            const nextItem = items.pop();
            nextCursor = nextItem?.id;
        }
        return { items, pagination: { nextCursor, hasMore: !!nextCursor } };
    }
    async getCaseDetails(id) {
        return prisma_1.prisma.case.findUnique({
            where: { id },
            include: { history: { orderBy: { createdAt: 'desc' } } }
        });
    }
}
exports.CaseService = CaseService;
//# sourceMappingURL=CaseService.js.map