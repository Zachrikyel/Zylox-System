const getIcons = () => window.Icons;
const getFormatters = () => window.Formatters;

// --- UTILS ---
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
// 1. HOME SCREEN & STATS
// ============================================
function HomeScreen() {
  const Icons = getIcons();
  // Cargar estadísticas reales al iniciar
  setTimeout(() => window.loadDashboardStats(), 100);

  return `
    <div class="min-h-screen bg-transparent text-white flex flex-col p-6 animate-fade-in">
      <div class="mb-8 mt-2">
        <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-white italic tracking-tighter uppercase transform -skew-x-6">
          Calculadora <span class="text-white">3D</span>
        </h1>
        <div class="h-1 w-20 bg-cyan-500 mt-2 rounded-full"></div>
      </div>

      <div class="max-w-lg mx-auto w-full space-y-6">
        <div class="grid grid-cols-1 gap-4">
          <button onclick="navigateTo('calculator')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-cyan-500" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3 relative z-10">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-cyan-400 group-hover:text-white group-hover:bg-cyan-500 transition-colors">${Icons.Calculator(28)}</div>
              <span class="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 tracking-widest">NUEVA</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Cotizar Pieza</h3>
            <p class="text-xs text-zinc-400 font-mono">Calcula costos, tiempos y utilidad.</p>
          </button>

          <button onclick="navigateTo('packages')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-purple-500" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3 relative z-10">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-purple-400 group-hover:text-white group-hover:bg-purple-500 transition-colors">${Icons.Layers(28)}</div>
              <span class="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 tracking-widest">MULTI</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Crear Paquete</h3>
            <p class="text-xs text-zinc-400 font-mono">Combina múltiples productos.</p>
          </button>

          <button onclick="navigateTo('history')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-zinc-500" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3"><div class="p-3 bg-zinc-800 border border-zinc-700 text-zinc-400 group-hover:text-white transition-colors">${Icons.Search(28)}</div></div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Historial</h3>
            <p class="text-xs text-zinc-400 font-mono">Revisar cotizaciones pasadas.</p>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-zinc-800/50">
          <div class="bg-black/30 p-4 border border-zinc-800 text-center relative overflow-hidden">
            <div class="text-3xl font-black text-cyan-500 italic" id="stats-quotes">--</div>
            <div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Cotizaciones</div>
          </div>
          <div class="bg-black/30 p-4 border border-zinc-800 text-center relative overflow-hidden">
            <div class="text-3xl font-black text-purple-500 italic" id="stats-packages">--</div>
            <div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Paquetes</div>
          </div>
        </div>
        
        <button onclick="window.parent.closeTool && window.parent.closeTool()" class="w-full mt-4 py-3 text-xs font-bold text-red-900 hover:text-red-500 tracking-widest uppercase transition-colors opacity-50 hover:opacity-100">CERRAR MÓDULO</button>
      </div>
    </div>
  `;
}

// LOGICA DE STATS
window.loadDashboardStats = async () => {
  try {
    const quotes = await window.Storage.getQuotes(100, 0) || [];
    const packages = await window.Storage.getPackages(100, 0) || [];

    const qEl = document.getElementById('stats-quotes');
    const pEl = document.getElementById('stats-packages');

    if (qEl) qEl.innerText = quotes.length;
    if (pEl) pEl.innerText = packages.length;
  } catch (e) {
    console.warn("Error cargando stats:", e);
  }
};

