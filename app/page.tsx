'use client';

import Link from 'next/link';

const PLANS = [
    {
        name: 'Professional',
        price: '29',
        priceId: 'price_professional',
        tagline: 'Ideal para vendedores individuales',
        features: ['10 Grupos simultáneos', 'Spintax (50 variaciones)', 'Fotos/Videos HD', 'Analíticas Básicas'],
        cta: 'Empezar ahora',
        highlight: false
    },
    {
        name: 'Business',
        price: '99',
        priceId: 'price_business',
        tagline: 'La opción #1 de los expertos',
        features: ['Grupos ILIMITADOS', 'IA Auto-Reply (Gemini)', 'Lead extraction', 'Soporte 24/7'],
        cta: 'Obtener Business',
        highlight: true
    },
    {
        name: 'Enterprise',
        price: '299',
        priceId: 'price_enterprise',
        tagline: 'Dominio total del mercado',
        features: ['WhatsApp Automation', 'Broadcast SMS/WA', 'Referral program (25%)', 'Lead extraction IA'],
        cta: 'Ir a lo grande',
        highlight: false
    }
];

const TESTIMONIALS = [
    {
        name: 'Neil Ortega',
        role: 'Vendedor de Autos de Lujo',
        text: '"Pasé de vender 2 autos al mes a vender 12. La automatización de comentarios me ahorra 4 horas diarias."',
        avatar: 'https://i.pravatar.cc/150?u=neil'
    },
    {
        name: 'Carla Méndez',
        role: 'Agente Inmobiliario',
        text: '"El extractor de leads es una mina de oro. Detecta a los que quieren comprar al instante y les mando WhatsApp automático."',
        avatar: 'https://i.pravatar.cc/150?u=carla'
    },
    {
        name: 'Roberto Gómez',
        role: 'Emprendedor Serial',
        text: '"He escalado mi negocio de dropshipping en grupos de ventas sin mover un dedo. El ROI fue de 10x la primera semana."',
        avatar: 'https://i.pravatar.cc/150?u=roberto'
    }
];

const FAQS = [
    {
        q: '¿Es seguro para mi cuenta de Facebook?',
        a: 'Sí. Usamos Spintax y algoritmos de comportamiento humano para que tus publicaciones parezcan naturales y no activen alarmas de spam.'
    },
    {
        q: '¿Cómo funciona la extracción de leads?',
        a: 'Nuestra IA lee cada comentario, identifica si la persona tiene intención de compra real y extrae su contacto si lo mencionan.'
    },
    {
        q: '¿Puedo cancelar en cualquier momento?',
        a: 'Absolutamente. No hay permanencia. Si cancelas, seguirás teniendo acceso hasta el final de tu ciclo de pago.'
    }
];

