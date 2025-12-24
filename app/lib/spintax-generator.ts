export function generateSpintaxVariations(
    baseMessage: string,
    count: number = 50
): string[] {
    const variations: Set<string> = new Set();

    if (!baseMessage.includes('{')) {
        return [baseMessage];
    }

    const spin = (text: string): string => {
        const regex = /\{([^{}]+)\}/g;
        let msg = text;
        while (regex.test(msg)) {
            msg = msg.replace(regex, (match, choices) => {
                const options = choices.split('|');
                return options[Math.floor(Math.random() * options.length)];
            });
        }
        return msg;
    };

    let iterations = 0;
    const maxIterations = count * 20;

    while (variations.size < count && iterations < maxIterations) {
        const variation = spin(baseMessage);
        variations.add(variation);
        iterations++;
    }

    return Array.from(variations);
}
