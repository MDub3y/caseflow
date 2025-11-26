export interface CaseData {
    case_id: string;
    applicant_name: string;
    dob: string;
    email: string;
    phone: string;
    category: 'TAX' | 'LICENSE' | 'PERMIT' | '';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | '';
}

export interface CSVRow {
    id: number;
    rowNumber: number;
    data: CaseData;
    errors: Record<string, string>;
    isValid: boolean;
}