import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

interface PostOptions {
    groupUrl: string;
    message: string;
    sessionPath?: string;
}

export async function postToFacebookGroup({
    groupUrl,
    message,
    sessionPath = '.fb-session.json',
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

        // Set timeout
        page.setDefaultTimeout(30000);

        // Navigate to group
        await page.goto(groupUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(Math.random() * 3000 + 2000);

        // Try to find and click the post input
        let clicked = false;

        try {
            await page.click('[role="textbox"]', { timeout: 5000 });
            clicked = true;
        } catch {
            try {
                await page.click('div[aria-label*="Write"]', { timeout: 5000 });
                clicked = true;
            } catch {
                try {
                    await page.click('button[aria-label*="Photo"]', { timeout: 5000 });
                    clicked = true;
                } catch { }
            }
        }

        if (!clicked) {
            throw new Error('Could not find post input element');
        }

        await page.waitForTimeout(1500);

        // Type message
        await page.keyboard.type(message, { delay: 25 });
        await page.waitForTimeout(2000);

        // Click publish button
        let published = false;

        try {
            await page.click('button:has-text("Post")', { timeout: 5000 });
            published = true;
        } catch {
            try {
                await page.click('button:has-text("Publicar")', { timeout: 5000 });
                published = true;
            } catch { }
        }

        if (!published) {
            throw new Error('Could not find publish button');
        }

        // Save session
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
