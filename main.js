import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"; /* inicia firebase */
import {
  getFirestore, /* conecta base de datos */
      collection, /* accede a colecciones */
  addDoc, /* guarda datos nuevos */
    doc, /* busca un registro */
  updateDoc, /* actualiza registros */
      onSnapshot /* escucha cambios en vivo */
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"; /* importa funciones firestore */

const firebaseConfig = { /* llaves del proyecto firebase */
    apiKey: "AIzaSyDHQcJHSdZL9TbQ096_01mY-sz92cdlgZ4", /* clave api */
  authDomain: "the-flamingo-palace-ee04b.firebaseapp.com", /* dominio autenticacion */
      projectId: "the-flamingo-palace-ee04b", /* id del proyecto */
  storageBucket: "the-flamingo-palace-ee04b.firebasestorage.app", /* almacenamiento nube */
    messagingSenderId: "53035396905", /* id mensajeria */
  appId: "1:53035396905:web:de9f5b0a15c7476e995138", /* id aplicacion */
      measurementId: "G-C5JMVRTZJF" /* id analiticas */
};

const app = initializeApp(firebaseConfig); /* arranca la app */
  const db = getFirestore(app); /* abre firestore */
const reservacionesRef = collection(db, "reservaciones"); /* tabla de reservaciones */

const LOGO_HOTEL_URL = "https://i.ibb.co/FbTkwz5N/IMAGEN.jpg"; /* logo del hotel */

function mostrarPantallaCargaLogo() { /* pantalla de carga con temporizador al navegar */
  if (document.getElementById("pantalla-carga-flamingo")) return; /* evita duplicar pantalla */

    const overlay = document.createElement("div"); /* crea contenedor pantalla completa */
  overlay.id = "pantalla-carga-flamingo"; /* asigna id unico */
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        transition: opacity 0.4s ease;
    `;

  overlay.innerHTML = `
        <img src="${LOGO_HOTEL_URL}" alt="The Flamingo Palace" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; border: 4px solid #ea580c; box-shadow: 0 10px 25px rgba(234, 88, 12, 0.3);">
        <h2 style="margin: 0; color: #c2410c; font-family: system-ui, sans-serif; font-size: 1.5rem;">The Flamingo Palace</h2>
        <p style="margin: 0; color: #78350f; font-family: system-ui, sans-serif; font-size: 0.95rem;">Cargando experiencia frente al mar...</p>
        <div style="width: 220px; height: 6px; background: #fed7aa; border-radius: 999px; overflow: hidden; margin-top: 0.25rem;">
            <div id="barra-carga-flamingo" style="width: 0%; height: 100%; background: #ea580c; transition: width 1.4s linear;"></div>
        </div>
    `;

    document.body.appendChild(overlay); /* muestra pantalla de carga */

  requestAnimationFrame(() => { /* inicia animacion de barra */
      const barra = document.getElementById("barra-carga-flamingo"); /* busca barra interna */
    if (barra) barra.style.width = "100%"; /* llena barra al 100% */
  });

    setTimeout(() => { /* temporizador de 1.5 segundos */
      overlay.style.opacity = "0"; /* desvanece pantalla */
    setTimeout(() => overlay.remove(), 400); /* elimina elemento al terminar */
    }, 1500);
}

mostrarPantallaCargaLogo(); /* ejecuta pantalla de carga al abrir o navegar */

const CUPONES_VALIDOS = { /* codigos de descuento */
  "NAVIDAD25": 0.25, /* 25% de descuento */
      "FLAMINGO50": 0.50 /* 50% de descuento */
};
let descuentoAplicado = 0; /* guarda porcentaje descuento */
  let codigoCuponActivo = ""; /* guarda codigo aplicado */
let reservaEnEdicion = null; /* guarda reserva cargada para modificar */

const HABITACIONES_CATALOGO = [ /* catalogo de las 20 habitaciones */
    { id: "101_estandar_arena", nombre: "101. Estándar Arena", precio: 1850, capacidad: "Hasta 4 personas", amenidades: ["2 Camas Matrimoniales", "Balcón con vista al jardín tropical", "Aire acondicionado silencioso", "Wi-Fi de alta velocidad", "Smart TV 50\""] }, /* habitacion 101 */
  { id: "102_estandar_brisa", nombre: "102. Estándar Brisa", precio: 1950, capacidad: "Hasta 2 personas", amenidades: ["Cama Queen Size", "Balcón privado con hamaca", "Acceso directo a alberca", "Frigobar surtido", "Caja fuerte digital"] }, /* habitacion 102 */
      { id: "103_doble_coral", nombre: "103. Doble Coral", precio: 2200, capacidad: "Hasta 4 personas", amenidades: ["2 Camas Queen Size", "Terraza soleada en planta baja", "Cafetera Nespresso", "Baño con ducha tipo lluvia", "Wi-Fi dedicado"] }, /* habitacion 103 */
  { id: "104_el_paraiso_hassel", nombre: "104. El Paraíso con Hassel", precio: 2650, capacidad: "Hasta 2 personas", amenidades: ["Cama King Size de lujo", "Sala de lectura iluminada", "Vista panorámica a la bahía de Bucerías", "Desayuno buffet incluido", "Batas y pantuflas"] }, /* habitacion 104 */
    { id: "105_jardin_palmeras", nombre: "105. Estándar Jardín Palmeras", precio: 1900, capacidad: "Hasta 3 personas", amenidades: ["1 Cama King Size", "Patio privado rodeado de palmeras", "Aire acondicionado", "Smart TV 50\"", "Servicio diario de limpieza"] }, /* habitacion 105 */
  { id: "106_terraza_marina", nombre: "106. Doble Terraza Marina", precio: 2350, capacidad: "Hasta 4 personas", amenidades: ["2 Camas Matrimoniales", "Terraza amplia con mesa exterior", "Vista parcial al océano", "Minibar incluido", "Secadora y amenidades orgánicas"] }, /* habitacion 106 */
      { id: "201_suite_flamingo_sol", nombre: "201. Suite Flamingo Sol", precio: 3200, capacidad: "Hasta 2 personas", amenidades: ["Frente al mar con balcón panorámico", "Cama King Size", "Desayuno buffet incluido", "Sala de estar independiente", "Room service 24/7"] }, /* suite 201 */
  { id: "202_suite_atardecer", nombre: "202. Suite Atardecer", precio: 3450, capacidad: "Hasta 3 personas", amenidades: ["Orientación oeste hacia la puesta de sol", "Cama King Size + Sofá cama", "Tina de hidromasaje interior", "Minibar premium", "Wi-Fi de alta velocidad"] }, /* suite 202 */
    { id: "203_suite_costa_dorada", nombre: "203. Suite Costa Dorada", precio: 3800, capacidad: "Hasta 4 personas", amenidades: ["2 Camas Matrimoniales de lujo", "Comedor privado", "Acceso preferencial a camastros", "Vista 180° al Pacífico", "Desayuno y cena incluidos"] }, /* suite 203 */
  { id: "204_bungalow_tropical", nombre: "204. Bungalow Tropical", precio: 4300, capacidad: "Hasta 4 personas", amenidades: ["Cabaña independiente entre palmeras", "A pocos pasos de la arena", "Hamaca y terraza privada", "Cocineta equipada", "Estacionamiento preferencial"] }, /* bungalow 204 */
      { id: "205_suite_bahia_banderas", nombre: "205. Suite Bahía de Banderas", precio: 3600, capacidad: "Hasta 3 personas", amenidades: ["Balcón esquinero frente a la bahía", "Cama King Size", "Ducha panorámica", "Desayuno gourmet incluido", "Cafetera expreso"] }, /* suite 205 */
  { id: "206_junior_suite_olas", nombre: "206. Junior Suite Olas del Pacífico", precio: 2950, capacidad: "Hasta 2 personas", amenidades: ["Cama King Size", "Balcón privado sobre la playa", "Sala lounge", "Acceso al club de playa", "Smart TV 55\""] }, /* suite 206 */
    { id: "207_suite_familiar_nayarit", nombre: "207. Suite Familiar Nayarit", precio: 4100, capacidad: "Hasta 5 personas", amenidades: ["2 Recámaras conectadas", "Sala de estar familiar", "2 Baños completos", "Vista frontal a alberca y mar", "Desayuno incluido para toda la familia"] }, /* suite 207 */
  { id: "301_master_pacifico", nombre: "301. Master Suite Pacífico", precio: 5100, capacidad: "Hasta 5 personas", amenidades: ["Recámara principal King", "Sala lounge con sofá cama", "Tina de hidromasaje", "Terraza panorámica", "Todo incluido gourmet"] }, /* master 301 */
      { id: "302_suite_presidencial", nombre: "302. Suite Presidencial", precio: 6500, capacidad: "Hasta 6 personas", amenidades: ["2 Recámaras King", "Jacuzzi privado en terraza panorámica", "Servicio VIP 24 horas", "Sala-comedor de lujo", "Experiencia Todo Incluido Premium"] }, /* presidencial 302 */
  { id: "303_villa_frente_mar", nombre: "303. Villa Frente al Mar", precio: 5400, capacidad: "Hasta 4 personas", amenidades: ["Acceso directo a la playa privada", "Alberca de inmersión privada", "Cama King Size con dosel", "Terraza con camastros", "Cena romántica incluida"] }, /* villa 303 */
    { id: "304_penthouse_flamingos", nombre: "304. Penthouse Los Flamingos", precio: 6900, capacidad: "Hasta 6 personas", amenidades: ["Nivel superior con vista 360°", "Terraza lounge con jacuzzi exterior", "2 Suites principales", "Mayordomo privado", "Traslado aeropuerto incluido"] }, /* penthouse 304 */
  { id: "305_suite_luna_miel", nombre: "305. Suite Luna de Miel", precio: 4600, capacidad: "Hasta 2 personas", amenidades: ["Decoración romántica de bienvenida", "Jacuzzi frente al ventanal al mar", "Cama King Size", "Desayuno en la habitación", "Masaje en pareja incluido"] }, /* suite 305 */
      { id: "306_bungalow_arena_blanca", nombre: "306. Bungalow Arena Blanca", precio: 4450, capacidad: "Hasta 4 personas", amenidades: ["Ubicación en primera línea de playa", "Terraza de madera con pérgola", "1 King + 2 Individuales", "Ducha exterior privada", "Club de playa VIP"] }, /* bungalow 306 */
  { id: "307_gran_suite_imperial", nombre: "307. Gran Suite Imperial", precio: 7200, capacidad: "Hasta 6 personas", amenidades: ["La suite más exclusiva del resort", "Piscina infinity privada en terraza", "2 Recámaras Master + Estudio", "Chef y concierge bajo solicitud", "Todo Incluido Ultra Premium"] } /* suite 307 */
];

let reservacionesNube = []; /* guarda las reservas de la nube */

function obtenerReservaciones() { return reservacionesNube; } /* devuelve lista de reservas */

function obtenerEstadoHabitacion(habId) { /* revisa si un cuarto esta libre u ocupado */
  const hoy = new Date().toISOString().split("T")[0]; /* obtiene fecha actual */
    const activa = obtenerReservaciones().find(res => /* busca reserva vigente */
        res.estado === "Activa" && /* verifica que este activa */
      res.fechaLimite >= hoy && /* verifica que no haya vencido */
        Array.isArray(res.habitaciones) && /* valida lista de cuartos */
      res.habitaciones.includes(habId) /* comprueba si incluye el cuarto */
    );
  if (activa) { /* si esta ocupada devuelve datos */
      return {
        ocupada: true, /* marca cuarto ocupado */
          huesped: activa.nombre, /* nombre del cliente */
        hasta: activa.fechaLimite, /* fecha de salida */
          folio: activa.folio /* folio de reserva */
      };
  }
    return { ocupada: false }; /* devuelve libre si no hay reserva */
}

document.addEventListener("DOMContentLoaded", () => { /* inicia funciones al cargar la pagina */
    const btnMenu = document.getElementById("menu-toggle"); /* boton abrir menu movil */
  const btnCerrarMenu = document.getElementById("menu-close"); /* boton cerrar menu movil */
      const navLinks = document.getElementById("nav-links"); /* contenedor enlaces menu */

  if (btnMenu && navLinks) { /* activa boton hamburguesa */
      btnMenu.addEventListener("click", () => { /* abre menu en celular */
        navLinks.classList.add("abierto"); /* muestra menu lateral */
          btnMenu.setAttribute("aria-expanded", "true"); /* indica menu abierto */
      });
  }
    if (btnCerrarMenu && navLinks) { /* activa boton X */
      btnCerrarMenu.addEventListener("click", () => { /* cierra menu en celular */
          navLinks.classList.remove("abierto"); /* oculta menu lateral */
        btnMenu.setAttribute("aria-expanded", "false"); /* indica menu cerrado */
      });
    }
  if (navLinks) { /* cierra menu al tocar enlace */
      navLinks.querySelectorAll("a").forEach(enlace => { /* recorre cada enlace */
        enlace.addEventListener("click", () => { /* detecta clic en opcion */
            navLinks.classList.remove("abierto"); /* esconde menu */
          if (btnMenu) btnMenu.setAttribute("aria-expanded", "false"); /* actualiza estado boton */
        });
      });
  }

  inicializarFormularioReserva(); /* activa formulario */
    inicializarConsultaHuesped(); /* activa consulta cliente */
  inicializarPanelAdmin(); /* activa panel empresa */
      inicializarFiltrosCatalogo(); /* activa filtros catalogo */
  inicializarModalesHabitaciones(); /* activa ventanas de amenidades */

  onSnapshot(reservacionesRef, (snapshot) => { /* sincroniza cambios en tiempo real */
      reservacionesNube = snapshot.docs.map(documento => ({ /* mapea documentos nube */
        docId: documento.id, /* guarda id documento */
          ...documento.data() /* copia datos reserva */
      }));

    actualizarIndicadoresInicio(); /* refresca barra en inicio */
      actualizarCatalogoServicios(); /* refresca tarjetas servicios */
    renderizarCheckboxesHabitaciones(); /* refresca casillas cuartos */
        calcularCotizacion(); /* actualiza precio total */

    if (sessionStorage.getItem("flamingo_admin_sesion") === "true") { /* verifica sesion admin */
        renderizarDashboardAdmin(); /* refresca panel empresa */
    }
  }, (error) => { /* captura errores conexion */
      console.error("Error al sincronizar con Cloud Firestore:", error); /* muestra error consola */
  });
});

function actualizarIndicadoresInicio() { /* actualiza barra de disponibles en inicio */
    const textoContador = document.getElementById("contador-libres-inicio"); /* texto contador libres */
  const barra = document.getElementById("barra-disponibilidad"); /* barra progreso */
    if (!textoContador || !barra) return; /* sale si no esta en inicio */

  const totalHabs = HABITACIONES_CATALOGO.length; /* total habitaciones */
      let libres = 0; /* contador disponibles */
  HABITACIONES_CATALOGO.forEach(hab => { /* recorre catalogo */
      if (!obtenerEstadoHabitacion(hab.id).ocupada) libres++; /* suma si esta libre */
  });

    textoContador.textContent = `${libres} / ${totalHabs}`; /* escribe libres sobre total */
  barra.max = totalHabs; /* fija maximo barra */
      barra.value = libres; /* asigna valor actual */
}

function actualizarCatalogoServicios() { /* actualiza tarjetas en servicios.html */
  const contenedor = document.getElementById("catalogo-habitaciones"); /* contenedor catalogo */
    if (!contenedor) return; /* sale si no esta en servicios */

  HABITACIONES_CATALOGO.forEach(hab => { /* recorre cada cuarto */
      const estado = obtenerEstadoHabitacion(hab.id); /* consulta estado */
    const badge = document.querySelector(`[data-badge="${hab.id}"]`); /* etiqueta estado */
        const btn = document.querySelector(`[data-btn="${hab.id}"]`); /* boton reservar */

    if (badge && btn) { /* verifica elementos tarjeta */
        if (estado.ocupada) { /* bloquea tarjeta si esta ocupada */
          badge.textContent = `Ocupada hasta el ${estado.hasta}`; /* muestra fecha limite */
            badge.className = "estado-badge ocupada"; /* aplica color rojo */
          btn.textContent = `Se desocupa el ${estado.hasta}`; /* cambia texto boton */
              btn.classList.add("deshabilitado"); /* desactiva boton */
        } else { /* habilita tarjeta si esta libre */
          badge.textContent = "Disponible"; /* muestra disponible */
            badge.className = "estado-badge libre"; /* aplica color verde */
          btn.textContent = `Reservar ${hab.nombre.split(". ")[1]}`; /* restaura nombre cuarto */
              btn.classList.remove("deshabilitado"); /* activa boton */
        }
    }
  });
}

function inicializarFiltrosCatalogo() { /* filtra habitaciones por precio o estado */
    const selectFiltro = document.getElementById("filtro-catalogo-habitaciones"); /* selector filtro */
  const contenedor = document.getElementById("catalogo-habitaciones"); /* contenedor tarjetas */
      if (!selectFiltro || !contenedor) return; /* sale si no existen */

  selectFiltro.addEventListener("change", () => { /* detecta cambio opcion */
      const criterio = selectFiltro.value; /* obtiene filtro elegido */
    contenedor.querySelectorAll("article.card").forEach(card => { /* recorre tarjetas */
        const habId = card.dataset.habId; /* extrae id cuarto */
          const infoHab = HABITACIONES_CATALOGO.find(h => h.id === habId); /* busca datos cuarto */
        const ocupada = obtenerEstadoHabitacion(habId).ocupada; /* consulta si esta ocupada */
          if (!infoHab) return; /* ignora si no existe */

        let mostrar = true; /* visible por defecto */
          if (criterio === "disponibles" && ocupada) mostrar = false; /* oculta ocupadas */
        if (criterio === "economicas" && infoHab.precio >= 2500) mostrar = false; /* filtra economicas */
          if (criterio === "suites" && infoHab.precio < 3000) mostrar = false; /* filtra suites */

        card.style.display = mostrar ? "" : "none"; /* muestra u oculta tarjeta */
    });
  });
}

function inicializarModalesHabitaciones() { /* crea ventana emergente de amenidades */
  const enlacesReserva = document.querySelectorAll('article.card a[href*="contacto.html?hab="]'); /* botones reservar */
    if (enlacesReserva.length === 0) return; /* sale si no hay tarjetas */

  const modal = document.createElement("dialog"); /* crea ventana modal */
      modal.id = "modal-detalle-habitacion"; /* asigna id modal */
  modal.style.cssText = `
        border: none;
        border-radius: 16px;
        padding: 0;
        max-width: 500px;
        width: 92%;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.3);
        background: #ffffff;
        color: #1e293b;
    `;
  document.body.appendChild(modal); /* inserta modal en pagina */

    enlacesReserva.forEach(enlace => { /* recorre enlaces reservar */
      const url = new URL(enlace.href, window.location.origin); /* lee url enlace */
    const habId = url.searchParams.get("hab"); /* saca id cuarto */
        const infoHab = HABITACIONES_CATALOGO.find(h => h.id === habId); /* busca info cuarto */
    if (!infoHab || enlace.parentElement.querySelector(".btn-ver-detalles-hab")) return; /* evita duplicar boton */

      const btnDetalles = document.createElement("button"); /* crea boton amenidades */
    btnDetalles.type = "button"; /* evita envio formulario */
        btnDetalles.className = "btn-secondary btn-ver-detalles-hab"; /* asigna estilos */
    btnDetalles.textContent = "Ver amenidades"; /* texto boton */
      btnDetalles.style.cssText = "margin-top: 0.5rem; font-size: 0.9rem;"; /* margen superior */

    btnDetalles.addEventListener("click", () => { /* abre el modal con datos del cuarto */
        const estado = obtenerEstadoHabitacion(infoHab.id); /* revisa disponibilidad */
      const listaAmenidades = infoHab.amenidades.map(item => `<li style="margin-bottom: 0.35rem;">✓ ${item}</li>`).join(""); /* arma lista html */

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
                            : `<a href="contacto.html?hab=${infoHab.id}#formulario" class="btn-primary">Reservar ahora</a>`
                        }
                    </footer>
                </article>
            `;

      modal.showModal(); /* muestra ventana emergente */
          modal.querySelector("#cerrar-modal-hab").addEventListener("click", () => modal.close()); /* cierra con X */
      modal.querySelector("#cerrar-modal-hab-btn").addEventListener("click", () => modal.close()); /* cierra con boton */
    });

      enlace.insertAdjacentElement("afterend", btnDetalles); /* coloca boton debajo de reservar */
    });
}

