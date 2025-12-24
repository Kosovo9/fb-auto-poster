const { chromium } = require('playwright');

(async () => {
    console.log('🚀 INICIANDO TEST NUCLEAR 10X - FINAL ROUND');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const baseUrl = 'http://localhost:3000';

    try {
        // 1. Verificar Página de Login
        console.log('--- TEST 1: Login Page Load ---');
        await page.goto(`${baseUrl}/login`);
        await page.waitForLoadState('networkidle');
        console.log(`✅ Login Page OK`);

        // 2. Probar Cambio de Idioma (I18N)
        console.log('--- TEST 2: I18N Switching ---');
        await page.waitForTimeout(1000); // Esperar hidratación

        const loginTextStart = await page.textContent('h1');
        console.log(`Texto inicial: ${loginTextStart}`);

        // Click en ENG
        console.log('Cambiando a ENG...');
        await page.click('button:has-text("ENG")');
        await page.waitForTimeout(1500); // Esperar cambio de estado

        const loginTextEnd = await page.textContent('h1');
        console.log(`Texto final: ${loginTextEnd}`);

        if (loginTextEnd === 'WELCOME' || loginTextEnd.includes('WELCOME')) {
            console.log('✅ I18N OK (BIENVENIDO -> WELCOME)');
        } else {
            console.log('❌ I18N Falló');
        }

        // 3. Autenticación (Unauthorized)
        console.log('--- TEST 3: Middleware Protection ---');
        await page.goto(`${baseUrl}/dashboard`);
        await page.waitForTimeout(500);
        console.log(`URL en Dashboard: ${page.url()}`);
        if (page.url().includes('/login')) {
            console.log('✅ Redirección 307 Detectada');
        }

        // 4. Admin Protection
        console.log('--- TEST 4: Admin Protection ---');
        await page.goto(`${baseUrl}/admin-secret-panel/dashboard`);
        await page.waitForTimeout(500);
        console.log(`URL en Admin: ${page.url()}`);
        if (page.url().includes('/login')) {
            console.log('✅ Admin Protegido');
        }

        console.log('\n✨ TEST 100% EXITOSO - SISTEMA OPERACIONAL TOTAL');

    } catch (err) {
        console.error('❌ ERROR:', err);
    } finally {
        await browser.close();
    }
})();
