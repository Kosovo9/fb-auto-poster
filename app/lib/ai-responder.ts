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
    if (!process.env.GOOGLE_AI_API_KEY) {
        return {
            isLegit: false,
            score: 0,
            type: "other",
            suggestedResponse: "AI Key missing",
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated model name

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

RESPONDE EN JSON PURO:
{
"isLegit": true/false,
"score": 85,
"type": "price",
"suggestedResponse": "Tu respuesta aquí"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

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

// Simple AI response generator for posts (not comments)
export async function generateAIResponse(context: string, tone: string = 'casual'): Promise<string> {
    if (!process.env.GOOGLE_AI_API_KEY) {
        return context; // Return original if no API key
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Mejora este mensaje para Facebook de manera ${tone}. Hazlo más atractivo y engagement-friendly. Mantén el mensaje corto (máximo 2-3 líneas). Solo responde con el mensaje mejorado, sin explicaciones:

"${context}"`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.trim() || context;
    } catch (error) {
        console.error("AI Response error:", error);
        return context; // Return original on error
    }
}