function marcarEstadoCampo(inputId, errId, esValido, mensajeError = "") { /* pinta verde o rojo en inputs */
    const campo = document.getElementById(inputId); /* busca input */
  const label = document.querySelector(`label[for="${inputId}"]`); /* busca etiqueta */
      const errEl = errId ? document.getElementById(errId) : null; /* busca mensaje error */

  if (campo) { /* cambia borde input */
      campo.classList.remove("campo-error", "campo-valido"); /* limpia bordes previos */
    campo.classList.add(esValido ? "campo-valido" : "campo-error"); /* aplica borde nuevo */
  }
    if (label) { /* cambia color etiqueta */
      label.classList.remove("label-error", "label-valido"); /* limpia colores label */
        label.classList.add(esValido ? "label-valido" : "label-error"); /* aplica color label */
    }
  if (errEl) errEl.textContent = esValido ? "" : mensajeError; /* muestra u oculta error */
}

function marcarEstadoHabitaciones(esValido, mensajeError = "") { /* marca cuadro de habitaciones */
  const grid = document.getElementById("lista-checkbox-habitaciones"); /* caja checkboxes */
    const errEl = document.getElementById("err-habitaciones"); /* texto error */
  if (grid) { /* pinta contenedor cuartos */
      grid.classList.remove("campo-error", "campo-valido"); /* limpia bordes */
    grid.classList.add(esValido ? "campo-valido" : "campo-error"); /* aplica color borde */
      grid.querySelectorAll("label.checkbox-item").forEach(lbl => { /* recorre casillas */
        lbl.classList.remove("label-error", "label-valido"); /* limpia color fila */
          const cb = lbl.querySelector('input[type="checkbox"]'); /* obtiene checkbox */
        if (cb && cb.checked) lbl.classList.add("label-valido"); /* marca elegidas verde */
          else if (!esValido) lbl.classList.add("label-error"); /* marca rojo si falta */
      });
  }
    if (errEl) errEl.textContent = esValido ? "" : mensajeError; /* muestra mensaje error */
}

