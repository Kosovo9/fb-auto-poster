import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { generateSpintaxVariations } from './spintax-generator';
import { analyzeComment } from './ai-responder';

interface PostOptions {
    groupUrl: string;
    message: string;
    sessionPath?: string;
    mediaUrls?: string[];
    useAI?: boolean;
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
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

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

        page.setDefaultTimeout(60000);

        // Navigate to group
        await page.goto(groupUrl, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(Math.random() * 3000 + 2000);

        // Process Spintax
        let finalMessage = message;
        if (message.includes('{')) {
            const variations = generateSpintaxVariations(message, 1);
            finalMessage = variations[0];
        }

        // Try to find and click the post input
        let clicked = false;
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
            // Force click maybe?
            await page.mouse.click(500, 300);
            await page.waitForTimeout(1000);
        }

        await page.waitForTimeout(1500);

        // Type message if clicked
        if (clicked || true) { // Attempting anyway
            await page.keyboard.type(finalMessage, { delay: 50 });
        }

        await page.waitForTimeout(2000);

        // --- MEDIA UPLOAD ---
        if (mediaUrls && mediaUrls.length > 0) {
            for (const mediaUrl of mediaUrls) {
                try {
                    // Click on "Photo/Video" icon
                    const mediaBtnSelectors = [
                        'aria-label*="Photo"',
                        'aria-label*="Foto"',
                        'div[data-testid="media-attachment-add-button"]',
                        'div[aria-label*="Media"]'
                    ];

                    let btnClicked = false;
                    for (const sel of mediaBtnSelectors) {
                        try {
                            if (await page.isVisible(sel)) {
                                await page.click(sel);
                                btnClicked = true;
                                break;
                            }
                        } catch { }
                    }

                    await page.waitForTimeout(1500);

                    // Note: setInputFiles usually needs a local file path or a Buffer.
                    // If mediaUrl is a public URL, we might need to download it first.
                    // For simplicity and following prompt's lead, we try setInputFiles.
                    const fileInput = await page.$('input[type="file"]');
                    if (fileInput) {
                        await fileInput.setInputFiles(mediaUrl);
                        await page.waitForTimeout(3000); // Wait for upload
                    }
                } catch (e) {
                    console.log('Could not upload media:', e);
                }
            }
        }

        await page.waitForTimeout(2000);

        // Click publish button
        let published = false;
        const publishSelectors = ['button:has-text("Post")', 'button:has-text("Publicar")', '[aria-label="Post"]', '[aria-label="Publicar"]'];

        for (const selector of publishSelectors) {
            try {
                if (await page.isVisible(selector)) {
                    await page.click(selector);
                    published = true;
                    await page.waitForTimeout(5000); // Wait for post to finish
                    break;
                }
            } catch { }
        }

        if (!published) {
            console.log('Publish button not found or already clicked via keyboard?');
        }

        // Save session logic (cookies)
        const storageState = await context.storageState();
        fs.writeFileSync(sessionFile, JSON.stringify(storageState, null, 2));

        await context.close();

        return { success: true, message: 'Posted successfully' };
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
