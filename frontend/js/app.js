/* =========================================
   CONFIGURATION
========================================= */

const API_URL = "http://localhost:5000/api/gastos";

/* =========================================
   DOM ELEMENTS
========================================= */

const gastoForm = document.getElementById("gastoForm");

const gastoId = document.getElementById("gastoId");
const descripcion = document.getElementById("descripcion");
const monto = document.getElementById("monto");
const categoria = document.getElementById("categoria");
const fecha = document.getElementById("fecha");

const btnNuevoGasto = document.getElementById("btnNuevoGasto");
const btnEmptyNuevoGasto = document.getElementById("btnEmptyNuevoGasto");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");

const formTitle = document.getElementById("formTitle");
const formularioSection = document.getElementById("formularioSection");

const buscar = document.getElementById("buscar");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroMes = document.getElementById("filtroMes");

const gastosTableBody = document.getElementById("gastosTableBody");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");

const totalGastado = document.getElementById("totalGastado");
const cantidadGastos = document.getElementById("cantidadGastos");
const categoriaPrincipal = document.getElementById("categoriaPrincipal");

const deleteModal = document.getElementById("deleteModal");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

const notification = document.getElementById("notification");
const notificationMessage = document.getElementById("notificationMessage");


/* =========================================
   APPLICATION STATE
========================================= */

let gastos = [];

let gastoAEliminar = null;


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    establecerFechaActual();

    cargarGastos();

});


/* =========================================
   GET — LOAD EXPENSES
========================================= */

async function cargarGastos() {

    mostrarLoading(true);

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }

        const data = await response.json();

        /*
            Dependiendo de cómo Montserrat
            estructure la respuesta de la API,
            puede venir directamente como array
            o dentro de una propiedad.
        */

        if (Array.isArray(data)) {

            gastos = data;

        } else if (Array.isArray(data.gastos)) {

            gastos = data.gastos;

        } else if (Array.isArray(data.data)) {

            gastos = data.data;

        } else {

            gastos = [];

        }

        renderizarGastos();

        actualizarDashboard();

    } catch (error) {

        console.error(
            "Error cargando gastos:",
            error
        );

        mostrarNotificacion(
            "No se pudieron cargar los gastos.",
            "error"
        );

        gastos = [];

        renderizarGastos();

    } finally {

        mostrarLoading(false);

    }

}


/* =========================================
   POST — CREATE EXPENSE
========================================= */

async function crearGasto(gasto) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(gasto)

        });

        if (!response.ok) {

            const errorData = await response.json()
                .catch(() => null);

            throw new Error(
                errorData?.message ||
                `Error HTTP: ${response.status}`
            );

        }

        const nuevoGasto = await response.json();

        /*
            Agregamos el gasto recibido
            desde la API.
        */

        if (nuevoGasto.data) {

            gastos.push(nuevoGasto.data);

        } else {

            gastos.push(nuevoGasto);

        }

        renderizarGastos();

        actualizarDashboard();

        mostrarNotificacion(
            "Gasto registrado correctamente.",
            "success"
        );

        limpiarFormulario();

    } catch (error) {

        console.error(
            "Error creando gasto:",
            error
        );

        mostrarNotificacion(
            "No se pudo registrar el gasto.",
            "error"
        );

    }

}


/* =========================================
   PUT — UPDATE EXPENSE
========================================= */

async function actualizarGasto(id, gastoActualizado) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(gastoActualizado)
            }
        );

        if (!response.ok) {

            const errorData = await response.json()
                .catch(() => null);

            throw new Error(
                errorData?.message ||
                `Error HTTP: ${response.status}`
            );

        }

        const data = await response.json();

        const gastoActualizadoAPI =
            data.data || data;

        /*
            Buscamos el gasto en memoria
            y reemplazamos sus datos.
        */

        const index = gastos.findIndex(
            gasto => obtenerId(gasto) === id
        );

        if (index !== -1) {

            gastos[index] =
                gastoActualizadoAPI;

        }

        renderizarGastos();

        actualizarDashboard();

        mostrarNotificacion(
            "Gasto actualizado correctamente.",
            "success"
        );

        limpiarFormulario();

    } catch (error) {

        console.error(
            "Error actualizando gasto:",
            error
        );

        mostrarNotificacion(
            "No se pudo actualizar el gasto.",
            "error"
        );

    }

}


