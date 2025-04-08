export default function createEmailTemplate(
    domain: string,
    token: string,
    type: "forgot_password" | "verify",
    data?: string
) {
    const baseStyles = `
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .logo { margin-bottom: 20px; }
    h1 { color: #2c3e50; font-size: 24px; margin-bottom: 16px; }
    h2 { color: #3498db; font-size: 18px; margin-bottom: 12px; }
    p { margin-bottom: 16px; color: #555; }
    .button { display: inline-block; background-color: #3498db; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; border: none; cursor: pointer; }
    .button:hover { background-color: #2980b9; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
    .password-box { background-color: #f1f7fe; border: 1px solid #bcdefa; border-radius: 4px; padding: 12px; margin: 16px 0; }
    .password-text { font-family: monospace; font-size: 18px; color: #2c3e50; font-weight: bold; letter-spacing: 1px; }
  `;

    if (type === "verify") {
        return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <!-- You can add your logo here -->
          <h2 style="color: #3498db;">Quizzy</h2>
        </div>
        
        <h1>Welcome! Please verify your account</h1>
        
        <p>Thank you for signing up! To get started, please verify your email address by clicking the button below:</p>
        
        <center>
          <a href="https://${domain}/api/v1/auth/verify/${token}" class="button">
            Verify My Account
          </a>
        </center>
        
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 12px;">
          https://${domain}/api/v1/auth/verify/${token}
        </p>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <div class="footer">
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} Quizzy Co. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    } else if (type === "forgot_password") {
        return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <!-- You can add your logo here -->
          <h2 style="color: #3498db;">Quizzy</h2>
        </div>
        
        <h1>Reset Your Password</h1>
        
        <p>We received a request to reset your password. Click the button below to change your password to a temporary one:</p>
        
        <center>
          <a href="${domain}/api/v1/auth/forgotpassactivate/${token}" class="button">
            Reset My Password
          </a>
        </center>
        
        <p>After using the temporary password to log in, please change it immediately for security reasons.</p>
        
        <div class="password-box">
          <h2 style="margin-top: 0;">Your temporary password:</h2>
          <p class="password-text">${data}</p>
        </div>
        
        <p>If you didn't request a password reset, please contact our support team immediately.</p>
        
        <div class="footer">
          <p>This password reset link will expire in 1 hour for security purposes.</p>
          <p>&copy; ${new Date().getFullYear()} Quizzy Co. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    }
}
