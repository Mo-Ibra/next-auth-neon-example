const nodemailer = require("nodemailer");

async function createTransporter() {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  return transporter;
}

export async function sendVerificationEmail(
  email: string,
  verificationCode: string
) {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for signing up! Please verify your email address by entering the code below.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">Verification Code</p>
            <p style="font-size: 32px; font-weight: bold; color: #333; margin: 0; letter-spacing: 5px;">
              ${verificationCode}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            This code will expire in <strong>24 hours</strong>.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            If you didn't sign up for this account, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}