/* =========================================
   DELETE — DELETE EXPENSE
========================================= */

async function eliminarGasto(id) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            const errorData = await response.json()
                .catch(() => null);

            throw new Error(
                errorData?.message ||
                `Error HTTP: ${response.status}`
            );

        }

        gastos = gastos.filter(
            gasto => obtenerId(gasto) !== id
        );

        renderizarGastos();

        actualizarDashboard();

        cerrarModal();

        mostrarNotificacion(
            "Gasto eliminado correctamente.",
            "success"
        );

    } catch (error) {

        console.error(
            "Error eliminando gasto:",
            error
        );

        mostrarNotificacion(
            "No se pudo eliminar el gasto.",
            "error"
        );

    }

}


/* =========================================
   FORM SUBMIT
========================================= */

gastoForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const gasto = obtenerDatosFormulario();

        if (!validarGasto(gasto)) {

            return;

        }

        btnGuardar.disabled = true;

        btnGuardar.textContent =
            "Guardando...";

        /*
            Si existe ID estamos editando.
            Si no existe, estamos creando.
        */

        if (gastoId.value) {

            await actualizarGasto(
                gastoId.value,
                gasto
            );

        } else {

            await crearGasto(gasto);

        }

        btnGuardar.disabled = false;

        btnGuardar.textContent =
            gastoId.value
                ? "Actualizar gasto"
                : "Registrar gasto";

    }
);


/* =========================================
   GET FORM DATA
========================================= */

function obtenerDatosFormulario() {

    return {

        descripcion:
            descripcion.value.trim(),

        monto:
            Number(monto.value),

        categoria:
            categoria.value,

        fecha:
            fecha.value

    };

}


/* =========================================
   FORM VALIDATION
========================================= */

function validarGasto(gasto) {

    if (!gasto.descripcion) {

        mostrarNotificacion(
            "La descripción es obligatoria.",
            "error"
        );

        descripcion.focus();

        return false;

    }

    if (!gasto.monto || gasto.monto <= 0) {

        mostrarNotificacion(
            "El monto debe ser mayor que 0.",
            "error"
        );

        monto.focus();

        return false;

    }

    if (!gasto.categoria) {

        mostrarNotificacion(
            "Selecciona una categoría.",
            "error"
        );

        categoria.focus();

        return false;

    }

    if (!gasto.fecha) {

        mostrarNotificacion(
            "Selecciona una fecha.",
            "error"
        );

        fecha.focus();

        return false;

    }

    return true;

}


/* =========================================
   RENDER EXPENSES
========================================= */

function renderizarGastos() {

    const gastosFiltrados =
        obtenerGastosFiltrados();

    gastosTableBody.innerHTML = "";

    if (gastosFiltrados.length === 0) {

        emptyState.hidden = false;

        return;

    }

    emptyState.hidden = true;

    gastosFiltrados.forEach(gasto => {

        const row =
            document.createElement("tr");

        const id =
            obtenerId(gasto);

        row.innerHTML = `

            <td>
                ${escaparHTML(
                    gasto.descripcion
                )}
            </td>

            <td>
                ${escaparHTML(
                    gasto.categoria
                )}
            </td>

            <td>
                ${formatearFecha(
                    gasto.fecha
                )}
            </td>

            <td>
                ${formatearMoneda(
                    gasto.monto
                )}
            </td>

            <td>

                <button
                    type="button"
                    class="action-btn action-edit"
                    data-action="edit"
                    data-id="${id}"
                >
                    Editar
                </button>

                <button
                    type="button"
                    class="action-btn action-delete"
                    data-action="delete"
                    data-id="${id}"
                >
                    Eliminar
                </button>

            </td>

        `;

        gastosTableBody.appendChild(row);

    });

}


/* =========================================
   TABLE ACTIONS
========================================= */

gastosTableBody.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button[data-action]"
            );

        if (!button) {

            return;

        }

        const action =
            button.dataset.action;

        const id =
            button.dataset.id;

        if (action === "edit") {

            cargarGastoParaEditar(id);

        }

        if (action === "delete") {

            abrirModalEliminar(id);

        }

    }
);


