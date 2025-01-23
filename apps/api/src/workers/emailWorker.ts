declare var self: Worker;

import sendEmail from "@/utils/email/sendEmail";

const RETRIES = 3;
const RETRY_DELAY = 2000;
self.onmessage = async (e) => {
    const { email, emailToken } = e.data;

    let attempts = 0;
    while (attempts < RETRIES) {
        try {
            await sendEmail(email, emailToken);
            break;
        } catch (error) {
            attempts++;
            if (attempts >= RETRIES) {
                console.error("Failed to send email after retries: ", error);
                break;
            }
            console.log(`Retrying (${attempts}/${RETRIES})...`);

            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        }
    }
    // idk this doesnt work
    //self.terminate();
}
