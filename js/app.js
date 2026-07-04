/* ============================================================
   HEALTHY & FRESH — Salads Bar & Baguettes Xalapa
   app.js
   ============================================================ */
"use strict";

/* ============================================================
   DATOS DEL MENÚ
   ============================================================ */

const WSP_NUMERO = "522282787878";

/* ⚠️ PRECIOS POR CONFIRMAR CON EL DUEÑO ⚠️
   El bowl de frutas y las limonadas no tienen precio en el menú
   original. Estos son provisionales — actualizar aquí cuando el
   dueño los confirme. */
const PRECIO_BOWL_FRUTAS = 75;   // ← POR CONFIRMAR
const PRECIO_LIMONADA    = 45;   // ← POR CONFIRMAR

const COMBOS_ENSALADA = [
  { id: "1p2i", prot: 1, ing: 2, precio: 90 },
  { id: "1p3i", prot: 1, ing: 3, precio: 105 },
  { id: "2p3i", prot: 2, ing: 3, precio: 115 },
  { id: "2p4i", prot: 2, ing: 4, precio: 125 },
];
const PRECIO_PROT_EXTRA = 30;
const PRECIO_ING_EXTRA  = 25;

const PROTEINAS = [
  "Pollo teriyaki", "Pollo a la plancha", "Pollo Crunch", "Pollo BBQ",
  "Pollo al cilantro", "Queso panela", "Jamón de pavo", "Huevo hervido",
  "Surimi", "Parmesano", "Manchego",
];

const ADEREZOS = [
  "Italiano", "Ranch", "Mil islas", "Chipotle Ranch",
  "César", "Mostaza dulce", "Vinagreta",
];

const INGREDIENTES = [
  "Brócoli", "Zanahoria", "Elote", "Tomate", "Grano de elote",
  "Champiñones", "Apio", "Arándanos", "Pepino", "Aceitunas",
  "Calabacitas", "Betabel", "Duraznos", "Manzana", "Pasta",
  "Jícama", "Espinaca", "Nopales", "Cebolla morada",
];

const BAGUETTES = [
  { nombre: "Clásico",               precio: 95,  emoji: "🥪", desc: "Jamón de pavo, queso manchego, pepino, tomate, lechuga y cebolla." },
  { nombre: "Pollo Crunchy",         precio: 105, emoji: "🍗", desc: "Pollo empanizado, lechuga, pepino, cebolla, tomate y queso manchego." },
  { nombre: "Italiano",              precio: 105, emoji: "🍝", desc: "Pollo empanizado, salsa boloñesa, lechuga, pepino, cebolla, tomate y queso manchego." },
  { nombre: "3 Quesos",              precio: 100, emoji: "🧀", desc: "Panela, manchego y parmesano con lechuga, pepino, cebolla y tomate." },
  { nombre: "Atún",                  precio: 105, emoji: "🐟", desc: "Atún con apio, zanahoria y mayonesa." },
  { nombre: "Queso de cabra al pesto", precio: 120, emoji: "🌿", desc: "Tomate, cebolla caramelizada, pepino y aderezo de mostaza dulce, con ensalada dulce." },
  { nombre: "Carne Arrachera",       precio: 135, emoji: "🥩", desc: "Arrachera a la plancha, lechuga, cebolla caramelizada, tomate, guacamole y queso manchego.", nuevo: true },
];

const BOWL_FRUTAS = {
  frutas:   ["Piña", "Papaya", "Melón", "Plátano", "Manzana", "Arándanos"],
  toppings: ["Granola", "Ajonjolí garapiñado", "Coco rallado"],
  bases:    ["Miel", "Biónico"],
  maxFrutas: 3,
  maxToppings: 2,
};

const LICUADOS = {
  sabores: ["Papaya", "Mango", "Manzana", "Plátano", "Frutos rojos", "Café"],
  proteinas: [
    { nombre: "Natural (5 g)",                     precio: 60 },
    { nombre: "Frutos rojos (5 g)",                precio: 60 },
    { nombre: "Post entrenamiento vainilla (25 g)", precio: 80 },
    { nombre: "Chícharo alto en BCAA (30 g)",       precio: 80 },
  ],
  extras: ["Avena", "Miel", "Granola"],
};