export default function LandingPage() {
    return (
        <div className="bg-slate-950 text-white selection:bg-blue-500 selection:text-white font-sans">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-4 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
                    <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-tighter">FB AUTOPOSTER</div>
                    <div className="flex gap-8 items-center">
                        <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
                        <Link href="/signup" className="bg-blue-600 px-6 py-2.5 rounded-full text-sm font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">EMPEZAR GRATIS</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-48 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -z-10"></div>
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
                        Vende 5x más rápido hoy mismo • 30 Días de Garantía
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                        DOMINA CUALQUIER <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">GRUPO DE VENTA.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                        Publica en cientos de grupos, responde a clientes con IA y extrae leads calificados automáticamente. La herramienta #1 para vendedores.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <Link href="/signup" className="w-full md:w-auto bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-white/10 hover:shadow-blue-500/20">EMPEZAR AHORA</Link>
                        <div className="flex -space-x-4 items-center">
                            {[1, 2, 3, 4].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?u=${i + 10}`} className="w-12 h-12 rounded-full border-4 border-slate-950 bg-slate-800" alt="user" />
                            ))}
                            <div className="pl-6 text-left">
                                <div className="flex gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-500 text-xs">★</span>)}
                                </div>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">+500 Vendedores Felices</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-32 bg-slate-900/40 border-y border-white/5 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black mb-6 tracking-tight">Planes de Alto Rendimiento</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Acelera tus ventas hoy. Cancela cuando quieras.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {PLANS.map((plan, i) => (
                            <div key={i} className={`p-10 rounded-[3rem] border ${plan.highlight ? 'bg-blue-600 border-blue-500 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] scale-105 z-10' : 'bg-slate-900/50 border-white/5'} transition-all hover:border-blue-500/40 group`}>
                                <div className="mb-10">
                                    <h3 className="text-2xl font-black mb-3 uppercase tracking-tighter">{plan.name}</h3>
                                    <p className={`${plan.highlight ? 'text-blue-100' : 'text-slate-400'} text-sm font-bold`}>{plan.tagline}</p>
                                </div>
                                <div className="mb-10">
                                    <div className="flex items-end gap-2">
                                        <span className="text-6xl font-black tracking-tighter">${plan.price}</span>
                                        <span className={`text-base mb-2 ${plan.highlight ? 'text-blue-200' : 'text-slate-500'} font-bold`}>/mes</span>
                                    </div>
                                </div>
                                <ul className="space-y-5 mb-12">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-4 text-sm font-bold opacity-90">
                                            <div className={`w-6 h-6 rounded-full shrink-0 ${plan.highlight ? 'bg-white text-blue-600' : 'bg-blue-500/20 text-blue-400'} flex items-center justify-center text-[10px] font-black`}>✓</div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/signup"
                                    className={`block text-center py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.highlight ? 'bg-white text-blue-600 hover:scale-[1.02] shadow-xl' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Guarantee */}
                    <div className="mt-20 text-center bg-slate-800/20 border border-white/5 p-8 rounded-[2rem] max-w-2xl mx-auto">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <span className="text-4xl">🛡️</span>
                            <h4 className="text-xl font-black uppercase tracking-tight">Garantía de Satisfacción de 30 Días</h4>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Si no ves resultados en los primeros 30 días, te devolvemos tu dinero sin preguntas. Estamos tan seguros de que este sistema funciona.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 px-4 bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-center text-5xl font-black mb-20 tracking-tighter">Vendedores que ya dominan el mercado</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all">
                                <div className="flex gap-4 items-center mb-6">
                                    <img src={t.avatar} className="w-14 h-14 rounded-full border-2 border-blue-500/50" alt={t.name} />
                                    <div>
                                        <h4 className="font-black text-lg leading-tight">{t.name}</h4>
                                        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                                \u003cp className=\"text-slate-400 font-medium leading-relaxed italic\"\u003e{t.text}\u003c/p\u003e
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 px-4 bg-slate-900/20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-center text-5xl font-black mb-16 tracking-tighter">Preguntas Frecuentes</h2>
                    <div className="space-y-6">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="bg-slate-800/30 border border-white/5 p-8 rounded-[2rem]">
                                <h4 className="text-lg font-black mb-4 flex gap-4 items-center uppercase tracking-tight">
                                    <span className="text-blue-500">Q.</span> {faq.q}
                                </h4>
                                <p className="text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-4 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full -z-10"></div>
                <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter">¿Listo para llevar tus ventas al siguiente nivel?</h2>
                <Link href="/signup" className="inline-block bg-blue-600 text-white px-16 py-6 rounded-3xl font-black text-2xl hover:scale-105 transition-all shadow-2xl shadow-blue-600/30">QUIERO EMPEZAR HOY</Link>
                <p className="mt-8 text-slate-500 font-bold uppercase tracking-widest text-xs">Únete a más de 500 vendedores PRO</p>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 text-center bg-slate-950">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Developed by Antigravity Nuclear Mode 🚀</p>
                <div className="text-slate-700 text-[10px]">© 2025 FB AUTOPOSTER PRO. All rights reserved.</div>
            </footer>
        </div>
    );
}
