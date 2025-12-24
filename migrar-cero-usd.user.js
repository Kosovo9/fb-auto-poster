// ==UserScript==
// @name        AG-Migrar-CeroUSD
// @namespace   Antigravity
// @version     1.0
// @description Migración automática a Cloudflare Pages (Stack 0 USD)
// @author      Antigravity Agent
// @match       https://github.com/*
// @match       https://dash.cloudflare.com/*
// @match       https://vercel.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

(function () {
    'use strict';
    const step = GM_getValue('step', 0);
    const log = (m) => console.log('[AG-CeroUSD] ' + m);

    // 1. GitHub Secrets
    if (location.hostname === 'github.com' && step === 0) {
        if (location.href.includes('/settings/secrets/actions/new')) {
            log('Preparing to add CF_TOKEN');
            const secret = prompt('Pega tu CLOUDFLARE_API_TOKEN:');
            if (secret) {
                document.querySelector('#secret_name').value = 'CLOUDFLARE_API_TOKEN';
                document.querySelector('#secret_value').value = secret;
                GM_setValue('step', 1);
                document.querySelector('button[type="submit"]').click();
            }
        } else {
            location.href = 'https://github.com/Kosovo9/fb-auto-poster/settings/secrets/actions/new';
        }
        return;
    }

    // 2. Cloudflare Pages Deployment
    if (location.hostname === 'dash.cloudflare.com' && step === 1) {
        if (!location.href.includes('/pages')) {
            location.href = 'https://dash.cloudflare.com/pages';
        } else {
            log('In Cloudflare Pages dash');
            const connectBtn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Connect to Git'));
            if (connectBtn) {
                connectBtn.click();
                GM_setValue('step', 2);
            }
        }
        return;
    }

    // 3. Selection and Build Config (Assuming repo selection is manual or handled by script after navigation)
    if (location.hostname === 'dash.cloudflare.com' && step === 2) {
        const repo = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Kosovo9/fb-auto-poster'));
        if (repo) {
            repo.click();
            GM_setValue('step', 3);
        }
        return;
    }

    if (location.hostname === 'dash.cloudflare.com' && step === 3) {
        const buildInput = document.querySelector('input[name="buildCommand"]');
        if (buildInput) {
            buildInput.value = 'pnpm build:cf';
            document.querySelector('input[name="buildOutputDirectory"]').value = '/.vercel/output';
            GM_setValue('step', 4);
            document.querySelector('button[type="submit"]').click();
        }
        return;
    }

    // 4. Vercel Domain Removal
    if (location.hostname === 'vercel.com' && step === 4) {
        if (!location.href.includes('/domains')) {
            location.href = 'https://vercel.com/dashboard/domains';
        } else {
            const removeBtn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Remove'));
            if (removeBtn) {
                removeBtn.click();
                GM_setValue('step', 5);
            }
        }
        return;
    }

    // 5. Cloudflare Custom Domain addition
    if (location.hostname === 'dash.cloudflare.com' && step === 5) {
        log('Final Step: Adding custom domain');
        const addDomainBtn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Add custom domain'));
        if (addDomainBtn) {
            addDomainBtn.click();
            const input = document.querySelector('input');
            if (input) {
                input.value = 'nexorapro.lat';
                GM_setValue('step', 6);
                document.querySelector('button[type="submit"]').click();
            }
        }
    }

    if (step >= 6) {
        alert('Migración "Cero-Cash" completada con éxito. DNS en Cloudflare, Vercel liberado.');
        GM_setValue('step', 0);
    }
})();
