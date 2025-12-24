import MercadoPagoConfig, { Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

export async function createPreference(plan: string, userId: string) {
    const preference = new Preference(client);

    // Quantum Pricing Matrix
    const price = plan === 'business' ? 49 : (plan === 'enterprise' ? 149 : 19);

    const body = {
        items: [
            {
                id: plan,
                title: `FB Auto Poster PRO – Acceso ELITE [Plan ${plan.toUpperCase()}]`,
                quantity: 1,
                unit_price: price,
                currency_id: 'USD',
                description: 'Desbloquea el poder absoluto de la automatización con IA 2025.',
            },
        ],
        back_urls: {
            success: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=success&provider=mp`,
            failure: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=error&provider=mp`,
            pending: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=pending&provider=mp`,
        },
        auto_return: 'approved' as any,
        external_reference: userId,
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
        statement_descriptor: 'FB AUTOPOSTER PRO',
    };

    const response = await preference.create({ body });
    return response.init_point;
}
