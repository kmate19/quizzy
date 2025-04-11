import FormData from "form-data";
import MailGun from "mailgun.js";
import createEmailTemplate from "./create-email";
import ENV from "@/config/env";

const mailgun = new MailGun(FormData);

const mg = mailgun.client({
    username: "api",
    key: ENV.MAILGUN_API_KEY(),
    url: "https://api.eu.mailgun.net",
});

export default async function sendEmail(
    userEmail: string,
    token: string,
    type: "forgot_password" | "verify",
    data?: string
) {
    console.log("Sending email to: ", userEmail);

    const sendMailWithTimeout = new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Email sending timed out"));
        }, 10000);

        await mg.messages
            .create(ENV.DOMAIN(), {
                from: `Quizzy | ${type === "verify" ? "Hitelesítés" : "Jelszó"} <noreply@${ENV.DOMAIN()}>`,
                to: userEmail,
                subject:
                    type === "verify"
                        ? "E-mail cím megerősítése"
                        : "Jelszó visszaállítása",
                html: createEmailTemplate(ENV.DOMAIN(), token, type, data)!,
            })
            .then((info) => {
                clearTimeout(timeout);
                resolve(info);
            })
            .catch((error) => {
                clearTimeout(timeout);
                reject(error);
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
