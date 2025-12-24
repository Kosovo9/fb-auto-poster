function generateSpintaxVariations(baseMessage, count = 50) {
    const spintaxRegex = /{[^}]+}/g;
    const variations = new Set();
    if (!baseMessage.includes('{')) return [baseMessage];
    let iterations = 0;
    while (variations.size < count && iterations < count * 10) {
        let variation = baseMessage;
        variation = variation.replace(spintaxRegex, (match) => {
            const options = match.slice(1, -1).split("|");
            return options[Math.floor(Math.random() * options.length)];
        });
        variations.add(variation);
        iterations++;
    }
    return Array.from(variations);
}

function testSpintax() {
    console.log('--- TESTING SPINTAX ENGINE (JS) ---');
    const template = '{Hola|Saludos|Buen día} {amigos|grupo}, {mira este|te presento este} {auto|vehículo} {increíble|espectacular}.';
    const variations = generateSpintaxVariations(template, 5);
    console.log('Variaciones generadas:');
    variations.forEach((v, i) => console.log(`${i + 1}: ${v}`));
    if (variations.length > 1 && variations[0] !== variations[1]) {
        console.log('✅ Spintax Variations OK');
    } else {
        console.log('❌ Spintax failed');
    }
}
testSpintax();
