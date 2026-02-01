/* public/modules/materials/js/components.js */

window.Components = {};

window.Components.HomeScreen = (stats) => `
    <div class="flex flex-col h-full animate-fade-in pt-4">
        <div class="home-grid">
            <div class="action-card" onclick="window.navigateTo('inventory')">
                <div class="icon-circle text-neo">
                    <i class="fas fa-plus"></i>
                </div>
                <div class="text-center">
                    <div class="card-title text-white">NUEVO MATERIAL</div>
                    <div class="card-desc">Ingresar al Dock</div>
                </div>
            </div>
            <div class="action-card" onclick="window.navigateTo('inventory')">
                <div class="icon-circle text-purple-500">
                    <i class="fas fa-cubes"></i>
                </div>
                <div class="text-center">
                    <div class="card-title text-white">INVENTARIO</div>
                    <div class="card-desc">Explorar Nodos</div>
                </div>
            </div>
        </div>
        <div class="stats-row max-w-[900px] mx-auto w-full mt-auto">
            <div class="stat-widget">
                <div>
                    <div class="stat-label">Nodos Activos</div>
                    <div class="stat-val text-white">${stats.totalArmarios || 0}</div>
                </div>
                <i class="fas fa-server text-2xl text-zinc-600"></i>
            </div>
            <div class="stat-widget ${stats.alerts > 0 ? 'alert' : ''}">
                <div>
                    <div class="stat-label">Alertas</div>
                    <div class="stat-val ${stats.alerts > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}">
                        ${stats.alerts || 0}
                    </div>
                </div>
                <i class="fas fa-exclamation-triangle text-2xl ${stats.alerts > 0 ? 'text-red-500' : 'text-zinc-600'}"></i>
            </div>
        </div>
    </div>
`;

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