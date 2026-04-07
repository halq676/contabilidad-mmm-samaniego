// ================== DATOS ==================
let movimientos = JSON.parse(localStorage.getItem('datos_iglesia_mmm')) || [];

// ================== ELEMENTOS ==================
const formulario = document.getElementById('form-registro');
const tablaBody = document.getElementById('lista-datos');
const filtroActividad = document.getElementById('filter-actividad');

// ================== VARIABLE GLOBAL ==================
let acumuladoInforme = {};

// ================== TABLA ==================
function mostrarTabla() {
    if (!tablaBody) return;
    tablaBody.innerHTML = "";

    let saldoTotalGeneral = 0;
    let resumenActividades = {};

    const inicioSel = document.getElementById('fecha-inicio').value;
    const finSel = document.getElementById('fecha-fin').value;
    const busqueda = filtroActividad.value.toLowerCase();

    movimientos.forEach(item => {
        const entrada = item.tipo === 'entrada' ? parseFloat(item.monto) : 0;
        const salida = item.tipo === 'salida' ? parseFloat(item.monto) : 0;
        saldoTotalGeneral += (entrada - salida);
    });

    const movimientosFiltrados = movimientos.filter(item => {
        const mesRegistro = item.fecha.substring(0, 7);
        const coincideFecha = (!inicioSel || mesRegistro >= inicioSel) &&
                              (!finSel || mesRegistro <= finSel);
        const coincideBusqueda = item.detalle.toLowerCase().includes(busqueda);
        return coincideFecha && coincideBusqueda;
    });

    movimientosFiltrados.forEach((item, index) => {
        const entrada = item.tipo === 'entrada' ? parseFloat(item.monto) : 0;
        const salida = item.tipo === 'salida' ? parseFloat(item.monto) : 0;
        const neto = entrada - salida;

        const actNombre = item.detalle.trim().toUpperCase();
        resumenActividades[actNombre] = (resumenActividades[actNombre] || 0) + neto;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.fecha}</td>
            <td style="text-transform:uppercase;">${item.detalle}</td>
            <td style="color:green;">${entrada ? '$' + entrada.toLocaleString() : '-'}</td>
            <td style="color:red;">${salida ? '$' + salida.toLocaleString() : '-'}</td>
            <td>$${neto.toLocaleString()}</td>
            <td><button onclick="borrarRegistro(${index})">X</button></td>
        `;
        tablaBody.appendChild(fila);
    });

    let totalMes = Object.values(resumenActividades).reduce((a, b) => a + b, 0);
   

    generarInformeAutomatico(movimientosFiltrados);
}

// ================== INFORME AUTOMÁTICO ==================
function generarInformeAutomatico(datos) {
    const lista = document.getElementById('lista-informe');
    lista.innerHTML = "";

    let totalDominical = 0;
    let totalArepas = 0;
    let totalSalidas = 0;
    let totalAportes = 0;
    let totalGeneral = 0;
    let saldoAnterior = 0;

    datos.forEach(item => {
        const entrada = item.tipo === 'entrada' ? parseFloat(item.monto) : 0;
        const salida = item.tipo === 'salida' ? parseFloat(item.monto) : 0;
        const neto = entrada - salida;
        const detalle = (item.detalle || "").toLowerCase();

if (detalle.includes("saldo anterior")) {
    saldoAnterior += Number(item.monto) || 0;
}

        const li = document.createElement('li');
li.style.padding = "10px";
li.style.borderBottom = "1px solid #334155";

li.innerHTML = `
    <div style="display:flex; justify-content:space-between;">
        <span>${item.fecha} - ${item.detalle}</span>
        <strong>$${neto.toLocaleString()}</strong>
    </div>
`;

lista.appendChild(li);

        
        if (detalle.includes("dominical")) totalDominical += entrada;
        if (detalle.includes("arepa")) totalArepas += entrada;
        if (detalle.includes("aporte")) totalAportes += entrada;
        if (item.tipo === "salida") totalSalidas += salida;

        totalGeneral += neto;
    });

    lista.innerHTML += `<hr>`;
    lista.innerHTML += `<li>Saldo anterior: $${saldoAnterior.toLocaleString()}</li>`;
    lista.innerHTML += `<li>Dominical: $${totalDominical.toLocaleString()}</li>`;
    lista.innerHTML += `<li>Arepas: $${totalArepas.toLocaleString()}</li>`;
    lista.innerHTML += `<li>Salidas: $${totalSalidas.toLocaleString()}</li>`;
    lista.innerHTML += `<li>Aportes: $${totalAportes.toLocaleString()}</li>`;
    
    lista.innerHTML += `
    <div class="total-general">
        <h2>TOTAL GENERAL</h2>
        <p>$${totalGeneral.toLocaleString()}</p>
    </div>
`;

    // Actualizamos la variable global que usan los botones
    acumuladoInforme = {
        "Dominical": totalDominical,
        "Arepas": totalArepas,
        "Salidas": totalSalidas,
        "Aportes": totalAportes,
        "Saldo anterior": saldoAnterior,
        "TOTAL GENERAL": totalGeneral
    };
}

// ================== BOTONES DEL INFORME ==================
function limpiarInforme() {
    if (confirm("¿Deseas vaciar todos los datos acumulados en el informe?")) {
        acumuladoInforme = {};
        const lista = document.getElementById('lista-informe');
        if (lista) lista.innerHTML = "";
    }
}

function copiarInforme() {
    if (!acumuladoInforme || Object.keys(acumuladoInforme).length === 0) {
        alert("El informe está vacío.");
        return;
    }

    let textoACopiar = "📋 *INFORME CONSOLIDADO MMM SAMANIEGO*\n\n";
    

    let granTotal = acumuladoInforme["TOTAL GENERAL"] || 0;

for (let act in acumuladoInforme) {
    textoACopiar += `🔹 ${act}: $${acumuladoInforme[act].toLocaleString()}\n`;
}

    textoACopiar += `\n💰 *TOTAL CONSOLIDADO: $${granTotal.toLocaleString()}*`;

    navigator.clipboard.writeText(textoACopiar)
        .then(() => alert("¡Informe copiado al portapapeles!"))
        .catch(() => alert("Error al copiar el informe."));
}

// ================== EXPORTAR EXCEL ==================
function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(movimientos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tesoreria");
    XLSX.writeFile(wb, "MMM_Samaniego.xlsx");
}

// ================== EXPORTAR PDF ==================
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Tesorería MMM Samaniego", 14, 15);

    doc.autoTable({
        html: 'table',
        startY: 20
    });

    doc.save("MMM_Samaniego.pdf");
}

// ================== BACKUP ==================
function respaldarDatos() {
    const blob = new Blob([JSON.stringify(movimientos, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "backup_mmm.json";
    a.click();
}

// ================== RESTAURAR ==================
function restaurarDatos(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        movimientos = JSON.parse(event.target.result);
        localStorage.setItem('datos_iglesia_mmm', JSON.stringify(movimientos));
        mostrarTabla();
        alert("Datos restaurados correctamente");
    };
    reader.readAsText(file);
}

// ================== WHATSAPP ==================
function enviarWhatsApp() {
    let texto = "📊 *INFORME MMM SAMANIEGO*\n\n";
    movimientos.forEach(m => {
        texto += `${m.fecha} - ${m.detalle} - $${m.monto}\n`;
    });
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

// ================== GUARDAR ==================
formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const registro = {
        fecha: document.getElementById('fecha').value,
        detalle: document.getElementById('detalle').value,
        tipo: document.getElementById('tipo').value,
        monto: document.getElementById('monto').value
    };

    movimientos.push(registro);
    localStorage.setItem('datos_iglesia_mmm', JSON.stringify(movimientos));

    formulario.reset();
    mostrarTabla();
});

// ================== BORRAR ==================
function borrarRegistro(i) {
    if(confirm("¿Eliminar registro?")) {
        movimientos.splice(i, 1);
        localStorage.setItem('datos_iglesia_mmm', JSON.stringify(movimientos));
        mostrarTabla();
    }
}

// ================== FILTROS ==================
document.getElementById('fecha-inicio').addEventListener('change', mostrarTabla);
document.getElementById('fecha-fin').addEventListener('change', mostrarTabla);
filtroActividad.addEventListener('input', mostrarTabla);

// ================== LOGIN ==================
const CLAVE_CORRECTA = "2026";

window.onload = () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash){
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                document.getElementById('login-modal').style.display = 'flex';
            }, 500);
        }
    }, 2000);
};

function verificarClave() {
    const input = document.getElementById('pass-input');
    if (input.value === CLAVE_CORRECTA) {
        document.getElementById('login-modal').style.display = 'none';
        mostrarTabla();
    } else {
        alert("Contraseña incorrecta");
    }
}
// ================== BOTÓN LIMPIAR TODOS LOS REGISTROS ==================
document.getElementById('btnLimpiar').addEventListener('click', () => {
    if (confirm("¿Deseas eliminar todos los registros de la tesorería?")) {
        movimientos = []; // vacía todos los movimientos
        localStorage.setItem('datos_iglesia_mmm', JSON.stringify(movimientos)); // actualiza storage
        mostrarTabla(); // refresca la tabla
        alert("Todos los registros han sido eliminados.");
    }
})

function abrirInforme() { 
        document.getElementById('pantalla-informe').style.display = "block";

        const inicioSel = document.getElementById('fecha-inicio').value;
        const finSel = document.getElementById('fecha-fin').value;
        const busqueda = document.getElementById('filter-actividad').value.toLowerCase();

        const filtrados = movimientos.filter(item => {
        const mes = item.fecha.substring(0, 7);
        return (!inicioSel || mes >= inicioSel) &&
               (!finSel || mes <= finSel) &&
               item.detalle.toLowerCase().includes(busqueda);
    });

    generarInformeAutomatico(filtrados);
}

function cerrarInforme() {
    document.getElementById('pantalla-informe').style.display = "none";
}