function limpiarEstadosVisualesFormulario() { /* quita colores de validacion */
    const form = document.getElementById("form-reservacion"); /* busca formulario */
  if (!form) return; /* sale si no existe */

    form.querySelectorAll(".error-msg").forEach(el => el.textContent = ""); /* borra textos error */
  form.querySelectorAll("label").forEach(lbl => lbl.classList.remove("label-error", "label-valido")); /* limpia etiquetas */
      form.querySelectorAll("input, textarea, .checkbox-grid").forEach(el => el.classList.remove("campo-error", "campo-valido")); /* limpia inputs */
}

function renderizarCheckboxesHabitaciones() { /* dibuja las 20 casillas en el formulario */
  const listaCheckboxes = document.getElementById("lista-checkbox-habitaciones"); /* caja destino */
    if (!listaCheckboxes) return; /* sale si no esta en contacto */

  const params = new URLSearchParams(window.location.search); /* lee parametros url */
      const habPreseleccionada = params.get("hab"); /* detecta si eligio cuarto desde catalogo */

  const marcadasPrevias = new Set( /* guarda selecciones actuales */
      Array.from(listaCheckboxes.querySelectorAll('input[name="habitaciones"]:checked')).map(cb => cb.value) /* extrae ids marcados */
  );

    listaCheckboxes.innerHTML = ""; /* limpia lista */

  HABITACIONES_CATALOGO.forEach(hab => { /* crea casilla por cada cuarto */
      const estado = obtenerEstadoHabitacion(hab.id); /* revisa disponibilidad */
    const esDeReservaEditada = reservaEnEdicion && Array.isArray(reservaEnEdicion.habitaciones) && reservaEnEdicion.habitaciones.includes(hab.id); /* detecta cuarto propio en edicion */
      const bloqueada = estado.ocupada && !esDeReservaEditada; /* bloquea solo si pertenece a otro */

    const label = document.createElement("label"); /* crea fila opcion */
        label.className = bloqueada ? "checkbox-item ocupada-item" : "checkbox-item"; /* estilo disponible u ocupada */

    const checkbox = document.createElement("input"); /* crea casilla */
      checkbox.type = "checkbox"; /* tipo checkbox */
        checkbox.name = "habitaciones"; /* nombre grupo */
    checkbox.value = hab.id; /* id cuarto */
      checkbox.dataset.precio = hab.precio; /* guarda precio noche */

    if (bloqueada) checkbox.disabled = true; /* bloquea si esta ocupada por otro */
      else if (marcadasPrevias.has(hab.id) || (!listaCheckboxes.dataset.cargado && habPreseleccionada === hab.id)) checkbox.checked = true; /* marca si estaba elegida */

    checkbox.addEventListener("change", () => { /* recalcula total al marcar cuarto */
        calcularCotizacion(); /* actualiza cotizacion */
      const seleccionadas = document.querySelectorAll('input[name="habitaciones"]:checked'); /* cuenta elegidas */
        if (seleccionadas.length > 0) marcarEstadoHabitaciones(true); /* valida si hay seleccion */
      else marcarEstadoHabitaciones(false, "Selecciona al menos una habitación disponible."); /* marca error si vacio */
    });

      const texto = document.createElement("span"); /* crea texto opcion */
    texto.innerHTML = bloqueada /* muestra tarifa o fecha ocupada */
        ? `<strong>${hab.nombre}</strong> — <em>Ocupada hasta ${estado.hasta}</em>`
          : `<strong>${hab.nombre}</strong> ($${hab.precio.toLocaleString("es-MX")} MXN/noche)`;

    label.appendChild(checkbox); /* mete casilla */
        label.appendChild(texto); /* mete texto */
    listaCheckboxes.appendChild(label); /* agrega fila a la lista */
  });

    listaCheckboxes.dataset.cargado = "true"; /* marca primera carga lista */
}

