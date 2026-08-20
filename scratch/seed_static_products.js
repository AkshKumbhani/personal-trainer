const fs = require('fs');
const path = require('path');
const db = require('../backend/config/db');

const sources = [
    'gym-equipment.html',
    'treadmills.html',
    'protein-powder.html'
];

const text = (value) => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const match = (source, expression) => {
    const result = source.match(expression);
    return result ? text(result[1]) : '';
};

async function seedProducts() {
    let added = 0;

    for (const source of sources) {
        const html = fs.readFileSync(path.join(__dirname, '..', 'public', source), 'utf8');
        const category = match(html, /id="dynamicProductGrid"\s+data-category="([^"]+)"/i);
        const gridStart = html.indexOf('id="dynamicProductGrid"');
        const gridEnd = html.indexOf('</section>', gridStart);
        const cards = html.slice(gridStart, gridEnd).split(/<!--\s*CARD\s+\d+\s*-->/i).slice(1);

        for (const card of cards) {
            const name = match(card, /<h5>([\s\S]*?)<\/h5>/i);
            const description = match(card, /<p>([\s\S]*?)<\/p>/i);
            const imageMatch = card.match(/<img\b[^>]*\bsrc\s*=\s*["']?([^"'\s>]+)/i);
            const priceMatch = card.match(/Rs\.\s*([\d,.]+)\s*INR/i);

            if (!name || !imageMatch || !priceMatch) continue;

            const imageUrl = imageMatch[1].startsWith('//') ? `https:${imageMatch[1]}` : imageMatch[1];
            const price = Number(priceMatch[1].replace(/,/g, ''));
            const [result] = await db.execute(
                `INSERT INTO products (name, price, category, image_url, description)
                 SELECT ?, ?, ?, ?, ?
                 WHERE NOT EXISTS (
                     SELECT 1 FROM products WHERE name = ? AND category = ?
                 )`,
                [name, price, category, imageUrl, description, name, category]
            );
            added += result.affectedRows;
        }
    }

    console.log(`Product import complete: ${added} product(s) added.`);
}

seedProducts()
    .catch((error) => {
        console.error('Product import failed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => db.end());
