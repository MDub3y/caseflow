import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

test.describe('CaseFlow End-to-End Journey', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@caseflow.com');
        await page.fill('input[type="password"]', 'Admin@123');
        await page.click('button:has-text("Sign In")');
        await page.waitForURL('/import');
    });

    test('should complete the full import journey', async ({ page }) => {
        const fileContent = `case_id,applicant_name,dob,email,phone,category,priority
C-E2E-1,John Doe,1990-01-01,john@test.com,+12025550199,TAX,HIGH
C-E2E-2,Invalid Date,1800-01-01,jane@test.com,+12025550199,LICENSE,LOW`;

        const buffer = Buffer.from(fileContent);

        // 1. Upload
        await page.setInputFiles('input[type="file"]', {
            name: 'e2e-test.csv',
            mimeType: 'text/csv',
            buffer,
        });

        // 2. Initial Check
        const row1Input = page.locator('input[value="C-E2E-1"]');
        await expect(row1Input).toBeVisible({ timeout: 10000 });

        // Check that "1 Valid" shows up in the summary panel
        // We look for the big number "1" inside a green box
        const validCount = page.locator('.text-green-600.font-bold').first();
        await expect(validCount).toHaveText('1');

        // 3. Fix Error
        const dateInput = page.locator('input[value="1800-01-01"]');
        await expect(dateInput).toBeVisible();

        await dateInput.click();
        await dateInput.fill('1990-01-01');
        await page.keyboard.press('Enter');

        // 4. Verify Fix
        // Now the valid count should be "2"
        await expect(validCount).toHaveText('2');

        // 5. Submit
        // Wait for button to enable and have correct text
        const submitBtn = page.locator('button', { hasText: 'Submit 2 Valid Cases' });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // 6. Success Dialog
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText('Import Complete')).toBeVisible();

        // 7. Verify Redirect
        await page.click('button:has-text("View Cases")');
        await page.waitForURL('/cases');

        // 8. Verify Data Persistence
        await expect(page.getByText('C-E2E-1')).toBeVisible();
    });
});