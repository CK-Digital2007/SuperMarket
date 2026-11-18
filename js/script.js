"use strict";
const $ = (selector) => document.querySelector(selector);
const val = (selector) => ($(selector) || {}).value || "";
const inr = (number) => "₹" + number.toLocaleString("en-IN");
const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");
const disc = (product) => product.originalPrice > product.price
  ? Math.round((product.originalPrice - product.price) / product.originalPrice * 100)
  : 0;

const card = (product) => {
  const discount = disc(product);
  const url = "product-details.html?id=" + product.id;
  const name = escapeHtml(product.name);
  const brand = escapeHtml(product.brand);
  const category = escapeHtml(product.category);
  const size = escapeHtml(product.size);
  return `<article class="card">
    <a class="im" href="${url}" aria-label="${name}">
      <img src="${escapeHtml(product.image)}" alt="${name}" width="400" height="400" loading="lazy">
      ${discount ? `<span class="badge">${discount}% OFF</span>` : ""}
    </a>
    <div class="cb">
      <small>${brand} | ${category}</small>
      <h3>${name}</h3>
      <p class="sz">${size}</p>
      <p class="pr"><b>${inr(product.price)}</b>${discount ? ` <s>${inr(product.originalPrice)}</s>` : ""}</p>
      <a class="btn sm" href="${url}">View Details</a>
    </div>
  </article>`;
};

const catCard = (category) => `
  <a class="cc" href="category.html?c=${category.slug}">
    <img src="${category.image}" alt="${category.name}" width="600" height="400" loading="lazy">
    <span>${category.name}</span>
  </a>`;

function fill(id, html) {
  const element = $(id);
  if (element) element.innerHTML = html;
}

function catalogue(options) {
  const grid = $("#grid");
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const pageSize = 12;
  let page = 1;
  const categorySelect = $("#cat");

  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">All Products</option>' +
      CATEGORIES.map((category) => `<option>${category.name}</option>`).join("");
    categorySelect.value = params.get("c") || "";
  }
  if ($("#q")) $("#q").value = params.get("q") || "";

  function run() {
    const term = val("#q").trim().toLowerCase();
    const minimum = val("#min");
    const maximum = val("#max");
    const category = val("#cat");
    const sort = val("#sort");
    const filtered = PRODUCTS.filter((product) =>
      (!options.cat || product.category === options.cat) &&
      (!options.offers || disc(product) > 0) &&
      (!category || product.category === category) &&
      (!term || (product.name + " " + product.brand).toLowerCase().includes(term)) &&
      (minimum === "" || product.price >= Number(minimum)) &&
      (maximum === "" || product.price <= Number(maximum))
    );

    filtered.sort((first, second) =>
      sort === "pa" ? first.price - second.price :
      sort === "pd" ? second.price - first.price :
      sort === "nd" ? second.name.localeCompare(first.name) :
      first.name.localeCompare(second.name)
    );

    const shown = filtered.slice(0, page * pageSize);
    grid.innerHTML = shown.map(card).join("");

    const count = $("#count");
    const empty = $("#empty");
    const more = $("#more");
    if (count) count.textContent = `Showing ${shown.length} of ${filtered.length} products`;
    if (empty) empty.hidden = filtered.length > 0;
    if (more) more.hidden = shown.length >= filtered.length;
  }

  document.querySelectorAll(".tools input, .tools select").forEach((control) => {
    control.addEventListener("input", () => {
      page = 1;
      run();
    });
  });

  const more = $("#more");
  if (more) more.onclick = () => {
    page++;
    run();
  };

  const clear = $("#clear");
  if (clear) clear.onclick = () => {
    document.querySelectorAll(".tools input").forEach((control) => {
      control.value = "";
    });
    if (categorySelect) categorySelect.value = options.cat ? categorySelect.value : "";
    if ($("#sort")) $("#sort").value = "na";
    page = 1;
    run();
  };

  run();
}

document.addEventListener("DOMContentLoaded", () => {
  const menu = $("#menu");
  const menuButton = $("#navbtn");
  if (menu && menuButton) {
    const closeMenu = () => {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    };
    menuButton.onclick = () => {
      const isOpen = menu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    };
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);

  if (page === "home") {
    fill("#cats", CATEGORIES.map(catCard).join(""));
    fill("#feat", PRODUCTS.filter((product) => product.featured).slice(0, 8).map(card).join(""));
    fill("#offers", PRODUCTS.filter((product) => disc(product) > 0).slice(0, 4).map(card).join(""));
  }
  if (page === "products") catalogue({});
  if (page === "offers") catalogue({ offers: true });
  if (page === "category") {
    const category = CATEGORIES.find((item) => item.slug === params.get("c"));
    if (!category) {
      const categoryList = $("#catlist");
      if (categoryList) categoryList.hidden = false;
      fill("#cats", CATEGORIES.map(catCard).join(""));
    } else {
      const listing = $("#listing");
      if (listing) listing.hidden = false;
      if ($("#ct")) $("#ct").textContent = category.name;
      if ($("#cd")) $("#cd").textContent = category.description;
      document.title = category.name + " | Smart Mart (Demo)";
      catalogue({ cat: category.name });
    }
  }
  if (page === "details") {
    const product = PRODUCTS.find((item) => item.id === Number(params.get("id")));
    const detail = $("#detail");
    if (!detail) return;
    if (!product) {
      detail.innerHTML = '<p class="empty">Product not found. <a class="btn sm" href="products.html">Back to Products</a></p>';
      document.title = "Product Not Found | Smart Mart (Demo)";
    } else {
      document.title = product.name + " | Smart Mart (Demo)";
      const discount = disc(product);
      const category = CATEGORIES.find((item) => item.name === product.category);
      const name = escapeHtml(product.name);
      const brand = escapeHtml(product.brand);
      const size = escapeHtml(product.size);
      const description = escapeHtml(product.description);
      const categoryName = escapeHtml(product.category);
      const categoryLink = category
        ? `<a href="category.html?c=${escapeHtml(category.slug)}">${categoryName}</a>`
        : categoryName;
      detail.innerHTML = `
        <img src="${escapeHtml(product.image)}" alt="${name}" width="400" height="400">
        <div>
          <h1>${name}</h1>
          <p>Brand: ${brand}</p>
          <p>Pack size: ${size}</p>
          <p class="pr big">
            <b>${inr(product.price)}</b>
            ${discount ? ` <s>${inr(product.originalPrice)}</s> <span class="badge st">${discount}% OFF</span>` : ""}
          </p>
          <p>${description}</p>
          <p>Category: ${categoryLink}</p>
          ${product.stock ? `<p>Availability: ${escapeHtml(product.stock)}</p>` : ""}
          <a class="btn" href="products.html">Back to Products</a>
        </div>`;
    }
  }
});
