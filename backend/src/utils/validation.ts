import { z } from 'zod';
import parsePhoneNumber from 'libphonenumber-js';

export const normalizePhone = (phone: string | null | undefined): string | null => {
    if (!phone) return null;
    const phoneNumber = parsePhoneNumber(phone, 'US'); // Default region
    return phoneNumber?.isValid() ? phoneNumber.format('E.164') : phone; // Return original if invalid to allow manual fix later if needed, or null
};

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const caseSchema = z.object({
    case_id: z.string().min(1, "Case ID is required"),
    applicant_name: z.string().min(1, "Applicant Name is required"),
    dob: z.string().refine((date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()) && d.getFullYear() >= 1900 && d <= new Date();
    }, "Invalid DOB (1900-Today)"),
    email: z.string().email("Invalid email format").optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    category: z.enum(['TAX', 'LICENSE', 'PERMIT'], { errorMap: () => ({ message: "Invalid Category" }) }),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('LOW'),
});

export const batchImportSchema = z.object({
    importId: z.string().uuid(),
    cases: z.array(caseSchema),
});