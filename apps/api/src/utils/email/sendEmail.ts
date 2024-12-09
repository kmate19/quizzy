import { createTransport } from "nodemailer";
import createEmailTemplate from "./createEmail.ts";
import ENV from "@/config/env.ts";

const transporter = createTransport({
    service: "gmail",
    auth: {
        user: ENV.EMAIL_USER(),
        pass: ENV.EMAIL_PASS()
    }
})

export default async function sendEmail(userEmail: string, emailToken: string) {
    console.log("Sending email to: ", userEmail);
    const mailOpts = {
        from: `"Quizzy" <${ENV.EMAIL_USER}>`,
        to: userEmail,
        subject: "Test Email",
        html: createEmailTemplate(ENV.DOMAIN(), emailToken)
    }

    try {
        const info = await transporter.sendMail(mailOpts);

        console.log("Message sent: ", info.response);
    } catch (error) {
        throw error;
    }
}