function cargarReservaEnFormulario(reserva) { /* llena todos los campos de contacto con la reserva */
  const form = document.getElementById("form-reservacion"); /* busca formulario */
    if (!form || !reserva) return; /* sale si no existe */

  reservaEnEdicion = reserva.estado === "Activa" ? reserva : null; /* activa modo edicion si sigue vigente */
    limpiarEstadosVisualesFormulario(); /* limpia bordes previos */

  document.getElementById("nombre").value = reserva.nombre || ""; /* llena nombre */
    document.getElementById("correo").value = reserva.correo || ""; /* llena correo */
  document.getElementById("telefono").value = reserva.telefono || ""; /* llena telefono */
    document.getElementById("usuario_huesped").value = reserva.usuario || ""; /* llena usuario */
  document.getElementById("password_huesped").value = reserva.password || ""; /* llena clave */
    document.getElementById("fecha_entrada").value = reserva.fechaEntrada || ""; /* llena fecha entrada */
  document.getElementById("fecha_limite").value = reserva.fechaLimite || ""; /* llena fecha salida */
    document.getElementById("adultos").value = reserva.adultos ?? 1; /* llena adultos */
  document.getElementById("infantes").value = reserva.infantes ?? 0; /* llena infantes */
    document.getElementById("comentarios").value = reserva.comentarios || ""; /* llena comentarios */

  const inputCupon = document.getElementById("codigo_cupon"); /* campo cupon */
    const msgCupon = document.getElementById("msg-cupon"); /* aviso cupon */
  if (reserva.cupon && CUPONES_VALIDOS[reserva.cupon]) { /* restaura cupon si tenia */
      descuentoAplicado = CUPONES_VALIDOS[reserva.cupon]; /* aplica descuento */
    codigoCuponActivo = reserva.cupon; /* guarda codigo */
      if (inputCupon) inputCupon.value = reserva.cupon; /* escribe cupon */
    if (msgCupon) { msgCupon.style.color = "#15803d"; msgCupon.textContent = `✓ Cupón ${reserva.cupon} aplicado (${descuentoAplicado * 100}% de descuento).`; } /* muestra aviso */
  } else { /* limpia cupon si no tenia */
      descuentoAplicado = 0; /* sin descuento */
    codigoCuponActivo = ""; /* sin codigo */
      if (inputCupon) inputCupon.value = ""; /* limpia input */
    if (msgCupon) msgCupon.textContent = ""; /* limpia aviso */
  }

  renderizarCheckboxesHabitaciones(); /* redibuja lista cuartos habilitando los suyos */
    document.querySelectorAll('input[name="habitaciones"]').forEach(cb => { /* marca habitaciones reservadas */
      cb.checked = Array.isArray(reserva.habitaciones) && reserva.habitaciones.includes(cb.value); /* activa casillas */
    });

  calcularCotizacion(); /* actualiza monto total */

    const btnSubmit = form.querySelector('button[type="submit"]'); /* boton enviar */
  if (btnSubmit) { /* actualiza texto boton */
      if (!btnSubmit.dataset.textoOriginal) btnSubmit.dataset.textoOriginal = btnSubmit.textContent; /* respalda texto original */
    btnSubmit.textContent = reservaEnEdicion ? "Guardar Cambios de Reservación" : btnSubmit.dataset.textoOriginal; /* cambia etiqueta boton */
  }

  mostrarAlertaFormulario( /* informa al cliente */
      reservaEnEdicion
        ? `Datos de tu reservación ${reserva.folio} cargados en el formulario. Modifica lo que necesites y presiona "Guardar Cambios de Reservación".`
          : `Datos de la reservación ${reserva.folio} cargados. Como estaba cancelada, al enviarla se generará una nueva reservación.`,
    "exito"
  );
}

