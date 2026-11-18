import { test, expect } from '@playwright/test';

/**
 * Sets the Sandbox password on the page so automated tests can bypass reCAPTCHA.
 */
export async function setSandboxRecaptchaPassword(page) {
  const password = process.env.PAYSIMPLY_RECAPTCHA_PASSWORD;
  if (!password) {
    throw new Error('Set PAYSIMPLY_RECAPTCHA_PASSWORD in the repository root .env file before using Sandbox email verification.');
  }
  await page.evaluate((value) => {
    // eslint-disable-next-line no-undef
    window.reCaptchaPassword = value;
  }, password);
}

/**
 * Helper to automate the steps for verifying the email using OTP
 */
export async function verifySandboxEmail(page) {
  await test.step('Verify email using the Sandbox OTP flow', async () => {
    const email = page.getByTestId('email-input');
    const continueButton = page.getByTestId('payment-process-continue-button');
    await expect(email).toHaveValue(/\S/);
    const sendCode = page.getByTestId('verify-email-send-code-button');
    await expect(sendCode).toBeVisible();
    await setSandboxRecaptchaPassword(page);
    await sendCode.click();
    // The Sandbox accepts this test code; entering six digits submits it automatically.
    await page.getByTestId('verification-code-input').fill('999999');
    await expect(sendCode).toBeHidden();
    await expect(email).toBeDisabled();
    await expect(continueButton).toBeEnabled();
  });
}
