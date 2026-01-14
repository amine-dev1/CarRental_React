import { sendEmail } from "./src/utils/mailer.js";

async function test() {
    console.log("🚀 Tentative d'envoi d'un email de test...");
    try {
        await sendEmail({
            to: "elidrissiamine74@gmail.com",
            subject: "Urgent: Test Simple",
            text: "Ceci est un test simple.",
            html: "<p>Test simple</p>",
        });
        console.log("✅ Email envoyé avec succès !");
    } catch (error) {
        console.error("❌ Échec de l'envoi de l'email :");
        console.error(error);
    }
}

test();
