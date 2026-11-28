import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// =========================================================
// CONEXIÓN A SUPABASE - THE FLAMINGO PALACE (CBTis 225)
// =========================================================
const SUPABASE_URL = "https://jsitctunxaseuseotnty.supabase.co";
const SUPABASE_KEY = "sb_publishable_0zGsk3WyU3wWbKBjRPsC3A_LlExnhEh";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOGO_HOTEL_URL = "https://i.ibb.co/FbTkwz5N/IMAGEN.jpg";

function mostrarPantallaCargaLogo() {
  if (document.getElementById("pantalla-carga-flamingo")) return;
  const overlay = document.createElement("div");
  overlay.id = "pantalla-carga-flamingo";
  overlay.style.cssText = `
    position: fixed; inset: 0;
    z-index: 99999; background: linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 1rem; transition: opacity 0.4s ease;
  `;
  overlay.innerHTML = `
    <img src="${LOGO_HOTEL_URL}" alt="The Flamingo Palace" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; border: 4px solid #ea580c; box-shadow: 0 10px 25px rgba(234, 88, 12, 0.3);">
    <h2 style="margin: 0; color: #c2410c; font-family: system-ui, sans-serif; font-size: 1.5rem;">The Flamingo Palace</h2>
    <p style="margin: 0; color: #78350f; font-family: system-ui, sans-serif; font-size: 0.95rem;">Cargando experiencia frente al mar...</p>
    <div style="width: 220px; height: 6px; background: #fed7aa; border-radius: 999px; overflow: hidden; margin-top: 0.25rem;">
      <div id="barra-carga-flamingo" style="width: 0%; height: 100%; background: #ea580c; transition: width 1.4s linear;"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    const barra = document.getElementById("barra-carga-flamingo");
    if (barra) barra.style.width = "100%";
  });
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 400);
  }, 1500);
}
mostrarPantallaCargaLogo();

const CUPONES_VALIDOS = {
  "NAVIDAD25": 0.25,
  "FLAMINGO50": 0.50
};
let descuentoAplicado = 0;
let codigoCuponActivo = "";
let reservaEnEdicion = null;

const HABITACIONES_CATALOGO = [
  { id: "101_estandar_arena", nombre: "101. Estándar Arena", precio: 1850, capacidad: "Hasta 4 personas", amenidades: ["2 Camas Matrimoniales", "Balcón con vista al jardín tropical", "Aire acondicionado silencioso", "Wi-Fi de alta velocidad", "Smart TV 50\""] },
  { id: "102_estandar_brisa", nombre: "102. Estándar Brisa", precio: 1950, capacidad: "Hasta 2 personas", amenidades: ["Cama Queen Size", "Balcón privado con hamaca", "Acceso directo a alberca", "Frigobar surtido", "Caja fuerte digital"] },
  { id: "103_doble_coral", nombre: "103. Doble Coral", precio: 2200, capacidad: "Hasta 4 personas", amenidades: ["2 Camas Queen Size", "Terraza soleada en planta baja", "Cafetera Nespresso", "Baño con ducha tipo lluvia", "Wi-Fi dedicado"] },
  { id: "104_el_paraiso_hassel", nombre: "104. El Paraíso con Hassel", precio: 2650, capacidad: "Hasta 2 personas", amenidades: ["Cama King Size de lujo", "Sala de lectura iluminada", "Vista panorámica a la bahía de Bucerías", "Desayuno buffet incluido", "Batas y pantuflas"] },
  { id: "105_jardin_palmeras", nombre: "105. Estándar Jardín Palmeras", precio: 1900, capacidad: "Hasta 3 personas", amenidades: ["1 Cama King Size", "Patio privado rodeado de palmeras", "Aire acondicionado", "Smart TV 50\"", "Servicio diario de limpieza"] },
  { id: "106_terraza_marina", nombre: "106. Doble Terraza Marina", precio: 2350, capacidad: "Hasta 4 personas", amenidades: ["2 Camas Matrimoniales", "Terraza amplia con mesa exterior", "Vista parcial al océano", "Minibar incluido", "Secadora y amenidades orgánicas"] },
  { id: "201_suite_flamingo_sol", nombre: "201. Suite Flamingo Sol", precio: 3200, capacidad: "Hasta 2 personas", amenidades: ["Frente al mar con balcón panorámico", "Cama King Size", "Desayuno buffet incluido", "Sala de estar independiente", "Room service 24/7"] },
  { id: "202_suite_atardecer", nombre: "202. Suite Atardecer", precio: 3450, capacidad: "Hasta 3 personas", amenidades: ["Orientación oeste hacia la puesta de sol", "Cama King Size + Sofá cama", "Tina de hidromasaje interior", "Minibar premium", "Wi-Fi de alta velocidad"] },
  { id: "203_suite_costa_dorada", nombre: "203. Suite Costa Dorada", precio: 3800, capacidad: "Hasta 4 personas", amenidades: ["2 Camas Matrimoniales de lujo", "Comedor privado", "Acceso preferencial a camastros", "Vista 180° al Pacífico", "Desayuno y cena incluidos"] },
  { id: "204_bungalow_tropical", nombre: "204. Bungalow Tropical", precio: 4300, capacidad: "Hasta 4 personas", amenidades: ["Cabaña independiente entre palmeras", "A pocos pasos de la arena", "Hamaca y terraza privada", "Cocineta equipada", "Estacionamiento preferencial"] },
  { id: "205_suite_bahia_banderas", nombre: "205. Suite Bahía de Banderas", precio: 3600, capacidad: "Hasta 3 personas", amenidades: ["Balcón esquinero frente a la bahía", "Cama King Size", "Ducha panorámica", "Desayuno gourmet incluido", "Cafetera expreso"] },
  { id: "206_junior_suite_olas", nombre: "206. Junior Suite Olas del Pacífico", precio: 2950, capacidad: "Hasta 2 personas", amenidades: ["Cama King Size", "Balcón privado sobre la playa", "Sala lounge", "Acceso al club de playa", "Smart TV 55\""] },
  { id: "207_suite_familiar_nayarit", nombre: "207. Suite Familiar Nayarit", precio: 4100, capacidad: "Hasta 5 personas", amenidades: ["2 Recámaras conectadas", "Sala de estar familiar", "2 Baños completos", "Vista frontal a alberca y mar", "Desayuno incluido para toda la familia"] },
  { id: "301_master_pacifico", nombre: "301. Master Suite Pacífico", precio: 5100, capacidad: "Hasta 5 personas", amenidades: ["Recámara principal King", "Sala lounge con sofá cama", "Tina de hidromasaje", "Terraza panorámica", "Todo incluido gourmet"] },
  { id: "302_suite_presidencial", nombre: "302. Suite Presidencial", precio: 6500, capacidad: "Hasta 6 personas", amenidades: ["2 Recámaras King", "Jacuzzi privado en terraza panorámica", "Servicio VIP 24 horas", "Sala-comedor de lujo", "Experiencia Todo Incluido Premium"] },
  { id: "303_villa_frente_mar", nombre: "303. Villa Frente al Mar", precio: 5400, capacidad: "Hasta 4 personas", amenidades: ["Acceso directo a la playa privada", "Alberca de inmersión privada", "Cama King Size con dosel", "Terraza con camastros", "Cena romántica incluida"] },
  { id: "304_penthouse_flamingos", nombre: "304. Penthouse Los Flamingos", precio: 6900, capacidad: "Hasta 6 personas", amenidades: ["Nivel superior con vista 360°", "Terraza lounge con jacuzzi exterior", "2 Suites principales", "Mayordomo privado", "Traslado aeropuerto incluido"] },
  { id: "305_suite_luna_miel", nombre: "305. Suite Luna de Miel", precio: 4600, capacidad: "Hasta 2 personas", amenidades: ["Decoración romántica de bienvenida", "Jacuzzi frente al ventanal al mar", "Cama King Size", "Desayuno en la habitación", "Masaje en pareja incluido"] },
  { id: "306_bungalow_arena_blanca", nombre: "306. Bungalow Arena Blanca", precio: 4450, capacidad: "Hasta 4 personas", amenidades: ["Ubicación en primera línea de playa", "Terraza de madera con pérgola", "1 King + 2 Individuales", "Ducha exterior privada", "Club de playa VIP"] },
  { id: "307_gran_suite_imperial", nombre: "307. Gran Suite Imperial", precio: 7200, capacidad: "Hasta 6 personas", amenidades: ["La suite más exclusiva del resort", "Piscina infinity privada en terraza", "2 Recámaras Master + Estudio", "Chef y concierge bajo solicitud", "Todo Incluido Ultra Premium"] }
];

let reservacionesNube = [];
function obtenerReservaciones() { return reservacionesNube; }

// =========================================================
// SINCRONIZACIÓN RELACIONAL CON LAS 3 TABLAS DE SUPABASE
// =========================================================
async function sincronizarDesdeSupabase() {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    // Liberar en tabla habitaciones cualquier cuarto vencido
    await supabase
      .from("habitaciones")
      .update({ estado: "Libre", ocupada_hasta: null, folio_actual: null })
      .eq("estado", "Ocupada")
      .lt("ocupada_hasta", hoy);

    // Consultar ingresos_reservaciones con JOIN hacia usuarios (PK/FK)
    const { data, error } = await supabase
      .from("ingresos_reservaciones")
      .select(`
        *,
        usuarios ( usuario, nombre, correo, telefono, password )
      `)
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error al sincronizar con Supabase:", error);
      return;
    }

    // Adaptar columnas SQL al formato interno de tu aplicación
    reservacionesNube = (data || []).map(row => ({
      docId: row.folio,
      folio: row.folio,
      usuario: row.usuario_fk,
      nombre: row.usuarios ? row.usuarios.nombre : row.usuario_fk,
      correo: row.usuarios ? row.usuarios.correo : "",
      telefono: row.usuarios ? row.usuarios.telefono : "",
      password: row.usuarios ? row.usuarios.password : "",
      habitaciones: Array.isArray(row.habitaciones_ids)
        ? row.habitaciones_ids
        : (row.habitacion_principal_fk ? [row.habitacion_principal_fk] : []),
      fechaEntrada: row.fecha_entrada,
      fechaLimite: row.fecha_limite,
      adultos: row.adultos ?? 1,
      infantes: row.infantes ?? 0,
      comentarios: row.comentarios || "",
      cupon: row.cupon || "Ninguno",
      total: Number(row.total_ingresado) || 0,
      estado: row.estado || "Activa",
      creadoEn: row.creado_en || new Date().toISOString()
    }));

    // Refrescar todas las vistas activas en pantalla
    actualizarIndicadoresInicio();
    actualizarCatalogoServicios();
    renderizarCheckboxesHabitaciones();
    calcularCotizacion();
    if (sessionStorage.getItem("flamingo_admin_sesion") === "true") {
      renderizarDashboardAdmin();
    }
  } catch (err) {
    console.error("Error general de sincronización Supabase:", err);
  }
}

// =========================================================
// CONTROL DE DISPONIBILIDAD POR FECHAS Y RESERVAS FUTURAS
// =========================================================
function obtenerEstadoHabitacion(habId, excluirFolio = null) {
  const hoy = new Date().toISOString().split("T")[0];
  const reservasActivas = obtenerReservaciones().filter(res =>
    (res.estado === "Activa" || res.estado === "Pagada") &&
    res.folio !== excluirFolio &&
    Array.isArray(res.habitaciones) &&
    res.habitaciones.includes(habId)
  );

  // 1. Ocupada hoy mismo (fechaEntrada <= hoy < fechaLimite)
  const ocupadaHoy = reservasActivas.find(res =>
    res.fechaEntrada <= hoy && res.fechaLimite > hoy
  );
  if (ocupadaHoy) {
    return {
      ocupada: true,
      futura: false,
      huesped: ocupadaHoy.nombre,
      hasta: ocupadaHoy.fechaLimite,
      folio: ocupadaHoy.folio,
      estadoPago: ocupadaHoy.estado
    };
  }

  // 2. Libre hoy, pero con reserva futura próxima (ej. inicia el 30 nov -> disponible hasta el 30 nov)
  const proximaReserva = reservasActivas
    .filter(res => res.fechaEntrada > hoy)
    .sort((a, b) => a.fechaEntrada.localeCompare(b.fechaEntrada))[0];

  if (proximaReserva) {
    return {
      ocupada: false,
      futura: true,
      huesped: proximaReserva.nombre,
      disponibleHasta: proximaReserva.fechaEntrada,
      hasta: proximaReserva.fechaLimite,
      folio: proximaReserva.folio,
      estadoPago: proximaReserva.estado
    };
  }

  return { ocupada: false, futura: false };
}

// Verifica si el rango [entrada, limite] se traslapa con una reserva existente
// Permite salir el mismo día que empieza la siguiente reserva (limite <= res.fechaEntrada)
function verificarCruceFechas(habId, entrada, limite, excluirFolio = null) {
  if (!entrada || !limite) return null;
  const reservasCuarto = obtenerReservaciones().filter(res =>
    (res.estado === "Activa" || res.estado === "Pagada") &&
    res.folio !== excluirFolio &&
    Array.isArray(res.habitaciones) &&
    res.habitaciones.includes(habId)
  );

  return reservasCuarto.find(res => entrada < res.fechaLimite && limite > res.fechaEntrada) || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const btnMenu = document.getElementById("menu-toggle");
  const btnCerrarMenu = document.getElementById("menu-close");
  const navLinks = document.getElementById("nav-links");

  if (btnMenu && navLinks) {
    btnMenu.addEventListener("click", () => {
      navLinks.classList.add("abierto");
      btnMenu.setAttribute("aria-expanded", "true");
    });
  }
  if (btnCerrarMenu && navLinks) {
    btnCerrarMenu.addEventListener("click", () => {
      navLinks.classList.remove("abierto");
      btnMenu.setAttribute("aria-expanded", "false");
    });
  }
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(enlace => {
      enlace.addEventListener("click", () => {
        navLinks.classList.remove("abierto");
        if (btnMenu) btnMenu.setAttribute("aria-expanded", "false");
      });
    });
  }

  inicializarFormularioReserva();
  inicializarConsultaHuesped();
  inicializarRecuperacionCuenta();
  inicializarPanelAdmin();
  inicializarFiltrosCatalogo();
  inicializarModalesHabitaciones();

  // Cargar datos iniciales desde Supabase y suscribirse a cambios en tiempo real
  await sincronizarDesdeSupabase();

  supabase
    .channel("cambios-flamingo-palace")
    .on("postgres_changes", { event: "*", schema: "public", table: "ingresos_reservaciones" }, () => {
      sincronizarDesdeSupabase();
    })
    .subscribe();
});

function actualizarIndicadoresInicio() {
  const textoContador = document.getElementById("contador-libres-inicio");
  const barra = document.getElementById("barra-disponibilidad");
  if (!textoContador || !barra) return;
  const totalHabs = HABITACIONES_CATALOGO.length;
  let libres = 0;
  HABITACIONES_CATALOGO.forEach(hab => {
    if (!obtenerEstadoHabitacion(hab.id).ocupada) libres++;
  });
  textoContador.textContent = `${libres} / ${totalHabs}`;
  barra.max = totalHabs;
  barra.value = libres;
}

function actualizarCatalogoServicios() {
  const contenedor = document.getElementById("catalogo-habitaciones");
  if (!contenedor) return;
  HABITACIONES_CATALOGO.forEach(hab => {
    const estado = obtenerEstadoHabitacion(hab.id);
    const badge = document.querySelector(`[data-badge="${hab.id}"]`);
    const btn = document.querySelector(`[data-btn="${hab.id}"]`);
    if (badge && btn) {
      if (estado.ocupada) {
        badge.textContent = `Ocupada hasta el ${estado.hasta}`;
        badge.className = "estado-badge ocupada";
        btn.textContent = `Se desocupa el ${estado.hasta}`;
        btn.classList.add("deshabilitado");
      } else if (estado.futura) {
        badge.textContent = `Disponible hasta el ${estado.disponibleHasta}`;
        badge.className = "estado-badge futura";
        btn.textContent = `Reservar (antes del ${estado.disponibleHasta})`;
        btn.classList.remove("deshabilitado");
      } else {
        badge.textContent = "Disponible";
        badge.className = "estado-badge libre";
        btn.textContent = `Reservar ${hab.nombre.split(". ")[1]}`;
        btn.classList.remove("deshabilitado");
      }
    }
  });
}

function inicializarFiltrosCatalogo() {
  const selectFiltro = document.getElementById("filtro-catalogo-habitaciones");
  const contenedor = document.getElementById("catalogo-habitaciones");
  if (!selectFiltro || !contenedor) return;
  selectFiltro.addEventListener("change", () => {
    const criterio = selectFiltro.value;
    contenedor.querySelectorAll("article.card").forEach(card => {
      const habId = card.dataset.habId;
      const infoHab = HABITACIONES_CATALOGO.find(h => h.id === habId);
      const ocupada = obtenerEstadoHabitacion(habId).ocupada;
      if (!infoHab) return;
      let mostrar = true;
      if (criterio === "disponibles" && ocupada) mostrar = false;
      if (criterio === "economicas" && infoHab.precio >= 2500) mostrar = false;
      if (criterio === "suites" && infoHab.precio < 3000) mostrar = false;
      card.style.display = mostrar ? "" : "none";
    });
  });
}

function inicializarModalesHabitaciones() {
  const enlacesReserva = document.querySelectorAll('article.card a[href*="contacto.html?hab="]');
  if (enlacesReserva.length === 0) return;
  const modal = document.createElement("dialog");
  modal.id = "modal-detalle-habitacion";
  modal.style.cssText = `
    border: none; border-radius: 16px;
    padding: 0; max-width: 500px; width: 92%;
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.3); background: #ffffff; color: #1e293b;
  `;
  document.body.appendChild(modal);
  enlacesReserva.forEach(enlace => {
    const url = new URL(enlace.href, window.location.origin);
    const habId = url.searchParams.get("hab");
    const infoHab = HABITACIONES_CATALOGO.find(h => h.id === habId);
    if (!infoHab || enlace.parentElement.querySelector(".btn-ver-detalles-hab")) return;
    const btnDetalles = document.createElement("button");
    btnDetalles.type = "button";
    btnDetalles.className = "btn-secondary btn-ver-detalles-hab";
    btnDetalles.textContent = "Ver amenidades";
    btnDetalles.style.cssText = "margin-top: 0.5rem; font-size: 0.9rem;";
    btnDetalles.addEventListener("click", () => {
      const estado = obtenerEstadoHabitacion(infoHab.id);
      const listaAmenidades = infoHab.amenidades.map(item => `<li style="margin-bottom: 0.35rem;">✓ ${item}</li>`).join("");
      modal.innerHTML = `
        <article style="padding: 1.5rem;">
          <header style="display: flex; justify-content: space-between; align-items: start; gap: 1rem; border-bottom: 1px solid #fde68a; padding-bottom: 0.75rem;">
            <div>
              <h3 style="margin: 0; color: #c2410c;">${infoHab.nombre}</h3>
              <small style="color: #57534e;">${infoHab.capacidad} • <strong>$${infoHab.precio.toLocaleString("es-MX")} MXN / noche</strong></small>
            </div>
            <button type="button" id="cerrar-modal-hab" aria-label="Cerrar detalles" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #57534e;">✕</button>
          </header>
          <div style="margin: 1rem 0;">
            <p style="font-weight: 600; margin-bottom: 0.5rem;">Amenidades incluidas:</p>
            <ul style="list-style: none; padding: 0; margin: 0; color: #292524;">
              ${listaAmenidades}
            </ul>
          </div>
          <footer style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem;">
            <button type="button" id="cerrar-modal-hab-btn" class="btn-secondary">Cerrar</button>
            ${estado.ocupada
              ? `<span style="padding: 0.6rem 1rem; background: #fee2e2; color: #991b1b; border-radius: 8px; font-weight: 600; font-size: 0.9rem;">Ocupada hasta ${estado.hasta}</span>`
              : `<a href="contacto.html?hab=${infoHab.id}#formulario" class="btn-primary">${estado.futura ? `Reservar (antes del ${estado.disponibleHasta})` : "Reservar ahora"}</a>`
            }
          </footer>
        </article>
      `;
      modal.showModal();
      modal.querySelector("#cerrar-modal-hab").addEventListener("click", () => modal.close());
      modal.querySelector("#cerrar-modal-hab-btn").addEventListener("click", () => modal.close());
    });
    enlace.insertAdjacentElement("afterend", btnDetalles);
  });
}

function marcarEstadoCampo(inputId, errId, esValido, mensajeError = "") {
  const campo = document.getElementById(inputId);
  const label = document.querySelector(`label[for="${inputId}"]`);
  const errEl = errId ? document.getElementById(errId) : null;
  if (campo) {
    campo.classList.remove("campo-error", "campo-valido");
    campo.classList.add(esValido ? "campo-valido" : "campo-error");
  }
  if (label) {
    label.classList.remove("label-error", "label-valido");
    label.classList.add(esValido ? "label-valido" : "label-error");
  }
  if (errEl) errEl.textContent = esValido ? "" : mensajeError;
}

function marcarEstadoHabitaciones(esValido, mensajeError = "") {
  const grid = document.getElementById("lista-checkbox-habitaciones");
  const errEl = document.getElementById("err-habitaciones");
  if (grid) {
    grid.classList.remove("campo-error", "campo-valido");
    grid.classList.add(esValido ? "campo-valido" : "campo-error");
    grid.querySelectorAll("label.checkbox-item").forEach(lbl => {
      lbl.classList.remove("label-error", "label-valido");
      const cb = lbl.querySelector('input[type="checkbox"]');
      if (cb && cb.checked) lbl.classList.add("label-valido");
      else if (!esValido) lbl.classList.add("label-error");
    });
  }
  if (errEl) errEl.textContent = esValido ? "" : mensajeError;
}

function limpiarEstadosVisualesFormulario() {
  const form = document.getElementById("form-reservacion");
  if (!form) return;
  form.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
  form.querySelectorAll("label").forEach(lbl => lbl.classList.remove("label-error", "label-valido"));
  form.querySelectorAll("input, textarea, .checkbox-grid").forEach(el => el.classList.remove("campo-error", "campo-valido"));
}

function renderizarCheckboxesHabitaciones() {
  const listaCheckboxes = document.getElementById("lista-checkbox-habitaciones");
  if (!listaCheckboxes) return;
  const params = new URLSearchParams(window.location.search);
  const habPreseleccionada = params.get("hab");
  const entradaElegida = document.getElementById("fecha_entrada")?.value || "";
  const limiteElegida = document.getElementById("fecha_limite")?.value || "";
  const folioActual = reservaEnEdicion ? reservaEnEdicion.folio : null;

  const marcadasPrevias = new Set(
    Array.from(listaCheckboxes.querySelectorAll('input[name="habitaciones"]:checked')).map(cb => cb.value)
  );
  listaCheckboxes.innerHTML = "";
  HABITACIONES_CATALOGO.forEach(hab => {
    const estado = obtenerEstadoHabitacion(hab.id, folioActual);
    const cruceFechas = verificarCruceFechas(hab.id, entradaElegida, limiteElegida, folioActual);
    const bloqueada = estado.ocupada || Boolean(cruceFechas);

    const label = document.createElement("label");
    label.className = bloqueada ? "checkbox-item ocupada-item" : "checkbox-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "habitaciones";
    checkbox.value = hab.id;
    checkbox.dataset.precio = hab.precio;

    if (bloqueada) checkbox.disabled = true;
    else if (marcadasPrevias.has(hab.id) || (!listaCheckboxes.dataset.cargado && habPreseleccionada === hab.id)) checkbox.checked = true;

    checkbox.addEventListener("change", () => {
      calcularCotizacion();
      const seleccionadas = document.querySelectorAll('input[name="habitaciones"]:checked');
      if (seleccionadas.length > 0) marcarEstadoHabitaciones(true);
      else marcarEstadoHabitaciones(false, "Selecciona al menos una habitación disponible.");
    });

    const texto = document.createElement("span");
    if (estado.ocupada) {
      texto.innerHTML = `<strong>${hab.nombre}</strong> — <em>Ocupada hasta ${estado.hasta}</em>`;
    } else if (cruceFechas) {
      texto.innerHTML = `<strong>${hab.nombre}</strong> — <em>Reservada del ${cruceFechas.fechaEntrada} al ${cruceFechas.fechaLimite}</em>`;
    } else if (estado.futura) {
      texto.innerHTML = `<strong>${hab.nombre}</strong> ($${hab.precio.toLocaleString("es-MX")} MXN/noche) — <strong style="color:#b45309;">Disponible hasta el ${estado.disponibleHasta}</strong>`;
    } else {
      texto.innerHTML = `<strong>${hab.nombre}</strong> ($${hab.precio.toLocaleString("es-MX")} MXN/noche)`;
    }

    label.appendChild(checkbox);
    label.appendChild(texto);
    listaCheckboxes.appendChild(label);
  });
  listaCheckboxes.dataset.cargado = "true";
}

function cargarReservaEnFormulario(reserva) {
  const form = document.getElementById("form-reservacion");
  if (!form || !reserva) return;
  reservaEnEdicion = reserva.estado === "Activa" ? reserva : null;
  limpiarEstadosVisualesFormulario();

  document.getElementById("nombre").value = reserva.nombre || "";
  document.getElementById("correo").value = reserva.correo || "";
  document.getElementById("telefono").value = reserva.telefono || "";
  document.getElementById("usuario_huesped").value = reserva.usuario || "";
  document.getElementById("password_huesped").value = reserva.password || "";
  document.getElementById("fecha_entrada").value = reserva.fechaEntrada || "";
  document.getElementById("fecha_limite").value = reserva.fechaLimite || "";
  document.getElementById("adultos").value = reserva.adultos ?? 1;
  document.getElementById("infantes").value = reserva.infantes ?? 0;
  document.getElementById("comentarios").value = reserva.comentarios || "";

  const inputCupon = document.getElementById("codigo_cupon");
  const msgCupon = document.getElementById("msg-cupon");
  if (reserva.cupon && CUPONES_VALIDOS[reserva.cupon]) {
    descuentoAplicado = CUPONES_VALIDOS[reserva.cupon];
    codigoCuponActivo = reserva.cupon;
    if (inputCupon) inputCupon.value = reserva.cupon;
    if (msgCupon) { msgCupon.style.color = "#15803d"; msgCupon.textContent = `✓ Cupón ${reserva.cupon} aplicado (${descuentoAplicado * 100}% de descuento).`; }
  } else {
    descuentoAplicado = 0;
    codigoCuponActivo = "";
    if (inputCupon) inputCupon.value = "";
    if (msgCupon) msgCupon.textContent = "";
  }

  renderizarCheckboxesHabitaciones();
  document.querySelectorAll('input[name="habitaciones"]').forEach(cb => {
    cb.checked = Array.isArray(reserva.habitaciones) && reserva.habitaciones.includes(cb.value);
  });

  calcularCotizacion();

  const btnSubmit = form.querySelector('button[type="submit"]');
  if (btnSubmit) {
    if (!btnSubmit.dataset.textoOriginal) btnSubmit.dataset.textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = reservaEnEdicion ? "Guardar Cambios de Reservación" : btnSubmit.dataset.textoOriginal;
  }

  mostrarAlertaFormulario(
    reservaEnEdicion
      ? `Datos de tu reservación ${reserva.folio} cargados en el formulario. Modifica lo que necesites y presiona "Guardar Cambios de Reservación".`
      : `Datos de la reservación ${reserva.folio} cargados. Al enviarla se generará una nueva reservación.`,
    "exito"
  );
}

function inicializarFormularioReserva() {
  const form = document.getElementById("form-reservacion");
  const listaCheckboxes = document.getElementById("lista-checkbox-habitaciones");
  if (!form || !listaCheckboxes) return;

  renderizarCheckboxesHabitaciones();

  const hoy = new Date().toISOString().split("T")[0];
  const inputEntrada = document.getElementById("fecha_entrada");
  const inputLimite = document.getElementById("fecha_limite");
  inputEntrada.min = hoy;
  inputLimite.min = hoy;
  const btnCupon = document.getElementById("btn-aplicar-cupon");
  const inputCupon = document.getElementById("codigo_cupon");
  const msgCupon = document.getElementById("msg-cupon");

  if (btnCupon && inputCupon && msgCupon) {
    btnCupon.addEventListener("click", () => {
      const code = inputCupon.value.trim().toUpperCase();
      if (CUPONES_VALIDOS[code]) {
        descuentoAplicado = CUPONES_VALIDOS[code];
        codigoCuponActivo = code;
        msgCupon.style.color = "#15803d";
        msgCupon.textContent = `✓ Cupón ${code} aplicado (${descuentoAplicado * 100}% de descuento).`;
      } else {
        descuentoAplicado = 0;
        codigoCuponActivo = "";
        msgCupon.style.color = "#dc2626";
        msgCupon.textContent = "Cupón no válido. Prueba con NAVIDAD25 o FLAMINGO50.";
      }
      calcularCotizacion();
    });
  }

  const validarCampos = () => {
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const usuario = document.getElementById("usuario_huesped").value.trim();
    const password = document.getElementById("password_huesped").value.trim();
    const fechaEntrada = inputEntrada.value;
    const fechaLimite = inputLimite.value;
    const adultos = parseInt(document.getElementById("adultos").value, 10) || 0;
    const infantesVal = document.getElementById("infantes").value;
    const infantes = parseInt(infantesVal, 10);
    const comentarios = document.getElementById("comentarios").value.trim();
    const seleccionadas = Array.from(document.querySelectorAll('input[name="habitaciones"]:checked')).map(cb => cb.value);

    let valido = true;

    if (nombre.length < 3) { marcarEstadoCampo("nombre", "err-nombre", false, "Ingresa tu nombre completo elemplo Axel Bueno Vallejo."); valido = false; }
    else marcarEstadoCampo("nombre", "err-nombre", true);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { marcarEstadoCampo("correo", "err-correo", false, "Ingresa un correo electrónico válido con el formato axel@gmail.com."); valido = false; }
    else marcarEstadoCampo("correo", "err-correo", true);

    if (!/^[0-9]{10}$/.test(telefono)) { marcarEstadoCampo("telefono", "err-telefono", false, "El teléfono debe tener exactamente 10 dígitos numéricos ejemplo 4778900989."); valido = false; }
    else marcarEstadoCampo("telefono", "err-telefono", true);

    if (usuario.length < 4) { marcarEstadoCampo("usuario_huesped", "err-usuario", false, "El usuario debe tener al menos 4 caracteres. EJEMPLO AXEL2026.LL"); valido = false; }
    else marcarEstadoCampo("usuario_huesped", "err-usuario", true);

    if (password.length < 4) { marcarEstadoCampo("password_huesped", "err-password", false, "La contraseña debe tener al menos 4 caracteres."); valido = false; }
    else marcarEstadoCampo("password_huesped", "err-password", true);

    if (seleccionadas.length === 0) { marcarEstadoHabitaciones(false, "Selecciona al menos una habitación disponible."); valido = false; }
    else marcarEstadoHabitaciones(true);

    if (!fechaEntrada) { marcarEstadoCampo("fecha_entrada", "err-entrada", false, "Selecciona la fecha de llegada."); valido = false; }
    else marcarEstadoCampo("fecha_entrada", "err-entrada", true);

    if (!fechaLimite || fechaLimite <= fechaEntrada) { marcarEstadoCampo("fecha_limite", "err-limite", false, "La fecha límite de salida debe ser posterior a la fecha de llegada."); valido = false; }
    else marcarEstadoCampo("fecha_limite", "err-limite", true);

    if (adultos < 1) { marcarEstadoCampo("adultos", "err-adultos", false, "Debe haber al menos 1 adulto en la reservación."); valido = false; }
    else marcarEstadoCampo("adultos", "err-adultos", true);

    if (infantesVal === "" || isNaN(infantes) || infantes < 0) { marcarEstadoCampo("infantes", null, false); valido = false; }
    else marcarEstadoCampo("infantes", null, true);

    if (comentarios.length < 10) { marcarEstadoCampo("comentarios", "err-comentarios", false, "Escribe un comentario o petición de al menos 10 caracteres."); valido = false; }
    else marcarEstadoCampo("comentarios", "err-comentarios", true);

    return {
      valido,
      datos: {
        nombre, correo, telefono, usuario, password,
        habitaciones: seleccionadas, fechaEntrada, fechaLimite,
        adultos, infantes: isNaN(infantes) ? 0 : infantes, comentarios
      }
    };
  };

  ["nombre", "correo", "telefono", "usuario_huesped", "password_huesped", "adultos", "infantes", "comentarios"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        if (el.classList.contains("campo-error") || el.classList.contains("campo-valido")) validarCampos();
      });
    }
  });
  inputEntrada.addEventListener("change", () => {
    inputLimite.min = inputEntrada.value || hoy;
    renderizarCheckboxesHabitaciones();
    calcularCotizacion();
    if (inputEntrada.classList.contains("campo-error") || inputEntrada.classList.contains("campo-valido")) validarCampos();
  });
  inputLimite.addEventListener("change", () => {
    renderizarCheckboxesHabitaciones();
    calcularCotizacion();
    if (inputLimite.classList.contains("campo-error") || inputLimite.classList.contains("campo-valido")) validarCampos();
  });
  calcularCotizacion();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { valido, datos } = validarCampos();
    if (!valido) {
      mostrarAlertaFormulario("Por favor corrige los campos marcados en rojo antes de continuar.", "error");
      return;
    }

    const folioExcluido = reservaEnEdicion ? reservaEnEdicion.folio : null;
    const ocupadaReciente = datos.habitaciones.find(id => {
      const est = obtenerEstadoHabitacion(id, folioExcluido);
      const cruce = verificarCruceFechas(id, datos.fechaEntrada, datos.fechaLimite, folioExcluido);
      return est.ocupada || Boolean(cruce);
    });
    if (ocupadaReciente) {
      renderizarCheckboxesHabitaciones();
      marcarEstadoHabitaciones(false, "Una de las habitaciones elegidas ya está ocupada o apartada en esas fechas. Elige otra disponible.");
      mostrarAlertaFormulario("Una de las habitaciones elegidas choca con una reservación existente. Por favor ajusta tus fechas o selecciona otra habitación.", "error");
      return;
    }

    const totalConfirmar = calcularCotizacion();
    const mensajeConfirm = reservaEnEdicion
      ? `¿Estás seguro de guardar los cambios en la reservación ${reservaEnEdicion.folio} a nombre de ${datos.nombre} del ${datos.fechaEntrada} al ${datos.fechaLimite} por $${totalConfirmar.toLocaleString("es-MX")} MXN?`
      : `RECUERDA QUE EL PAGO ES EN EFECTIVO EL FOLIO ES UN COMPROBANTE ¿Estás seguro de realizar esta reservación a nombre de ${datos.nombre} del ${datos.fechaEntrada} al ${datos.fechaLimite} por $${totalConfirmar.toLocaleString("es-MX")} MXN?`;
    if (!confirm(mensajeConfirm)) return;

    const btnSubmit = form.querySelector('button[type="submit"]');
    if (!btnSubmit.dataset.textoOriginal) btnSubmit.dataset.textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = reservaEnEdicion ? "Guardando cambios..." : "Registrando reservación...";

    try {
      const total = calcularCotizacion();
      const editando = Boolean(reservaEnEdicion && reservaEnEdicion.docId);
      const folio = editando ? reservaEnEdicion.folio : "FP-" + Math.floor(1000 + Math.random() * 9000);

      // Calcular noches y montos para la tabla relacional ingresos_reservaciones
      let noches = 1;
      if (datos.fechaEntrada && datos.fechaLimite && datos.fechaLimite > datos.fechaEntrada) {
        noches = Math.ceil((new Date(datos.fechaLimite) - new Date(datos.fechaEntrada)) / (1000 * 60 * 60 * 24));
      }
      const subtotal = datos.habitaciones.reduce((acc, id) => {
        const h = HABITACIONES_CATALOGO.find(item => item.id === id);
        return acc + (h ? h.precio : 0);
      }, 0) * noches;
      const ahorro = Math.round(subtotal * descuentoAplicado);

      // 1. Registrar/actualizar huésped en tabla maestra "usuarios" (PK: usuario)
      const { error: errorUser } = await supabase
        .from("usuarios")
        .upsert([{
          usuario: datos.usuario,
          nombre: datos.nombre,
          correo: datos.correo,
          telefono: datos.telefono,
          password: datos.password
        }], { onConflict: "usuario" });

      if (errorUser) throw errorUser;

      // 2. Guardar o actualizar reservación en tabla "ingresos_reservaciones" (PK: folio, FKs: usuario_fk, habitacion_principal_fk)
      const payloadSQL = {
        folio: folio,
        usuario_fk: datos.usuario,
        habitacion_principal_fk: datos.habitaciones[0],
        habitaciones_ids: datos.habitaciones,
        fecha_entrada: datos.fechaEntrada,
        fecha_limite: datos.fechaLimite,
        adultos: datos.adultos,
        infantes: datos.infantes,
        comentarios: datos.comentarios,
        cupon: codigoCuponActivo || "Ninguno",
        noches: noches,
        subtotal: subtotal,
        descuento: ahorro,
        total_ingresado: total,
        estado: "Activa"
      };

      if (editando) {
        // Liberar habitaciones anteriores que ya no estén en la edición
        const anteriores = reservaEnEdicion.habitaciones || [];
        const liberadas = anteriores.filter(id => !datos.habitaciones.includes(id));
        if (liberadas.length > 0) {
          await supabase
            .from("habitaciones")
            .update({ estado: "Libre", ocupada_hasta: null, folio_actual: null })
            .in("id_habitacion", liberadas);
        }

        const { error: errorUpd } = await supabase
          .from("ingresos_reservaciones")
          .update(payloadSQL)
          .eq("folio", folio);
        if (errorUpd) throw errorUpd;
      } else {
        const { error: errorIns } = await supabase
          .from("ingresos_reservaciones")
          .insert([payloadSQL]);
        if (errorIns) throw errorIns;
      }

      // 3. Actualizar tabla "habitaciones" solo si la reservación ya inicia hoy o antes
      if (datos.fechaEntrada <= hoy) {
        await supabase
          .from("habitaciones")
          .update({
            estado: "Ocupada",
            ocupada_hasta: datos.fechaLimite,
            folio_actual: folio
          })
          .in("id_habitacion", datos.habitaciones);
      }

      const reservaFinal = {
        folio,
        ...datos,
        cupon: codigoCuponActivo || "Ninguno",
        total,
        estado: "Activa",
        creadoEn: editando ? reservaEnEdicion.creadoEn : new Date().toISOString()
      };

      await sincronizarDesdeSupabase();
      mostrarComprobanteTicket(reservaFinal);

      reservaEnEdicion = null;
      form.reset();
      descuentoAplicado = 0;
      codigoCuponActivo = "";
      if (msgCupon) msgCupon.textContent = "";
      limpiarEstadosVisualesFormulario();
      renderizarCheckboxesHabitaciones();
      calcularCotizacion();

      mostrarAlertaFormulario(
        editando
          ? `¡Reservación ${folio} actualizada correctamente a nombre de ${datos.nombre}!`
          : `RECUERDA QUE EL PAGO ES EN FISICO ESTO ES UNA FORMA DE RESERVA DEL HOTEL PAGOS EN EFECTIVO!!!!! ¡Reservación registrada a nombre de ${datos.nombre}! Folio: ${folio}. Guarda tu usuario (${datos.usuario}) para consultar o cancelar.`,
        "exito"
      );
    } catch (error) {
      console.error("Error al guardar en Supabase:", error);
      mostrarAlertaFormulario("Error al conectar con la base de datos Supabase: " + (error.message || "Verifica tu conexión."), "error");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = btnSubmit.dataset.textoOriginal;
    }
  });
}

function mostrarComprobanteTicket(reserva) {
  const contenedorTicket = document.getElementById("ticket-confirmacion");
  if (!contenedorTicket) return;
  const nombresHabs = reserva.habitaciones.map(id => {
    const h = HABITACIONES_CATALOGO.find(item => item.id === id);
    return h ? h.nombre : id;
  }).join(", ");
  contenedorTicket.hidden = false;
  contenedorTicket.innerHTML = `
    <article id="area-impresion-ticket" style="margin-bottom: 1.5rem; padding: 1.5rem; background: #fffbeb; border: 2px dashed #ea580c; border-radius: 12px;">
      <header style="display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid #fde68a; padding-bottom: 1rem; margin-bottom: 1rem;">
        <img src="${LOGO_HOTEL_URL}" alt="The Flamingo Palace" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #ea580c;">
        <div>
          <h3 style="margin: 0; color: #c2410c;">Comprobante Oficial de Reservación</h3>
          <small style="color: #57534e;">The Flamingo Palace • Bucerías, Nayarit</small>
        </div>
      </header>
      <p><strong>Folio:</strong> ${reserva.folio}</p>
      <p><strong>Huésped:</strong> ${reserva.nombre} (Usuario: ${reserva.usuario})</p>
      <p><strong>Habitaciones:</strong> ${nombresHabs}</p>
      <p><strong>Estancia:</strong> ${reserva.fechaEntrada} al ${reserva.fechaLimite} (${reserva.adultos} adultos, ${reserva.infantes} infantes)</p>
      <p><strong>Cupón aplicado:</strong> ${reserva.cupon}</p>
      <p style="font-size: 1.15rem; margin-top: 0.5rem;"><strong>Total a Pagar en Recepción: $${reserva.total.toLocaleString("es-MX")} MXN</strong></p>
      <button type="button" onclick="window.print()" class="btn-primary" style="margin-top: 1rem;">Imprimir / Guardar PDF</button>
    </article>
  `;
}

function calcularCotizacion() {
  const resumen = document.getElementById("resumen-cotizacion");
  if (!resumen) return 0;
  const entrada = document.getElementById("fecha_entrada")?.value;
  const limite = document.getElementById("fecha_limite")?.value;
  const seleccionadas = Array.from(document.querySelectorAll('input[name="habitaciones"]:checked'));
  let noches = 1;
  if (entrada && limite && limite > entrada) {
    const diff = new Date(limite) - new Date(entrada);
    noches = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  const subtotal = seleccionadas.reduce((acc, cb) => acc + Number(cb.dataset.precio), 0) * noches;
  const ahorro = Math.round(subtotal * descuentoAplicado);
  const total = subtotal - ahorro;
  resumen.innerHTML = descuentoAplicado > 0
    ? `Total (${seleccionadas.length} hab. × ${noches} noche${noches > 1 ? "s" : ""}) con cupón <strong>${codigoCuponActivo}</strong>: <strong>$${total.toLocaleString("es-MX")} MXN</strong>`
    : `Total estimado (${seleccionadas.length} hab. × ${noches} noche${noches > 1 ? "s" : ""}): <strong>$${total.toLocaleString("es-MX")} MXN</strong>`;
  return total;
}

function mostrarAlertaFormulario(mensaje, tipo) {
  const alerta = document.getElementById("alerta-formulario");
  if (!alerta) return;
  alerta.textContent = mensaje;
  alerta.className = `alerta-box ${tipo}`;
  alerta.hidden = false;
  alerta.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

window.editarMiReservacion = function(folio) {
  const reserva = obtenerReservaciones().find(r => r.folio === folio);
  if (reserva) cargarReservaEnFormulario(reserva);
};

// =========================================================
// CIERRE DE SESIÓN COMPLETO EN CABECERA, RESERVACIONES Y CONSULTA
// =========================================================
window.cerrarSesionHuesped = function() {
  reservaEnEdicion = null;
  descuentoAplicado = 0;
  codigoCuponActivo = "";
  sessionStorage.removeItem("flamingo_huesped_sesion");

  const formConsulta = document.getElementById("form-consulta-huesped");
  const contenedorResultado = document.getElementById("resultado-reserva-huesped");
  const btnCerrarHuesped = document.getElementById("btn-cerrar-sesion-huesped");
  const btnCerrarHeader = document.getElementById("btn-cerrar-huesped-header");
  const formRecuperar = document.getElementById("form-recuperar-cuenta");
  const salidaRec = document.getElementById("resultado-recuperacion");
  if (formConsulta) formConsulta.reset();
  if (formRecuperar) {
    formRecuperar.reset();
    formRecuperar.hidden = true;
  }
  if (salidaRec) salidaRec.innerHTML = "";
  if (contenedorResultado) {
    contenedorResultado.innerHTML = "";
    contenedorResultado.hidden = true;
  }
  if (btnCerrarHuesped) btnCerrarHuesped.hidden = true;
  if (btnCerrarHeader) btnCerrarHeader.hidden = true;

  const formReserva = document.getElementById("form-reservacion");
  const alerta = document.getElementById("alerta-formulario");
  const ticket = document.getElementById("ticket-confirmacion");
  const msgCupon = document.getElementById("msg-cupon");
  if (formReserva) {
    formReserva.reset();
    const btnSubmit = formReserva.querySelector('button[type="submit"]');
    if (btnSubmit && btnSubmit.dataset.textoOriginal) {
      btnSubmit.textContent = btnSubmit.dataset.textoOriginal;
    }
  }
  if (alerta) alerta.hidden = true;
  if (ticket) {
    ticket.innerHTML = "";
    ticket.hidden = true;
  }
  if (msgCupon) msgCupon.textContent = "";

  limpiarEstadosVisualesFormulario();
  renderizarCheckboxesHabitaciones();
  calcularCotizacion();
};

function inicializarConsultaHuesped() {
  const formConsulta = document.getElementById("form-consulta-huesped");
  const contenedorResultado = document.getElementById("resultado-reserva-huesped");
  const btnCerrarHuesped = document.getElementById("btn-cerrar-sesion-huesped");
  const btnCerrarHeader = document.getElementById("btn-cerrar-huesped-header");
  if (!formConsulta || !contenedorResultado) return;

  if (btnCerrarHuesped) btnCerrarHuesped.addEventListener("click", window.cerrarSesionHuesped);
  if (btnCerrarHeader) btnCerrarHeader.addEventListener("click", window.cerrarSesionHuesped);

  formConsulta.addEventListener("submit", async (e) => {
    e.preventDefault();
    await sincronizarDesdeSupabase();
    const user = document.getElementById("login_usuario").value.trim();
    const pass = document.getElementById("login_password").value.trim();
    const misReservas = obtenerReservaciones().filter(r => r.usuario === user && r.password === pass);
    contenedorResultado.hidden = false;
    if (misReservas.length === 0) {
      if (btnCerrarHuesped) btnCerrarHuesped.hidden = true;
      if (btnCerrarHeader) btnCerrarHeader.hidden = true;
      contenedorResultado.innerHTML = `<p style="color:#dc2626; font-weight:600;">Usuario o contraseña incorrectos, o no tienes reservaciones registradas.</p>`;
      return;
    }
    sessionStorage.setItem("flamingo_huesped_sesion", user);
    if (btnCerrarHuesped) btnCerrarHuesped.hidden = false;
    if (btnCerrarHeader) btnCerrarHeader.hidden = false;

    const reservaParaLlenar = misReservas.find(r => r.estado === "Activa") || misReservas[0];
    cargarReservaEnFormulario(reservaParaLlenar);
    contenedorResultado.innerHTML = misReservas.map(res => {
      const nombresHabs = res.habitaciones.map(id => {
        const h = HABITACIONES_CATALOGO.find(item => item.id === id);
        return h ? h.nombre : id;
      }).join(", ");
      return `
        <article style="border-bottom: 1px solid var(--color-border); padding-bottom: 0.85rem; margin-bottom: 0.85rem;">
          <p><strong>Folio:</strong> ${res.folio} (${res.estado})</p>
          <p><strong>Huésped:</strong> ${res.nombre}</p>
          <p><strong>Personas:</strong> ${res.adultos ?? 1} Adulto(s), ${res.infantes ?? 0} Infante(s)</p>
          <p><strong>Habitaciones:</strong> ${nombresHabs}</p>
          <p><strong>Entrada:</strong> ${res.fechaEntrada} | <strong>Fecha Límite:</strong> ${res.fechaLimite}</p>
          <p><strong>Total:</strong> $${Number(res.total).toLocaleString("es-MX")} MXN</p>
          ${res.estado === "Activa"
            ? `<div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.5rem;">
                <button type="button" class="btn-secondary" onclick="editarMiReservacion('${res.folio}')">Cargar en formulario</button>
                <button type="button" class="btn-danger" onclick="cancelarReservacion('${res.folio}')">Cancelar Reservación</button>
               </div>`
            : res.estado === "Pagada"
              ? `<em style="color:#059669; font-weight:700;">✓ Reservación Pagada y Confirmada</em>`
              : `<em style="color:#991b1b;">Reservación cancelada</em>`
          }
        </article>
      `;
    }).join("");
  });
}

// =========================================================
// RECUPERACIÓN DE USUARIO Y CONTRASEÑA POR NOMBRE Y TELÉFONO
// =========================================================
function inicializarRecuperacionCuenta() {
  const btnToggle = document.getElementById("btn-toggle-recuperar");
  const formRecuperar = document.getElementById("form-recuperar-cuenta");
  const salidaRec = document.getElementById("resultado-recuperacion");
  if (!btnToggle || !formRecuperar || !salidaRec) return;

  btnToggle.addEventListener("click", () => {
    formRecuperar.hidden = !formRecuperar.hidden;
    salidaRec.innerHTML = "";
  });

  formRecuperar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombreInput = document.getElementById("rec_nombre").value.trim();
    const telInput = document.getElementById("rec_telefono").value.trim();
    const nuevaPass = document.getElementById("rec_nueva_pass").value.trim();

    if (nombreInput.length < 3 || !/^[0-9]{10}$/.test(telInput)) {
      salidaRec.innerHTML = `<p style="color:#dc2626; font-weight:600;">Ingresa tu nombre completo y un teléfono válido de 10 dígitos.</p>`;
      return;
    }

    if (nuevaPass && nuevaPass.length < 4) {
      salidaRec.innerHTML = `<p style="color:#dc2626; font-weight:600;">La nueva contraseña debe tener al menos 4 caracteres.</p>`;
      return;
    }

    salidaRec.innerHTML = `<p style="color:#78350f;">Verificando datos en Supabase...</p>`;

    try {
      // Consulta en la tabla "usuarios" filtrando por teléfono exacto
      const { data, error } = await supabase
        .from("usuarios")
        .select("usuario, nombre, telefono, password")
        .eq("telefono", telInput);

      if (error) throw error;

      // Comparación insensible a mayúsculas/minúsculas, acentos y espacios extra
      const normalizar = (txt) => txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
      const coincidencia = (data || []).find(u => normalizar(u.nombre || "") === normalizar(nombreInput));

      if (!coincidencia) {
        salidaRec.innerHTML = `<p style="color:#dc2626; font-weight:600;">No encontramos ninguna cuenta que coincida con ese nombre y teléfono.</p>`;
        return;
      }

      let passwordFinal = coincidencia.password;

      // Si el huésped escribió una nueva contraseña, actualizarla en Supabase
      if (nuevaPass) {
        const { error: errUpd } = await supabase
          .from("usuarios")
          .update({ password: nuevaPass })
          .eq("usuario", coincidencia.usuario);

        if (errUpd) throw errUpd;
        passwordFinal = nuevaPass;
        await sincronizarDesdeSupabase();
      }

      // Autocompletar el formulario de inicio de sesión de arriba para facilitar el acceso
      const inputLoginUser = document.getElementById("login_usuario");
      const inputLoginPass = document.getElementById("login_password");
      if (inputLoginUser) inputLoginUser.value = coincidencia.usuario;
      if (inputLoginPass) inputLoginPass.value = passwordFinal;

      salidaRec.innerHTML = `
        <div style="padding: 0.75rem; background: #ecfdf5; border: 1px solid #059669; border-radius: 8px; color: #064e3b;">
          <p style="margin: 0 0 0.25rem; font-weight: 700;">✓ Identidad verificada (${coincidencia.nombre})</p>
          <p style="margin: 0.15rem 0;"><strong>Usuario:</strong> ${coincidencia.usuario}</p>
          <p style="margin: 0.15rem 0;"><strong>Contraseña ${nuevaPass ? "actualizada" : "registrada"}:</strong> ${passwordFinal}</p>
          <small style="display:block; margin-top:0.35rem; color:#047857;">Tus credenciales ya se llenaron arriba; presiona "Ver mi Reservación".</small>
        </div>
      `;
    } catch (err) {
      console.error("Error al recuperar cuenta:", err);
      salidaRec.innerHTML = `<p style="color:#dc2626;">Error al consultar Supabase: ${err.message}</p>`;
    }
  });
}

// =========================================================
// FUNCIÓN DE COBRO / PAGO EN RECEPCIÓN (ACTUALIZA SUPABASE)
// =========================================================
window.registrarPagoReservacion = async function(folio) {
  const reserva = reservacionesNube.find(r => r.folio === folio);
  if (!reserva) return;

  const montoFormateado = Number(reserva.total).toLocaleString("es-MX", { minimumFractionDigits: 2 });
  const confirmar = confirm(
    `💳 CONFIRMAR COBRO EN RECEPCIÓN\n\n` +
    `Folio: ${reserva.folio}\n` +
    `Huésped: ${reserva.nombre}\n` +
    `Monto a cobrar en efectivo: $${montoFormateado} MXN\n\n` +
    `¿Confirmas que el pago fue recibido?`
  );
  if (!confirmar) return;

  try {
    // 1. Marcar como 'Pagada' en la tabla relacional ingresos_reservaciones
    const { error } = await supabase
      .from("ingresos_reservaciones")
      .update({ estado: "Pagada" })
      .eq("folio", folio);

    if (error) throw error;

    await sincronizarDesdeSupabase();

    // 2. Mostrar recibo oficial de pago en el panel
    const contenedorRecibo = document.getElementById("admin-recibo-pago");
    if (contenedorRecibo) {
      const nombresHabs = (reserva.habitaciones || []).map(id => {
        const h = HABITACIONES_CATALOGO.find(item => item.id === id);
        return h ? h.nombre : id;
      }).join(", ");

      contenedorRecibo.hidden = false;
      contenedorRecibo.innerHTML = `
        <article style="padding: 1.25rem; background: #ecfdf5; border: 2px solid #059669; border-radius: 12px; color: #064e3b;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #a7f3d0; padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
            <div>
              <h3 style="margin: 0; color: #047857;">✅ Pago Registrado en Caja — Recibo Oficial</h3>
              <small>The Flamingo Palace • Bucerías, Nayarit • ${new Date().toLocaleString("es-MX")}</small>
            </div>
            <button type="button" onclick="this.closest('#admin-recibo-pago').hidden = true" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #065f46;">✕</button>
          </div>
          <p style="margin: 0.25rem 0;"><strong>Folio Liquidado:</strong> ${reserva.folio}</p>
          <p style="margin: 0.25rem 0;"><strong>Huésped:</strong> ${reserva.nombre} (${reserva.usuario})</p>
          <p style="margin: 0.25rem 0;"><strong>Habitación(es):</strong> ${nombresHabs}</p>
          <p style="margin: 0.25rem 0;"><strong>Estancia:</strong> ${reserva.fechaEntrada} al ${reserva.fechaLimite}</p>
          <p style="margin: 0.5rem 0 0; font-size: 1.15rem;"><strong>Total Cobrado en Efectivo: $${montoFormateado} MXN</strong></p>
          <button type="button" onclick="window.print()" class="btn-primary" style="margin-top: 0.85rem; background: #059669;">🖨️ Imprimir Recibo de Pago</button>
        </article>
      `;
      contenedorRecibo.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  } catch (error) {
    console.error("Error al registrar pago en Supabase:", error);
    alert("No se pudo registrar el pago. Verifica tu conexión.");
  }
};

window.cancelarReservacion = async function(folio) {
  if (!confirm("¿Seguro que deseas cancelar / liberar esta reservación? Las habitaciones quedarán libres inmediatamente.")) return;
  const reserva = reservacionesNube.find(r => r.folio === folio);
  if (!reserva) return;
  try {
    // 1. Marcar como Cancelada en tabla ingresos_reservaciones
    const { error } = await supabase
      .from("ingresos_reservaciones")
      .update({ estado: "Cancelada" })
      .eq("folio", folio);

    if (error) throw error;

    // 2. Liberar habitaciones asociadas en tabla habitaciones
    if (Array.isArray(reserva.habitaciones) && reserva.habitaciones.length > 0) {
      await supabase
        .from("habitaciones")
        .update({ estado: "Libre", ocupada_hasta: null, folio_actual: null })
        .in("id_habitacion", reserva.habitaciones);
    }

    if (reservaEnEdicion && reservaEnEdicion.folio === folio) {
      reservaEnEdicion = null;
      const form = document.getElementById("form-reservacion");
      if (form) form.reset();
    }

    await sincronizarDesdeSupabase();
    alert("Habitaciones liberadas correctamente en Supabase.");
  } catch (error) {
    console.error("Error al cancelar en Supabase:", error);
    alert("No se pudo liberar la reservación. Intenta de nuevo.");
  }
};

function inicializarPanelAdmin() {
  const formAdmin = document.getElementById("form-admin-login");
  const loginBox = document.getElementById("admin-login-box");
  const dashboard = document.getElementById("admin-dashboard");
  const btnCerrar = document.getElementById("btn-cerrar-admin");
  const btnCerrarHeader = document.getElementById("btn-cerrar-admin-header");
  if (!formAdmin || !dashboard) return;

  const ejecutarCierreAdmin = () => {
    sessionStorage.removeItem("flamingo_admin_sesion");
    sessionStorage.clear();
    formAdmin.reset();
    const recibo = document.getElementById("admin-recibo-pago");
    if (recibo) { recibo.innerHTML = ""; recibo.hidden = true; }
    dashboard.hidden = true;
    loginBox.hidden = false;
    if (btnCerrarHeader) btnCerrarHeader.hidden = true;
  };

  if (sessionStorage.getItem("flamingo_admin_sesion") === "true") {
    loginBox.hidden = true;
    dashboard.hidden = false;
    if (btnCerrarHeader) btnCerrarHeader.hidden = false;
    renderizarDashboardAdmin();
  }

  formAdmin.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("admin_user").value.trim();
    const p = document.getElementById("admin_pass").value.trim();
    if (u === "admin" && p === "flamingo2026") {
      sessionStorage.setItem("flamingo_admin_sesion", "true");
      loginBox.hidden = true;
      dashboard.hidden = false;
      if (btnCerrarHeader) btnCerrarHeader.hidden = false;
      renderizarDashboardAdmin();
    } else alert("Credenciales de empresa incorrectas. Usa admin / flamingo2026");
  });

  if (btnCerrar) btnCerrar.addEventListener("click", ejecutarCierreAdmin);
  if (btnCerrarHeader) btnCerrarHeader.addEventListener("click", ejecutarCierreAdmin);

  const inputBuscador = document.getElementById("admin-buscador-reservas");
  const selectEstatus = document.getElementById("admin-filtro-estatus");
  if (inputBuscador) inputBuscador.addEventListener("input", renderizarDashboardAdmin);
  if (selectEstatus) selectEstatus.addEventListener("change", renderizarDashboardAdmin);
}

function renderizarDashboardAdmin() {
  const tbodyHabs = document.getElementById("tabla-estado-habitaciones");
  const tbodyRes = document.getElementById("tabla-reservaciones-admin");
  const resumenOcupacion = document.getElementById("admin-resumen-ocupacion");
  const barraOcupacion = document.getElementById("admin-barra-ocupacion");
  const resumenIngresos = document.getElementById("admin-resumen-ingresos");
  if (!tbodyHabs || !tbodyRes) return;

  let ocupadasCount = 0;

  tbodyHabs.innerHTML = HABITACIONES_CATALOGO.map(hab => {
    const estado = obtenerEstadoHabitacion(hab.id);
    if (estado.ocupada) ocupadasCount++;
    return `
      <tr>
        <td><strong>${hab.nombre}</strong></td>
        <td>$${hab.precio.toLocaleString("es-MX")} MXN</td>
        <td>
          <span class="estado-badge ${estado.ocupada ? "ocupada" : (estado.futura ? "futura" : "libre")}">
            ${estado.ocupada
              ? (estado.estadoPago === "Pagada" ? "Ocupada (Pagada)" : "Ocupada (Pendiente)")
              : (estado.futura ? `Disponible hasta ${estado.disponibleHasta}` : "Disponible")}
          </span>
        </td>
        <td>${estado.ocupada ? estado.huesped : (estado.futura ? `Apartada (${estado.huesped})` : "—")}</td>
        <td>${estado.ocupada ? `<strong>${estado.hasta}</strong>` : (estado.futura ? `Entra el <strong>${estado.disponibleHasta}</strong>` : "Disponible hoy")}</td>
        <td>
          ${estado.ocupada
            ? `<div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                ${estado.estadoPago !== "Pagada"
                  ? `<button type="button" onclick="registrarPagoReservacion('${estado.folio}')" style="background:#059669; color:#fff; border:none; padding:0.4rem 0.7rem; border-radius:6px; font-weight:600; cursor:pointer;">💳 Pagar</button>`
                  : `<span style="color:#059669; font-weight:700; font-size:0.85rem; align-self:center;">✓ Liquidada</span>`
                }
                <button type="button" class="btn-danger" onclick="cancelarReservacion('${estado.folio}')">Liberar (${estado.folio})</button>
               </div>`
            : "Sin acción"
          }
        </td>
      </tr>
    `;
  }).join("");

  const totalHabs = HABITACIONES_CATALOGO.length;
  const libresCount = totalHabs - ocupadasCount;
  const porcentaje = Math.round((ocupadasCount / totalHabs) * 100);
  if (resumenOcupacion) resumenOcupacion.textContent = `${ocupadasCount} Ocupadas / ${libresCount} Libres (${porcentaje}%)`;
  if (barraOcupacion) { barraOcupacion.max = totalHabs; barraOcupacion.value = ocupadasCount; }

  const termino = (document.getElementById("admin-buscador-reservas")?.value || "").trim().toLowerCase();
  const filtroEstatus = document.getElementById("admin-filtro-estatus")?.value || "Todas";
  const todasOrdenadas = [...obtenerReservaciones()].sort((a, b) =>
    (b.creadoEn || "").localeCompare(a.creadoEn || "")
  );

  let ingresosTotales = 0;
  todasOrdenadas.forEach(r => {
    if (r.estado === "Activa" || r.estado === "Pagada") ingresosTotales += Number(r.total) || 0;
  });

  const filtradas = todasOrdenadas.filter(res => {
    if (filtroEstatus !== "Todas" && res.estado !== filtroEstatus) return false;
    if (!termino) return true;
    const texto = `${res.folio} ${res.nombre} ${res.usuario} ${(res.habitaciones || []).join(" ")}`.toLowerCase();
    return texto.includes(termino);
  });

  tbodyRes.innerHTML = filtradas.length === 0
    ? `<tr><td colspan="7" style="text-align:center;">No hay reservaciones que coincidan con el filtro.</td></tr>`
    : filtradas.map(res => {
      const nombresHabs = res.habitaciones.map(id => {
        const h = HABITACIONES_CATALOGO.find(item => item.id === id);
        return h ? h.nombre : id;
      }).join("<br>");

      const badgeEstatus = res.estado === "Pagada"
        ? `<span style="background:#d1fae5; color:#065f46; padding:0.25rem 0.6rem; border-radius:999px; font-weight:700; font-size:0.82rem;">✓ Pagada</span>`
        : res.estado === "Activa"
          ? `<span style="background:#fef3c7; color:#92400e; padding:0.25rem 0.6rem; border-radius:999px; font-weight:700; font-size:0.82rem;">Pendiente Pago</span>`
          : `<span style="background:#fee2e2; color:#991b1b; padding:0.25rem 0.6rem; border-radius:999px; font-weight:700; font-size:0.82rem;">Cancelada</span>`;

      return `
        <tr>
          <td><strong>${res.folio}</strong></td>
          <td>${res.nombre}<br><small>Usuario: ${res.usuario} (${res.adultos ?? 1} Ad. / ${res.infantes ?? 0} Inf.)</small></td>
          <td>${nombresHabs}</td>
          <td>${res.fechaEntrada} &rarr; <strong>${res.fechaLimite}</strong></td>
          <td><strong>$${Number(res.total).toLocaleString("es-MX")} MXN</strong></td>
          <td>${badgeEstatus}</td>
          <td>
            ${res.estado === "Activa"
              ? `<div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                  <button type="button" onclick="registrarPagoReservacion('${res.folio}')" style="background:linear-gradient(135deg, #059669, #047857); color:#fff; border:none; padding:0.45rem 0.85rem; border-radius:6px; font-weight:600; cursor:pointer; box-shadow:0 2px 6px rgba(5,150,105,0.3);">💳 Cobrar / Pagar</button>
                  <button type="button" class="btn-danger" onclick="cancelarReservacion('${res.folio}')">Cancelar</button>
                 </div>`
              : res.estado === "Pagada"
                ? `<div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                    <button type="button" class="btn-danger" onclick="cancelarReservacion('${res.folio}')">Liberar Cuarto</button>
                   </div>`
                : "Cancelada"
            }
          </td>
        </tr>
      `;
    }).join("");

  if (resumenIngresos) resumenIngresos.textContent = `$${ingresosTotales.toLocaleString("es-MX")} MXN`;
}

// =========================================================
// MÓDULO DE CONSULTAS SQL / SUPABASE EN VIVO (ADMIN)
// =========================================================
window.ejecutarConsultaBD = async function(tipo) {
  const visorSQL = document.getElementById("visor-sql-consulta");
  const thead = document.getElementById("thead-consulta-bd");
  const tbody = document.getElementById("tbody-consulta-bd");
  if (!visorSQL || !thead || !tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Consultando Supabase PostgreSQL...</td></tr>`;

  try {
    if (tipo === "join_huespedes") {
      visorSQL.textContent =
`SELECT r.folio, u.nombre AS huesped, u.telefono, r.fecha_entrada, r.fecha_limite, r.total_ingresado, r.estado
FROM ingresos_reservaciones r
INNER JOIN usuarios u ON r.usuario_fk = u.usuario
ORDER BY r.creado_en DESC;`;

      const { data, error } = await supabase
        .from("ingresos_reservaciones")
        .select("folio, fecha_entrada, fecha_limite, total_ingresado, estado, usuarios(nombre, telefono)")
        .order("creado_en", { ascending: false });

      if (error) throw error;

      thead.innerHTML = `<tr><th>Folio</th><th>Huésped (JOIN)</th><th>Teléfono</th><th>Estancia</th><th>Total</th><th>Estado</th></tr>`;
      tbody.innerHTML = (data || []).map(r => `
        <tr>
          <td><strong>${r.folio}</strong></td>
          <td>${r.usuarios?.nombre || "—"}</td>
          <td>${r.usuarios?.telefono || "—"}</td>
          <td>${r.fecha_entrada} &rarr; ${r.fecha_limite}</td>
          <td>$${Number(r.total_ingresado).toLocaleString("es-MX")} MXN</td>
          <td>${r.estado}</td>
        </tr>
      `).join("") || `<tr><td colspan="6">Sin registros.</td></tr>`;
    }

    else if (tipo === "ingresos_cupon") {
      visorSQL.textContent =
`SELECT cupon, COUNT(*) AS total_reservas, SUM(descuento) AS total_descontado, SUM(total_ingresado) AS ingresos_netos
FROM ingresos_reservaciones
WHERE estado <> 'Cancelada'
GROUP BY cupon;`;

      const { data, error } = await supabase
        .from("ingresos_reservaciones")
        .select("cupon, descuento, total_ingresado, estado")
        .neq("estado", "Cancelada");

      if (error) throw error;

      const resumen = {};
      (data || []).forEach(r => {
        const key = r.cupon || "Ninguno";
        if (!resumen[key]) resumen[key] = { cantidad: 0, descuento: 0, total: 0 };
        resumen[key].cantidad += 1;
        resumen[key].descuento += Number(r.descuento) || 0;
        resumen[key].total += Number(r.total_ingresado) || 0;
      });

      thead.innerHTML = `<tr><th>Cupón Aplicado</th><th>Reservaciones (COUNT)</th><th>Total Descontado (SUM)</th><th>Ingresos Netos (SUM)</th></tr>`;
      tbody.innerHTML = Object.entries(resumen).map(([cupon, info]) => `
        <tr>
          <td><strong>${cupon}</strong></td>
          <td>${info.cantidad}</td>
          <td>$${info.descuento.toLocaleString("es-MX")} MXN</td>
          <td><strong>$${info.total.toLocaleString("es-MX")} MXN</strong></td>
        </tr>
      `).join("") || `<tr><td colspan="4">Sin datos activos.</td></tr>`;
    }

    else if (tipo === "solo_pagadas") {
      visorSQL.textContent =
`SELECT folio, usuario_fk, habitaciones_ids, total_ingresado
FROM ingresos_reservaciones
WHERE estado = 'Pagada';`;

      const { data, error } = await supabase
        .from("ingresos_reservaciones")
        .select("folio, usuario_fk, habitaciones_ids, total_ingresado")
        .eq("estado", "Pagada");

      if (error) throw error;

      thead.innerHTML = `<tr><th>Folio</th><th>Usuario FK</th><th>Habitaciones (Arreglo)</th><th>Monto Cobrado</th></tr>`;
      tbody.innerHTML = (data || []).map(r => `
        <tr>
          <td><strong>${r.folio}</strong></td>
          <td>${r.usuario_fk}</td>
          <td>${(r.habitaciones_ids || []).join(", ")}</td>
          <td><strong>$${Number(r.total_ingresado).toLocaleString("es-MX")} MXN</strong></td>
        </tr>
      `).join("") || `<tr><td colspan="4" style="text-align:center;">Aún no hay reservaciones con estado 'Pagada'.</td></tr>`;
    }

    else if (tipo === "habitaciones_ocupadas") {
      visorSQL.textContent =
`SELECT id_habitacion, estado, ocupada_hasta, folio_actual
FROM habitaciones
WHERE estado = 'Ocupada';`;

      const { data, error } = await supabase
        .from("habitaciones")
        .select("id_habitacion, estado, ocupada_hasta, folio_actual")
        .eq("estado", "Ocupada");

      if (error) throw error;

      thead.innerHTML = `<tr><th>ID Habitación</th><th>Estado</th><th>Ocupada Hasta</th><th>Folio Actual</th></tr>`;
      tbody.innerHTML = (data || []).map(h => `
        <tr>
          <td><strong>${h.id_habitacion}</strong></td>
          <td>${h.estado}</td>
          <td>${h.ocupada_hasta || "—"}</td>
          <td>${h.folio_actual || "—"}</td>
        </tr>
      `).join("") || `<tr><td colspan="4" style="text-align:center;">Todas las habitaciones están libres hoy.</td></tr>`;
    }
  } catch (err) {
    console.error("Error en consulta BD:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="color:#dc2626;">Error al ejecutar consulta: ${err.message}</td></tr>`;
  }
};