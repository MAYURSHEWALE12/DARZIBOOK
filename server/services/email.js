export const sendOTP = async (email, otp) => {
  console.log(`[EMAIL] OTP for ${email}: ${otp}`);
  console.log('[EMAIL] SMTP not configured — email logged to console instead of sent.');
};
