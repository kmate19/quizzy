import { createTransport } from "nodemailer";
import createEmailTemplate from "./createEmail.ts";

const transporter = createTransport({
    service: "gmail",
    auth: {
        user: Bun.env.EMAIL_USER,
        pass: Bun.env.EMAIL_PASS
    }
})

export default async function sendEmail(userEmail: string, emailToken: string) {
    console.log("Sending email to: ", userEmail);
    const mailOpts = {
        from: `"Quizzy" <${Bun.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Test Email",
        html: createEmailTemplate(Bun.env.DOMAIN || "http://localhost:3000", emailToken)
    }

    try {
        const info = await transporter.sendMail(mailOpts);

        console.log("Message sent: ", info.response);
    } catch (error) {
        throw error;
    }
}
