// =========================================================================
// IMPORTACIÓN DE FIREBASE FIRESTORE (BASE DE DATOS EN LA NUBE EN TIEMPO REAL)
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Credenciales de tu proyecto en Firebase Console: the-flamingo-palace
const firebaseConfig = {
    apiKey: "AIzaSyCPY7E2qsUGS-5h99TTgQ82_gYTMq5t914",
    authDomain: "the-flamingo-palace.firebaseapp.com",
    projectId: "the-flamingo-palace",
    storageBucket: "the-flamingo-palace.firebasestorage.app",
    messagingSenderId: "297545542688",
    appId: "1:297545542688:web:6801522cd954465a066045",
    measurementId: "G-22DYY934HK"
};

// Inicialización de la conexión con Firestore y referencia a la colección "reservaciones"
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const reservacionesRef = collection(db, "reservaciones");

// Catálogo maestro de las 10 habitaciones del hotel con su tarifa por noche
const HABITACIONES_CATALOGO = [
    { id: "101_estandar_arena", nombre: "101. Estándar Arena", precio: 1850 },
    { id: "102_estandar_brisa", nombre: "102. Estándar Brisa", precio: 1950 },
    { id: "103_doble_coral", nombre: "103. Doble Coral", precio: 2200 },
    { id: "104_el_paraiso_hassel", nombre: "104. El Paraíso con Hassel", precio: 2650 },
    { id: "201_suite_flamingo_sol", nombre: "201. Suite Flamingo Sol", precio: 3200 },
    { id: "202_suite_atardecer", nombre: "202. Suite Atardecer", precio: 3450 },
    { id: "203_suite_costa_dorada", nombre: "203. Suite Costa Dorada", precio: 3800 },
    { id: "204_bungalow_tropical", nombre: "204. Bungalow Tropical", precio: 4300 },
    { id: "301_master_pacifico", nombre: "301. Master Suite Pacífico", precio: 5100 },
    { id: "302_suite_presidencial", nombre: "302. Suite Presidencial", precio: 6500 }
];

// Arreglo en memoria sincronizado automáticamente con la nube de Firebase
let reservacionesNube = [];

// =========================================================================
// FUNCIONES DE CONSULTA DE DISPONIBILIDAD
// =========================================================================
function obtenerReservaciones() {
    return reservacionesNube;
}

function obtenerEstadoHabitacion(habId) {
    const hoy = new Date().toISOString().split("T")[0];
    const reservaciones = obtenerReservaciones();
    const activa = reservaciones.find(res =>
        res.estado === "Activa" &&
        res.fechaLimite >= hoy &&
        Array.isArray(res.habitaciones) &&
        res.habitaciones.includes(habId)
    );
    if (activa) {
        return {
            ocupada: true,
            huesped: activa.nombre,
            hasta: activa.fechaLimite,
            folio: activa.folio
        };
    }
    return { ocupada: false };
}

// =========================================================================
// INICIALIZACIÓN DE LA INTERFAZ Y ESCUCHA EN TIEMPO REAL CON FIRESTORE
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
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
    inicializarPanelAdmin();

    // Escucha en tiempo real con Cloud Firestore
    onSnapshot(reservacionesRef, (snapshot) => {
        reservacionesNube = snapshot.docs.map(documento => ({
            docId: documento.id,
            ...documento.data()
        }));

        actualizarIndicadoresInicio();
        actualizarCatalogoServicios();
        renderizarCheckboxesHabitaciones();
        calcularCotizacion();

        if (sessionStorage.getItem("flamingo_admin_sesion") === "true") {
            renderizarDashboardAdmin();
        }
    }, (error) => {
        console.error("Error al sincronizar con Cloud Firestore:", error);
    });
});

// =========================================================================
// ACTUALIZACIÓN DE INDICADORES (index.html) Y CATÁLOGO (servicios.html)
// =========================================================================
function actualizarIndicadoresInicio() {
    const textoContador = document.getElementById("contador-libres-inicio");
    const barra = document.getElementById("barra-disponibilidad");
    if (!textoContador || !barra) return;

    let libres = 0;
    HABITACIONES_CATALOGO.forEach(hab => {
        if (!obtenerEstadoHabitacion(hab.id).ocupada) libres++;
    });

    textoContador.textContent = `${libres} / 10`;
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
            } else {
                badge.textContent = "Disponible";
                badge.className = "estado-badge libre";
                btn.classList.remove("deshabilitado");
            }
        }
    });
}

