export const PLANS = {
    PROFESSIONAL: {
        id: 'price_professional',
        name: 'Professional',
        price: 29,
        features: ['10 Grupos', 'Variaciones Spintax', 'Fotos/Videos', 'Analítica Básica']
    },
    BUSINESS: {
        id: 'price_business',
        name: 'Business',
        price: 99,
        features: ['Grupos Ilimitados', 'IA Auto-Reply', 'Spintax Pro', 'Analítica en Tiempo Real']
    },
    ENTERPRISE: {
        id: 'price_enterprise',
        name: 'Enterprise',
        price: 299,
        features: ['Extracción de Leads IA', 'WhatsApp Automation', 'Broadcast SMS/WA', 'Referral Commission 25%']
    }
};

export const getPlanByPriceId = (priceId: string) => {
    return Object.values(PLANS).find(p => p.id === priceId) || PLANS.PROFESSIONAL;
};
