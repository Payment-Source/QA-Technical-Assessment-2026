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
  });

  test('Edit account details button redirects to Account Details Step', { tag: '@PSW-02' }, async ({ page }) => {
    const main = page.locator('#main');
    const sidebar = main.locator('[class*="paymentInfoContainer"]');

    await main.getByTestId('edit-account-details-link').click();

    await expect(page).toHaveURL('/en/pay/37984');
    await expect(page.getByTestId('email-input')).toHaveValue(paymentDetails.email);
    await expect(page.getByTestId('full-name-input')).toHaveValue(paymentDetails.accountholderName);
    await expect(page.getByTestId('client-ref-input')).toHaveValue(paymentDetails.accountholderNumber);
    await expect(page.getByTestId('payment-amount-input')).toHaveValue(paymentDetails.amount);
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole('heading', { name: 'Account details', exact: true })).toHaveCount(0);
    await expect(sidebar).not.toContainText(paymentDetails.email);
    await expect(sidebar).not.toContainText(paymentDetails.accountholderName);
    await expect(sidebar).not.toContainText(paymentDetails.accountholderNumber);
    await expect(sidebar).not.toContainText(`$${paymentDetails.amount}`);
    await expect(sidebar).not.toContainText('Credit card');
  });
});
