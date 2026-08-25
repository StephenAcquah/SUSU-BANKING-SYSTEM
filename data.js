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