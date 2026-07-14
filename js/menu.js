/* ============================================================
   HEALTHY & FRESH — Salads Bar & Baguettes Xalapa
   menu.js — lógica exclusiva de la página del menú
   (movida desde app.js sin cambios de funcionamiento)
   Requiere app.js cargado antes ($, $$, dinero, toast,
   agregarAlCarrito).
   ============================================================ */
"use strict";

/* ============================================================
   DATOS DEL MENÚ
   ============================================================ */

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
  "Brócoli", "Zanahoria", "Tomate", "Grano de elote",
  "Champiñones", "Apio", "Arándanos", "Pepino", "Aceitunas",
  "Calabacitas", "Betabel", "Duraznos", "Manzana", "Pasta",
  "Jícama", "Espinaca", "Nopales", "Cebolla morada",
];

/* Complementos gratuitos de la ensalada (selección única por grupo) */
const COMPLEMENTOS = {
  semillas:   ["Semillas de girasol", "Cacahuate", "Ninguna"],
  crujientes: ["Crotones", "Tiras de tortilla", "Ninguna"],
};

/* Combo: ensalada mediana (1 proteína + 3 ingredientes) + agua de sabor */
const COMBO_PAQUETE = { id: "combo", prot: 1, ing: 3, precio: 125 };

const BAGUETTES = [
  { nombre: "Clásico",               precio: 95,  emoji: "🥪", desc: "Jamón de pavo, queso manchego, pepino, tomate, lechuga y cebolla." },
  { nombre: "Pollo Crunchy",         precio: 105, emoji: "🍗", desc: "Pollo empanizado, lechuga, pepino, cebolla, tomate y queso manchego." },
  { nombre: "Italiano",              precio: 105, emoji: "🍝", desc: "Pollo empanizado, salsa boloñesa, lechuga, pepino, cebolla, tomate y queso manchego." },
  { nombre: "3 Quesos",              precio: 100, emoji: "🧀", desc: "Panela, manchego y parmesano con lechuga, pepino, cebolla y tomate." },
  { nombre: "Atún",                  precio: 105, emoji: "🐟", desc: "Atún con apio, zanahoria y mayonesa." },
  { nombre: "Queso de cabra al pesto", precio: 120, emoji: "🌿", desc: "Tomate, cebolla caramelizada, pepino y aderezo de mostaza dulce, con ensalada dulce." },
  { nombre: "Carne Arrachera",       precio: 135, emoji: "🥩", desc: "Arrachera a la plancha, lechuga, cebolla caramelizada, tomate, guacamole y queso manchego.", nuevo: true },
];

/* Sándwiches (pan integral / de caja).
   NOTA: sin fotografías reales de estos platillos por ahora; se usan
   emoji igual que en las tarjetas de baguettes. Para agregar fotos
   después, seguir el patrón de la tarjeta de combos (usar <img class="prod-img">). */
const CLUB_SANDWICH = {
  nombre: "Club Sandwich",
  precio: 100,
  emoji: "🥪",
  desc: "En pan integral: jamón de pavo, pechuga, queso manchego, lechuga, tomate y cebolla.",
};