/* =========================================
   EDIT EXPENSE
========================================= */

function cargarGastoParaEditar(id) {

    const gasto =
        gastos.find(
            item => obtenerId(item) === id
        );

    if (!gasto) {

        mostrarNotificacion(
            "No se encontró el gasto.",
            "error"
        );

        return;

    }

    gastoId.value =
        obtenerId(gasto);

    descripcion.value =
        gasto.descripcion || "";

    monto.value =
        gasto.monto || "";

    categoria.value =
        gasto.categoria || "";

    fecha.value =
        formatearFechaInput(
            gasto.fecha
        );

    formTitle.textContent =
        "Editar gasto";

    btnGuardar.textContent =
        "Actualizar gasto";

    formularioSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   CLEAR FORM
========================================= */

function limpiarFormulario() {

    gastoForm.reset();

    gastoId.value = "";

    formTitle.textContent =
        "Registrar nuevo gasto";

    btnGuardar.textContent =
        "Registrar gasto";

    establecerFechaActual();

}


/* =========================================
   CANCEL FORM
========================================= */

btnCancelar.addEventListener(
    "click",
    limpiarFormulario
);


/* =========================================
   NEW EXPENSE BUTTONS
========================================= */

btnNuevoGasto.addEventListener(
    "click",
    () => {

        limpiarFormulario();

        formularioSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(() => {

            descripcion.focus();

        }, 500);

    }
);


btnEmptyNuevoGasto.addEventListener(
    "click",
    () => {

        limpiarFormulario();

        formularioSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(() => {

            descripcion.focus();

        }, 500);

    }
);


/* =========================================
   FILTERS
========================================= */

buscar.addEventListener(
    "input",
    renderizarGastos
);

filtroCategoria.addEventListener(
    "change",
    renderizarGastos
);

filtroMes.addEventListener(
    "change",
    renderizarGastos
);


function obtenerGastosFiltrados() {

    const texto =
        buscar.value
            .trim()
            .toLowerCase();

    const categoriaSeleccionada =
        filtroCategoria.value;

    const mesSeleccionado =
        filtroMes.value;

    return gastos.filter(gasto => {

        const coincideTexto =
            !texto ||
            gasto.descripcion
                ?.toLowerCase()
                .includes(texto);

        const coincideCategoria =
            !categoriaSeleccionada ||
            gasto.categoria ===
            categoriaSeleccionada;

        const fechaGasto =
            gasto.fecha
                ? String(gasto.fecha)
                : "";

        const coincideMes =
            !mesSeleccionado ||
            fechaGasto.startsWith(
                mesSeleccionado
            );

        return (
            coincideTexto &&
            coincideCategoria &&
            coincideMes
        );

    });

}


/* =========================================
   DASHBOARD
========================================= */

function actualizarDashboard() {

    const gastosFiltrados =
        obtenerGastosFiltrados();

    const total =
        gastosFiltrados.reduce(
            (sum, gasto) =>
                sum + Number(gasto.monto || 0),
            0
        );

    totalGastado.textContent =
        formatearMoneda(total);

    cantidadGastos.textContent =
        gastosFiltrados.length;

    categoriaPrincipal.textContent =
        obtenerCategoriaPrincipal(
            gastosFiltrados
        );

}


/* =========================================
   MAIN CATEGORY
========================================= */

function obtenerCategoriaPrincipal(
    listaGastos
) {

    if (!listaGastos.length) {

        return "Sin datos";

    }

    const categorias = {};

    listaGastos.forEach(gasto => {

        const nombre =
            gasto.categoria || "Otros";

        categorias[nombre] =
            (categorias[nombre] || 0) +
            Number(gasto.monto || 0);

    });

    return Object.keys(categorias)
        .sort(
            (a, b) =>
                categorias[b] -
                categorias[a]
        )[0];

}


/* =========================================
   DELETE MODAL
========================================= */

function abrirModalEliminar(id) {

    const gasto =
        gastos.find(
            item => obtenerId(item) === id
        );

    if (!gasto) {

        return;

    }

    gastoAEliminar = id;

    deleteModal.hidden = false;

}


function cerrarModal() {

    deleteModal.hidden = true;

    gastoAEliminar = null;

}


btnCerrarModal.addEventListener(
    "click",
    cerrarModal
);


btnCancelarEliminar.addEventListener(
    "click",
    cerrarModal
);


btnConfirmarEliminar.addEventListener(
    "click",
    async () => {

        if (!gastoAEliminar) {

            return;

        }

        btnConfirmarEliminar.disabled =
            true;

        btnConfirmarEliminar.textContent =
            "Eliminando...";

        await eliminarGasto(
            gastoAEliminar
        );

        btnConfirmarEliminar.disabled =
            false;

        btnConfirmarEliminar.textContent =
            "Eliminar";

    }
);


/* =========================================
   CLOSE MODAL WITH ESC
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !deleteModal.hidden
        ) {

            cerrarModal();

        }

    }
);


/* =========================================
   LOADING
========================================= */

function mostrarLoading(mostrar) {

    loadingState.hidden =
        !mostrar;

}


/* =========================================
   NOTIFICATIONS
========================================= */

let notificationTimeout;


function mostrarNotificacion(
    mensaje,
    tipo = "success"
) {

    notificationMessage.textContent =
        mensaje;

    notification.hidden = false;

    if (tipo === "error") {

        notification.style.borderColor =
            "rgba(239,68,68,0.4)";

    } else {

        notification.style.borderColor =
            "rgba(34,197,94,0.25)";

    }

    clearTimeout(
        notificationTimeout
    );

    notificationTimeout =
        setTimeout(() => {

            notification.hidden =
                true;

        }, 3500);

}


/* =========================================
   DATE
========================================= */

function establecerFechaActual() {

    const hoy =
        new Date();

    const fechaLocal =
        new Date(
            hoy.getTime() -
            hoy.getTimezoneOffset() * 60000
        )
        .toISOString()
        .split("T")[0];

    fecha.value =
        fechaLocal;

}


function formatearFechaInput(
    fechaOriginal
) {

    if (!fechaOriginal) {

        return "";

    }

    const fechaTexto =
        String(fechaOriginal);

    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(fechaTexto)
    ) {

        return fechaTexto;

    }

    const fechaObjeto =
        new Date(fechaOriginal);

    if (
        Number.isNaN(
            fechaObjeto.getTime()
        )
    ) {

        return "";

    }

    return fechaObjeto
        .toISOString()
        .split("T")[0];

}


