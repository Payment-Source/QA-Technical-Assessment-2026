import { test, expect } from '@playwright/test';
import { verifySandboxEmail } from './utils/emailHelpers.js';
// PSW-01 - Confirm account details are reflected correctly
test.describe('Review screen', { tag: '@payments' }, () => {
  test('Account details survive editing and changing the payment option replaces the previous selection', {
    tag: ['@PSW-01', '@formFieldValidation'],
  }, async ({ page }) => {
    const accountDetails = Object.freeze({
      email: 'psidevstar@gmail.com',
      fullName: 'Bailey Poodles',
      accountNumber: 'M92734587',
      amount: '123.45',
    });
    const paymentPath = '/en/pay/37984';
    const main = page.locator('#main');
    const sidebar = main.locator('[class*="paymentRecipientContainer"]:visible');
    const email = page.getByTestId('email-input');
    const fullName = page.getByTestId('full-name-input');
    const accountNumber = page.getByTestId('client-ref-input');
    const paymentAmount = page.getByTestId('payment-amount-input');
    const continueButton = page.getByTestId('payment-process-continue-button');

    await test.step('Check the entered account details on Review', async () => {
      await page.goto(paymentPath);
      await email.fill(accountDetails.email);
      await fullName.fill(accountDetails.fullName);
      await accountNumber.fill(accountDetails.accountNumber);
      await paymentAmount.fill(accountDetails.amount);
      await paymentAmount.blur();
      await verifySandboxEmail(page);
      await expect(continueButton).toHaveAttribute('type', 'submit');
      await continueButton.click();
      await expect(page).toHaveURL(`${paymentPath}#payment-option`);
      await page.getByTestId('payment-option-credit-button').click();
      await expect(page).toHaveURL(`${paymentPath}#review`);

      await expect(main.getByRole('heading', { name: 'Review your information', exact: true })).toBeVisible();
      await expect(page.getByTestId('payment-account-detail-email')).toHaveText(accountDetails.email);
      await expect(page.getByTestId('payment-account-detail-full-name')).toHaveText(accountDetails.fullName);
      await expect(page.getByTestId('payment-account-detail-client-ref')).toHaveText(accountDetails.accountNumber);
      await expect(page.getByTestId('payment-amount')).toHaveText(`$${accountDetails.amount}`);
      await expect(page.getByTestId('payment-option-title')).toHaveText('Credit card');
    });

    await test.step('Edit account details and return to Review', async () => {
      await main.getByRole('button', { name: 'Edit account details', exact: true }).click();
      await expect(page).toHaveURL(paymentPath);
      await expect(email).toHaveValue(accountDetails.email);
      await expect(fullName).toHaveValue(accountDetails.fullName);
      await expect(accountNumber).toHaveValue(accountDetails.accountNumber);
      await expect(paymentAmount).toHaveValue(accountDetails.amount);
      await expect(sidebar.getByRole('heading', { name: 'Account details', exact: true })).toHaveCount(0);
      await expect(sidebar).not.toContainText(accountDetails.email);
      await expect(sidebar).not.toContainText(accountDetails.fullName);
      await expect(sidebar).not.toContainText(accountDetails.accountNumber);

      await expect(continueButton).toHaveAttribute('type', 'submit');
      await continueButton.click();
      await expect(page).toHaveURL(`${paymentPath}#payment-option`);
      await page.getByTestId('payment-option-credit-button').click();
      await expect(page).toHaveURL(`${paymentPath}#review`);
    });

    await test.step('Change the payment option to Interac e-Transfer', async () => {
      await main.getByRole('button', { name: 'Change payment option', exact: true }).click();
      await expect(page).toHaveURL(`${paymentPath}#payment-option`);
      await expect(main.getByRole('heading', { name: 'Select a payment option', exact: true })).toBeVisible();
      await expect(sidebar.getByRole('heading', { name: 'Payment option', exact: true })).toHaveCount(0);
      await expect(sidebar.getByText('Credit card', { exact: true })).toHaveCount(0);

      await page.getByTestId('payment-option-e-transfer-button').click();
      await expect(page).toHaveURL(`${paymentPath}#review`);
      await expect(page.getByTestId('payment-account-detail-email')).toHaveText(accountDetails.email);
      await expect(page.getByTestId('payment-account-detail-full-name')).toHaveText(accountDetails.fullName);
      await expect(page.getByTestId('payment-account-detail-client-ref')).toHaveText(accountDetails.accountNumber);
      await expect(page.getByTestId('payment-amount')).toHaveText(`$${accountDetails.amount}`);
      const replacementTitle = /^Interac(?:\u00ae)?\s+e-Transfer(?:\u00ae)?$/;
      await expect(page.getByTestId('payment-option-title')).toHaveText(replacementTitle);
      await expect(main.getByText('Credit card', { exact: true })).toHaveCount(0);
    });
  });
});
