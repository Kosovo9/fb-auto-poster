export function generateSpintaxVariations(
    baseMessage: string,
    count: number = 5
): string[] {
    // Regex para encontrar {opción1|opción2|opción3}
    const spintaxRegex = /{[^}]+}/g;

    const variations: Set<string> = new Set();

    // Si no hay spintax, retornar el mensaje original
    if (!baseMessage.includes('{')) {
        return [baseMessage];
    }

    while (variations.size < count) {
        let variation = baseMessage;

        // Reemplazar cada {x|y|z} con una opción aleatoria
        variation = variation.replace(spintaxRegex, (match) => {
            const options = match
                .slice(1, -1) // Remover { y }
                .split("|");
            return options[Math.floor(Math.random() * options.length)];
        });

        variations.add(variation);
    }

    return Array.from(variations);
}

// Ejemplo de uso:
// const template = "{Te presento|Aquí tienes|Mira} {joya|vehículo} {2024|año 2024} {Gladiator|Jeep} ${precio}"
// const variations = generateSpintaxVariations(template, 10);
// console.log(variations); // 10 variaciones diferentes