function inicializarFormularioReserva() { /* controla validaciones, cupones y envio */
  const form = document.getElementById("form-reservacion"); /* formulario principal */
    const listaCheckboxes = document.getElementById("lista-checkbox-habitaciones"); /* lista cuartos */
  if (!form || !listaCheckboxes) return; /* sale si no existen */

  renderizarCheckboxesHabitaciones(); /* dibuja opciones cuartos */

    const hoy = new Date().toISOString().split("T")[0]; /* fecha actual */
  const inputEntrada = document.getElementById("fecha_entrada"); /* campo llegada */
      const inputLimite = document.getElementById("fecha_limite"); /* campo salida */
  inputEntrada.min = hoy; /* impide fechas pasadas */
    inputLimite.min = hoy; /* impide salida pasada */

  const btnCupon = document.getElementById("btn-aplicar-cupon"); /* boton aplicar cupon */
    const inputCupon = document.getElementById("codigo_cupon"); /* input codigo cupon */
  const msgCupon = document.getElementById("msg-cupon"); /* mensaje estado cupon */

    if (btnCupon && inputCupon && msgCupon) { /* activa cupones descuento */
      btnCupon.addEventListener("click", () => { /* aplica descuento del cupon */
        const code = inputCupon.value.trim().toUpperCase(); /* pasa texto a mayusculas */
          if (CUPONES_VALIDOS[code]) { /* valida si existe codigo */
            descuentoAplicado = CUPONES_VALIDOS[code]; /* aplica porcentaje */
              codigoCuponActivo = code; /* guarda nombre cupon */
            msgCupon.style.color = "#15803d"; /* texto verde */
              msgCupon.textContent = `✓ Cupón ${code} aplicado (${descuentoAplicado * 100}% de descuento).`; /* muestra descuento */
          } else { /* maneja cupon no valido */
            descuentoAplicado = 0; /* quita descuento */
              codigoCuponActivo = ""; /* borra codigo */
            msgCupon.style.color = "#dc2626"; /* texto rojo */
              msgCupon.textContent = "Cupón no válido. Prueba con NAVIDAD25 o FLAMINGO50."; /* avisa error */
          }
        calcularCotizacion(); /* actualiza total */
      });
    }

  const validarCampos = () => { /* valida todos los datos del cliente */
      const nombre = document.getElementById("nombre").value.trim(); /* lee nombre */
    const correo = document.getElementById("correo").value.trim(); /* lee correo */
        const telefono = document.getElementById("telefono").value.trim(); /* lee telefono */
    const usuario = document.getElementById("usuario_huesped").value.trim(); /* lee usuario */
      const password = document.getElementById("password_huesped").value.trim(); /* lee contraseña */
    const fechaEntrada = inputEntrada.value; /* lee fecha llegada */
        const fechaLimite = inputLimite.value; /* lee fecha salida */
    const adultos = parseInt(document.getElementById("adultos").value, 10) || 0; /* lee adultos */
      const infantesVal = document.getElementById("infantes").value; /* lee texto infantes */
    const infantes = parseInt(infantesVal, 10); /* convierte infantes a numero */
        const comentarios = document.getElementById("comentarios").value.trim(); /* lee comentarios */
    const seleccionadas = Array.from(document.querySelectorAll('input[name="habitaciones"]:checked')).map(cb => cb.value); /* lee cuartos elegidos */

      let valido = true; /* bandera validacion */

    if (nombre.length < 3) { marcarEstadoCampo("nombre", "err-nombre", false, "Ingresa tu nombre completo elemplo Axel Bueno Vallejo."); valido = false; } /* valida nombre */
      else marcarEstadoCampo("nombre", "err-nombre", true); /* marca nombre valido */

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { marcarEstadoCampo("correo", "err-correo", false, "Ingresa un correo electrónico válido con el formato axel@gmail.com."); valido = false; } /* valida correo */
      else marcarEstadoCampo("correo", "err-correo", true); /* marca correo valido */

    if (!/^[0-9]{10}$/.test(telefono)) { marcarEstadoCampo("telefono", "err-telefono", false, "El teléfono debe tener exactamente 10 dígitos numéricos ejemplo 4778900989."); valido = false; } /* valida telefono */
      else marcarEstadoCampo("telefono", "err-telefono", true); /* marca telefono valido */

    if (usuario.length < 4) { marcarEstadoCampo("usuario_huesped", "err-usuario", false, "El usuario debe tener al menos 4 caracteres. EJEMPLO AXEL2026.LL"); valido = false; } /* valida usuario */
      else marcarEstadoCampo("usuario_huesped", "err-usuario", true); /* marca usuario valido */

    if (password.length < 4) { marcarEstadoCampo("password_huesped", "err-password", false, "La contraseña debe tener al menos 4 caracteres."); valido = false; } /* valida contraseña */
      else marcarEstadoCampo("password_huesped", "err-password", true); /* marca contraseña valida */

    if (seleccionadas.length === 0) { marcarEstadoHabitaciones(false, "Selecciona al menos una habitación disponible."); valido = false; } /* valida cuartos */
      else marcarEstadoHabitaciones(true); /* marca cuartos validos */

    if (!fechaEntrada) { marcarEstadoCampo("fecha_entrada", "err-entrada", false, "Selecciona la fecha de llegada."); valido = false; } /* valida llegada */
      else marcarEstadoCampo("fecha_entrada", "err-entrada", true); /* marca llegada valida */

    if (!fechaLimite || fechaLimite <= fechaEntrada) { marcarEstadoCampo("fecha_limite", "err-limite", false, "La fecha límite de salida debe ser posterior a la fecha de llegada."); valido = false; } /* valida salida */
      else marcarEstadoCampo("fecha_limite", "err-limite", true); /* marca salida valida */

    if (adultos < 1) { marcarEstadoCampo("adultos", "err-adultos", false, "Debe haber al menos 1 adulto en la reservación."); valido = false; } /* valida adultos */
      else marcarEstadoCampo("adultos", "err-adultos", true); /* marca adultos valido */

    if (infantesVal === "" || isNaN(infantes) || infantes < 0) { marcarEstadoCampo("infantes", null, false); valido = false; } /* valida infantes */
      else marcarEstadoCampo("infantes", null, true); /* marca infantes valido */

    if (comentarios.length < 10) { marcarEstadoCampo("comentarios", "err-comentarios", false, "Escribe un comentario o petición de al menos 10 caracteres."); valido = false; } /* valida comentarios */
      else marcarEstadoCampo("comentarios", "err-comentarios", true); /* marca comentarios valido */

    return { /* retorna resultado validacion */
        valido, /* booleano valido */
      datos: { /* datos limpios formulario */
          nombre, correo, telefono, usuario, password, /* datos personales */
        habitaciones: seleccionadas, fechaEntrada, fechaLimite, /* cuartos y fechas */
          adultos, infantes: isNaN(infantes) ? 0 : infantes, comentarios /* personas y notas */
      }
    };
  };

  ["nombre", "correo", "telefono", "usuario_huesped", "password_huesped", "adultos", "infantes", "comentarios"].forEach(id => { /* activa validacion en vivo */
      const el = document.getElementById(id); /* busca cada input */
    if (el) { /* si existe input */
        el.addEventListener("input", () => { /* escucha cambios */
          if (el.classList.contains("campo-error") || el.classList.contains("campo-valido")) validarCampos(); /* revalida al escribir */
        });
    }
  });

    inputEntrada.addEventListener("change", () => { /* actualiza al cambiar entrada */
      inputLimite.min = inputEntrada.value || hoy; /* ajusta minimo salida */
    calcularCotizacion(); /* recalcula total */
      if (inputEntrada.classList.contains("campo-error") || inputEntrada.classList.contains("campo-valido")) validarCampos(); /* revalida fechas */
    });

  inputLimite.addEventListener("change", () => { /* actualiza al cambiar salida */
      calcularCotizacion(); /* recalcula noches */
    if (inputLimite.classList.contains("campo-error") || inputLimite.classList.contains("campo-valido")) validarCampos(); /* revalida fechas */
  });

    calcularCotizacion(); /* muestra total inicial */

  form.addEventListener("submit", async (e) => { /* guarda o actualiza la reservacion en firestore */
      e.preventDefault(); /* evita recarga pagina */
    const { valido, datos } = validarCampos(); /* valida campos */

      if (!valido) { /* frena envio si hay errores */
        mostrarAlertaFormulario("Por favor corrige los campos marcados en rojo antes de continuar.", "error"); /* muestra alerta roja */
          return; /* detiene proceso */
      }

    const ocupadaReciente = datos.habitaciones.find(id => { /* evita reservar cuarto ganado por otro */
        const est = obtenerEstadoHabitacion(id); /* consulta estado actual */
      return est.ocupada && (!reservaEnEdicion || est.folio !== reservaEnEdicion.folio); /* ignora si es su misma reserva */
    });
      if (ocupadaReciente) { /* verifica conflicto tiempo real */
        marcarEstadoHabitaciones(false, "Una de las habitaciones elegidas acaba de ser reservada. Elige otra disponible."); /* marca error cuartos */
          mostrarAlertaFormulario("Una de las habitaciones elegidas acaba de ser reservada. Por favor selecciona otra.", "error"); /* avisa conflicto */
        return; /* detiene guardado */
      }

    const totalConfirmar = calcularCotizacion(); /* obtiene monto para confirmar */
      const mensajeConfirm = reservaEnEdicion /* elige texto confirmacion */
        ? `¿Estás seguro de guardar los cambios en la reservación ${reservaEnEdicion.folio} a nombre de ${datos.nombre} del ${datos.fechaEntrada} al ${datos.fechaLimite} por $${totalConfirmar.toLocaleString("es-MX")} MXN?`
          : `¿Estás seguro de realizar esta reservación a nombre de ${datos.nombre} del ${datos.fechaEntrada} al ${datos.fechaLimite} por $${totalConfirmar.toLocaleString("es-MX")} MXN?`;
    if (!confirm(mensajeConfirm)) return; /* pide confirmacion antes de enviar */

    const btnSubmit = form.querySelector('button[type="submit"]'); /* boton enviar */
      if (!btnSubmit.dataset.textoOriginal) btnSubmit.dataset.textoOriginal = btnSubmit.textContent; /* guarda texto original */
    btnSubmit.disabled = true; /* bloquea doble clic */
        btnSubmit.textContent = reservaEnEdicion ? "Guardando cambios..." : "Registrando reservación..."; /* muestra mensaje carga */

    try { /* intenta subir a firestore */
        const total = calcularCotizacion(); /* saca monto final */
      const editando = Boolean(reservaEnEdicion && reservaEnEdicion.docId); /* verifica si es modificacion */
        const folio = editando ? reservaEnEdicion.folio : "FP-" + Math.floor(1000 + Math.random() * 9000); /* conserva o crea folio */

        const reservaFinal = { /* objeto reservacion nube */
          folio, /* codigo folio */
            ...datos, /* datos cliente */
          cupon: codigoCuponActivo || "Ninguno", /* cupon usado */
            total, /* precio pagado */
          estado: "Activa", /* estatus reserva */
            creadoEn: editando ? reservaEnEdicion.creadoEn : new Date().toISOString() /* fecha registro */
        };

      if (editando) { /* actualiza documento existente */
          await updateDoc(doc(db, "reservaciones", reservaEnEdicion.docId), reservaFinal); /* guarda cambios en nube */
      } else { /* crea documento nuevo */
          await addDoc(reservacionesRef, reservaFinal); /* sube los datos a la nube */
      }

      mostrarComprobanteTicket(reservaFinal); /* muestra ticket imprimible */

      reservaEnEdicion = null; /* sale de modo edicion */
        form.reset(); /* limpia campos */
      descuentoAplicado = 0; /* reinicia descuento */
        codigoCuponActivo = ""; /* borra cupon */
      if (msgCupon) msgCupon.textContent = ""; /* limpia texto cupon */
        limpiarEstadosVisualesFormulario(); /* quita bordes colores */
      renderizarCheckboxesHabitaciones(); /* reinicia casillas */
        calcularCotizacion(); /* reinicia cotizador */

      mostrarAlertaFormulario( /* muestra aviso exito */
          editando
            ? `¡Reservación ${folio} actualizada correctamente a nombre de ${datos.nombre}!`
              : `¡Reservación registrada a nombre de ${datos.nombre}! Folio: ${folio}. Guarda tu usuario (${datos.usuario}) para consultar o cancelar.`,
        "exito"
      );
    } catch (error) { /* captura fallo conexion */
        console.error("Error al guardar en Firebase:", error); /* muestra error consola */
      mostrarAlertaFormulario("Error al conectar con la base de datos Firebase. Verifica tu conexión.", "error"); /* avisa error red */
    } finally { /* se ejecuta al final */
        btnSubmit.disabled = false; /* reactiva boton */
      btnSubmit.textContent = btnSubmit.dataset.textoOriginal; /* restaura texto */
    }
  });
}

