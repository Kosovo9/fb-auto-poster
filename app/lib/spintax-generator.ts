export function generateSpintaxVariations(
    baseMessage: string,
    count: number = 5
): string[] {
    // Regex para encontrar {opción1|opción2|opción3}
    const spintaxRegex = /\{([^{}]+)\}/g; // Fixed regex escaping

    const variations: Set<string> = new Set();

    // Safety break
    let attempts = 0;
    const maxAttempts = count * 10;

    while (variations.size < count && attempts < maxAttempts) {
        let variation = baseMessage;
        attempts++;

        // Reemplazar cada {x|y|z} con una opción aleatoria
        variation = variation.replace(spintaxRegex, (match, content) => {
            const options = content.split("|");
            return options[Math.floor(Math.random() * options.length)];
        });

        variations.add(variation);
    }

    return Array.from(variations);
}
