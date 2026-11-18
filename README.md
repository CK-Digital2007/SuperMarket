# Smart Mart – Demo Supermarket Catalogue
Catalogue-only site (no cart, checkout, payments or accounts). Demo data; fictional brand by CK Digital Solutions. Plain HTML/CSS/JS.

## Run
Open `index.html`, or `python3 -m http.server` in this folder.

## Deploy
GitHub: push the folder. Netlify: drag the folder to app.netlify.com/drop, or connect the repo (no build command, publish directory `.`). All pages are static; product and category pages use `?id=` / `?c=` query strings, which work on Netlify.

## Update products (`js/products.js`)
- Add: copy a line in `PRODUCTS`, give it a new unique `id`.
- Remove: delete its line.
- Price: edit `price`. Discount: set `originalPrice` higher than `price` and `offer: true`; remove it by setting `originalPrice` equal to `price` and `offer: false`.
- Image: put a file in `assets/images/products/` and change `image`.
- Category: set `category` to an exact name in `CATEGORIES`. Featured: `featured: true/false`.
- Optional: add `stock: "In stock"` to show availability on the details page (only when real stock data exists).
- Add a category: add an entry to `CATEGORIES` (unique `slug`, `name`, `image`, `description`).

## Notes
Images are SVG placeholders (logo is `logo.svg`, not PNG). Replace shop details marked "to be supplied by the shop owner".
