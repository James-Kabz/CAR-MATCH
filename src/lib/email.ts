import  nodemailer  from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "465"),
    secure: true,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
})


export async function sendVerificationEmail(email :string, token:string)
{
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

    const mailOptions = {
        from:   process.env.EMAIL_FROM,
        to:     email,
        subject: "Verify Your CarMatch account",
        html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0;">🚗 CarMatch</h1>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Welcome to CarMatch!</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Thank you for signing up for CarMatch. To complete your registration and start buying or selling cars, please verify your email address.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                        style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Verify Email Address
                        </a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px;">
                        If the button doesn't work, copy and paste this link into your browser:
                        <br>
                        <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
                    </p>
                    </div>
                    
                    <div style="text-align: center; color: #64748b; font-size: 12px;">
                    <p>This verification link will expire in 24 hours.</p>
                    <p>If you didn't create an account with CarMatch, you can safely ignore this email.</p>
                    </div>
                </div>
        `,
    }

    await transporter.sendMail(mailOptions)
}


export async function sendPasswordResetEmail(email: string, token: string)
{
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    const mailOptions = {
        from:   process.env.EMAIL_FROM,
        to:     email,
        subject: "Reset Your CarMatch Password",
        html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">🚗 CarMatch</h1>
                </div>
                
                <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password for your CarMatch account. Click the button below to create a new password.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                    style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Reset Password
                    </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
                </p>
                </div>
                
                <div style="text-align: center; color: #64748b; font-size: 12px;">
                <p>This password reset link will expire in 1 hour.</p>
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            </div>
        `,
    }

    await transporter.sendMail(mailOptions)
}


// resend email verification
export async function resendVerificationEmail(email: string, token: string)
{
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

    const mailOptions = {
        from:   process.env.EMAIL_FROM,
        to:     email,
        subject: "Verify Your CarMatch Email Address",
        html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">🚗 CarMatch</h1>
                </div>
                
                <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email Address</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                    Thank you for signing up for CarMatch. To complete your registration and start buying or selling cars, please verify your email address.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                    style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Verify Email
                    </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="${verificationUrl}" style="color: #dc2626; word-break: break-all;">${verificationUrl}</a>
                </p>
                </div>
                
                <div style="text-align: center; color: #64748b; font-size: 12px;">
                <p>This verification link will expire in 24 hours.</p>
                <p>If you didn't create an account with CarMatch, you can safely ignore this email.</p>
                </div>
            </div>
        `,
    }

    await transporter.sendMail(mailOptions)
    }