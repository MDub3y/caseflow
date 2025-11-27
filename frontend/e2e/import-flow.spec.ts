import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

test.describe('CaseFlow End-to-End Journey', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Increase timeout to handle slower CI environments
        test.setTimeout(60000);

        // 2. Go to Login
        await page.goto('/login');

        // 3. Setup Network Listener to debug the API call
        // This captures the response from the backend when we click login
        const loginResponsePromise = page.waitForResponse(resp =>
            resp.url().includes('/auth/login')
        );

        // 4. Fill Credentials
        await page.fill('input[type="email"]', 'admin@caseflow.com');
        await page.fill('input[type="password"]', 'Admin@123');
        await page.click('button:has-text("Sign In")');

        // 5. DIAGNOSTIC: Check the API result
        try {
            const loginResponse = await loginResponsePromise;
            const status = loginResponse.status();
            const body = await loginResponse.text();

            console.log(`🔍 Login API Status: ${status}`);
            console.log(`🔍 Login API Body: ${body}`);

            if (status !== 200 && status !== 201) {
                throw new Error(`Login API failed with status ${status}: ${body}`);
            }
        } catch (error) {
            console.error('❌ Login Request Failed (Network Error or Timeout):', error);
            // Check if UI shows a specific error message
            const errorAlert = page.locator('[role="alert"], .text-red-600');
            if (await errorAlert.isVisible()) {
                console.error('❌ UI Error Message:', await errorAlert.textContent());
            }
        }

        // 6. Wait for redirect (now we know if it fails, logs will tell us why)
        await page.waitForURL(/\/import/, { waitUntil: 'domcontentloaded', timeout: 30000 });
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
        await expect(row1Input).toBeVisible({ timeout: 15000 });

        // Check summary count
        const validCount = page.locator('.text-green-600.font-bold').first();
        await expect(validCount).toHaveText('1');

        // 3. Fix Error
        const dateInput = page.locator('input[value="1800-01-01"]');
        await expect(dateInput).toBeVisible();

        await dateInput.click();
        await dateInput.fill('1990-01-01');
        await page.keyboard.press('Enter');

        // 4. Verify Fix
        await expect(validCount).toHaveText('2');

        // 5. Submit
        const submitBtn = page.locator('button', { hasText: 'Submit 2 Valid Cases' });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // 6. Success & Redirect
        await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
        await page.click('button:has-text("View Cases")');
        await page.waitForURL(/\/cases/);

        // 7. Verify Persistence
        await expect(page.getByText('C-E2E-1')).toBeVisible();
    });
});