export default function createEmailTemplate(
    domain: string,
    token: string,
    type: "forgot_password" | "verify",
    data?: string
) {
    if (type === "verify") {
        return `
            <center>
                <h1>Verify your account!</h1>
                <br><br>
                <button>
                    <a href="${domain}/api/v1/auth/verify/${token}">
                        <h2>Verify</h2>
                    </a>
                </button>
            </center>
            `;
    } else if (type === "forgot_password") {
        return `
            <center>
                <h1>Your temporary password is here! Make sure to change it after you log in again.</h1>
                <h2>Your password gets changed when you click the link.</h2>
                <br><br>
                <button>
                    <a href="${domain}/api/v1/auth/forgotpassactivate/${token}">
                        <h2>Change to temporary password</h2>
                    </a>
                </button>
                <br><br>
                <h2>Your temp password is:</h2>
                <br><br>
                <h2 style="color:red;">${data}</h2>
            </center>
            `;
    }
}