/* ============================================================
   HELPERS
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const dinero = (n) => `$${n}`;

function toast(msg) {
  const el = $("#toast");
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

/* Resalta el link activo según la sección visible */
const secciones = $$("section[id]");
const linksPorId = {};
$$(".nav-link").forEach((l) => (linksPorId[l.getAttribute("href").slice(1)] = l));

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
   TICKER (duplica el contenido para loop infinito)
   ============================================================ */
const tickerTrack = $("#tickerTrack");
tickerTrack.innerHTML += tickerTrack.innerHTML;

/* ============================================================
   TABS DEL MENÚ
   ============================================================ */
$("#menuTabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  $$(".tab").forEach((t) => t.classList.remove("active"));
  $$(".tab-panel").forEach((p) => p.classList.remove("active"));
  tab.classList.add("active");
  $(`#panel-${tab.dataset.tab}`).classList.add("active");
});

/* Botones "Arma tu ensalada" → scroll al menú + tab de ensaladas */
$$("[data-goto-builder]").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".tab").forEach((t) => t.classList.remove("active"));
    $$(".tab-panel").forEach((p) => p.classList.remove("active"));
    $('[data-tab="ensaladas"]').classList.add("active");
    $("#panel-ensaladas").classList.add("active");
  })
);

/* ============================================================
   CONSTRUCTOR DE ENSALADAS
   ============================================================ */
const builder = {
  combo: null,
  prots: [],      // en orden de selección (las que exceden el combo son extras)
  aderezo: null,
  ings: [],
};

const comboGrid    = $("#comboGrid");
const protGrid     = $("#protGrid");
const aderezoGrid  = $("#aderezoGrid");
const ingGrid      = $("#ingGrid");

function comboTexto(c) {
  return `${c.prot} proteína${c.prot > 1 ? "s" : ""} + ${c.ing} ingredientes`;
}

/* — Render de opciones — */
comboGrid.innerHTML = COMBOS_ENSALADA.map(
  (c) => `
  <button class="combo-card" data-id="${c.id}" type="button">
    <span class="combo-desc"><b>${c.prot}</b> proteína${c.prot > 1 ? "s" : ""} + <b>${c.ing}</b> ingredientes</span>
    <span class="combo-price">${dinero(c.precio)}</span>
  </button>`
).join("");

const chipHTML = (nombre) =>
  `<button class="chip" data-nombre="${nombre}" type="button">${nombre}</button>`;

protGrid.innerHTML    = PROTEINAS.map(chipHTML).join("");
aderezoGrid.innerHTML = ADEREZOS.map(chipHTML).join("");
ingGrid.innerHTML     = INGREDIENTES.map(chipHTML).join("");

/* — Interacciones — */
comboGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".combo-card");
  if (!card) return;
  builder.combo = COMBOS_ENSALADA.find((c) => c.id === card.dataset.id);
  $$(".combo-card", comboGrid).forEach((c) => c.classList.toggle("sel", c === card));
  ["#stepProteinas", "#stepAderezo", "#stepIngredientes"].forEach((id) =>
    $(id).classList.remove("bstep-locked")
  );
  actualizarBuilder();
});

function toggleLista(lista, nombre) {
  const i = lista.indexOf(nombre);
  if (i >= 0) lista.splice(i, 1);
  else lista.push(nombre);
}

protGrid.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  toggleLista(builder.prots, chip.dataset.nombre);
  chip.classList.add("pop");
  actualizarBuilder();
});

aderezoGrid.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  builder.aderezo = builder.aderezo === chip.dataset.nombre ? null : chip.dataset.nombre;
  chip.classList.add("pop");
  actualizarBuilder();
});

ingGrid.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  toggleLista(builder.ings, chip.dataset.nombre);
  chip.classList.add("pop");
  actualizarBuilder();
});

function pintarChips(grid, seleccion, base) {
  $$(".chip", grid).forEach((chip) => {
    const pos = seleccion.indexOf(chip.dataset.nombre);
    chip.classList.toggle("sel", pos >= 0);
    chip.classList.toggle("chip-extra", pos >= base);
  });
}

function pintarContador(el, actual, base) {
  const extras = Math.max(0, actual - base);
  el.textContent = extras > 0 ? `${base}/${base} +${extras} extra` : `${actual}/${base}`;
  el.classList.toggle("completo", actual >= base && extras === 0);
  el.classList.toggle("extra", extras > 0);
}

