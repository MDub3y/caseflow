"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchImportSchema = exports.caseSchema = exports.loginSchema = exports.normalizePhone = void 0;
const zod_1 = require("zod");
const libphonenumber_js_1 = __importDefault(require("libphonenumber-js"));
const normalizePhone = (phone) => {
    if (!phone)
        return null;
    const phoneNumber = (0, libphonenumber_js_1.default)(phone, 'US'); // Default region
    return phoneNumber?.isValid() ? phoneNumber.format('E.164') : phone; // Return original if invalid to allow manual fix later if needed, or null
};
exports.normalizePhone = normalizePhone;
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.caseSchema = zod_1.z.object({
    case_id: zod_1.z.string().min(1, "Case ID is required"),
    applicant_name: zod_1.z.string().min(1, "Applicant Name is required"),
    dob: zod_1.z.string().refine((date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()) && d.getFullYear() >= 1900 && d <= new Date();
    }, "Invalid DOB (1900-Today)"),
    email: zod_1.z.string().email("Invalid email format").optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    category: zod_1.z.enum(['TAX', 'LICENSE', 'PERMIT'], { errorMap: () => ({ message: "Invalid Category" }) }),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('LOW'),
});
exports.batchImportSchema = zod_1.z.object({
    importId: zod_1.z.string().uuid(),
    cases: zod_1.z.array(exports.caseSchema),
});
//# sourceMappingURL=validation.js.map