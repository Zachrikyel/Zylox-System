const Icons = {
    Sparkles: (s = 24) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z"/></svg>`,
    Palette: (s = 24) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.093 0-.679.554-1.235 1.235-1.235h1.688C18.5 16.86 22 13.36 22 9.86 22 5.51 17.5 2 12 2z"/></svg>`,
    Box: (s = 24) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    Trending: (s = 24) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    Plus: (s = 20) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    ArrowRight: (s = 18) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    Check: (s = 18) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    ImageOff: (s = 18) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21l-2-2m-3.268-3.268L12 12.01l.732.732M21 16v-8a2 2 0 0 0-2-2h-3.414a2 2 0 0 1-1.414-.586L12.586 4H8.414a2 2 0 0 0-1.414.586L5.586 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1.414"/></svg>`,
    Search: (s = 18) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    Edit: (s = 18) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    Trash: (s = 18) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    ChevronLeft: (s = 24) => `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
};

// --- ZYLOX NOTIFICATION MODAL (Shared with Calculator) ---
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

function HomeScreen() {
    setTimeout(() => window.loadProductStats && window.loadProductStats(), 50);
    return `
    <div class="min-h-screen bg-transparent text-white flex flex-col p-6 animate-fade-in justify-center">
      <div class="max-w-lg mx-auto w-full space-y-6">
        <div class="grid grid-cols-1 gap-4">
          <button onclick="navigateTo('create_product')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-[#39FF14]" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3 relative z-10">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-[#39FF14] group-hover:text-black group-hover:bg-[#39FF14] transition-colors">${Icons.Sparkles(28)}</div>
              <span class="text-[10px] font-bold text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 tracking-widest border border-[#39FF14]/20">MASTER</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Nueva Creación</h3>
            <p class="text-xs text-zinc-400 font-mono">Registrar nuevo producto base.</p>
          </button>
          <button onclick="navigateTo('create_variant')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-purple-500" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3 relative z-10">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-purple-400 group-hover:text-white group-hover:bg-purple-500 transition-colors">${Icons.Palette(28)}</div>
              <span class="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 tracking-widest border border-purple-500/20">EXTENSION</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Variante Colores</h3>
            <p class="text-xs text-zinc-400 font-mono">Agregar color a producto existente.</p>
          </button>
          <button onclick="navigateTo('arsenal')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-blue-500" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3"><div class="p-3 bg-zinc-800 border border-zinc-700 text-blue-400 group-hover:text-white transition-colors">${Icons.Box(28)}</div></div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Arsenal</h3>
            <p class="text-xs text-zinc-400 font-mono">Inventario general y edición.</p>
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-zinc-800/50">
          <div class="bg-black/30 p-4 border border-zinc-800 text-center relative overflow-hidden group hover:border-[#39FF14]/50 transition-colors">
            <div class="text-3xl font-black text-[#39FF14] italic" id="stats-total">--</div>
            <div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1 flex justify-center gap-1 items-center">${Icons.Box(10)} TOTAL ITEMS</div>
          </div>
          <div class="bg-black/30 p-4 border border-zinc-800 text-center relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
            <div class="text-3xl font-black text-yellow-400 italic" id="stats-trending">--</div>
            <div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1 flex justify-center gap-1 items-center">${Icons.Trending(10)} TENDENCIA</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ... (MANTÉN CreateProductScreen y CreateVariantScreen IGUALES) ...
function CreateProductScreen() { if (!window.createState) { window.createState = { step: 1, linkedQuote: null, data: { isPublished: true, isTrending: false, displayOrder: 0, stock: 0, discount: 0, categoryName: '', packagingName: '' } }; } if (window.createState.step === 1) window.loadCategoriesIntoSelect(); if (window.createState.step === 3) window.loadPackagingIntoSelect(); const state = window.createState; let content = ''; const stepClass = (s) => `w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${state.step >= s ? 'bg-[#39FF14] border-[#39FF14] text-black' : 'border-zinc-700 text-zinc-500'}`; const textClass = (s) => `text-[9px] uppercase tracking-widest ${state.step >= s ? 'text-[#39FF14]' : 'text-zinc-600'}`; const lineClass = (s) => `flex-1 h-0.5 mx-1 transition-colors ${state.step > s ? 'bg-[#39FF14]' : 'bg-zinc-800'}`; const wizardHeader = ` <div class="flex justify-between mb-8 px-2 mt-4 items-center"> <div class="flex flex-col items-center gap-1 cursor-pointer" onclick="goToStep(1)"> <div class="${stepClass(1)}">1</div> <span class="${textClass(1)}">ID</span> </div> <div class="${lineClass(1)}"></div> <div class="flex flex-col items-center gap-1 cursor-pointer" onclick="goToStep(2)"> <div class="${stepClass(2)}">2</div> <span class="${textClass(2)}">$$</span> </div> <div class="${lineClass(2)}"></div> <div class="flex flex-col items-center gap-1 cursor-pointer" onclick="goToStep(3)"> <div class="${stepClass(3)}">3</div> <span class="${textClass(3)}">Tech</span> </div> <div class="${lineClass(3)}"></div> <div class="flex flex-col items-center gap-1 cursor-pointer" onclick="goToStep(4)"> <div class="${stepClass(4)}">4</div> <span class="${textClass(4)}">ADN</span> </div> </div> `; const imgPreviewBox = (idStr, val) => { const url = window.getDriveImageUrl && val ? window.getDriveImageUrl(window.extractDriveId(val)) : null; return ` <div id="${idStr}" class="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden relative group"> ${url ? `<img src="${url}" class="w-full h-full object-cover" />` : `<div class="opacity-50">${Icons.ImageOff(14)}</div>`} </div>`; }; if (state.step === 1) { content = ` <div class="space-y-4 animate-fade-in pb-20"> <button onclick="openQuoteImporter()" class="w-full py-3 border border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-[#39FF14] hover:border-[#39FF14] transition-colors text-xs font-mono uppercase tracking-widest mb-4 flex items-center justify-center gap-2"> ${Icons.Sparkles(14)} ${state.linkedQuote ? `Cotización: ${state.linkedQuote.quote_name}` : 'Importar desde Cotización'} </button> <div class="grid grid-cols-2 gap-4"> <div class="col-span-2"> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Nombre Producto *</label> <input type="text" value="${state.data.name || ''}" oninput="updateCreateData('name', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-bold focus:border-[#39FF14] outline-none" /> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">SKU *</label> <input type="text" value="${state.data.sku || ''}" oninput="updateCreateData('sku', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono focus:border-[#39FF14] outline-none uppercase" /> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Stock</label> <input type="number" value="${state.data.stock}" oninput="updateCreateData('stock', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono focus:border-[#39FF14] outline-none" /> </div> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Categoría *</label> <select id="categorySelect" onchange="updateCategorySelection(this)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono outline-none"> <option value="">-- Seleccionar --</option> </select> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Leyenda</label> <input type="text" value="${state.data.legend || ''}" oninput="updateCreateData('legend', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-300 text-sm focus:border-[#39FF14] outline-none" /> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Descripción</label> <textarea oninput="updateCreateData('description', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-300 text-sm focus:border-[#39FF14] outline-none h-24">${state.data.description || ''}</textarea> </div> <div class="border-t border-zinc-800 pt-4"> <label class="block text-[10px] text-[#39FF14] uppercase tracking-widest mb-2 flex items-center gap-2">${Icons.Palette(14)} Imágenes (Pegar Link Drive)</label> <div class="space-y-3"> <div class="flex items-center gap-2"> <span class="text-[9px] font-mono text-zinc-600 w-8">BACK</span> <input type="text" value="${state.data.imgBack || ''}" oninput="updateCreateData('imgBack', this.value); updateImagePreview('prev-back', this.value)" class="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-400 focus:text-white focus:border-[#39FF14] outline-none" placeholder="Fondo" /> ${imgPreviewBox('prev-back', state.data.imgBack)} </div> <div class="flex items-center gap-2"> <span class="text-[9px] font-mono text-zinc-600 w-8">MID</span> <input type="text" value="${state.data.imgMiddle || ''}" oninput="updateCreateData('imgMiddle', this.value); updateImagePreview('prev-mid', this.value)" class="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-400 focus:text-white focus:border-[#39FF14] outline-none" placeholder="Medio" /> ${imgPreviewBox('prev-mid', state.data.imgMiddle)} </div> <div class="flex items-center gap-2"> <span class="text-[9px] font-bold text-[#39FF14] w-8">FRONT</span> <input type="text" value="${state.data.imgFront || ''}" oninput="updateCreateData('imgFront', this.value); updateImagePreview('prev-front', this.value)" class="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-400 focus:text-white focus:border-[#39FF14] outline-none" placeholder="Portada" /> ${imgPreviewBox('prev-front', state.data.imgFront)} </div> </div> </div> <button onclick="goToStep(2)" class="w-full py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors mt-6 flex items-center justify-center gap-2" style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"> Siguiente: Finanzas ${Icons.ArrowRight(16)} </button> </div> `; } else if (state.step === 2) { const regular = parseFloat(state.data.regularPrice) || 0; const discount = parseFloat(state.data.discount) || 0; const finalPrice = discount > 0 ? regular * (1 - discount / 100) : regular; content = ` <div class="space-y-5 animate-fade-in pb-20"> <div class="bg-zinc-900/50 border border-zinc-800 p-4"> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Precio Base (De Calculadora) *</label> <input type="number" value="${state.data.basePrice || ''}" oninput="updateCreateData('basePrice', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-[#39FF14] font-mono font-bold text-lg focus:border-[#39FF14] outline-none" placeholder="0" /> </div> <div class="grid grid-cols-2 gap-4"> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Precio Regular</label> <input type="number" value="${state.data.regularPrice || ''}" id="input-regular" oninput="updateCreateData('regularPrice', this.value); updatePricePreview()" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono focus:border-[#39FF14] outline-none" placeholder="0" /> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Descuento %</label> <input type="number" value="${state.data.discount}" id="input-discount" oninput="updateCreateData('discount', this.value); updatePricePreview()" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-yellow-400 font-mono focus:border-yellow-400 outline-none" placeholder="0" /> </div> </div> <div class="p-4 border border-zinc-700 bg-zinc-950 text-center"> <span class="block text-[10px] text-zinc-500 uppercase tracking-widest">Precio Final al Público</span> <div class="flex items-center justify-center gap-3 mt-1" id="price-preview-container"> ${discount > 0 ? `<span class="text-zinc-500 line-through text-sm">$${regular.toLocaleString()}</span>` : ''} <span class="text-2xl font-black text-white tracking-tighter">$${Math.round(finalPrice).toLocaleString()}</span> </div> </div> <div class="grid grid-cols-2 gap-4"> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Ganancia Neta</label> <input type="number" value="${Math.round(state.data.margin || 0)}" oninput="updateCreateData('margin', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-green-400 font-mono focus:border-green-400 outline-none" /> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Orden Visual</label> <input type="number" value="${state.data.displayOrder}" oninput="updateCreateData('displayOrder', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono focus:border-[#39FF14] outline-none" /> </div> </div> <div class="flex gap-4"> <button onclick="updateCreateData('isPublished', !window.createState.data.isPublished); renderModule()" class="flex-1 p-3 border ${state.data.isPublished ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]' : 'border-zinc-800 text-zinc-600'} text-xs font-bold uppercase transition-all"> ${state.data.isPublished ? '🟢 Público' : '🔴 Oculto'} </button> <button onclick="updateCreateData('isTrending', !window.createState.data.isTrending); renderModule()" class="flex-1 p-3 border ${state.data.isTrending ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-zinc-800 text-zinc-600'} text-xs font-bold uppercase transition-all"> ${state.data.isTrending ? '🔥 Tendencia' : '❄️ Normal'} </button> </div> <div class="flex gap-4"> <button onclick="updateCreateData('isStockItem', !(window.createState.data.isStockItem !== false)); renderModule()" class="flex-1 p-3 border ${state.data.isStockItem !== false ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-purple-500 bg-purple-500/10 text-purple-400'} text-xs font-bold uppercase transition-all"> ${state.data.isStockItem !== false ? '📦 Stock' : '🎨 Custom'} </button> </div> <div class="mt-6"> <button onclick="goToStep(3)" class="w-full py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2" style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"> Siguiente: Teleport ${Icons.ArrowRight(16)} </button> </div> </div> `; } else if (state.step === 3) { content = ` <div class="space-y-5 animate-fade-in pb-20"> <div class="bg-zinc-900/50 border border-zinc-800 p-4"> <div class="flex items-center gap-2 mb-2 text-[#39FF14]"> ${Icons.Box(16)} <span class="text-xs font-bold uppercase tracking-widest">Datos de Fabricación</span> </div> <div class="space-y-3"> <div> <label class="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest mb-1"><span>Tiempo (Horas)</span> <span class="text-zinc-600">Precisión DB: ${state.data.printTime || 0}h</span></label> <input type="text" inputmode="decimal" value="${state.data.printTime || ''}" oninput="updateCreateData('printTime', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-2 text-white font-mono focus:border-[#39FF14] outline-none" placeholder="Ej: 4.58" /> </div> <div class="grid grid-cols-2 gap-3"> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Costo Luz</label> <input type="number" value="${state.data.kwhCost || ''}" oninput="updateCreateData('kwhCost', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-2 text-white font-mono focus:border-[#39FF14] outline-none" /> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Desgaste</label> <input type="number" value="${state.data.wearCost || ''}" oninput="updateCreateData('wearCost', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-2 text-white font-mono focus:border-[#39FF14] outline-none" /> </div> </div> <div> <label class="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest mb-1"><span>Peso (Gramos)</span> <span class="text-zinc-600">Manual</span></label> <input type="text" inputmode="decimal" value="${state.data.weight || ''}" oninput="updateCreateData('weight', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-2 text-white font-mono focus:border-[#39FF14] outline-none" placeholder="Ej: 82.91" /> </div> </div> </div> <div class="bg-zinc-900/50 border border-zinc-800 p-4"> <div class="flex items-center gap-2 mb-2 text-blue-400"> ${Icons.Box(16)} <span class="text-xs font-bold uppercase tracking-widest">Embalaje</span> </div> <div class="space-y-3"> <select id="packagingSelect" onchange="updatePackagingSelection(this)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono text-sm outline-none"> <option value="">-- Seleccionar Material --</option> </select> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Dimensiones Embalaje</label> <input type="text" value="${state.data.packDims || ''}" oninput="updateCreateData('packDims', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono text-sm focus:border-blue-400 outline-none" placeholder="Ej: 17cm alto aprox" /> </div> </div> </div> <div class="bg-zinc-900/50 border border-zinc-800 p-4"> <div class="flex items-center justify-between"> <div class="flex items-center gap-2"><span class="text-lg">🚚</span><div><span class="text-xs font-bold uppercase tracking-widest text-white">Envío Gratis</span><div class="text-[9px] text-zinc-500">Marcar si este producto lleva envío gratuito</div></div></div> <button onclick="updateCreateData('isFreeShipping', !window.createState.data.isFreeShipping); renderModule()" class="w-12 h-6 rounded-full transition relative ${state.data.isFreeShipping ? 'bg-green-500' : 'bg-zinc-700'}"><div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${state.data.isFreeShipping ? 'translate-x-6' : ''}"></div></button> </div> ${state.data.isFreeShipping ? '<div class="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-[10px] text-green-400 font-mono">✅ Este producto tendrá envío GRATIS</div>' : ''} </div> <div class="mt-6"> <button onclick="goToStep(4)" class="w-full py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2" style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"> Siguiente: Resumen ${Icons.ArrowRight(16)} </button> </div> </div> `; } else if (state.step === 4) { const s = state.data; const frontUrl = window.getDriveImageUrl ? window.getDriveImageUrl(window.extractDriveId(s.imgFront)) : ''; const backUrl = window.getDriveImageUrl ? window.getDriveImageUrl(window.extractDriveId(s.imgBack)) : ''; const midUrl = window.getDriveImageUrl ? window.getDriveImageUrl(window.extractDriveId(s.imgMiddle)) : ''; const imgBox = (url, label) => ` <div class="bg-zinc-900 border border-zinc-800 h-20 relative overflow-hidden flex items-center justify-center group"> <span class="absolute top-1 left-1 text-[8px] text-zinc-500 font-bold uppercase bg-black/50 px-1">${label}</span> ${url ? `<img src="${url}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" /> <div style="display:none" class="text-zinc-700 text-xs">Error</div>` : `<div class="text-zinc-700">${Icons.ImageOff(20)}</div>`} </div>`; content = ` <div class="space-y-6 animate-fade-in pb-20"> <div class="text-center space-y-2 mb-6"> <div class="text-[#39FF14] font-black text-2xl tracking-tighter italic uppercase break-words">${s.name}</div> <div class="flex items-center justify-center gap-2"> <div class="inline-block bg-zinc-900 px-3 py-1 border border-zinc-800 text-xs font-mono text-zinc-400">${s.sku}</div> <div class="inline-block bg-zinc-900 px-3 py-1 border border-zinc-800 text-xs font-mono text-[#39FF14]">STOCK: ${s.stock}</div> </div> </div> <div class="grid grid-cols-3 gap-2"> ${imgBox(backUrl, 'Back')} ${imgBox(midUrl, 'Mid')} ${imgBox(frontUrl, 'Front')} </div> <div class="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800"> <div class="bg-zinc-950 p-3"> <span class="block text-[9px] text-zinc-500 uppercase tracking-widest">Precio Final</span> <span class="text-white font-mono font-bold text-lg">$${Math.round(s.regularPrice * (1 - s.discount / 100)).toLocaleString()}</span> </div> <div class="bg-zinc-950 p-3"> <span class="block text-[9px] text-zinc-500 uppercase tracking-widest">Ganancia Neta</span> <span class="text-green-400 font-mono font-bold text-lg">$${Math.round(s.margin).toLocaleString()}</span> </div> <div class="bg-zinc-950 p-3"> <span class="block text-[9px] text-zinc-500 uppercase tracking-widest">Tiempo</span> <span class="text-zinc-300 font-mono text-sm">${s.printTime} h</span> </div> <div class="bg-zinc-950 p-3"> <span class="block text-[9px] text-zinc-500 uppercase tracking-widest">Peso</span> <span class="text-zinc-300 font-mono text-sm">${s.weight} g</span> </div> </div> <div class="bg-zinc-900/50 p-4 border border-zinc-800"> <span class="block text-[9px] text-zinc-500 uppercase tracking-widest mb-2">Checklist de Integridad</span> <ul class="space-y-3 text-xs text-zinc-400 font-mono"> <li class="flex items-start gap-2"> ${s.categoryName ? '<span class="text-[#39FF14] mt-0.5">' + Icons.Check(12) + '</span>' : '<span class="text-red-500 mt-0.5">X</span>'} <div> <span class="block text-zinc-500 text-[9px] uppercase">Categoría</span> <span class="text-white">${s.categoryName || 'Sin asignar'}</span> </div> </li> <li class="flex items-start gap-2"> ${state.linkedQuote ? '<span class="text-[#39FF14] mt-0.5">' + Icons.Check(12) + '</span>' : '<span class="text-zinc-600 mt-0.5">○</span>'} <div> <span class="block text-zinc-500 text-[9px] uppercase">Cotización Base</span> <span class="text-white">${state.linkedQuote ? state.linkedQuote.quote_name : 'Huérfana (Sin vinculo)'}</span> </div> </li> <li class="flex items-start gap-2"> ${s.isFreeShipping ? '<span class="text-green-400 mt-0.5">' + Icons.Check(12) + '</span>' : '<span class="text-zinc-600 mt-0.5">○</span>'} <div> <span class="block text-zinc-500 text-[9px] uppercase">Envío Gratis</span> <span class="text-white">${s.isFreeShipping ? '🚚 Sí — Envío Gratis' : 'No — Envío estándar'}</span> </div> </li> </ul> </div> <div class="mt-6"> <button onclick="submitProduct()" class="w-full py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2" style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"> CREAR ADN ${Icons.Check(16)} </button> </div> </div> `; } return ` <div class="min-h-screen bg-transparent text-white flex flex-col"> <main class="flex-1 overflow-y-auto p-5 pb-32"> <div class="max-w-md mx-auto"> ${wizardHeader} ${content} </div> </main> </div> `; }
function CreateVariantScreen() { if (!window.variantState) { window.variantState = { productId: "", colorName: "Base", hexCode: "", priceAdjustment: "", img1: "", img2: "", img3: "", img4: "", materialRows: [] }; window.loadProductsIntoSelect(); } if (!window._variantFilamentOptions) { window._variantFilamentOptions = 'loading'; window.fetchFilamentOptions().then(opts => { window._variantFilamentOptions = opts; renderModule(); }); } const s = window.variantState; const imgPreviewBox = (idNum) => { return `<div id="preview-box-${idNum}" class="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center opacity-50 overflow-hidden relative group"> ${Icons.ImageOff(14)} </div>`; }; const selectedProduct = s.productId && window._variantProducts ? window._variantProducts.find(p => String(p.id) === String(s.productId)) : null; const selectedLabel = selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : ''; return ` <div class="min-h-screen bg-transparent text-white flex flex-col"> <main class="flex-1 overflow-y-auto p-5 pb-32 animate-fade-in"> <div class="max-w-md mx-auto space-y-6"> <div class="text-center mb-6"> <div class="text-xs font-mono text-purple-400 uppercase tracking-widest border-b border-purple-500/30 pb-2 inline-block"> Nueva Variante de Color </div> </div> <div class="bg-zinc-900/30 border border-zinc-800 p-4 relative overflow-hidden group hover:border-purple-500/50 transition-colors"> <div class="absolute top-0 right-0 p-2 opacity-20 text-purple-500 group-hover:opacity-40 transition-opacity">${Icons.Box(40)}</div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Producto Objetivo *</label> <select id="variantProductSelect" onchange="updateVariantData('productId', this.value)" class="hidden"> <option value="">-- Seleccionar --</option> </select> <button onclick="openProductSelector()" type="button" id="variant-product-btn" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-left font-mono outline-none hover:border-purple-500 focus:border-purple-500 transition-colors cursor-pointer flex items-center justify-between ${selectedLabel ? 'text-white' : 'text-zinc-500'}"> <span class="truncate">${selectedLabel || '🔍 Toca para buscar y seleccionar producto...'}</span> <span class="text-purple-400 flex-shrink-0 ml-2">${Icons.Search(14)}</span> </button> </div> <div class="space-y-4"> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Nombre Variante *</label> <input type="text" value="${s.colorName}" oninput="updateVariantData('colorName', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-bold focus:border-purple-500 outline-none" placeholder="Ej: Shiny" /> </div> <div class="flex items-end gap-3"> <div class="flex-1"> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Hex Code</label> <input type="text" value="${s.hexCode}" oninput="handleHexInput(this)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-white font-mono uppercase focus:border-purple-500 outline-none" placeholder="#FFFFFF" maxlength="7" /> </div> <div id="hex-preview" class="w-12 h-12 rounded-lg border-2 border-white/20 shadow-md flex-shrink-0" style="background-color: ${s.hexCode || 'transparent'}"></div> </div> <div> <label class="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Costo Adicional <span class="text-zinc-600">(Opcional — se suma al precio base)</span></label> <input type="number" value="${s.priceAdjustment || ''}" oninput="updateVariantData('priceAdjustment', this.value)" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-yellow-400 font-mono focus:border-yellow-400 outline-none"  <div class="border-t border-zinc-800 pt-4"> <label class="block text-[10px] text-purple-400 uppercase tracking-widest mb-3 flex items-center justify-between"><span>Materiales Extra de esta Variante</span><span class="text-zinc-600 text-[9px] normal-case">Opcional — solo si agrega geometria/color nuevo</span></label> <div class="space-y-2">${(s.materialRows||[]).map((r,i)=>`<div class="flex gap-2 items-center"><select onchange="selectVariantMaterial(${i}, this.value)" class="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs text-white focus:border-purple-500 outline-none"><option value="">Selecciona...</option>${window._variantFilamentOptions === "loading" ? "" : (window._variantFilamentOptions||[]).map(m=>`<option value="${m.id}" ${r.materialId===m.id?"selected":""}>${m.display_name}${m.current_quantity<=0?" ⚠️":""}</option>`).join("")}</select><input type="text" inputmode="decimal" value="${r.grams||""}" oninput="updateVariantMaterialGrams(${i}, this.value)" class="w-20 bg-zinc-950 border border-zinc-800 p-2 text-xs text-yellow-400 font-mono text-right focus:border-purple-500 outline-none" placeholder="g" /><button onclick="removeVariantMaterialRow(${i})" class="text-zinc-600 hover:text-red-500 px-1">✕</button></div>`).join("")}</div>${window._variantFilamentOptions === "loading" ? `<div class="text-[10px] text-zinc-600 mt-2">⏳ Cargando materiales...</div>` : `<button onclick="addVariantMaterialRow()" class="mt-2 text-[10px] text-purple-400 font-bold uppercase">+ Agregar Material</button>`} </div> <div class="border-t border-zinc-800 pt-4"> <label class="block text-[10px] text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2"> ${Icons.Palette(14)} Imágenes (Pegar Link Drive) <span class="text-zinc-600 text-[9px] ml-auto">Min. 2 requeridas</span> </label> <div class="space-y-3"> <div class="flex items-center gap-2"> <span class="text-[9px] font-mono text-zinc-600 w-4">01</span> <input type="text" value="${s.img1}" oninput="updateVariantData('img1', this.value); updateImagePreview(1, this.value)" class="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-400 focus:text-white focus:border-purple-500 outline-none" placeholder="Principal (Obligatoria)" /> ${imgPreviewBox(1)} </div> <div class="flex items-center gap-2"> <span class="text-[9px] font-mono text-zinc-600 w-4">02</span> <input type="text" value="${s.img2}" oninput="updateVariantData('img2', this.value); updateImagePreview(2, this.value)" class="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-400 focus:text-white focus:border-purple-500 outline-none" placeholder="Secundaria (Obligatoria)" /> ${imgPreviewBox(2)} </div> <div class="flex items-center gap-2"> <span class="text-[9px] font-mono text-zinc-600 w-4">03</span> <input type="text" value="${s.img3}" oninput="updateVariantData('img3', this.value); updateImagePreview(3, this.value)" class="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-400 focus:text-white focus:border-purple-500 outline-none" /> ${imgPreviewBox(3)} </div> <div class="flex items-center gap-2"> <span class="text-[9px] font-mono text-zinc-600 w-4">04</span> <input type="text" value="${s.img4}" oninput="updateVariantData('img4', this.value); updateImagePreview(4, this.value)" class="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-400 focus:text-white focus:border-purple-500 outline-none" /> ${imgPreviewBox(4)} </div> </div> </div> <button onclick="submitVariant()" class="w-full py-4 bg-purple-600 text-white font-bold uppercase tracking-widest hover:bg-purple-500 transition-colors clip-path-button mt-6 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"> AGREGAR VARIANTE ${Icons.Plus(18)} </button> </div> </main> </div> `; }

// ============================================
// 4. ARSENAL SCREEN (LISTADO REDISEÑADO)
// ============================================
function ArsenalScreen() {
    // Inicializar estado y cargar todo (incluido categorías)
    if (!window.arsenalState) {
        window.arsenalState = {
            loading: true,
            items: [],
            filter: '',
            categories: [] // NUEVO: Cacheamos categorías
        };
        loadArsenalData();
    }
    const state = window.arsenalState;

    let filtered = state.items;
    if (state.filter) {
        const term = state.filter.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    }

    const listHtml = filtered.map(p => {
        const url = window.getDriveImageUrl ? window.getDriveImageUrl(window.extractDriveId(p.card_middle_url)) : '';
        const stockColor = p.stock_quantity > 20 ? 'text-[#39FF14]' : (p.stock_quantity > 5 ? 'text-yellow-400' : 'text-red-500');
        const pubStatus = !p.is_published ? '<span class="text-red-500 text-[8px] border border-red-500 px-1 ml-1">OCULTO</span>' : '';
        const freeShipBadge = p.is_free_shipping ? '<span class="text-green-400 text-[8px] border border-green-500/50 bg-green-500/10 px-1 ml-1">🚚 FREE</span>' : '';

        return `
        <div onclick="openProductInspector('${p.id}')" class="bg-zinc-900 border border-zinc-800 h-28 flex cursor-pointer hover:border-[#39FF14] transition-all group overflow-hidden relative" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="w-24 h-full bg-zinc-950 flex-shrink-0 relative border-r border-zinc-800">
                ${url
                ? `<img src="${url}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />`
                : `<div class="w-full h-full flex items-center justify-center text-zinc-700">${Icons.ImageOff(24)}</div>`
            }
                <div class="absolute top-0 left-0 bg-black/80 px-1.5 py-0.5 text-[8px] font-mono text-zinc-400 border-b border-r border-zinc-800">
                    #${p.display_order}
                </div>
            </div>

            <div class="flex-1 p-3 flex flex-col justify-between">
                
                <div>
                    <h3 class="text-sm font-bold text-white uppercase leading-tight line-clamp-2">${p.name} ${pubStatus}${freeShipBadge}</h3>
                    <span class="text-[10px] font-mono text-zinc-500 mt-0.5 block tracking-widest">${p.sku}</span>
                </div>

                <div class="flex items-end justify-between border-t border-white/5 pt-2">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-zinc-600 uppercase">Venta</span>
                        <span class="text-sm font-mono font-bold text-[#39FF14]">$${Math.round(p.sale_price).toLocaleString()}</span>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="text-[9px] text-zinc-600 uppercase">Stock</span>
                        <span class="text-xs font-mono ${stockColor}">${p.stock_quantity} un.</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    return `
        <div class="min-h-screen bg-transparent text-white flex flex-col">
            <div class="p-4 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-40">
                <div class="relative">
                    <input type="text" value="${state.filter}" oninput="updateArsenalFilter(this.value)" class="w-full h-10 bg-zinc-900 border border-zinc-800 pl-10 pr-4 text-xs font-mono text-white focus:border-[#39FF14] outline-none uppercase placeholder-zinc-600" placeholder="BUSCAR POR NOMBRE O SKU..." />
                    <div class="absolute left-3 top-2.5 text-zinc-600">${Icons.Search(16)}</div>
                </div>
            </div>
            <main class="flex-1 overflow-y-auto p-4 pb-32 animate-fade-in space-y-3">
                ${state.loading ? `<div class="text-center py-20 text-neo font-mono text-xs animate-pulse">CARGANDO...</div>` : (listHtml || `<div class="text-center py-20 text-zinc-600 font-mono text-xs">SIN RESULTADOS</div>`)}
            </main>
        </div>
    `;
}

// ============================================
// 5. PRODUCT INSPECTOR (FIXED UI & CALC)
// ============================================
function ProductInspector() {
    if (!window.inspectorState || !window.inspectorState.product) return '';
    const p = window.inspectorState.product;
    const tab = window.inspectorState.tab;

    // --- LÓGICA DE UI TEMPORAL ---
    // Usamos variables _ui para manejar los inputs sin dañar la data original hasta guardar
    const uiRegular = p._ui_regular !== undefined ? p._ui_regular : (p.compare_at_price || p.sale_price);

    // Calcular descuento inicial si no existe en UI state
    let uiDiscount = 0;
    if (p._ui_discount !== undefined) {
        uiDiscount = p._ui_discount;
    } else if (p.compare_at_price && p.compare_at_price > p.sale_price) {
        uiDiscount = Math.round(((p.compare_at_price - p.sale_price) / p.compare_at_price) * 100);
    }

    // Calcular Precio Final Visual en tiempo real
    const finalPrice = uiDiscount > 0 ? uiRegular * (1 - uiDiscount / 100) : uiRegular;

    // Categorías
    const catOptions = (window.arsenalState?.categories || []).map(c =>
        `<option value="${c.id}" ${c.id == p.category_id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    const tabBtn = (id, label) => `
        <button onclick="setInspectorTab('${id}')" class="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${tab === id ? 'text-[#39FF14] border-[#39FF14] bg-[#39FF14]/5' : 'text-zinc-500 border-transparent hover:text-white'}">
            ${label}
        </button>
    `;

    const inspImg = (val, label, key) => {
        const id = window.extractDriveId ? window.extractDriveId(val) : '';
        const url = id ? `/api/drive-proxy?id=${id}` : '';
        return `
        <div class="flex items-center gap-2">
            <span class="text-[9px] font-mono text-zinc-600 w-8">${label}</span>
            <input type="text" value="${val || ''}" onchange="updateInspectorData('${key}', this.value); renderModule()" class="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs text-white focus:border-[#39FF14] outline-none" />
            <div class="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                ${url ? `<img src="${url}" class="w-full h-full object-cover">` : Icons.ImageOff(12)}
            </div>
        </div>`;
    };

    let content = '';

    if (tab === 'core') {
        content = `
            <div class="space-y-6 p-4 animate-fade-in pb-20">
                
                <div class="space-y-3 border-b border-zinc-800 pb-4">
                    <label class="text-[#39FF14] text-[10px] font-bold uppercase tracking-widest">Identidad</label>
                    <div class="grid grid-cols-1 gap-3">
                        <div><span class="block text-[9px] text-zinc-500 uppercase mb-1">Nombre</span><input type="text" value="${p.name}" onchange="updateInspectorData('name', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-white font-bold text-sm focus:border-[#39FF14] outline-none" /></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><span class="block text-[9px] text-zinc-500 uppercase mb-1">SKU</span><input type="text" value="${p.sku}" onchange="updateInspectorData('sku', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-white font-mono text-xs focus:border-[#39FF14] outline-none" /></div>
                            <div><span class="block text-[9px] text-zinc-500 uppercase mb-1">Categoría</span><select onchange="updateInspectorData('category_id', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-white font-mono text-xs focus:border-[#39FF14] outline-none"><option value="">-- Seleccionar --</option>${catOptions}</select></div>
                        </div>
                        <div><span class="block text-[9px] text-zinc-500 uppercase mb-1">Leyenda</span><input type="text" value="${p.legend || ''}" onchange="updateInspectorData('legend', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-300 text-xs focus:border-[#39FF14] outline-none" /></div>
                        <div><span class="block text-[9px] text-zinc-500 uppercase mb-1">Descripción</span><textarea onchange="updateInspectorData('description', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-300 text-xs focus:border-[#39FF14] outline-none h-16">${p.description || ''}</textarea></div>
                    </div>
                </div>

                <div class="space-y-3 border-b border-zinc-800 pb-4">
                    <label class="text-[#39FF14] text-[10px] font-bold uppercase tracking-widest">Multimedia</label>
                    <div class="space-y-2">${inspImg(p.card_back_url, 'BACK', 'card_back_url')}${inspImg(p.card_middle_url, 'MID', 'card_middle_url')}${inspImg(p.card_front_url, 'FRONT', 'card_front_url')}</div>
                </div>

                <div class="space-y-3 border-b border-zinc-800 pb-4">
                    <label class="text-[#39FF14] text-[10px] font-bold uppercase tracking-widest">Finanzas & Stock</label>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <span class="block text-[9px] text-zinc-500 uppercase mb-1">Precio Base</span>
                            <input type="number" value="${p.base_price}" onchange="updateInspectorData('base_price', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 font-mono text-xs focus:border-[#39FF14] outline-none" />
                        </div>
                        <div>
                            <span class="block text-[9px] text-zinc-500 uppercase mb-1">Stock</span>
                            <input type="number" value="${p.stock_quantity}" onchange="updateInspectorData('stock_quantity', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-white font-mono text-xs focus:border-[#39FF14] outline-none" />
                        </div>
                        
                        <div>
                            <span class="block text-[9px] text-zinc-500 uppercase mb-1">Precio Regular</span>
                            <input type="text" inputmode="decimal" value="${uiRegular}" oninput="updateInspectorData('_ui_regular', this.value); updatePricePreview()" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-white font-mono text-xs focus:border-[#39FF14] outline-none" />
                        </div>
                        
                        <div>
                            <span class="block text-[9px] text-zinc-500 uppercase mb-1">Descuento %</span>
                            <input type="text" inputmode="decimal" value="${uiDiscount}" oninput="updateInspectorData('_ui_discount', this.value); updatePricePreview()" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-yellow-400 font-mono text-xs focus:border-yellow-400 outline-none" />
                        </div>
                        
                        <div>
                            <span class="block text-[9px] text-zinc-500 uppercase mb-1">Margen / Ganancia</span>
                            <input type="number" value="${p.profit_margin || 0}" onchange="updateInspectorData('profit_margin', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-green-400 font-mono text-xs focus:border-green-400 outline-none" />
                        </div>

                        <div class="col-span-2 bg-zinc-950 p-2 border border-zinc-800 flex justify-between items-center mt-2">
                            <span class="text-[9px] text-zinc-500 uppercase">Precio Venta Final</span>
                            <span id="inspector-final-price" class="text-lg font-bold text-[#39FF14] font-mono">$${Math.round(finalPrice).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="border border-dashed border-cyan-800 bg-cyan-900/10 p-3 flex items-center justify-between gap-3">
                    <div>
                        <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Cotización Vinculada</span>
                        <span class="text-[9px] text-zinc-500 font-mono">Actualizar precio base y margen desde la cotización</span>
                    </div>
                    <button onclick="syncQuoteToProduct('${p.id}')" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 flex-shrink-0" style="clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);">
                        🔄 SYNC
                    </button>
                </div>

                <div class="space-y-3">
                    <label class="text-[#39FF14] text-[10px] font-bold uppercase tracking-widest">Control</label>
                    <div class="flex gap-2">
                        <button onclick="updateInspectorData('is_published', !window.inspectorState.product.is_published); renderModule()" class="flex-1 py-2 border ${p.is_published ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]' : 'border-zinc-800 text-zinc-600'} text-[9px] font-bold uppercase">${p.is_published ? 'Público' : 'Oculto'}</button>
                        <button onclick="updateInspectorData('is_trending', !window.inspectorState.product.is_trending); renderModule()" class="flex-1 py-2 border ${p.is_trending ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-zinc-800 text-zinc-600'} text-[9px] font-bold uppercase">${p.is_trending ? 'Tendencia' : 'Normal'}</button>
                        <button onclick="updateInspectorData('is_stock_item', !(window.inspectorState.product.is_stock_item !== false)); renderModule()" class="flex-1 py-2 border ${p.is_stock_item !== false ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-purple-500 bg-purple-500/10 text-purple-400'} text-[9px] font-bold uppercase">${p.is_stock_item !== false ? 'Stock' : 'Custom'}</button>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border ${p.is_free_shipping ? 'border-green-500/50' : 'border-zinc-700'}">
                        <div class="flex items-center gap-2"><span class="text-sm">🚚</span><div><span class="text-[10px] font-bold text-white uppercase">Envío Gratis</span><div class="text-[9px] text-zinc-500">Producto con envío gratuito</div></div></div>
                        <button onclick="updateInspectorData('is_free_shipping', !window.inspectorState.product.is_free_shipping); renderModule()" class="w-10 h-5 rounded-full transition relative ${p.is_free_shipping ? 'bg-green-500' : 'bg-zinc-700'}"><div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${p.is_free_shipping ? 'translate-x-5' : ''}"></div></button>
                    </div>
                    <div><span class="block text-[9px] text-zinc-500 uppercase mb-1">Orden Visual</span><input type="number" value="${p.display_order}" onchange="updateInspectorData('display_order', this.value)" class="w-full bg-zinc-900 border border-zinc-800 p-2 text-white font-mono text-xs focus:border-[#39FF14] outline-none" /></div>
                </div>

                <div class="flex gap-2 pt-4 border-t border-zinc-800 mt-4"><button onclick="saveInspectorChanges()" class="flex-1 bg-[#39FF14] text-black font-bold uppercase text-xs py-3 hover:bg-white transition-colors">Guardar Todo</button><button onclick="deleteProductAction('${p.id}')" class="w-12 bg-red-900/20 border border-red-900 text-red-500 flex items-center justify-center hover:bg-red-900 hover:text-white transition-colors">${Icons.Trash(16)}</button></div>
            </div>`;
    }
    // TAB VARIANTS (SIN CAMBIOS, YA ESTÁ BIEN)
    else if (tab === 'variants') {
        const editingId = window.inspectorState.editingVariantId;
        if (!p.product_colors || p.product_colors.length === 0) {
            content = `<div class="p-8 text-center text-zinc-500 font-mono text-xs">Sin variantes registradas.</div>`;
        } else {
            content = `<div class="space-y-2 p-4 animate-fade-in pb-20">${p.product_colors.map(v => {
                if (String(editingId) === String(v.id)) {
                    // Buscar imágenes actuales para este color
                    const currentImgs = (p.product_media || [])
                        .filter(m => String(m.associated_color_id) === String(v.id))
                        .sort((a, b) => a.display_order - b.display_order);
                    const img1 = currentImgs[0]?.media_url || '';
                    const img2 = currentImgs[1]?.media_url || '';
                    const img3 = currentImgs[2]?.media_url || '';
                    const img4 = currentImgs[3]?.media_url || '';

                    return `
                        <div class="bg-zinc-900 border border-[#39FF14] p-3 space-y-3 relative">
                            <div class="absolute top-0 right-0 bg-[#39FF14] text-black text-[8px] font-bold px-1 uppercase">Editando</div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <span class="text-[8px] text-zinc-500 uppercase">Nombre</span>
                                    <input type="text" id="edit-v-name-${v.id}" value="${v.color_name}" class="w-full bg-black border border-zinc-700 p-2 text-xs text-white" />
                                </div>
                                <div>
                                    <span class="text-[8px] text-zinc-500 uppercase">Hex</span>
                                    <input type="text" id="edit-v-hex-${v.id}" value="${v.hex_code}" class="w-full bg-black border border-zinc-700 p-2 text-xs text-white font-mono" />
                                </div>
                            </div>
                            <div>
                                <span class="text-[8px] text-zinc-500 uppercase">Costo Adicional</span>
                                <input type="number" id="edit-v-price-${v.id}" value="${v.price_adjustment || 0}" class="w-full bg-black border border-zinc-700 p-2 text-xs text-yellow-400 font-mono" placeholder="0" />
                            </div>
                            <div class="border-t border-zinc-800 pt-2">
                                <span class="text-[8px] text-zinc-500 uppercase mb-1 flex items-center justify-between"><span>Materiales Extra de esta Variante</span></span>
                                <div class="space-y-1">
                                    ${(window.inspectorState.editingVariantMaterialRows || []).map((r, i) => `
                                    <div class="flex gap-1 items-center">
                                        <select onchange="selectEditMaterial(${i}, this.value)" class="flex-1 bg-black border border-zinc-700 p-1.5 text-[10px] text-white">
                                            <option value="">Selecciona...</option>
                                            ${window._variantFilamentOptions === 'loading' ? '' : (window._variantFilamentOptions || []).map(m => `<option value="${m.id}" ${r.materialId === m.id ? 'selected' : ''}>${m.display_name}${m.current_quantity <= 0 ? ' ⚠️' : ''}</option>`).join('')}
                                        </select>
                                        <input type="text" inputmode="decimal" value="${r.grams || ''}" oninput="updateEditMaterialGrams(${i}, this.value)" class="w-16 bg-black border border-zinc-700 p-1.5 text-[10px] text-yellow-400 font-mono text-right" placeholder="g" />
                                        <button onclick="removeEditMaterialRow(${i})" class="text-zinc-600 hover:text-red-500 px-1">✕</button>
                                    </div>`).join('')}
                                </div>
                                ${window._variantFilamentOptions === 'loading' ? `<div class="text-[9px] text-zinc-600 mt-1">⏳ Cargando materiales...</div>` : `<button onclick="addEditMaterialRow()" class="mt-1 text-[9px] text-purple-400 font-bold uppercase">+ Agregar Material</button>`}
                            </div>
                            <div class="border-t border-zinc-800 pt-2">
                                <span class="text-[8px] text-zinc-500 uppercase mb-1 block">Enlaces Imágenes (Drive)</span>
                                <div class="space-y-1">
                                    <input type="text" id="edit-v-img1-${v.id}" value="${img1}" class="w-full bg-black border border-zinc-700 p-1 text-[10px] text-zinc-300 focus:text-white" placeholder="Img 1" />
                                    <input type="text" id="edit-v-img2-${v.id}" value="${img2}" class="w-full bg-black border border-zinc-700 p-1 text-[10px] text-zinc-300 focus:text-white" placeholder="Img 2" />
                                    <input type="text" id="edit-v-img3-${v.id}" value="${img3}" class="w-full bg-black border border-zinc-700 p-1 text-[10px] text-zinc-300 focus:text-white" placeholder="Img 3" />
                                    <input type="text" id="edit-v-img4-${v.id}" value="${img4}" class="w-full bg-black border border-zinc-700 p-1 text-[10px] text-zinc-300 focus:text-white" placeholder="Img 4" />
                                </div>
                            </div>
                            <div class="flex gap-2 pt-1">
                                <button onclick="cancelVariantEdit()" class="flex-1 border border-zinc-600 text-zinc-400 text-[10px] py-2 uppercase hover:text-white">Cancelar</button>
                                <button onclick="saveVariantEdit('${v.id}')" class="flex-1 bg-[#39FF14] text-black text-[10px] py-2 uppercase font-bold hover:bg-white">Guardar</button>
                            </div>
                        </div>`;
                }
                return `<div class="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 hover:border-zinc-700"><div class="flex items-center gap-3"><div class="w-6 h-6 rounded-full border border-white/20 shadow-sm" style="background-color: ${v.hex_code}"></div><div><div class="text-xs font-bold text-white uppercase">${v.color_name}</div><div class="text-[9px] font-mono text-zinc-600">${v.hex_code}${v.price_adjustment ? ` <span class="text-yellow-400">+$${Math.round(v.price_adjustment).toLocaleString()}</span>` : ''}</div></div></div><div class="flex gap-1"><button onclick="startVariantEdit('${v.id}')" class="text-zinc-500 hover:text-white p-2">${Icons.Edit(14)}</button><button onclick="deleteVariantAction('${v.id}')" class="text-zinc-600 hover:text-red-500 p-2">${Icons.Trash(14)}</button></div></div>`;
            }).join('')}</div>`;
        }
    }

    return `
        <div class="min-h-screen bg-black text-white flex flex-col">
            <div class="flex border-b border-zinc-800 bg-black sticky top-0 z-40">
                ${tabBtn('core', 'Núcleo')}
                ${tabBtn('variants', 'Variantes')}
            </div>
            <main class="flex-1 overflow-y-auto">${content}</main>
        </div>
    `;
}

// --- OPEN INSPECTOR (Inicialización Limpia) ---
window.openProductInspector = async (id) => {
    const fullData = await window.fetchProductDetails(id);
    if (fullData) {
        // Inicializamos valores UI vacíos para que el Inspector calcule los defaults
        fullData._ui_regular = undefined;
        fullData._ui_discount = undefined;

        window.inspectorState = {
            active: true,
            product: fullData,
            tab: 'core',
            editingVariantId: null
        };
        renderModule();
        // Actualizar header para mostrar contexto del inspector
        if (window.syncWithParentHeader) window.syncWithParentHeader();
    } else {
        showNotification("Error cargando detalles.", "error");
    }
};

// --- PREVIEW DE PRECIO EN TIEMPO REAL (Sin re-render) ---
window.updatePricePreview = () => {
    // Context 1: Inspector
    if (window.inspectorState && window.inspectorState.product) {
        const p = window.inspectorState.product;
        const regular = parseFloat(p._ui_regular) || parseFloat(p.compare_at_price) || parseFloat(p.sale_price) || 0;
        const discount = parseFloat(p._ui_discount) || 0;
        const finalPrice = discount > 0 ? regular * (1 - discount / 100) : regular;
        const el = document.getElementById('inspector-final-price');
        if (el) {
            el.textContent = `$${Math.round(finalPrice).toLocaleString()}`;
        }
        return;
    }

    // Context 2: Create Product (Step 2)
    if (window.createState && window.createState.data) {
        const s = window.createState.data;
        const regular = parseFloat(s.regularPrice) || 0;
        const discount = parseFloat(s.discount) || 0;
        const finalPrice = discount > 0 ? regular * (1 - discount / 100) : regular;
        const container = document.getElementById('price-preview-container');
        if (container) {
            container.innerHTML = `
                ${discount > 0 ? `<span class="text-zinc-500 line-through text-sm">$${regular.toLocaleString()}</span>` : ''}
                <span class="text-2xl font-black text-white tracking-tighter">$${Math.round(finalPrice).toLocaleString()}</span>
            `;
        }
    }
};

// --- FUNCIONES ARSENAL ---
window.loadArsenalData = async () => {
    if (!window.fetchArsenalList) return;
    const [items, cats] = await Promise.all([
        window.fetchArsenalList(),
        window.fetchCategories ? window.fetchCategories() : []
    ]);
    window.arsenalState.items = items || [];
    window.arsenalState.categories = cats || [];
    window.arsenalState.loading = false;
    renderModule();
};

window.updateArsenalFilter = (val) => {
    window.arsenalState.filter = val;
    // Solo actualizar la lista sin re-renderizar todo (preserva foco del input)
    const term = val.toLowerCase();
    const terms = term.split(' ').filter(Boolean);
    const filtered = terms.length
        ? window.arsenalState.items.filter(p => terms.every(t => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)))
        : window.arsenalState.items;

    const listContainer = document.querySelector('main.space-y-3');
    if (!listContainer) return renderModule(); // Fallback a render completo

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="text-center py-20 text-zinc-600 font-mono text-xs">SIN RESULTADOS</div>`;
        return;
    }

    listContainer.innerHTML = filtered.map(p => {
        const url = window.getDriveImageUrl ? window.getDriveImageUrl(window.extractDriveId(p.card_middle_url)) : '';
        const stockColor = p.stock_quantity > 20 ? 'text-[#39FF14]' : (p.stock_quantity > 5 ? 'text-yellow-400' : 'text-red-500');
        const pubStatus = !p.is_published ? '<span class="text-red-500 text-[8px] border border-red-500 px-1 ml-1">OCULTO</span>' : '';
        const freeShipBadge = p.is_free_shipping ? '<span class="text-green-400 text-[8px] border border-green-500/50 bg-green-500/10 px-1 ml-1">🚚 FREE</span>' : '';
        return `
        <div onclick="openProductInspector('${p.id}')" class="bg-zinc-900 border border-zinc-800 h-28 flex cursor-pointer hover:border-[#39FF14] transition-all group overflow-hidden relative" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="w-24 h-full bg-zinc-950 flex-shrink-0 relative border-r border-zinc-800">
                ${url
                ? `<img src="${url}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />`
                : `<div class="w-full h-full flex items-center justify-center text-zinc-700">${Icons.ImageOff(24)}</div>`
            }
                <div class="absolute top-0 left-0 bg-black/80 px-1.5 py-0.5 text-[8px] font-mono text-zinc-400 border-b border-r border-zinc-800">
                    #${p.display_order}
                </div>
            </div>
            <div class="flex-1 p-3 flex flex-col justify-between">
                <div>
                    <h3 class="text-sm font-bold text-white uppercase leading-tight line-clamp-2">${p.name} ${pubStatus}${freeShipBadge}</h3>
                    <span class="text-[10px] font-mono text-zinc-500 mt-0.5 block tracking-widest">${p.sku}</span>
                </div>
                <div class="flex items-end justify-between border-t border-white/5 pt-2">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-zinc-600 uppercase">Venta</span>
                        <span class="text-sm font-mono font-bold text-[#39FF14]">$${Math.round(p.sale_price).toLocaleString()}</span>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="text-[9px] text-zinc-600 uppercase">Stock</span>
                        <span class="text-xs font-mono ${stockColor}">${p.stock_quantity} un.</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
};

window.closeInspector = () => {
    window.inspectorState = null;
    renderModule();
    // Actualizar header para volver al contexto de arsenal
    if (window.syncWithParentHeader) window.syncWithParentHeader();
};

window.setInspectorTab = (t) => {
    if (window.inspectorState) {
        window.inspectorState.tab = t;
        renderModule();
    }
};

window.syncQuoteToProduct = async (productId) => {
    showNotification("Sincronizando...", "info", 800);
    const result = await window.syncProductFromQuote(productId);
    if (!result.success) {
        if (result.reason === 'no_quote') {
            showNotification("Sin cotización vinculada a este producto.", "warning");
        } else {
            showNotification("Error: " + result.reason, "error");
        }
        return;
    }
    // Actualizar el inspector en memoria
    if (window.inspectorState && window.inspectorState.product) {
        window.inspectorState.product.base_price = result.newBasePrice;
        window.inspectorState.product.profit_margin = result.newMargin;
        // Resetear UI temps para que tomen los nuevos valores
        window.inspectorState.product._ui_regular = undefined;
        window.inspectorState.product._ui_discount = undefined;
    }
    renderModule();
    showNotification(`✅ Sync OK — Base: $${Math.round(result.newBasePrice).toLocaleString()} | Margen: $${Math.round(result.newMargin).toLocaleString()}`, "success", 3000);
};

window.updateInspectorData = (key, val) => {
    if (window.inspectorState && window.inspectorState.product) {
        window.inspectorState.product[key] = val;
    }
};

// --- SAVE INSPECTOR (Con Mapeo Correcto) ---
window.saveInspectorChanges = async () => {
    const p = window.inspectorState.product;

    // Recuperamos los valores UI o defaults
    const regularVal = p._ui_regular !== undefined ? p._ui_regular : (p.compare_at_price || p.sale_price);

    // Cálculo inicial de descuento si no se tocó el input
    let discountVal = 0;
    if (p._ui_discount !== undefined) {
        discountVal = p._ui_discount;
    } else if (p.compare_at_price && p.compare_at_price > p.sale_price) {
        discountVal = ((p.compare_at_price - p.sale_price) / p.compare_at_price) * 100;
    }

    try {
        await window.updateProductMaster(p.id, {
            // Mapeo directo
            name: p.name,
            sku: p.sku,
            stock: p.stock_quantity,
            categoryId: p.category_id,
            legend: p.legend,
            description: p.description,
            imgFront: p.card_front_url,
            imgBack: p.card_back_url,
            imgMiddle: p.card_middle_url,
            basePrice: p.base_price,

            // --- VALORES CALCULADOS/UI ---
            regularPrice: regularVal,
            discount: discountVal,
            // -----------------------------

            margin: p.profit_margin,
            isPublished: p.is_published,
            isTrending: p.is_trending,
            isFreeShipping: p.is_free_shipping || false,
            displayOrder: p.display_order,
            isStockItem: p.is_stock_item,
            packagingId: p.packaging_material_id
        });
        showNotification("Núcleo Actualizado", "success");
        loadArsenalData();
    } catch (e) {
        showNotification("Error: " + e.message, "error");
        console.error(e);
    }
};

window.deleteProductAction = (id) => {
    showConfirmModal("¿ELIMINAR PRODUCTO?\nEsta acción es irreversible.", async () => {
        try {
            await window.deleteProduct(id);
            showNotification("Eliminado", "success");
            closeInspector();
            loadArsenalData();
        } catch (e) { showNotification("Error: " + e.message, "error"); }
    });
};

window.startVariantEdit = (id) => {
    window.inspectorState.editingVariantId = id;
    const p = window.inspectorState.product;
    const existingBom = (p.product_bom || []).filter(b => String(b.product_color_id) === String(id));
    window.inspectorState.editingVariantMaterialRows = existingBom
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(b => ({ materialId: b.material_id, grams: b.quantity_required }));
    if (!window._variantFilamentOptions) {
        window._variantFilamentOptions = 'loading';
        window.fetchFilamentOptions().then(opts => { window._variantFilamentOptions = opts; renderModule(); });
    }
    renderModule();
};

window.cancelVariantEdit = () => {
    window.inspectorState.editingVariantId = null;
    window.inspectorState.editingVariantMaterialRows = [];
    renderModule();
};

window.deleteVariantAction = (id) => {
    showConfirmModal("¿Borrar variante?", async () => {
        try {
            await window.deleteVariant(id);
            const freshData = await window.fetchProductDetails(window.inspectorState.product.id);
            window.inspectorState.product = freshData;
            renderModule();
        } catch (e) { showNotification("Error: " + e.message, "error"); }
    });
};

// --- GUARDADO DE VARIANTE ---
window.saveVariantEdit = async (id) => {
    // 1. Obtener valores
    const newName = document.getElementById(`edit-v-name-${id}`).value;
    const newHex = document.getElementById(`edit-v-hex-${id}`).value;
    const newPrice = parseFloat(document.getElementById(`edit-v-price-${id}`).value) || 0;

    // 2. Obtener imágenes
    const imgs = [
        document.getElementById(`edit-v-img1-${id}`).value,
        document.getElementById(`edit-v-img2-${id}`).value,
        document.getElementById(`edit-v-img3-${id}`).value,
        document.getElementById(`edit-v-img4-${id}`).value
    ];

    try {
        // Llamar a la nueva función de utils
        const pId = window.inspectorState.product.id;
        const materialRows = window.inspectorState.editingVariantMaterialRows || [];
        await window.updateVariantFull(id, pId, newName, newHex, imgs, newPrice, materialRows);

        // Recargar
        const freshData = await window.fetchProductDetails(pId);
        window.inspectorState.product = freshData;
        window.inspectorState.editingVariantId = null;
        window.inspectorState.editingVariantMaterialRows = [];
        renderModule();
        showNotification("Variante Actualizada", "success");
    } catch (e) {
        console.error(e);
        showNotification("Error: " + e.message, "error");
    }
};

// ============================================
// HELPERS PARA CREATE PRODUCT SCREEN
// ============================================

window.goToStep = (targetStep) => {
    const s = window.createState.data;
    const current = window.createState.step;
    if (current === 1 && targetStep > 1) {
        if (!s.name || !s.sku || !s.categoryId) return showNotification("Faltan campos: Nombre, SKU o Categoría.", "warning");
    }
    if (current === 2 && targetStep > 2) {
        if (!s.basePrice) return showNotification("Falta Precio Base.", "warning");
    }
    window.createState.step = targetStep;
    renderModule();
    // Actualizar header con el nuevo paso
    if (window.syncWithParentHeader) {
        window.syncWithParentHeader();
    }
};

window.updateCreateData = (key, val) => { window.createState.data[key] = val; };

window.updateCategorySelection = (select) => {
    updateCreateData('categoryId', select.value);
    if (select.selectedIndex >= 0) {
        updateCreateData('categoryName', select.options[select.selectedIndex].text);
    }
};

window.updatePackagingSelection = (select) => {
    updateCreateData('packagingId', select.value);
    if (select.selectedIndex >= 0) {
        updateCreateData('packagingName', select.options[select.selectedIndex].text);
    }
};

window.loadCategoriesIntoSelect = async () => {
    if (!window.fetchCategories) return;
    const cats = await window.fetchCategories();
    setTimeout(() => {
        const sel = document.getElementById('categorySelect');
        if (sel && cats.length > 0 && sel.options.length <= 1) {
            cats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.text = c.name;
                if (c.type === 'parent') opt.style.fontWeight = 'bold';
                sel.add(opt);
            });
            if (window.createState.data.categoryId) {
                sel.value = window.createState.data.categoryId;
                if (sel.selectedIndex >= 0) updateCreateData('categoryName', sel.options[sel.selectedIndex].text);
            }
        }
    }, 100);
};

window.loadPackagingIntoSelect = async () => {
    if (!window.fetchPackagingOptions) return;
    const packs = await window.fetchPackagingOptions();
    setTimeout(() => {
        const sel = document.getElementById('packagingSelect');
        if (sel && packs.length > 0 && sel.options.length <= 1) {
            packs.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.text = `${p.name} (${p.sku || ''})`;
                sel.add(opt);
            });
            if (window.createState.data.packagingId) sel.value = window.createState.data.packagingId;
        }
    }, 100);
};

