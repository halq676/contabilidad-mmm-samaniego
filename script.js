// 1. Inicialización de datos
let movimientos = JSON.parse(localStorage.getItem('datos_iglesia_mmm')) || [];

// 2. Referencias a los elementos del HTML
const formulario = document.getElementById('form-registro');
const tablaBody = document.getElementById('lista-datos');
const filtroActividad = document.getElementById('filter-actividad');
const splash = document.getElementById('splash-screen');

// 3. Función Principal: Mostrar Tabla y Resumen Detallado
function mostrarTabla() {
    if (!tablaBody) return;
    tablaBody.innerHTML = "";
    
    let saldoTotalGeneral = 0; 
    let resumenActividades = {}; 

    // Capturamos los nuevos valores de rango
    const inicioSel = document.getElementById('fecha-inicio').value; // Formato "YYYY-MM"
    const finSel = document.getElementById('fecha-fin').value;       // Formato "YYYY-MM"
    const busqueda = filtroActividad.value.toLowerCase();

    // Calcular saldo global (histórico total)
    movimientos.forEach(item => {
        const entrada = item.tipo === 'entrada' ? parseFloat(item.monto) : 0;
        const salida = item.tipo === 'salida' ? parseFloat(item.monto) : 0;
        saldoTotalGeneral += (entrada - salida);
    });

    // 2. FILTRADO POR RANGO (Aquí está la magia)
    const movimientosFiltrados = movimientos.filter(item => {
        // Extraemos el Año-Mes del registro (Ej: "2024-05-15" -> "2024-05")
        const mesRegistro = item.fecha.substring(0, 7);
        
        // Si no hay filtros seleccionados, mostramos todo
        const coincideFecha = (!inicioSel || mesRegistro >= inicioSel) && 
                              (!finSel || mesRegistro <= finSel);
        
        const coincideBusqueda = item.detalle.toLowerCase().includes(busqueda);
        
        return coincideFecha && coincideBusqueda;
    });

    // Dibujar las filas del informe mensual
    movimientosFiltrados.forEach((item, index) => {
        const entrada = item.tipo === 'entrada' ? parseFloat(item.monto) : 0;
        const salida = item.tipo === 'salida' ? parseFloat(item.monto) : 0;
        const neto = entrada - salida;

        // Agrupar por nombre de actividad para los cuadritos de resumen
        const actNombre = item.detalle.trim().toUpperCase();
        resumenActividades[actNombre] = (resumenActividades[actNombre] || 0) + neto;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.fecha}</td>
            <td style="text-transform:uppercase; font-weight:500;">${item.detalle}</td>
            <td style="color:green; font-weight:bold">${entrada > 0 ? '$' + entrada.toLocaleString() : '-'}</td>
            <td style="color:red; font-weight:bold">${salida > 0 ? '$' + salida.toLocaleString() : '-'}</td>
            <td style="background:#f0f7ff; font-weight:bold; color:#004a99">$${neto.toLocaleString()}</td>
            <td><button onclick="borrarRegistro(${index})" style="color:#ccc; cursor:pointer; background:none; border:none;">X</button></td>
        `;
        tablaBody.appendChild(fila);
    });

    let totalMes = Object.values(resumenActividades).reduce((a, b) => a + b, 0);
    actualizarResumenVisual(resumenActividades, totalMes, saldoTotalGeneral);
}

// 4. Función para crear las tarjetas de resumen
function actualizarResumenVisual(resumen, totalMes, totalGlobal) {
    const resumenDiv = document.getElementById('resumen-totales');
    if (!resumenDiv) return;

    // 1. Borra la línea vieja y pega esto en su lugar:
const fInicio = document.getElementById('fecha-inicio').value;
const fFin = document.getElementById('fecha-fin').value;

let nombreMes;
if (!fInicio && !fFin) {
    nombreMes = "Todos los registros";
} else if (fInicio === fFin) {
    nombreMes = fInicio; // Muestra el mes único
} else {
    nombreMes = `${fInicio} a ${fFin}`; // Muestra el rango (Ej: 2026-01 a 2026-03)
}
    let html = `<h3 style="color:#004a99; margin: 20px 0 10px 0;">Informe: ${nombreMes}</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">`;
    
    // Busca esta parte dentro del "for (let act in resumen)" y déjala así:
for (let act in resumen) {
    let valorFormateado = resumen[act].toLocaleString();
    html += `<div style="background:white; padding:10px; border-radius:8px; border-left:5px solid #ffcc00; box-shadow: 0 2px 4px rgba(0,0,0,0.1)">
                <small style="color:#666; font-size:0.7rem;">TOTAL ${act}</small><br>
                <strong style="color:#004a99; font-size:1rem;">$${valorFormateado}</strong>
                <button onclick="guardarParaInforme('${act}', '${valorFormateado}')" 
                        style="display:block; margin-top:5px; background:#004a99; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.6rem; padding:2px 5px;">
                        + Añadir al informe
                </button>
             </div>`;
}
    html += `</div>
        <div style="margin-top:15px; display:flex; gap:10px;">
            <div style="flex:1; padding:10px; background:#e8f4fd; color:#004a99; border-radius:8px; text-align:center; border:1px solid #004a99">
                <small>SALDO DEL MES</small><br><strong>$${totalMes.toLocaleString()}</strong>
            </div>
            <div style="flex:1; padding:10px; background:#004a99; color:white; border-radius:8px; text-align:center;">
                <small>TOTAL EN CAJA (GLOBAL)</small><br><strong>$${totalGlobal.toLocaleString()}</strong>
            </div>
        </div><hr style="border:0; border-top:1px dashed #ccc; margin:20px 0;">`;
    
    resumenDiv.innerHTML = html;
}

// 5. Guardar Nuevo Registro
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const registro = {
        fecha: document.getElementById('fecha').value,
        detalle: document.getElementById('detalle').value.toUpperCase(),
        tipo: document.getElementById('tipo').value,
        monto: document.getElementById('monto').value
    };
    movimientos.push(registro);
    movimientos.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    localStorage.setItem('datos_iglesia_mmm', JSON.stringify(movimientos));
    formulario.reset();
    mostrarTabla();
});

