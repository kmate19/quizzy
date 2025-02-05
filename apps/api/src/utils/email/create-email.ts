export default function createEmailTemplate(domain: string, emailToken: string) {
    return `<center><h1>Verify your account!</h1><br><br><button><a href="${domain}/api/v1/auth/verify/${emailToken}"><h2>Verify</h2></a></button></center>`;
}
