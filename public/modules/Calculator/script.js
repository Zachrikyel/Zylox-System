/**
 * LÓGICA DE CÁLCULO 3D (Refactorizada)
 * Sin dependencias externas. Pura matemática.
 */

// 1. Configuración Inicial (Valores por defecto)
const DEFAULT_VALUES = {
    costoRollo: 80000,
    pesoRollo: 1000,
    costoKwh: 800,
    watts: 150,
    depreciacion: 2000, // Costo por hora de máquina (desgaste)
    tasaFallo: 10,      // Porcentaje de riesgo
    margen: 200
};

// 2. Referencias al DOM
const els = {
    inputs: [
        'costoRollo', 'pesoRollo', 'gramosPieza',
        'horas', 'minutos', 'costoKwh', 'watts',
        'depreciacion', 'tasaFallo', 'margen'
    ],
    outputs: {
        material: document.getElementById('resMaterial'),
        luz: document.getElementById('resLuz'),
        depre: document.getElementById('resDepre'),
        total: document.getElementById('resTotal'),
        margenLabel: document.getElementById('margenValor')
    }
};

// 3. Función Matemática Central
function calcular() {
    // A. Obtener valores (o usar 0 si está vacío)
    const val = {};
    els.inputs.forEach(id => {
        val[id] = parseFloat(document.getElementById(id).value) || 0;
    });

    // Actualizar etiqueta visual del slider
    els.outputs.margenLabel.innerText = `${val.margen}%`;

    // --- FÓRMULAS ---

    // 1. Costo del Material
    // (Costo Rollo / Peso Rollo) * Gramos usados
    const costoPorGramo = val.pesoRollo > 0 ? (val.costoRollo / val.pesoRollo) : 0;
    const costoMaterial = costoPorGramo * val.gramosPieza;

    // 2. Tiempo Total en Horas
    const tiempoHoras = val.horas + (val.minutos / 60);

    // 3. Costo de Energía
    // (Watts / 1000) * Horas * Precio Kwh
    const kwhConsumidos = (val.watts / 1000) * tiempoHoras;
    const costoEnergia = kwhConsumidos * val.costoKwh;

    // 4. Depreciación de Máquina
    // Costo hora máquina * Horas impresión
    const costoDepreciacion = val.depreciacion * tiempoHoras;

    // 5. Subtotal Operativo (Costos Directos)
    let costoBase = costoMaterial + costoEnergia + costoDepreciacion;

    // 6. Factor de Fallo (Riesgo)
    // Agregamos un porcentaje por si la impresión falla
    const costoConRiesgo = costoBase * (1 + (val.tasaFallo / 100));

    // 7. Precio Final (Con Margen)
    const ganancia = costoConRiesgo * (val.margen / 100);
    const precioVenta = costoConRiesgo + ganancia;

    // --- RENDERIZADO ---

    // Función auxiliar para formato moneda
    const fmt = (num) => `$ ${Math.round(num).toLocaleString('es-CO')}`;

    els.outputs.material.innerText = fmt(costoMaterial);
    els.outputs.luz.innerText = fmt(costoEnergia);
    els.outputs.depre.innerText = fmt(costoDepreciacion);

    // Efecto visual si el precio cambia
    els.outputs.total.innerText = fmt(precioVenta);
}

// 4. Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧮 Módulo Calculadora Iniciado');

    // Escuchar eventos en todos los inputs
    els.inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calcular);
            // Cargar valores por defecto si están vacíos
            if (!el.value && DEFAULT_VALUES[id]) el.value = DEFAULT_VALUES[id];
        }
    });

    // Cálculo inicial
    calcular();
});