// 6. Funciones de Exportación y Respaldo
function respaldarDatos() {
    const blob = new Blob([JSON.stringify(movimientos, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Respaldo_MMM_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function restaurarDatos(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            movimientos = JSON.parse(event.target.result);
            localStorage.setItem('datos_iglesia_mmm', JSON.stringify(movimientos));
            mostrarTabla();
            alert("¡Base de datos restaurada!");
        } catch(err) { alert("Archivo no válido"); }
    };
    reader.readAsText(file);
}

function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(movimientos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contabilidad");
    XLSX.writeFile(wb, "Reporte_MMM.xlsx");
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Informe Tesorería MMM Samaniego", 14, 15);
    doc.autoTable({ html: 'table', startY: 20 });
    doc.save("Reporte_MMM.pdf");
}

function borrarRegistro(i) {
    if(confirm("¿Eliminar este registro?")) {
        movimientos.splice(i, 1);
        localStorage.setItem('datos_iglesia_mmm', JSON.stringify(movimientos));
        mostrarTabla();
    }
}

// 7. Eventos de Filtro y Carga Inicial
document.getElementById('fecha-inicio').addEventListener('change', mostrarTabla);
document.getElementById('fecha-fin').addEventListener('change', mostrarTabla);
filtroActividad.addEventListener('input', mostrarTabla);

// --- NUEVO SISTEMA DE SEGURIDAD PARA MMM SAMANIEGO ---
const CLAVE_CORRECTA = "2026"; // <--- Aquí puedes cambiar tu clave

// BORRA EL ANTERIOR Y PEGA ESTE:
window.onload = () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const loader = document.querySelector('.loader');

        if(splash) {
            // 1. Iniciamos el desvanecimiento
            splash.style.opacity = '0'; 
            
            setTimeout(() => {
                // 2. IMPORTANTE: Quitamos el Splash y el círculo del mapa
                splash.style.display = 'none'; 
                if(loader) loader.style.display = 'none';

                // 3. Mostramos el login (Cuadro azul)
                const modal = document.getElementById('login-modal');
                if(modal) {
                    modal.style.display = 'flex';
                    document.getElementById('pass-input').focus();
                }
            }, 500); // Espera a que termine la transición de 0.5s
        }
    }, 2000);
};
function verificarClave() {
    const input = document.getElementById('pass-input');
    const modal = document.getElementById('login-modal');
    const errorMsg = document.getElementById('error-pass');

    if (input.value === CLAVE_CORRECTA) {
        modal.style.display = 'none'; // Cerramos el candado
        mostrarTabla(); // ¡RECIÉN AQUÍ SE CARGAN LOS DATOS!
    } else {
        errorMsg.style.display = 'block'; // Mostramos "Contraseña incorrecta"
        input.value = ""; // Limpiamos el cuadro
        input.focus();
    }
}
// --- FIN DEL SISTEMA DE SEGURIDAD ---

// Registro de Service Worker (Para modo sin internet)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
}

