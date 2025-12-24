import * as paypal from '@paypal/checkout-server-sdk';

// This is a basic setup for PayPal SDK
function environment() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    const clientSecret = process.env.PAYPAL_SECRET_KEY || '';

    return process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

export function client() {
    return new paypal.core.PayPalHttpClient(environment());
}