// ============================================
// 2. CALCULATOR (LOGIC RESTORED)
// ============================================
function Calculator() {
  const Icons = getIcons();
  const { formatCurrency, parseDecimalHours } = window.Formatters;
  const { PRINTERS, NOZZLES, MATERIALS, SHIPPING_OPTIONS, PACKAGING, COMPLEXITY_LEVELS, GATEWAYS } = window.SICMA_CONSTANTS;

  if (!window.calculatorState) {
    window.calculatorState = {
      step: 1,
      config: { kwhPrice: 920, printer: 'p1s', nozzle: 0.4, material: 'pla', materialCostPerKg: 75000, amsMode: false },
      print: { printHours: 0, materialCost: 0, coolMinutes: 18, isPiece: 'single', plateCount: 1 },
      labor: { complexity: 'simple', primerToggle: false, lacquerToggle: false },
      logistics: { shipping: 'pickup', packagingType: 'box', packagingSize: 'small', packagingCustom: 0, shippingCustom: 0, additionalsToggle: false },
      pricing: { gateway: 'wompi', profitMargin: 30, additionalCharge: 0 },
      results: null
    };
  }
  const state = window.calculatorState;

  window.updateConfig = (key, value) => { state.config[key] = value; if (key === 'material') { const m = MATERIALS.find(x => x.id === value); state.print.coolMinutes = m.coolMinutes; } renderCalculatorWithScroll(); };
  window.updatePrint = (key, value) => { state.print[key] = value; renderCalculatorWithScroll(); };
  window.updateLabor = (key, value) => {
    state.labor[key] = value;
    if (key === 'complexity') {
      const margins = { simple: 25, easy: 30, medium: 35, hard: 40 };
      if (margins[value]) state.pricing.profitMargin = margins[value];
    }
    renderCalculatorWithScroll();
  };
  window.updateLogistics = (key, value) => { state.logistics[key] = value; renderCalculatorWithScroll(); };
  window.updatePricing = (key, value) => { state.pricing[key] = value; renderCalculatorWithScroll(); };

  window.updateTimePreview = (val) => {
    const hours = parseFloat(val) || 0;
    debouncedUpdate('printHours', 'print', hours);
    const container = document.getElementById('timePreviewContainer');
    const text = document.getElementById('timePreviewText');
    if (hours > 0) {
      if (container) container.classList.remove('hidden');
      if (text) { const p = parseDecimalHours(hours); text.textContent = `≈ ${p.hours}h ${p.minutes}min`; }
    } else { if (container) container.classList.add('hidden'); }
  };

  window.nextStep = () => {
    if (state.step === 1 && (!state.config.kwhPrice || !state.config.materialCostPerKg)) return alert('⚠️ Faltan datos de configuración');
    if (state.step === 2 && (!state.print.printHours || !state.print.materialCost)) return alert('⚠️ Faltan datos de impresión');
    if (state.step === 4) {
      if (state.logistics.shipping === 'national' && !state.logistics.shippingCustom) return alert('⚠️ Falta costo envío');
      if (state.logistics.packagingSize === 'deluxe' && !state.logistics.packagingCustom) return alert('⚠️ Falta costo empaque');
    }
    if (state.step === 5) {
      state.results = window.Calculations.calculateQuote({ config: state.config, print: state.print, labor: state.labor, logistics: state.logistics, pricing: state.pricing });
      state.step = 6;
    } else if (state.step < 6) state.step++;
    renderCalculator();
  };
  window.prevStep = () => { if (state.step > 1) state.step--; renderCalculator(); };
  window.resetCalculator = () => { delete window.calculatorState; navigateTo('home'); };

  let content = '';

  if (state.step === 1) {
    const selectedPrinter = PRINTERS.find(p => p.id === state.config.printer);
    const selectedNozzle = NOZZLES.find(n => n.size === state.config.nozzle);
    const selectedMaterial = MATERIALS.find(m => m.id === state.config.material);
    content = `<div class="space-y-5 animate-fade-in"><h2 class="text-xl font-black text-cyan-400 uppercase italic">Configuración</h2><div class="bg-zinc-900/50 rounded-none border border-zinc-800 p-5"><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-widest flex items-center gap-2">${Icons.Zap(16)} Costo Luz (COP/kWh)</label><input type="text" inputmode="decimal" value="${state.config.kwhPrice}" oninput="debouncedUpdate('kwhPrice', 'config', parseFloat(this.value) || 0)" onblur="handleInputBlur('kwhPrice', 'config', parseFloat(this.value) || 0)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono focus:border-cyan-500 outline-none" /><p class="text-[10px] text-zinc-600 mt-2 font-mono">💡 Recomendado: ~920 COP</p></div><div class="bg-zinc-900/50 border border-zinc-800 p-5"><div class="flex items-center justify-between mb-3">${Icons.Printer(20)}<span class="text-[10px] font-mono text-cyan-400 bg-zinc-950 px-2 py-1 border border-zinc-800">HARDWARE</span></div><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase">Impresora</label><select onchange="updateConfig('printer', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono outline-none mb-4">${PRINTERS.map(p => `<option value="${p.id}" ${state.config.printer === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select><div class="flex justify-between text-[10px] font-mono mb-4 text-zinc-500"><span>Consumo: <strong class="text-white">${selectedPrinter.watts}W</strong></span><span>Desgaste: <strong class="text-white">${formatCurrency(selectedPrinter.wear)}/h</strong></span></div><div class="pt-4 border-t border-zinc-800"><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase">Nozzle</label><div class="grid grid-cols-4 gap-2">${NOZZLES.map(n => `<button onclick="updateConfig('nozzle', ${n.size})" class="py-2 border text-xs font-mono ${state.config.nozzle === n.size ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-800 text-zinc-500'}">${n.size}</button>`).join('')}</div><p class="text-[10px] text-zinc-600 mt-2 font-mono">⚠️ Riesgo: +${((selectedNozzle.riskFactor - 1) * 100).toFixed(0)}%</p></div></div><div class="bg-zinc-900/50 border border-zinc-800 p-5"><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase">Material</label><select onchange="updateConfig('material', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono mb-4 outline-none">${MATERIALS.map(m => `<option value="${m.id}" ${state.config.material === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}</select><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase">Costo (COP/Kg)</label><input type="text" inputmode="decimal" value="${state.config.materialCostPerKg}" oninput="debouncedUpdate('materialCostPerKg', 'config', parseFloat(this.value) || 0)" onblur="handleInputBlur('materialCostPerKg', 'config', parseFloat(this.value) || 0)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono outline-none mb-2" /><div class="flex items-center justify-between mt-4 p-3 bg-zinc-950 border border-zinc-800"><div class="flex items-center gap-2"><span class="text-xs font-mono text-zinc-400 uppercase">Modo AMS</span></div><button onclick="updateConfig('amsMode', ${!state.config.amsMode})" class="w-10 h-5 bg-zinc-800 relative border border-zinc-700"><div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-all ${state.config.amsMode ? 'translate-x-5 bg-cyan-400' : ''}"></div></button></div></div></div>`;
  }
  else if (state.step === 2) {
    const selectedMaterial = MATERIALS.find(m => m.id === state.config.material);
    content = `<div class="space-y-5 animate-fade-in"><h2 class="text-xl font-black text-cyan-400 uppercase italic">Datos de Impresión</h2><div class="bg-zinc-900/50 border border-zinc-800 p-6 text-center"><label class="block text-xs font-mono text-zinc-500 mb-4 uppercase tracking-widest flex items-center justify-center gap-2">${Icons.Clock(16)} Tiempo (Horas)</label><input type="text" inputmode="decimal" value="${state.print.printHours || ''}" oninput="window.updateTimePreview(this.value)" onblur="handleInputBlur('printHours', 'print', parseFloat(this.value) || 0)" class="w-full bg-transparent text-center text-6xl font-black text-white focus:outline-none placeholder-zinc-800" placeholder="0.0" /><div id="timePreviewContainer" class="${state.print.printHours > 0 ? '' : 'hidden'} text-cyan-500 font-mono text-sm mt-2"><span id="timePreviewText">≈ ${state.print.printHours > 0 ? `${parseDecimalHours(state.print.printHours).hours}h ${parseDecimalHours(state.print.printHours).minutes}min` : ''}</span></div><p class="text-[10px] text-zinc-600 mt-2 font-mono">Ej: 4.5 = 4 horas 30 minutos</p></div><div class="bg-zinc-900/50 border border-zinc-800 p-5"><div class="grid grid-cols-2 gap-3 mb-4"><button onclick="updatePrint('isPiece', 'single')" class="py-3 border text-xs font-mono uppercase ${state.print.isPiece === 'single' ? 'border-cyan-500 text-cyan-400' : 'border-zinc-800 text-zinc-600'}">Pieza Única</button><button onclick="updatePrint('isPiece', 'multi')" class="py-3 border text-xs font-mono uppercase ${state.print.isPiece === 'multi' ? 'border-cyan-500 text-cyan-400' : 'border-zinc-800 text-zinc-600'}">Multipieza</button></div>${state.print.isPiece === 'multi' ? `<div class="mb-4"><label class="block text-xs font-mono text-zinc-500 uppercase mb-2">Cantidad de Placas</label><input type="number" value="${state.print.plateCount}" oninput="debouncedUpdate('plateCount', 'print', parseInt(this.value) || 1)" onblur="handleInputBlur('plateCount', 'print', parseInt(this.value) || 1)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono" /></div>` : ''}<div class="pt-4 border-t border-zinc-800"><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase flex items-center gap-2">${Icons.Snowflake(16)} Enfriamiento (min)</label><input type="text" inputmode="numeric" value="${state.print.coolMinutes || selectedMaterial.coolMinutes}" oninput="debouncedUpdate('coolMinutes', 'print', parseInt(this.value) || 0)" onblur="handleInputBlur('coolMinutes', 'print', parseInt(this.value) || 0)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono" /><p class="text-[10px] text-zinc-600 mt-2 font-mono">Recomendado ${selectedMaterial.name}: ${selectedMaterial.coolMinutes} min</p></div></div><div class="bg-zinc-900/50 border border-zinc-800 p-5"><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase mt-2 flex items-center gap-2">${Icons.Package(16)} Costo Material (COP)</label><input type="text" inputmode="decimal" value="${state.print.materialCost || ''}" oninput="debouncedUpdate('materialCost', 'print', parseFloat(this.value) || 0)" onblur="handleInputBlur('materialCost', 'print', parseFloat(this.value) || 0)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-right text-xl font-bold text-cyan-400 outline-none" placeholder="0" /><p class="text-[10px] text-zinc-600 mt-2 font-mono">💡 Valor total desde Bambu Studio</p></div></div>`;
  }
  else if (state.step === 3) {
    content = `<div class="space-y-5 animate-fade-in"><h2 class="text-xl font-black text-cyan-400 uppercase italic">Mano de Obra</h2><div class="space-y-2">${Object.entries(COMPLEXITY_LEVELS).map(([key, level]) => { const isSelected = state.labor.complexity === key; const estimatedCost = (level.suppliesCost + ((level.postProcessMinutes + level.operatorMinutes) / 60 * 20000) * (1 + level.failureRisk)).toFixed(0); return `<button onclick="updateLabor('complexity', '${key}')" class="w-full p-4 border text-left transition-all ${isSelected ? 'border-cyan-500 bg-cyan-500/5' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900'}"><div class="flex justify-between items-center"><span class="font-bold text-white uppercase italic">${level.name}</span><span class="text-xs font-mono text-cyan-500">${formatCurrency(estimatedCost)}</span></div><div class="text-[10px] text-zinc-500 font-mono mt-2 grid grid-cols-2 gap-1"><span>Post: ${level.postProcessMinutes}m</span><span>Riesgo: ${(level.failureRisk * 100).toFixed(0)}%</span></div></button>`; }).join('')}</div><div class="bg-zinc-900/50 border border-zinc-800 p-4 mt-4"><h3 class="text-xs font-bold text-zinc-400 uppercase mb-3">Extras</h3><div class="space-y-3"><div class="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-800"><span class="text-xs text-zinc-300 flex items-center gap-2">${Icons.Sparkles(14)} Primer</span><button onclick="updateLabor('primerToggle', ${!state.labor.primerToggle})" class="w-10 h-5 bg-zinc-800 relative border border-zinc-700"><div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-all ${state.labor.primerToggle ? 'translate-x-5 bg-purple-500' : ''}"></div></button></div><div class="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-800"><span class="text-xs text-zinc-300 flex items-center gap-2">${Icons.Sparkles(14)} Laca</span><button onclick="updateLabor('lacquerToggle', ${!state.labor.lacquerToggle})" class="w-10 h-5 bg-zinc-800 relative border border-zinc-700"><div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-all ${state.labor.lacquerToggle ? 'translate-x-5 bg-purple-500' : ''}"></div></button></div></div></div></div>`;
  }
  else if (state.step === 4) {
    content = `<div class="space-y-5 animate-fade-in"><h2 class="text-xl font-black text-cyan-400 uppercase italic">Logística</h2><div class="bg-zinc-900/50 border border-zinc-800 p-5"><label class="block text-xs font-mono text-zinc-500 mb-3 uppercase flex items-center gap-2">${Icons.Truck(16)} Método de Envío</label><div class="space-y-2">${SHIPPING_OPTIONS.map(option => `<button onclick="updateLogistics('shipping', '${option.id}')" class="w-full p-3 border flex justify-between items-center ${state.logistics.shipping === option.id ? 'border-cyan-500 bg-cyan-500/5 text-white' : 'border-zinc-800 text-zinc-500'}"><div class="flex items-center gap-3"><span class="text-lg">${option.icon}</span><span class="text-sm font-bold">${option.name}</span></div><span class="text-xs font-mono">${option.id === 'national' ? '$$$' : (option.cost === 0 ? 'GRATIS' : formatCurrency(option.cost))}</span></button>`).join('')}</div>${state.logistics.shipping === 'national' ? `<div class="mt-3 animate-fade-in"><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase">Costo Envío</label><input type="text" inputmode="decimal" value="${state.logistics.shippingCustom}" oninput="debouncedUpdate('shippingCustom', 'logistics', parseFloat(this.value) || 0)" onblur="handleInputBlur('shippingCustom', 'logistics', parseFloat(this.value) || 0)" class="w-full bg-zinc-950 border border-zinc-700 p-3 text-white font-mono text-sm focus:border-cyan-500 outline-none" /></div>` : ''}</div><div class="bg-zinc-900/50 border border-zinc-800 p-5"><label class="block text-xs font-mono text-zinc-500 mb-3 uppercase flex items-center gap-2">${Icons.Package(16)} Empaque</label><div class="flex gap-2 mb-3"><button onclick="updateLogistics('packagingType', 'box')" class="flex-1 py-2 border text-xs uppercase ${state.logistics.packagingType === 'box' ? 'border-cyan-500 text-cyan-400' : 'border-zinc-800 text-zinc-600'}">📦 Caja</button><button onclick="updateLogistics('packagingType', 'bag')" class="flex-1 py-2 border text-xs uppercase ${state.logistics.packagingType === 'bag' ? 'border-cyan-500 text-cyan-400' : 'border-zinc-800 text-zinc-600'}">🎒 Bolsa</button></div><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase">Tamaño</label><select onchange="updateLogistics('packagingSize', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono outline-none">${PACKAGING.map(p => `<option value="${p.id}" ${state.logistics.packagingSize === p.id ? 'selected' : ''}>${p.name}${p.cost > 0 ? ` - ${formatCurrency(p.cost)}` : ''}</option>`).join('')}</select>${state.logistics.packagingSize === 'deluxe' ? `<div class="mt-3"><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase">Costo Personalizado</label><input type="text" inputmode="decimal" value="${state.logistics.packagingCustom}" oninput="debouncedUpdate('packagingCustom', 'logistics', parseFloat(this.value) || 0)" onblur="handleInputBlur('packagingCustom', 'logistics', parseFloat(this.value) || 0)" class="w-full bg-zinc-950 border border-zinc-700 p-3 text-white font-mono text-sm focus:border-cyan-500 outline-none" /></div>` : ''}</div><div class="bg-zinc-900/50 border border-zinc-800 p-5"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-xs font-mono text-zinc-400 uppercase">Cargo Adicional (+2%)</span></div><button onclick="updateLogistics('additionalsToggle', ${!state.logistics.additionalsToggle})" class="w-10 h-5 bg-zinc-800 relative border border-zinc-700"><div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-all ${state.logistics.additionalsToggle ? 'translate-x-5 bg-cyan-400' : ''}"></div></button></div><p class="text-[10px] text-zinc-600 mt-2 font-mono">Añade 2% al costo de empaque</p></div></div>`;
  }
  else if (state.step === 5) {
    content = `<div class="space-y-5 animate-fade-in"><h2 class="text-xl font-black text-cyan-400 uppercase italic">Finanzas</h2><div class="bg-zinc-900/50 border border-zinc-800 p-5"><label class="block text-xs font-mono text-zinc-500 mb-3 uppercase flex items-center gap-2">${Icons.DollarSign(16)} Pasarela de Pago</label><select onchange="updatePricing('gateway', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono outline-none">${GATEWAYS.map(g => `<option value="${g.id}" ${state.pricing.gateway === g.id ? 'selected' : ''}>${g.name}${g.rate > 0 ? ` (${g.rate}%)` : ' (0%)'}</option>`).join('')}</select></div><div class="bg-zinc-900/50 border border-zinc-800 p-5"><label class="block text-xs font-mono text-zinc-500 mb-3 uppercase flex items-center gap-2">${Icons.TrendingUp(16)} Margen de Ganancia</label><div class="flex items-center gap-3"><input type="text" inputmode="decimal" value="${state.pricing.profitMargin}" oninput="debouncedUpdate('profitMargin', 'pricing', parseFloat(this.value) || 0)" onblur="handleInputBlur('profitMargin', 'pricing', parseFloat(this.value) || 0)" class="w-24 bg-zinc-950 border border-zinc-800 p-3 text-center text-2xl font-bold text-green-400 outline-none" /><span class="text-2xl text-zinc-600 font-mono">%</span><div class="text-[10px] text-zinc-500 flex-1 text-right font-mono">Multiplicador: <span class="text-white font-bold">${(1 / (1 - state.pricing.profitMargin / 100)).toFixed(2)}x</span></div></div></div><div class="bg-zinc-900/50 border border-zinc-800 p-5"><label class="block text-xs font-mono text-zinc-500 mb-2 uppercase flex items-center gap-2">${Icons.Sparkles(16)} Cargo Adicional</label><p class="text-[10px] text-zinc-500 mb-3">Diseño, personalización, etc.</p><input type="text" inputmode="decimal" value="${state.pricing.additionalCharge}" oninput="debouncedUpdate('additionalCharge', 'pricing', parseFloat(this.value) || 0)" onblur="handleInputBlur('additionalCharge', 'pricing', parseFloat(this.value) || 0)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-xl font-bold text-purple-400 outline-none" placeholder="0" /></div></div>`;
  }
  else if (state.step === 6 && state.results) {
    const r = state.results;
    content = `<div class="space-y-6 animate-slide-up"><div class="text-center py-8 relative bg-zinc-900 border border-zinc-800 p-6 cyber-shape"><p class="text-zinc-500 text-[10px] uppercase tracking-[0.2em] relative z-10 mb-2">Precio Final Sugerido</p><h1 class="text-5xl font-black text-white relative z-10 tracking-tighter">${formatCurrency(r.finalPrice)}</h1><div class="flex justify-center gap-4 text-[10px] font-mono text-zinc-500 mt-2"><span>USD ${(r.finalPrice / 4100).toFixed(2)}</span><span>|</span><span>EUR €${(r.finalPrice / 4400).toFixed(2)}</span></div></div><div class="grid grid-cols-2 gap-4 text-xs font-mono"><div class="bg-zinc-900/50 border border-zinc-800 p-4"><span class="text-zinc-500 block mb-1">COSTOS</span><span class="text-lg text-white font-bold">${formatCurrency(r.hardCosts + r.softCosts + r.logisticsCosts)}</span></div><div class="bg-zinc-900/50 border border-zinc-800 p-4"><span class="text-zinc-500 block mb-1">GANANCIA</span><span class="text-lg text-green-400 font-bold">${formatCurrency(r.netProfit)}</span></div></div><div class="bg-zinc-900 border border-zinc-800 p-4"><h3 class="text-xs font-bold text-zinc-400 uppercase mb-3 text-center">Resumen</h3><div class="space-y-2 text-xs font-mono text-zinc-300"><div class="flex justify-between"><span>Tiempo Total:</span><span class="text-white">${r.totalProductionTime.toFixed(1)}h</span></div><div class="flex justify-between"><span>Material:</span><span class="text-white">${formatCurrency(r.breakdown.material)}</span></div><div class="flex justify-between"><span>Energía:</span><span class="text-white">${formatCurrency(r.breakdown.energy)}</span></div><div class="flex justify-between"><span>Desgaste:</span><span class="text-white">${formatCurrency(r.breakdown.wear)}</span></div></div></div><div class="space-y-3 pt-4"><button onclick="showSaveModal()" class="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-4 uppercase tracking-widest clip-path-button transition-colors">Guardar Proyecto</button><button onclick="resetCalculator()" class="w-full border border-zinc-700 text-zinc-400 hover:text-white py-4 uppercase tracking-widest transition-colors">Nueva Cotización</button></div></div>`;
  }

  return `<div class="min-h-screen bg-transparent text-zinc-100 flex flex-col"><div class="flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-40"><button onclick="${state.step === 1 ? 'navigateTo(\'home\')' : 'prevStep()'}" class="flex items-center gap-2 text-zinc-400 hover:text-white uppercase text-xs font-bold tracking-widest"><span class="text-lg">‹</span> ${state.step === 1 ? 'MENÚ' : 'ATRÁS'}</button><div class="text-xs font-mono text-cyan-500">PASO ${state.step} / 6</div></div><main class="flex-1 overflow-y-auto pb-32" style="-webkit-overflow-scrolling: touch;"><div class="max-w-md mx-auto p-5">${content}</div></main>${state.step < 6 ? `<div class="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black via-black/90 to-transparent"><div class="max-w-md mx-auto"><button onclick="nextStep()" class="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors clip-path-button">${state.step === 5 ? 'CALCULAR RESULTADO' : 'SIGUIENTE PASO'}</button></div></div>` : ''}</div>`;
}

function renderCalculator() { document.getElementById('root').innerHTML = Calculator(); }
window.renderCalculatorWithScroll = () => { const s = document.querySelector('main')?.scrollTop || 0; renderCalculator(); requestAnimationFrame(() => { const c = document.querySelector('main'); if (c) c.scrollTop = s; }); };

// ============================================
// 3. PACKAGE CALCULATOR (FULL RECONSTRUCTED)
// ============================================
function PackageCalculator() {
  const Icons = getIcons();
  const { formatCurrency } = window.Formatters;
  const { PACKAGE_CONFIG } = window.SICMA_CONSTANTS;

  // Estado del Paquete
  if (!window.packageState) {
    window.packageState = {
      loading: true,
      availableQuotes: [],
      selectedIds: [],
      discountPercent: 0,
      finalPrice: 0,
      saved: false
    };
    loadPackageQuotes();
  }
  const state = window.packageState;

  // Render Logic
  let content = '';
  if (state.loading) {
    content = `<div class="text-center py-20 font-mono text-xs text-zinc-500 animate-pulse">CARGANDO COTIZACIONES...</div>`;
  } else if (state.availableQuotes.length === 0) {
    content = `<div class="text-center py-20 text-zinc-500 font-mono text-xs">NO HAY COTIZACIONES DISPONIBLES</div>`;
  } else {
    // Calculos
    const selectedQuotes = state.availableQuotes.filter(q => state.selectedIds.includes(q.id));
    const subtotal = selectedQuotes.reduce((sum, q) => sum + (q.results?.finalPrice || 0), 0);
    const discountAmount = subtotal * (state.discountPercent / 100);
    const total = subtotal - discountAmount;

    // Lista de cotizaciones
    const quotesList = state.availableQuotes.map(q => {
      const isSelected = state.selectedIds.includes(q.id);
      return `
        <div onclick="togglePackageQuote('${q.id}')" class="flex items-center justify-between p-4 border mb-2 cursor-pointer transition-colors ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-900/50'}">
          <div class="flex items-center gap-3">
            <div class="w-5 h-5 border ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'} flex items-center justify-center">
              ${isSelected ? Icons.Check(14) : ''}
            </div>
            <div>
              <div class="text-sm font-bold text-white uppercase">${q.quote_name}</div>
              <div class="text-[10px] text-zinc-500 font-mono">${formatCurrency(q.results?.finalPrice || 0)}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    content = `
      <div class="space-y-6 animate-fade-in">
        <h2 class="text-xl font-black text-purple-400 uppercase italic">Crear Paquete</h2>
        
        <div class="max-h-60 overflow-y-auto border border-zinc-800 bg-black/20 p-2">
          ${quotesList}
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 p-5">
          <label class="block text-xs font-mono text-zinc-500 mb-3 uppercase">Aplicar Descuento</label>
          <div class="flex gap-2">
            ${PACKAGE_CONFIG.DISCOUNT_OPTIONS.map(d => `
              <button onclick="updatePackageDiscount(${d})" class="flex-1 py-2 border text-xs font-bold ${state.discountPercent === d ? 'border-purple-500 bg-purple-500 text-white' : 'border-zinc-800 text-zinc-500'}">${d}%</button>
            `).join('')}
          </div>
        </div>

        <div class="bg-zinc-900 border border-zinc-800 p-5 cyber-shape">
          <div class="flex justify-between text-xs text-zinc-400 mb-2"><span>Subtotal:</span> <span>${formatCurrency(subtotal)}</span></div>
          <div class="flex justify-between text-xs text-purple-400 mb-4"><span>Descuento (${state.discountPercent}%):</span> <span>- ${formatCurrency(discountAmount)}</span></div>
          <div class="pt-4 border-t border-zinc-800 flex justify-between items-end">
            <span class="text-sm font-bold text-white uppercase tracking-widest">TOTAL PAQUETE</span>
            <span class="text-3xl font-black text-white tracking-tighter">${formatCurrency(total)}</span>
          </div>
        </div>

        <button onclick="savePackage()" class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 uppercase tracking-widest clip-path-button transition-colors ${state.selectedIds.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}">
          Guardar Paquete
        </button>
      </div>
    `;
  }

  return `<div class="min-h-screen bg-transparent text-zinc-100 flex flex-col"><div class="flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-40"><button onclick="navigateTo('home')" class="flex items-center gap-2 text-zinc-400 hover:text-white uppercase text-xs font-bold tracking-widest"><span class="text-lg">‹</span> MENÚ</button><div class="text-xs font-mono text-purple-500">PAQUETES</div></div><main class="flex-1 overflow-y-auto p-5"><div class="max-w-md mx-auto">${content}</div></main></div>`;
}

// Helpers Paquetes
window.loadPackageQuotes = async () => {
  try {
    const quotes = await window.Storage.getQuotes(50, 0); // Traer ultimas 50
    window.packageState.availableQuotes = quotes || [];
    window.packageState.loading = false;
    renderPackageCalculator();
  } catch (e) {
    window.packageState.loading = false;
    renderPackageCalculator();
  }
};
window.togglePackageQuote = (id) => {
  const s = window.packageState;
  if (s.selectedIds.includes(id)) s.selectedIds = s.selectedIds.filter(i => i !== id);
  else s.selectedIds.push(id);
  renderPackageCalculator();
};
window.updatePackageDiscount = (d) => { window.packageState.discountPercent = d; renderPackageCalculator(); };
window.savePackage = async () => {
  const s = window.packageState;
  if (s.selectedIds.length < 2) return alert("Selecciona al menos 2 cotizaciones");

  const name = prompt("Nombre del Paquete:");
  if (!name) return;

  const selectedQuotes = s.availableQuotes.filter(q => s.selectedIds.includes(q.id));
  const subtotal = selectedQuotes.reduce((sum, q) => sum + (q.results?.finalPrice || 0), 0);
  const total = subtotal * (1 - s.discountPercent / 100);

  const packageData = {
    name: name,
    quote_ids: s.selectedIds,
    final_price: total,
    discount: s.discountPercent,
    items: selectedQuotes.map(q => ({ name: q.quote_name, price: q.results.finalPrice }))
  };

  try {
    await window.Storage.savePackage(packageData);
    alert("✅ Paquete guardado");
    delete window.packageState; // Reset
    navigateTo('home');
  } catch (e) {
    alert("Error guardando paquete");
  }
};
function renderPackageCalculator() { document.getElementById('root').innerHTML = PackageCalculator(); }


// ============================================
// 4. HISTORY
// ============================================
function History() {
  const Icons = getIcons();
  if (!window.historyState) { window.historyState = { quotes: [], packages: [], loading: true, searchTerm: '', filter: 'all' }; loadHistoryData(); }
  const state = window.historyState;

  return `<div class="min-h-screen bg-transparent text-zinc-100 flex flex-col"><div class="flex items-center gap-3 p-4 border-b border-white/5 bg-black/20 sticky top-0 z-40"><button onclick="navigateTo('home')" class="text-zinc-400 hover:text-white uppercase text-xs font-bold tracking-widest flex items-center gap-2"><span class="text-lg">‹</span> MENÚ</button><h1 class="text-sm font-bold text-white uppercase italic tracking-wider ml-auto">Historial</h1></div><main class="flex-1 overflow-y-auto p-5"><div class="max-w-md mx-auto space-y-3"><div class="relative mb-4"><input type="text" value="${state.searchTerm}" oninput="updateHistorySearch(this.value)" placeholder="BUSCAR..." class="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-sm focus:border-cyan-500 outline-none uppercase" /></div>${state.loading ? `<div class="text-center py-10 font-mono text-xs text-zinc-500 animate-pulse">CARGANDO...</div>` : renderHistoryItems(state)}</div></main></div>`;
}

function renderHistoryItems(state) {
  const { formatCurrency, formatDateShort } = window.Formatters;
  let items = [];
  if (state.filter === 'all' || state.filter === 'quotes') items = items.concat(state.quotes.map(q => ({ ...q, type: 'quote' })));
  if (state.filter === 'all' || state.filter === 'packages') items = items.concat(state.packages.map(p => ({ ...p, type: 'package' })));
  if (state.searchTerm) items = items.filter(item => (item.quote_name || item.package_name || '').toLowerCase().includes(state.searchTerm.toLowerCase()));
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (items.length === 0) return `<div class="text-center py-10 text-zinc-600 font-mono text-xs">NO DATA FOUND</div>`;

  return items.map(item => {
    const isQuote = item.type === 'quote';
    const name = isQuote ? item.quote_name : item.package_name;
    const price = isQuote ? item.results.finalPrice : item.final_price;
    const isPackage = !isQuote;
    return `<div onclick="viewHistoryItem('${item.id}', '${item.type}')" class="bg-zinc-900/50 border border-zinc-800 p-4 cursor-pointer hover:border-cyan-500 transition-colors group relative overflow-hidden">
        ${isPackage ? '<div class="absolute right-0 top-0 bg-purple-500 text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">PACK</div>' : ''}
        <div class="flex justify-between items-start"><div class="flex-1"><h3 class="font-bold text-white uppercase text-sm truncate group-hover:text-cyan-400 transition-colors">${name}</h3><p class="text-[10px] text-zinc-500 font-mono mt-1">${formatDateShort(item.created_at)}</p></div><span class="font-mono ${isPackage ? 'text-purple-400' : 'text-cyan-500'} font-bold text-sm">${formatCurrency(price)}</span></div></div>`;
  }).join('');
}

window.loadHistoryData = async () => { try { const [q, p] = await Promise.all([window.Storage.getQuotes(50, 0), window.Storage.getPackages(50, 0)]); window.historyState.quotes = q; window.historyState.packages = p; window.historyState.loading = false; renderHistory(); } catch (e) { window.historyState.loading = false; renderHistory(); } };
window.updateHistorySearch = (v) => { window.historyState.searchTerm = v; renderHistory(); };
window.renderHistory = () => { document.getElementById('root').innerHTML = History(); };

window.viewHistoryItem = (id, type) => {
  if (type === 'quote') {
    // 1. Buscar la cotización en la memoria cargada
    const quote = window.historyState.quotes.find(q => q.id === id);

    if (quote) {
      // 2. Restaurar el estado de la calculadora con estos datos
      window.calculatorState = {
        ...quote,       // Carga config, print, labor, logistics, pricing...
        step: 6,        // IMPORTANTE: Nos lleva directo al resultado final
        results: quote.results // Asegura que los cálculos estén ahí
      };

      // 3. Abrir la herramienta
      navigateTo('calculator');
    } else {
      alert("⚠️ Error: No se pudieron recuperar los datos de la cotización.");
    }
  }
  else if (type === 'package') {
    // Lógica futura para paquetes
    alert("📦 Visualización de paquetes guardados en construcción.");
  }
};

// Modales Globales
window.showSaveModal = async () => {
  const name = prompt("Nombre de la cotización:");
  if (name) {
    try {
      await window.Storage.saveQuote({ ...window.calculatorState, quote_name: name });
      alert("✅ Guardado exitoso");
      window.resetCalculator();
    } catch (e) {
      alert("❌ Error al guardar: " + e.message);
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

console.log('✅ ZYLOX COMPONENTS v4.0 LOADED');