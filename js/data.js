// ============================================================
// DATA LAYER - Handles localStorage operations
// ============================================================

const STORAGE_KEY = 'susu_pinhin_data';

// Default data structure
function getDefaultData() {
    return {
        customers: [],
        transactions: [] // { id, customerId, date, type: 'cashIn'|'cashOut', amount, pbNumber, receivedBy, issuedBy }
    };
}

// Load data from localStorage
function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.customers && parsed.transactions) {
                return parsed;
            }
        }
    } catch (_) { /* ignore */ }
    return getDefaultData();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateBadges();
    updateDashboard();
}

// Global data object
let data = loadData();
let nextId = getNextId();

async function hydrateCloudData() {
    if (!cloudReady() || !isAuthenticated()) return;
    const customerQuery = supabaseClient.from('customers').select('id, name, next_of_kin, phone, created_at').order('name');
    const transactionQuery = supabaseClient.from('transactions').select('id, date, type, pb_number, customer_id, amount, staff_id, created_at').order('date', { ascending: false });
    const [{ data: customers, error: customerError }, { data: transactions, error: transactionError }] = await Promise.all([customerQuery, transactionQuery]);
    if (customerError) throw customerError;
    if (transactionError) throw transactionError;
    data = {
        customers: (customers || []).map(customer => ({ id: customer.id, name: customer.name, nextOfKin: customer.next_of_kin, phone: customer.phone, createdAt: customer.created_at })),
        transactions: (transactions || []).map(transaction => ({ id: transaction.id, date: transaction.date, type: transaction.type, pbNumber: transaction.pb_number, customerId: transaction.customer_id, amount: Number(transaction.amount), staffId: transaction.staff_id, createdAt: transaction.created_at }))
    };
    nextId = getNextId();
}

async function cloudAddCustomer(customer) {
    const { data: created, error } = await supabaseClient.from('customers').insert({ name: customer.name, next_of_kin: customer.nextOfKin, phone: customer.phone }).select('id, name, next_of_kin, phone, created_at').single();
    if (error) throw error;
    return { id: created.id, name: created.name, nextOfKin: created.next_of_kin, phone: created.phone, createdAt: created.created_at };
}

async function cloudAddTransaction(transaction) {
    const { data: created, error } = await supabaseClient.rpc('record_transaction', { p_date: transaction.date, p_type: transaction.type, p_pb_number: transaction.pbNumber, p_customer_id: transaction.customerId, p_amount: transaction.amount });
    if (error) throw error;
    return { id: created.id, date: created.date, type: created.type, pbNumber: created.pb_number, customerId: created.customer_id, amount: Number(created.amount), staffId: created.staff_id, createdAt: created.created_at };
}

// Get next available ID
function getNextId() {
    const allIds = [
        ...data.customers.map(c => c.id || 0),
        ...data.transactions.map(t => t.id || 0)
    ];
    return Math.max(0, ...allIds) + 1;
}

// Generate new ID
function genId() {
    const id = nextId;
    nextId++;
    return id;
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getCustomerName(id) {
    const c = data.customers.find(c => c.id === id);
    return c ? c.name : 'Unknown';
}

function getCustomerBalance(customerId) {
    const ins = data.transactions.filter(t => t.customerId === customerId && t.type === 'cashIn');
    const outs = data.transactions.filter(t => t.customerId === customerId && t.type === 'cashOut');
    const totalIn = ins.reduce((s, t) => s + Number(t.amount), 0);
    const totalOut = outs.reduce((s, t) => s + Number(t.amount), 0);
    return totalIn - totalOut;
}

function getCustomerTotals(customerId) {
    const ins = data.transactions.filter(t => t.customerId === customerId && t.type === 'cashIn');
    const outs = data.transactions.filter(t => t.customerId === customerId && t.type === 'cashOut');
    return {
        totalIn: ins.reduce((s, t) => s + Number(t.amount), 0),
        totalOut: outs.reduce((s, t) => s + Number(t.amount), 0)
    };
}

function getTotalCashIn() {
    return data.transactions.filter(t => t.type === 'cashIn').reduce((s, t) => s + Number(t.amount), 0);
}

function getTotalCashOut() {
    return data.transactions.filter(t => t.type === 'cashOut').reduce((s, t) => s + Number(t.amount), 0);
}

function getNetBalance() {
    return getTotalCashIn() - getTotalCashOut();
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
        type === 'warning' ? 'fa-triangle-exclamation' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}