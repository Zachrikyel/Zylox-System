const Extractor = {
    processedIds: new Set(),

    init: () => {
        console.log("⚡ Extractor Listo");
    },

    process: () => {
        const input = document.getElementById('inputLinks').value;
        const container = document.getElementById('output-container');
        const countLabel = document.getElementById('result-count');

        // Limpiar contenedor si es nueva búsqueda (opcional, aquí acumulamos o limpiamos)
        // Para ser más limpio, vaciamos el contenedor visual pero mantenemos el Set para evitar duplicados en la misma sesión
        container.innerHTML = '';
        Extractor.processedIds.clear();

        // Divide por saltos de línea O comas
        const lines = input.split(/[\n,]+/);
        const regex = /\/d\/([a-zA-Z0-9_-]+)/;
        let count = 0;

        lines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine) {
                // Intentar match de ID normal o ID en parámetro
                let id = null;
                const match = cleanLine.match(regex);

                if (match && match[1]) {
                    id = match[1];
                } else if (cleanLine.includes('id=')) {
                    // Soporte extra por si pegan urls ya procesadas
                    const matchId = cleanLine.match(/id=([a-zA-Z0-9_-]+)/);
                    if (matchId) id = matchId[1];
                }

                if (id && !Extractor.processedIds.has(id)) {
                    Extractor.createCard(id, container);
                    Extractor.processedIds.add(id);
                    count++;
                }
            }
        });

        countLabel.innerText = `${count} ITEMS`;

        if (count === 0 && input.trim().length > 0) {
            alert("No encontré enlaces de Drive válidos.");
        }
    },

    createCard: (id, container) => {
        // Construimos la URL del Proxy
        const rutaFinal = `/api/drive-proxy?id=${id}`;

        const card = document.createElement('div');
        card.className = 'result-card bg-zinc-950 border border-zinc-800 p-2 flex gap-3 items-center group hover:border-zinc-600';

        card.innerHTML = `
            <div class="w-16 h-16 bg-black border border-zinc-800 shrink-0 overflow-hidden relative">
                <img src="${rutaFinal}" 
                     class="w-full h-full object-cover" 
                     alt="Img" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMy41IDMuNWw3IDdNMjAgMjFIM2MxLjUgMCAzLTEuNSAzLTMiLz48L3N2Zz4='">
            </div>

            <div class="flex-1 min-w-0">
                <div class="text-[10px] text-[#00bcd4] font-mono bg-zinc-900 inline-block px-1.5 py-0.5 rounded mb-1 truncate max-w-full">
                    ${id}
                </div>
                <div class="text-[9px] text-zinc-500 font-mono truncate">
                    ${rutaFinal}
                </div>
            </div>

            <button onclick="Extractor.copy('${rutaFinal}', this)" 
                    class="h-10 px-4 bg-zinc-800 hover:bg-[#39FF14] hover:text-black text-white text-[10px] font-bold uppercase tracking-widest transition-all border border-zinc-700 hover:border-[#39FF14]">
                COPIAR
            </button>
        `;

        container.appendChild(card);
    },

    copy: (text, btn) => {
        navigator.clipboard.writeText(text).then(() => {
            // Feedback Visual
            btn.innerText = "LISTO";

            // Marcar tarjeta padre
            const card = btn.closest('.result-card');
            card.classList.add('copied');
        });
    },

    clear: () => {
        document.getElementById('inputLinks').value = '';
        document.getElementById('output-container').innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50">
                <i class="ph ph-trash text-4xl mb-2"></i>
                <span class="text-xs font-mono uppercase">Limpiado</span>
            </div>
        `;
        document.getElementById('result-count').innerText = "0 ITEMS";
        Extractor.processedIds.clear();
    }
};