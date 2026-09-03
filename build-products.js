const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON_PATH = path.join(__dirname, 'assets/database/products.json');
const TEMPLATE_PATH = path.join(__dirname, 'templates/product.html');
const OUTPUT_DIR = path.join(__dirname, 'product');

const TYPE_CONFIG = {
    shirt: { hasSize: true },
    hoodie: { hasSize: true },
    sock: { hasSize: true },
    mug: { hasSize: false },
    sticker: { hasSize: false },
};

const SIZE_OPTIONS = [
    { value: 'xsmall', label: 'Extra Small (XS)' },
    { value: 'small', label: 'Small (S)' },
    { value: 'medium', label: 'Medium (M)' },
    { value: 'large', label: 'Large (L)' },
    { value: 'xlarge', label: 'Extra Large (XL)' },
    { value: 'xxlarge', label: 'Extra Extra Large (XXL)' },
];

const SIZING_SECTION_HTML = `<div class="productpage-sizing">
                    <div class="productpage-item-head">
                        <h2>Sizing</h2>
                    </div>
                    <table>
                        <tr>
                            <td>XS: 30cm - 24.5cm</td>
                            <td>S: 32cm - 25.5cm</td>
                        </tr>
                        <tr>
                            <td>M: 34cm - 26.5cm</td>
                            <td>L:  36cm - 27.5cm</td>
                        </tr>
                        <tr>
                            <td>XL: 38cm - 28.5cm</td>
                            <td>XXL: 40cm - 29.5cm</td>
                        </tr>
                        <tr>
                            <th>(length - chest)</th>
                        </tr>
                    </table>
                </div>`;

// HELPERS
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildBreadcrumb(product) {
    const typeLabel = capitalize(product.type) + 's'; // shirt -> Shirts, sock -> Socks, etc.
    return `<a href="/store/by-product/${product.type}s/">${typeLabel}</a>
                /
                <a href="/store/collections/${product.collection}/">${product.collection}</a>`;
}

function buildSelectionRow(product, colorPalette) {
    const selects = [];

    if (product.colors > 0) {
        const options = colorPalette
            .slice(0, product.colors)
            .map((c) => `<option value="${c.code}">${c.label}</option>`)
            .join('\n                            ');
        selects.push(`<select class="product-select" id="productCol">
                            ${options}
                        </select>`);
    }

    if (TYPE_CONFIG[product.type] && TYPE_CONFIG[product.type].hasSize) {
        const options = SIZE_OPTIONS
            .map((s) => `<option value="${s.value}">${s.label}</option>`)
            .join('\n                            ');
        selects.push(`<select class="product-select" id="productSize">
                            ${options}
                        </select>`);
    }

    if (selects.length === 0) return ''; // no selectors needed at all

    return `<div class="productpage-selection-row">
                        ${selects.join('\n                        ')}
                    </div>`;
}

function buildSizingSection(product) {
    const config = TYPE_CONFIG[product.type];
    return config && config.hasSize ? SIZING_SECTION_HTML : '';
}

function formatPrice(product) {
    const effective = product.onSale ? product.price * 0.8 : product.price;
    return `$${effective.toFixed(2)}`;
}

function renderProductPage(template, product, colorPalette) {
    const productDataScript = `<script>\n        const PRODUCT = ${JSON.stringify(product, null, 4)};\n    </script>`;

    return template
        .replaceAll('{{PRODUCT_NAME}}', product.name)
        .replaceAll('{{PRODUCT_DESCRIPTION}}', product.description)
        .replaceAll('{{PRODUCT_DATA_SCRIPT}}', productDataScript)
        .replaceAll('{{BREADCRUMB}}', buildBreadcrumb(product))
        .replaceAll('{{SELECTION_ROW}}', buildSelectionRow(product, colorPalette))
        .replaceAll('{{PRICE}}', formatPrice(product))
        .replaceAll('{{STOCK_LABEL}}', product.inStock ? 'In Stock' : 'Out of Stock')
        .replaceAll('{{SIZING_SECTION}}', buildSizingSection(product));
}

// MAIN
function build() {
    const { meta, products } = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8'));
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    let count = 0;
    for (const product of products) {
        const html = renderProductPage(template, product, meta.colorPalette);
        const outDir = path.join(OUTPUT_DIR, String(product.id));
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, 'index.html'), html);
        count++;
    }

    console.log(`Built ${count} product page(s) into ${OUTPUT_DIR}`);
}

build();
