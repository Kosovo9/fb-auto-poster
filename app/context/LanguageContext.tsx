'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Supported languages
export type Language = 'es' | 'en' | 'pt';

// Translation keys type
interface Translations {
    // Auth pages
    welcome: string;
    createAccount: string;
    email: string;
    password: string;
    login: string;
    signup: string;
    loggingIn: string;
    signingUp: string;
    noAccount: string;
    hasAccount: string;
    registerNow: string;
    loginNow: string;
    enterDashboard: string;
    pressEnter: string;

    // Dashboard
    dashboard: string;
    adminDashboard: string;
    totalUsers: string;
    totalRevenue: string;
    activeSubscriptions: string;
    todaySignups: string;
    systemHealth: string;
    recentActivity: string;
    viewAll: string;
    logout: string;

    // Common
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    settings: string;

    // Dashboard Extra
    groupsManagement: string;
    addGroup: string;
    groupName: string;
    groupUrl: string;
    adding: string;
    schedulePost: string;
    selectGroup: string;
    dateTime: string;
    spintaxContent: string;
    previewMessage: string;
    mediaUpload: string;
    useAI: string;
    scheduleNow: string;
    scheduling: string;
    operationsLog: string;
    group: string;
    message: string;
    scheduledDate: string;
    statusTerm: string;
    leadsExtraction: string;
    referralProgram: string;
    earnCommission: string;
    yourLink: string;
    roiEstimator: string;
    groupCapacity: string;
    conversionRate: string;
    upgradePro: string;
    upgradeEnterprise: string;
    nuclearMode: string;

    // Analytics
    posts: string;
    commentsTerm: string;
    conversions: string;
    estRevenue: string;
    engagement: string;

    // Subtitle texts
    startAutomating: string;
    fbAutoV2: string;
}