window.openQuoteImporter = async () => {
    const quotes = await window.fetchOrphanQuotes();
    if (quotes.length === 0) return showNotification("No hay cotizaciones sin vincular.", "info");
    window._importerQuotes = quotes;
    const renderQuoteList = (filtered) => filtered.map(q => `
        <button onclick="selectQuoteForImport('${q.id}')" 
            class="w-full text-left p-3 border border-zinc-800 hover:border-[#39FF14] hover:bg-[#39FF14]/10 transition-colors">
            <div class="font-bold text-white text-sm truncate">${q.quote_name}</div>
            <div class="text-[10px] text-zinc-500 font-mono flex justify-between mt-1">
                <span>$${q.results.finalPrice.toLocaleString()}</span>
                <span>${new Date(q.created_at).toLocaleDateString()}</span>
            </div>
        </button>
    `).join('');
    window._filterImporterQuotes = (val) => {
        const term = val.toLowerCase();
        const filtered = term 
            ? window._importerQuotes.filter(q => q.quote_name.toLowerCase().includes(term)) 
            : window._importerQuotes;
        const listEl = document.getElementById('importer-quote-list');
        const countEl = document.getElementById('importer-quote-count');
        if (listEl) listEl.innerHTML = filtered.length > 0 ? renderQuoteList(filtered) : '<div class="text-center py-8 text-zinc-600 font-mono text-xs">SIN RESULTADOS</div>';
        if (countEl) countEl.textContent = `${filtered.length} de ${window._importerQuotes.length}`;
    };
    const modalHtml = `
        <div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onclick="if(event.target===this)document.getElementById('importer-modal').remove()">
            <div class="bg-zinc-900 border border-zinc-700 w-full max-w-sm max-h-[80vh] flex flex-col p-0 shadow-neo">
                <div class="p-4 border-b border-zinc-800 flex-shrink-0">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-[#39FF14] font-bold uppercase text-xs tracking-widest">Importar Cotización</h3>
                        <span id="importer-quote-count" class="text-[10px] text-zinc-500 font-mono bg-zinc-800 px-2 py-0.5 border border-zinc-700">${quotes.length} disponibles</span>
                    </div>
                    <div class="relative">
                        <input type="text" oninput="window._filterImporterQuotes(this.value)" class="w-full h-9 bg-zinc-950 border border-zinc-800 pl-8 pr-3 text-xs font-mono text-white focus:border-[#39FF14] outline-none placeholder-zinc-600" placeholder="Buscar cotización..." />
                        <div class="absolute left-2.5 top-2 text-zinc-600">${Icons.Search(14)}</div>
                    </div>
                    <div class="text-[9px] text-zinc-600 font-mono mt-2">Mostrando más antigua → más reciente | Solo sin producto vinculado</div>
                </div>
                <div id="importer-quote-list" class="flex-1 overflow-y-auto p-3 space-y-2">
                    ${renderQuoteList(quotes)}
                </div>
                <div class="p-3 border-t border-zinc-800 flex-shrink-0">
                    <button onclick="document.getElementById('importer-modal').remove()" class="w-full py-3 border border-red-900 text-red-500 text-xs font-bold uppercase hover:bg-red-900/20 transition-colors">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    const d = document.createElement('div');
    d.id = 'importer-modal';
    d.innerHTML = modalHtml;
    document.body.appendChild(d);
};

window.selectQuoteForImport = (quoteId) => {
    const q = (window._importerQuotes || []).find(x => String(x.id) === String(quoteId));
    if (!q) return showNotification("No encontré esa cotización", "error");
    const results = q.results || {};
    const printData = q.print_data || q.print || {};
    const logistics = q.logistics || {};
    const s = window.createState.data;
    window.createState.linkedQuote = { id: q.id, quote_name: q.quote_name };
    if (!s.name) s.name = q.quote_name;
    s.basePrice = results.finalPrice;
    s.printTime = (results.totalProductionTime || 0).toFixed(2);
    s.kwhCost = Math.round(results.breakdown ? results.breakdown.energy : 0);
    s.wearCost = Math.round(results.breakdown ? results.breakdown.wear : 0);
    // Ganancia Neta real: etiquetas.gananciaReal ya resta la comisión de pasarela.
    // netProfit no lo hace — quedaba sobreestimado en cotizaciones pagadas por Wompi.
    s.margin = Math.round(results.etiquetas ? results.etiquetas.gananciaReal : (results.netProfit || 0));
    // Peso real: se suma directo de los colores capturados en el Paso 2 de la calculadora,
    // no se reconstruye desde el costo (eso se rompía en cuanto había colores a precios distintos).
    const colorSlots = (printData.colorSlots || []).filter(sl => sl.materialId && sl.grams > 0);
    const totalGrams = colorSlots.reduce((acc, sl) => acc + (Number(sl.grams) || 0), 0);
    s.weight = totalGrams > 0 ? totalGrams.toFixed(2) : '';
    s.importedColorSlots = colorSlots; // se usa al enviar el producto, para poblar product_bom
    // Embalaje: antes no se traía nada de esto.
    if (logistics.packagingMaterialId) {
        s.packagingId = logistics.packagingMaterialId;
        s.packagingName = null; // se refresca visualmente cuando cargue el select del Paso 3
    }
    s.isFreeShipping = q.is_free_shipping || false;
    document.getElementById('importer-modal').remove();
    renderModule();
    showNotification("Datos importados de la cotización", "success");
};

window.submitProduct = async () => {
    const s = window.createState;
    if (!s.data.name || !s.data.sku || !s.data.basePrice) {
        return showNotification("Faltan datos obligatorios (Nombre, SKU o Precio Base)", "warning");
    }
    try {
        const newProduct = await window.createProduct(s.data, s.linkedQuote?.id);
        showNotification(`ADN Creado: ${newProduct.name}`, "success");
        delete window.createState;
        navigateTo('home');
    } catch (e) {
        showNotification("Error al crear: " + e.message, "error");
        console.error(e);
    }
};

// ============================================
// HELPERS PARA CREATE VARIANT SCREEN
// ============================================

window.updateVariantData = (key, val) => { window.variantState[key] = val; };

window.addVariantMaterialRow = () => {
    window.variantState.materialRows = window.variantState.materialRows || [];
    window.variantState.materialRows.push({ materialId: null, grams: 0 });
    renderModule();
};
window.removeVariantMaterialRow = (i) => {
    window.variantState.materialRows.splice(i, 1);
    renderModule();
};
window.selectVariantMaterial = (i, value) => {
    window.variantState.materialRows[i].materialId = value ? Number(value) : null;
    renderModule();
};
window.updateVariantMaterialGrams = (i, value) => {
    window.variantState.materialRows[i].grams = parseFloat(value) || 0;
};

window.addEditMaterialRow = () => {
    window.inspectorState.editingVariantMaterialRows = window.inspectorState.editingVariantMaterialRows || [];
    window.inspectorState.editingVariantMaterialRows.push({ materialId: null, grams: 0 });
    renderModule();
};
window.removeEditMaterialRow = (i) => {
    window.inspectorState.editingVariantMaterialRows.splice(i, 1);
    renderModule();
};
window.selectEditMaterial = (i, value) => {
    window.inspectorState.editingVariantMaterialRows[i].materialId = value ? Number(value) : null;
    renderModule();
};
window.updateEditMaterialGrams = (i, value) => {
    window.inspectorState.editingVariantMaterialRows[i].grams = parseFloat(value) || 0;
};

window.updateImagePreview = (idStr, val) => {
    const finalId = (typeof idStr === 'number') ? `preview-box-${idStr}` : idStr;
    const box = document.getElementById(finalId);
    if (!box) return;
    const id = window.extractDriveId ? window.extractDriveId(val) : '';
    if (id) {
        const url = `/api/drive-proxy?id=${id}`;
        box.innerHTML = `<img src="${url}" class="w-full h-full object-cover" />`;
        box.classList.remove('opacity-50');
    } else {
        box.innerHTML = Icons.ImageOff(14);
        box.classList.add('opacity-50');
    }
};

window.loadProductsIntoSelect = async () => {
    if (!window.fetchProductsSimple) return;
    const products = await window.fetchProductsSimple();
    window._variantProducts = products;
    setTimeout(() => {
        const sel = document.getElementById('variantProductSelect');
        if (sel && products.length > 0 && sel.options.length <= 1) {
            products.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.text = `${p.name} (${p.sku})`;
                sel.add(opt);
            });
            if (window.variantState.productId) sel.value = window.variantState.productId;
        }
        // Set select size for better visibility (show up to 8 items when opened)
        if (sel) sel.setAttribute('size', '1');
    }, 100);
};

window.openProductSelector = () => {
    const products = window._variantProducts || [];
    if (products.length === 0) return showNotification("Cargando productos...", "info", 800);
    
    const renderList = (filtered) => filtered.map(p => `
        <button onclick="selectVariantProduct('${p.id}', '${p.name.replace(/'/g, "")} (${p.sku})')" 
            class="w-full text-left p-3 border border-zinc-800 hover:border-purple-500 hover:bg-purple-500/10 transition-colors">
            <div class="font-bold text-white text-sm truncate">${p.name}</div>
            <div class="text-[10px] text-zinc-500 font-mono mt-0.5">${p.sku}</div>
        </button>
    `).join('');
    
    window._filterVariantProducts = (val) => {
        const term = val.toLowerCase();
        const filtered = term 
            ? products.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)) 
            : products;
        const listEl = document.getElementById('variant-product-list');
        const countEl = document.getElementById('variant-product-count');
        if (listEl) listEl.innerHTML = filtered.length > 0 ? renderList(filtered) : '<div class="text-center py-8 text-zinc-600 font-mono text-xs">SIN RESULTADOS</div>';
        if (countEl) countEl.textContent = `${filtered.length} de ${products.length}`;
    };

    const modalHtml = `
        <div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onclick="if(event.target===this)document.getElementById('variant-selector-modal').remove()">
            <div class="bg-zinc-900 border border-zinc-700 w-full max-w-sm max-h-[80vh] flex flex-col p-0 shadow-neo">
                <div class="p-4 border-b border-zinc-800 flex-shrink-0">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-purple-400 font-bold uppercase text-xs tracking-widest">Seleccionar Producto</h3>
                        <span id="variant-product-count" class="text-[10px] text-zinc-500 font-mono bg-zinc-800 px-2 py-0.5 border border-zinc-700">${products.length} productos</span>
                    </div>
                    <div class="relative">
                        <input type="text" oninput="window._filterVariantProducts(this.value)" class="w-full h-9 bg-zinc-950 border border-zinc-800 pl-8 pr-3 text-xs font-mono text-white focus:border-purple-500 outline-none placeholder-zinc-600" placeholder="Buscar por nombre o SKU..." autofocus />
                        <div class="absolute left-2.5 top-2 text-zinc-600">${Icons.Search(14)}</div>
                    </div>
                </div>
                <div id="variant-product-list" class="flex-1 overflow-y-auto p-3 space-y-2">
                    ${renderList(products)}
                </div>
                <div class="p-3 border-t border-zinc-800 flex-shrink-0">
                    <button onclick="document.getElementById('variant-selector-modal').remove()" class="w-full py-3 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    const d = document.createElement('div');
    d.id = 'variant-selector-modal';
    d.innerHTML = modalHtml;
    document.body.appendChild(d);
};

