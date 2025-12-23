/**
 * Process Spintax in a string.
 * Example: "{Hola|Que tal|Saludos} amigo" -> "Que tal amigo"
 */
export function processSpintax(text: string): string {
    if (!text) return '';

    // Recursive regex to handle nested spintax
    const spintaxRegex = /\{([^{}]+)\}/g;

    let processedText = text;
    while (spintaxRegex.test(processedText)) {
        processedText = processedText.replace(spintaxRegex, (match, options) => {
            const choices = options.split('|');
            const randomChoice = choices[Math.floor(Math.random() * choices.length)];
            return randomChoice;
        });
    }

    return processedText;
}
