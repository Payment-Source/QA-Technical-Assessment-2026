import { test, expect } from '@playwright/test';
import { verifySandboxEmail } from './utils/emailHelpers.js';

test.describe('Review step', () => {
  let paymentDetails;

  test.beforeEach(async ({ page }) => {
    await page.goto('/en/pay/37984');
    await page.getByTestId('autofill-button').click();

    paymentDetails = {
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
    await expect(page.getByTestId('payment-option-title')).toHaveText('Credit card');
  });

  test('Edit payment option button redirects to Payment Options step', { tag: '@PSW-03' }, async ({ page }) => {
    const main = page.locator('#main');
    const sidebar = main.locator('[class*="paymentInfoContainer"]');

    await main.getByTestId('edit-payment-option-link').click();

    await expect(page).toHaveURL('/en/pay/37984#payment-option');
    await expect(main.getByRole('heading', { name: 'Select a payment option', exact: true })).toBeVisible();
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole('heading', { name: 'Account details', exact: true })).toBeVisible();
    await expect(sidebar).toContainText(paymentDetails.email);
    await expect(sidebar).toContainText(paymentDetails.accountholderName);
    await expect(sidebar).toContainText(paymentDetails.accountholderNumber);
    await expect(sidebar).toContainText(`$${paymentDetails.amount}`);
    await expect(sidebar).not.toContainText('Credit card');
  });
});
