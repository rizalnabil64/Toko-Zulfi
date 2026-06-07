document.addEventListener("DOMContentLoaded", () => {
  const toastEl = document.getElementById("toast");
  const downloadBtn = document.getElementById("downloadBtn");

  const invIdEl = document.getElementById("invId");
  const invDateEl = document.getElementById("invDate");
  const pNameEl = document.getElementById("pName");
  const pPriceEl = document.getElementById("pPrice");
  const pQtyEl = document.getElementById("pQty");
  const pSubEl = document.getElementById("pSub");
  const tSubEl = document.getElementById("tSub");
  const tFeeEl = document.getElementById("tFee");
  const tGrandEl = document.getElementById("tGrand");
  const cNamaEl = document.getElementById("cNama");
  const cHpEl = document.getElementById("cHp");
  const cAlamatEl = document.getElementById("cAlamat");
  const thanksMessageEl = document.getElementById("thanksMessage");

  const required = [
    toastEl,
    downloadBtn,
    invIdEl,
    invDateEl,
    pNameEl,
    pPriceEl,
    pQtyEl,
    pSubEl,
    tSubEl,
    tFeeEl,
    tGrandEl,
    cNamaEl,
    cHpEl,
    cAlamatEl,
    thanksMessageEl,
  ];

  if (required.some((el) => !el)) return;

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

  function getOrder() {
    try {
      const raw = localStorage.getItem("realmeOrder");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  const order = getOrder();

  if (!order) {
    thanksMessageEl.textContent =
      "Data pesanan tidak ditemukan. Silakan lakukan pemesanan terlebih dahulu.";
    showToast("Data invoice tidak ditemukan");
    return;
  }

  invIdEl.textContent = order.invoiceId || "-";
  invDateEl.textContent = order.date || "-";
  pNameEl.textContent = order.productName || "-";
  pPriceEl.textContent = rupiahText(order.unitPrice || 0);
  pQtyEl.textContent = String(order.qty || 1);
  pSubEl.textContent = rupiahText(order.subtotal || 0);
  tSubEl.textContent = rupiahText(order.subtotal || 0);
  tFeeEl.textContent = rupiahText(order.fee || 0);
  tGrandEl.textContent = rupiahText(order.grandTotal || 0);
  cNamaEl.textContent = order.nama || "-";
  cHpEl.textContent = order.nohp || "-";
  cAlamatEl.textContent = order.alamat || "-";

  thanksMessageEl.textContent = `Terima kasih ${order.nama || "Pelanggan"}! Pesanan ${
    order.productName || "produk"
  } sedang kami proses. Kami senang Anda berbelanja bersama kami.`;

  downloadBtn.addEventListener("click", () => {
    window.print();
    showToast("Invoice siap diunduh / dicetak");
  });

  setTimeout(() => {
    showToast("Terimakasih telah Berbelanja di TOKO ZULFI 💖");
  }, 400);
});
