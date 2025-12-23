import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

interface CommentAnalysis {
    isLegit: boolean;
    score: number; // 0-100
    type: "price" | "features" | "location" | "contact" | "spam" | "other";
    suggestedResponse: string;
}

export async function analyzeComment(
    comment: string,
    vehicleInfo: { name: string; price: string; year: string; whatsapp: string }
): Promise<CommentAnalysis> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Analiza este comentario en un grupo de venta de autos:
COMENTARIO: "${comment}"

INFORMACIÓN DEL AUTO:
Modelo: ${vehicleInfo.name}
Precio: ${vehicleInfo.price}
Año: ${vehicleInfo.year}
WhatsApp: ${vehicleInfo.whatsapp}

TAREA:
¿Es un cliente potencial real o spam? (0-100 score)
¿Qué tipo de pregunta es? (price/features/location/contact/spam/other)
Genera una respuesta automática amable y profesional

RESPONDE EN JSON:
{
  "isLegit": true/false,
  "score": 85,
  "type": "price",
  "suggestedResponse": "Tu respuesta aquí"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid response format");

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            isLegit: parsed.isLegit,
            score: parsed.score,
            type: parsed.type,
            suggestedResponse: parsed.suggestedResponse,
        };
    } catch (error) {
        console.error("AI Responder error:", error);
        return {
            isLegit: false,
            score: 0,
            type: "other",
            suggestedResponse: "Gracias por tu interés. Más detalles en WhatsApp.",
        };
    }
}

// Webhook para recibir comentarios de Facebook
export async function handleFacebookCommentWebhook(
    comment: string,
    postId: string,
    vehicleInfo: any
): Promise<void> {
    try {
        const analysis = await analyzeComment(comment, vehicleInfo);

        // Solo responde si es cliente potencial (score > 60)
        if (analysis.score > 60) {
            // En versión 2: publicar respuesta en Facebook automático
            // Por ahora, guardar en BD para revisión manual
            console.log("Auto-response:", analysis.suggestedResponse);
        }
    } catch (error) {
        console.error("Webhook handler error:", error);
    }
}
