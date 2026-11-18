import { test, expect } from '@playwright/test';
import { verifySandboxEmail } from './utils/emailHelpers.js';
// PSW-03 - Verify processing fee & time calculations
const paymentOptions = [
  {
    id: 'credit',
    name: 'Credit card',
    amount: '123.45',
    expectedFee: '$3.09',
    expectedTotal: '$126.54',
  },
  {
    id: 'e-transfer',
    name: 'Interac e-Transfer',
    amount: '123.45',
    expectedFee: '$1.23',
    expectedTotal: '$124.68',
  },
  {
    id: 'peoples-rfm',
    name: 'Interac e-Transfer Request for money',
    amount: '123.45',
    expectedFee: '$1.23',
    expectedTotal: '$124.68',
  },
  // Tiered payment option
  {
    id: 'in-person',
    name: 'Cash or debit at Canada Post',
    amount: '123.45', // Tier 1
    expectedFee: '$3.95',
    expectedTotal: '$127.40',
  },
  {
    id: 'in-person',
    name: 'Cash or debit at Canada Post',
    amount: '1,001', // Tier 2
    expectedFee: '$5.95',
    expectedTotal: '$1,006.95',
  },
  {
    id: 'in-person',
    name: 'Cash or debit at Canada Post',
    amount: '2,001', // Tier 3
    expectedFee: '$7.95',
    expectedTotal: '$2,008.95',
  },
];

test.describe('Review screen', { tag: '@payments' }, () => {
  test('Review updates amounts, fees, totals, and processing times across payment options', {
    tag: '@PSW-03',
  }, async ({ page }) => {
    const accountDetails = Object.freeze({
      email: 'psidevstar@gmail.com',
      fullName: 'Bailey Poodles',
      accountNumber: 'M92734587',
    });
    const paymentPath = '/en/pay/37984';
    const main = page.locator('#main');
    const email = page.getByTestId('email-input');
    const amountInput = page.getByTestId('payment-amount-input');
    const continueButton = page.getByTestId('payment-process-continue-button');

    await page.goto(paymentPath);
    await email.fill(accountDetails.email);
    await page.getByTestId('full-name-input').fill(accountDetails.fullName);
    await page.getByTestId('client-ref-input').fill(accountDetails.accountNumber);
    await amountInput.fill(paymentOptions[0].amount);
    await amountInput.blur();
    await verifySandboxEmail(page);

    for (let index = 0; index < paymentOptions.length; index++) {
      const { id, name, amount, expectedFee, expectedTotal } = paymentOptions[index];
      await test.step(`${name}: $${amount}`, async () => {
        if (index > 0) {
          await main.getByRole('button', { name: 'Edit account details', exact: true }).click();
          await expect(page).toHaveURL(paymentPath);
          await expect(email).toHaveValue(accountDetails.email);
          await amountInput.fill(amount);
          await amountInput.blur();
        }
        await expect(continueButton).toHaveAttribute('type', 'submit');
        await continueButton.click();
        await expect(page).toHaveURL(`${paymentPath}#payment-option`);

        const option = page.getByTestId(`payment-option-${id}-button`);
        await expect(option).toBeVisible();
        await expect(option).toBeEnabled();
        const title = await option.getByRole('heading', { level: 2 }).innerText();
        const feeHeading = option.getByRole('heading', { name: 'Processing fee:' });
        await expect(feeHeading).toContainText(expectedFee);
        const feeDescription = (await feeHeading.innerText()).replace('Processing fee:', '').trim();
        const processingTime = (await option.getByRole('heading', { name: 'Processing time:' }).innerText()).replace('Processing time:', '').trim();
        expect(processingTime).not.toBe('');

        await option.click();
        await expect(page).toHaveURL(`${paymentPath}#review`);
        await expect(main.getByRole('heading', { name: 'Review your information', exact: true })).toBeVisible();
        const reviewTitle = page.getByTestId('payment-option-title');
        await expect(reviewTitle).toBeVisible();
        // Ignore trademark symbols when comparing the option titles.
        const expectedTitle = title.replaceAll('®', '').replaceAll('ᴹᴰ', '').trim();
        const actualTitle = (await reviewTitle.innerText()).replaceAll('®', '').replaceAll('ᴹᴰ', '').trim();
        expect(actualTitle).toBe(expectedTitle);
        await expect(page.getByTestId('payment-amount')).toHaveText(`$${amount}`);
        await expect(page.getByTestId('payment-option-processing-fee')).toHaveText(feeDescription);
        await expect(page.getByTestId('payment-option-processing-fee-second')).toHaveText(feeDescription);
        await expect(page.getByTestId('payment-option-delivery')).toHaveText(processingTime);
        await expect(page.getByTestId('payment-total-amount')).toHaveText(`Total: ${expectedTotal}`);
      });
    }
  });
});
