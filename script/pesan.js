document.addEventListener("DOMContentLoaded", () => {
  const produkEl = document.getElementById("produk");
  const hargaEl = document.getElementById("harga");
  const jumlahEl = document.getElementById("jumlah");
  const totalEl = document.getElementById("total");
  const formEl = document.getElementById("orderForm");
  const summaryTextEl = document.getElementById("summaryText");
  const toastEl = document.getElementById("toast");
  const qtyMinusEl = document.getElementById("qtyMinus");
  const qtyPlusEl = document.getElementById("qtyPlus");

  const sProdukEl = document.getElementById("sProduk");
  const sHargaEl = document.getElementById("sHarga");
  const sJumlahEl = document.getElementById("sJumlah");
  const sSubtotalEl = document.getElementById("sSubtotal");
  const sFeeEl = document.getElementById("sFee");
  const sGrandTotalEl = document.getElementById("sGrandTotal");

  const requiredElements = [
    produkEl,
    hargaEl,
    jumlahEl,
    totalEl,
    formEl,
    summaryTextEl,
    toastEl,
    qtyMinusEl,
    qtyPlusEl,
    sProdukEl,
    sHargaEl,
    sJumlahEl,
    sSubtotalEl,
    sFeeEl,
    sGrandTotalEl,
  ];

  if (requiredElements.some((el) => !el)) {
    console.error("Form initialization failed: ada elemen HTML yang tidak ditemukan.");
    return;
  }

  const SERVICE_FEE = 12000;

  function parseMoney(value) {
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) : 0;
  }

  function formatRupiah(num) {
    return new Intl.NumberFormat("id-ID").format(Number(num || 0));
  }

  function rupiahText(num) {
    return `Rp ${formatRupiah(num)}`;
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 1800);
  }

  function getSelectedProductName() {
    return produkEl.options[produkEl.selectedIndex]?.dataset.name || "-";
  }

  function updateSummary() {
    const harga = parseMoney(produkEl.value);
    const jumlah = Math.max(1, parseMoney(jumlahEl.value) || 1);
    const subtotal = harga * jumlah;
    const grandTotal = subtotal + (subtotal > 0 ? SERVICE_FEE : 0);

    const productName = getSelectedProductName();

    sProdukEl.textContent = productName;
    sHargaEl.textContent = rupiahText(harga);
    sJumlahEl.textContent = String(jumlah);
    sSubtotalEl.textContent = rupiahText(subtotal);
    sFeeEl.textContent = rupiahText(subtotal > 0 ? SERVICE_FEE : 0);
    sGrandTotalEl.textContent = rupiahText(grandTotal);

    summaryTextEl.textContent = subtotal
      ? `${productName} × ${jumlah} siap diproses. Pastikan data penerima sudah benar.`
      : "Silakan pilih produk untuk melihat ringkasan pesanan.";
  }

  function hitungTotal() {
    const harga = parseMoney(produkEl.value);
    const jumlah = Math.max(1, parseMoney(jumlahEl.value) || 1);
    jumlahEl.value = String(jumlah);
    const total = harga * jumlah;
    totalEl.value = total ? formatRupiah(total) : "";
    updateSummary();
  }

  function setHarga() {
    const harga = parseMoney(produkEl.value);
    hargaEl.value = harga ? formatRupiah(harga) : "";
    hitungTotal();
  }

  function changeQty(delta) {
    const qty = Math.max(1, (parseMoney(jumlahEl.value) || 1) + delta);
    jumlahEl.value = String(qty);
    hitungTotal();
  }

  function normalizeText(value) {
    return value
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function initFromQuery() {
    const url = new URL(window.location.href);
    const selectedProductRaw = url.searchParams.get("produk") || "";
    const selectedProduct = normalizeText(selectedProductRaw);

    if (!selectedProduct) return;

    const optionToSelect = Array.from(produkEl.options).find((opt) => {
      const name = normalizeText(opt.dataset.name || "");
      return name === selectedProduct || name.includes(selectedProduct);
    });

    if (optionToSelect) {
      produkEl.value = optionToSelect.value;
      setHarga();
      showToast(`Produk dipilih: ${optionToSelect.dataset.name}`);
    }
  }

  function validatePhone(phone) {
    return /^08\d{8,12}$/.test(phone);
  }

  function encodeOrderData(orderData) {
    const json = JSON.stringify(orderData);
    return encodeURIComponent(json);
  }

  produkEl.addEventListener("change", setHarga);
  produkEl.addEventListener("input", setHarga);
  jumlahEl.addEventListener("input", hitungTotal);
  jumlahEl.addEventListener("change", hitungTotal);
  qtyMinusEl.addEventListener("click", () => changeQty(-1));
  qtyPlusEl.addEventListener("click", () => changeQty(1));

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama")?.value.trim() || "";
    const nohp = document.getElementById("nohp")?.value.trim() || "";
    const alamat = document.getElementById("alamat")?.value.trim() || "";

    if (!produkEl.value) {
      showToast("Silakan pilih produk terlebih dahulu.");
      return;
    }

    if (!nama || !alamat) {
      showToast("Nama dan alamat wajib diisi.");
      return;
    }

    if (!validatePhone(nohp)) {
      showToast("Format No HP tidak valid. Gunakan 08xxxxxxxx.");
      return;
    }

    const unitPrice = parseMoney(produkEl.value);
    const qty = Math.max(1, parseMoney(jumlahEl.value) || 1);
    const subtotal = unitPrice * qty;
    const fee = subtotal > 0 ? SERVICE_FEE : 0;
    const grandTotal = subtotal + fee;

    const invoiceId = `INV-RLM-${Date.now().toString().slice(-6)}`;
    const date = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    const orderData = {
      invoiceId,
      date,
      productName: getSelectedProductName(),
      unitPrice,
      qty,
      subtotal,
      fee,
      grandTotal,
      nama,
      nohp,
      alamat,
    };

    try {
      localStorage.setItem("realmeOrder", JSON.stringify(orderData));
      sessionStorage.setItem("realmeOrder", JSON.stringify(orderData));
    } catch {
  
    }

    const payload = encodeOrderData(orderData);

    showToast("Pesanan berhasil! Mengalihkan ke invoice...");
    setTimeout(() => {
      window.location.href = `./Invoice.html?data=${payload}`;
    }, 650);
  });

  initFromQuery();
  setHarga();
  updateSummary();
});