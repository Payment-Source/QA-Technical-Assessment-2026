import { expect } from '@playwright/test';

export async function verifySandboxEmail(page) {
  const password = process.env.PAYSIMPLY_RECAPTCHA_PASSWORD;
  if (!password) {
    throw new Error('Set PAYSIMPLY_RECAPTCHA_PASSWORD in the root .env file before running these tests.');
  }

  await page.evaluate((value) => {
    // eslint-disable-next-line no-undef
    window.reCaptchaPassword = value;
  }, password);

  await page.getByTestId('verify-email-send-code-button').click();
  await page.getByTestId('verification-code-input').fill('837291');
  await expect(page.getByTestId('email-input')).toBeDisabled();
  await expect(page.getByTestId('payment-process-continue-button')).toHaveAttribute('type', 'submit');
}
