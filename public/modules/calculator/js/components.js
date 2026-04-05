const getIcons = () => window.Icons;
const getFormatters = () => window.Formatters;

// --- SCROLL TO TOP HELPER ---
window.scrollToTop = () => {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const root = document.getElementById('root');
  if (root) root.scrollTop = 0;
};

// --- ZYLOX NOTIFICATION MODAL ---
window.showNotification = (message, type = 'warning', duration = 1500) => {
  const existing = document.getElementById('zylox-notification');
  if (existing) existing.remove();

  const colors = {
    warning: { border: 'border-yellow-500', text: 'text-yellow-400', icon: '⚠️' },
    error: { border: 'border-red-500', text: 'text-red-400', icon: '❌' },
    success: { border: 'border-green-500', text: 'text-green-400', icon: '✅' },
    info: { border: 'border-cyan-500', text: 'text-cyan-400', icon: 'ℹ️' }
  };
  const c = colors[type] || colors.warning;

  const modal = document.createElement('div');
  modal.id = 'zylox-notification';
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in';
  modal.innerHTML = `
    <div class="bg-zinc-900 ${c.border} border-2 max-w-sm w-full p-6" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);">
      <div class="flex items-center justify-center gap-4">
        <span class="text-3xl">${c.icon}</span>
        <p class="${c.text} text-sm font-bold uppercase tracking-wide">${message}</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Establecer transición desde el inicio para el fade-out
  modal.style.transition = 'opacity 0.3s ease-out';

  setTimeout(() => {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
  }, duration);

  modal.onclick = () => {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
  };
};

// --- ZYLOX CONFIRM MODAL (Reemplaza confirm() nativo) ---
window.showConfirmModal = (message, onConfirm, onCancel = null) => {
  const existing = document.getElementById('zylox-confirm-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'zylox-confirm-modal';
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in';
  modal.innerHTML = `
    <div class="bg-zinc-900 border border-zinc-700 max-w-sm w-full p-6" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);">
      <div class="flex items-start gap-4 mb-6">
        <span class="text-2xl">⚠️</span>
        <p class="text-white text-sm font-medium leading-relaxed">${message}</p>
      </div>
      <div class="flex gap-3">
        <button id="confirm-cancel-btn" class="flex-1 py-3 bg-zinc-800 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700">
          Cancelar
        </button>
        <button id="confirm-ok-btn" class="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-red-500 transition-colors">
          Confirmar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeModal = () => modal.remove();

  document.getElementById('confirm-cancel-btn').onclick = () => {
    closeModal();
    if (onCancel) onCancel();
  };

  document.getElementById('confirm-ok-btn').onclick = () => {
    closeModal();
    onConfirm();
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
      if (onCancel) onCancel();
    }
  };
};

// --- UTILIDAD DE DEBOUNCE (MANTENIDA DEL ORIGINAL) ---
let debounceTimers = {};
window.debouncedUpdate = (key, section, value, delay = 800) => {
  if (window.calculatorState) {
    if (section === 'config') window.calculatorState.config[key] = value;
    else if (section === 'print') window.calculatorState.print[key] = value;
    else if (section === 'labor') window.calculatorState.labor[key] = value;
    else if (section === 'logistics') window.calculatorState.logistics[key] = value;
    else if (section === 'pricing') window.calculatorState.pricing[key] = value;
  }
  const timerKey = `${section}_${key}`;
  if (debounceTimers[timerKey]) clearTimeout(debounceTimers[timerKey]);
  debounceTimers[timerKey] = setTimeout(() => { renderCalculatorWithScroll(); }, delay);
};

window.handleInputBlur = (key, section, value) => {
  const timerKey = `${section}_${key}`;
  if (debounceTimers[timerKey]) { clearTimeout(debounceTimers[timerKey]); delete debounceTimers[timerKey]; }
  if (window.calculatorState) {
    if (section === 'config') window.calculatorState.config[key] = value;
    else if (section === 'print') window.calculatorState.print[key] = value;
    else if (section === 'labor') window.calculatorState.labor[key] = value;
    else if (section === 'logistics') window.calculatorState.logistics[key] = value;
    else if (section === 'pricing') window.calculatorState.pricing[key] = value;
  }
  renderCalculatorWithScroll();
};

// ============================================
// 1. HOME SCREEN
// ============================================
function HomeScreen() {
  const Icons = getIcons();
  setTimeout(() => window.loadDashboardStats && window.loadDashboardStats(), 100);

  return `
    <div class="min-h-screen bg-transparent text-white flex flex-col p-6 animate-fade-in pt-4">
      <div class="max-w-lg mx-auto w-full space-y-6">
        <div class="grid grid-cols-1 gap-4">
          <button onclick="navigateTo('calculator')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-cyan-500" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3 relative z-10">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-cyan-400 group-hover:text-white group-hover:bg-cyan-500 transition-colors">${Icons.Calculator(28)}</div>
              <span class="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 tracking-widest">PRINCIPAL</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Nueva Cotización</h3>
            <p class="text-xs text-zinc-400 font-mono">Calcula el precio de una impresión 3D</p>
          </button>

          <button onclick="navigateTo('packages')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-purple-500" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3 relative z-10">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-purple-400 group-hover:text-white group-hover:bg-purple-500 transition-colors">${Icons.Layers(28)}</div>
              <span class="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 tracking-widest">NUEVO</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Bundless</h3>
            <p class="text-xs text-zinc-400 font-mono">Combina varios productos en un paquete</p>
          </button>

          <button onclick="navigateTo('history')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-zinc-500" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3"><div class="p-3 bg-zinc-800 border border-zinc-700 text-zinc-400 group-hover:text-white transition-colors">${Icons.Search(28)}</div></div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Historial</h3>
            <p class="text-xs text-zinc-400 font-mono">Ver cotizaciones y paquetes guardados</p>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-zinc-800/50">
          <div class="bg-black/30 p-4 border border-zinc-800 text-center relative overflow-hidden"><div class="text-3xl font-black text-cyan-500 italic" id="stats-quotes">--</div><div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Cotizaciones</div></div>
          <div class="bg-black/30 p-4 border border-zinc-800 text-center relative overflow-hidden"><div class="text-3xl font-black text-purple-500 italic" id="stats-packages">--</div><div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Paquetes</div></div>
        </div>
        

      </div>
    </div>
  `;
}

// LOGICA DE STATS — usa count HEAD-only (cero filas transferidas)
window.loadDashboardStats = async () => {
  try {
    const [quotesCount, packagesCount] = await Promise.all([
      window.Storage.countQuotes(),
      window.Storage.countPackages()
    ]);
    const qEl = document.getElementById('stats-quotes');
    const pEl = document.getElementById('stats-packages');
    if (qEl) qEl.innerText = quotesCount;
    if (pEl) pEl.innerText = packagesCount;
  } catch (e) { console.warn("Error cargando stats:", e); }
};

