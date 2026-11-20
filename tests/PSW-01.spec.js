import { test, expect } from '@playwright/test';
import { verifySandboxEmail } from './utils/emailHelpers.js';

test.describe('Review step', () => {
  test('Shows correct payment details', { tag: '@PSW-01' }, async ({ page }) => {
    await page.goto('/en/pay/37984');
    await page.getByTestId('autofill-button').click();

    const paymentDetails = {
      email: await page.getByTestId('email-input').inputValue(),
      accountholderName: await page.getByTestId('full-name-input').inputValue(),
      accountholderNumber: await page.getByTestId('client-ref-input').inputValue(),
      amount: await page.getByTestId('payment-amount-input').inputValue(),
    };

    await verifySandboxEmail(page);
    await page.getByTestId('payment-process-continue-button').click();
    await expect(page).toHaveURL('/en/pay/37984#payment-option');
    await page.getByTestId('payment-option-credit-button').click();

    await expect(page).toHaveURL('/en/pay/37984#review');
    await expect(page.getByTestId('payment-account-detail-email')).toHaveText(paymentDetails.email);
    await expect(page.getByTestId('payment-account-detail-full-name')).toHaveText(paymentDetails.accountholderName);
    await expect(page.getByTestId('payment-account-detail-client-ref')).toHaveText(paymentDetails.accountholderNumber);
    await expect(page.getByTestId('payment-amount')).toHaveText(`$${paymentDetails.amount}`);
    await expect(page.getByTestId('payment-option-title')).toHaveText('Credit card');
  });
});