/* =========================================
   FORMAT DATE
========================================= */

function formatearFecha(fechaOriginal) {

    if (!fechaOriginal) {
        return "Sin fecha";
    }

    const fechaTexto = String(fechaOriginal);

    // Tomamos solamente YYYY-MM-DD para evitar
    // conversiones por zona horaria.
    const soloFecha = fechaTexto.split("T")[0];

    if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {

        const [anio, mes, dia] = soloFecha.split("-");

        return `${dia}/${mes}/${anio}`;
    }

    return fechaTexto;
}

/* =========================================
   FORMAT CURRENCY
========================================= */

function formatearMoneda(
    cantidad
) {

    return new Intl.NumberFormat(
        "es-DO",
        {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2
        }
    ).format(
        Number(cantidad) || 0
    );

}


/* =========================================
   GET ID
========================================= */

function obtenerId(gasto) {

    return String(
        gasto._id ||
        gasto.id ||
        ""
    );

}


/* =========================================
   HTML SECURITY
========================================= */

function escaparHTML(valor) {

    const div =
        document.createElement("div");

    div.textContent =
        valor ?? "";

    return div.innerHTML;

}


/* =========================================
   INITIAL FILTER STATE
========================================= */

function actualizarDashboardConFiltros() {

    actualizarDashboard();

}


/* =========================================
   UPDATE DASHBOARD WHEN FILTERS CHANGE
========================================= */

buscar.addEventListener(
    "input",
    actualizarDashboardConFiltros
);

filtroCategoria.addEventListener(
    "change",
    actualizarDashboardConFiltros
);

filtroMes.addEventListener(
    "change",
    actualizarDashboardConFiltros
);