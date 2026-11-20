import { test, expect } from '@playwright/test';
import { verifySandboxEmail } from './utils/emailHelpers.js';

test.describe('Review step', () => {
  let paymentDetails;
  let reviewDetails;

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
    await expect(page.locator('#main').getByRole('heading', { name: 'Review your information', exact: true })).toBeVisible();

    reviewDetails = {
      processingFee: await page.getByTestId('payment-option-processing-fee').innerText(),
      processingTime: await page.getByTestId('payment-option-delivery').innerText(),
      total: await page.getByTestId('payment-total-amount').innerText(),
    };
  });

  test('Cancel button opens a modal and the modal buttons close or redirect', { tag: '@PSW-04' }, async ({ page }) => {
    const main = page.locator('#main');
    const dialog = page.getByRole('dialog');

    await page.getByTestId('cancel-button-link').click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Are you sure?');

    await dialog.getByTestId('confirmation-modal-cancel-button').click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL('/en/pay/37984#review');
    await expect(main.getByRole('heading', { name: 'Review your information', exact: true })).toBeVisible();
    await expect(page.getByTestId('payment-account-detail-email')).toHaveText(paymentDetails.email);
    await expect(page.getByTestId('payment-account-detail-full-name')).toHaveText(paymentDetails.accountholderName);
    await expect(page.getByTestId('payment-account-detail-client-ref')).toHaveText(paymentDetails.accountholderNumber);
    await expect(page.getByTestId('payment-amount')).toHaveText(`$${paymentDetails.amount}`);
    await expect(page.getByTestId('payment-option-title')).toHaveText('Credit card');
    await expect(page.getByTestId('payment-option-processing-fee')).toHaveText(reviewDetails.processingFee);
    await expect(page.getByTestId('payment-option-delivery')).toHaveText(reviewDetails.processingTime);
    await expect(page.getByTestId('payment-total-amount')).toHaveText(reviewDetails.total);

    await page.getByTestId('cancel-button-link').click();
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('confirmation-modal-go-back-button').click();

    await expect(page).toHaveURL('/en');
    await expect(main.getByRole('heading', { name: 'Review your information', exact: true })).toHaveCount(0);
  });
});
