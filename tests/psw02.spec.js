import { test, expect } from '@playwright/test';
import { verifySandboxEmail } from './utils/emailHelpers.js';
// PSW-02 - Cancelling the payment - Confirm or dismiss payment cancellation
test.describe('Review screen', { tag: '@payments' }, () => {
  test('Cancellation can be dismissed without losing data or confirmed to return home', {
    tag: '@PSW-02',
  }, async ({ page }) => {
    const accountDetails = {
      email: 'psidevstar@gmail.com',
      fullName: 'Bailey Poodles',
      accountNumber: 'M92734587',
      amount: '123.45',
    };
    const paymentPath = '/en/pay/37984';
    const continueButton = page.getByTestId('payment-process-continue-button');
    const cancel = page.getByTestId('cancel-button-link');
    const dialog = page.getByRole('dialog');
    const reviewHeading = page.locator('#main').getByRole('heading', { name: 'Review your information', exact: true });

    await page.goto(paymentPath);
    await page.getByTestId('email-input').fill(accountDetails.email);
    await page.getByTestId('full-name-input').fill(accountDetails.fullName);
    await page.getByTestId('client-ref-input').fill(accountDetails.accountNumber);
    await page.getByTestId('payment-amount-input').fill(accountDetails.amount);
    await page.getByTestId('payment-amount-input').blur();
    await verifySandboxEmail(page);
    await expect(continueButton).toHaveAttribute('type', 'submit');
    await continueButton.click();
    await expect(page).toHaveURL(`${paymentPath}#payment-option`);
    await page.getByTestId('payment-option-credit-button').click();
    await expect(page).toHaveURL(`${paymentPath}#review`);
    await expect(reviewHeading).toBeVisible();

    await test.step('Cancel opens a confirmation dialog', async () => {
      await cancel.click();
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText('Are you sure?');
    });

    await test.step('Closing the dialog preserves Review, entered details, and the selected option', async () => {
      await dialog.getByTestId('confirmation-modal-cancel-button').click();
      await expect(dialog).toBeHidden();
      await expect(page).toHaveURL(`${paymentPath}#review`);
      await expect(reviewHeading).toBeVisible();
      await expect(page.getByTestId('payment-account-detail-email')).toHaveText(accountDetails.email);
      await expect(page.getByTestId('payment-account-detail-full-name')).toHaveText(accountDetails.fullName);
      await expect(page.getByTestId('payment-account-detail-client-ref')).toHaveText(accountDetails.accountNumber);
      await expect(page.getByTestId('payment-amount')).toHaveText(`$${accountDetails.amount}`);
      await expect(page.getByTestId('payment-option-title')).toHaveText('Credit card');
    });

    await test.step('Confirming cancellation returns to the landing page', async () => {
      await cancel.click();
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: 'Leave this page and discard your changes', exact: true }).click();
      await expect(page).toHaveURL('/en');
      await expect(reviewHeading).toHaveCount(0);
    });
  });
});
