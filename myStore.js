let allProducts = [];
const itemContainer = document.getElementById("itemContainer");
const loading = document.getElementById("loading");
const sellerNameEl = document.getElementById("sellerName");
const sellerLogoEl = document.getElementById("sellerLogo");

document.addEventListener("DOMContentLoaded", async () => {
  const sellerPhone = localStorage.getItem("sellerPhone");
  if (!sellerPhone) {
    loading.textContent = "⚠️ Seller not found!";
    return;
  }

  try {
    // ✅ Correct fetch
    const storeRes = await fetch(
      "https://5238f098-6b7a-4815-b792-a10ea88e4c13-00-54fclrw8sb5.pike.replit.dev/all-stores"
    );
    const allStores = await storeRes.json();

    // Seller Info
    const store = allStores.find((s) => s.phone === sellerPhone);
    if (store) {
      sellerNameEl.textContent = store.name || "DELIGHT.PK";
      sellerLogoEl.src = store.logo || "lo.png";
    }

    // ✅ Fetch seller products
    const res = await fetch(
      `https://5238f098-6b7a-4815-b792-a10ea88e4c13-00-54fclrw8sb5.pike.replit.dev/products/${sellerPhone}`
    );
    allProducts = await res.json();

    loading.style.display = "none";

    if (!allProducts.length) {
      itemContainer.innerHTML =
        "<p style='text-align:center;color:#777;'>No items found.</p>";
      return;
    }

    renderProducts(allProducts);
  } catch (err) {
    console.error(err);
    loading.textContent = "⚠️ Error loading products!";
  }
});

// Render Products with delete
function renderProducts(list) {
  itemContainer.innerHTML = "";

  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    const basePrice =
      parseInt(item.price?.replace(/[^\d]/g, "")) || 0;
    const discount =
      parseInt(item.discount?.toString().replace(/[^\d]/g, "")) || 0;
    const finalPrice = basePrice - discount;

    card.innerHTML = `
      <img src="${item.images?.[0] || 'default.jpg'}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p class="price-wrapper">
        ${
          discount > 0
            ? `<span class="new-price">Rs. <strong>${finalPrice}</strong></span><br>
               <span class="old-price" style="text-decoration: line-through; color: gray;">Rs. ${basePrice}</span>`
            : `<span class="new-price">Rs. <strong>${basePrice}</strong></span>`
        }
      </p>
      <button class="delete-btn">&times;</button>
    `;

    // Edit Item
    card
      .querySelector("img")
      .addEventListener("click", () => {
        localStorage.setItem("editItem", JSON.stringify(item));
        window.location.href = "ItemEdit.html";
      });

    card
      .querySelector("h3")
      .addEventListener("click", () => {
        localStorage.setItem("editItem", JSON.stringify(item));
        window.location.href = "ItemEdit.html";
      });

    card
      .querySelector(".price-wrapper")
      .addEventListener("click", () => {
        localStorage.setItem("editItem", JSON.stringify(item));
        window.location.href = "ItemEdit.html";
      });

    // Delete Item
    card
      .querySelector(".delete-btn")
      .addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm(`Delete "${item.title}"?`)) return;

        try {
          const res = await fetch(
            `https://5238f098-6b7a-4815-b792-a10ea88e4c13-00-54fclrw8sb5.pike.replit.dev/products/${item.id}`,
            { method: "DELETE" }
          );

          const data = await res.json();

          if (data.success) {
            allProducts = allProducts.filter(
              (p) => p.id !== item.id
            );
            renderProducts(allProducts);
            alert("✅ Product deleted");
          } else {
            alert("⚠️ " + (data.message || "Failed to delete"));
          }
        } catch (err) {
          console.error(err);
          alert("⚠️ Error deleting product");
        }
      });

    itemContainer.appendChild(card);
  });
}