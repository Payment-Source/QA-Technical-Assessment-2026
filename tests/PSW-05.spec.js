import { test, expect } from '@playwright/test';
import { verifySandboxEmail } from './utils/emailHelpers.js';

test.describe('Review step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/pay/37984');
    await page.getByTestId('autofill-button').click();
    await page.getByTestId('payment-amount-input').fill('100.00');
    await page.getByTestId('payment-amount-input').blur();
    await verifySandboxEmail(page);
    await page.getByTestId('payment-process-continue-button').click();
    await expect(page).toHaveURL('/en/pay/37984#payment-option');
  });

  test('Processing fee calculation & processing time are correct for each payment option', { tag: '@PSW-05' }, async ({ page }) => {
    await test.step('Credit card: $2.50 fee, $102.50 total, 3 business days', async () => {
      await page.getByTestId('payment-option-credit-button').click();

      await expect(page).toHaveURL('/en/pay/37984#review');
      await expect(page.getByTestId('payment-option-title')).toHaveText('Credit card');
      await expect(page.getByTestId('payment-amount')).toHaveText('$100.00');
      await expect(page.getByTestId('payment-option-processing-fee')).toHaveText('$2.50 (2.5%)');
      await expect(page.getByTestId('payment-option-processing-fee-second')).toHaveText('$2.50 (2.5%)');
      await expect(page.getByTestId('payment-option-delivery')).toHaveText('3 business days');
      await expect(page.getByTestId('payment-total-amount')).toHaveText('Total: $102.50');
    });

    await test.step('Interac e-Transfer: $1.00 fee, $101.00 total, 1 business day', async () => {
      await page.getByTestId('edit-payment-option-link').click();
      await expect(page).toHaveURL('/en/pay/37984#payment-option');
      await page.getByTestId('payment-option-e-transfer-button').click();

      await expect(page).toHaveURL('/en/pay/37984#review');
      await expect(page.getByTestId('payment-option-title')).toHaveText(/^Interac(?:®)? e-Transfer(?:®)?$/);
      await expect(page.getByTestId('payment-amount')).toHaveText('$100.00');
      await expect(page.getByTestId('payment-option-processing-fee')).toHaveText('$1.00 (1.0%)');
      await expect(page.getByTestId('payment-option-processing-fee-second')).toHaveText('$1.00 (1.0%)');
      await expect(page.getByTestId('payment-option-delivery')).toHaveText('1 business day');
      await expect(page.getByTestId('payment-total-amount')).toHaveText('Total: $101.00');
    });

    await test.step('Cash or debit at Canada Post: $3.95 fee, $103.95 total, 3 business days', async () => {
      await page.getByTestId('edit-payment-option-link').click();
      await expect(page).toHaveURL('/en/pay/37984#payment-option');
      await page.getByTestId('payment-option-in-person-button').click();

      await expect(page).toHaveURL('/en/pay/37984#review');
      await expect(page.getByTestId('payment-option-title')).toHaveText('Cash or debit at Canada Post');
      await expect(page.getByTestId('payment-amount')).toHaveText('$100.00');
      await expect(page.getByTestId('payment-option-processing-fee')).toHaveText('$3.95');
      await expect(page.getByTestId('payment-option-processing-fee-second')).toHaveText('$3.95');
      await expect(page.getByTestId('payment-option-delivery')).toHaveText('3 business days');
      await expect(page.getByTestId('payment-total-amount')).toHaveText('Total: $103.95');
    });
  });
});