window.selectVariantProduct = (id, label) => {
    updateVariantData('productId', id);
    const sel = document.getElementById('variantProductSelect');
    if (sel) sel.value = id;
    const modal = document.getElementById('variant-selector-modal');
    if (modal) modal.remove();
    // Update the display button text
    const btn = document.getElementById('variant-product-btn');
    if (btn) btn.textContent = label;
    renderModule();
};

window.handleHexInput = (input) => {
    let val = input.value;
    if (!val) {
        updateVariantData('hexCode', '');
        document.getElementById('hex-preview').style.backgroundColor = 'transparent';
        return;
    }
    let clean = val.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    if (clean.length > 6) clean = clean.substring(0, 6);
    const formatted = '#' + clean;
    if (input.value !== formatted && input.value !== clean) {
        input.value = formatted;
    }
    updateVariantData('hexCode', formatted);
    if (clean.length === 3 || clean.length === 6) {
        document.getElementById('hex-preview').style.backgroundColor = formatted;
    } else {
        document.getElementById('hex-preview').style.backgroundColor = 'transparent';
    }
};

window.submitVariant = async () => {
    const s = window.variantState;
    if (!s.productId || !s.colorName) return showNotification("Faltan datos: Selecciona un producto y ponle nombre.", "warning");
    if (s.hexCode && s.hexCode.length < 4) return showNotification("Hex incompleto.", "warning");

    const activeImages = [s.img1, s.img2, s.img3, s.img4].filter(img => img && img.trim().length > 5);
    if (activeImages.length < 2) return showNotification("REGLA: Mínimo 2 imágenes.", "warning");

    try {
        const result = await window.createVariant(s);
        showNotification(`Variante Creada: ${s.colorName}`, "success");

        window.variantState.colorName = "Base";
        window.variantState.hexCode = "";
        window.variantState.priceAdjustment = "";
        window.variantState.img1 = "";
        window.variantState.img2 = "";
        window.variantState.img3 = "";
        window.variantState.img4 = "";
        window.variantState.materialRows = [];

        renderModule();
    } catch (e) {
        console.error(e);
        showNotification("Error: " + e.message, "error");
    }
};

// Re-exportar todo concatenado
window.Components = {
    HomeScreen,
    CreateProductScreen,
    CreateVariantScreen,
    ArsenalScreen,
    ProductInspector
};