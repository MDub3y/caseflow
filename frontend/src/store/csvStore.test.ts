import { describe, it, expect, beforeEach } from 'vitest';
import { useCsvStore } from './csvStore';

describe('CSV Store Logic', () => {
    // Reset store before each test to ensure a clean state
    beforeEach(() => {
        useCsvStore.setState({
            rows: [],
            fileName: null,
            isValidating: false,
            validationProgress: 0
        });
    });

    it('should add a new row with default values', () => {
        const { addRow } = useCsvStore.getState();

        addRow();

        const { rows } = useCsvStore.getState();
        expect(rows.length).toBe(1);
        expect(rows[0].data.priority).toBe('LOW'); // Default value
        expect(rows[0].isValid).toBe(false); // Should be invalid (Missing Name/ID)
        // Check if errors exist
        expect(rows[0].errors.applicant_name).toBeDefined();
    });

    it('should validate email format correctly', () => {
        const { setRawData } = useCsvStore.getState();
        const rawData = [
            { case_id: 'C-1', applicant_name: 'John', dob: '1990-01-01', email: 'bad-email' }
        ];

        setRawData(rawData, 'test.csv');

        const { rows } = useCsvStore.getState();
        expect(rows[0].isValid).toBe(false);
        expect(rows[0].errors.email).toBe('Invalid email format');
    });

    it('Fix All should normalize phone numbers', () => {
        const { setRawData, fixAllRows } = useCsvStore.getState();
        const rawData = [
            {
                case_id: 'C-1',
                applicant_name: 'John',
                dob: '1990-01-01',
                phone: '(202) 555-0199', // Valid US Format
                priority: 'LOW'
            }
        ];

        setRawData(rawData, 'test.csv');

        // Apply Fix
        fixAllRows();

        const { rows } = useCsvStore.getState();
        // Should convert to E.164
        expect(rows[0].data.phone).toBe('+12025550199');
    });

    it('should detect duplicate IDs within the file', () => {
        const { setRawData } = useCsvStore.getState();
        const rawData = [
            { case_id: 'DUP-1', applicant_name: 'A', dob: '1990-01-01' },
            { case_id: 'DUP-1', applicant_name: 'B', dob: '1990-01-01' }
        ];

        setRawData(rawData, 'duplicates.csv');

        const { rows } = useCsvStore.getState();
        expect(rows[0].errors.case_id).toBe('Duplicate ID in this file');
        expect(rows[1].errors.case_id).toBe('Duplicate ID in this file');
    });
});