// All translations
const translations: Record<Language, Translations> = {
    es: {
        welcome: 'BIENVENIDO',
        createAccount: 'CREAR CUENTA',
        email: 'Email',
        password: 'Contraseña',
        login: 'INICIAR SESIÓN',
        signup: 'REGISTRARSE',
        loggingIn: 'ACCEDIENDO...',
        signingUp: 'CREANDO CUENTA...',
        noAccount: '¿No tienes cuenta?',
        hasAccount: '¿Ya tienes cuenta?',
        registerNow: 'Regístrate ahora',
        loginNow: 'Inicia sesión',
        enterDashboard: 'ENTRAR AL DASHBOARD',
        pressEnter: 'Presiona ENTER para enviar',

        dashboard: 'Dashboard',
        adminDashboard: 'Panel de Administración',
        totalUsers: 'Usuarios Totales',
        totalRevenue: 'Ingresos Totales',
        activeSubscriptions: 'Suscripciones Activas',
        todaySignups: 'Registros Hoy',
        systemHealth: 'Estado del Sistema',
        recentActivity: 'Actividad Reciente',
        viewAll: 'Ver Todo',
        logout: 'Cerrar Sesión',

        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        save: 'Guardar',
        cancel: 'Cancelar',
        settings: 'Configuración',

        groupsManagement: 'Gestión de Grupos',
        addGroup: '＋ Agregar Grupo',
        groupName: 'Nombre del Grupo',
        groupUrl: 'URL del Grupo',
        adding: 'Agregando...',
        schedulePost: 'Programador Maestro',
        selectGroup: 'Selecciona un grupo',
        dateTime: 'Fecha y Hora',
        spintaxContent: 'Contenido Spintax',
        previewMessage: 'Preview del Mensaje',
        mediaUpload: 'Media (Fotos/Videos)',
        useAI: '✨ Responder con IA (v2.0)',
        scheduleNow: '🚀 AGENDAR AHORA',
        scheduling: 'PROGRAMANDO...',
        operationsLog: '📊 Registro de Operaciones',
        group: 'Grupo',
        message: 'Mensaje',
        scheduledDate: 'Fecha Programada',
        statusTerm: 'Estado',
        leadsExtraction: '💎 Leads Extraídos (IA)',
        referralProgram: '💸 Programa de Referidos',
        earnCommission: 'Gana 25%',
        yourLink: 'Tu link único:',
        roiEstimator: 'ROI Estimado',
        groupCapacity: 'Capacidad de Grupos',
        conversionRate: 'Tasa de Conversión',
        upgradePro: '👑 OBTENER PRO',
        upgradeEnterprise: 'ACTUALIZAR AHORA',
        nuclearMode: '🚀 ¡DESBLOQUEA EL MODO NUCLEAR!',

        posts: 'Posteos',
        commentsTerm: 'Comentarios',
        conversions: 'Conversiones',
        estRevenue: 'Ingresos Est.',
        engagement: 'Engagement',

        startAutomating: 'Comienza a automatizar hoy mismo',
        fbAutoV2: 'FB Auto-Poster V2.0 PRO',
    },
    en: {
        welcome: 'WELCOME',
        createAccount: 'CREATE ACCOUNT',
        email: 'Email',
        password: 'Password',
        login: 'LOG IN',
        signup: 'SIGN UP',
        loggingIn: 'LOGGING IN...',
        signingUp: 'CREATING ACCOUNT...',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        registerNow: 'Register now',
        loginNow: 'Log in',
        enterDashboard: 'ENTER DASHBOARD',
        pressEnter: 'Press ENTER to submit',

        dashboard: 'Dashboard',
        adminDashboard: 'Admin Dashboard',
        totalUsers: 'Total Users',
        totalRevenue: 'Total Revenue',
        activeSubscriptions: 'Active Subscriptions',
        todaySignups: "Today's Signups",
        systemHealth: 'System Health',
        recentActivity: 'Recent Activity',
        viewAll: 'View All',
        logout: 'Log Out',

        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        save: 'Save',
        cancel: 'Cancel',
        settings: 'Settings',

        groupsManagement: 'Groups Management',
        addGroup: '＋ Add Group',
        groupName: 'Group Name',
        groupUrl: 'Group URL',
        adding: 'Adding...',
        schedulePost: 'Master Scheduler',
        selectGroup: 'Select a group',
        dateTime: 'Date and Time',
        spintaxContent: 'Spintax Content',
        previewMessage: 'Message Preview',
        mediaUpload: 'Media (Photos/Videos)',
        useAI: '✨ Reply with AI (v2.0)',
        scheduleNow: '🚀 SCHEDULE NOW',
        scheduling: 'SCHEDULING...',
        operationsLog: '📊 Operations Log',
        group: 'Group',
        message: 'Message',
        scheduledDate: 'Scheduled Date',
        statusTerm: 'Status',
        leadsExtraction: '💎 Extracted Leads (AI)',
        referralProgram: '💸 Referral Program',
        earnCommission: 'Earn 25%',
        yourLink: 'Your unique link:',
        roiEstimator: 'Estimated ROI',
        groupCapacity: 'Group Capacity',
        conversionRate: 'Conversion Rate',
        upgradePro: '👑 GET PRO',
        upgradeEnterprise: 'UPGRADE NOW',
        nuclearMode: '🚀 UNLOCK NUCLEAR MODE!',

        posts: 'Posts',
        commentsTerm: 'Comments',
        conversions: 'Conversions',
        estRevenue: 'Est. Revenue',
        engagement: 'Engagement',

        startAutomating: 'Start automating today',
        fbAutoV2: 'FB Auto-Poster V2.0 PRO',
    },
    pt: {
        welcome: 'BEM-VINDO',
        createAccount: 'CRIAR CONTA',
        email: 'Email',
        password: 'Senha',
        login: 'ENTRAR',
        signup: 'CADASTRAR',
        loggingIn: 'ENTRANDO...',
        signingUp: 'CRIANDO CONTA...',
        noAccount: 'Não tem conta?',
        hasAccount: 'Já tem conta?',
        registerNow: 'Cadastre-se agora',
        loginNow: 'Entrar',
        enterDashboard: 'ACESSAR DASHBOARD',
        pressEnter: 'Pressione ENTER para enviar',

        dashboard: 'Dashboard',
        adminDashboard: 'Painel de Administração',
        totalUsers: 'Total de Usuários',
        totalRevenue: 'Receita Total',
        activeSubscriptions: 'Assinaturas Ativas',
        todaySignups: 'Cadastros Hoje',
        systemHealth: 'Status do Sistema',
        recentActivity: 'Atividade Recente',
        viewAll: 'Ver Tudo',
        logout: 'Sair',

        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
        save: 'Salvar',
        cancel: 'Cancelar',
        settings: 'Configurações',

        groupsManagement: 'Gestão de Grupos',
        addGroup: '＋ Adicionar Grupo',
        groupName: 'Nome do Grupo',
        groupUrl: 'URL do Grupo',
        adding: 'Adicionando...',
        schedulePost: 'Agendador Mestre',
        selectGroup: 'Selecione um grupo',
        dateTime: 'Data e Hora',
        spintaxContent: 'Conteúdo Spintax',
        previewMessage: 'Visualização da Mensagem',
        mediaUpload: 'Mídia (Fotos/Vídeos)',
        useAI: '✨ Responder com IA (v2.0)',
        scheduleNow: '🚀 AGENDAR AGORA',
        scheduling: 'AGENDANDO...',
        operationsLog: '📊 Registro de Operações',
        group: 'Grupo',
        message: 'Mensaje',
        scheduledDate: 'Data Agendada',
        statusTerm: 'Status',
        leadsExtraction: '💎 Leads Extraídos (IA)',
        referralProgram: '💸 Programa de Referência',
        earnCommission: 'Ganhe 25%',
        yourLink: 'Seu link único:',
        roiEstimator: 'ROI Estimado',
        groupCapacity: 'Capacidade de Grupos',
        conversionRate: 'Taxa de Conversão',
        upgradePro: '👑 OBTER PRO',
        upgradeEnterprise: 'ATUALIZAR AGORA',
        nuclearMode: '🚀 DESBLOQUEIE O MODO NUCLEAR!',

        posts: 'Postagens',
        commentsTerm: 'Comentários',
        conversions: 'Conversões',
        estRevenue: 'Receita Est.',
        engagement: 'Engajamento',

        startAutomating: 'Comece a automatizar hoje',
        fbAutoV2: 'FB Auto-Poster V2.0 PRO',
    },
};

