import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

interface ExtractedLead {
    name: string | null;
    phone: string | null;
    intent: "buy" | "sell" | "info" | "spam";
}

export async function extractLeadFromComment(comment: string): Promise<ExtractedLead> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Extrae información de contacto y detecta la intención de este comentario de Facebook:
        COMENTARIO: "${comment}"
        
        Extrae el Nombre y el Teléfono/WhatsApp si están presentes.
        Intención: 'buy' (si quiere comprar), 'sell' (si ofrece algo), 'info' (si pide info), 'spam' (si es bot o basura).
        
        Responde estrictamente en JSON:
        {
          "name": "Nombre o null",
          "phone": "Teléfono o null",
          "intent": "buy/sell/info/spam"
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Lead extraction error:", error);
        return { name: null, phone: null, intent: "spam" };
    }
}