function precioEnsalada() {
  if (!builder.combo) return 0;
  const extrasProt = Math.max(0, builder.prots.length - builder.combo.prot);
  const extrasIng  = Math.max(0, builder.ings.length - builder.combo.ing);
  return builder.combo.precio + extrasProt * PRECIO_PROT_EXTRA + extrasIng * PRECIO_ING_EXTRA;
}

function ensaladaCompleta() {
  return (
    builder.combo &&
    builder.prots.length >= builder.combo.prot &&
    builder.aderezo &&
    builder.ings.length >= builder.combo.ing
  );
}

function actualizarBuilder() {
  const c = builder.combo;
  const baseProt = c ? c.prot : 1;
  const baseIng  = c ? c.ing : 2;

  pintarChips(protGrid, builder.prots, baseProt);
  pintarChips(aderezoGrid, builder.aderezo ? [builder.aderezo] : [], 1);
  pintarChips(ingGrid, builder.ings, baseIng);

  pintarContador($("#protCounter"), builder.prots.length, baseProt);
  pintarContador($("#aderezoCounter"), builder.aderezo ? 1 : 0, 1);
  pintarContador($("#ingCounter"), builder.ings.length, baseIng);

  /* Resumen */
  const body = $("#bsumBody");
  if (!c) {
    body.innerHTML = `<p class="bsum-empty">Elige una combinación para empezar 👆</p>`;
  } else {
    const extrasProt = Math.max(0, builder.prots.length - c.prot);
    const extrasIng  = Math.max(0, builder.ings.length - c.ing);
    const filas = [
      ["Combinación", comboTexto(c)],
      ["Proteínas", builder.prots.length ? builder.prots.join(", ") : "—"],
      ["Aderezo", builder.aderezo || "—"],
      ["Ingredientes", builder.ings.length ? builder.ings.join(", ") : "—"],
    ];
    if (extrasProt || extrasIng) {
      const partes = [];
      if (extrasProt) partes.push(`${extrasProt} proteína${extrasProt > 1 ? "s" : ""} (+${dinero(extrasProt * PRECIO_PROT_EXTRA)})`);
      if (extrasIng) partes.push(`${extrasIng} ingrediente${extrasIng > 1 ? "s" : ""} (+${dinero(extrasIng * PRECIO_ING_EXTRA)})`);
      filas.push(["Extras", `<em>${partes.join(" · ")}</em>`]);
    }
    body.innerHTML = filas
      .map(([l, v]) => `<div class="bsum-row"><span class="bsum-row-label">${l}</span><span class="bsum-row-val">${v}</span></div>`)
      .join("");
  }

  const total = precioEnsalada();
  $("#bsumTotalRow").hidden = !c;
  $("#bsumTotal").textContent = dinero(total);
  $("#btnAddSalad").disabled = !ensaladaCompleta();
  $("#btnResetSalad").hidden = !c;

  /* El bowl "reacciona" al progreso */
  const bowl = $("#bsumBowl");
  const emoji = !c ? "🥣" : ensaladaCompleta() ? "🥗" : "🔪";
  if (bowl.textContent !== emoji) {
    bowl.textContent = emoji;
    bowl.classList.remove("shake");
    void bowl.offsetWidth;
    bowl.classList.add("shake");
  }
}

function resetBuilder() {
  builder.combo = null;
  builder.prots = [];
  builder.aderezo = null;
  builder.ings = [];
  $$(".combo-card", comboGrid).forEach((c) => c.classList.remove("sel"));
  ["#stepProteinas", "#stepAderezo", "#stepIngredientes"].forEach((id) =>
    $(id).classList.add("bstep-locked")
  );
  actualizarBuilder();
}

$("#btnResetSalad").addEventListener("click", resetBuilder);

$("#btnAddSalad").addEventListener("click", () => {
  if (!ensaladaCompleta()) return;
  const c = builder.combo;
  agregarAlCarrito({
    nombre: `Ensalada personalizada (${comboTexto(c)})`,
    detalles: [
      `Proteínas: ${builder.prots.join(", ")}`,
      `Aderezo: ${builder.aderezo}`,
      `Ingredientes: ${builder.ings.join(", ")}`,
    ],
    precio: precioEnsalada(),
    unico: true, // cada ensalada personalizada es su propia línea
  });
  resetBuilder();
  toast("🥗 ¡Tu ensalada está en el carrito!");
});

