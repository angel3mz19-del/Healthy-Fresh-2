/* ============================================================
   HEALTHY & FRESH — Salads Bar & Baguettes Xalapa
   app.js — lógica compartida entre index.html y menu.html
   (header, navegación, animaciones, carrito y pedido WhatsApp)
   ============================================================ */
"use strict";

const WSP_NUMERO = "522282787878";

/* ============================================================
   HELPERS
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const dinero = (n) => `$${n}`;

function toast(msg) {
  const el = $("#toast");
  if (!el) return; // la página del menú no tiene toast: la barra de pedido es el indicador
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2600);
}

function bumpBadge() {
  const badge = $("#cartBadge");
  badge.classList.remove("bump");
  void badge.offsetWidth; // reinicia la animación
  badge.classList.add("bump");
}

/* ============================================================
   HEADER + NAV MÓVIL
   ============================================================ */
const header = $("#header");
const nav = $("#nav");
const btnBurger = $("#btnBurger");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

btnBurger.addEventListener("click", () => {
  const abierto = nav.classList.toggle("open");
  btnBurger.classList.toggle("open", abierto);
});

$$(".nav-link").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    btnBurger.classList.remove("open");
  })
);

/* Resalta el link activo según la sección visible.
   Solo aplica a links de ancla de la misma página (#seccion)
   o con data-seccion explícito. */
const secciones = $$("section[id]");
const linksPorId = {};
$$(".nav-link").forEach((l) => {
  const href = l.getAttribute("href");
  const id = l.dataset.seccion || (href.startsWith("#") ? href.slice(1) : null);
  if (id) linksPorId[id] = l;
});

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && linksPorId[e.target.id]) {
        $$(".nav-link").forEach((l) => l.classList.remove("active"));
        linksPorId[e.target.id].classList.add("active");
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
secciones.forEach((s) => navObserver.observe(s));

/* ============================================================
   REVEAL AL HACER SCROLL + CONTADORES
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
$$(".reveal").forEach((el) => revealObserver.observe(el));

function animarContador(el) {
  const fin = parseInt(el.dataset.count, 10);
  const dur = 1200;
  const inicio = performance.now();
  function paso(t) {
    const p = Math.min((t - inicio) / dur, 1);
    el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animarContador(e.target);
        statObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.6 }
);
$$(".stat-num").forEach((el) => statObserver.observe(el));

/* ============================================================
   TICKER (solo existe en index; duplica el contenido para loop)
   ============================================================ */
const tickerTrack = $("#tickerTrack");
if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;

/* ============================================================
   CARRITO
   ============================================================ */
let carrito = [];
try {
  carrito = JSON.parse(localStorage.getItem("hf_carrito")) || [];
} catch { carrito = []; }

const cartDrawer  = $("#cartDrawer");
const cartOverlay = $("#cartOverlay");

function guardarCarrito() {
  localStorage.setItem("hf_carrito", JSON.stringify(carrito));
}

function agregarAlCarrito({ nombre, detalles, precio, unico = false }) {
  // Los productos simples idénticos se agrupan; los personalizados no.
  const existente = !unico && carrito.find((i) => i.nombre === nombre && i.precio === precio);
  if (existente) existente.qty += 1;
  else carrito.push({ id: Date.now() + Math.random(), nombre, detalles, precio, qty: 1 });
  guardarCarrito();
  pintarCarrito();
  bumpBadge();
}

function totalCarrito() {
  return carrito.reduce((sum, i) => sum + i.precio * i.qty, 0);
}

function pintarCarrito() {
  const badge = $("#cartBadge");
  const unidades = carrito.reduce((s, i) => s + i.qty, 0);
  badge.hidden = unidades === 0;
  badge.textContent = unidades;

  const cont = $("#cartItems");
  const vacio = carrito.length === 0;
  $("#cartEmpty").hidden = !vacio;
  $("#cartFoot").hidden = vacio;

  cont.innerHTML = carrito
    .map(
      (i) => `
    <div class="cart-item" data-id="${i.id}">
      <div class="cart-item-top">
        <span class="cart-item-name">${i.nombre}</span>
        <span class="cart-item-price">${dinero(i.precio * i.qty)}</span>
      </div>
      ${i.detalles.length ? `<div class="cart-item-details">${i.detalles.map((d) => `<div>${d}</div>`).join("")}</div>` : ""}
      <div class="cart-item-foot">
        <span class="qty-ctrl">
          <button class="qty-btn" data-accion="menos" type="button" aria-label="Quitar uno">−</button>
          <span class="qty-num">${i.qty}</span>
          <button class="qty-btn" data-accion="mas" type="button" aria-label="Agregar uno">+</button>
        </span>
        <button class="cart-item-remove" data-accion="quitar" type="button">Quitar</button>
      </div>
    </div>`
    )
    .join("");

  $("#cartTotal").textContent = dinero(totalCarrito());
  $("#checkoutTotal").textContent = dinero(totalCarrito());

  /* Barra de pedido fija (solo existe en menu.html):
     visible únicamente con productos en el carrito */
  const cartBar = $("#cartBar");
  if (cartBar) {
    cartBar.classList.toggle("show", unidades > 0);
    document.body.classList.toggle("con-cart-bar", unidades > 0);
    $("#cartBarCount").textContent = `${unidades} artículo${unidades === 1 ? "" : "s"}`;
    $("#cartBarTotal").textContent = dinero(totalCarrito());
  }
}

$("#cartItems").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-accion]");
  if (!btn) return;
  const id = +btn.closest(".cart-item").dataset.id || btn.closest(".cart-item").dataset.id;
  const item = carrito.find((i) => String(i.id) === String(id));
  if (!item) return;
  const accion = btn.dataset.accion;
  if (accion === "mas") item.qty += 1;
  if (accion === "menos") item.qty -= 1;
  if (accion === "quitar" || item.qty <= 0) carrito = carrito.filter((i) => i !== item);
  guardarCarrito();
  pintarCarrito();
});