// =========================================================================
// UTILIDADES DE VALIDACIÓN VISUAL (CONTORNO ROJO / AZUL Y LIMPIEZA)
// =========================================================================
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
    if (errEl) {
        errEl.textContent = esValido ? "" : mensajeError;
    }
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
            if (cb && cb.checked) {
                lbl.classList.add("label-valido");
            } else if (!esValido) {
                lbl.classList.add("label-error");
            }
        });
    }
    if (errEl) {
        errEl.textContent = esValido ? "" : mensajeError;
    }
}

function limpiarEstadosVisualesFormulario() {
    const form = document.getElementById("form-reservacion");
    if (!form) return;

    form.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
    form.querySelectorAll("label").forEach(lbl => {
        lbl.classList.remove("label-error", "label-valido");
    });
    form.querySelectorAll("input, textarea, .checkbox-grid").forEach(el => {
        el.classList.remove("campo-error", "campo-valido");
    });
}

// =========================================================================
// FORMULARIO DE RESERVACIÓN Y COTIZADOR EN VIVO (contacto.html)
// =========================================================================
function renderizarCheckboxesHabitaciones() {
    const listaCheckboxes = document.getElementById("lista-checkbox-habitaciones");
    if (!listaCheckboxes) return;

    const params = new URLSearchParams(window.location.search);
    const habPreseleccionada = params.get("hab");

    const marcadasPrevias = new Set(
        Array.from(listaCheckboxes.querySelectorAll('input[name="habitaciones"]:checked')).map(cb => cb.value)
    );

    listaCheckboxes.innerHTML = "";

    HABITACIONES_CATALOGO.forEach(hab => {
        const estado = obtenerEstadoHabitacion(hab.id);
        const label = document.createElement("label");
        label.className = estado.ocupada ? "checkbox-item ocupada-item" : "checkbox-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "habitaciones";
        checkbox.value = hab.id;
        checkbox.dataset.precio = hab.precio;

        if (estado.ocupada) {
            checkbox.disabled = true;
        } else if (marcadasPrevias.has(hab.id) || (!listaCheckboxes.dataset.cargado && habPreseleccionada === hab.id)) {
            checkbox.checked = true;
        }

        checkbox.addEventListener("change", () => {
            calcularCotizacion();
            const seleccionadas = document.querySelectorAll('input[name="habitaciones"]:checked');
            if (seleccionadas.length > 0) {
                marcarEstadoHabitaciones(true);
            } else {
                marcarEstadoHabitaciones(false, "Selecciona al menos una habitación disponible.");
            }
        });

        const texto = document.createElement("span");
        texto.innerHTML = estado.ocupada
            ? `<strong>${hab.nombre}</strong> — <em>Ocupada hasta ${estado.hasta}</em>`
            : `<strong>${hab.nombre}</strong> ($${hab.precio.toLocaleString("es-MX")} MXN/noche)`;

        label.appendChild(checkbox);
        label.appendChild(texto);
        listaCheckboxes.appendChild(label);
    });

    listaCheckboxes.dataset.cargado = "true";
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

    // Función central que valida cada excepción exactamente como en tu código original
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
        const seleccionadas = Array.from(
            document.querySelectorAll('input[name="habitaciones"]:checked')
        ).map(cb => cb.value);

        let valido = true;

        // 1. Nombre completo (mínimo 3 caracteres)
        if (nombre.length < 3) {
            marcarEstadoCampo("nombre", "err-nombre", false, "Ingresa tu nombre completo (mínimo 3 caracteres).");
            valido = false;
        } else {
            marcarEstadoCampo("nombre", "err-nombre", true);
        }

        // 2. Correo electrónico válido
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(correo)) {
            marcarEstadoCampo("correo", "err-correo", false, "Ingresa un correo electrónico válido.");
            valido = false;
        } else {
            marcarEstadoCampo("correo", "err-correo", true);
        }

        // 3. Teléfono de exactamente 10 dígitos numéricos
        const regexTel = /^[0-9]{10}$/;
        if (!regexTel.test(telefono)) {
            marcarEstadoCampo("telefono", "err-telefono", false, "El teléfono debe tener exactamente 10 dígitos numéricos.");
            valido = false;
        } else {
            marcarEstadoCampo("telefono", "err-telefono", true);
        }

        // 4. Usuario (mínimo 4 caracteres)
        if (usuario.length < 4) {
            marcarEstadoCampo("usuario_huesped", "err-usuario", false, "El usuario debe tener al menos 4 caracteres.");
            valido = false;
        } else {
            marcarEstadoCampo("usuario_huesped", "err-usuario", true);
        }

        // 5. Contraseña (mínimo 4 caracteres)
        if (password.length < 4) {
            marcarEstadoCampo("password_huesped", "err-password", false, "La contraseña debe tener al menos 4 caracteres.");
            valido = false;
        } else {
            marcarEstadoCampo("password_huesped", "err-password", true);
        }

        // 6. Al menos una habitación seleccionada
        if (seleccionadas.length === 0) {
            marcarEstadoHabitaciones(false, "Selecciona al menos una habitación disponible.");
            valido = false;
        } else {
            marcarEstadoHabitaciones(true);
        }

        // 7. Fecha de entrada
        if (!fechaEntrada) {
            marcarEstadoCampo("fecha_entrada", "err-entrada", false, "Selecciona la fecha de llegada.");
            valido = false;
        } else {
            marcarEstadoCampo("fecha_entrada", "err-entrada", true);
        }

        // 8. Fecha límite / salida posterior a la llegada
        if (!fechaLimite || fechaLimite <= fechaEntrada) {
            marcarEstadoCampo("fecha_limite", "err-limite", false, "La fecha límite de salida debe ser posterior a la fecha de llegada.");
            valido = false;
        } else {
            marcarEstadoCampo("fecha_limite", "err-limite", true);
        }

        // 9. Adultos (mínimo 1)
        if (adultos < 1) {
            marcarEstadoCampo("adultos", "err-adultos", false, "Debe haber al menos 1 adulto en la reservación.");
            valido = false;
        } else {
            marcarEstadoCampo("adultos", "err-adultos", true);
        }

        // 10. Infantes (0 o más)
        if (infantesVal === "" || isNaN(infantes) || infantes < 0) {
            marcarEstadoCampo("infantes", null, false);
            valido = false;
        } else {
            marcarEstadoCampo("infantes", null, true);
        }

        // 11. Comentarios (mínimo 10 caracteres)
        if (comentarios.length < 10) {
            marcarEstadoCampo("comentarios", "err-comentarios", false, "Escribe un comentario o petición de al menos 10 caracteres.");
            valido = false;
        } else {
            marcarEstadoCampo("comentarios", "err-comentarios", true);
        }

        return {
            valido,
            datos: {
                nombre,
                correo,
                telefono,
                usuario,
                password,
                habitaciones: seleccionadas,
                fechaEntrada,
                fechaLimite,
                adultos,
                infantes: isNaN(infantes) ? 0 : infantes,
                comentarios
            }
        };
    };

    // Validación en vivo mientras el usuario corrige cada campo
    const camposEnVivo = [
        "nombre", "correo", "telefono", "usuario_huesped",
        "password_huesped", "adultos", "infantes", "comentarios"
    ];
    camposEnVivo.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                // Solo revalida en vivo si ya había sido evaluado
                if (el.classList.contains("campo-error") || el.classList.contains("campo-valido")) {
                    validarCampos();
                }
            });
        }
    });

    inputEntrada.addEventListener("change", () => {
        inputLimite.min = inputEntrada.value || hoy;
        calcularCotizacion();
        if (inputEntrada.classList.contains("campo-error") || inputEntrada.classList.contains("campo-valido")) {
            validarCampos();
        }
    });

    inputLimite.addEventListener("change", () => {
        calcularCotizacion();
        if (inputLimite.classList.contains("campo-error") || inputLimite.classList.contains("campo-valido")) {
            validarCampos();
        }
    });

    calcularCotizacion();

    // Envío del formulario hacia Firebase Firestore
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const { valido, datos } = validarCampos();

        if (!valido) {
            mostrarAlertaFormulario("Por favor corrige los campos marcados en rojo antes de continuar.", "error");
            return;
        }

        // Verificar que ninguna habitación elegida haya sido ocupada hace segundos en Firebase
        const ocupadaReciente = datos.habitaciones.find(id => obtenerEstadoHabitacion(id).ocupada);
        if (ocupadaReciente) {
            marcarEstadoHabitaciones(false, "Una de las habitaciones elegidas acaba de ser reservada. Elige otra disponible.");
            mostrarAlertaFormulario("Una de las habitaciones elegidas acaba de ser reservada. Por favor selecciona otra.", "error");
            return;
        }

        const btnSubmit = form.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Registrando reservación...";

        try {
            const total = calcularCotizacion();
            const folio = "FP-" + Math.floor(1000 + Math.random() * 9000);

            const nuevaReserva = {
                folio,
                ...datos,
                total,
                estado: "Activa",
                creadoEn: new Date().toISOString()
            };

            // Guardar en Firebase Cloud Firestore
            await addDoc(reservacionesRef, nuevaReserva);

            // 1. Dejar todo el formulario completamente en blanco y sin bordes de color
            form.reset();
            limpiarEstadosVisualesFormulario();
            document.querySelectorAll('input[name="habitaciones"]').forEach(cb => {
                cb.checked = false;
            });
            calcularCotizacion();

            // 2. Mostrar el mensaje de reservación registrada imprimiendo el nombre del huésped
            const mensajeConfirmacion = `¡Reservación registrada a nombre de ${datos.nombre}! Folio: ${folio}. Guarda tu usuario (${datos.usuario}) para consultar o cancelar tu estancia hasta el ${datos.fechaLimite}.`;
            mostrarAlertaFormulario(mensajeConfirmacion, "exito");
            alert(`Reservación registrada a nombre de ${datos.nombre}\nFolio: ${folio}`);
        } catch (error) {
            console.error("Error al guardar en Firebase:", error);
            mostrarAlertaFormulario("Error al conectar con la base de datos Firebase. Verifica tu conexión.", "error");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        }
    });
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

    const sumaPorNoche = seleccionadas.reduce((acc, cb) => acc + Number(cb.dataset.precio), 0);
    const total = sumaPorNoche * noches;

    resumen.innerHTML = `Total estimado (${seleccionadas.length} hab. × ${noches} noche${noches > 1 ? "s" : ""}): <strong>$${total.toLocaleString("es-MX")} MXN</strong>`;
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