/* ============================================================
   TABS DE PRODUCTOS
   ============================================================ */

/* — Baguettes — */
$("#panel-baguettes").innerHTML = `
  <p class="prod-intro">
    Pan crujiente, ingredientes frescos y el relleno bien servido.
    <br><button class="ver-menu-btn" type="button" data-lightbox="assets/menu-baguettes.jpg">📸 Ver el menú con fotos →</button>
  </p>
  <div class="prod-grid">
    ${BAGUETTES.map(
      (b, i) => `
      <article class="prod-card">
        ${b.nuevo ? `<span class="prod-badge-nuevo">Nuevo</span>` : ""}
        <span class="prod-emoji">${b.emoji}</span>
        <h3 class="prod-name">${b.nombre}</h3>
        <p class="prod-desc">${b.desc}</p>
        <div class="prod-foot">
          <span class="prod-price">${dinero(b.precio)}</span>
          <button class="prod-add" type="button" data-baguette="${i}">Agregar +</button>
        </div>
      </article>`
    ).join("")}
  </div>`;

$("#panel-baguettes").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-baguette]");
  if (!btn) return;
  const b = BAGUETTES[+btn.dataset.baguette];
  agregarAlCarrito({ nombre: `Baguette ${b.nombre}`, detalles: [], precio: b.precio });
  toast(`🥖 Baguette ${b.nombre} agregado`);
});

/* — Bowl de frutas (mini-constructor) — */
const bowlState = { frutas: [], toppings: [], base: null };

$("#panel-bowls").innerHTML = `
  <div class="mini-builder">
    <div class="mb-head">
      <h3>🍓 Arma tu bowl de frutas</h3>
      <span class="mb-price">${dinero(PRECIO_BOWL_FRUTAS)}</span>
    </div>
    <p class="mb-sub">Fruta fresca cortada al momento. Elige 3 frutas, 2 toppings y tu base favorita.</p>
    <div class="mb-group">
      <div class="mb-group-title">Elige tus frutas <span class="bstep-counter" id="bowlFrutasCounter">0/3</span></div>
      <div class="chip-grid" id="bowlFrutasGrid">${BOWL_FRUTAS.frutas.map(chipHTML).join("")}</div>
    </div>
    <div class="mb-group">
      <div class="mb-group-title">Elige tus toppings <span class="bstep-counter" id="bowlTopCounter">0/2</span></div>
      <div class="chip-grid" id="bowlTopGrid">${BOWL_FRUTAS.toppings.map(chipHTML).join("")}</div>
    </div>
    <div class="mb-group">
      <div class="mb-group-title">Elige tu base <span class="bstep-counter" id="bowlBaseCounter">0/1</span></div>
      <div class="chip-grid" id="bowlBaseGrid">${BOWL_FRUTAS.bases.map(chipHTML).join("")}</div>
    </div>
    <div class="mb-foot">
      <button class="btn btn-primary" type="button" id="btnAddBowl" disabled>Agregar al carrito</button>
    </div>
  </div>`;

function miniToggle(lista, nombre, max) {
  const i = lista.indexOf(nombre);
  if (i >= 0) { lista.splice(i, 1); return; }
  if (lista.length >= max) lista.shift(); // sustituye la más antigua
  lista.push(nombre);
}

function actualizarBowl() {
  pintarChips($("#bowlFrutasGrid"), bowlState.frutas, BOWL_FRUTAS.maxFrutas);
  pintarChips($("#bowlTopGrid"), bowlState.toppings, BOWL_FRUTAS.maxToppings);
  pintarChips($("#bowlBaseGrid"), bowlState.base ? [bowlState.base] : [], 1);
  pintarContador($("#bowlFrutasCounter"), bowlState.frutas.length, BOWL_FRUTAS.maxFrutas);
  pintarContador($("#bowlTopCounter"), bowlState.toppings.length, BOWL_FRUTAS.maxToppings);
  pintarContador($("#bowlBaseCounter"), bowlState.base ? 1 : 0, 1);
  $("#btnAddBowl").disabled = !(
    bowlState.frutas.length === BOWL_FRUTAS.maxFrutas &&
    bowlState.toppings.length === BOWL_FRUTAS.maxToppings &&
    bowlState.base
  );
}

