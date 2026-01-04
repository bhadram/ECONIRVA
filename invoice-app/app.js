// ECONIRVA Invoice Management System - Application Logic
// This version adds migration from localStorage to IndexedDB using localForage,
// and an async storage layer (storageGet/storageSet/storageRemove).
// After migration the app continues to use the same global variables and functions.

// ---------- storage helpers ----------
async function storageGet(key) {
  // If localforage is available, use it (IndexedDB wrapper). Otherwise fall back to localStorage.
  if (window.localforage) {
    try {
      const v = await localforage.getItem(key);
      return v === null ? null : v;
    } catch (e) {
      console.warn('localforage.getItem failed for', key, e);
      // fallback to localStorage parsing
    }
  }
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try { return JSON.parse(raw); } catch (e) { return raw; }
}

async function storageSet(key, value) {
  if (window.localforage) {
    try {
      await localforage.setItem(key, value);
      return;
    } catch (e) {
      console.warn('localforage.setItem failed for', key, e);
      // fallback to localStorage
    }
  }
  localStorage.setItem(key, JSON.stringify(value));
}

async function storageRemove(key) {
  if (window.localforage) {
    try {
      await localforage.removeItem(key);
      return;
    } catch (e) {
      console.warn('localforage.removeItem failed for', key, e);
    }
  }
  localStorage.removeItem(key);
}

// ---------- migration ----------
async function migrateToIndexedDB() {
  if (!window.localforage) return;
  const keys = [
    'econirva_user',
    'econirva_users',
    'econirva_customers',
    'econirva_products',
    'econirva_invoices',
    'econirva_settings'
  ];
  for (const k of keys) {
    try {
      const exists = await localforage.getItem(k);
      if (exists === null) {
        const raw = localStorage.getItem(k);
        if (raw !== null) {
          let parsed = null;
          try { parsed = JSON.parse(raw); } catch (e) { parsed = raw; }
          await localforage.setItem(k, parsed);
          console.log('[migrate] migrated', k);
          // optional: keep localStorage copy for safety, or remove it
          // localStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.warn('[migrate] failed for', k, e);
    }
  }
}

// ---------- initialization (async) ----------
(async function initApp() {
  try {
    // Wait a tick for localforage script to load if present on the page
    // (index.html includes the CDN <script> before app.js)
    if (window.localforage) {
      // optional localforage config
      localforage.config({
        name: 'econirva',
        storeName: 'econirva_store'
      });
    }

    await migrateToIndexedDB();

    // Load essential data from storage
    const currentUser = await storageGet('econirva_user');
    // Redirect to login if not authenticated and not on login page
    if (!currentUser && !window.location.href.includes('login.html')) {
      window.location.href = 'login.html';
      return;
    }

    // Make globals (same names as earlier app expected)
    window.currentUser = currentUser;
    window.customers = (await storageGet('econirva_customers')) || [];
    window.products = (await storageGet('econirva_products')) || [];
    window.invoices = (await storageGet('econirva_invoices')) || [];
    window.settings = (await storageGet('econirva_settings')) || getDefaultSettings();
    window._storedUsers = (await storageGet('econirva_users')) || null;

    // Boot the UI
    document.addEventListener('DOMContentLoaded', () => {
      showUserInfo();
      refreshDashboard();
      refreshCustomersTable();
      refreshProductsTable();
      refreshInvoicesTable();
      loadSettings();
      loadUsers();
    });
  } catch (e) {
    console.error('Initialization failed:', e);
  }
})();

// ---------- existing app code (slightly modified to use storageSet/saveData) ----------

// Replace direct localStorage.saveData with async storageSet usage
async function saveData() {
  try {
    await storageSet('econirva_customers', customers);
    await storageSet('econirva_products', products);
    await storageSet('econirva_invoices', invoices);
    await storageSet('econirva_settings', settings);
  } catch (e) {
    console.warn('saveData failed', e);
  }
}

// The rest of the app code (UI helpers, users management, invoices logic) remains the same,
// but anytime the original version used localStorage.setItem/getItem/removeItem for the app data,
// it should now use storageSet/storageGet/storageRemove (we loaded data into globals above and
// saveData uses storageSet). For users list and current user objects we use the same keys:
// 'econirva_users' and 'econirva_user' — make sure to call storageSet('econirva_users', users)
// or storageRemove('econirva_user') when logging out.

// Example edits (apply these patterns throughout the app where applicable):
// - When adding a new user: await storageSet('econirva_users', users);
// - On logout: await storageRemove('econirva_user'); window.location.href = 'login.html';
// - When saving settings: call saveData() (above) which writes to IndexedDB/localForage.

// NOTE: For readability this file includes only the migration and storage layer plus saveData.
// Keep the rest of your app's functions (addNewUser, loadUsers, saveInvoice, etc.) as-is,
// but update any direct localStorage writes to use storageSet/saveData as demonstrated above.

// ---------- small helpers to show how to update save points ----------

// Example: update addNewUser to persist users via storageSet
async function addNewUser() {
  const nameEl = document.getElementById('new-user-name');
  const emailEl = document.getElementById('new-user-email');
  const passwordEl = document.getElementById('new-user-password');
  const roleEl = document.getElementById('new-user-role');
  if (!nameEl || !emailEl || !passwordEl || !roleEl) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim().toLowerCase();
  const password = passwordEl.value;
  const role = roleEl.value;

  if (!name || !email || !password) {
    alert('Please fill all fields');
    return;
  }

  // load current users from storage (use cached global if available)
  let users = window._storedUsers || (await storageGet('econirva_users')) || [];
  if (users.find(u => u.email.toLowerCase() === email)) {
    alert('User with this email already exists');
    return;
  }

  users.push({ name, email, password, role });
  await storageSet('econirva_users', users);
  window._storedUsers = users;

  // clear and refresh UI
  nameEl.value = '';
  emailEl.value = '';
  passwordEl.value = '';
  roleEl.value = 'user';
  loadUsers();
  alert('User added successfully!');
}

// Example: logout uses storageRemove
async function logout() {
  await storageRemove('econirva_user');
  window.location.href = 'login.html';
}

// When you call saveData() elsewhere (e.g., after saving products/customers/invoices), it will persist to IndexedDB.

// ---------- End of app.js (migration-focused) ----------
