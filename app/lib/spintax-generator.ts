export function generateSpintaxVariations(
    baseMessage: string,
    count: number = 50
): string[] {
    const spintaxRegex = /{[^}]+}/g;
    const variations: Set<string> = new Set();

    if (!baseMessage.includes('{')) {
        return [baseMessage];
    }

    // Attempt to generate up to 'count' variations
    // Limit iterations to prevent infinite loops if complexity is low
    let iterations = 0;
    while (variations.size < count && iterations < count * 10) {
        let variation = baseMessage;
        variation = variation.replace(spintaxRegex, (match) => {
            const options = match
                .slice(1, -1)
                .split("|");
            return options[Math.floor(Math.random() * options.length)];
        });
        variations.add(variation);
        iterations++;
    }

    return Array.from(variations);
}

// Ejemplo de uso:
// const template = "{Te presento|Aquí tienes|Mira} {joya|vehículo} {2024|año 2024} {Gladiator|Jeep} ${precio}"
// const variations = generateSpintaxVariations(template, 10);
// console.log(variations); // 10 variaciones diferentes
