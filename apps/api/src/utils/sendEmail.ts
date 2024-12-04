import { createTransport } from "nodemailer";

const transporter = createTransport({
    service: "gmail",
    auth: {
        user: Bun.env.EMAIL_USER,
        pass: Bun.env.EMAIL_PASS
    }
})

export default async function sendEmail(userEmail: string) {
    console.log("Sending email to: ", userEmail);
    const mailOpts = {
        from: `"Quizzy" <${Bun.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Test Email",
    }

    try {
        const info = await transporter.sendMail(mailOpts);

        console.log("Message sent: ", info.response);
    } catch (error) {
        throw error;
    }
}
