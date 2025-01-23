import { createTransport } from "nodemailer";
import createEmailTemplate from "./createEmail";
import ENV from "@/config/env";

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
        from: `"Quizzy" <${ENV.EMAIL_USER()}>`,
        to: userEmail,
        subject: "Test Email",
        html: createEmailTemplate(ENV.DOMAIN(), emailToken)
    }

    const sendMailWithTimeout = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { reject(new Error("Email sending timed out")) }, 10000);

        transporter.sendMail(mailOpts)
            .then((info) => {
                clearTimeout(timeout);
                resolve(info);
            })
            .catch((error) => {
                clearTimeout(timeout);
                reject(error)
            });
    });

    try {
        const info = await sendMailWithTimeout;
        console.log("Email sent: ", info);
    } catch (error) {
        console.error("Failed to send email: ", error);
        throw error;
    }
}
