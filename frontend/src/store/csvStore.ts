/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // <--- Added persist
import { CSVRow, CaseData } from '@/types';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface CsvState {
    rows: CSVRow[];
    fileName: string | null;
    isValidating: boolean;
    validationProgress: number;

    setRawData: (raw: any[], fileName: string) => void;
    updateRow: (index: number, columnId: string, value: any) => void;

    getValidRows: () => CSVRow[];
    getInvalidRows: () => CSVRow[];

    clearData: () => void;
    fixAllRows: () => void;
    validateRows: () => Promise<void>;

    fixAllTrim: () => void;
    fixAllPhones: () => void;

    addRow: () => void;
    deleteRow: (index: number) => void;
    deleteSelectedRows: (indices: number[]) => void;
}

// Helper: Row Validation Logic
const validateRow = (data: CaseData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.case_id) errors.case_id = 'Required';
    if (!data.applicant_name) errors.applicant_name = 'Required';

    if (!data.priority) {
        errors.priority = 'Required';
    } else if (!['LOW', 'MEDIUM', 'HIGH'].includes(data.priority)) {
        errors.priority = 'Must be LOW, MEDIUM, or HIGH';
    }

    if (data.category && !['TAX', 'LICENSE', 'PERMIT'].includes(data.category)) {
        errors.category = 'Must be TAX, LICENSE, or PERMIT';
    }

    if (data.dob) {
        const d = new Date(data.dob);
        if (isNaN(d.getTime())) {
            errors.dob = 'Invalid Date';
        } else if (d.getFullYear() < 1900 || d > new Date()) {
            errors.dob = 'Date must be between 1900 and today';
        }
    } else {
        errors.dob = 'Required';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Invalid email format';
    }

    if (data.phone) {
        const phoneNumber = parsePhoneNumberFromString(data.phone, 'US');
        if (!phoneNumber || !phoneNumber.isValid()) {
            errors.phone = 'Invalid phone number';
        }
    }

    return errors;
};

