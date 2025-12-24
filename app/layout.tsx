import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'Facebook Auto-Poster',
    description: 'Automatiza posteos en múltiples grupos de Facebook',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body>
                <Providers>
                    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
