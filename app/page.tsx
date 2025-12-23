'use client';

import Link from 'next/link';

const PLANS = [
    {
        name: 'Professional',
        price: '29',
        tagline: 'Ideal para vendedores individuales',
        features: ['10 Grupos simultáneos', 'Spintax (50 variaciones)', 'Fotos/Videos HD', 'Analíticas Básicas'],
        cta: 'Empezar ahora',
        highlight: false
    },
    {
        name: 'Business',
        price: '99',
        tagline: 'La opción #1 de los expertos',
        features: ['Grupos ILIMITADOS', 'IA Auto-Reply (Gemini)', 'Lead extraction', 'Soporte 24/7'],
        cta: 'Obtener Business',
        highlight: true
    },
    {
        name: 'Enterprise',
        price: '299',
        tagline: 'Dominio total del mercado',
        features: ['WhatsApp Automation', 'Broadcast SMS/WA', 'Referral program (25%)', 'Lead extraction IA'],
        cta: 'Ir a lo grande',
        highlight: false
    }
];

export default function LandingPage() {
    return (
        <div className="bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-4 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
                    <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">FB AUTOPOSTER</div>
                    <div className="flex gap-8 items-center">
                        <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
                        <Link href="/signup" className="bg-blue-600 px-6 py-2 rounded-full text-sm font-black hover:bg-blue-500 transition-all">EMPEZAR GRATIS</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-40 pb-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
                        Vende 5x más rápido hoy mismo
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                        DOMINA CUALQUIER <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">GRUPO DE VENTA.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
                        Publica en cientos de grupos, responde a clientes con IA y extrae leads calificados automáticamente.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <Link href="/signup" className="w-full md:w-auto bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-blue-500/10">EMPEZAR AHORA</Link>
                        <div className="flex -space-x-3 items-center">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden`}>
                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                </div>
                            ))}
                            <span className="ml-6 text-sm text-slate-500 font-bold tracking-tight">Vendedores usando la IA</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 bg-slate-900/40 border-y border-white/5 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Elige el plan que te llevará a los $1,000/día</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sin contratos, cancela cuando quieras</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {PLANS.map((plan, i) => (
                            <div key={i} className={`p-8 rounded-[2.5rem] border ${plan.highlight ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-500/20 scale-105' : 'bg-slate-900/50 border-white/5'} transition-all hover:border-blue-500/50`}>
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold mb-2 uppercase tracking-tighter">{plan.name}</h3>
                                    <p className={`${plan.highlight ? 'text-blue-100' : 'text-slate-400'} text-xs font-bold`}>{plan.tagline}</p>
                                </div>
                                <div className="mb-8">
                                    <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                                    <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-slate-500'} font-bold`}>/mes</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm font-bold opacity-90">
                                            <div className={`w-5 h-5 rounded-full ${plan.highlight ? 'bg-white text-blue-600' : 'bg-blue-500/20 text-blue-400'} flex items-center justify-center text-[10px] font-black text-center`}>✓</div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/signup"
                                    className={`block text-center py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.highlight ? 'bg-white text-blue-600 hover:scale-[1.02]' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4 overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 py-20 rounded-[3rem] text-center relative">
                        <div className="absolute top-10 left-10 text-9xl font-black text-white/10 select-none">“</div>
                        <p className="text-3xl md:text-5xl font-black leading-tight mb-8 relative z-10">
                            "Pasé de vender 2 autos al mes a vender 12. La automatización de comentarios me ahorra 4 horas diarias."
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-full border-4 border-white/20 bg-slate-800">
                                <img src="https://i.pravatar.cc/100?u=neil" className="rounded-full" alt="neil" />
                            </div>
                            <div className="text-left">
                                <p className="font-black text-xl uppercase tracking-tighter">Neil Ortega</p>
                                <p className="text-blue-200 font-bold text-xs">Vendedor de Autos de Lujo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 text-center">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Developed by Antigravity Nuclear Mode 🚀</p>
                <div className="text-slate-700 text-[10px]">© 2025 FB AUTOPOSTER PRO. All rights reserved.</div>
            </footer>
        </div>
    );
}
