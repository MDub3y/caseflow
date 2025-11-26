import { z } from 'zod';
export declare const normalizePhone: (phone: string | null | undefined) => string | null;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const caseSchema: z.ZodObject<{
    case_id: z.ZodString;
    applicant_name: z.ZodString;
    dob: z.ZodEffects<z.ZodString, string, string>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    category: z.ZodEnum<["TAX", "LICENSE", "PERMIT"]>;
    priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>>;
}, "strip", z.ZodTypeAny, {
    case_id: string;
    applicant_name: string;
    dob: string;
    category: "TAX" | "LICENSE" | "PERMIT";
    priority: "LOW" | "MEDIUM" | "HIGH";
    email?: string | undefined;
    phone?: string | undefined;
}, {
    case_id: string;
    applicant_name: string;
    dob: string;
    category: "TAX" | "LICENSE" | "PERMIT";
    email?: string | undefined;
    phone?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
}>;
export declare const batchImportSchema: z.ZodObject<{
    importId: z.ZodString;
    cases: z.ZodArray<z.ZodObject<{
        case_id: z.ZodString;
        applicant_name: z.ZodString;
        dob: z.ZodEffects<z.ZodString, string, string>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        category: z.ZodEnum<["TAX", "LICENSE", "PERMIT"]>;
        priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>>;
    }, "strip", z.ZodTypeAny, {
        case_id: string;
        applicant_name: string;
        dob: string;
        category: "TAX" | "LICENSE" | "PERMIT";
        priority: "LOW" | "MEDIUM" | "HIGH";
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        case_id: string;
        applicant_name: string;
        dob: string;
        category: "TAX" | "LICENSE" | "PERMIT";
        email?: string | undefined;
        phone?: string | undefined;
        priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cases: {
        case_id: string;
        applicant_name: string;
        dob: string;
        category: "TAX" | "LICENSE" | "PERMIT";
        priority: "LOW" | "MEDIUM" | "HIGH";
        email?: string | undefined;
        phone?: string | undefined;
    }[];
    importId: string;
}, {
    cases: {
        case_id: string;
        applicant_name: string;
        dob: string;
        category: "TAX" | "LICENSE" | "PERMIT";
        email?: string | undefined;
        phone?: string | undefined;
        priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    }[];
    importId: string;
}>;
//# sourceMappingURL=validation.d.ts.map