export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
    try {
        console.log(`[WhatsApp Simulation] Sending to ${phone}: ${message}`);

        // In a real production environment with high volume, 
        // we would use Twilio WhatsApp API or a similar bridge.
        // For "Nuclear Mode" deployment, we can use a placeholder 
        // that logs the intent and would be connected to a real API.

        /* 
        const res = await fetch('https://api.twilio.com/2010-04-01/Accounts/...', {
            method: 'POST',
            body: new URLSearchParams({
                To: `whatsapp:${phone}`,
                From: `whatsapp:${process.env.WHATSAPP_NUMBER}`,
                Body: message
            })
        });
        return res.ok;
        */

        return true;
    } catch (error) {
        console.error("WhatsApp sending error:", error);
        return false;
    }
}

export function generateWhatsAppLink(phone: string, text: string): string {
    const encodedText = encodeURIComponent(text);
    // Clean phone number (remove + and spaces)
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
