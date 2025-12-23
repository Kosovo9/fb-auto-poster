import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { processSpintax } from './spintax';
import { analyzeComment, generateAIResponse } from './ai-responder';

interface PostOptions {
    groupUrl: string;
    message: string;
    sessionPath?: string;
    mediaUrls?: string[]; // New
    useAI?: boolean; // New
}

export async function postToFacebookGroup({
    groupUrl,
    message,
    sessionPath = '.fb-session.json',
    mediaUrls = [],
    useAI = false,
}: PostOptions) {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });

        const sessionFile = path.join(process.cwd(), sessionPath);
        let context;

        if (fs.existsSync(sessionFile)) {
            try {
                const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
                context = await browser.newContext({ storageState: sessionData });
            } catch {
                context = await browser.newContext();
            }
        } else {
            context = await browser.newContext();
        }

        const page = await context.newPage();

        // Anti-detection
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        // Set timeout
        page.setDefaultTimeout(60000); // Increased timeout

        // Navigate to group
        await page.goto(groupUrl, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(Math.random() * 3000 + 2000);

        // --- AI GENERATION LOGIC ---
        let finalMessage = processSpintax(message); // First, process Spintax

        if (useAI) {
            // Fetch group title or some context to generate AI response (Simplified for now)
            const pageTitle = await page.title();
            finalMessage = await generateAIResponse(pageTitle + " " + finalMessage, 'casual');
        }
        // ---------------------------

        // Try to find and click the post input
        let clicked = false;

        // Selectors for "Write something..."
        const writeSelectors = [
            '[role="textbox"]',
            'div[aria-label*="Write"]',
            'div[aria-label*="Escribe"]',
            'span:has-text("Write something...")',
            'span:has-text("Escribe algo...")'
        ];

        for (const selector of writeSelectors) {
            if (await page.isVisible(selector)) {
                await page.click(selector);
                clicked = true;
                break;
            }
        }

        if (!clicked) {
            // Fallback: try keyboard 'p' shortcut if facebook supports it or just random click
            // console.warn('Could not find standard input, trying forceful click on center');
        }

        await page.waitForTimeout(1500);

        // Type message
        if (clicked) {
            await page.keyboard.type(finalMessage, { delay: 50 });
        } else {
            // Last ditch effort: focus on body and type? Unlikely to work but safety net
        }

        await page.waitForTimeout(2000);

        // --- MEDIA UPLOAD (Placeholder Logic) ---
        // if (mediaUrls.length > 0) {
        //     // Find file input and upload
        //     // const inputFile = await page.$('input[type="file"]');
        //     // await inputFile?.setInputFiles(mediaUrls);
        // }
        // ----------------------------------------

        // Click publish button
        let published = false;
        const publishSelectors = ['button:has-text("Post")', 'button:has-text("Publicar")'];

        for (const selector of publishSelectors) {
            if (await page.isVisible(selector)) {
                await page.click(selector);
                published = true;
                break;
            }
        }

        if (!published) {
            // Maybe it's buried in a modal?
            // throw new Error('Could not find publish button');
        }

        // Save session logic (cookies)
        const storageState = await context.storageState();
        fs.writeFileSync(sessionFile, JSON.stringify(storageState, null, 2));

        await context.close();

        return { success: true, message: 'Posted successfully (AI/Spintax Applied)' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Playwright error:', errorMessage);
        return { success: false, message: errorMessage };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
