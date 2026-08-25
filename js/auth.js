// ============================================================
// AUTHENTICATION - Local role-based access for the browser app
// ============================================================

const AUTH_STORAGE_KEY = 'susu_pinhin_auth';
const SESSION_STORAGE_KEY = 'susu_pinhin_session';
let authStore = loadAuthStore();
let currentUser = loadSession();

function loadAuthStore() {
    try {
        const parsed = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
        return { users: Array.isArray(parsed.users) ? parsed.users : [] };
    } catch (_) {
        return { users: [] };
    }
}

function saveAuthStore() {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authStore));
}

function loadSession() {
    try {
        const session = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || 'null');
        return session && session.id ? session : null;
    } catch (_) {
        return null;
    }
}

function getCurrentUser() {
    return currentUser;
}

function isManager() {
    return Boolean(currentUser && currentUser.role === 'manager');
}

function isAuthenticated() {
    return Boolean(currentUser);
}

async function hashPassword(password) {
    const bytes = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function makeUserId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function setSession(user) {
    currentUser = { id: user.id, name: user.name, username: user.username, role: user.role };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
}

function clearSession() {
    currentUser = null;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function requireAuth() {
    if (!isAuthenticated()) {
        showAuthScreen('login');
        return false;
    }
    return true;
}

function requireManager() {
    if (!isManager()) {
        showToast('Manager access is required for this action.', 'error');
        return false;
    }
    return true;
}

function getStaffUsers() {
    return authStore.users.filter(user => user.role === 'staff' && user.active !== false);
}

function getAllStaffUsers() {
    return authStore.users.filter(user => user.role === 'staff');
}

function showAuthScreen(mode) {
    const screen = document.getElementById('authScreen');
    if (!screen) return;
    screen.classList.add('visible');
    document.body.classList.add('auth-locked');
    setAuthMode(mode);
}

function hideAuthScreen() {
    const screen = document.getElementById('authScreen');
    if (screen) screen.classList.remove('visible');
    document.body.classList.remove('auth-locked');
}

function setAuthMode(mode) {
    const setup = mode === 'setup';
    document.getElementById('authTitle').textContent = setup ? 'Create manager account' : 'Welcome back';
    document.getElementById('authSubtitle').textContent = setup
        ? 'Set up the first account for this F EMMANUEL 85 VENTURES workspace.'
        : 'Sign in to continue to your workspace.';
    document.getElementById('authSubmit').textContent = setup ? 'Create manager account' : 'Sign in';
    document.getElementById('authNameGroup').hidden = !setup;
    document.getElementById('authSwitch').hidden = setup;
    document.getElementById('authMode').value = mode;
}

async function submitAuth(event) {
    event.preventDefault();
    const mode = document.getElementById('authMode').value;
    const name = document.getElementById('authName').value.trim();
    const username = document.getElementById('authUsername').value.trim().toLowerCase();
    const password = document.getElementById('authPassword').value;
    const button = document.getElementById('authSubmit');

    if (!username || password.length < 6 || (mode === 'setup' && !name)) {
        showAuthMessage('Enter all required details. Passwords must be at least 6 characters.');
        return;
    }

    button.disabled = true;
    try {
        const passwordHash = await hashPassword(password);
        if (mode === 'setup') {
            if (authStore.users.some(user => user.role === 'manager')) {
                setAuthMode('login');
                showAuthMessage('A manager account already exists. Please sign in.');
                return;
            }
            const manager = { id: makeUserId(), name, username, passwordHash, role: 'manager', active: true, createdAt: todayStr() };
            authStore.users.push(manager);
            saveAuthStore();
            setSession(manager);
            enterApp();
            showToast('Manager account created.', 'success');
        } else {
            const user = authStore.users.find(candidate => candidate.username === username && candidate.active !== false);
            if (!user || user.passwordHash !== passwordHash) {
                showAuthMessage('Incorrect username or password.');
                return;
            }
            setSession(user);
            enterApp();
        }
    } finally {
        button.disabled = false;
    }
}

function showAuthMessage(message) {
    const messageEl = document.getElementById('authMessage');
    if (messageEl) messageEl.textContent = message;
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    button.setAttribute('title', isHidden ? 'Hide password' : 'Show password');
    const icon = button.querySelector('i');
    if (icon) icon.className = `fas fa-eye${isHidden ? '-slash' : ''}`;
}

function enterApp() {
    hideAuthScreen();
    applyRoleAccess();
    updateUserIdentity();
    renderAll();
    navigate('dashboard');
}

function logout() {
    clearSession();
    document.querySelectorAll('.modal-overlay.open').forEach(modal => modal.classList.remove('open'));
    showAuthScreen('login');
    showAuthMessage('You have been signed out.');
}

function updateUserIdentity() {
    if (!currentUser) return;
    const name = document.querySelector('.sidebar-footer .name');
    const role = document.querySelector('.sidebar-footer .role');
    const avatar = document.querySelector('.sidebar-footer .avatar');
    if (name) name.textContent = currentUser.name;
    if (role) role.textContent = currentUser.role === 'manager' ? 'Manager access' : 'Staff access';
    if (avatar) avatar.textContent = currentUser.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function applyRoleAccess() {
    const managerOnly = document.querySelectorAll('[data-manager-only]');
    managerOnly.forEach(element => { element.hidden = !isManager(); });
    const staffOnly = document.querySelectorAll('[data-staff-only]');
    staffOnly.forEach(element => { element.hidden = isManager(); });
}

function addStaff(event) {
    event.preventDefault();
    if (!requireManager()) return;
    const name = document.getElementById('staffName').value.trim();
    const username = document.getElementById('staffUsername').value.trim().toLowerCase();
    const password = document.getElementById('staffPassword').value;
    if (!name || !username || password.length < 6) {
        showToast('Enter a name, username, and password of at least 6 characters.', 'error');
        return;
    }
    if (authStore.users.some(user => user.username === username)) {
        showToast('That username is already in use.', 'error');
        return;
    }
    hashPassword(password).then(passwordHash => {
        authStore.users.push({ id: makeUserId(), name, username, passwordHash, role: 'staff', active: true, createdAt: todayStr() });
        saveAuthStore();
        event.target.reset();
        renderStaff();
        populateStaffDropdowns();
        closeModal('staffModal');
        showToast(`Staff account for ${name} created.`, 'success');
    });
}

function removeStaff(id) {
    if (!requireManager()) return;
    const staff = authStore.users.find(user => user.id === id && user.role === 'staff');
    if (!staff || !confirm(`Remove staff access for ${staff.name}?`)) return;
    staff.active = false;
    saveAuthStore();
    renderStaff();
    populateStaffDropdowns();
    showToast(`${staff.name} no longer has access.`, 'warning');
}

function renderStaff() {
    const body = document.getElementById('staffTableBody');
    const label = document.getElementById('staffTotalLabel');
    if (!body || !label) return;
    const staff = getAllStaffUsers();
    label.textContent = `${staff.filter(user => user.active !== false).length} active staff`;
    if (!staff.length) {
        body.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-user-shield"></i><h3>No staff accounts</h3><p>Add staff members who can record transactions.</p></div></td></tr>';
        return;
    }
    body.innerHTML = staff.map(user => `<tr><td><strong>${escapeHtml(user.name)}</strong></td><td>${escapeHtml(user.username)}</td><td><span class="badge-status ${user.active === false ? 'out' : 'in'}">${user.active === false ? 'Removed' : 'Active'}</span></td><td style="text-align:center;">${user.active === false ? '—' : `<button class="btn btn-danger btn-xs" onclick="removeStaff('${user.id}')"><i class="fas fa-user-minus"></i> Remove</button>`}</td></tr>`).join('');
}

function populateStaffDropdowns() {
    const staff = isManager() ? getStaffUsers() : (currentUser ? [currentUser] : []);
    ['cashinReceivedBy', 'cashoutIssuedBy'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '<option value="">— Select staff member —</option>';
        staff.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.textContent = user.name;
            select.appendChild(option);
        });
        if (staff.some(user => user.name === currentValue)) select.value = currentValue;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (isAuthenticated()) enterApp();
    else showAuthScreen(authStore.users.some(user => user.role === 'manager') ? 'login' : 'setup');
});