// CÓDIGO CORREGIDO PARA LIMPIAR EL LIBRO
document.getElementById('btnLimpiar').addEventListener('click', function() {
    const primeraConfirmacion = confirm("¿ESTÁS SEGURO? Esto eliminará TODOS los registros de la tabla permanentemente.");
    
    if (primeraConfirmacion) {
        const segundaConfirmacion = confirm("¿Realmente quieres borrar todo el libro contable de MMM Samaniego? No podrás recuperar los datos.");
        
        if (segundaConfirmacion) {
            // 1. Limpiar la variable en memoria
            movimientos = []; 

            // 2. Limpiar el almacenamiento local usando la clave CORRECTA
            localStorage.removeItem('datos_iglesia_mmm'); 

            // 3. Limpiar el formulario
            document.getElementById('form-registro').reset();

            // 4. Actualizar la interfaz (Esto vaciará la tabla y reseteará los totales)
            mostrarTabla();

            alert("Libro contable vaciado con éxito.");
            
            // Opcional: recarga para asegurar limpieza total de filtros
            location.reload();
        }
    }
});

// --- MENSAJE DE ADVERTENCIA AL SALIR ---
window.addEventListener('beforeunload', (event) => {
    // Solo mostramos la alerta si hay movimientos registrados
    if (movimientos && movimientos.length > 0) {
        // Cancelar el evento según el estándar
        event.preventDefault();
        // Algunos navegadores requieren que se asigne un valor de retorno
        event.returnValue = '¿Recuerdas haber descargado el respaldo de hoy?';
    }
});

// Solicitar permiso para notificaciones al cargar
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

function verificarCierreDeMes() {
    const hoy = new Date();
    // Obtener el último día del mes actual
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();

    if (hoy.getDate() === ultimoDia) {
        enviarNotificacion("Recordatorio de Tesorería", "Hoy es el último día del mes. No olvides descargar el respaldo JSON de las actividades.");
    }
}

function enviarNotificacion(titulo, mensaje) {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(titulo, {
                body: mensaje,
                icon: "./logo.png", // Usamos el logo de la iglesia
                badge: "./logo.png",
                vibrate: [200, 100, 200]
            });
        });
    }
}


// Ejecutar la revisión cada vez que abra la app
verificarCierreDeMes();

// --- SISTEMA DE INFORME CONSOLIDADO INTELIGENTE ---
let acumuladoInforme = {};

function guardarParaInforme(actividad, monto) {
    const lista = document.getElementById('lista-informe');
    if(!lista) return;

    // Convertimos el texto "$100.000" en número puro para poder sumar
    const valorNumerico = parseFloat(monto.replace(/\./g, '').replace(/,/g, '').replace('$', ''));
    
    // Sumar si ya existe la actividad, o crearla si es nueva
    if (acumuladoInforme[actividad]) {
        acumuladoInforme[actividad] += valorNumerico;
    } else {
        acumuladoInforme[actividad] = valorNumerico;
    }

    renderizarListaInforme();
}

function renderizarListaInforme() {
    const lista = document.getElementById('lista-informe');
    lista.innerHTML = ""; 
    let granTotalInforme = 0;

    for (let act in acumuladoInforme) {
        granTotalInforme += acumuladoInforme[act];
        const item = document.createElement('li');
        item.style.padding = "10px";
        item.style.borderBottom = "1px solid #ddd";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.background = "white";
        
        item.innerHTML = `
            <span style="text-transform:uppercase;"><strong>${act}</strong></span>
            <span style="color:#004a99; font-weight:bold;">$${acumuladoInforme[act].toLocaleString()}</span>
        `;
        lista.appendChild(item);
    }

    if (Object.keys(acumuladoInforme).length > 0) {
        const filaTotal = document.createElement('li');
        filaTotal.style.padding = "10px";
        filaTotal.style.marginTop = "10px";
        filaTotal.style.background = "#ffcc00";
        filaTotal.style.display = "flex";
        filaTotal.style.justifyContent = "space-between";
        filaTotal.style.borderRadius = "8px";
        
        filaTotal.innerHTML = `
            <strong>SUMA TOTAL DEL INFORME:</strong>
            <strong style="color:#004a99; font-size:1.1rem;">$${granTotalInforme.toLocaleString()}</strong>
        `;
        lista.appendChild(filaTotal);
    }
}

function limpiarInformeTemporal() {
    if(confirm("¿Deseas vaciar todos los datos acumulados en el informe?")) {
        acumuladoInforme = {}; 
        document.getElementById('lista-informe').innerHTML = "";
    }
}

function copiarResumenInforme() {
    if (Object.keys(acumuladoInforme).length === 0) {
        alert("El informe está vacío.");
        return;
    }

    let textoACopiar = "📋 *INFORME DE TESORERÍA MMM SAMANIEGO*\n\n";
    let granTotal = 0;

    for (let act in acumuladoInforme) {
        textoACopiar += `🔹 ${act}: $${acumuladoInforme[act].toLocaleString()}\n`;
        granTotal += acumuladoInforme[act];
    }

    textoACopiar += `\n💰 *TOTAL CONSOLIDADO: $${granTotal.toLocaleString()}*`;

    navigator.clipboard.writeText(textoACopiar).then(() => {
        alert("¡Informe copiado al portapapeles! Ya puedes pegarlo en WhatsApp.");
    });
}