/* Abrir / cerrar drawer */
function abrirCarrito() {
  mostrarVistaCarrito();
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}
function cerrarCarrito() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}
function mostrarVistaCarrito() {
  $("#cartViewItems").hidden = false;
  $("#cartViewCheckout").hidden = true;
}

$("#btnCart").addEventListener("click", abrirCarrito);
$("#cartClose").addEventListener("click", cerrarCarrito);
cartOverlay.addEventListener("click", cerrarCarrito);
$("#btnGoMenu").addEventListener("click", () => {
  // En la página del menú lleva a la sección; en index navega a menu.html
  if ($("#menuTabs")) {
    cerrarCarrito();
    $("#menu").scrollIntoView({ behavior: "smooth" });
  } else {
    window.location.href = "menu.html";
  }
});

/* Checkout */
$("#btnCheckout").addEventListener("click", () => {
  $("#cartViewItems").hidden = true;
  $("#cartViewCheckout").hidden = false;
});
$("#btnBackCart").addEventListener("click", mostrarVistaCarrito);

/* Mostrar campo dirección solo si es a domicilio */
$$('input[name="entrega"]').forEach((radio) =>
  radio.addEventListener("change", () => {
    const domicilio = $('input[name="entrega"]:checked').value === "domicilio";
    $("#direccionField").hidden = !domicilio;
    $("#fDireccion").required = domicilio;
  })
);

/* Envío por WhatsApp */
$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (carrito.length === 0) { toast("Tu carrito está vacío 🛒"); return; }

  const nombre    = $("#fNombre").value.trim();
  const telefono  = $("#fTelefono").value.replace(/\D/g, "");
  const entrega   = $('input[name="entrega"]:checked').value;
  const direccion = $("#fDireccion").value.trim();
  const notas     = $("#fNotas").value.trim();

  let valido = true;
  $("#fNombre").classList.toggle("error", !nombre);
  if (!nombre) valido = false;
  const telOk = telefono.length === 10;
  $("#fTelefono").classList.toggle("error", !telOk);
  if (!telOk) valido = false;
  const dirOk = entrega !== "domicilio" || direccion.length > 0;
  $("#fDireccion").classList.toggle("error", !dirOk);
  if (!dirOk) valido = false;
  if (!valido) { toast("Revisa los campos marcados ✏️"); return; }

  const lineas = [];
  lineas.push("Pedido - Healthy & Fresh");
  lineas.push("");
  lineas.push(`Nombre: ${nombre}`);
  lineas.push(`Teléfono: ${telefono}`);
  lineas.push(`Entrega: ${entrega === "domicilio" ? `A domicilio: ${direccion}` : "Recoger en tienda"}`);
  lineas.push("");
  lineas.push("PRODUCTOS:");
  carrito.forEach((i) => {
    const cant = i.qty > 1 ? `${i.qty}x ` : "";
    lineas.push(`- ${cant}${i.nombre}`);
    i.detalles.forEach((d) => lineas.push(`  ${d}`));
    lineas.push(`  ${dinero(i.precio * i.qty)}`);
    lineas.push("");
  });
  lineas.push(`TOTAL: ${dinero(totalCarrito())}`);
  if (notas) {
    lineas.push("");
    lineas.push(`Notas: ${notas}`);
  }

  const url = `https://wa.me/${WSP_NUMERO}?text=${encodeURIComponent(lineas.join("\n"))}`;
  window.open(url, "_blank", "noopener");

  carrito = [];
  guardarCarrito();
  pintarCarrito();
  $("#checkoutForm").reset();
  $("#direccionField").hidden = true;
  mostrarVistaCarrito();
  cerrarCarrito();
  toast("💬 Pedido enviado. ¡Revisa WhatsApp!");
});

/* Cerrar con Escape */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarCarrito();
});

/* ============================================================
   BADGE ABIERTO/CERRADO (solo en index) + AÑO
   ============================================================ */
(function estadoHorario() {
  const badge = $("#openBadge");
  if (!badge) return;
  const ahora = new Date();
  const dia = ahora.getDay(); // 0 = domingo
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const abre = 8 * 60 + 30, cierra = 17 * 60;
  const abierto = dia !== 0 && minutos >= abre && minutos < cierra;
  badge.textContent = abierto ? "● Abierto ahora" : "● Cerrado en este momento";
  badge.classList.add(abierto ? "abierto" : "cerrado");
})();

$("#year").textContent = new Date().getFullYear();

/* Estado inicial */
pintarCarrito();
