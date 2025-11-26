export declare class CaseService {
    getCases(params: {
        limit: number;
        cursor?: string;
        status?: string;
        category?: string;
        search?: string;
    }): Promise<{
        items: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CaseStatus;
            dob: Date;
            phone: string | null;
            category: import(".prisma/client").$Enums.CaseCategory;
            priority: import(".prisma/client").$Enums.CasePriority;
            importId: string | null;
            applicantName: string;
            caseId: string;
            notes: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            assignedToId: string | null;
            deletedAt: Date | null;
        }[];
        pagination: {
            nextCursor: string | undefined;
            hasMore: boolean;
        };
    }>;
    getCaseDetails(id: string): Promise<({
        history: {
            id: string;
            createdAt: Date;
            userId: string | null;
            caseId: string;
            action: string;
            field: string | null;
            oldValue: string | null;
            newValue: string | null;
        }[];
    } & {
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CaseStatus;
        dob: Date;
        phone: string | null;
        category: import(".prisma/client").$Enums.CaseCategory;
        priority: import(".prisma/client").$Enums.CasePriority;
        importId: string | null;
        applicantName: string;
        caseId: string;
        notes: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        assignedToId: string | null;
        deletedAt: Date | null;
    }) | null>;
}
//# sourceMappingURL=CaseService.d.ts.map