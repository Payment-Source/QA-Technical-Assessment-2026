import { test, expect } from '@playwright/test';
import { verifySandboxEmail } from './utils/emailHelpers.js';

const paymentOptions = [
  { id: 'e-transfer', name: 'Interac e-Transfer' },
  { id: 'in-person', name: 'Cash or debit at Canada Post' },
  { id: 'credit', name: 'Credit card' },
];

for (const { id, name } of paymentOptions) {
  test.describe('Review step', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/pay/37984');
      await page.getByTestId('autofill-button').click();
      await verifySandboxEmail(page);
      await page.getByTestId('payment-process-continue-button').click();
      await expect(page).toHaveURL('/en/pay/37984#payment-option');
      await page.getByTestId(`payment-option-${id}-button`).click();
      await expect(page).toHaveURL('/en/pay/37984#review');
    });

    test(`Continue button redirects users to Complete Payment step for ${name} payment option`, { tag: '@PSW-06' }, async ({ page }) => {
      await page.getByTestId('payment-process-continue-button').click();
      await expect(page).toHaveURL('/en/complete-payment');
    });
  });
}