$("#bowlFrutasGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  miniToggle(bowlState.frutas, chip.dataset.nombre, BOWL_FRUTAS.maxFrutas);
  chip.classList.add("pop");
  actualizarBowl();
});
$("#bowlTopGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  miniToggle(bowlState.toppings, chip.dataset.nombre, BOWL_FRUTAS.maxToppings);
  chip.classList.add("pop");
  actualizarBowl();
});
$("#bowlBaseGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  bowlState.base = bowlState.base === chip.dataset.nombre ? null : chip.dataset.nombre;
  chip.classList.add("pop");
  actualizarBowl();
});

$("#btnAddBowl").addEventListener("click", () => {
  agregarAlCarrito({
    nombre: "Bowl de frutas",
    detalles: [
      `Frutas: ${bowlState.frutas.join(", ")}`,
      `Toppings: ${bowlState.toppings.join(", ")}`,
      `Base: ${bowlState.base}`,
    ],
    precio: PRECIO_BOWL_FRUTAS,
    unico: true,
  });
  bowlState.frutas = [];
  bowlState.toppings = [];
  bowlState.base = null;
  actualizarBowl();
  toast("🍓 ¡Bowl de frutas agregado!");
});

/* — Licuados (mini-constructor) — */
const licState = { sabor: null, proteina: null, extras: [] };

$("#panel-licuados").innerHTML = `
  <p class="prod-intro">
    Licuados a base de leche deslactosada, con la proteína que tu rutina pide.
    <br><button class="ver-menu-btn" type="button" data-lightbox="assets/menu-licuados.jpg">📸 Ver el menú Healthy Protein →</button>
  </p>
  <div class="mini-builder">
    <div class="mb-head">
      <h3>🥤 Arma tu licuado</h3>
      <span class="mb-price" id="licPrecio">—</span>
    </div>
    <p class="mb-sub">Elige tu sabor y el tipo de proteína. El de café va con leche de almendras.</p>
    <div class="mb-group">
      <div class="mb-group-title">Sabor <span class="bstep-counter" id="licSaborCounter">0/1</span></div>
      <div class="chip-grid" id="licSaborGrid">${LICUADOS.sabores.map(chipHTML).join("")}</div>
    </div>
    <div class="mb-group">
      <div class="mb-group-title">Proteína <span class="bstep-counter" id="licProtCounter">0/1</span></div>
      <div class="chip-grid" id="licProtGrid">
        ${LICUADOS.proteinas.map((p) => `<button class="chip" data-nombre="${p.nombre}" type="button">${p.nombre} · ${dinero(p.precio)}</button>`).join("")}
      </div>
    </div>
    <div class="mb-group">
      <div class="mb-group-title">Puedes incluir (sin costo)</div>
      <div class="chip-grid" id="licExtraGrid">${LICUADOS.extras.map(chipHTML).join("")}</div>
    </div>
    <div class="mb-foot">
      <span class="mb-note">Los $60 llevan 5 g de proteína · los $80 llevan 25–30 g</span>
      <button class="btn btn-primary" type="button" id="btnAddLic" disabled>Agregar al carrito</button>
    </div>
  </div>`;

function actualizarLicuado() {
  pintarChips($("#licSaborGrid"), licState.sabor ? [licState.sabor] : [], 1);
  pintarChips($("#licProtGrid"), licState.proteina ? [licState.proteina.nombre] : [], 1);
  pintarChips($("#licExtraGrid"), licState.extras, LICUADOS.extras.length);
  pintarContador($("#licSaborCounter"), licState.sabor ? 1 : 0, 1);
  pintarContador($("#licProtCounter"), licState.proteina ? 1 : 0, 1);
  $("#licPrecio").textContent = licState.proteina ? dinero(licState.proteina.precio) : "—";
  $("#btnAddLic").disabled = !(licState.sabor && licState.proteina);
}