// =========================================================================
// CONSULTA Y CANCELACIÓN POR PARTE DEL HUÉSPED (contacto.html)
// =========================================================================
function inicializarConsultaHuesped() {
    const formConsulta = document.getElementById("form-consulta-huesped");
    const contenedorResultado = document.getElementById("resultado-reserva-huesped");
    if (!formConsulta || !contenedorResultado) return;

    formConsulta.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("login_usuario").value.trim();
        const pass = document.getElementById("login_password").value.trim();

        const reservaciones = obtenerReservaciones();
        const misReservas = reservaciones.filter(r => r.usuario === user && r.password === pass);

        contenedorResultado.hidden = false;
        if (misReservas.length === 0) {
            contenedorResultado.innerHTML = `<p style="color:#dc2626; font-weight:600;">Usuario o contraseña incorrectos, o no tienes reservaciones registradas.</p>`;
            return;
        }

        contenedorResultado.innerHTML = misReservas.map(res => {
            const nombresHabs = res.habitaciones.map(id => {
                const h = HABITACIONES_CATALOGO.find(item => item.id === id);
                return h ? h.nombre : id;
            }).join(", ");
            const cantAdultos = res.adultos !== undefined ? res.adultos : 1;
            const cantInfantes = res.infantes !== undefined ? res.infantes : 0;

            return `
                <article style="border-bottom: 1px solid var(--color-border); padding-bottom: 0.85rem; margin-bottom: 0.85rem;">
                    <p><strong>Folio:</strong> ${res.folio} (${res.estado})</p>
                    <p><strong>Huésped:</strong> ${res.nombre}</p>
                    <p><strong>Personas:</strong> ${cantAdultos} Adulto(s), ${cantInfantes} Infante(s)</p>
                    <p><strong>Habitaciones:</strong> ${nombresHabs}</p>
                    <p><strong>Entrada:</strong> ${res.fechaEntrada} | <strong>Fecha Límite:</strong> ${res.fechaLimite}</p>
                    <p><strong>Total:</strong> $${Number(res.total).toLocaleString("es-MX")} MXN</p>
                    ${res.estado === "Activa"
                        ? `<button type="button" class="btn-danger" onclick="cancelarReservacion('${res.folio}')">Cancelar Reservación</button>`
                        : `<em style="color:#991b1b;">Reservación cancelada</em>`
                    }
                </article>
            `;
        }).join("");
    });
}