// ============================================
// 2. CALCULATOR (LOGIC 100% ORIGINAL RESTORED)
// ============================================
function Calculator() {
  const Icons = getIcons();
  const { formatCurrency, parseDecimalHours, parseTimeInput } = window.Formatters;
  const { PRINTERS, NOZZLES, MATERIALS, SHIPPING_OPTIONS, PACKAGING, COMPLEXITY_LEVELS, GATEWAYS } = window.SICMA_CONSTANTS;

  // ESTADO INICIAL ORIGINAL
  if (!window.calculatorState) {
    window.calculatorState = {
      step: 1,
      config: { kwhPrice: 920, printer: 'p1s', nozzle: 0.4, material: 'pla', materialCostPerKg: 75000, amsMode: false },
      print: { printHours: 0, materialCost: 0, coolMinutes: 18, isPiece: 'single', plateCount: 1 },
      labor: { complexity: 'simple', primerToggle: false, lacquerToggle: false },
      logistics: { shipping: 'pickup', packagingType: 'box', packagingSize: 'small', packagingCustom: 0, shippingCustom: 0, additionalsToggle: false, isFreeShipping: false },
      pricing: { gateway: 'wompi', profitMargin: 25, additionalCharge: 0 },
      results: null
    };
  }
  const state = window.calculatorState;

  // HELPERS ORIGINALES
  window.updateConfig = (key, value) => { state.config[key] = value; if (key === 'material') { const m = MATERIALS.find(x => x.id === value); state.print.coolMinutes = m.coolMinutes; } renderCalculatorWithScroll(); };
  window.updatePrint = (key, value) => { state.print[key] = value; renderCalculatorWithScroll(); };
  window.updateLabor = (key, value) => { state.labor[key] = value; if (key === 'complexity') { const margins = { simple: 25, easy: 30, medium: 35, hard: 40 }; if (margins[value]) state.pricing.profitMargin = margins[value]; } renderCalculatorWithScroll(); };
  window.updateLogistics = (key, value) => { state.logistics[key] = value; renderCalculatorWithScroll(); };
  window.updatePricing = (key, value) => { state.pricing[key] = value; renderCalculatorWithScroll(); };

  window.updateTimePreview = (val) => {
    const hours = parseTimeInput(val);
    // Actualizar estado directamente sin re-render (evita cerrar teclado)
    window.calculatorState.print.printHours = hours;
    const container = document.getElementById('timePreviewContainer');
    const text = document.getElementById('timePreviewText');
    if (hours > 0) {
      if (container) container.classList.remove('hidden');
      if (text) { const p = parseDecimalHours(hours); text.textContent = `≈ ${p.hours}h ${p.minutes}min`; }
    } else { if (container) container.classList.add('hidden'); }
  };

  window.nextStep = () => {
    if (state.step === 1 && (!state.config.kwhPrice || !state.config.materialCostPerKg)) return showNotification('Faltan datos de configuración', 'warning');
    if (state.step === 2 && (!state.print.printHours || !state.print.materialCost)) return showNotification('Faltan datos de impresión', 'warning');
    if (state.step === 4) {
      if (state.logistics.shipping === 'national' && !state.logistics.shippingCustom) return showNotification('Falta costo de envío', 'warning');
      if (state.logistics.packagingSize === 'deluxe' && !state.logistics.packagingCustom) return showNotification('Falta costo de empaque', 'warning');
    }
    if (state.step === 5) {
      state.results = window.Calculations.calculateQuote({ config: state.config, print: state.print, labor: state.labor, logistics: state.logistics, pricing: state.pricing });
      state.step = 6;
    } else if (state.step < 6) state.step++;
    renderCalculator();
    scrollToTop();
  };
  window.prevStep = () => { if (state.step > 1) state.step--; renderCalculator(); scrollToTop(); };
  window.resetCalculator = () => { delete window.calculatorState; navigateTo('home'); };

  const getProgress = () => (state.step / 6) * 100;
  let content = '';

  // --- CONTENIDO DEL CÓDIGO ORIGINAL (SIN MODIFICAR LÓGICA NI LABELS) ---

  if (state.step === 1) {
    const selectedPrinter = PRINTERS.find(p => p.id === state.config.printer);
    const selectedNozzle = NOZZLES.find(n => n.size === state.config.nozzle);
    const selectedMaterial = MATERIALS.find(m => m.id === state.config.material);
    content = `
      <div class="space-y-5 animate-fade-in">
        <h2 class="text-xl font-black text-cyan-400 uppercase italic">Configuración</h2>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-2 flex items-center gap-2">${Icons.Zap(16)} Costo Luz (COP/kWh)</label>
          <input type="text" inputmode="decimal" value="${state.config.kwhPrice}" oninput="debouncedUpdate('kwhPrice', 'config', parseFloat(this.value) || 0)" onblur="handleInputBlur('kwhPrice', 'config', parseFloat(this.value) || 0)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-xl font-bold text-cyan-400 focus:outline-none focus:border-cyan-500" />
          <p class="text-xs text-zinc-500 mt-2">💡 Recomendado: ~920 COP</p>
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div class="flex items-center justify-between mb-3">${Icons.Printer(24)}<span class="text-xs font-mono text-cyan-400 bg-zinc-800 px-2 py-1 rounded">HARDWARE</span></div>
          <label class="block text-sm text-zinc-400 mb-2">Impresora</label>
          <select onchange="updateConfig('printer', this.value)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-semibold focus:outline-none focus:border-cyan-500 mb-4">${PRINTERS.map(p => `<option value="${p.id}" ${state.config.printer === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select>
          <div class="flex justify-between text-xs font-mono mb-4"><span class="text-zinc-500">Consumo: <span class="text-white font-bold">${selectedPrinter.watts}W</span></span><span class="text-zinc-500">Desgaste: <span class="text-white font-bold">${formatCurrency(selectedPrinter.wear)}/h</span></span></div>
          <div class="pt-4 border-t border-zinc-800"><label class="block text-sm text-zinc-400 mb-2">Boquilla (Nozzle)</label><div class="grid grid-cols-4 gap-2">${NOZZLES.map(n => `<button onclick="updateConfig('nozzle', ${n.size})" class="py-2 rounded-lg border-2 transition text-sm ${state.config.nozzle === n.size ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 text-zinc-400'}">${n.size}</button>`).join('')}</div><p class="text-xs text-zinc-600 mt-2">⚠️ Riesgo: +${((selectedNozzle.riskFactor - 1) * 100).toFixed(0)}%</p></div>
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-2">Material</label>
          <select onchange="updateConfig('material', this.value)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-semibold focus:outline-none focus:border-cyan-500 mb-4">${MATERIALS.map(m => `<option value="${m.id}" ${state.config.material === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}</select>
          <label class="block text-sm text-zinc-400 mb-2">Costo Filamento (COP/Kg)</label>
          <input type="text" inputmode="decimal" value="${state.config.materialCostPerKg}" oninput="debouncedUpdate('materialCostPerKg', 'config', parseFloat(this.value) || 0)" onblur="handleInputBlur('materialCostPerKg', 'config', parseFloat(this.value) || 0)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-cyan-500 mb-2" />
          <p class="text-xs text-zinc-500 mb-4">Precio por kilogramo</p>
          <div class="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"><div class="flex items-center gap-2">${Icons.Sparkles(18)}<span class="text-sm">Modo AMS</span></div><button onclick="updateConfig('amsMode', ${!state.config.amsMode})" class="w-12 h-6 rounded-full transition relative ${state.config.amsMode ? 'bg-cyan-500' : 'bg-zinc-700'}"><div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${state.config.amsMode ? 'translate-x-6' : ''}"></div></button></div>
          ${state.config.amsMode ? `<div class="flex items-start gap-2 mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">${Icons.AlertCircle(14)}<span class="text-xs text-orange-400">Riesgo +${((selectedMaterial.amsRisk - 1) * 100).toFixed(0)}% por purga</span></div>` : ''}
        </div>
      </div>
    `;
  }

  else if (state.step === 2) {
    const selectedMaterial = MATERIALS.find(m => m.id === state.config.material);
    content = `
      <div class="space-y-5 animate-fade-in">
        <h2 class="text-xl font-black text-cyan-400 uppercase italic">Datos de Impresión</h2>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-4 flex items-center gap-2">${Icons.Clock()} Tiempo (desde Bambu Studio)</label>
          <div class="bg-zinc-800 rounded-xl p-6 text-center mb-4">
            <input type="text" inputmode="text" value="${state.print.printHours || ''}" oninput="window.updateTimePreview(this.value)" onblur="handleInputBlur('printHours', 'print', window.Formatters.parseTimeInput(this.value))" class="w-full bg-transparent text-center text-5xl font-bold text-white focus:outline-none" placeholder="0.0" />
            <div class="text-sm text-zinc-500 mt-2">horas decimales o formato: 1d 12h 51m</div>
          </div>
          <div id="timePreviewContainer" class="${state.print.printHours > 0 ? '' : 'hidden'} text-center text-xs text-cyan-400 font-mono bg-cyan-500/10 p-2 rounded-lg mb-4">
             <span id="timePreviewText">≈ ${state.print.printHours > 0 ? `${parseDecimalHours(state.print.printHours).hours}h ${parseDecimalHours(state.print.printHours).minutes}min` : ''}</span>
          </div>
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-3">Tipo de Impresión</label>
          <div class="grid grid-cols-2 gap-3 mb-4"><button onclick="updatePrint('isPiece', 'single')" class="py-3 rounded-lg border-2 transition ${state.print.isPiece === 'single' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 text-zinc-400'}">Pieza Única</button><button onclick="updatePrint('isPiece', 'multi')" class="py-3 rounded-lg border-2 transition ${state.print.isPiece === 'multi' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 text-zinc-400'}">Multipieza</button></div>
          ${state.print.isPiece === 'multi' ? `<div class="mb-4"><label class="block text-sm text-zinc-400 mb-2">Cantidad de Placas</label><input type="text" inputmode="numeric" min="1" value="${state.print.plateCount}" oninput="debouncedUpdate('plateCount', 'print', parseInt(this.value) || 1)" onblur="handleInputBlur('plateCount', 'print', parseInt(this.value) || 1)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-cyan-500" /></div>` : ''}
          <div class="pt-4 border-t border-zinc-800"><label class="block text-sm text-zinc-400 mb-2 flex items-center gap-2">${Icons.Snowflake()} Enfriamiento Base (min)</label><input type="text" inputmode="numeric" value="${state.print.coolMinutes || selectedMaterial.coolMinutes}" oninput="debouncedUpdate('coolMinutes', 'print', parseInt(this.value) || 0)" onblur="handleInputBlur('coolMinutes', 'print', parseInt(this.value) || 0)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-cyan-500" /><p class="text-xs text-zinc-500 mt-2">${state.print.isPiece === 'multi' ? `Se multiplicará por ${state.print.plateCount || 1} placas = ${(state.print.coolMinutes || selectedMaterial.coolMinutes) * (Number(state.print.plateCount) || 1)} min total` : `Recomendado ${selectedMaterial.name}: ${selectedMaterial.coolMinutes} min`}</p></div>
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-4 flex items-center gap-2">${Icons.Package()} Cantidad Material</label>
          <div class="bg-zinc-800 rounded-xl p-4 mb-3"><div class="text-xs text-zinc-500 mb-2">Valor desde Bambu Studio (COP)</div><input type="text" inputmode="decimal" value="${state.print.materialCost || ''}" oninput="window.calculatorState.print.materialCost = parseFloat(this.value) || 0" onblur="handleInputBlur('materialCost', 'print', parseFloat(this.value) || 0)" class="w-full bg-transparent text-right text-3xl font-bold text-cyan-400 focus:outline-none" placeholder="0" /></div>
          <div class="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-500">💡 Usa la cantidad total que muestra Bambu Studio</div>
        </div>
      </div>
    `;
  }

  else if (state.step === 3) {
    content = `
      <div class="space-y-5 animate-fade-in">
        <h2 class="text-xl font-black text-cyan-400 uppercase italic">Complejidad</h2>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-4">Nivel de Complejidad</label>
          <div class="space-y-3">${Object.entries(COMPLEXITY_LEVELS).map(([key, level]) => { const isSelected = state.labor.complexity === key; const estimatedCost = (level.suppliesCost + ((level.postProcessMinutes + level.operatorMinutes) / 60 * 20000) * (1 + level.failureRisk)).toFixed(0); return `<button onclick="updateLabor('complexity', '${key}')" class="w-full p-4 rounded-xl border-2 transition text-left ${isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-700 bg-zinc-800'}"><div class="flex items-center justify-between mb-2"><span class="text-lg font-bold text-white">${level.name}</span><span class="text-sm text-cyan-400 font-mono">${formatCurrency(estimatedCost)}</span></div><div class="space-y-1 text-xs text-zinc-400"><div>• Post-proceso: ${level.postProcessMinutes} min</div><div>• Operador: ${level.operatorMinutes} min</div><div>• Riesgo fallo: ${(level.failureRisk * 100).toFixed(0)}%</div><div>• Insumos: ${formatCurrency(level.suppliesCost)}</div></div>${level.description ? `<div class="text-xs text-zinc-500 mt-2 italic">${level.description}</div>` : ''}</button>`; }).join('')}</div>
          ${state.config.amsMode ? `<div class="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-400">✓ Modo AMS activo: +2% adicional aplicado automáticamente</div>` : ''}
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <h3 class="text-sm font-bold text-white mb-3">Acabados Opcionales</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"><div class="flex items-center gap-2">${Icons.Sparkles(18)}<div><div class="text-sm font-semibold">Primer</div><div class="text-xs text-zinc-500">+$1.000</div></div></div><button onclick="updateLabor('primerToggle', ${!state.labor.primerToggle})" class="w-12 h-6 rounded-full transition relative ${state.labor.primerToggle ? 'bg-cyan-500' : 'bg-zinc-700'}"><div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${state.labor.primerToggle ? 'translate-x-6' : ''}"></div></button></div>
            <div class="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"><div class="flex items-center gap-2">${Icons.Sparkles(18)}<div><div class="text-sm font-semibold">Laca</div><div class="text-xs text-zinc-500">+$1.000</div></div></div><button onclick="updateLabor('lacquerToggle', ${!state.labor.lacquerToggle})" class="w-12 h-6 rounded-full transition relative ${state.labor.lacquerToggle ? 'bg-cyan-500' : 'bg-zinc-700'}"><div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${state.labor.lacquerToggle ? 'translate-x-6' : ''}"></div></button></div>
          </div>
          <p class="text-xs text-zinc-500 mt-3">💡 Activa solo si la pieza requiere estos acabados</p>
        </div>
      </div>
    `;
  }

  else if (state.step === 4) {
    content = `
      <div class="space-y-5 animate-fade-in">
        <h2 class="text-xl font-black text-cyan-400 uppercase italic">Logística</h2>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-3 flex items-center gap-2">${Icons.Truck()} Envío</label>
          <div class="space-y-2">${SHIPPING_OPTIONS.map(option => `<button onclick="updateLogistics('shipping', '${option.id}')" class="w-full p-4 rounded-xl border-2 transition flex items-center justify-between ${state.logistics.shipping === option.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-700 bg-zinc-800'}"><div class="flex items-center gap-3"><div class="text-2xl">${option.icon}</div><div class="text-sm font-semibold">${option.name}</div></div><div class="text-sm font-bold">${option.id === 'national' ? 'Personalizado' : (option.cost === 0 ? 'Gratis' : `${formatCurrency(option.cost)}`)}</div></button>`).join('')}</div>
          ${state.logistics.shipping === 'national' ? `<div class="mt-4 animate-fade-in"><label class="block text-sm text-zinc-400 mb-2">Costo Envío Personalizado</label><input type="text" inputmode="decimal" value="${state.logistics.shippingCustom}" oninput="debouncedUpdate('shippingCustom', 'logistics', parseFloat(this.value) || 0)" onblur="handleInputBlur('shippingCustom', 'logistics', parseFloat(this.value) || 0)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg font-bold text-cyan-400 focus:outline-none focus:border-cyan-500" placeholder="0" /></div>` : ''}
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-3">Embalaje</label>
          <div class="grid grid-cols-2 gap-3 mb-4"><button onclick="updateLogistics('packagingType', 'box')" class="py-3 rounded-lg border-2 transition ${state.logistics.packagingType === 'box' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700'}">📦 Caja</button><button onclick="updateLogistics('packagingType', 'bag')" class="py-3 rounded-lg border-2 transition ${state.logistics.packagingType === 'bag' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700'}">🎒 Bolsa</button></div>
          <label class="block text-sm text-zinc-400 mb-2">Tamaño</label>
          <select onchange="updateLogistics('packagingSize', this.value)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-semibold focus:outline-none focus:border-cyan-500 mb-3">${PACKAGING.map(p => `<option value="${p.id}" ${state.logistics.packagingSize === p.id ? 'selected' : ''}>${p.name}${p.cost > 0 ? ` - ${formatCurrency(p.cost)}` : ''}</option>`).join('')}</select>
          ${state.logistics.packagingSize === 'deluxe' ? `<div><label class="block text-sm text-zinc-400 mb-2">Costo Personalizado</label><input type="text" inputmode="decimal" value="${state.logistics.packagingCustom}" oninput="debouncedUpdate('packagingCustom', 'logistics', parseFloat(this.value) || 0)" onblur="handleInputBlur('packagingCustom', 'logistics', parseFloat(this.value) || 0)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg font-bold text-cyan-400 focus:outline-none focus:border-cyan-500" placeholder="Ingrese costo" /></div>` : ''}
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"><div class="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"><div class="flex items-center gap-2">${Icons.Sparkles(18)}<span class="text-sm">Cargo Adicional (+2%)</span></div><button onclick="updateLogistics('additionalsToggle', ${!state.logistics.additionalsToggle})" class="w-12 h-6 rounded-full transition relative ${state.logistics.additionalsToggle ? 'bg-cyan-500' : 'bg-zinc-700'}"><div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${state.logistics.additionalsToggle ? 'translate-x-6' : ''}"></div></button></div><p class="text-xs text-zinc-500 mt-2">Activa para agregar 2% al costo de embalaje</p></div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"><div class="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"><div class="flex items-center gap-2"><span class="text-lg">🚚</span><div><div class="text-sm font-semibold">Envío Gratis</div><div class="text-xs text-zinc-500">Marcar si este producto lleva envío gratuito</div></div></div><button onclick="updateLogistics('isFreeShipping', ${!state.logistics.isFreeShipping})" class="w-12 h-6 rounded-full transition relative ${state.logistics.isFreeShipping ? 'bg-green-500' : 'bg-zinc-700'}"><div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${state.logistics.isFreeShipping ? 'translate-x-6' : ''}"></div></button></div>${state.logistics.isFreeShipping ? '<div class="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-green-400 font-mono">✅ Este producto tendrá envío GRATIS en la tienda</div>' : ''}</div>
      </div>
    `;
  }

  else if (state.step === 5) {
    content = `
      <div class="space-y-5 animate-fade-in">
        <h2 class="text-xl font-black text-cyan-400 uppercase italic">Finanzas</h2>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-3 flex items-center gap-2">${Icons.DollarSign()} Pasarela de Pago</label>
          <select onchange="updatePricing('gateway', this.value)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-semibold">${GATEWAYS.map(g => `<option value="${g.id}" ${state.pricing.gateway === g.id ? 'selected' : ''}>${g.name}${g.rate > 0 ? ` (${g.rate}%)` : ' (0%)'}</option>`).join('')}</select>
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-3 flex items-center gap-2">${Icons.TrendingUp()} Margen de Ganancia</label>
          <div class="flex items-center gap-3 mb-4"><input type="text" inputmode="decimal" value="${state.pricing.profitMargin}" oninput="debouncedUpdate('profitMargin', 'pricing', parseFloat(this.value) || 0)" onblur="handleInputBlur('profitMargin', 'pricing', parseFloat(this.value) || 0)" class="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-center text-2xl font-bold text-cyan-400 focus:outline-none focus:border-cyan-500" /><span class="text-2xl text-white">%</span><div class="text-xs text-zinc-500 flex-1">≈ Multiplicar por <span class="text-white font-bold">${(1 / (1 - state.pricing.profitMargin / 100)).toFixed(1)}x</span></div></div>
        </div>
        <div class="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <label class="block text-sm text-zinc-400 mb-2 flex items-center gap-2">${Icons.Sparkles()} Cargo Adicional</label>
          <p class="text-xs text-zinc-500 mb-3">Para piezas muy personalizadas. Este valor se cobra APARTE (no entra en Wompi).</p>
          <input type="text" inputmode="decimal" value="${state.pricing.additionalCharge}" oninput="debouncedUpdate('additionalCharge', 'pricing', parseFloat(this.value) || 0)" onblur="handleInputBlur('additionalCharge', 'pricing', parseFloat(this.value) || 0)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-xl font-bold text-purple-400 focus:outline-none focus:border-purple-500" placeholder="0" />
        </div>
      </div>
    `;
  }

  else if (state.step === 6 && state.results) {
    const r = state.results;
    content = `
      <div class="space-y-5 animate-fade-in">
        <div class="text-center mb-8 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-8 border border-zinc-700 shadow-2xl">
          <p class="text-zinc-500 text-xs uppercase tracking-widest mb-2">Precio a Cobrar</p>
          <h1 class="text-6xl font-black text-white mb-3 tracking-tight">${formatCurrency(r.finalPrice)}</h1>
          <div class="flex justify-center gap-4 text-xs font-mono text-zinc-500"><span>USD ${(r.finalPrice / 4100).toFixed(2)}</span><span>|</span><span>EUR €${(r.finalPrice / 4400).toFixed(2)}</span></div>
        </div>
        <div class="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-5">
          <div class="bg-zinc-800 p-3 text-center"><span class="text-xs font-bold text-zinc-400 uppercase">Resumen de Producción</span></div>
          <div class="p-5 space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-zinc-400">⏱️ Tiempo Total</span><span class="font-mono text-white font-bold">${r.totalProductionTime.toFixed(1)}h</span></div>
            <div class="flex justify-between"><span class="text-zinc-400">⚡ Costo Energía</span><span class="font-mono text-white font-bold">${formatCurrency(r.breakdown.energy)}</span></div>
            <div class="flex justify-between"><span class="text-zinc-400">🔧 Desgaste Máquina</span><span class="font-mono text-white font-bold">${formatCurrency(r.breakdown.wear)}</span></div>
            <div class="flex justify-between"><span class="text-zinc-400">📦 Material Total</span><span class="font-mono text-white font-bold">${formatCurrency(r.breakdown.material)}</span></div>
          </div>
        </div>
        <div class="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div class="bg-zinc-800 p-3 text-center"><span class="text-xs font-bold text-zinc-400 uppercase">Estructura de Costos</span></div>
          <div class="p-5 space-y-4 text-sm">
            <div class="flex justify-between"><span class="text-zinc-400">💎 Costos Duros</span><span class="font-mono text-white font-bold">${formatCurrency(r.hardCosts)}</span></div>
            <div class="flex justify-between"><span class="text-zinc-400">👤 Mano de Obra</span><span class="font-mono text-white font-bold">${formatCurrency(r.softCosts)}</span></div>
            <div class="flex justify-between"><span class="text-zinc-400">📦 Logística</span><span class="font-mono text-white font-bold">${formatCurrency(r.logisticsCosts)}</span></div>
            <div class="h-px bg-zinc-800"></div>
            <div class="flex justify-between text-lg pt-2"><span class="text-cyan-400 font-bold">💰 Ganancia Neta</span><span class="font-mono text-cyan-400 font-black">${formatCurrency(r.netProfit)}</span></div>
          </div>
        </div>
        <div class="space-y-3 pt-4">
          <button onclick="showSaveModal()" class="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3">${Icons.Check(20)} Guardar Cotización</button>
          <button onclick="resetCalculator()" class="w-full bg-purple-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3">${Icons.ArrowLeft(20)} Nueva Cotización</button>
        </div>
      </div>
    `;
  }

  // --- NO INTERNAL HEADER - Use parent's universal header ---
  // Sync step info with parent on each render
  setTimeout(() => {
    const parent = window.parent;
    if (parent && parent !== window) {
      if (parent.updateStageTitle) parent.updateStageTitle(`Paso ${state.step}/6`);
      if (state.step > 1) {
        parent.stageBack = () => window.prevStep && window.prevStep();
      } else {
        parent.stageBack = () => navigateTo('home');
      }
    }
  }, 0);

  return `
    <div class="min-h-screen bg-transparent text-zinc-100 flex flex-col">
      <main class="flex-1 overflow-y-auto pb-32 pt-4" style="-webkit-overflow-scrolling: touch;">
        <div class="max-w-md mx-auto p-5">
          ${content}
        </div>
      </main>

      ${state.step < 6 ? `
        <div class="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div class="max-w-md mx-auto">
            <button onclick="nextStep()" class="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors clip-path-button shadow-lg">
              ${state.step === 5 ? 'CALCULAR RESULTADO' : 'SIGUIENTE PASO'}
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderCalculator() {
  document.getElementById('root').innerHTML = Calculator();
}
window.renderCalculatorWithScroll = () => {
  const s = document.querySelector('main')?.scrollTop || 0;
  renderCalculator();
  requestAnimationFrame(() => {
    const c = document.querySelector('main');
    if (c) c.scrollTop = s;
  });
};

// ============================================
// 3. PACKAGE CALCULATOR (FULL ORIGINAL LOGIC RESTORED)
// ============================================
function PackageCalculator() {
  const Icons = getIcons();
  if (!window.packageState) {
    window.packageState = {
      step: 1,
      quotes: [],
      selectedQuotes: {},
      variantOverrides: {},
      logistics: { shipping: 'local', packagingSize: 'large' },
      profitMargin: 15,
      manualPrice: null,
      results: null,
      loading: true
    };
    loadQuotesForPackage();
  }
  const state = window.packageState;
  if (state.loading) { return `<div class="min-h-screen bg-transparent text-zinc-100 flex items-center justify-center"><div class="text-center"><div class="loading mb-4 text-purple-500"></div><p class="text-zinc-400 font-mono text-xs">CARGANDO...</p></div></div>`; }

  return state.step === 1 ? renderPackageStep1(state) : renderPackageStep2(state);
}

function renderPackageStep1(state) {
  const Icons = window.Icons;
  const { formatCurrency } = window.Formatters;

  // Sync with parent header
  setTimeout(() => {
    const parent = window.parent;
    if (parent && parent !== window) {
      if (parent.updateStageTitle) parent.updateStageTitle('Paquete - Selección');
      parent.stageBack = () => navigateTo('home');
    }
  }, 0);

  return `
    <div class="min-h-screen bg-transparent text-zinc-100 flex flex-col">
      <main class="flex-1 overflow-y-auto pb-32 p-5 pt-2">
        <div class="max-w-md mx-auto">
          <p class="text-sm text-zinc-400 mb-4">Selecciona las cotizaciones que quieres incluir en el paquete:</p>
          ${state.quotes.length === 0 ? `<div class="text-center py-20"><div class="text-6xl mb-4 grayscale opacity-50">📦</div><h2 class="text-lg font-bold text-white mb-2">No hay cotizaciones</h2><p class="text-xs text-zinc-500 mb-6 font-mono">Crea algunas cotizaciones primero</p><button onclick="navigateTo('calculator')" class="bg-purple-600 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest clip-path-button">Crear Cotización</button></div>` : `<div class="space-y-3">${state.quotes.map(quote => {
    const qty = state.selectedQuotes[quote.id] || 0;
    const isSelected = qty > 0;
    const displayOrder = quote.products?.display_order;
    const productName = quote.products?.name;
    return `
              <div class="bg-zinc-900/70 border p-4 transition-all relative overflow-hidden ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 hover:border-zinc-700'}" 
                   style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);">
                ${displayOrder != null ? `<div class="absolute left-0 top-0 bg-purple-500/20 text-purple-400 text-[9px] px-2 py-0.5 font-mono">#${displayOrder}</div>` : ''}
                <div class="flex items-start gap-3">
                  <div onclick="toggleQuoteSelection('${quote.id}')" class="flex items-center justify-center w-6 h-6 border ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'} transition-colors mt-1 cursor-pointer shrink-0">
                    ${isSelected ? `<span class="text-white text-xs">✓</span>` : ''}
                  </div>
                  <div class="flex-1 min-w-0 cursor-pointer" onclick="toggleQuoteSelection('${quote.id}')">
                    <h3 class="font-bold text-white truncate text-sm">${quote.quote_name}</h3>
                    ${productName ? `<p class="text-[10px] text-zinc-400 truncate">${productName}</p>` : ''}
                    ${quote.client_name ? `<p class="text-[10px] text-zinc-500 font-mono">Cliente: ${quote.client_name}</p>` : ''}
                    <p class="text-lg font-bold text-purple-400 mt-1">$${formatCurrency(quote.results.finalPrice)}</p>
                  </div>
                  ${isSelected ? `
                  <div class="flex items-center gap-2 shrink-0 mt-1" onclick="event.stopPropagation()">
                    <button onclick="changeQuoteQty('${quote.id}', -1)" class="w-8 h-8 flex items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-purple-500 hover:text-white transition text-lg font-bold">−</button>
                    <span class="text-lg font-black text-purple-400 w-8 text-center font-mono">${qty}</span>
                    <button onclick="changeQuoteQty('${quote.id}', 1)" class="w-8 h-8 flex items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-purple-500 hover:text-white transition text-lg font-bold">+</button>
                  </div>
                  ` : ''}
                </div>
                ${(() => {
                  // Mostrar selector de variante por UNIDAD si tiene colores con price_adjustment
                  const colors = quote.products?.product_colors || [];
                  const hasVariants = isSelected && colors.length > 0 && colors.some(c => c.price_adjustment > 0);
                  if (!hasVariants) return '';
                  const unitOverrides = state.variantOverrides[quote.id] || [];
                  const dropdowns = Array.from({ length: qty }, (_, idx) => {
                    const currentOverride = unitOverrides[idx] || null;
                    return `
                      <div class="flex items-center gap-2">
                        ${qty > 1 ? `<span class="text-[9px] text-zinc-500 font-mono w-6 shrink-0">#${idx + 1}</span>` : ''}
                        <select onchange="setQuoteVariant('${quote.id}', ${idx}, this.value)" class="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-white text-xs focus:border-cyan-500 outline-none">
                          <option value="" ${!currentOverride ? 'selected' : ''}>Base — $${formatCurrency(quote.products.sale_price)}</option>
                          ${colors.filter(c => c.price_adjustment > 0).map(c => `
                            <option value="${c.id}" ${currentOverride?.colorId == c.id ? 'selected' : ''}>${c.color_name} — $${formatCurrency(quote.products.sale_price + c.price_adjustment)} (+${formatCurrency(c.price_adjustment)})</option>
                          `).join('')}
                        </select>
                      </div>`;
                  }).join('');
                  return `
                  <div class="mt-2 pt-2 border-t border-zinc-800/50" onclick="event.stopPropagation()">
                    <label class="block text-[9px] text-cyan-400 font-mono uppercase tracking-widest mb-1">🎨 Variante${qty > 1 ? 's por Unidad' : ' de Color'}</label>
                    <div class="space-y-1">${dropdowns}</div>
                  </div>`;
                })()}
              </div>`;
  }).join('')}</div>`}
        </div>
      </main>
      ${getTotalSelectedQty() > 0 ? `<div class="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black via-black/90 to-transparent"><div class="max-w-md mx-auto"><button onclick="goToPackageStep2()" class="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 text-white font-bold uppercase tracking-widest hover:bg-purple-500 transition-colors clip-path-button shadow-lg shadow-purple-900/20">Continuar (${getTotalSelectedQty()} productos)</button></div></div>` : ''}
    </div>
  `;
}

function renderPackageStep2(state) {
  const Icons = window.Icons;
  const { formatCurrency } = window.Formatters;
  const { SHIPPING_OPTIONS, PACKAGING } = window.SICMA_CONSTANTS;

  const selectedQuoteObjects = expandSelectedQuotes(state);
  if (!state.n1Results) { state.n1Results = window.Calculations.calculatePackageN1(selectedQuoteObjects, state.logistics); }
  const n1 = state.n1Results;
  if (!state.results) calculatePackageResults();
  const r = state.results;

  const mainPrice = state.manualPrice || n1.decisionMatrix[0].clientPrice;
  const individualTotal = n1.individualTotal;
  const savings = individualTotal - mainPrice;
  const savingsPercent = individualTotal > 0 ? (savings / individualTotal * 100).toFixed(1) : 0;

  // Sync with parent header
  setTimeout(() => {
    const parent = window.parent;
    if (parent && parent !== window) {
      if (parent.updateStageTitle) parent.updateStageTitle('Matriz Estratégica');
      parent.stageBack = () => window.backToPackageStep1 && window.backToPackageStep1();
    }
  }, 0);

  return `
    <div class="min-h-screen bg-transparent text-zinc-100 flex flex-col">
      <main class="flex-1 overflow-y-auto pb-32 p-5 pt-2">
        <div class="max-w-md mx-auto space-y-5">
          
          <div class="text-center bg-zinc-900 border border-zinc-800 p-8 cyber-shape">
            <p class="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-2">Precio Base (Lógica N-1)</p>
            <h1 class="text-5xl font-black text-white mb-3 tracking-tighter">${formatCurrency(mainPrice)}</h1>
            <div class="flex justify-center gap-2 text-[10px] font-mono text-zinc-500">
              <span>Individual: ${formatCurrency(individualTotal)}</span>
              <span class="text-zinc-700">|</span>
              <span class="text-green-400">Ahorro: ${formatCurrency(savings)} (${savingsPercent}%)</span>
            </div>
            <div class="mt-4 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 p-2 font-mono">
              💡 N-1: Solo 1 envío cobrado. ${n1.productCount - 1} envíos descontados.
            </div>
          </div>
          
          <div class="bg-zinc-900/50 border border-zinc-800 p-5">
            <h3 class="text-xs font-bold text-zinc-400 uppercase mb-3">📦 Productos en Paquete (${n1.productCount})</h3>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              ${n1.quotesBreakdown.map(q => `
                <div class="p-2 border-b border-zinc-800/50 ${q.isMaster ? 'bg-purple-500/5' : ''}">
                  <div class="flex justify-between items-center text-xs">
                    <div class="truncate flex-1">
                      <span class="font-bold ${q.isMaster ? 'text-purple-400' : 'text-zinc-300'} uppercase">
                        ${q.isMaster ? '👑 ' : ''}${q.productName || q.name}
                      </span>
                      ${q.variantName ? `<span class="text-[9px] text-cyan-400 ml-1">(${q.variantName})</span>` : ''}
                    </div>
                    <span class="font-mono font-bold ${q.isMaster ? 'text-purple-400' : 'text-white'} shrink-0">
                      ${formatCurrency(q.contributedPrice)}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div class="bg-zinc-800 p-3 text-center border-b border-zinc-700">
              <h3 class="text-xs font-bold text-white uppercase tracking-widest">📊 Matriz de Decisión</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs font-mono">
                <thead>
                  <tr class="text-zinc-500 border-b border-zinc-800">
                    <th class="p-3 text-left">ESCENARIO</th>
                    <th class="p-3 text-right">PRECIO</th>
                    <th class="p-3 text-right">DESC.</th>
                    <th class="p-3 text-right">GANANCIA</th>
                  </tr>
                </thead>
                <tbody>
                  ${n1.decisionMatrix.map(row => `
                    <tr class="border-b border-zinc-800/50 ${row.isRecommended ? 'bg-green-500/5' : ''}">
                      <td class="p-3 text-left">
                        <span class="font-bold text-zinc-300">${row.label}</span>
                        ${row.isRecommended ? '<span class="ml-1 text-[10px] text-green-500">★</span>' : ''}
                      </td>
                      <td class="p-3 text-right font-bold text-white">${formatCurrency(row.clientPrice)}</td>
                      <td class="p-3 text-right text-red-400">${row.discount > 0 ? `-${row.margin}%` : '-'}</td>
                      <td class="p-3 text-right font-bold text-${row.marginColor}-400">${formatCurrency(row.netProfit)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="bg-zinc-900/50 border border-zinc-800 p-5">
            <h3 class="text-xs font-bold text-zinc-400 uppercase mb-3">🚚 Logística Unificada</h3>
            <label class="block text-[10px] font-mono text-zinc-500 mb-2 uppercase">Envío (1 solo cobro)</label>
            <select value="${state.logistics.shipping}" onchange="updatePackageLogisticsN1('shipping', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono text-xs uppercase outline-none mb-4">
              ${SHIPPING_OPTIONS.map(s => `<option value="${s.id}" ${state.logistics.shipping === s.id ? 'selected' : ''}>${s.name} - ${s.cost === 0 ? 'GRATIS' : formatCurrency(s.cost)}</option>`).join('')}
            </select>
            <label class="block text-[10px] font-mono text-zinc-500 mb-2 uppercase">Empaque (x${n1.productCount})</label>
            <select value="${state.logistics.packagingSize}" onchange="updatePackageLogisticsN1('packagingSize', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono text-xs uppercase outline-none">
              ${PACKAGING.map(p => `<option value="${p.id}" ${state.logistics.packagingSize === p.id ? 'selected' : ''}>${p.name}${p.cost > 0 ? ' - ' + formatCurrency(p.cost) : ''}</option>`).join('')}
              <option value="deluxe" ${state.logistics.packagingSize === 'deluxe' ? 'selected' : ''}>🎁 DELUXE (PERSONALIZADO)</option>
            </select>
            ${state.logistics.packagingSize === 'deluxe' ? `
              <div class="mt-3">
                <label class="block text-[10px] text-purple-400 mb-1 font-mono uppercase">Costo Deluxe (Unitario)</label>
                <input type="number" value="${state.logistics.deluxePackagingCost || ''}" onchange="updateDeluxePackagingCost(this.value)" placeholder="0" class="w-full bg-zinc-950 border border-zinc-700 p-2 text-white font-mono text-xs" />
              </div>
            ` : ''}
          </div>
          
          <div class="bg-zinc-900 border border-zinc-800 p-5">
            <h3 class="text-xs font-bold text-white mb-3 uppercase flex items-center gap-2">${Icons.Edit(14)} Precio Manual</h3>
            <input type="text" inputmode="decimal" value="${state.manualPrice || ''}" oninput="debouncedManualPackagePrice(this.value)" onblur="handleManualPackagePriceBlur(this.value)" placeholder="Sobreescribir precio..." class="w-full bg-zinc-950 border border-zinc-700 p-3 text-lg font-bold text-purple-400 focus:outline-none focus:border-purple-500" />
            ${state.manualPrice ? `<div class="mt-2 text-[10px] text-zinc-500 font-mono text-right">Ganancia Real: <span class="text-white">${formatCurrency(state.manualPrice - n1.productionCosts - n1.realLogisticsCost)}</span></div>` : ''}
          </div>
          
        </div>
      </main>
      
      <div class="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div class="max-w-md mx-auto">
          <button onclick="savePackageToDatabase()" class="w-full py-4 bg-purple-600 text-white font-bold uppercase tracking-widest hover:bg-purple-500 transition-colors clip-path-button shadow-lg">
            💾 GUARDAR PAQUETE
          </button>
        </div>
      </div>
    </div>
  `;
}

// HELPERS DE PAQUETE (RESTAURADOS)
window.loadQuotesForPackage = async () => { try { const quotes = await window.Storage.getQuotes(100, 0); window.packageState.quotes = quotes; window.packageState.loading = false; renderPackage(); } catch (error) { window.packageState.loading = false; renderPackage(); } };

// Toggle: primer click agrega con qty=1 (variante Base por defecto), segundo click quita
window.toggleQuoteSelection = (quoteId) => {
  const state = window.packageState;
  if (state.selectedQuotes[quoteId]) {
    delete state.selectedQuotes[quoteId];
    delete state.variantOverrides[quoteId];
  } else {
    state.selectedQuotes[quoteId] = 1;
    state.variantOverrides[quoteId] = [null]; // 1 unidad, variante Base
  }
  state.n1Results = null; state.results = null; renderPackage();
};

// Cambiar cantidad: ajusta el array de overrides (agrega null=Base al final, o recorta)
window.changeQuoteQty = (quoteId, delta) => {
  const state = window.packageState;
  const current = state.selectedQuotes[quoteId] || 0;
  const newQty = current + delta;
  if (newQty <= 0) {
    delete state.selectedQuotes[quoteId];
    delete state.variantOverrides[quoteId];
  } else {
    state.selectedQuotes[quoteId] = newQty;
    const overrides = state.variantOverrides[quoteId] || [];
    if (newQty > overrides.length) {
      // Agregar nuevas unidades con variante Base (null)
      while (overrides.length < newQty) overrides.push(null);
    } else {
      // Recortar desde el final
      overrides.length = newQty;
    }
    state.variantOverrides[quoteId] = overrides;
  }
  state.n1Results = null; state.results = null; renderPackage();
};

// Seleccionar variante de color para una UNIDAD específica
window.setQuoteVariant = (quoteId, unitIndex, colorId) => {
  const state = window.packageState;
  if (!state.variantOverrides[quoteId]) state.variantOverrides[quoteId] = [];
  if (!colorId) {
    state.variantOverrides[quoteId][unitIndex] = null; // Base
  } else {
    const quote = state.quotes.find(q => q.id === quoteId);
    const color = quote?.products?.product_colors?.find(c => c.id == colorId);
    if (color) {
      state.variantOverrides[quoteId][unitIndex] = {
        colorId: color.id,
        colorName: color.color_name,
        priceAdjustment: color.price_adjustment
      };
    }
  }
  state.n1Results = null; state.results = null; renderPackage();
};

// Obtener total de productos seleccionados (sumando cantidades)
window.getTotalSelectedQty = () => { const sq = window.packageState?.selectedQuotes || {}; return Object.values(sq).reduce((sum, qty) => sum + qty, 0); };

// Expandir mapa {id: qty} en array de objetos quote repetidos, con variant override POR UNIDAD
window.expandSelectedQuotes = (state) => {
  const expanded = [];
  Object.entries(state.selectedQuotes).forEach(([id, qty]) => {
    const quote = state.quotes.find(q => q.id === id);
    if (quote) {
      const overrides = state.variantOverrides?.[id] || [];
      for (let i = 0; i < qty; i++) {
        const clone = { ...quote };
        if (overrides[i]) { clone._variantOverride = overrides[i]; }
        expanded.push(clone);
      }
    }
  });
  return expanded;
};

window.goToPackageStep2 = () => { window.packageState.step = 2; window.packageState.results = null; window.packageState.n1Results = null; renderPackage(); };
window.backToPackageStep1 = () => { window.packageState.step = 1; window.packageState.n1Results = null; window.packageState.results = null; renderPackage(); };
window.calculatePackageResults = () => { const state = window.packageState; const selectedQuoteObjects = expandSelectedQuotes(state); const results = window.Calculations.calculatePackage(selectedQuoteObjects.map(q => ({ quote: q })), state.logistics, state.profitMargin); state.results = results; };
window.updatePackageLogisticsN1 = (key, value) => { window.packageState.logistics[key] = value; window.packageState.results = null; window.packageState.n1Results = null; renderPackage(); };
window.updateDeluxePackagingCost = (value) => { window.packageState.logistics.deluxePackagingCost = value ? parseFloat(value) : 0; window.packageState.results = null; window.packageState.n1Results = null; renderPackage(); };
window.updateManualPackagePrice = (value) => { window.packageState.manualPrice = value ? parseFloat(value) : null; renderPackage(); };

let packagePriceTimer = null;
window.debouncedManualPackagePrice = (value) => { window.packageState.manualPrice = value ? parseFloat(value) : null; if (packagePriceTimer) clearTimeout(packagePriceTimer); packagePriceTimer = setTimeout(() => { renderPackage(); }, 800); };
window.handleManualPackagePriceBlur = (value) => { if (packagePriceTimer) clearTimeout(packagePriceTimer); window.packageState.manualPrice = value ? parseFloat(value) : null; renderPackage(); };
window.renderPackage = () => { document.getElementById('root').innerHTML = PackageCalculator(); };

window.savePackageToDatabase = async () => {
  const state = window.packageState;
  const r = state.n1Results || state.results;
  if (!r) return showNotification("Error en cálculo matemático", "error");

  const selectedQuoteObjects = expandSelectedQuotes(state);
  const invalidQuotes = selectedQuoteObjects.filter(q => !q.product_id);

  if (invalidQuotes.length > 0) {
    return showNotification("⚠️ Imposible crear Bundle: Hay cotizaciones que no están vinculadas a un Producto del E-commerce.", "error", 5000);
  }

  // 1. Extraemos todo el árbol de categorías
  const categories = await window.Storage.getCategories();
  window.allCategories = categories;

  const parentCategories = categories.filter(c => !c.parent_id);
  const parentOptions = parentCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  const compositionMap = {};
  selectedQuoteObjects.forEach(q => {
    const pid = q.product_id;
    const pName = q.products?.name || q.quote_name;
    if (compositionMap[pid]) {
      compositionMap[pid].quantity += 1;
    } else {
      compositionMap[pid] = { product_id: pid, name: pName, quantity: 1 };
    }
  });
  const items_composition = Object.values(compositionMap);

  const suggestedPrice = state.manualPrice || r.decisionMatrix[0].clientPrice;
  const basePrice = r.productionCosts + r.realLogisticsCost;

  const modal = document.createElement('div');
  modal.id = 'bundleForgeModal';
  modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in';
  modal.innerHTML = `
    <div class="bg-zinc-900 border border-purple-500 max-w-md w-full shadow-2xl shadow-purple-900/20 flex flex-col max-h-[90vh]" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%);">
      <div class="p-5 border-b border-zinc-800 flex justify-between items-center bg-purple-500/5 shrink-0">
        <h2 class="text-xl font-black text-purple-400 uppercase italic">📦 Forjar Bundle</h2>
        <button onclick="document.getElementById('bundleForgeModal').remove()" class="text-zinc-500 hover:text-white transition">✕</button>
      </div>
      
      <div class="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
        <div>
          <label class="block text-[10px] text-zinc-500 font-mono mb-1 uppercase tracking-widest">Nombre del Bundle</label>
          <input type="text" id="bundleName" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-bold focus:border-purple-500 outline-none" placeholder="Ej: Pack Pokeballs">
        </div>
        
        <div class="grid grid-cols-2 gap-3 bg-black/30 p-3 border border-zinc-800">
          <div>
            <label class="block text-[9px] text-purple-400 font-mono mb-1 uppercase tracking-widest">1. Categoría</label>
            <select id="bundleCategory" onchange="window.updateSubcategories(this)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-white text-xs focus:border-purple-500 outline-none">
              <option value="">-- Elige --</option>
              ${parentOptions}
            </select>
          </div>
          <div>
            <label class="block text-[9px] text-cyan-400 font-mono mb-1 uppercase tracking-widest">2. Subcategoría</label>
            <select id="bundleSubcategory" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-white text-xs focus:border-cyan-500 outline-none disabled:opacity-50" disabled>
              <option value="">-- N/A --</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-[10px] text-zinc-500 font-mono mb-1 uppercase tracking-widest">Leyenda (Tagline)</label>
          <input type="text" id="bundleLegend" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-purple-200 focus:border-purple-500 outline-none" placeholder="Ej: El comienzo de tu leyenda">
        </div>

        <div>
          <label class="block text-[10px] text-zinc-500 font-mono mb-1 uppercase tracking-widest">Descripción</label>
          <textarea id="bundleDesc" rows="2" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-300 focus:border-purple-500 outline-none" placeholder="Contiene las piezas más raras..."></textarea>
        </div>
        
        <div class="p-3 bg-black/50 border border-zinc-800">
          <label class="block text-[9px] text-cyan-500 uppercase tracking-widest font-bold mb-2">Imagen Principal (URL Drive)</label>
          <input type="text" id="bundleFront" class="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-xs focus:border-cyan-500 outline-none" placeholder="https://rutaimagen.com/carta.jpg">
        </div>
        
        <div class="grid grid-cols-2 gap-3 mt-2">
          <div class="bg-zinc-950 p-3 border border-zinc-800 flex flex-col justify-center">
             <p class="text-[9px] text-zinc-500 uppercase tracking-widest">Costo Base</p>
             <p class="text-white font-mono text-lg">$${window.Formatters.formatCurrency(basePrice)}</p>
          </div>
          <div class="bg-purple-900/20 p-3 border border-purple-500/50">
             <p class="text-[9px] text-purple-400 uppercase tracking-widest mb-1">Precio Venta</p>
             <input type="number" id="bundleSalePrice" value="${suggestedPrice}" class="w-full bg-transparent text-white font-black font-mono text-xl outline-none border-b border-purple-500/50 focus:border-purple-400">
          </div>
        </div>
      </div>
      
      <div class="p-4 flex gap-3 bg-zinc-900 shrink-0">
        <button onclick="document.getElementById('bundleForgeModal').remove()" class="flex-1 py-4 bg-zinc-950 text-zinc-500 font-bold uppercase text-xs tracking-widest hover:text-white transition border border-zinc-800">Cancelar</button>
        <button onclick="executeBundleForge(${basePrice})" class="flex-1 py-4 bg-gradient-to-r from-purple-700 to-purple-500 text-white font-black uppercase text-xs tracking-widest hover:from-purple-600 hover:to-purple-400 transition shadow-lg shadow-purple-900/50">FORJAR BUNDLE</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  window.updateSubcategories = (selectElement) => {
    const parentId = selectElement.value;
    const subSelect = document.getElementById('bundleSubcategory');
    subSelect.innerHTML = '<option value="">-- N/A --</option>';

    if (!parentId) {
      subSelect.disabled = true;
      return;
    }

    const children = window.allCategories.filter(c => c.parent_id == parentId);
    if (children.length > 0) {
      subSelect.disabled = false;
      children.forEach(c => {
        subSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    } else {
      subSelect.disabled = true;
    }
  };

  window.executeBundleForge = async (base) => {
    const name = document.getElementById('bundleName').value;
    const parentId = document.getElementById('bundleCategory').value;
    const subId = document.getElementById('bundleSubcategory').value;
    const salePrice = document.getElementById('bundleSalePrice').value;
    const frontUrl = document.getElementById('bundleFront').value;

    if (!name || !parentId || !salePrice || !frontUrl) {
      return showNotification("Nombre, Categoría, Precio e Imagen son obligatorios.", "warning");
    }

    const finalCategoryId = subId ? parseInt(subId) : parseInt(parentId);

    const clean_composition = items_composition.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }));

    const payload = {
      p_name: name,
      p_legend: document.getElementById('bundleLegend').value,
      p_description: document.getElementById('bundleDesc').value, // <--- CABLE RESTAURADO
      p_base_price: base,
      p_sale_price: parseFloat(salePrice),
      p_card_front_url: frontUrl,
      p_items_composition: clean_composition,
      p_category_id: finalCategoryId
    };

    try {
      const btn = event.target;
      btn.innerText = "FORJANDO...";
      btn.disabled = true;

      await window.Storage.saveBundleToCore(payload);

      document.getElementById('bundleForgeModal').remove();
      showNotification("¡Bundle Inyectado en su Sección Exitosamente!", "success", 3000);
      delete window.packageState;
      navigateTo('home');
    } catch (e) {
      document.getElementById('bundleForgeModal').remove();
      showNotification("Fallo crítico en inyección: " + e.message, "error", 5000);
    }
  }
};

// ============================================
// 4. HISTORY & DETAILS (LOGIC RESTORED)
// ============================================
function History() {
  const Icons = getIcons();
  const { formatCurrency, formatDateShort } = getFormatters();
  if (!window.historyState) { window.historyState = { quotes: [], packages: [], loading: true, searchTerm: '', filter: 'all', page: 0, pageSize: 50, hasMore: true, loadingMore: false, searchResults: null }; loadHistoryData(); }
  const state = window.historyState;

  // Sync with parent header
  setTimeout(() => {
    const parent = window.parent;
    if (parent && parent !== window) {
      if (parent.updateStageTitle) parent.updateStageTitle('Historial');
      parent.stageBack = () => navigateTo('home');
    }
  }, 0);

  return `
    <div class="min-h-screen bg-transparent text-zinc-100 flex flex-col">
      <main class="flex-1 overflow-y-auto p-5 pt-2">
        <div class="max-w-md mx-auto space-y-3">
          <!-- Search -->
          <div class="relative mb-2">
            <input type="text" value="${state.searchTerm}" oninput="updateHistorySearch(this.value)" placeholder="Buscar por nombre, cliente..." class="w-full bg-zinc-900 border border-zinc-800 p-3 pl-10 text-white font-mono text-sm focus:border-cyan-500 outline-none" />
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">${Icons.Search(18)}</div>
          </div>
          
          <!-- Filter Tabs -->
          <div class="flex gap-2 mb-4">
            <button onclick="updateHistoryFilter('all')" class="flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${state.filter === 'all' ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}" style="clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);">Todos</button>
            <button onclick="updateHistoryFilter('quotes')" class="flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${state.filter === 'quotes' ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}" style="clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);">Cotizaciones</button>
            <button onclick="updateHistoryFilter('packages')" class="flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${state.filter === 'packages' ? 'bg-purple-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}" style="clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);">Paquetes</button>
          </div>
          
          ${state.loading ? `<div class="text-center py-10 font-mono text-xs text-zinc-500 animate-pulse">CARGANDO...</div>` : renderHistoryItems(state)}
          ${!state.loading && state.hasMore && !state.searchTerm ? `
            <button onclick="loadMoreHistory()" class="w-full py-3 mt-4 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:border-cyan-500 hover:text-cyan-400 transition-colors" ${state.loadingMore ? 'disabled' : ''}>
              ${state.loadingMore ? 'CARGANDO...' : 'CARGAR MÁS'}
            </button>
          ` : ''}
        </div>
      </main>
    </div>
  `;
}

function renderHistoryItems(state) {
  const { formatCurrency, formatDateShort } = window.Formatters;
  const Icons = window.Icons;
  let items = [];

  if (state.filter === 'all' || state.filter === 'quotes') { items = items.concat(state.quotes.map(q => ({ ...q, type: 'quote' }))); }
  if (state.filter === 'all' || state.filter === 'packages') {
    const validPackages = state.packages.filter(p => {
      if (!p.package_name || p.package_name === 'undefined') return false;
      if (!p.final_price || p.final_price <= 0) return false;
      return true;
    });
    items = items.concat(validPackages.map(p => ({ ...p, type: 'package' })));
  }

  // Filtro local instantáneo mientras escribes
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    items = items.filter(item =>
      (item.quote_name || item.package_name || '').toLowerCase().includes(term) ||
      (item.client_name || '').toLowerCase().includes(term) ||
      (item.products?.name || '').toLowerCase().includes(term)
    );
  }

  // Sort by products.display_order (nulls last), then by created_at
  items.sort((a, b) => {
    const orderA = a.products?.display_order ?? 9999;
    const orderB = b.products?.display_order ?? 9999;
    if (orderA !== orderB) return orderA - orderB;
    if (orderA < 9999) return new Date(b.created_at) - new Date(a.created_at);
    return new Date(a.created_at) - new Date(b.created_at);
  });

  if (items.length === 0) return `<div class="text-center py-16"><div class="text-5xl mb-4 grayscale opacity-40">📭</div><p class="text-zinc-500 text-sm">${state.searchTerm ? 'Sin resultados para "' + state.searchTerm + '"' : 'No hay registros'}</p></div>`;

  return items.map(item => {
    const isQuote = item.type === 'quote';
    const name = isQuote ? item.quote_name : item.package_name;
    const price = isQuote ? item.results.finalPrice : item.final_price;
    const productName = item.products?.name || null;
    const displayOrder = item.products?.display_order;

    return `
      <div onclick="viewHistoryItem('${item.id}', '${item.type}')" 
           class="bg-zinc-900/70 border border-zinc-800 hover:border-${isQuote ? 'cyan' : 'purple'}-500/50 p-4 cursor-pointer transition-all group relative overflow-hidden hover:bg-zinc-900" 
           style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);">
        ${!isQuote ? '<div class="absolute right-0 top-0 bg-purple-500 text-black text-[9px] px-2 py-0.5 font-black uppercase">PACK</div>' : ''}
        ${displayOrder != null ? `<div class="absolute left-0 top-0 bg-cyan-500/20 text-cyan-400 text-[9px] px-2 py-0.5 font-mono">#${displayOrder}</div>` : ''}
        <div class="flex justify-between items-center gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-white text-sm truncate group-hover:text-${isQuote ? 'cyan' : 'purple'}-400 transition-colors">${name}</h3>
            ${productName ? `<p class="text-[10px] text-zinc-400 truncate">${productName}</p>` : ''}
            <p class="text-[10px] text-zinc-600 font-mono mt-1">${formatDateShort(item.created_at)}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="font-mono ${!isQuote ? 'text-purple-400' : 'text-cyan-400'} font-bold text-base">$${formatCurrency(price)}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

window.loadHistoryData = async () => {
  try {
    const pageSize = window.historyState.pageSize || 50;
    // Cargar TODAS las vinculadas (con product_id) + primera página de no vinculadas
    const [linked, unlinked, p] = await Promise.all([
      window.Storage.getQuotes(500, 0, 'linked'),
      window.Storage.getQuotes(pageSize, 0, 'unlinked'),
      window.Storage.getPackages(pageSize, 0)
    ]);
    window.historyState.linkedQuotes = linked;
    window.historyState.quotes = linked.concat(unlinked);
    window.historyState.packages = p;
    window.historyState.page = 0;
    window.historyState.hasMore = unlinked.length >= pageSize;
    window.historyState.loading = false;
    renderHistory();
  } catch (error) {
    window.historyState.loading = false;
    renderHistory();
  }
};

window.loadMoreHistory = async () => {
  const state = window.historyState;
  if (state.loadingMore || !state.hasMore) return;
  state.loadingMore = true;
  renderHistory();
  try {
    const pageSize = state.pageSize || 50;
    const nextPage = (state.page || 0) + 1;
    const offset = nextPage * pageSize;
    // Solo paginar las no vinculadas (las vinculadas ya están todas cargadas)
    const [q, p] = await Promise.all([
      window.Storage.getQuotes(pageSize, offset, 'unlinked'),
      window.Storage.getPackages(pageSize, offset)
    ]);
    // Agregar solo las no vinculadas nuevas (las linked ya están)
    state.quotes = (state.linkedQuotes || []).concat(
      state.quotes.filter(x => !x.product_id),
      q
    );
    state.packages = state.packages.concat(p);
    state.page = nextPage;
    state.hasMore = q.length >= pageSize || p.length >= pageSize;
    state.loadingMore = false;
    renderHistory();
  } catch (error) {
    state.loadingMore = false;
    renderHistory();
  }
};

window.updateHistoryFilter = (filter) => { window.historyState.filter = filter; renderHistory(); };

let historySearchTimer = null;
window.updateHistorySearch = (term) => {
  window.historyState.searchTerm = term;

  // Filtro local instantáneo
  updateHistoryListDOM();

  // Cancelar búsqueda anterior del servidor
  if (historySearchTimer) clearTimeout(historySearchTimer);

  if (!term || term.length < 2) return;

  // Después de 400ms, buscar en TODA la base de datos
  historySearchTimer = setTimeout(async () => {
    try {
      const serverResults = await window.Storage.searchQuotes(term);
      if (window.historyState.searchTerm !== term) return; // usuario ya cambió el texto

      // Merge: agregar quotes del server que no estén ya cargadas
      const existingIds = new Set(window.historyState.quotes.map(q => q.id));
      const newQuotes = serverResults.filter(q => !existingIds.has(q.id));
      if (newQuotes.length > 0) {
        window.historyState.quotes = window.historyState.quotes.concat(newQuotes);
        updateHistoryListDOM(); // re-filtrar con los nuevos datos
      }
    } catch (e) {
      // Silencioso — el filtro local ya está funcionando
    }
  }, 400);
};

function updateHistoryListDOM() {
  const listContainer = document.querySelector('main .max-w-md.space-y-3');
  if (!listContainer) return renderHistory();
  const filterButtons = listContainer.querySelector('.flex.gap-2.mb-4');
  if (!filterButtons) return renderHistory();

  const itemsHtml = renderHistoryItems(window.historyState);
  let sibling = filterButtons.nextElementSibling;
  while (sibling) {
    const next = sibling.nextElementSibling;
    sibling.remove();
    sibling = next;
  }
  filterButtons.insertAdjacentHTML('afterend', itemsHtml);
}
window.renderHistory = () => { document.getElementById('root').innerHTML = History(); };

// VER DETALLE - Modal con opciones (como el original)
window.viewHistoryItem = (id, type) => {
  const Icons = window.Icons;
  const { formatCurrency, formatHours, formatDateShort } = window.Formatters;

  if (type === 'quote') {
    const quote = window.historyState.quotes.find(q => q.id === id);
    if (!quote) return;

    const r = quote.results;
    const modal = document.createElement('div');
    modal.id = 'detailModal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-zinc-900 border border-zinc-700 max-w-md w-full overflow-hidden" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%);">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-zinc-800">
          <div class="flex-1">
            <h2 class="text-lg font-bold text-white uppercase">${quote.quote_name}</h2>
            ${quote.client_name ? `<p class="text-xs text-zinc-500 font-mono">Cliente: ${quote.client_name}</p>` : ''}
          </div>
          <button onclick="closeDetailModal()" class="text-zinc-400 hover:text-white transition">${Icons.X(24)}</button>
        </div>
        
        <!-- Content -->
        <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <!-- Precio Principal -->
          <div class="text-center bg-zinc-800/50 border border-zinc-700 p-6">
            <p class="text-zinc-500 text-xs uppercase mb-1">Precio Final</p>
            <p class="text-4xl font-black text-cyan-400">$${formatCurrency(r.finalPrice)}</p>
          </div>
          
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-zinc-800/50 border border-zinc-700 p-3">
              <p class="text-[10px] text-zinc-500 uppercase">Tiempo Total</p>
              <p class="text-sm font-bold text-white">${formatHours(r.totalProductionTime || 0)}</p>
            </div>
            <div class="bg-zinc-800/50 border border-zinc-700 p-3">
              <p class="text-[10px] text-zinc-500 uppercase">Ganancia Neta</p>
              <p class="text-sm font-bold text-green-400">$${formatCurrency(r.netProfit || 0)}</p>
            </div>
          </div>
          
          <!-- Breakdown -->
          <div class="bg-zinc-800/30 border border-zinc-700 p-3 space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-zinc-500">Costos Duros</span><span class="text-white font-mono">$${formatCurrency(r.hardCosts || 0)}</span></div>
            <div class="flex justify-between"><span class="text-zinc-500">Mano de Obra</span><span class="text-white font-mono">$${formatCurrency(r.softCosts || 0)}</span></div>
            <div class="flex justify-between"><span class="text-zinc-500">Logística</span><span class="text-white font-mono">$${formatCurrency(r.logisticsCosts || 0)}</span></div>
          </div>
          
          ${quote.notes ? `<div class="bg-zinc-800/30 border border-zinc-700 p-3"><p class="text-[10px] text-zinc-500 uppercase mb-1">Notas</p><p class="text-xs text-zinc-300">${quote.notes}</p></div>` : ''}
          
          ${quote.is_free_shipping ? '<div class="bg-green-500/10 border border-green-500/30 p-3 text-center"><span class="text-xs font-bold text-green-400 uppercase tracking-widest">🚚 ENVÍO GRATIS</span></div>' : ''}
          
          <p class="text-[10px] text-zinc-600 text-center font-mono">Creado: ${formatDateShort(quote.created_at)}</p>
        </div>
        
        <!-- Actions -->
        <div class="p-4 border-t border-zinc-800 flex gap-3">
          <button onclick="editQuoteFromHistory('${quote.id}')" class="flex-1 py-3 bg-cyan-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2">${Icons.Edit(16)} Editar</button>
          <button onclick="deleteQuoteFromHistory('${quote.id}')" class="py-3 px-4 bg-zinc-800 border border-red-500/30 text-red-400 font-bold uppercase text-xs tracking-widest hover:bg-red-500/20 transition-colors">${Icons.Trash2(16)}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) closeDetailModal(); };
  } else {
    // Paquete
    const pkg = window.historyState.packages.find(p => p.id === id);
    if (!pkg) return;

    const modal = document.createElement('div');
    modal.id = 'detailModal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-zinc-900 border border-purple-500/30 max-w-md w-full overflow-hidden" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%);">
        <div class="flex items-center justify-between p-4 border-b border-zinc-800">
          <div class="flex-1">
            <h2 class="text-lg font-bold text-purple-400 uppercase">${pkg.package_name}</h2>
            <p class="text-xs text-zinc-500 font-mono">${pkg.quote_ids?.length || 0} productos</p>
          </div>
          <button onclick="closeDetailModal()" class="text-zinc-400 hover:text-white transition">${Icons.X(24)}</button>
        </div>
        <div class="p-4 space-y-4">
          <div class="text-center bg-zinc-800/50 border border-purple-500/20 p-6">
            <p class="text-zinc-500 text-xs uppercase mb-1">Precio Final</p>
            <p class="text-4xl font-black text-purple-400">$${formatCurrency(pkg.final_price)}</p>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-zinc-800/50 p-3"><p class="text-zinc-500">Individual Total</p><p class="text-white font-bold">$${formatCurrency(pkg.individual_total || 0)}</p></div>
            <div class="bg-zinc-800/50 p-3"><p class="text-zinc-500">Ganancia</p><p class="text-green-400 font-bold">$${formatCurrency(pkg.net_profit || 0)}</p></div>
          </div>
        </div>
        <div class="p-4 border-t border-zinc-800 flex gap-3">
          <button onclick="closeDetailModal()" class="flex-1 py-3 bg-zinc-800 text-white font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors">Cerrar</button>
          <button onclick="deletePackageFromHistory('${pkg.id}')" class="py-3 px-4 bg-zinc-800 border border-red-500/30 text-red-400 font-bold uppercase text-xs tracking-widest hover:bg-red-500/20 transition-colors">${Icons.Trash2(16)}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) closeDetailModal(); };
  }
};

window.closeDetailModal = () => {
  const modal = document.getElementById('detailModal');
  if (modal) modal.remove();
};

window.editQuoteFromHistory = (id) => {
  const quote = window.historyState.quotes.find(q => q.id === id);
  if (quote) {
    // Map database fields to calculator state fields
    window.calculatorState = {
      step: 1,
      editingId: quote.id,
      // Map DB field names to state field names
      config: quote.config || {},
      print: quote.print_data || quote.print || {},
      labor: quote.labor || {},
      logistics: { ...(quote.logistics || {}), isFreeShipping: quote.is_free_shipping || (quote.logistics || {}).isFreeShipping || false },
      pricing: quote.pricing || {},
      results: quote.results || {},
      // Quote metadata
      quote_name: quote.quote_name,
      client_name: quote.client_name,
      product_id: quote.product_id,
      notes: quote.notes,
      tags: quote.tags || []
    };
    closeDetailModal();
    navigateTo('calculator');
  }
};

window.deleteQuoteFromHistory = (id) => {
  showConfirmModal('¿Estás seguro de eliminar esta cotización?', async () => {
    try {
      await window.Storage.deleteQuote(id);
      closeDetailModal();
      delete window.historyState;
      navigateTo('history');
    } catch (error) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  });
};

window.deletePackageFromHistory = (id) => {
  showConfirmModal('¿Estás seguro de eliminar este paquete?', async () => {
    try {
      await window.Storage.deletePackage(id);
      closeDetailModal();
      delete window.historyState;
      navigateTo('history');
    } catch (error) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  });
};

// MODALES GLOBALES (SAVE) - Modal completo como el original
window.showSaveModal = async () => {
  const state = window.calculatorState;
  const { formatCurrency } = window.Formatters;
  const Icons = window.Icons;

  const modal = document.createElement('div');
  modal.id = 'saveModal';
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in';
  modal.innerHTML = `
    <div class="bg-zinc-900 border border-zinc-700 max-w-md w-full overflow-hidden" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%);">
      <div class="p-4 border-b border-zinc-800">
        <h2 class="text-lg font-bold text-white uppercase">💾 Guardar Cotización</h2>
        <p class="text-xs text-zinc-500">Precio final: <span class="text-cyan-400 font-bold">$${formatCurrency(state.results?.finalPrice || 0)}</span></p>
      </div>
      
      <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <div>
          <label class="block text-xs text-zinc-400 mb-2 uppercase">Nombre de la cotización *</label>
          <input type="text" id="quoteName" placeholder="ej: Figura Dragon Rojo" 
                 value="${state.quote_name || state.meta?.quoteName || ''}"
                 class="w-full bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:border-cyan-500 text-sm" />
        </div>
        
        <div>
          <label class="block text-xs text-zinc-400 mb-2 uppercase">Cliente (opcional)</label>
          <input type="text" id="clientName" placeholder="ej: Juan Pérez" 
                 value="${state.client_name || state.meta?.clientName || ''}"
                 class="w-full bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:border-cyan-500 text-sm" />
        </div>
        
        <div>
          <label class="block text-xs text-zinc-400 mb-2 uppercase">🔗 Vincular a Producto (opcional)</label>
          <select id="productId" class="w-full bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:border-cyan-500 text-sm">
            <option value="">-- Sin vincular --</option>
          </select>
          <p id="productsLoading" class="text-xs text-zinc-500 mt-2">⏳ Cargando productos...</p>
        </div>
        
        <div>
          <label class="block text-xs text-zinc-400 mb-2 uppercase">Notas (opcional)</label>
          <textarea id="notes" rows="2" placeholder="Notas adicionales..." 
                    class="w-full bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:border-cyan-500 text-sm">${state.notes || state.meta?.notes || ''}</textarea>
        </div>
        
        ${!state.editingId ? `
        <div class="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700">
          <input type="checkbox" id="generateVariants" checked class="w-4 h-4 accent-cyan-500" />
          <label for="generateVariants" class="text-xs text-zinc-300">Generar 7 variantes automáticas (Envío + Empaque)</label>
        </div>
        ` : `
        <div class="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs">
          ⚠️ Editando cotización existente - se sobrescribirá al guardar
        </div>
        `}
      </div>
      
      <div id="saveError" class="hidden mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs"></div>
      
      <div class="p-4 border-t border-zinc-800 flex gap-3">
        <button onclick="closeSaveModal()" class="flex-1 py-3 bg-zinc-800 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors">Cancelar</button>
        <button onclick="saveQuoteToDatabase()" class="flex-1 py-3 bg-cyan-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-cyan-500 transition-colors">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('quoteName').focus();
  modal.onclick = (e) => { if (e.target === modal) closeSaveModal(); };

  // Cargar productos para el dropdown
  try {
    const products = await window.Storage.getProducts();
    const select = document.getElementById('productId');
    const loadingText = document.getElementById('productsLoading');

    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `#${product.display_order || '?'} ${product.name} (${product.sku || 'Sin SKU'})`;
      select.appendChild(option);
    });

    // Si está editando y tiene producto asociado
    if (state.product_id) {
      select.value = state.product_id;
    }

    if (loadingText) {
      loadingText.textContent = products.length > 0 ? `✅ ${products.length} productos disponibles` : '⚠️ No hay productos activos';
      loadingText.classList.remove('text-zinc-500');
      loadingText.classList.add(products.length > 0 ? 'text-green-400' : 'text-yellow-400');
    }
  } catch (error) {
    const loadingText = document.getElementById('productsLoading');
    if (loadingText) {
      loadingText.textContent = '❌ Error cargando productos';
      loadingText.classList.add('text-red-400');
    }
  }
};

window.closeSaveModal = () => {
  const modal = document.getElementById('saveModal');
  if (modal) modal.remove();
};

window.saveQuoteToDatabase = async () => {
  const quoteName = document.getElementById('quoteName')?.value?.trim();
  const clientName = document.getElementById('clientName')?.value?.trim();
  const productId = document.getElementById('productId')?.value;
  const notes = document.getElementById('notes')?.value?.trim();
  const errorEl = document.getElementById('saveError');

  if (!quoteName) {
    if (errorEl) {
      errorEl.textContent = 'El nombre de la cotización es obligatorio';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  try {
    const generateVariants = document.getElementById('generateVariants')?.checked ?? false;
    const state = window.calculatorState;

    const quoteData = {
      ...state,
      // Pass editingId as id so upsert will update instead of insert
      id: state.editingId || null,
      quoteName: quoteName,
      clientName: clientName || null,
      productId: productId || null,
      notes: notes || null,
      generateVariants: generateVariants
    };

    await window.Storage.saveQuote(quoteData);
    closeSaveModal();
    showNotification(state.editingId ? 'Cotización actualizada' : 'Cotización guardada', 'success');
    window.resetCalculator();
  } catch (error) {
    if (errorEl) {
      errorEl.textContent = 'Error: ' + error.message;
      errorEl.classList.remove('hidden');
    }
  }
};

// ============================================
// EXPORT
// ============================================
window.Components = {
  HomeScreen,
  Calculator,
  History,
  PackageCalculator
};

console.log('✅ ZYLOX COMPONENTS v5.0 LOADED');