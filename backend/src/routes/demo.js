import express from "express";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { fullName, company, phone, email, message, companyName, fleet, type } = req.body;

    // Validation depends on type
    if (type === 'trial') {
        if (!email || !companyName || !fleet) {
            return res.status(400).json({ error: "Champs obligatoires manquants" });
        }
    } else {
        if (!fullName || !email || !phone) {
            return res.status(400).json({ error: "Champs obligatoires manquants" });
        }
    }

    try {
        const fromEmail = process.env.EMAIL_FROM || "";
        const supportEmail = fromEmail.match(/<([^>]+)>/)?.[1] || process.env.SMTP_USER || "amineabouelouafaelidrissi@gmail.com";
        
        let html = '';
        let subject = '';

        if (type === 'trial') {
            subject = `Nouvelle demande d'essai gratuit - ${companyName}`;
            html = `
                <h2>Nouvelle demande d'essai gratuit (14 jours)</h2>
                <p><strong>Nom de l'agence:</strong> ${companyName}</p>
                <p><strong>Email professionnel:</strong> ${email}</p>
                <p><strong>Taille de flotte:</strong> ${fleet}</p>
            `;
        } else {
            subject = `Nouvelle demande de démo de ${fullName}`;
            html = `
                <h2>Nouvelle demande de démo</h2>
                <p><strong>Nom complet:</strong> ${fullName}</p>
                <p><strong>Société:</strong> ${company || 'Non spécifiée'}</p>
                <p><strong>Téléphone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message || 'Aucun message'}</p>
            `;
        }

        await sendEmail({
            to: supportEmail,
            subject,
            html,
            text: type === 'trial' 
                ? `Essai gratuit: ${companyName}, Email: ${email}, Flotte: ${fleet}` 
                : `Démo: ${fullName}, Société: ${company}, Téléphone: ${phone}, Email: ${email}`
        });

        res.status(200).json({ message: "Demande envoyée avec succès" });
    } catch (error) {
        console.error("Error in demo/trial request:", error);
        res.status(500).json({ error: "Erreur lors de l'envoi de la demande" });
    }
});

export default router;
