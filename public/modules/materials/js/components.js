/* public/modules/materials/js/components.js */

window.Components = {};

window.Components.HomeScreen = (stats) => {
    setTimeout(() => window.loadMaterialStats && window.loadMaterialStats(), 50);
    return `
    <div class="min-h-screen bg-transparent text-white flex flex-col p-6 animate-fade-in justify-center">
      <div class="max-w-lg mx-auto w-full space-y-6">
        <div class="grid grid-cols-1 gap-4">
          <button onclick="window.navigateTo('inventory')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-[#39FF14] text-left" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3 relative z-10">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-[#39FF14] group-hover:text-black group-hover:bg-[#39FF14] transition-colors">
                <i class="fas fa-plus text-xl"></i>
              </div>
              <span class="text-[10px] font-bold text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 tracking-widest border border-[#39FF14]/20">DOCK</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Nuevo Material</h3>
            <p class="text-xs text-zinc-400 font-mono">Agregar insumo al inventario</p>
          </button>

          <button onclick="window.navigateTo('inventory')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-purple-500 text-left" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3 relative z-10">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-purple-400 group-hover:text-white group-hover:bg-purple-500 transition-colors">
                <i class="fas fa-cubes text-xl"></i>
              </div>
              <span class="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 tracking-widest border border-purple-500/20">NODOS</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Inventario</h3>
            <p class="text-xs text-zinc-400 font-mono">Explorar árbol de materiales</p>
          </button>

          <button onclick="window.navigateTo('inventory')" class="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 transition-all hover:border-cyan-500 text-left" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
            <div class="flex items-start justify-between mb-3">
              <div class="p-3 bg-zinc-800 border border-zinc-700 text-cyan-400 group-hover:text-white transition-colors">
                <i class="fas fa-search text-xl"></i>
              </div>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase italic">Buscar</h3>
            <p class="text-xs text-zinc-400 font-mono">Localizar material por SKU</p>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-zinc-800/50">
          <div class="bg-black/30 p-4 border border-zinc-800 text-center relative overflow-hidden group hover:border-[#39FF14]/50 transition-colors">
            <div class="text-3xl font-black text-[#39FF14] italic" id="stats-nodos">${stats.totalArmarios || '--'}</div>
            <div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1 flex justify-center gap-1 items-center">
              <i class="fas fa-server text-[8px]"></i> NODOS ACTIVOS
            </div>
          </div>
          <div class="bg-black/30 p-4 border border-zinc-800 text-center relative overflow-hidden group hover:border-red-500/50 transition-colors">
            <div class="text-3xl font-black ${stats.alerts > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-500'} italic" id="stats-alertas">${stats.alerts || 0}</div>
            <div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1 flex justify-center gap-1 items-center">
              <i class="fas fa-exclamation-triangle text-[8px]"></i> ALERTAS
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

window.Components.InventoryScreen = (path, items) => {
    // BREADCRUMBS
    let breadcrumbsHtml = `<div class="breadcrumbs-bar">`;
    breadcrumbsHtml += `<i class="fas fa-home crumb" onclick="window.navigateTo('home')"></i> <span class="crumb-separator">/</span> `;
    breadcrumbsHtml += path.map((step, idx) => `
        <span class="crumb ${idx === path.length - 1 ? 'active' : ''}" 
              onclick="window.jumpToStep(${idx})">
              ${step.name}
        </span>
        ${idx < path.length - 1 ? '<span class="crumb-separator">></span>' : ''}
    `).join('');
    breadcrumbsHtml += `</div>`;

    // LISTA 3D
    let listHtml = '';
    const currentDepth = path.length - 1;

    const getConfig = (lvl) => {
        const map = {
            0: { name: 'NODO', color: '#39FF14', icon: 'fa-server' },
            1: { name: 'SECCIÓN', color: '#B026FF', icon: 'fa-layer-group' },
            2: { name: 'CUADRANTE', color: '#00F5FF', icon: 'fa-border-all' },
            3: { name: 'CELDA', color: '#FF6B00', icon: 'fa-box-open' }
        };
        return map[lvl] || { name: 'ITEM', color: '#fff', icon: 'fa-box' };
    };
    const config = getConfig(currentDepth);

    if (items.length === 0) {
        listHtml = `
            <div class="flex flex-col items-center justify-center h-64 text-zinc-600 animate-fade-in">
                <i class="fas fa-box-open text-5xl mb-4 opacity-50" style="color: ${config.color}"></i>
                <p class="font-mono text-sm">Vacío. Crea un nuevo <span style="color:${config.color}">${config.name}</span></p>
            </div>
        `;
    } else {
        listHtml = `<ul class="card-stack">`;
        listHtml += items.map((item, index) => {
            const isFinal = currentDepth === 3;
            // Determinar si tiene alerta de stock bajo
            const hasAlert = item.current_quantity <= (item.min_stock_alert || 5);

            return `
            <li class="stack-item no-select" 
                style="--i: ${index}; --border-color: ${config.color};"
                oncontextmenu="return false;"
                onpointerdown="window.gestureStart(${item.id}, event)"
                onpointerup="window.gestureEnd(${item.id}, event)"
                onpointermove="window.gestureMove(event)"
                onpointerleave="window.gestureCancel()"
                onpointercancel="window.gestureCancel()"
            >
                <div class="item-icon relative" style="--item-color: ${config.color}">
                    <i class="fas ${config.icon}"></i>
                    ${hasAlert ? '<span class="alert-dot"></span>' : ''}
                </div>
                <div class="w-full pointer-events-none">
                    <div class="flex justify-between items-start">
                        <h3 class="text-white font-bold text-lg leading-tight">${item.name}</h3>
                        ${item.current_quantity > 0 ? `<span class="font-mono text-xs bg-zinc-800 px-2 py-1 rounded text-white">${item.current_quantity}</span>` : ''}
                    </div>
                    <p class="font-mono text-xs text-zinc-500 mt-1">${item.sku || '---'}</p>
                    <div class="mt-2 flex gap-2">
                        <span class="item-badge" style="color:${config.color}; border-color:${config.color}">${config.name}</span>
                        ${hasAlert ? '<span class="item-badge text-red-500 border-red-500"><i class="fas fa-exclamation-triangle mr-1"></i>BAJO</span>' : ''}
                    </div>
                </div>
                ${!isFinal ? '<i class="fas fa-chevron-right text-zinc-600"></i>' : ''}
            </li>
            `;
        }).join('');
        listHtml += `</ul>`;
    }

    const fabHtml = `
        <button class="fab-btn" onclick="window.openCreationModal()" style="background-color: ${config.color}; box-shadow: 0 0 20px ${config.color}66;">
            <i class="fas fa-plus text-black"></i>
        </button>
    `;

    return breadcrumbsHtml + listHtml + fabHtml;
};