window.cancelarReservacion = async function(folio) {
    if (!confirm("¿Seguro que deseas cancelar esta reservación? Las habitaciones quedarán libres inmediatamente.")) return;

    const reserva = reservacionesNube.find(r => r.folio === folio);
    if (!reserva || !reserva.docId) return;

    try {
        const docRef = doc(db, "reservaciones", reserva.docId);
        await updateDoc(docRef, { estado: "Cancelada" });
        alert("Reservación cancelada correctamente en Firebase. Las habitaciones han sido liberadas.");

        const contenedorResultado = document.getElementById("resultado-reserva-huesped");
        if (contenedorResultado && !contenedorResultado.hidden) {
            contenedorResultado.innerHTML = `<p style="color:#1e8449; font-weight:600;">Reservación ${folio} cancelada exitosamente.</p>`;
        }
    } catch (error) {
        console.error("Error al cancelar en Firebase:", error);
        alert("No se pudo cancelar la reservación. Intenta de nuevo.");
    }
};

// =========================================================================
// PANEL DE CONTROL PRIVADO DE LA EMPRESA (admin.html)
// =========================================================================
function inicializarPanelAdmin() {
    const formAdmin = document.getElementById("form-admin-login");
    const loginBox = document.getElementById("admin-login-box");
    const dashboard = document.getElementById("admin-dashboard");
    const btnCerrar = document.getElementById("btn-cerrar-admin");
    if (!formAdmin || !dashboard) return;

    if (sessionStorage.getItem("flamingo_admin_sesion") === "true") {
        loginBox.hidden = true;
        dashboard.hidden = false;
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
            renderizarDashboardAdmin();
        } else {
            alert("Credenciales de empresa incorrectas. Usa admin / flamingo2026");
        }
    });

    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            sessionStorage.removeItem("flamingo_admin_sesion");
            location.reload();
        });
    }
}

