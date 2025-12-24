import { analyzeComment } from '../app/lib/ai-responder';

async function testAI() {
    console.log('--- Testing AI Reactor ---');
    const comment = "Hola, me interesa el auto rojo, sigue disponible?";
    const vehicleInfo = {
        name: "Toyota Supra 2025",
        price: "$65,000",
        year: "2025",
        whatsapp: "5212345678"
    };
    const analysis = await analyzeComment(comment, vehicleInfo);
    console.log('Análisis:', analysis);
}

testAI();
