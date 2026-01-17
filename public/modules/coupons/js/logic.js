const CouponsManager = {
    state: {
        isActive: true,
        editIsActive: false,
        currentEditId: null
    },

    init: () => {
        // 1. Listeners para Mayúsculas (Crear y Editar)
        ['input-code', 'edit-code'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', (e) => {
                    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    if (val !== e.target.value) e.target.value = val;
                });
            }
        });

        // 2. Bloquear fechas pasadas (Crear y Editar)
        ['input-expires', 'edit-expires'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                el.min = now.toISOString().slice(0, 16);
            }
        });

        // Estado inicial switch crear
        CouponsManager.renderSwitch('create');
    },

    // --- SWITCHES ---
    toggleActive: () => {
        CouponsManager.state.isActive = !CouponsManager.state.isActive;
        CouponsManager.renderSwitch('create');
    },
    toggleEditActive: () => {
        CouponsManager.state.editIsActive = !CouponsManager.state.editIsActive;
        CouponsManager.renderSwitch('edit');
    },
    renderSwitch: (mode) => {
        const isEdit = mode === 'edit';
        const active = isEdit ? CouponsManager.state.editIsActive : CouponsManager.state.isActive;
        const prefix = isEdit ? 'edit-switch' : 'switch';

        const btn = document.getElementById(`${prefix}-active`);
        const knob = document.getElementById(`${prefix}-knob`);
        const label = document.getElementById(`${prefix}-label`);

        if (!btn) return;

        if (active) {
            // Estilo Activo (Verde)
            btn.className = "w-14 h-7 bg-[#39FF14]/20 border border-[#39FF14] rounded-full relative transition-all";
            knob.className = "absolute top-1 right-1 w-4 h-4 bg-[#39FF14] rounded-full shadow-[0_0_10px_#39FF14] transition-all";
            label.innerText = "ACTIVO";
            label.className = "text-[9px] text-[#39FF14] font-bold mt-1 uppercase";
        } else {
            // Estilo Inactivo (Gris)
            btn.className = "w-14 h-7 bg-zinc-800 border border-zinc-600 rounded-full relative transition-all";
            knob.className = "absolute top-1 left-1 w-4 h-4 bg-zinc-500 rounded-full transition-all";
            label.innerText = "INACTIVO";
            label.className = "text-[9px] text-zinc-500 font-bold mt-1 uppercase";
        }
    },

    // --- CREAR CÓDIGO (INSERT) ---
    createCode: async () => {
        const code = document.getElementById('input-code').value;
        const discount = document.getElementById('input-discount').value;
        const maxUses = document.getElementById('input-max-uses').value;
        const expires = document.getElementById('input-expires').value;
        const userId = document.getElementById('select-user').value;
        const notes = document.getElementById('input-notes').value;

        if (!code || !discount) return Utils.notify("Faltan datos obligatorios", "warning");

        const btn = document.getElementById('btn-create');
        btn.disabled = true;
        btn.innerText = "CREANDO...";

        try {
            const supabase = window.supabaseClient;
            const payload = {
                code: code,
                discount_percentage: parseFloat(discount),
                max_uses: maxUses ? parseInt(maxUses) : null,
                expires_at: expires ? new Date(expires).toISOString() : null,
                active: CouponsManager.state.isActive,
                restricted_to_user_id: userId || null,
                internal_notes: notes
            };

            const { error } = await supabase.from('coupons').insert([payload]);
            if (error) throw error;

            Utils.notify("Código Creado", "success");
            CouponsManager.resetForm();
            CouponsUI.loadStats();
            CouponsUI.switchView('home');

        } catch (error) {
            console.error(error);
            let msg = error.message;
            if (msg.includes("unique constraint")) msg = `El código "${code}" YA existe.`;
            Utils.notify("Error: " + msg, "error");
        } finally {
            btn.disabled = false;
            btn.innerText = "GENERAR CÓDIGO";
        }
    },

    // --- ACTUALIZAR CÓDIGO (UPDATE) ---
    updateCode: async () => {
        if (!CouponsManager.state.currentEditId) return;

        const id = CouponsManager.state.currentEditId;

        // Obtenemos los valores del formulario de EDICIÓN
        const code = document.getElementById('edit-code').value;
        const discount = document.getElementById('edit-discount').value;
        const maxUses = document.getElementById('edit-max-uses').value;
        const expires = document.getElementById('edit-expires').value;
        const userId = document.getElementById('edit-select-user').value;
        const notes = document.getElementById('edit-notes').value;

        if (!code || !discount) return Utils.notify("Faltan datos obligatorios", "warning");

        const btn = document.getElementById('btn-update');
        btn.disabled = true;
        btn.innerText = "GUARDANDO...";

        try {
            const supabase = window.supabaseClient;

            // PREPARAMOS SOLO LOS DATOS QUE EXISTEN EN TU TABLA
            const payload = {
                code: code, // Aquí se corrige el nombre si cambiaste SORPRESSA por SORPRESA
                discount_percentage: parseFloat(discount),
                max_uses: maxUses ? parseInt(maxUses) : null,
                expires_at: expires ? new Date(expires).toISOString() : null,
                active: CouponsManager.state.editIsActive, // Aquí reactivas o desactivas
                restricted_to_user_id: userId || null,
                internal_notes: notes
                // ¡NOTA!: Aquí eliminé 'updated_at' para evitar el error.
            };

            // Ejecutamos UPDATE donde el ID coincida
            const { error } = await supabase.from('coupons').update(payload).eq('id', id);

            if (error) throw error;

            Utils.notify("Código Actualizado Correctamente", "success");
            CouponsUI.closeEditModal();
            CouponsUI.loadStats(); // Refrescar widgets
            CouponsUI.loadCouponsList(); // Refrescar lista visual

        } catch (error) {
            console.error(error);
            let msg = error.message;
            // Si intentas cambiar el nombre a uno que YA existe en otro cupón
            if (msg.includes("unique constraint")) msg = `El código "${code}" ya está en uso por otro cupón.`;
            Utils.notify("Error: " + msg, "error");
        } finally {
            btn.disabled = false;
            btn.innerText = "ACTUALIZAR CÓDIGO";
        }
    },

    resetForm: () => {
        document.getElementById('input-code').value = "";
        document.getElementById('input-discount').value = "";
        document.getElementById('input-max-uses').value = "100";
        document.getElementById('input-expires').value = "";
        document.getElementById('select-user').value = "";
        document.getElementById('input-notes').value = "";
        CouponsManager.state.isActive = true;
        CouponsManager.renderSwitch('create');
    }
};