function renderizarDashboardAdmin() {
    const tbodyHabs = document.getElementById("tabla-estado-habitaciones");
    const tbodyRes = document.getElementById("tabla-reservaciones-admin");
    const resumenOcupacion = document.getElementById("admin-resumen-ocupacion");
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
    }).join("");

    resumenOcupacion.textContent = `${ocupadasCount} Ocupadas / ${10 - ocupadasCount} Libres`;

    const reservaciones = [...obtenerReservaciones()].sort((a, b) =>
        (b.creadoEn || "").localeCompare(a.creadoEn || "")
    );

    let ingresosActivos = 0;

    tbodyRes.innerHTML = reservaciones.length === 0
        ? `<tr><td colspan="7" style="text-align:center;">Aún no hay reservaciones registradas en Firebase.</td></tr>`
        : reservaciones.map(res => {
            if (res.estado === "Activa") ingresosActivos += Number(res.total) || 0;
            const nombresHabs = res.habitaciones.map(id => {
                const h = HABITACIONES_CATALOGO.find(item => item.id === id);
                return h ? h.nombre : id;
            }).join("<br>");
            const cantAdultos = res.adultos !== undefined ? res.adultos : 1;
            const cantInfantes = res.infantes !== undefined ? res.infantes : 0;

            return `
                <tr>
                    <td><strong>${res.folio}</strong></td>
                    <td>${res.nombre}<br><small>Usuario: ${res.usuario} (${cantAdultos} Ad. / ${cantInfantes} Inf.)</small></td>
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
        }).join("");

    resumenIngresos.textContent = `$${ingresosActivos.toLocaleString("es-MX")} MXN`;
}