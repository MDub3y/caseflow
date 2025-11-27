import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

test.describe('CaseFlow End-to-End Journey', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Increase timeout for CI environments
        test.setTimeout(60000);

        // --- DIAGNOSTICS: Print Browser Errors to CI Console ---
        // These lines are CRITICAL. They print network errors (like Connection Refused) 
        // directly to your GitHub Action logs so we can see why it fails.
        page.on('console', msg => {
            if (msg.type() === 'error') console.log(`[BROWSER ERROR]: ${msg.text()}`);
        });
        page.on('pageerror', err => console.log(`[PAGE ERROR]: ${err.message}`));
        page.on('requestfailed', request => {
            console.log(`[NETWORK FAIL]: ${request.url()} - ${request.failure()?.errorText}`);
        });
        // -------------------------------------------------------

        await page.goto('/login');

        // Setup listener for the Login Response
        // We use a short 10s timeout here so we don't wait 60s just to fail.
        // We want to fail fast if the network is dead.
        const loginResponsePromise = page.waitForResponse(
            resp => resp.url().includes('/auth/login'),
            { timeout: 10000 }
        ).catch((e) => {
            console.log("⚠️ Login response timeout hit (10s). The request likely hung or failed.");
            return null;
        });

        // Fill Credentials
        await page.fill('input[type="email"]', 'admin@caseflow.com');
        await page.fill('input[type="password"]', 'Admin@123');
        await page.click('button:has-text("Sign In")');

        // Check if the request actually worked
        const response = await loginResponsePromise;
        if (!response) {
            console.log('⚠️ Login Response was NULL. Check [NETWORK FAIL] logs above for Connection Refused.');
        } else {
            console.log(`✅ Login Status: ${response.status()}`);
            // If it wasn't a 200 OK, print the body so we know if it was a 401/500
            if (response.status() !== 200 && response.status() !== 201) {
                try {
                    console.log(`❌ Login Body: ${await response.text()}`);
                } catch (e) {
                    console.log('❌ Could not read login body');
                }
            }
        }

        // Wait for redirect to /import
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

        // 2. Initial Check (Wait up to 15s for virtualization to render)
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

        // 6. Success
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.click('button:has-text("View Cases")');
        await page.waitForURL(/\/cases/);

        // 7. Persistence
        await expect(page.getByText('C-E2E-1')).toBeVisible();
    });
});