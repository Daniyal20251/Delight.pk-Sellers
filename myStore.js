let allProducts = [];

// 🔹 Elements
const itemContainer = document.getElementById("itemContainer");
const loading = document.getElementById("loading");
const sellerNameEl = document.getElementById("sellerName");
const sellerLogoEl = document.getElementById("sellerLogo");

// 🔹 Search Elements
const searchInput = document.getElementById("searchInput");
const searchPanel = document.getElementById("searchPanel");
const recentList = document.getElementById("recentSearches");
const clearBtn = document.getElementById("clearHistoryBtn");
const page = location.pathname.split("/").pop();

// 🔹 Recent searches
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

// 🔹 Shuffle function (ONE TIME)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 🔹 Load data
document.addEventListener("DOMContentLoaded", async () => {
  const sellerPhone = localStorage.getItem("sellerPhone");

  if (!sellerPhone) {
    loading.textContent = "⚠️ Seller not found!";
    return;
  }

  try {
    // ✅ Fetch stores
    const storeRes = await fetch(
      "https://delight-backend--araindaniyalo2.replit.app/all-stores"
    );
    const allStores = await storeRes.json();

    const store = allStores.find((s) => s.phone === sellerPhone);
    if (store) {
      sellerNameEl.textContent = store.name || "DELIGHT.PK";
      sellerLogoEl.src = store.logo || "lo.png";
    }

    // ✅ Fetch products
    const res = await fetch(
      `https://delight-backend--araindaniyalo2.replit.app/products/${sellerPhone}`
    );
    allProducts = await res.json();

    loading.style.display = "none";

    if (!allProducts.length) {
      itemContainer.innerHTML =
        "<p style='text-align:center;color:#777;'>No items found.</p>";
      return;
    }

    // ✅ SHUFFLE ONCE
    allProducts = shuffleArray(allProducts);
    renderProducts(allProducts);

  } catch (err) {
    console.error(err);
    loading.textContent = "⚠️ Error loading products!";
  }
});

// 🔹 Render Products
function renderProducts(list) {
  itemContainer.innerHTML = "";

  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    const basePrice = parseInt(item.price?.replace(/[^\d]/g, "")) || 0;
    const discount = parseInt(item.discount?.toString().replace(/[^\d]/g, "")) || 0;
    const finalPrice = basePrice - discount;

    card.innerHTML = `
      <img src="${item.images?.[0] || 'default.jpg'}" alt="${item.title}">
      <h3>${item.title}</h3>

      <p class="price-wrapper">
        ${
          discount > 0
            ? `<span class="new-price">Rs. <strong>${finalPrice}</strong></span><br>
               <span class="old-price">Rs. ${basePrice}</span>`
            : `<span class="new-price">Rs. <strong>${basePrice}</strong></span>`
        }
      </p>

      <button class="delete-btn">&times;</button>
    `;

    // 🔹 Edit item
    card.querySelector("img").onclick =
    card.querySelector("h3").onclick =
    card.querySelector(".price-wrapper").onclick = () => {
      localStorage.setItem("editItem", JSON.stringify(item));
      window.location.href = "ItemEdit.html";
    };

    // 🔹 Delete item
    card.querySelector(".delete-btn").addEventListener("click", async (e) => {
      e.stopPropagation();

      if (!confirm(`Delete "${item.title}"?`)) return;

      try {
        const res = await fetch(
          `https://delight-backend--araindaniyalo2.replit.app/products/${item.id}`,
          { method: "DELETE" }
        );

        const data = await res.json();

        if (data.success) {
          allProducts = allProducts.filter(p => p.id !== item.id);
          renderProducts(allProducts);
          alert("✅ Product deleted");
        } else {
          alert("⚠️ Failed to delete");
        }
      } catch (err) {
        console.error(err);
        alert("⚠️ Error deleting product");
      }
    });

    itemContainer.appendChild(card);
  });
}

// 🔹 Recent Searches
function renderRecentSearches() {
  recentList.innerHTML = "";

  if (recentSearches.length === 0) {
    recentList.innerHTML = "<li style='color:#999;'>No recent searches</li>";
    return;
  }

  recentSearches.forEach(term => {
    const li = document.createElement("li");
    li.textContent = term;
    li.onclick = () => fillAndSearch(term);
    recentList.appendChild(li);
  });
}

// 🔹 Search panel open
searchInput.addEventListener("focus", () => {
  renderRecentSearches();
  searchPanel.classList.add("active");
});

// 🔹 Click outside to close
document.addEventListener("click", (e) => {
  if (!searchPanel.contains(e.target) && e.target !== searchInput) {
    searchPanel.classList.remove("active");
  }
});

// 🔹 Enter key press
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchItems();
  }
});

// 🔹 Search function
function searchItems() {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) return;

  if (!recentSearches.includes(term)) {
    recentSearches.unshift(term);
    if (recentSearches.length > 6) recentSearches.pop();
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }

  renderRecentSearches();
  filterProducts(term);
  searchPanel.classList.remove("active");
}

// 🔹 Filter Products
function filterProducts(term) {
  const matched = allProducts.filter(p =>
    p.title.toLowerCase().includes(term)
  );

  if (!matched.length) {
    itemContainer.innerHTML = `
      <div class="not-found" style="margin:140px 0 0 40px;">
        <img src="Delight icons/not-found.png">
        <h3 style="color:#fe7004;">Oops! Item Not Found.</h3>
        <p>Try searching with a different keyword.</p>
      </div>`;
    return;
  }

  renderProducts(matched);
}

// 🔹 Fill search input & search
function fillAndSearch(term) {
  searchInput.value = term;
  searchItems();
}

// 🔹 Clear recent history
clearBtn.addEventListener("click", () => {
  localStorage.removeItem("recentSearches");
  recentSearches = [];
  renderRecentSearches();
});

  if(page === "myStore.html") {
    document.getElementById("nav-store")?.classList.add("active");
  }
  if(page === "sellerOrders.html") {
    document.getElementById("nav-orders")?.classList.add("active");
  }
  if(page === "SellerProfile.html") {
    document.getElementById("nav-profile")?.classList.add("active");
  }