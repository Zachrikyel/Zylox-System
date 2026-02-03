/* public/modules/categories/js/components.js */
window.Components = {};

window.Components.CategoryList = (path, items) => {

    // 1. DETERMINAR CONTEXTO VISUAL
    const viewingParents = path.length === 1;

    // CONFIGURACIÓN VISUAL
    const config = viewingParents ? {
        themeColor: '#B026FF',   // Púrpura Cyber (Bordes/Texto)
        iconColor: '#FFD700',    // Estrella Dorada (Icono específico)
        icon: 'fa-star',         // Icono Estrella
        countType: 'children',
        badgeLabel: 'SUBS',
        badgeIcon: 'fa-sitemap'
    } : {
        themeColor: '#39FF14',   // Verde Neo (Todo)
        iconColor: '#39FF14',    // Verde Neo (Icono)
        icon: 'fa-rocket',       // Icono Nave (Galaga/Space Invader style)
        countType: 'products',
        badgeLabel: 'PRODS',
        badgeIcon: 'fa-box-open'
    };

    // 2. BREADCRUMBS
    let breadcrumbsHtml = `<div class="breadcrumbs-bar" style="border-bottom: 1px solid #333;">`;
    breadcrumbsHtml += path.map((step, idx) => `
        <span class="crumb ${idx === path.length - 1 ? 'active' : ''} text-xs font-mono uppercase" 
              onclick="window.jumpToStep(${idx})"
              style="${idx === path.length - 1 ? 'color: ' + config.themeColor : ''}">
              ${step.name}
        </span>
        ${idx < path.length - 1 ? '<span class="text-zinc-600 mx-2">/</span>' : ''}
    `).join('');
    breadcrumbsHtml += `</div>`;

    // 3. LISTA
    let listHtml = '';

    if (items.length === 0) {
        listHtml = `
            <div class="flex flex-col items-center justify-center h-64 text-zinc-600 animate-fade-in">
                <i class="fas fa-search text-5xl mb-4 opacity-30" style="color: ${config.themeColor}"></i>
                <p class="font-mono text-sm">Vacío.</p>
            </div>
        `;
    } else {
        listHtml = `<ul class="card-stack mt-4">`;
        listHtml += items.map((item, index) => {

            const childCount = item.children && item.children[0] ? item.children[0].count : 0;
            const prodCount = item.products && item.products[0] ? item.products[0].count : 0;
            let finalCount = viewingParents ? childCount : prodCount;

            // ETIQUETAS SEGÚN CONTEXTO
            // Categorías padres: 🛸 en esquina izquierda
            // Subcategorías: 👽 en esquina izquierda
            const ribbonEmoji = viewingParents ? '🛸' : '👽';
            const ribbonColor = viewingParents ? '#B026FF' : '#39FF14';
            const ribbonGlow = viewingParents ? 'rgba(176, 38, 255, 0.5)' : 'rgba(57, 255, 20, 0.5)';

            const countLabel = viewingParents ? 'SUBS' : 'PRODS';
            const countBorder = viewingParents ? 'rgba(176, 38, 255, 0.5)' : 'rgba(57, 255, 20, 0.5)';
            const countGlow = viewingParents ? 'rgba(176, 38, 255, 0.6)' : 'rgba(57, 255, 20, 0.6)';

            return `
            <li class="stack-item no-select relative group" 
                style="--i: ${index}; border-left-color: ${config.themeColor};"
                oncontextmenu="return false;"
                onpointerdown="window.gestureStart(${item.id}, event)"
                onpointerup="window.gestureEnd(${item.id}, event)"
            >
                <!-- Etiqueta Icono (esquina superior izquierda) - Estilo Calculator History -->
                <div class="absolute left-0 top-0 ${viewingParents ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'} text-sm px-2 py-0.5">
                    ${ribbonEmoji}
                </div>

                <!-- Etiqueta Contador (esquina superior derecha) - Estilo Calculator History -->
                <div class="absolute right-0 top-0 ${viewingParents ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'} text-[9px] px-2 py-0.5 font-mono font-bold">
                    ${finalCount} ${countLabel}
                </div>

                <!-- Contenido Principal -->
                <div class="flex-1 min-w-0 flex flex-col justify-center pt-3">
                    <h3 class="item-name text-white uppercase tracking-wide truncate">${item.name}</h3>
                    <p class="item-slug font-mono text-[10px] text-zinc-500 mt-1 uppercase truncate">/${item.slug}</p>
                </div>

                <!-- Flecha navegación (solo categorías padres) -->
                ${viewingParents ? `
                <div class="shrink-0 ml-2">
                    <i class="fas fa-chevron-right text-zinc-600 group-hover:text-white transition-colors"></i>
                </div>
                ` : ''}
            </li>
            `;
        }).join('');
        listHtml += `</ul>`;
    }

    // 4. FAB
    const fabHtml = `
        <button class="fab-btn" onclick="window.openCreationModal()" style="background-color: ${config.themeColor}; box-shadow: 0 0 20px ${config.themeColor}66;">
            <i class="fas fa-plus text-black"></i>
        </button>
    `;

    return breadcrumbsHtml + listHtml + fabHtml;
};