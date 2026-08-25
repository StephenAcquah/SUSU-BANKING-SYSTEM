// ============================================================
// CUSTOMERS CRUD
// ============================================================

function openCustomerModal(customerId) {
    if (!requireManager()) return;
    const modal = document.getElementById('customerModal');
    const form = document.getElementById('customerForm');
    form.reset();
    document.getElementById('customerEditId').value = '';
    document.getElementById('customerModalTitle').innerHTML = '<i class="fas fa-user"></i> Add Customer';

    if (customerId) {
        const c = data.customers.find(c => c.id === customerId);
        if (c) {
            document.getElementById('customerEditId').value = c.id;
            document.getElementById('customerName').value = c.name || '';
            document.getElementById('customerNextOfKin').value = c.nextOfKin || '';
            document.getElementById('customerPhone').value = c.phone || '';
            document.getElementById('customerModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit Customer';
        }
    }
    openModal('customerModal');
}

function saveCustomer(e) {
    e.preventDefault();
    if (!requireManager()) return;
    const id = document.getElementById('customerEditId').value;
    const name = document.getElementById('customerName').value.trim();
    const nextOfKin = document.getElementById('customerNextOfKin').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();

    if (!name) {
        showToast('Customer name is required.', 'error');
        return;
    }

    if (id) {
        const existing = data.customers.find(c => c.id === Number(id));
        if (existing) {
            existing.name = name;
            existing.nextOfKin = nextOfKin;
            existing.phone = phone;
            showToast('Customer updated successfully.', 'success');
        }
    } else {
        data.customers.push({
            id: genId(),
            name,
            nextOfKin,
            phone,
            createdAt: todayStr()
        });
        showToast(`Customer "${name}" added.`, 'success');
    }

    saveData();
    closeModal('customerModal');
    renderCustomers();
    updateDashboard();
    populateCustomerDropdowns();
}

function deleteCustomer(id) {
    if (!requireManager()) return;
    const c = data.customers.find(c => c.id === id);
    if (!c) return;
    if (!confirm(`Delete customer "${c.name}"? This will NOT delete their transactions.`)) return;
    data.customers = data.customers.filter(c => c.id !== id);
    saveData();
    renderCustomers();
    updateDashboard();
    populateCustomerDropdowns();
    showToast(`Customer "${c.name}" removed.`, 'warning');
}

function renderCustomers() {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;
    
    const search = document.getElementById('customerSearch')?.value?.toLowerCase().trim() || '';

    let filtered = data.customers;
    if (search) {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(search) ||
            (c.phone && c.phone.includes(search))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6">
                <div class="empty-state" style="padding:32px 20px;">
                    <i class="fas fa-user-slash"></i>
                    <h3>No customers found</h3>
                    <p>Add your first customer to get started.</p>
                </div>
            </td></tr>
        `;
        const label = document.getElementById('customerTotalLabel');
        if (label) label.textContent = '0 customers';
        return;
    }

    let html = '';
    filtered.forEach((c, idx) => {
        const balance = getCustomerBalance(c.id);
        html += `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td>${escapeHtml(c.nextOfKin || '—')}</td>
                <td>${escapeHtml(c.phone || '—')}</td>
                <td class="${balance >= 0 ? 'text-success' : 'text-danger'} fw-600">
                    GH₵ ${balance.toFixed(2)}
                </td>
                <td style="text-align:center;">
                    ${isManager() ? `<button class="btn btn-outline btn-xs" onclick="openCustomerModal(${c.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-xs" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>` : '—'}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    const label = document.getElementById('customerTotalLabel');
    if (label) label.textContent = `${filtered.length} customers`;
}

function filterCustomers() {
    renderCustomers();
}

function refreshCustomers() {
    const search = document.getElementById('customerSearch');
    if (search) search.value = '';
    renderCustomers();
}

function populateCustomerDropdowns() {
    const selects = ['cashinCustomer', 'cashoutCustomer'];
    selects.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">— Select Customer —</option>';
        data.customers.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            sel.appendChild(opt);
        });
        if (currentVal && data.customers.some(c => c.id === Number(currentVal))) {
            sel.value = currentVal;
        }
    });
}