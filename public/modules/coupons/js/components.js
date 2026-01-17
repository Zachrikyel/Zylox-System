const CouponsUI = {
    init: async () => {
        CouponsUI.loadStats();
        CouponsUI.loadUsers();
    },

    loadStats: async () => {
        const supabase = window.supabaseClient;
        if (!supabase) return;
        try {
            const { count: active } = await supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('active', true);
            const { data: usageData } = await supabase.from('coupons').select('current_uses');
            const totalRedeemed = usageData?.reduce((acc, curr) => acc + (curr.current_uses || 0), 0) || 0;

            document.getElementById('stats-active').innerText = active || 0;
            document.getElementById('stats-redeemed').innerText = totalRedeemed || 0;
        } catch (e) { console.warn("Error stats:", e); }
    },

    loadUsers: async () => {
        const supabase = window.supabaseClient;
        if (!supabase) return;
        try {
            const { data } = await supabase.from('users').select('id, email').limit(200);
            ['select-user', 'edit-select-user'].forEach(id => {
                const el = document.getElementById(id);
                if (el && data) {
                    el.innerHTML = '<option value="">-- Para Todos los Usuarios --</option>';
                    data.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u.id;
                        opt.innerText = u.email || u.id;
                        el.appendChild(opt);
                    });
                }
            });
        } catch (e) { console.log("Error users:", e); }
    },

    loadCouponsList: async () => {
        const container = document.getElementById('coupons-grid');
        if (!container) return;
        container.innerHTML = '<div class="col-span-full text-center text-zinc-500 animate-pulse mt-10">Desencriptando...</div>';

        const { data, error } = await window.supabaseClient.from('coupons').select('*').order('created_at', { ascending: false });
        if (error || !data.length) return container.innerHTML = '<div class="col-span-full text-center text-zinc-600 mt-10">Sin registros.</div>';

        container.innerHTML = data.map(c => {
            const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
            const isLimit = c.max_uses && c.current_uses >= c.max_uses;
            const statusColor = (!c.active || isExpired || isLimit) ? 'text-zinc-500 border-zinc-700' : 'text-[#39FF14] border-[#39FF14]';
            const statusText = !c.active ? 'INACTIVO' : (isExpired ? 'VENCIDO' : (isLimit ? 'AGOTADO' : 'ACTIVO'));
            let subInfo = c.max_uses ? `${c.current_uses}/${c.max_uses} Usos` : 'Ilimitado';
            if (c.expires_at) subInfo += ` • Exp: ${new Date(c.expires_at).toLocaleDateString()}`;

            return `
            <div onclick="CouponsUI.openEditModal(${c.id})" class="bg-zinc-900 border border-zinc-800 p-4 relative group hover:border-[#39FF14] transition-all cursor-pointer cyber-shape overflow-hidden">
                <div class="absolute top-0 left-0 bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-500 font-mono border-r border-b border-zinc-700">#${c.id}</div>
                <div class="absolute top-3 right-3 border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest ${statusColor}">${statusText}</div>
                <div class="mt-4">
                    <h3 class="text-xl font-black text-white uppercase italic tracking-tighter truncate">${c.code}</h3>
                    <p class="text-[10px] text-zinc-500 font-mono mt-1">${subInfo}</p>
                </div>
                <div class="absolute bottom-3 right-3"><span class="text-2xl font-mono font-bold text-white group-hover:text-[#39FF14] transition-colors">${c.discount_percentage}%</span></div>
            </div>`;
        }).join('');
    },

    // --- MODAL LÓGICA CORREGIDA ---
    openEditModal: async (id) => {
        const { data } = await window.supabaseClient.from('coupons').select('*').eq('id', id).single();
        if (!data) return;

        const c = data;
        if (typeof CouponsManager !== 'undefined') CouponsManager.state.currentEditId = c.id;

        // Llenar campos...
        document.getElementById('edit-id-display').innerText = `ID: ${c.id}`;
        document.getElementById('edit-code').value = c.code;
        document.getElementById('edit-discount').value = c.discount_percentage;
        document.getElementById('edit-max-uses').value = c.max_uses || '';
        document.getElementById('edit-select-user').value = c.restricted_to_user_id || '';
        document.getElementById('edit-notes').value = c.internal_notes || '';

        if (c.expires_at) {
            const dt = new Date(c.expires_at);
            dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
            document.getElementById('edit-expires').value = dt.toISOString().slice(0, 16);
        } else {
            document.getElementById('edit-expires').value = '';
        }

        if (typeof CouponsManager !== 'undefined') {
            CouponsManager.state.editIsActive = c.active;
            CouponsManager.renderSwitch('edit');
        }

        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-modal').classList.add('flex');

        // 🔥 AQUÍ ESTÁ EL ARREGLO: INTERCEPTAR BOTONES PADRE 🔥
        if (window.parent) {
            // Botón Atrás: Cierra el modal (no sale del módulo)
            window.parent.stageBack = () => CouponsUI.closeEditModal();
            // Botón Home: Cierra modal y va al home del módulo
            window.parent.stageModuleHome = () => {
                CouponsUI.closeEditModal();
                CouponsUI.switchView('home');
            };
        }
    },

    closeEditModal: () => {
        document.getElementById('edit-modal').classList.add('hidden');
        document.getElementById('edit-modal').classList.remove('flex');
        if (typeof CouponsManager !== 'undefined') CouponsManager.state.currentEditId = null;

        // 🔥 RESTAURAR HEADER PADRE A MODO LISTA 🔥
        CouponsUI.updateParentHeader('list');
    },

    switchView: (viewName) => {
        ['view-home', 'view-new', 'view-list'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.classList.add('hidden'); el.classList.remove('flex'); }
        });
        const target = document.getElementById(`view-${viewName}`);
        if (target) { target.classList.remove('hidden'); target.classList.add('flex'); }

        if (viewName === 'list') CouponsUI.loadCouponsList();
        CouponsUI.updateParentHeader(viewName);
    },

    updateParentHeader: (viewName) => {
        if (!window.parent) return;
        try {
            const header = window.parent.document.querySelector('header');
            if (header) {
                let titleEl = header.querySelector('#module-stage-title');
                if (titleEl) {
                    if (viewName === 'home') titleEl.innerText = "";
                    if (viewName === 'new') titleEl.innerText = "NUEVO CÓDIGO";
                    if (viewName === 'list') titleEl.innerText = "GESTIÓN";
                }
            }
        } catch (e) { }

        if (viewName === 'home') {
            window.parent.stageBack = null;
            window.parent.stageModuleHome = null;
        } else {
            window.parent.stageBack = () => CouponsUI.switchView('home');
            window.parent.stageModuleHome = () => CouponsUI.switchView('home');
        }
    }
};