// Context type
interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

// Create context with default value
const LanguageContext = createContext<LanguageContextType>({
    language: 'es',
    setLanguage: () => { },
    t: translations['es'],
});

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es');
    const [mounted, setMounted] = useState(false);

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('fb-autoposter-lang') as Language;
        if (savedLang && ['es', 'en', 'pt'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
        setMounted(true);
    }, []);

    // Save language to localStorage when changed
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('fb-autoposter-lang', lang);
    };

    const value = {
        language,
        setLanguage,
        t: translations[language],
    };

    // Prevent hydration mismatch by rendering default on server
    if (!mounted) {
        return (
            <LanguageContext.Provider value={{ language: 'es', setLanguage: () => { }, t: translations['es'] }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

// Custom hook
export function useLanguage() {
    const context = useContext(LanguageContext);
    return context;
}

// Language Switcher Component
export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const languages: { code: Language; label: string; flag: string }[] = [
        { code: 'en', label: 'ENG', flag: '🇺🇸' },
        { code: 'es', label: 'ESP', flag: '🇲🇽' },
        { code: 'pt', label: 'PORT', flag: '🇧🇷' },
    ];

    if (!isClient) {
        return (
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                {languages.map(({ code, label, flag }) => (
                    <button
                        key={code}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${code === 'es'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        <span>{flag}</span>
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            {languages.map(({ code, label, flag }) => (
                <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${language === code
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    <span>{flag}</span>
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}