// Wrap store in persist middleware
export const useCsvStore = create<CsvState>()(
    persist(
        (set, get) => ({
            rows: [],
            fileName: null,
            isValidating: false,
            validationProgress: 0,

            setRawData: (raw, fileName) => {
                const cleanKey = (key: string) => key.trim().replace(/^[\uFEFF\u200B]/, '');

                const idCounts = new Map<string, number>();
                raw.forEach((r: any) => {
                    let id = '';
                    Object.keys(r).forEach(k => {
                        if (cleanKey(k) === 'case_id') id = r[k];
                    });
                    if (id) idCounts.set(id, (idCounts.get(id) || 0) + 1);
                });

                const processed = raw.map((r: any, idx) => {
                    const cleanData: any = {};
                    Object.keys(r).forEach(key => {
                        cleanData[cleanKey(key)] = r[key];
                    });

                    const data = cleanData as CaseData;
                    const errors = validateRow(data);

                    if (data.case_id && idCounts.get(data.case_id)! > 1) {
                        errors.case_id = 'Duplicate ID in this file';
                    }

                    return {
                        id: idx, // Use index as ID initially
                        rowNumber: idx + 1,
                        data,
                        errors,
                        isValid: Object.keys(errors).length === 0
                    };
                });

                set({ rows: processed, fileName, validationProgress: 100 });
            },

            updateRow: (index, columnId, value) => {
                set((state) => {
                    const newRows = [...state.rows];
                    if (!newRows[index]) return state;

                    const row = newRows[index];
                    const oldCaseId = row.data.case_id;
                    const newData = { ...row.data, [columnId]: value };

                    const errors = validateRow(newData);

                    newRows[index] = {
                        ...row,
                        data: newData,
                        errors,
                        isValid: Object.keys(errors).length === 0
                    };

                    if (columnId === 'case_id') {
                        const newCaseId = value;
                        const idCounts = new Map<string, number>();

                        newRows.forEach(r => {
                            const id = r.data.case_id;
                            if (id) idCounts.set(id, (idCounts.get(id) || 0) + 1);
                        });

                        newRows.forEach((r, idx) => {
                            const id = r.data.case_id;
                            if (id === newCaseId || id === oldCaseId) {
                                const count = idCounts.get(id) || 0;
                                const isDuplicate = count > 1;
                                const currentError = r.errors.case_id;
                                const isDupError = currentError === 'Duplicate ID in this file';

                                if (isDuplicate && !isDupError) {
                                    const updatedErrors = { ...r.errors, case_id: 'Duplicate ID in this file' };
                                    newRows[idx] = { ...r, errors: updatedErrors, isValid: false };
                                } else if (!isDuplicate && isDupError) {
                                    const updatedErrors = { ...r.errors };
                                    delete updatedErrors.case_id;
                                    const baseErrors = validateRow(r.data);
                                    if (baseErrors.case_id) updatedErrors.case_id = baseErrors.case_id;
                                    newRows[idx] = { ...r, errors: updatedErrors, isValid: Object.keys(updatedErrors).length === 0 };
                                }
                            }
                        });
                    }

                    return { rows: newRows };
                });
            },

            getValidRows: () => get().rows.filter(r => r.isValid),
            getInvalidRows: () => get().rows.filter(r => !r.isValid),
            clearData: () => set({ rows: [], fileName: null, validationProgress: 0 }),

            validateRows: async () => {
                set({ isValidating: true, validationProgress: 0 });
                const rows = get().rows;
                const total = rows.length;

                // Calculate dynamic chunk size for UX
                let chunkSize = 1000;
                let delay = 0;
                if (total < 1000) {
                    chunkSize = Math.max(1, Math.ceil(total / 10));
                    delay = 50;
                }

                // Recalculate global duplicates first
                const idCounts = new Map<string, number>();
                rows.forEach(row => {
                    const id = row.data.case_id;
                    if (id) idCounts.set(id, (idCounts.get(id) || 0) + 1);
                });

                for (let i = 0; i < total; i += chunkSize) {
                    if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
                    else await new Promise(resolve => setTimeout(resolve, 0));

                    set(state => {
                        const currentRows = [...state.rows];
                        const end = Math.min(i + chunkSize, total);

                        for (let j = i; j < end; j++) {
                            const row = currentRows[j];
                            const errors = validateRow(row.data);

                            if (row.data.case_id && idCounts.get(row.data.case_id)! > 1) {
                                errors.case_id = 'Duplicate ID in this file';
                            }

                            currentRows[j] = {
                                ...row,
                                errors,
                                isValid: Object.keys(errors).length === 0
                            };
                        }
                        return { rows: currentRows, validationProgress: Math.round((end / total) * 100) };
                    });
                }
                await new Promise(resolve => setTimeout(resolve, 300));
                set({ isValidating: false });
            },

            fixAllRows: () => {
                set((state) => {
                    const newRows = state.rows.map(row => {
                        const newData = { ...row.data };
                        (Object.keys(newData) as Array<keyof CaseData>).forEach(k => {
                            const val = newData[k];
                            if (typeof val === 'string') {
                                (newData as any)[k] = val.trim();
                            }
                        });

                        if (newData.phone) {
                            const phoneNumber = parsePhoneNumberFromString(newData.phone, 'US');
                            if (phoneNumber && phoneNumber.isValid()) {
                                newData.phone = phoneNumber.format('E.164');
                            }
                        }

                        if (newData.applicant_name) {
                            newData.applicant_name = newData.applicant_name
                                .toLowerCase()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                        }

                        if (!newData.priority) {
                            newData.priority = 'LOW';
                        }

                        const errors = validateRow(newData);
                        return {
                            ...row,
                            data: newData,
                            errors,
                            isValid: Object.keys(errors).length === 0
                        };
                    });
                    return { rows: newRows };
                });
            },

            fixAllTrim: () => { get().fixAllRows(); },
            fixAllPhones: () => { get().fixAllRows(); },

            addRow: () => {
                set(state => {
                    const newIndex = state.rows.length;
                    // Generate a robust empty row
                    const newData: CaseData = {
                        case_id: `NEW-${Date.now()}`, // Ensure unique ID
                        applicant_name: '',
                        dob: new Date().toISOString().split('T')[0], // Default to today
                        email: '',
                        phone: '',
                        category: '' as any, // Let user select
                        priority: 'LOW'
                    };

                    const errors = validateRow(newData);

                    const newRow: CSVRow = {
                        id: Date.now(), // React key
                        rowNumber: newIndex + 1,
                        data: newData,
                        errors,
                        isValid: Object.keys(errors).length === 0
                    };
                    return { rows: [...state.rows, newRow] };
                });
            },

            deleteRow: (index: number) => {
                set(state => {
                    const newRows = [...state.rows];
                    newRows.splice(index, 1);
                    // Re-index row numbers for UI consistency
                    const reIndexed = newRows.map((r, i) => ({ ...r, rowNumber: i + 1 }));
                    return { rows: reIndexed };
                });
            },

            deleteSelectedRows: (indices: number[]) => {
                set(state => {
                    const newRows = state.rows.filter((_, idx) => !indices.includes(idx));
                    const reIndexed = newRows.map((r, i) => ({ ...r, rowNumber: i + 1 }));
                    return { rows: reIndexed };
                });
            },
        }),
        {
            name: 'caseflow-storage', // Unique localstorage key
            partialize: (state) => ({ rows: state.rows, fileName: state.fileName }), // Only persist data
        }
    )
);