function mostrarComprobanteTicket(reserva) { /* genera recibo con opcion a pdf */
    const contenedorTicket = document.getElementById("ticket-confirmacion"); /* caja ticket */
  if (!contenedorTicket) return; /* sale si no existe */

    const nombresHabs = reserva.habitaciones.map(id => { /* traduce ids cuartos */
      const h = HABITACIONES_CATALOGO.find(item => item.id === id); /* busca cuarto */
        return h ? h.nombre : id; /* devuelve nombre */
    }).join(", "); /* une con comas */

  contenedorTicket.hidden = false; /* muestra comprobante */
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
            <p style="font-size: 1.15rem; margin-top: 0.5rem;"><strong>Total Pagado: $${reserva.total.toLocaleString("es-MX")} MXN</strong></p>
            <button type="button" onclick="window.print()" class="btn-primary" style="margin-top: 1rem;">Imprimir / Guardar PDF</button>
        </article>
    `;
}

function calcularCotizacion() { /* calcula total segun cuartos, noches y cupon */
  const resumen = document.getElementById("resumen-cotizacion"); /* caja resumen total */
    if (!resumen) return 0; /* devuelve cero si no existe */

  const entrada = document.getElementById("fecha_entrada")?.value; /* lee fecha entrada */
      const limite = document.getElementById("fecha_limite")?.value; /* lee fecha salida */
  const seleccionadas = Array.from(document.querySelectorAll('input[name="habitaciones"]:checked')); /* lee cuartos marcados */

    let noches = 1; /* minimo 1 noche */
  if (entrada && limite && limite > entrada) { /* calcula noches estancia */
      const diff = new Date(limite) - new Date(entrada); /* resta fechas */
    noches = Math.ceil(diff / (1000 * 60 * 60 * 24)); /* convierte milisegundos a dias */
  }

    const subtotal = seleccionadas.reduce((acc, cb) => acc + Number(cb.dataset.precio), 0) * noches; /* suma tarifas por noches */
  const ahorro = Math.round(subtotal * descuentoAplicado); /* calcula descuento */
      const total = subtotal - ahorro; /* resta descuento */

  resumen.innerHTML = descuentoAplicado > 0 /* escribe resumen en pantalla */
      ? `Total (${seleccionadas.length} hab. × ${noches} noche${noches > 1 ? "s" : ""}) con cupón <strong>${codigoCuponActivo}</strong>: <strong>$${total.toLocaleString("es-MX")} MXN</strong>`
        : `Total estimado (${seleccionadas.length} hab. × ${noches} noche${noches > 1 ? "s" : ""}): <strong>$${total.toLocaleString("es-MX")} MXN</strong>`;
  return total; /* devuelve monto total */
}

function mostrarAlertaFormulario(mensaje, tipo) { /* muestra aviso verde o rojo */
    const alerta = document.getElementById("alerta-formulario"); /* busca caja alerta */
  if (!alerta) return; /* sale si no existe */
      alerta.textContent = mensaje; /* asigna texto mensaje */
  alerta.className = `alerta-box ${tipo}`; /* aplica clase color */
    alerta.hidden = false; /* muestra alerta */
  alerta.scrollIntoView({ behavior: "smooth", block: "nearest" }); /* desplaza pantalla al aviso */
}

window.editarMiReservacion = function(folio) { /* boton manual para cargar reserva en formulario */
  const reserva = obtenerReservaciones().find(r => r.folio === folio); /* busca reserva por folio */
    if (reserva) cargarReservaEnFormulario(reserva); /* llena todos los campos */
};

function inicializarConsultaHuesped() { /* busca reserva y llena formulario automaticamente */
  const formConsulta = document.getElementById("form-consulta-huesped"); /* formulario consulta */
    const contenedorResultado = document.getElementById("resultado-reserva-huesped"); /* caja resultados */
  if (!formConsulta || !contenedorResultado) return; /* sale si no existen */

    formConsulta.addEventListener("submit", (e) => { /* escucha envio consulta */
      e.preventDefault(); /* evita recarga pagina */
    const user = document.getElementById("login_usuario").value.trim(); /* lee usuario escrito */
        const pass = document.getElementById("login_password").value.trim(); /* lee clave escrita */

    const misReservas = obtenerReservaciones().filter(r => r.usuario === user && r.password === pass); /* filtra reservas del usuario */

      contenedorResultado.hidden = false; /* muestra caja de resultados */
    if (misReservas.length === 0) { /* valida si no hubo coincidencias */
        contenedorResultado.innerHTML = `<p style="color:#dc2626; font-weight:600;">Usuario o contraseña incorrectos, o no tienes reservaciones registradas.</p>`; /* avisa error acceso */
      return; /* termina busqueda */
    }

    const reservaParaLlenar = misReservas.find(r => r.estado === "Activa") || misReservas[0]; /* elige reserva activa */
      cargarReservaEnFormulario(reservaParaLlenar); /* llena automaticamente todos los campos de contacto */

      contenedorResultado.innerHTML = misReservas.map(res => { /* dibuja tarjetas de reservas */
        const nombresHabs = res.habitaciones.map(id => { /* traduce ids de cuartos */
          const h = HABITACIONES_CATALOGO.find(item => item.id === id); /* busca cuarto en catalogo */
            return h ? h.nombre : id; /* devuelve nombre legible */
        }).join(", "); /* une nombres con comas */

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
                        : `<em style="color:#991b1b;">Reservación cancelada</em>`
                    }
                </article>
            `;
      }).join(""); /* inserta tarjetas en pantalla */
    }); /* cierra evento submit consulta */
} /* cierra funcion inicializarConsultaHuesped */