$("#licSaborGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  licState.sabor = licState.sabor === chip.dataset.nombre ? null : chip.dataset.nombre;
  chip.classList.add("pop");
  actualizarLicuado();
});
$("#licProtGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const p = LICUADOS.proteinas.find((x) => x.nombre === chip.dataset.nombre);
  licState.proteina = licState.proteina && licState.proteina.nombre === p.nombre ? null : p;
  chip.classList.add("pop");
  actualizarLicuado();
});
$("#licExtraGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  toggleLista(licState.extras, chip.dataset.nombre);
  chip.classList.add("pop");
  actualizarLicuado();
});

$("#btnAddLic").addEventListener("click", () => {
  const detalles = [
    `Sabor: ${licState.sabor}`,
    `Proteína: ${licState.proteina.nombre}`,
  ];
  if (licState.extras.length) detalles.push(`Incluye: ${licState.extras.join(", ")}`);
  agregarAlCarrito({
    nombre: "Licuado Healthy Protein",
    detalles,
    precio: licState.proteina.precio,
    unico: true,
  });
  licState.sabor = null;
  licState.proteina = null;
  licState.extras = [];
  actualizarLicuado();
  toast("💪 ¡Licuado agregado!");
});

/* — Jugos y bebidas — */
$("#panel-jugos").innerHTML = `
  <div class="prod-grid">
    <article class="prod-card">
      <span class="prod-emoji">🥬</span>
      <h3 class="prod-name">Jugo Verde "Desintoxícate"</h3>
      <p class="prod-desc">Nuestro clásico verde, recién exprimido, para empezar el día ligero.</p>
      <div class="prod-foot">
        <span class="prod-price">${dinero(80)}</span>
        <button class="prod-add" type="button" data-bebida="jugo">Agregar +</button>
      </div>
    </article>
    <article class="prod-card">
      <span class="prod-emoji">🍋</span>
      <h3 class="prod-name">Limonada natural</h3>
      <p class="prod-desc">Variedad de sabores de temporada, preparada al momento. Pregunta por el sabor del día.</p>
      <div class="prod-foot">
        <span class="prod-price">${dinero(PRECIO_LIMONADA)}</span>
        <button class="prod-add" type="button" data-bebida="limonada">Agregar +</button>
      </div>
    </article>
  </div>`;

$("#panel-jugos").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-bebida]");
  if (!btn) return;
  if (btn.dataset.bebida === "jugo") {
    agregarAlCarrito({ nombre: `Jugo Verde "Desintoxícate"`, detalles: [], precio: 80 });
    toast("🥬 Jugo verde agregado");
  } else {
    agregarAlCarrito({ nombre: "Limonada natural", detalles: [], precio: PRECIO_LIMONADA });
    toast("🍋 Limonada agregada");
  }
});

/* — Combos — */
$("#panel-combos").innerHTML = `
  <div class="prod-grid" style="max-width:420px; margin:0 auto;">
    <article class="prod-card">
      <img src="assets/combo.jpg" alt="Combo: ensalada mediana + agua de sabor" class="prod-img" loading="lazy">
      <h3 class="prod-name">Arma tu combo</h3>
      <p class="prod-desc">Ensalada mediana + agua de sabor. Dinos cómo la quieres en las notas del pedido.</p>
      <div class="prod-foot">
        <span class="prod-price">${dinero(125)}</span>
        <button class="prod-add" type="button" data-combo>Agregar +</button>
      </div>
    </article>
  </div>`;

$("#panel-combos").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-combo]");
  if (!btn) return;
  agregarAlCarrito({
    nombre: "Combo: Ensalada mediana + Agua de sabor",
    detalles: [],
    precio: 125,
  });
  toast("🍽️ Combo agregado");
});

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
  cerrarCarrito();
  $("#menu").scrollIntoView({ behavior: "smooth" });
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

/* ============================================================
   LIGHTBOX (menús con foto)
   ============================================================ */
const lightbox = $("#lightbox");
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-lightbox]");
  if (trigger) {
    $("#lightboxImg").src = trigger.dataset.lightbox;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
});
function cerrarLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}
$("#lightboxClose").addEventListener("click", cerrarLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) cerrarLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cerrarLightbox();
    cerrarCarrito();
  }
});

/* ============================================================
   BADGE ABIERTO/CERRADO + AÑO
   ============================================================ */
(function estadoHorario() {
  const badge = $("#openBadge");
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
actualizarBuilder();
actualizarBowl();
actualizarLicuado();
pintarCarrito();