const SANDWICH = {
  precio: 50,
  proteinas: ["Panela", "Jamón de pavo", "Pollo"],
  incluye: ["Espinaca", "Zanahoria", "Pepino", "Tomate", "Cebolla"],
};

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
   TABS DEL MENÚ
   El panel de resumen (#builderSummary) es UN solo componente:
   al cambiar de pestaña se mueve al panel activo y se repinta
   con los datos de esa categoría.
   ============================================================ */
function activarTab(cat) {
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === cat));
  $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${cat}`));
  moverResumen(cat);
}

$("#menuTabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  activarTab(tab.dataset.tab);
});

/* ============================================================
   CONSTRUCTOR DE ENSALADAS
   ============================================================ */
const builder = {
  combo: null,
  prots: [],      // en orden de selección (las que exceden el combo son extras)
  aderezo: null,
  ings: [],
  semilla: "Ninguna",
  crujiente: "Ninguna",
  modoCombo: false, // true = personalizando la ensalada del combo de $125
};

const PASOS_BUILDER = ["#stepProteinas", "#stepAderezo", "#stepIngredientes", "#stepComplementos"];

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
$("#semillasGrid").innerHTML  = COMPLEMENTOS.semillas.map(chipHTML).join("");
$("#crujienteGrid").innerHTML = COMPLEMENTOS.crujientes.map(chipHTML).join("");

/* — Interacciones — */
comboGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".combo-card");
  if (!card) return;
  builder.combo = COMBOS_ENSALADA.find((c) => c.id === card.dataset.id);
  $$(".combo-card", comboGrid).forEach((c) => c.classList.toggle("sel", c === card));
  PASOS_BUILDER.forEach((id) => $(id).classList.remove("bstep-locked"));
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

/* Complementos gratuitos: selección única por grupo ("Ninguna" es explícita) */
$("#semillasGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  builder.semilla = chip.dataset.nombre;
  chip.classList.add("pop");
  actualizarBuilder();
});

$("#crujienteGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  builder.crujiente = chip.dataset.nombre;
  chip.classList.add("pop");
  actualizarBuilder();
});

/* Complementos elegidos distintos de "Ninguna" */
function complementosElegidos() {
  return [builder.semilla, builder.crujiente].filter((x) => x !== "Ninguna");
}

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

  /* Paso 1: en modo combo se muestra el banner en lugar del selector */
  comboGrid.hidden = builder.modoCombo;
  $("#comboBanner").hidden = !builder.modoCombo;

  pintarChips(protGrid, builder.prots, baseProt);
  pintarChips(aderezoGrid, builder.aderezo ? [builder.aderezo] : [], 1);
  pintarChips(ingGrid, builder.ings, baseIng);
  pintarChips($("#semillasGrid"), [builder.semilla], 1);
  pintarChips($("#crujienteGrid"), [builder.crujiente], 1);

  pintarContador($("#protCounter"), builder.prots.length, baseProt);
  pintarContador($("#aderezoCounter"), builder.aderezo ? 1 : 0, 1);
  pintarContador($("#ingCounter"), builder.ings.length, baseIng);

  /* Resumen (componente compartido) */
  let filas = null;
  if (c) {
    const extrasProt = Math.max(0, builder.prots.length - c.prot);
    const extrasIng  = Math.max(0, builder.ings.length - c.ing);
    filas = [
      ["Combinación", comboTexto(c)],
      ["Proteínas", builder.prots.length ? builder.prots.join(", ") : "—"],
      ["Aderezo", builder.aderezo || "—"],
      ["Ingredientes", builder.ings.length ? builder.ings.join(", ") : "—"],
    ];
    const comps = complementosElegidos();
    if (comps.length) filas.push(["Complementos", comps.join(", ")]);
    if (builder.modoCombo) filas.push(["Incluye", "Agua de sabor"]);
    if (extrasProt || extrasIng) {
      const partes = [];
      if (extrasProt) partes.push(`${extrasProt} proteína${extrasProt > 1 ? "s" : ""} (+${dinero(extrasProt * PRECIO_PROT_EXTRA)})`);
      if (extrasIng) partes.push(`${extrasIng} ingrediente${extrasIng > 1 ? "s" : ""} (+${dinero(extrasIng * PRECIO_ING_EXTRA)})`);
      filas.push(["Extras", `<em>${partes.join(" · ")}</em>`]);
    }
  }
  pintarResumen({
    titulo: builder.modoCombo ? "Tu combo" : "Tu ensalada",
    emoji: !c ? "🥣" : ensaladaCompleta() ? (builder.modoCombo ? "🍽️" : "🥗") : "🔪",
    filas,
    total: c ? precioEnsalada() : null,
    completo: ensaladaCompleta(),
    vacio: "Elige una combinación para empezar 👆",
    textoBoton: builder.modoCombo ? "Agregar combo" : "Agregar al carrito",
    mostrarReset: !!c,
  });
}

/* Limpia las selecciones. Con mantenerCombo=true se queda en modo combo
   (para "Empezar de nuevo" dentro del combo); si no, vuelve al flujo normal. */
function resetBuilder(mantenerCombo = false) {
  const enCombo = mantenerCombo && builder.modoCombo;
  builder.modoCombo = enCombo;
  builder.combo = enCombo ? COMBO_PAQUETE : null;
  builder.prots = [];
  builder.aderezo = null;
  builder.ings = [];
  builder.semilla = "Ninguna";
  builder.crujiente = "Ninguna";
  $$(".combo-card", comboGrid).forEach((c) => c.classList.remove("sel"));
  PASOS_BUILDER.forEach((id) => $(id).classList.toggle("bstep-locked", !enCombo));
  actualizarBuilder();
}

$("#btnSalirCombo").addEventListener("click", () => resetBuilder(false));

/* Entra al constructor con la ensalada del combo lista para personalizar */
function iniciarModoCombo() {
  resetBuilder(false);
  builder.modoCombo = true;
  builder.combo = COMBO_PAQUETE;
  PASOS_BUILDER.forEach((id) => $(id).classList.remove("bstep-locked"));
  activarTab("ensaladas");
  $("#stepCombo").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Agregar la ensalada (o combo) al carrito — lo dispara el botón compartido */
function agregarEnsalada() {
  if (!ensaladaCompleta()) return;
  const c = builder.combo;
  const detalles = [
    `Proteínas: ${builder.prots.join(", ")}`,
    `Aderezo: ${builder.aderezo}`,
    `Ingredientes: ${builder.ings.join(", ")}`,
  ];
  const comps = complementosElegidos();
  if (comps.length) detalles.push(`Complementos: ${comps.join(", ")}`);
  if (builder.modoCombo) detalles.push("Incluye: Agua de sabor");
  agregarAlCarrito({
    nombre: builder.modoCombo
      ? "Combo: Ensalada mediana + Agua de sabor"
      : `Ensalada personalizada (${comboTexto(c)})`,
    detalles,
    precio: precioEnsalada(),
    unico: true, // cada ensalada personalizada es su propia línea
  });
  resetBuilder(false);
}

/* ============================================================
   TABS DE PRODUCTOS
   ============================================================ */

/* — Baguettes — */
$("#panel-baguettes").innerHTML = `
  <div class="builder">
    <div class="builder-steps">
      <p class="prod-intro">
        Pan crujiente, ingredientes frescos y el relleno bien servido. Toca uno para elegirlo.
        <br><button class="ver-menu-btn" type="button" data-lightbox="assets/menu-baguettes.webp">📸 Ver el menú con fotos →</button>
      </p>
      <div class="prod-grid">
        ${BAGUETTES.map(
          (b, i) => `
          <button class="prod-card seleccionable" type="button" data-baguette="${i}" aria-pressed="false">
            ${b.nuevo ? `<span class="prod-badge-nuevo">Nuevo</span>` : ""}
            <span class="prod-emoji">${b.emoji}</span>
            <h3 class="prod-name">${b.nombre}</h3>
            <p class="prod-desc">${b.desc}</p>
            <div class="prod-foot">
              <span class="prod-price">${dinero(b.precio)}</span>
            </div>
          </button>`
        ).join("")}
      </div>
    </div>
  </div>`;

const seleccion = { baguette: null, jugo: null, sandwich: null };

function refrescarBaguettes() {
  $$("#panel-baguettes .prod-card").forEach((card) => {
    const sel = seleccion.baguette !== null && +card.dataset.baguette === seleccion.baguette;
    card.classList.toggle("sel", sel);
    card.setAttribute("aria-pressed", sel);
  });
  if (categoriaActiva === "baguettes") resumenBaguettes();
}

function resumenBaguettes() {
  const b = seleccion.baguette !== null ? BAGUETTES[seleccion.baguette] : null;
  pintarResumen({
    titulo: "Tu baguette",
    emoji: b ? b.emoji : "🥖",
    filas: b ? [["Baguette", b.nombre], ["Lleva", b.desc]] : null,
    total: b ? b.precio : null,
    completo: !!b,
    vacio: "Elige tu baguette 👆",
    mostrarReset: !!b,
  });
}

$("#panel-baguettes").addEventListener("click", (e) => {
  const card = e.target.closest("[data-baguette]");
  if (!card) return;
  const i = +card.dataset.baguette;
  seleccion.baguette = seleccion.baguette === i ? null : i;
  refrescarBaguettes();
});

/* — Sándwiches — */
const sandwichState = { proteina: null };

$("#panel-sandwiches").innerHTML = `
  <div class="builder">
    <div class="builder-steps">
      <div class="prod-grid" style="max-width:420px;">
        <button class="prod-card seleccionable" type="button" data-club aria-pressed="false">
          <span class="prod-emoji">${CLUB_SANDWICH.emoji}</span>
          <h3 class="prod-name">${CLUB_SANDWICH.nombre}</h3>
          <p class="prod-desc">${CLUB_SANDWICH.desc}</p>
          <div class="prod-foot">
            <span class="prod-price">${dinero(CLUB_SANDWICH.precio)}</span>
          </div>
        </button>
      </div>
      <div class="mini-builder">
        <div class="mb-head">
          <h3>🥪 Arma tu sándwich</h3>
          <span class="mb-price">${dinero(SANDWICH.precio)}</span>
        </div>
        <p class="mb-sub">Elige tu proteína. Todas incluyen espinaca, zanahoria, pepino, tomate y cebolla.</p>
        <div class="mb-group">
          <div class="mb-group-title">Proteína <span class="bstep-counter" id="sandProtCounter">0/1</span></div>
          <div class="chip-grid" id="sandProtGrid">${SANDWICH.proteinas.map(chipHTML).join("")}</div>
        </div>
      </div>
    </div>
  </div>`;

function refrescarSandwich() {
  pintarChips($("#sandProtGrid"), sandwichState.proteina ? [sandwichState.proteina] : [], 1);
  pintarContador($("#sandProtCounter"), sandwichState.proteina ? 1 : 0, 1);
  const club = seleccion.sandwich === "club";
  const card = $("#panel-sandwiches [data-club]");
  card.classList.toggle("sel", club);
  card.setAttribute("aria-pressed", club);
  if (categoriaActiva === "sandwiches") resumenSandwich();
}

function resumenSandwich() {
  const club = seleccion.sandwich === "club";
  const armado = seleccion.sandwich === "armado" && sandwichState.proteina;
  let filas = null;
  if (club) filas = [["Producto", CLUB_SANDWICH.nombre], ["Lleva", CLUB_SANDWICH.desc]];
  if (armado) filas = [["Proteína", sandwichState.proteina], ["Incluye", SANDWICH.incluye.join(", ")]];
  pintarResumen({
    titulo: "Tu sándwich",
    emoji: "🥪",
    filas,
    total: club ? CLUB_SANDWICH.precio : armado ? SANDWICH.precio : null,
    completo: club || !!armado,
    vacio: "Elige el Club o arma el tuyo 👆",
    mostrarReset: !!seleccion.sandwich,
  });
}

$("#sandProtGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const nueva = sandwichState.proteina === chip.dataset.nombre ? null : chip.dataset.nombre;
  sandwichState.proteina = nueva;
  seleccion.sandwich = nueva ? "armado" : null;
  chip.classList.add("pop");
  refrescarSandwich();
});

$("#panel-sandwiches").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-club]");
  if (!btn) return;
  seleccion.sandwich = seleccion.sandwich === "club" ? null : "club";
  sandwichState.proteina = null;
  refrescarSandwich();
});

/* — Bowl de frutas (mini-constructor) — */
const bowlState = { frutas: [], toppings: [], base: null };

$("#panel-bowls").innerHTML = `
  <div class="builder">
    <div class="builder-steps">
      <div class="mini-builder">
        <div class="mb-head">
          <h3>🍓 Arma tu bowl de frutas</h3>
        </div>
        <p class="mb-sub">Fruta fresca cortada al momento. Elige 3 porciones de fruta —puedes repetir la misma—, 2 toppings y tu base favorita.</p>
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
      </div>
    </div>
  </div>`;

function miniToggle(lista, nombre, max) {
  const i = lista.indexOf(nombre);
  if (i >= 0) { lista.splice(i, 1); return; }
  if (lista.length >= max) lista.shift(); // sustituye la más antigua
  lista.push(nombre);
}

/* Agrupa repetidos para mostrarlos: ["Papaya","Papaya","Melón"] → "Papaya ×2, Melón" */
function listaConConteo(arr) {
  const conteo = new Map();
  arr.forEach((x) => conteo.set(x, (conteo.get(x) || 0) + 1));
  return [...conteo].map(([n, c]) => (c > 1 ? `${n} ×${c}` : n)).join(", ");
}

/* Las frutas admiten porciones repetidas: cada chip muestra ×N */
function pintarChipsFrutas() {
  $$(".chip", $("#bowlFrutasGrid")).forEach((chip) => {
    const veces = bowlState.frutas.filter((x) => x === chip.dataset.nombre).length;
    chip.classList.toggle("sel", veces > 0);
    if (veces > 1) chip.setAttribute("data-veces", `×${veces}`);
    else chip.removeAttribute("data-veces");
  });
}

function bowlCompleto() {
  return (
    bowlState.frutas.length === BOWL_FRUTAS.maxFrutas &&
    bowlState.toppings.length === BOWL_FRUTAS.maxToppings &&
    !!bowlState.base
  );
}

function actualizarBowl() {
  pintarChipsFrutas();
  pintarChips($("#bowlTopGrid"), bowlState.toppings, BOWL_FRUTAS.maxToppings);
  pintarChips($("#bowlBaseGrid"), bowlState.base ? [bowlState.base] : [], 1);
  pintarContador($("#bowlFrutasCounter"), bowlState.frutas.length, BOWL_FRUTAS.maxFrutas);
  pintarContador($("#bowlTopCounter"), bowlState.toppings.length, BOWL_FRUTAS.maxToppings);
  pintarContador($("#bowlBaseCounter"), bowlState.base ? 1 : 0, 1);
  if (categoriaActiva === "bowls") resumenBowl();
}

function resumenBowl() {
  const hay = bowlState.frutas.length || bowlState.toppings.length || bowlState.base;
  pintarResumen({
    titulo: "Tu bowl",
    emoji: bowlCompleto() ? "🍓" : hay ? "🔪" : "🥣",
    filas: hay
      ? [
          ["Frutas", bowlState.frutas.length ? listaConConteo(bowlState.frutas) : "—"],
          ["Toppings", bowlState.toppings.length ? bowlState.toppings.join(", ") : "—"],
          ["Base", bowlState.base || "—"],
        ]
      : null,
    total: PRECIO_BOWL_FRUTAS,
    completo: bowlCompleto(),
    vacio: "Elige tus frutas para empezar 👆",
    mostrarReset: !!hay,
  });
}

$("#bowlFrutasGrid").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const fruta = chip.dataset.nombre;
  const veces = bowlState.frutas.filter((x) => x === fruta).length;
  if (veces === BOWL_FRUTAS.maxFrutas) {
    // ya llena todo el bowl: un clic más la quita
    bowlState.frutas = bowlState.frutas.filter((x) => x !== fruta);
  } else {
    // cada clic agrega una porción (puede repetirse); si está lleno, sale la más antigua
    if (bowlState.frutas.length >= BOWL_FRUTAS.maxFrutas) bowlState.frutas.shift();
    bowlState.frutas.push(fruta);
  }
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

/* Agregar el bowl al carrito — lo dispara el botón compartido */
function agregarBowl() {
  if (!bowlCompleto()) return;
  agregarAlCarrito({
    nombre: "Bowl de frutas",
    detalles: [
      `Frutas: ${listaConConteo(bowlState.frutas)}`,
      `Toppings: ${bowlState.toppings.join(", ")}`,
      `Base: ${bowlState.base}`,
    ],
    precio: PRECIO_BOWL_FRUTAS,
    unico: true,
  });
  resetBowl();
}

function resetBowl() {
  bowlState.frutas = [];
  bowlState.toppings = [];
  bowlState.base = null;
  actualizarBowl();
}

/* — Licuados (mini-constructor) — */
const licState = { sabor: null, proteina: null, extras: [] };

$("#panel-licuados").innerHTML = `
  <div class="builder">
    <div class="builder-steps">
      <p class="prod-intro">
        Licuados a base de leche deslactosada, con la proteína que tu rutina pide.
        <br><button class="ver-menu-btn" type="button" data-lightbox="assets/menu-licuados.webp">📸 Ver el menú Healthy Protein →</button>
      </p>
      <div class="mini-builder">
        <div class="mb-head">
          <h3>🥤 Arma tu licuado</h3>
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
        <p class="mb-note">Los $60 llevan 5 g de proteína · los $80 llevan 25–30 g</p>
      </div>
    </div>
  </div>`;

function actualizarLicuado() {
  pintarChips($("#licSaborGrid"), licState.sabor ? [licState.sabor] : [], 1);
  pintarChips($("#licProtGrid"), licState.proteina ? [licState.proteina.nombre] : [], 1);
  pintarChips($("#licExtraGrid"), licState.extras, LICUADOS.extras.length);
  pintarContador($("#licSaborCounter"), licState.sabor ? 1 : 0, 1);
  pintarContador($("#licProtCounter"), licState.proteina ? 1 : 0, 1);
  if (categoriaActiva === "licuados") resumenLicuado();
}

function resumenLicuado() {
  const hay = licState.sabor || licState.proteina || licState.extras.length;
  const filas = hay
    ? [
        ["Sabor", licState.sabor || "—"],
        ["Proteína", licState.proteina ? licState.proteina.nombre : "—"],
      ]
    : null;
  if (filas && licState.extras.length) filas.push(["Incluye", licState.extras.join(", ")]);
  pintarResumen({
    titulo: "Tu licuado",
    emoji: licState.sabor && licState.proteina ? "🥤" : hay ? "🔪" : "🥣",
    filas,
    total: licState.proteina ? licState.proteina.precio : null,
    completo: !!(licState.sabor && licState.proteina),
    vacio: "Elige tu sabor para empezar 👆",
    mostrarReset: !!hay,
  });
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

/* Agregar el licuado al carrito — lo dispara el botón compartido */
function agregarLicuado() {
  if (!(licState.sabor && licState.proteina)) return;
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
  resetLicuado();
}

function resetLicuado() {
  licState.sabor = null;
  licState.proteina = null;
  licState.extras = [];
  actualizarLicuado();
}

/* — Jugos y bebidas — */
const JUGOS = [
  { nombre: `Jugo Verde "Desintoxícate"`, precio: 80, emoji: "🥬", desc: "Nuestro clásico verde, recién exprimido, para empezar el día ligero." },
  { nombre: "Limonada natural", precio: PRECIO_LIMONADA, emoji: "🍋", desc: "Variedad de sabores de temporada, preparada al momento. Pregunta por el sabor del día." },
];

$("#panel-jugos").innerHTML = `
  <div class="builder">
    <div class="builder-steps">
      <div class="prod-grid">
        ${JUGOS.map(
          (j, i) => `
          <button class="prod-card seleccionable" type="button" data-bebida="${i}" aria-pressed="false">
            <span class="prod-emoji">${j.emoji}</span>
            <h3 class="prod-name">${j.nombre}</h3>
            <p class="prod-desc">${j.desc}</p>
            <div class="prod-foot">
              <span class="prod-price">${dinero(j.precio)}</span>
            </div>
          </button>`
        ).join("")}
      </div>
    </div>
  </div>`;

function refrescarJugos() {
  $$("#panel-jugos .prod-card").forEach((card) => {
    const sel = seleccion.jugo !== null && +card.dataset.bebida === seleccion.jugo;
    card.classList.toggle("sel", sel);
    card.setAttribute("aria-pressed", sel);
  });
  if (categoriaActiva === "jugos") resumenJugos();
}

function resumenJugos() {
  const j = seleccion.jugo !== null ? JUGOS[seleccion.jugo] : null;
  pintarResumen({
    titulo: "Tu bebida",
    emoji: j ? j.emoji : "🍋",
    filas: j ? [["Bebida", j.nombre]] : null,
    total: j ? j.precio : null,
    completo: !!j,
    vacio: "Elige tu bebida 👆",
    mostrarReset: !!j,
  });
}

$("#panel-jugos").addEventListener("click", (e) => {
  const card = e.target.closest("[data-bebida]");
  if (!card) return;
  const i = +card.dataset.bebida;
  seleccion.jugo = seleccion.jugo === i ? null : i;
  refrescarJugos();
});

/* — Combos — */
$("#panel-combos").innerHTML = `
  <div class="builder">
    <div class="builder-steps">
      <div class="prod-grid" style="max-width:420px;">
        <article class="prod-card">
          <img src="assets/combo.webp" alt="Combo: ensalada mediana + agua de sabor" class="prod-img" loading="lazy" decoding="async">
          <h3 class="prod-name">Arma tu combo</h3>
          <p class="prod-desc">Ensalada mediana (1 proteína + 3 ingredientes) + agua de sabor. Personalízala igual que una ensalada individual.</p>
          <div class="prod-foot">
            <span class="prod-price">${dinero(COMBO_PAQUETE.precio)}</span>
            <button class="prod-add" type="button" data-combo>Personalizar +</button>
          </div>
        </article>
      </div>
    </div>
  </div>`;

$("#panel-combos").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-combo]");
  if (!btn) return;
  iniciarModoCombo();
});

/* ============================================================
   RESUMEN COMPARTIDO
   Un único componente (#builderSummary: panel sticky con total y
   botón "Agregar al carrito") para TODO el menú. Se mueve a la
   pestaña activa y cada categoría solo aporta sus datos.
   ============================================================ */
let categoriaActiva = "ensaladas";

/* Pinta el panel de resumen. Mismo HTML/CSS/animaciones que Ensaladas. */
function pintarResumen({ titulo, emoji, filas, total, completo, vacio, textoBoton = "Agregar al carrito", mostrarReset = false }) {
  $(".bsum-title").textContent = titulo;
  const body = $("#bsumBody");
  if (!filas || !filas.length) {
    body.innerHTML = `<p class="bsum-empty">${vacio}</p>`;
  } else {
    body.innerHTML = filas
      .map(([l, v]) => `<div class="bsum-row"><span class="bsum-row-label">${l}</span><span class="bsum-row-val">${v}</span></div>`)
      .join("");
  }
  $("#bsumTotalRow").hidden = total == null;
  $("#bsumTotal").textContent = total == null ? "$0" : dinero(total);
  const btn = $("#btnAddSalad");
  btn.disabled = !completo;
  btn.textContent = textoBoton;
  $("#btnResetSalad").hidden = !mostrarReset;
  const bowl = $("#bsumBowl");
  if (bowl.textContent !== emoji) {
    bowl.textContent = emoji;
    bowl.classList.remove("shake");
    void bowl.offsetWidth;
    bowl.classList.add("shake");
  }
}

/* Cada categoría declara cómo pintar el resumen, agregar y reiniciar. */
const ADAPTADORES = {
  ensaladas: {
    render: actualizarBuilder,
    agregar: agregarEnsalada,
    reset: () => resetBuilder(true),
  },
  baguettes: {
    render: resumenBaguettes,
    agregar: () => {
      const b = seleccion.baguette !== null ? BAGUETTES[seleccion.baguette] : null;
      if (!b) return;
      agregarAlCarrito({ nombre: `Baguette ${b.nombre}`, detalles: [], precio: b.precio });
      seleccion.baguette = null;
      refrescarBaguettes();
    },
    reset: () => { seleccion.baguette = null; refrescarBaguettes(); },
  },
  sandwiches: {
    render: resumenSandwich,
    agregar: () => {
      if (seleccion.sandwich === "club") {
        agregarAlCarrito({ nombre: CLUB_SANDWICH.nombre, detalles: [], precio: CLUB_SANDWICH.precio });
      } else if (seleccion.sandwich === "armado" && sandwichState.proteina) {
        agregarAlCarrito({
          nombre: "Sándwich",
          detalles: [`Proteína: ${sandwichState.proteina}`, `Incluye: ${SANDWICH.incluye.join(", ")}`],
          precio: SANDWICH.precio,
          unico: true,
        });
      } else return;
      seleccion.sandwich = null;
      sandwichState.proteina = null;
      refrescarSandwich();
    },
    reset: () => { seleccion.sandwich = null; sandwichState.proteina = null; refrescarSandwich(); },
  },
  bowls:    { render: resumenBowl,    agregar: agregarBowl,    reset: resetBowl },
  licuados: { render: resumenLicuado, agregar: agregarLicuado, reset: resetLicuado },
  jugos: {
    render: resumenJugos,
    agregar: () => {
      const j = seleccion.jugo !== null ? JUGOS[seleccion.jugo] : null;
      if (!j) return;
      agregarAlCarrito({ nombre: j.nombre, detalles: [], precio: j.precio });
      seleccion.jugo = null;
      refrescarJugos();
    },
    reset: () => { seleccion.jugo = null; refrescarJugos(); },
  },
  combos: {
    render: () =>
      pintarResumen({
        titulo: "Tu combo",
        emoji: "🍽️",
        filas: null,
        total: null,
        completo: false,
        vacio: "Toca «Personalizar» y arma la ensalada de tu combo 👆",
      }),
    agregar: () => {},
    reset: () => {},
  },
};

/* Mueve el único panel de resumen a la pestaña activa y lo repinta. */
function moverResumen(cat) {
  categoriaActiva = cat;
  const destino = $(`#panel-${cat} .builder`);
  if (destino) destino.appendChild($("#builderSummary"));
  ADAPTADORES[cat].render();
}

/* Botones compartidos: despachan a la categoría activa. */
$("#btnAddSalad").addEventListener("click", () => ADAPTADORES[categoriaActiva].agregar());
$("#btnResetSalad").addEventListener("click", () => ADAPTADORES[categoriaActiva].reset());

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
  if (e.key === "Escape") cerrarLightbox();
});

/* ============================================================
   BARRA DE PEDIDO (sticky bottom)
   ============================================================ */
$("#cartBarBtn").addEventListener("click", abrirCarrito);

/* Estado inicial */
actualizarBuilder();
actualizarBowl();
actualizarLicuado();
refrescarSandwich();
refrescarBaguettes();
refrescarJugos();