window.cancelarReservacion = async function(folio) { /* cancela reserva y libera cuartos */
    if (!confirm("¿Seguro que deseas cancelar esta reservación? Las habitaciones quedarán libres inmediatamente.")) return; /* pide confirmacion */

  const reserva = reservacionesNube.find(r => r.folio === folio); /* busca reserva por folio */
      if (!reserva || !reserva.docId) return; /* sale si no encuentra documento */

  try { /* intenta actualizar firestore */
      await updateDoc(doc(db, "reservaciones", reserva.docId), { estado: "Cancelada" }); /* marca como cancelada */
    if (reservaEnEdicion && reservaEnEdicion.folio === folio) { /* limpia formulario si estaba cargada */
        reservaEnEdicion = null; /* sale de edicion */
      const form = document.getElementById("form-reservacion"); /* busca formulario */
        if (form) form.reset(); /* vacia campos */
    }
    alert("Reservación cancelada correctamente en Firebase. Las habitaciones han sido liberadas."); /* confirma liberacion */
  } catch (error) { /* captura fallo conexion */
      console.error("Error al cancelar en Firebase:", error); /* muestra error consola */
    alert("No se pudo cancelar la reservación. Intenta de nuevo."); /* alerta fallo al usuario */
  }
}; /* cierra funcion cancelarReservacion */

