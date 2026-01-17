// MASTER USER ID (Para todas las ventas POS)
const MASTER_USER_ID = "c4a011c5-d8af-47ab-bc2f-f245b3cf6462";

const WizardLogic = {
    goToStep: (stepNum) => {
        if (stepNum === 2 && OrdersUI.state.selectedProductIds.size === 0) return Utils.notify("Selecciona al menos un producto", "warning");
        if (stepNum === 3) {
            if (!WizardLogic.validateStep2()) return;
            WizardLogic.buildCartFromStep2();
        }

        document.getElementById('view-home').classList.add('hidden');
        document.getElementById('view-pos').classList.remove('hidden');
        document.getElementById('view-pos').classList.add('flex');

        [1, 2, 3, 4].forEach(n => document.getElementById(`step-${n}`).classList.add('hidden'));
        document.getElementById(`step-${stepNum}`).classList.remove('hidden');

        if (stepNum === 1) OrdersUI.renderStep1();
        if (stepNum === 2) OrdersUI.renderStep2();
        if (stepNum === 3) OrdersUI.renderStep3();
        if (stepNum === 4) CartManager.prepareCheckout();

        OrdersUI.updateParentHeader('wizard', stepNum);
        OrdersUI.state.currentStep = stepNum;
    },

    nextStep: () => WizardLogic.goToStep(OrdersUI.state.currentStep + 1),

    toggleProductSelection: (id) => {
        const set = OrdersUI.state.selectedProductIds;
        if (set.has(id)) set.delete(id);
        else set.add(id);
        OrdersUI.renderStep1();
    },

    updateNextButtonState: () => {
        const btn = document.getElementById('btn-next-1');
        if (!btn) return;
        if (OrdersUI.state.selectedProductIds.size > 0) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    },

    adjustQty: (id, delta) => {
        const input = document.getElementById(`qty-${id}`);
        if (!input) return;
        let val = parseInt(input.value) || 1;
        val += delta;
        if (val < 1) val = 1;
        input.value = val;
    },

    // --- NUEVO: Selección con Precio Dinámico ---
    selectVariantForProduct: (prodId, variantName, variantId, variantPrice, btnElement) => {
        const allBtns = document.querySelectorAll(`.variant-btn-${prodId}`);
        allBtns.forEach(b => {
            b.classList.remove('variant-selected', 'border-[#39FF14]');
            b.classList.add('border-zinc-700', 'text-zinc-400');
        });
        btnElement.classList.remove('border-zinc-700', 'text-zinc-400');
        btnElement.classList.add('variant-selected');

        // Actualizar datos en la tarjeta
        const card = document.getElementById(`config-card-${prodId}`);
        if (card) {
            card.dataset.selectedVariantId = variantId;
            card.dataset.selectedVariantName = variantName;
            card.dataset.finalPrice = variantPrice; // Guardamos el precio específico
            card.classList.remove('border-red-500');

            // Actualizar visualmente el precio en la tarjeta
            const priceDisplay = document.getElementById(`price-display-${prodId}`);
            if (priceDisplay) {
                priceDisplay.innerText = Utils.formatCurrency(variantPrice);
                // Animación sutil
                priceDisplay.classList.add('text-white', 'scale-110');
                setTimeout(() => priceDisplay.classList.remove('text-white', 'scale-110'), 200);
            }
        }
    },

    validateStep2: () => {
        const cards = document.querySelectorAll('.product-config-card');
        let isValid = true;
        let firstError = null;

        cards.forEach(card => {
            const hasVariants = card.dataset.hasVariants === 'true';
            const selectedId = card.dataset.selectedVariantId;

            if (hasVariants && (!selectedId || selectedId === 'undefined')) {
                isValid = false;
                card.classList.add('border-red-500', 'animate-pulse');
                setTimeout(() => card.classList.remove('animate-pulse'), 1000);
                if (!firstError) firstError = card;
            }
        });

        if (!isValid) {
            Utils.notify("Faltan variantes por seleccionar", "error");
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return isValid;
    },

    buildCartFromStep2: () => {
        CartManager.cart = [];
        const cards = document.querySelectorAll('.product-config-card');

        cards.forEach(card => {
            const id = parseInt(card.dataset.id);
            const p = OrdersUI.state.products.find(x => x.id === id);
            const qty = parseInt(document.getElementById(`qty-${id}`).value) || 1;
            const variantId = card.dataset.selectedVariantId || null;
            const variantName = card.dataset.selectedVariantName || (p.product_colors?.length > 0 ? null : 'N/A');

            // USAR EL PRECIO SELECCIONADO (Si hay variante, se usó el data-final-price)
            // Si no hay variante, se usó el default en renderStep2
            const finalUnitPrice = parseFloat(card.dataset.finalPrice) || (p.sale_price || p.base_price);

            if (p.product_colors?.length > 0 && !variantName) return;

            CartManager.cart.push({
                uniqueId: Date.now() + Math.random(),
                productId: id,
                name: p.name,
                basePrice: finalUnitPrice, // Aquí va el precio correcto
                qty: qty,
                variantName: variantName,
                variantId: variantId
            });
        });
    }
};

const CartManager = {
    cart: [],

    renderReviewTable: () => {
        const container = document.getElementById('step3-cart-list');
        if (!container) return;

        if (CartManager.cart.length === 0) {
            container.innerHTML = '<div class="text-center p-10 text-zinc-500 font-mono text-xs">CARRITO VACÍO</div>';
            document.getElementById('step3-subtotal').innerText = "$0";
            return;
        }

        let subtotal = 0;
        container.innerHTML = CartManager.cart.map(item => {
            const total = item.basePrice * item.qty;
            subtotal += total;
            return `
            <div class="bg-zinc-950 border border-zinc-800 p-3 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                <div class="flex items-center gap-4">
                    <button onclick="CartManager.removeItem(${item.uniqueId})" class="text-zinc-600 hover:text-red-500 transition-colors"><i class="ph-fill ph-minus-circle text-xl"></i></button>
                    <div>
                        <div class="text-sm font-bold text-white uppercase tracking-tight">${item.name}</div>
                        <div class="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-2">
                            <span class="text-zinc-400">${item.qty} x ${Utils.formatCurrency(item.basePrice)}</span>
                            ${item.variantName !== 'N/A' ? `<span class="bg-zinc-800 text-[#39FF14] px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border border-zinc-700">${item.variantName}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="text-[#39FF14] font-mono font-bold">${Utils.formatCurrency(total)}</div>
            </div>`;
        }).join('');

        const subEl = document.getElementById('step3-subtotal');
        if (subEl) subEl.innerText = Utils.formatCurrency(subtotal);
    },

    removeItem: (uid) => {
        CartManager.cart = CartManager.cart.filter(x => x.uniqueId !== uid);
        CartManager.renderReviewTable();
    },

    clearAll: () => {
        showConfirmModal("¿Eliminar todos los items?", () => {
            CartManager.cart = [];
            WizardLogic.goToStep(1);
        });
    },

    prepareCheckout: () => {
        const subtotal = CartManager.cart.reduce((s, i) => s + (i.basePrice * i.qty), 0);
        const suggEl = document.getElementById('suggested-total');
        if (suggEl) suggEl.innerText = Utils.formatCurrency(subtotal);

        const inputTotal = document.getElementById('final-total');
        // Solo prellenar si está vacío para permitir edición
        if (inputTotal && !inputTotal.value) inputTotal.value = subtotal;

        CartManager.recalcFinal();
    },

    recalcFinal: () => {
        const inputTotal = document.getElementById('final-total');
        if (!inputTotal) return;

        const manualTotal = parseFloat(inputTotal.value) || 0;
        const subtotalCatalog = CartManager.cart.reduce((s, i) => s + (i.basePrice * i.qty), 0);

        const baseProfit = subtotalCatalog * 0.30;
        const diff = manualTotal - subtotalCatalog;
        const totalProfit = manualTotal > 0 ? (baseProfit + diff) : 0;

        const profitEl = document.getElementById('final-profit');
        if (profitEl) profitEl.value = Math.round(totalProfit);

        const diffEl = document.getElementById('profit-diff');
        if (diffEl) {
            diffEl.innerText = (diff >= 0 ? '+' : '') + Utils.formatCurrency(diff);
            diffEl.className = diff >= 0 ? "text-[#39FF14] font-mono" : "text-red-500 font-mono";
        }
    },

    submitOrder: async () => {
        const total = parseFloat(document.getElementById('final-total').value);
        if (!total || total <= 0) return Utils.notify("Monto inválido", "error");

        const btn = document.getElementById('btn-submit-order');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "PROCESANDO...";

        try {
            const supabase = window.supabaseClient;

            // 1. Crear Orden (USANDO MASTER_USER_ID)
            const { data: order, error } = await supabase.from('orders').insert([{
                user_id: MASTER_USER_ID, // <--- CAMBIO AQUÍ
                total_amount: total,
                total_profit: parseFloat(document.getElementById('final-profit').value) || 0,
                status: 'paid',
                payment_method: 'cash_pos',
                shipping_address: {},
                guest_info: document.getElementById('final-client').value || "CONSUMIDOR FINAL",
                order_source: 'manual_pos'
            }]).select().single();

            if (error) throw error;

            const factor = (CartManager.cart.reduce((s, i) => s + i.basePrice * i.qty, 0) || 1);
            const ratio = total / factor;

            for (const item of CartManager.cart) {
                await supabase.from('order_items').insert({
                    order_id: order.id,
                    product_id: item.productId,
                    quantity: item.qty,
                    unit_price: item.basePrice * ratio,
                    subtotal: (item.basePrice * item.qty) * ratio,
                    selected_color: item.variantName === 'N/A' ? null : item.variantName,
                    selected_size: 'ÚNICA'
                });

                const { data: prod } = await supabase.from('products').select('stock_quantity').eq('id', item.productId).single();
                if (prod) {
                    await supabase.from('products').update({
                        stock_quantity: Math.max(0, prod.stock_quantity - item.qty)
                    }).eq('id', item.productId);
                }
            }

            Utils.notify(`Venta #${order.id} Registrada`, "success");
            OrdersUI.switchView('home');

            // Limpiar formulario final
            document.getElementById('final-total').value = '';
            document.getElementById('final-client').value = '';
            document.getElementById('final-profit').value = '';

        } catch (e) {
            console.error(e);
            Utils.notify("Error: " + e.message, "error");
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }
};