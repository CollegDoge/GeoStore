// !!! depends on store.js (createProductCard) being loaded first

function getSearchTokens() {
    const query = new URLSearchParams(location.search).get('q') || '';
    return query.toLowerCase().trim().split(/\s+/).filter(Boolean);
}
 
function productMatchesTokens(product, tokens) {
    const haystacks = [product.collection, product.type, product.name].map((s) => s.toLowerCase());
    return tokens.every((token) => haystacks.some((field) => field.includes(token)));
}
 
document.addEventListener('DOMContentLoaded', async () => {
    const resultsContainer = document.querySelector('[data-search-results]');
    if (!resultsContainer) return;
 
    const query = new URLSearchParams(location.search).get('q') || '';
    const tokens = getSearchTokens();
 
    try {
        const res = await fetch('/assets/database/products.json');
        if (!res.ok) throw new Error(`Failed to load products.json: ${res.status}`);
        const data = await res.json();
        const matches = tokens.length ? data.products.filter((p) => productMatchesTokens(p, tokens)) : [];
 
        resultsContainer.querySelectorAll('.product').forEach((el) => el.remove());
        const buttons = resultsContainer.querySelector('.product-buttons');
        matches.forEach((product) => {
            resultsContainer.insertBefore(createProductCard(product), buttons);
        });
        initRowScroll(resultsContainer);
 
        const noResultsEl = document.getElementById('noResults');
        if (noResultsEl) noResultsEl.style.display = matches.length === 0 ? 'block' : 'none';
 
        document.dispatchEvent(new CustomEvent('searchResultsRendered', {
            detail: { query, count: matches.length },
        }));
    } catch (err) {
        console.error('Search failed:', err);
    }
});