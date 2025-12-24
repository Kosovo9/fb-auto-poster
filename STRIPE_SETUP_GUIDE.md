# Facebook Auto-Poster - Stripe Setup Guide 🚀

Para completar la integración de pagos monetizada:

## 1. Configuración de Productos en Stripe
Debes crear 3 productos tipo "Suscripción" en tu Dashboard de Stripe y obtener sus IDs de Precio (`price_...`).

| Plan | Nombre | Precio Sugerido |
|------|--------|-----------------|
| **Professional** | Professional Plan | $19.00 / mes |
| **Business** | Business Plan | $49.00 / mes |
| **Enterprise** | Enterprise Plan | $149.00 / mes |

## 2. Variables de Entorno (Actualizar en Netlify/.env.local)

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... (Tu Secret Key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (Tu Publishable Key)
STRIPE_WEBHOOK_SECRET=whsec_... (Para notificaciones de pago)

# Price IDs (Reemplaza con los tuyos)
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_BUSINESS=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

## 3. Webhook Endpoint
Configura un Webhook en Stripe apuntando a:
`https://tusitio.netlify.app/api/webhooks/stripe`
Eventos requeridos:
- `checkout.session.completed`
- `customer.subscription.deleted`
- `customer.subscription.updated`
