export default function createEmailTemplate(
    domain: string,
    username: string,
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
      <title>Fiók Ellenőrzése</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <!-- Ide jöhet a logó -->
          <h2 style="color: #3498db;">Quizzy</h2>
        </div>
        
        <h1>Üdvözlünk ${username}! Kérjük, erősítsd meg a fiókodat</h1>
        
        <p>Köszönjük a regisztrációt! Az induláshoz kattints az alábbi gombra az e-mail címed megerősítéséhez:</p>
        
        <center>
          <a href="https://${domain}/api/v1/auth/verify/${token}" class="button">
            Fiókom megerősítése
          </a>
        </center>
        
        <p>Ha a gomb nem működik, másold be ezt a linket a böngésződbe:</p>
        <p style="word-break: break-all; font-size: 12px;">
          https://${domain}/api/v1/auth/verify/${token}
        </p>
        
        <p>Ez az ellenőrző link 24 órán belül lejár.</p>
        
        <div class="footer">
          <p>Ha nem te hoztál létre fiókot, akkor nyugodtan hagyd figyelmen kívül ezt az e-mailt.</p>
          <p>&copy; ${new Date().getFullYear()} Quizzy Co. Minden jog fenntartva.</p>
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
      <title>Jelszó Visszaállítása</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <!-- Ide jöhet a logó -->
          <h2 style="color: #3498db;">Quizzy</h2>
        </div>
        
        <h1>Üdvözlünk ${username}! Kérjük, állítsd vissza a jelszavad</h1>
        
        <p>Jelszó-visszaállítási kérelmet kaptunk. Kattints az alábbi gombra, hogy ideiglenes jelszóra cseréld:</p>
        
        <center>
          <a href="${domain}/api/v1/auth/forgotpassactivate/${token}" class="button">
            Jelszó visszaállítása
          </a>
        </center>
        
        <p>Miután bejelentkeztél az ideiglenes jelszóval, kérjük, azonnal módosítsd biztonsági okokból.</p>
        
        <div class="password-box">
          <h2 style="margin-top: 0;">Az ideiglenes jelszavad:</h2>
          <p class="password-text">${data}</p>
        </div>
        
        <p>Ha nem te kérted a jelszó visszaállítását, kérjük, azonnal vedd fel a kapcsolatot ügyfélszolgálatunkkal.</p>
        
        <div class="footer">
          <p>Ez a jelszó-visszaállító link 1 órán belül lejár biztonsági okokból.</p>
          <p>&copy; ${new Date().getFullYear()} Quizzy Co. Minden jog fenntartva.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    }
}