function inicializarPanelAdmin() { /* controla acceso al panel interno */
  const formAdmin = document.getElementById("form-admin-login"); /* formulario login admin */
    const loginBox = document.getElementById("admin-login-box"); /* caja inicio sesion */
  const dashboard = document.getElementById("admin-dashboard"); /* tablero oculto */
      const btnCerrar = document.getElementById("btn-cerrar-admin"); /* boton cerrar sesion */
  if (!formAdmin || !dashboard) return; /* sale si no esta en admin */

    if (sessionStorage.getItem("flamingo_admin_sesion") === "true") { /* revisa sesion activa */
      loginBox.hidden = true; /* oculta login */
        dashboard.hidden = false; /* muestra panel */
      renderizarDashboardAdmin(); /* carga tablas */
    }

  formAdmin.addEventListener("submit", (e) => { /* valida credenciales empresa */
      e.preventDefault(); /* evita recarga pagina */
    const u = document.getElementById("admin_user").value.trim(); /* lee usuario admin */
        const p = document.getElementById("admin_pass").value.trim(); /* lee clave admin */
    if (u === "admin" && p === "flamingo2026") { /* comprueba usuario y clave */
        sessionStorage.setItem("flamingo_admin_sesion", "true"); /* guarda sesion en navegador */
      loginBox.hidden = true; /* esconde formulario login */
          dashboard.hidden = false; /* abre panel control */
        renderizarDashboardAdmin(); /* dibuja informacion */
    } else alert("Credenciales de empresa incorrectas. Usa admin / flamingo2026"); /* avisa datos incorrectos */
  });

    if (btnCerrar) { /* activa boton salir */
      btnCerrar.addEventListener("click", () => { /* cierra sesion admin */
        sessionStorage.removeItem("flamingo_admin_sesion"); /* borra sesion guardada */
          location.reload(); /* recarga pagina */
      });
    }

  const inputBuscador = document.getElementById("admin-buscador-reservas"); /* buscador historial */
    const selectEstatus = document.getElementById("admin-filtro-estatus"); /* filtro estatus */
  if (inputBuscador) inputBuscador.addEventListener("input", renderizarDashboardAdmin); /* filtra al escribir */
      if (selectEstatus) selectEstatus.addEventListener("change", renderizarDashboardAdmin); /* filtra al seleccionar */
} /* cierra funcion inicializarPanelAdmin */

function renderizarDashboardAdmin() { /* llena tablas e ingresos del administrador */
    const tbodyHabs = document.getElementById("tabla-estado-habitaciones"); /* tabla 20 cuartos */
  const tbodyRes = document.getElementById("tabla-reservaciones-admin"); /* tabla historial */
      const resumenOcupacion = document.getElementById("admin-resumen-ocupacion"); /* texto ocupacion */
  const barraOcupacion = document.getElementById("admin-barra-ocupacion"); /* barra progreso */
      const resumenIngresos = document.getElementById("admin-resumen-ingresos"); /* texto ingresos */
  if (!tbodyHabs || !tbodyRes) return; /* sale si no existen tablas */

    let ocupadasCount = 0; /* contador cuartos ocupados */

  tbodyHabs.innerHTML = HABITACIONES_CATALOGO.map(hab => { /* arma filas de 20 cuartos */
      const estado = obtenerEstadoHabitacion(hab.id); /* consulta estado actual */
    if (estado.ocupada) ocupadasCount++; /* suma si esta ocupada */
      return `
            <tr>
                <td><strong>${hab.nombre}</strong></td>
                <td>$${hab.precio.toLocaleString("es-MX")} MXN</td>
                <td>
                    <span class="estado-badge ${estado.ocupada ? "ocupada" : "libre"}">
                        ${estado.ocupada ? "Ocupada" : "Disponible"}
                    </span>
                </td>
                <td>${estado.ocupada ? estado.huesped : "—"}</td>
                <td>${estado.ocupada ? `<strong>${estado.hasta}</strong>` : "Disponible hoy"}</td>
                <td>
                    ${estado.ocupada
                        ? `<button type="button" class="btn-danger" onclick="cancelarReservacion('${estado.folio}')">Liberar (${estado.folio})</button>`
                        : "Sin acción"
                    }
                </td>
            </tr>
        `;
  }).join(""); /* inserta filas habitaciones */

    const totalHabs = HABITACIONES_CATALOGO.length; /* total habitaciones */
  const libresCount = totalHabs - ocupadasCount; /* calcula libres */
      const porcentaje = Math.round((ocupadasCount / totalHabs) * 100); /* calcula porcentaje */

  if (resumenOcupacion) resumenOcupacion.textContent = `${ocupadasCount} Ocupadas / ${libresCount} Libres (${porcentaje}%)`; /* escribe resumen */
    if (barraOcupacion) { barraOcupacion.max = totalHabs; barraOcupacion.value = ocupadasCount; } /* actualiza barra */

  const termino = (document.getElementById("admin-buscador-reservas")?.value || "").trim().toLowerCase(); /* lee busqueda */
      const filtroEstatus = document.getElementById("admin-filtro-estatus")?.value || "Todas"; /* lee filtro estatus */

  const todasOrdenadas = [...obtenerReservaciones()].sort((a, b) => /* ordena recientes primero */
      (b.creadoEn || "").localeCompare(a.creadoEn || "") /* compara fecha creacion */
  );

    let ingresosActivos = 0; /* acumulador dinero activo */
  todasOrdenadas.forEach(r => { /* recorre reservaciones */
      if (r.estado === "Activa") ingresosActivos += Number(r.total) || 0; /* suma ingresos vigentes */
  });

    const filtradas = todasOrdenadas.filter(res => { /* filtra historial */
      if (filtroEstatus !== "Todas" && res.estado !== filtroEstatus) return false; /* filtra por estatus */
        if (!termino) return true; /* muestra todas si esta vacio */
      const texto = `${res.folio} ${res.nombre} ${res.usuario} ${(res.habitaciones || []).join(" ")}`.toLowerCase(); /* une campos busqueda */
        return texto.includes(termino); /* busca coincidencia */
    });

  tbodyRes.innerHTML = filtradas.length === 0 /* arma filas historial */
      ? `<tr><td colspan="7" style="text-align:center;">No hay reservaciones que coincidan con el filtro.</td></tr>`
        : filtradas.map(res => { /* genera fila por reserva */
          const nombresHabs = res.habitaciones.map(id => { /* traduce ids cuartos */
              const h = HABITACIONES_CATALOGO.find(item => item.id === id); /* busca cuarto */
            return h ? h.nombre : id; /* devuelve nombre */
          }).join("<br>"); /* separa con salto linea */

            return `
                <tr>
                    <td><strong>${res.folio}</strong></td>
                    <td>${res.nombre}<br><small>Usuario: ${res.usuario} (${res.adultos ?? 1} Ad. / ${res.infantes ?? 0} Inf.)</small></td>
                    <td>${nombresHabs}</td>
                    <td>${res.fechaEntrada} &rarr; <strong>${res.fechaLimite}</strong></td>
                    <td>$${Number(res.total).toLocaleString("es-MX")} MXN</td>
                    <td>${res.estado}</td>
                    <td>
                        ${res.estado === "Activa"
                            ? `<button type="button" class="btn-danger" onclick="cancelarReservacion('${res.folio}')">Cancelar</button>`
                            : "Cancelada"
                        }
                    </td>
                </tr>
            `;
        }).join(""); /* inserta filas historial */

    if (resumenIngresos) resumenIngresos.textContent = `$${ingresosActivos.toLocaleString("es-MX")} MXN`; /* escribe total ingresos */
} /* cierra funcion renderizarDashboardAdmin */