import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Send an SMS via Brevo
 * @param {string} recipient - The phone number (e.g., "+33612345678")
 * @param {string} content - The message content
 */
export async function sendSMS(recipient, content) {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.error("❌ BREVO_API_KEY is missing in .env");
        throw new Error("Erreur serveur : Clé API Brevo manquante.");
    }

    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/transactionalSMS/sms",
            {
                sender: "RentalCar", // Max 11 alphanumeric chars
                recipient: recipient,
                content: content,
            },
            {
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": apiKey,
                },
            }
        );

        console.log("✅ SMS sent successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error sending SMS:", error.response?.data || error.message);
        throw new Error("Échec de l'envoi du SMS.");
    }
}
