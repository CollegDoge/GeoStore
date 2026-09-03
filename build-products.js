// generates product pages from products.json
// run with: node build-products.js

const fs = require('fs');
const path = require('path');

// CONFIG
const PRODUCTS_JSON_PATH = path.join(__dirname, 'assets/database/products.json');
const TEMPLATE_PATH = path.join(__dirname, 'templates/product.html');
const OUTPUT_DIR = path.join(__dirname, 'product');

// PER-TYPE SIZE OPTIONS
const CLOTHING_SIZE_OPTIONS = [
    { value: 'xsmall', label: 'Extra Small (XS)' },
    { value: 'small', label: 'Small (S)' },
    { value: 'medium', label: 'Medium (M)' },
    { value: 'large', label: 'Large (L)' },
    { value: 'xlarge', label: 'Extra Large (XL)' },
    { value: 'xxlarge', label: 'Extra Extra Large (XXL)' },
];
const SOCK_SIZE_OPTIONS = [
    { value: 'small', label: 'Small (S)' },
    { value: 'medium', label: 'Medium (M)' },
    { value: 'large', label: 'Large (L)' },
];
const MUG_SIZE_OPTIONS = [
    { value: 'medium', label: 'Medium (M)' },
    { value: 'large', label: 'Large (L)' },
];

// BUILD MEASUREMENT TABLE (HTML)
function buildMeasurementTable(rows, footnote) {
    const trs = [];
    for (let i = 0; i < rows.length; i += 2) {
        const cells = [rows[i]];
        if (rows[i + 1]) cells.push(rows[i + 1]);
        trs.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`);
    }
    trs.push(`<tr><th>${footnote}</th></tr>`);

    return `<div class="productpage-sizing">
                    <div class="productpage-item-head">
                        <h2>Sizing</h2>
                    </div>
                    <table>
                        ${trs.join('\n')}
                    </table>
                </div>`;
}

const CLOTHING_SIZING_SECTION = buildMeasurementTable(
    ['XS: 30cm - 24.5cm', 'S: 32cm - 25.5cm', 'M: 34cm - 26.5cm', 'L:  36cm - 27.5cm', 'XL: 38cm - 28.5cm', 'XXL: 40cm - 29.5cm'],
    '(length - chest)'
);
const SOCK_SIZING_SECTION = buildMeasurementTable(
    ['S: ~21-23cm', 'M: 23.5-25.5cm', 'L: 26-28cm'],
    '(estimated fitted length)'
);
const MUG_SIZING_SECTION = buildMeasurementTable(
    ['M: 8.2cm - 8cm', 'L: 9.6cm - 8.5cm'],
    '(height - diameter)'
);

const STICKER_SIZING_SECTION = `<div class="productpage-sizing">
                    <div class="productpage-item-head">
                        <h2>Sizing</h2>
                    </div>
                    <p>Approx. 7.5cm width, 7.5cm - 10cm height (varies by design).</p>
                </div>`;

const TYPE_CONFIG = {
    shirt: { sizeOptions: CLOTHING_SIZE_OPTIONS, sizingSection: CLOTHING_SIZING_SECTION },
    hoodie: { sizeOptions: CLOTHING_SIZE_OPTIONS, sizingSection: CLOTHING_SIZING_SECTION },
    sock: { sizeOptions: SOCK_SIZE_OPTIONS, sizingSection: SOCK_SIZING_SECTION },
    mug: { sizeOptions: MUG_SIZE_OPTIONS, sizingSection: MUG_SIZING_SECTION },
    sticker: { sizeOptions: null, sizingSection: STICKER_SIZING_SECTION },
};

const REGULAR_IMAGES_HTML = `<div class="productpage-images">
                    <div class="productpage-mainimg">
                        <img id='imgOv1'>
                    </div>
                    <div class="productpage-subimages">
                        <div class="productpage-subimg"><img id='imgOv2'></div>
                        <div class="productpage-subimg"></div>
                        <div class="productpage-subimg">
                            <img id="imgDim">
                        </div>
                    </div>
                </div>`;

const STICKER_IMAGES_HTML = `<div class="productpage-images">
                    <div class="productpage-mainimg">
                        <img id='imgOv1'>
                    </div>
                    <div class="productpage-subimages">
                        <div class="productpage-subimg"><img id='imgOv2'></div>
                        <div class="productpage-subimg"><img id='imgOv3'></div>
                        <div class="productpage-subimg"><img id='imgOv4'></div>
                    </div>
                </div>`;

// HELPERS
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildBreadcrumb(product) {
    const typeLabel = capitalize(product.type) + 's';
    return `<a href="/store/by-product/${product.type}s/">${typeLabel}</a>
                /
                <a href="/store/collections/${product.collection}/">${product.collection}</a>`;
}

// BUILD SELECTION ROW (HTML)
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

    const config = TYPE_CONFIG[product.type];
    if (config && config.sizeOptions) {
        const options = config.sizeOptions
            .map((s) => `<option value="${s.value}">${s.label}</option>`)
            .join('\n                            ');
        selects.push(`<select class="product-select" id="productSize">
                            ${options}
                        </select>`);
    }

    if (selects.length === 0) return '';

    return `<div class="productpage-selection-row">
                        ${selects.join('\n                        ')}
                    </div>`;
}

function buildSizingSection(product) {
    const config = TYPE_CONFIG[product.type];
    return config ? config.sizingSection : '';
}

function buildImagesBlock(product) {
    return product.type === 'sticker' ? STICKER_IMAGES_HTML : REGULAR_IMAGES_HTML;
}

function formatPrice(product) {
    const effective = product.onSale ? product.price * 0.8 : product.price;
    return `$${effective.toFixed(2)}`;
}

// RENDER PRODUCT PAGE (HTML)
function renderProductPage(template, product, colorPalette) {
    const productDataScript = `<script>\n        const PRODUCT = ${JSON.stringify(product, null, 4)};\n    </script>`;

    return template
        .replaceAll('{{PRODUCT_NAME}}', product.name)
        .replaceAll('{{PRODUCT_DESCRIPTION}}', product.description)
        .replaceAll('{{PRODUCT_DATA_SCRIPT}}', productDataScript)
        .replaceAll('{{BREADCRUMB}}', buildBreadcrumb(product))
        .replaceAll('{{PRODUCT_IMAGES}}', buildImagesBlock(product))
        .replaceAll('{{SELECTION_ROW}}', buildSelectionRow(product, colorPalette))
        .replaceAll('{{PRICE}}', formatPrice(product))
        .replaceAll('{{STOCK_LABEL}}', product.inStock ? 'In Stock' : 'Out of Stock')
        .replaceAll('{{SIZING_SECTION}}', buildSizingSection(product));
}

// MAIN BUILD
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