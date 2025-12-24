import { generateSpintaxVariations } from '../app/lib/spintax-generator';

const template = "{Hola|Saludos|Buen día}, {miren esto|les presento|aquí tienen} una {gran oferta|oportunidad única|promoción especial}.";

console.log('--- Testing Spintax Reactor ---');
console.log('Template:', template);

const variations = generateSpintaxVariations(template, 5);
variations.forEach((v: string, i: number) => console.log(`${i + 1}: ${v}`));
