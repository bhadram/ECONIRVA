// ECONIRVA Invoice Management System - Application Logic

// Auth Check - Redirect to login if not logged in
const currentUser = JSON.parse(localStorage.getItem('econirva_user'));
if (!currentUser && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
}

// Logout function
function logout() {
    localStorage.removeItem('econirva_user');
    window.location.href = 'login.html';
}

// Show user info in top bar
function showUserInfo() {
    const userEmail = document.getElementById('user-email');
    if (userEmail && currentUser) {
        userEmail.innerHTML = `👤 ${currentUser.email}`;
    }
}

// Get current user name for invoice
function getCurrentUserName() {
    return currentUser ? (currentUser.name || currentUser.email.split('@')[0]) : 'Admin';
}

// ============== USER MANAGEMENT ==============
function getUsers() {
    let users = JSON.parse(localStorage.getItem('econirva_users') || 'null');
    if (!users) {
        users = [
            { email: 'vbhadram', password: 'econirva@123', name: 'Bhadram Varka', role: 'admin' }
        ];
        localStorage.setItem('econirva_users', JSON.stringify(users));
    }
    return users;
}

function loadUsers() {
    const users = getUsers();
    const container = document.getElementById('users-list');
    if (!container) return;
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map((user, index) => `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td><span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}">${user.role}</span></td>
                        <td>
                            <button class="btn-icon delete-user-btn" data-index="${index}" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // Attach delete events
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.onclick = function() {
            deleteUser(parseInt(this.dataset.index));
        };
    });
    
    // Attach add user button
    const addBtn = document.getElementById('add-user-btn');
    if (addBtn) {
        addBtn.onclick = addNewUser;
    }
}

function addNewUser() {
    const name = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim().toLowerCase();
    const password = document.getElementById('new-user-password').value;
    const role = document.getElementById('new-user-role').value;
    
    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email)) {
        alert('User with this email already exists');
        return;
    }
    
    users.push({ name, email, password, role });
    localStorage.setItem('econirva_users', JSON.stringify(users));
    
    // Clear form
    document.getElementById('new-user-name').value = '';
    document.getElementById('new-user-email').value = '';
    document.getElementById('new-user-password').value = '';
    document.getElementById('new-user-role').value = 'user';
    
    loadUsers();
    alert('User added successfully!');
}

function deleteUser(index) {
    const users = getUsers();
    
    // Prevent deleting last admin
    const admins = users.filter(u => u.role === 'admin');
    if (users[index].role === 'admin' && admins.length === 1) {
        alert('Cannot delete the last admin user');
        return;
    }
    
    // Prevent deleting yourself
    if (currentUser && users[index].email.toLowerCase() === currentUser.email.toLowerCase()) {
        alert('Cannot delete your own account');
        return;
    }
    
    if (confirm(`Delete user ${users[index].name}?`)) {
        users.splice(index, 1);
        localStorage.setItem('econirva_users', JSON.stringify(users));
        loadUsers();
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', showUserInfo);

// Data Storage
let customers = JSON.parse(localStorage.getItem('econirva_customers')) || [];
let products = JSON.parse(localStorage.getItem('econirva_products')) || [];
let invoices = JSON.parse(localStorage.getItem('econirva_invoices')) || [];
let settings = JSON.parse(localStorage.getItem('econirva_settings')) || getDefaultSettings();

function getDefaultSettings() {
    return {
        companyName: 'ECONIRVA BIO SOLUTIONS PRIVATE LIMITED',
        gstin: '36AAJCE0856C1ZU',
        address: 'Flat No B-523, Block B, Kismatpur Road, The ART by Giridhari Home, Bandlaguda Jagir, Hyderabad, 500086 Telangana, India',
        email: 'econirva@gmail.com',
        phone: '7578007116',
        state: 'Telangana',
        stateCode: '36',
        bankName: 'Kotak Bank',
        bankAccount: '8946970807',
        bankIfsc: 'KKBK0000560',
        bankHolder: 'ECONIRVA BIO SOLUTIONS PRIVATE LIMITED',
        bankUpi: '7578007116',
        invoiceNumberFormat: 'financial_year', // 'financial_year', 'date_based', 'sequential', 'custom'
        invoicePrefix: 'INV',
        nextInvoiceNum: 1,
        lastFinancialYear: getCurrentFinancialYear(),
        defaultGst: 5,
        defaultTerms: 'Advance',
        termsConditions: `1. Above Prices are for White Carry Bags.
2. No of Pieces Per Kg May vary +/- 2 to 5 Pieces depends per size.
3. No of Kg's for Each size may vary by +/-5 - 8 Kgs irrespective of your Order Quantities.
4. Kindly Provide us the Sample Bag for Printing reference or else we will proceed as per your description of Colors to be printed on bags.
5. Delivery Time Period will be of 7 Days depends on Order Quantity.
6. Payment Terms: 50% Advance to be Paid along with Purchase order and Balance 50% will be paid at the time of Dispatch.
7. Transportation Price Extra. (Not Included)
8. Goods once sold cannot be taken back. (Except Sealing Issues, which should be report within 72 Hrs)
9. Any Typographical or Clerical Errors are subject to Correction.
10. Any dispute regarding the above will be subject to Jurisdiction of Hyderabad, Telangana.`
    };
}

// Initialize default products if empty
if (products.length === 0) {
    products = [
        { id: 1, name: '10 X 12 Carry Bags (Compostable Products)', hsn: '39232990', rate: 128, unit: 'kg', gst: 5 },
        { id: 2, name: '11 X 14 Carry Bags (Compostable Products)', hsn: '39232990', rate: 128, unit: 'kg', gst: 5 },
        { id: 3, name: '13 X 16 Carry Bags (Compostable Products)', hsn: '39232990', rate: 128, unit: 'kg', gst: 5 },
        { id: 4, name: '16 X 20 Carry Bags (Compostable Products)', hsn: '39232990', rate: 128, unit: 'kg', gst: 5 },
        { id: 5, name: '10 X 12 Carry Bags (High Strength)', hsn: '39232990', rate: 162, unit: 'kg', gst: 5 },
        { id: 6, name: '11 X 14 Carry Bags (High Strength)', hsn: '39232990', rate: 162, unit: 'kg', gst: 5 },
        { id: 7, name: '13 X 16 Carry Bags (High Strength)', hsn: '39232990', rate: 162, unit: 'kg', gst: 5 },
        { id: 8, name: '16 X 20 Carry Bags (High Strength)', hsn: '39232990', rate: 162, unit: 'kg', gst: 5 },
    ];
    saveData();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('econirva_customers', JSON.stringify(customers));
    localStorage.setItem('econirva_products', JSON.stringify(products));
    localStorage.setItem('econirva_invoices', JSON.stringify(invoices));
    localStorage.setItem('econirva_settings', JSON.stringify(settings));
}

// ============== INVOICE NUMBER GENERATION ==============

// Get current Indian financial year (April to March)
function getCurrentFinancialYear() {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    
    // Financial year starts in April (month 3)
    if (month >= 3) { // April onwards
        return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
    } else { // Jan-March belongs to previous FY
        return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
    }
}

// Check and reset sequence for new financial year
function checkFinancialYearReset() {
    const currentFY = getCurrentFinancialYear();
    if (settings.lastFinancialYear !== currentFY) {
        settings.lastFinancialYear = currentFY;
        settings.nextInvoiceNum = 1;
        saveData();
        console.log(`Financial year changed to ${currentFY}. Invoice sequence reset to 001.`);
    }
}

// Generate invoice number based on selected format
function generateInvoiceNumber() {
    checkFinancialYearReset();
    
    const num = settings.nextInvoiceNum.toString().padStart(3, '0');
    const prefix = settings.invoicePrefix || 'INV';
    const format = settings.invoiceNumberFormat || 'financial_year';
    
    let invoiceNumber;
    
    switch (format) {
        case 'financial_year':
            // INV/25-26/001
            const fy = getCurrentFinancialYear();
            invoiceNumber = `${prefix}/${fy}/${num}`;
            break;
            
        case 'date_based':
            // INV-20251230-001
            const today = new Date();
            const dateStr = today.getFullYear().toString() +
                (today.getMonth() + 1).toString().padStart(2, '0') +
                today.getDate().toString().padStart(2, '0');
            invoiceNumber = `${prefix}-${dateStr}-${num}`;
            break;
            
        case 'monthly':
            // INV-2025-12-001
            const now = new Date();
            const monthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
            invoiceNumber = `${prefix}-${monthStr}-${num}`;
            break;
            
        case 'sequential':
            // INV-001
            invoiceNumber = `${prefix}-${num}`;
            break;
            
        case 'custom':
            // User-defined pattern
            invoiceNumber = buildCustomInvoiceNumber(num);
            break;
            
        default:
            invoiceNumber = `${prefix}/${getCurrentFinancialYear()}/${num}`;
    }
    
    // Check for duplicates
    if (isInvoiceNumberExists(invoiceNumber)) {
        // Find next available number
        let tempNum = settings.nextInvoiceNum;
        while (isInvoiceNumberExists(invoiceNumber) && tempNum < 99999) {
            tempNum++;
            const newNum = tempNum.toString().padStart(3, '0');
            invoiceNumber = invoiceNumber.replace(/\d{3,}$/, newNum);
        }
        settings.nextInvoiceNum = tempNum;
    }
    
    return invoiceNumber;
}

// Build custom invoice number from pattern
function buildCustomInvoiceNumber(sequenceNum) {
    let pattern = settings.customPattern || '{PREFIX}/{FY}/{NUM}';
    const now = new Date();
    const fy = getCurrentFinancialYear();
    
    const replacements = {
        '{PREFIX}': settings.invoicePrefix || 'INV',
        '{FY}': fy,
        '{YEAR}': now.getFullYear().toString(),
        '{YY}': now.getFullYear().toString().slice(-2),
        '{MONTH}': (now.getMonth() + 1).toString().padStart(2, '0'),
        '{DAY}': now.getDate().toString().padStart(2, '0'),
        '{NUM}': sequenceNum,
        '{NUM4}': sequenceNum.toString().padStart(4, '0'),
        '{NUM5}': sequenceNum.toString().padStart(5, '0')
    };
    
    for (const [key, value] of Object.entries(replacements)) {
        pattern = pattern.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    
    return pattern;
}

// Check if invoice number already exists
function isInvoiceNumberExists(number) {
    return invoices.some(inv => inv.number === number);
}

// Get invoice number gaps (for auditing)
function findInvoiceGaps() {
    const currentFY = getCurrentFinancialYear();
    const fyInvoices = invoices
        .filter(inv => inv.number.includes(currentFY))
        .map(inv => {
            const match = inv.number.match(/(\d{3,})$/);
            return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => a - b);
    
    const gaps = [];
    for (let i = 1; i < fyInvoices.length; i++) {
        const diff = fyInvoices[i] - fyInvoices[i - 1];
        if (diff > 1) {
            for (let j = fyInvoices[i - 1] + 1; j < fyInvoices[i]; j++) {
                gaps.push(j);
            }
        }
    }
    
    return gaps;
}

// Preview what the next invoice number will look like
function previewInvoiceNumber() {
    return generateInvoiceNumber();
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        showPage(page);
    });
});

function showPage(pageName) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${pageName}"]`).classList.add('active');
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageName).classList.add('active');
    
    // Refresh data when switching pages
    if (pageName === 'dashboard') refreshDashboard();
    if (pageName === 'invoices') refreshInvoicesTable();
    if (pageName === 'customers') refreshCustomersTable();
    if (pageName === 'products') refreshProductsTable();
    if (pageName === 'settings') { loadSettings(); loadUsers(); }
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Format Currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Number to Words (Indian format)
function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    function convertToWords(n) {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertToWords(n % 100) : '');
        if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
        if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
        return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
    }
    
    let result = 'Indian Rupee ' + convertToWords(rupees);
    if (paise > 0) {
        result += ' and ' + convertToWords(paise) + ' Paise';
    }
    return result + ' Only';
}

// ============== DASHBOARD ==============
function refreshDashboard() {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const totalCustomers = customers.length;
    
    document.getElementById('total-invoices').textContent = totalInvoices;
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('pending-amount').textContent = formatCurrency(pendingAmount);
    document.getElementById('total-customers').textContent = totalCustomers;
    
    // Recent invoices
    const recentBody = document.getElementById('recent-invoices-body');
    const recent = invoices.slice(-5).reverse();
    
    if (recent.length === 0) {
        recentBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="icon">📄</div>
                    <p>No invoices yet. Create your first invoice!</p>
                </td>
            </tr>
        `;
    } else {
        recentBody.innerHTML = recent.map(inv => `
            <tr>
                <td><strong>${inv.number}</strong></td>
                <td>${inv.customerName}</td>
                <td>${formatDate(inv.date)}</td>
                <td>${formatCurrency(inv.total)}</td>
                <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="previewInvoice(${inv.id})" title="View">👁️</button>
                        <button class="action-btn" onclick="editInvoice(${inv.id})" title="Edit">✏️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// ============== CUSTOMERS ==============
function openCustomerModal(customerId = null) {
    document.getElementById('customer-form').reset();
    document.getElementById('customer-id').value = '';
    document.getElementById('customer-modal-title').textContent = 'Add Customer';
    
    if (customerId) {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            document.getElementById('customer-modal-title').textContent = 'Edit Customer';
            document.getElementById('customer-id').value = customer.id;
            document.getElementById('cust-name').value = customer.name;
            document.getElementById('cust-gstin').value = customer.gstin || '';
            document.getElementById('cust-phone').value = customer.phone || '';
            document.getElementById('cust-email').value = customer.email || '';
            document.getElementById('cust-contact').value = customer.contact || '';
            document.getElementById('cust-address').value = customer.address;
            document.getElementById('cust-city').value = customer.city;
            document.getElementById('cust-state').value = customer.state;
            document.getElementById('cust-state-code').value = customer.stateCode || '';
            document.getElementById('cust-pin').value = customer.pin || '';
            document.getElementById('cust-ship-address').value = customer.shipAddress || '';
        }
    }
    
    openModal('customer-modal');
}

function saveCustomer(event) {
    event.preventDefault();
    
    const customerId = document.getElementById('customer-id').value;
    const customerData = {
        name: document.getElementById('cust-name').value,
        gstin: document.getElementById('cust-gstin').value,
        phone: document.getElementById('cust-phone').value,
        email: document.getElementById('cust-email').value,
        contact: document.getElementById('cust-contact').value,
        address: document.getElementById('cust-address').value,
        city: document.getElementById('cust-city').value,
        state: document.getElementById('cust-state').value,
        stateCode: document.getElementById('cust-state-code').value,
        pin: document.getElementById('cust-pin').value,
        shipAddress: document.getElementById('cust-ship-address').value
    };
    
    if (customerId) {
        const index = customers.findIndex(c => c.id === parseInt(customerId));
        customers[index] = { ...customers[index], ...customerData };
    } else {
        customerData.id = Date.now();
        customers.push(customerData);
    }
    
    saveData();
    closeModal('customer-modal');
    refreshCustomersTable();
    alert('Customer saved successfully!');
}

function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        customers = customers.filter(c => c.id !== customerId);
        saveData();
        refreshCustomersTable();
    }
}

function refreshCustomersTable() {
    const tbody = document.getElementById('customers-body');
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    
    let filtered = customers;
    if (searchTerm) {
        filtered = customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm) ||
            (c.gstin && c.gstin.toLowerCase().includes(searchTerm)) ||
            c.city.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="icon">👥</div>
                    <p>No customers found. Add your first customer!</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filtered.map(c => {
            const orderCount = invoices.filter(inv => inv.customerId === c.id).length;
            return `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.gstin || '-'}</td>
                    <td>${c.phone || '-'}</td>
                    <td>${c.city}</td>
                    <td>${orderCount}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn" onclick="openCustomerModal(${c.id})" title="Edit">✏️</button>
                            <button class="action-btn delete" onclick="deleteCustomer(${c.id})" title="Delete">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

document.getElementById('customer-search').addEventListener('input', refreshCustomersTable);

// ============== PRODUCTS ==============
function openProductModal(productId = null) {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal-title').textContent = 'Add Product';
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('product-modal-title').textContent = 'Edit Product';
            document.getElementById('product-id').value = product.id;
            document.getElementById('prod-name').value = product.name;
            document.getElementById('prod-hsn').value = product.hsn;
            document.getElementById('prod-rate').value = product.rate;
            document.getElementById('prod-unit').value = product.unit;
            document.getElementById('prod-gst').value = product.gst;
            document.getElementById('prod-desc').value = product.description || '';
        }
    }
    
    openModal('product-modal');
}

function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('prod-name').value,
        hsn: document.getElementById('prod-hsn').value,
        rate: parseFloat(document.getElementById('prod-rate').value),
        unit: document.getElementById('prod-unit').value,
        gst: parseFloat(document.getElementById('prod-gst').value),
        description: document.getElementById('prod-desc').value
    };
    
    if (productId) {
        const index = products.findIndex(p => p.id === parseInt(productId));
        products[index] = { ...products[index], ...productData };
    } else {
        productData.id = Date.now();
        products.push(productData);
    }
    
    saveData();
    closeModal('product-modal');
    refreshProductsTable();
    alert('Product saved successfully!');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveData();
        refreshProductsTable();
    }
}

function refreshProductsTable() {
    const tbody = document.getElementById('products-body');
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    
    let filtered = products;
    if (searchTerm) {
        filtered = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.hsn.includes(searchTerm)
        );
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="icon">📦</div>
                    <p>No products found. Add your first product!</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filtered.map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.hsn}</td>
                <td>${formatCurrency(p.rate)}</td>
                <td>${p.unit}</td>
                <td>${p.gst}%</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="openProductModal(${p.id})" title="Edit">✏️</button>
                        <button class="action-btn delete" onclick="deleteProduct(${p.id})" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

document.getElementById('product-search').addEventListener('input', refreshProductsTable);

// ============== INVOICES ==============
function openNewInvoice() {
    document.getElementById('invoice-form').reset();
    document.getElementById('inv-id').value = '';
    document.getElementById('invoice-modal-title').textContent = 'Create Invoice';
    
    // Set invoice number using smart generation
    document.getElementById('inv-number').value = generateInvoiceNumber();
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inv-date').value = today;
    document.getElementById('inv-due-date').value = today;
    document.getElementById('inv-terms').value = settings.defaultTerms;
    document.getElementById('inv-place').value = settings.state + ' (' + settings.stateCode + ')';
    
    // Populate customer dropdown
    const customerSelect = document.getElementById('inv-customer');
    customerSelect.innerHTML = '<option value="">-- Select Customer --</option>' +
        customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    document.getElementById('customer-details-preview').innerHTML = '';
    
    // Clear items
    document.getElementById('invoice-items').innerHTML = '';
    addInvoiceItem();
    
    updateInvoiceTotals();
    openModal('invoice-modal');
}

function editInvoice(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    document.getElementById('invoice-form').reset();
    document.getElementById('inv-id').value = invoice.id;
    document.getElementById('invoice-modal-title').textContent = 'Edit Invoice';
    
    document.getElementById('inv-number').value = invoice.number;
    document.getElementById('inv-date').value = invoice.date;
    document.getElementById('inv-po').value = invoice.poNumber || '';
    document.getElementById('inv-terms').value = invoice.terms;
    document.getElementById('inv-due-date').value = invoice.dueDate;
    document.getElementById('inv-place').value = invoice.placeOfSupply;
    document.getElementById('inv-notes').value = invoice.notes || '';
    
    // Populate customer dropdown
    const customerSelect = document.getElementById('inv-customer');
    customerSelect.innerHTML = '<option value="">-- Select Customer --</option>' +
        customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    customerSelect.value = invoice.customerId;
    fillCustomerDetails();
    
    // Populate items
    document.getElementById('invoice-items').innerHTML = '';
    invoice.items.forEach(item => {
        addInvoiceItem(item);
    });
    
    updateInvoiceTotals();
    openModal('invoice-modal');
}

function fillCustomerDetails() {
    const customerId = document.getElementById('inv-customer').value;
    const preview = document.getElementById('customer-details-preview');
    
    if (!customerId) {
        preview.innerHTML = '';
        return;
    }
    
    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
        preview.innerHTML = `
            <strong>${customer.name}</strong><br>
            ${customer.address}<br>
            ${customer.city}, ${customer.pin || ''} ${customer.state}<br>
            ${customer.gstin ? 'GSTIN: ' + customer.gstin : ''}
        `;
    }
}

function addInvoiceItem(itemData = null) {
    const tbody = document.getElementById('invoice-items');
    const rowIndex = tbody.children.length;
    
    const productOptions = products.map(p => 
        `<option value="${p.id}" data-rate="${p.rate}" data-gst="${p.gst}" data-hsn="${p.hsn}" data-unit="${p.unit}">${p.name}</option>`
    ).join('');
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="product-select" onchange="updateItemFromProduct(this, ${rowIndex})">
                <option value="">Select Product</option>
                ${productOptions}
            </select>
        </td>
        <td><input type="number" class="qty-input" value="${itemData?.qty || 1}" min="0.01" step="0.01" onchange="updateInvoiceTotals()"></td>
        <td><input type="number" class="rate-input" value="${itemData?.rate || ''}" step="0.01" onchange="updateInvoiceTotals()"></td>
        <td><input type="number" class="gst-input" value="${itemData?.gst || 5}" min="0" max="28" step="0.5" onchange="updateInvoiceTotals()" style="width:60px"></td>
        <td class="amount-display">₹0.00</td>
        <td><button type="button" class="remove-item-btn" onclick="removeInvoiceItem(this)">×</button></td>
    `;
    
    tbody.appendChild(row);
    
    if (itemData) {
        const select = row.querySelector('.product-select');
        select.value = itemData.productId;
    }
    
    updateInvoiceTotals();
}

function updateItemFromProduct(select, rowIndex) {
    const option = select.options[select.selectedIndex];
    const row = select.closest('tr');
    
    if (option.value) {
        row.querySelector('.rate-input').value = option.dataset.rate;
        row.querySelector('.gst-input').value = option.dataset.gst;
    }
    
    updateInvoiceTotals();
}

function removeInvoiceItem(btn) {
    const tbody = document.getElementById('invoice-items');
    if (tbody.children.length > 1) {
        btn.closest('tr').remove();
        updateInvoiceTotals();
    }
}

function updateInvoiceTotals() {
    const rows = document.querySelectorAll('#invoice-items tr');
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
        const gst = parseFloat(row.querySelector('.gst-input').value) || 0;
        
        const amount = qty * rate;
        const cgst = amount * (gst / 2) / 100;
        const sgst = amount * (gst / 2) / 100;
        
        subtotal += amount;
        totalCgst += cgst;
        totalSgst += sgst;
        
        row.querySelector('.amount-display').textContent = formatCurrency(amount);
    });
    
    const total = subtotal + totalCgst + totalSgst;
    
    document.getElementById('inv-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('inv-cgst').textContent = formatCurrency(totalCgst);
    document.getElementById('inv-sgst').textContent = formatCurrency(totalSgst);
    document.getElementById('inv-total').textContent = formatCurrency(total);
}

function saveInvoice(event) {
    event.preventDefault();
    
    const customerId = document.getElementById('inv-customer').value;
    if (!customerId) {
        alert('Please select a customer');
        return;
    }
    
    const customer = customers.find(c => c.id === parseInt(customerId));
    const rows = document.querySelectorAll('#invoice-items tr');
    const items = [];
    
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    
    rows.forEach(row => {
        const select = row.querySelector('.product-select');
        const productId = select.value;
        const product = products.find(p => p.id === parseInt(productId));
        
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
        const gst = parseFloat(row.querySelector('.gst-input').value) || 0;
        
        if (qty > 0 && rate > 0) {
            const amount = qty * rate;
            const cgstAmt = amount * (gst / 2) / 100;
            const sgstAmt = amount * (gst / 2) / 100;
            
            items.push({
                productId: productId,
                name: product ? product.name : select.options[select.selectedIndex].text,
                hsn: product ? product.hsn : '',
                qty: qty,
                unit: product ? product.unit : 'kg',
                rate: rate,
                gst: gst,
                cgst: cgstAmt,
                sgst: sgstAmt,
                amount: amount
            });
            
            subtotal += amount;
            totalCgst += cgstAmt;
            totalSgst += sgstAmt;
        }
    });
    
    if (items.length === 0) {
        alert('Please add at least one item');
        return;
    }
    
    const invoiceId = document.getElementById('inv-id').value;
    const invoiceData = {
        number: document.getElementById('inv-number').value,
        date: document.getElementById('inv-date').value,
        poNumber: document.getElementById('inv-po').value,
        terms: document.getElementById('inv-terms').value,
        dueDate: document.getElementById('inv-due-date').value,
        placeOfSupply: document.getElementById('inv-place').value,
        customerId: parseInt(customerId),
        customerName: customer.name,
        items: items,
        subtotal: subtotal,
        cgst: totalCgst,
        sgst: totalSgst,
        total: subtotal + totalCgst + totalSgst,
        notes: document.getElementById('inv-notes').value,
        status: 'pending'
    };
    
    if (invoiceId) {
        const index = invoices.findIndex(inv => inv.id === parseInt(invoiceId));
        invoices[index] = { ...invoices[index], ...invoiceData };
    } else {
        invoiceData.id = Date.now();
        invoices.push(invoiceData);
        settings.nextInvoiceNum++;
    }
    
    saveData();
    closeModal('invoice-modal');
    refreshInvoicesTable();
    refreshDashboard();
    alert('Invoice saved successfully!');
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        invoices = invoices.filter(inv => inv.id !== invoiceId);
        saveData();
        refreshInvoicesTable();
        refreshDashboard();
    }
}

function toggleInvoiceStatus(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        invoice.status = invoice.status === 'paid' ? 'pending' : 'paid';
        saveData();
        refreshInvoicesTable();
        refreshDashboard();
    }
}

function refreshInvoicesTable() {
    const tbody = document.getElementById('invoices-body');
    const searchTerm = document.getElementById('invoice-search').value.toLowerCase();
    const statusFilter = document.getElementById('invoice-status-filter').value;
    
    let filtered = invoices;
    
    if (searchTerm) {
        filtered = filtered.filter(inv => 
            inv.number.toLowerCase().includes(searchTerm) ||
            inv.customerName.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(inv => inv.status === statusFilter);
    }
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="icon">📄</div>
                    <p>No invoices found. Create your first invoice!</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filtered.map(inv => `
            <tr>
                <td><strong>${inv.number}</strong></td>
                <td>${inv.customerName}</td>
                <td>${formatDate(inv.date)}</td>
                <td>${formatDate(inv.dueDate)}</td>
                <td>${formatCurrency(inv.total)}</td>
                <td>
                    <span class="status-badge ${inv.status}" onclick="toggleInvoiceStatus(${inv.id})" style="cursor:pointer" title="Click to toggle">
                        ${inv.status}
                    </span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="previewInvoice(${inv.id})" title="View">👁️</button>
                        <button class="action-btn" onclick="editInvoice(${inv.id})" title="Edit">✏️</button>
                        <button class="action-btn delete" onclick="deleteInvoice(${inv.id})" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

document.getElementById('invoice-search').addEventListener('input', refreshInvoicesTable);
document.getElementById('invoice-status-filter').addEventListener('change', refreshInvoicesTable);

// ============== INVOICE PREVIEW & PDF ==============
let currentPreviewInvoice = null;

function previewInvoice(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    currentPreviewInvoice = invoice;
    const customer = customers.find(c => c.id === invoice.customerId);
    
    const container = document.getElementById('invoice-preview-container');
    container.innerHTML = generateInvoiceHTML(invoice, customer);
    
    openModal('preview-modal');
}

function generateInvoiceHTML(invoice, customer) {
    const itemsHTML = invoice.items.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${item.name}</td>
            <td class="text-center">${item.hsn}</td>
            <td class="text-center">${item.qty} ${item.unit}</td>
            <td class="text-right">${formatCurrency(item.rate)}</td>
            <td class="text-center">${(item.gst/2).toFixed(1)}%</td>
            <td class="text-right">${formatCurrency(item.cgst)}</td>
            <td class="text-center">${(item.gst/2).toFixed(1)}%</td>
            <td class="text-right">${formatCurrency(item.sgst)}</td>
            <td class="text-right">${formatCurrency(item.amount + item.cgst + item.sgst)}</td>
        </tr>
    `).join('');
    
    const shipAddress = customer?.shipAddress || customer?.address || '';
    
    return `
        <div class="invoice-preview" id="invoice-print-area">
            <div class="watermark">ECONIRVA</div>
            <div class="header">
                <div class="company-info">
                    <div class="company-logo-row">
                        <img src="logo.jpeg" alt="ECONIRVA" class="company-logo">
                        <div class="company-text">
                            <h1>${settings.companyName}</h1>
                            <p>${settings.address}</p>
                            <p>GSTIN: ${settings.gstin}</p>
                            <p>Email: ${settings.email} | Phone: ${settings.phone}</p>
                        </div>
                    </div>
                </div>
                <div class="invoice-title">
                    <h2>TAX INVOICE</h2>
                    <div class="invoice-details">
                        <p><strong>Invoice Number:</strong> ${invoice.number}</p>
                        <p><strong>Invoice Date:</strong> ${formatDate(invoice.date)}</p>
                        <p><strong>Terms:</strong> ${invoice.terms}</p>
                        <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                        ${invoice.poNumber ? `<p><strong>P.O.#:</strong> ${invoice.poNumber}</p>` : ''}
                        <p><strong>Place of Supply:</strong> ${invoice.placeOfSupply}</p>
                    </div>
                </div>
            </div>
            
            <div class="parties">
                <div class="party-box">
                    <h3>Bill To</h3>
                    <p class="company-name">${customer?.name || invoice.customerName}</p>
                    <p>${customer?.address || ''}</p>
                    <p>${customer?.city || ''}, ${customer?.pin || ''} ${customer?.state || ''}</p>
                    ${customer?.gstin ? `<p>GSTIN: ${customer.gstin}</p>` : ''}
                </div>
                <div class="party-box">
                    <h3>Ship To</h3>
                    <p class="company-name">${customer?.name || invoice.customerName}</p>
                    <p>${shipAddress}</p>
                    <p>${customer?.city || ''}, ${customer?.pin || ''} ${customer?.state || ''}</p>
                </div>
            </div>
            
            <table class="items-table-preview">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item & Description</th>
                        <th>HSN/SAC</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>CGST%</th>
                        <th>CGST Amt</th>
                        <th>SGST%</th>
                        <th>SGST Amt</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div class="summary-section">
                <div class="bank-details">
                    <h4>Bank Details</h4>
                    <p><strong>Bank Name:</strong> ${settings.bankName}</p>
                    <p><strong>Account No:</strong> ${settings.bankAccount}</p>
                    <p><strong>IFSC Code:</strong> ${settings.bankIfsc}</p>
                    <p><strong>Account Holder:</strong> ${settings.bankHolder}</p>
                    <p><strong>UPI/PhonePe:</strong> ${settings.bankUpi}</p>
                </div>
                <div class="totals-box">
                    <div class="row">
                        <span>Sub Total</span>
                        <span>${formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div class="row">
                        <span>CGST</span>
                        <span>${formatCurrency(invoice.cgst)}</span>
                    </div>
                    <div class="row">
                        <span>SGST</span>
                        <span>${formatCurrency(invoice.sgst)}</span>
                    </div>
                    <div class="row grand-total">
                        <span>Total</span>
                        <span>${formatCurrency(invoice.total)}</span>
                    </div>
                    <div class="amount-words">
                        <strong>Total In Words:</strong><br>
                        ${numberToWords(invoice.total)}
                    </div>
                </div>
            </div>
            
            ${invoice.notes ? `
                <div class="notes-section">
                    <h4>Notes</h4>
                    <p>${invoice.notes}</p>
                </div>
            ` : ''}
            
            <div class="terms-section">
                <h4>Terms & Conditions</h4>
                <ol>
                    ${settings.termsConditions.split('\n').filter(t => t.trim()).map(term => {
                        const cleanTerm = term.replace(/^\d+\.\s*/, '');
                        return `<li>${cleanTerm}</li>`;
                    }).join('')}
                </ol>
            </div>
            
            <div class="footer">
                <div class="thank-you">Thank you for your business!</div>
                <div class="generated-by">Generated by: ${getCurrentUserName()}</div>
                <div class="signature">
                    <div class="signature-line"></div>
                    <p>Authorized Signature</p>
                </div>
            </div>
        </div>
    `;
}

// Direct PDF download
function downloadInvoicePDF() {
    if (!currentPreviewInvoice) return;
    
    const element = document.getElementById('invoice-print-area');
    const filename = currentPreviewInvoice.number.replace(/\//g, '-') + '.pdf';
    
    // Keep logo visible
    
    html2pdf().set({
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
}

function printInvoice() {
    const printContent = document.getElementById('invoice-print-area').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Invoice</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                ${getInvoicePrintStyles()}
            </style>
        </head>
        <body>
            ${printContent}
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function getInvoicePrintStyles() {
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; font-size: 11px; line-height: 1.4; color: #1a1a1a; }
        .invoice-preview { padding: 20px; position: relative; overflow: hidden; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); font-size: 80px; font-weight: 600; color: rgba(45, 106, 79, 0.06); letter-spacing: 10px; white-space: nowrap; pointer-events: none; z-index: 1; font-family: 'Poppins', sans-serif; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #2d6a4f; position: relative; z-index: 1; }
        .company-logo-row { display: flex; align-items: flex-start; gap: 12px; }
        .company-logo { width: 70px; height: 70px; object-fit: contain; border-radius: 6px; }
        .company-text h1 { font-size: 16px; color: #2d6a4f; margin-bottom: 5px; }
        .company-text p { color: #555; margin: 2px 0; font-size: 10px; }
        .company-info h1 { font-size: 18px; color: #2d6a4f; margin-bottom: 5px; }
        .company-info p { color: #555; margin: 2px 0; font-size: 10px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 24px; color: #059669; margin-bottom: 8px; }
        .invoice-details { font-size: 10px; }
        .invoice-details p { margin: 2px 0; }
        .parties { display: flex; gap: 20px; margin-bottom: 20px; }
        .party-box { flex: 1; background: #f8f9fa; padding: 12px; border-left: 3px solid #059669; }
        .party-box h3 { font-size: 10px; text-transform: uppercase; color: #059669; margin-bottom: 5px; }
        .party-box p { margin: 2px 0; font-size: 10px; }
        .party-box .company-name { font-weight: 600; font-size: 12px; }
        .items-table-preview { width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; }
        .items-table-preview th { background: #2d6a4f; color: white; padding: 8px 5px; text-align: center; font-size: 8px; text-transform: uppercase; }
        .items-table-preview th:nth-child(1) { width: 4%; } .items-table-preview th:nth-child(2) { width: 28%; text-align: left; }
        .items-table-preview th:nth-child(3) { width: 10%; } .items-table-preview th:nth-child(4) { width: 8%; }
        .items-table-preview th:nth-child(5) { width: 10%; text-align: right; } .items-table-preview th:nth-child(6) { width: 8%; }
        .items-table-preview th:nth-child(7) { width: 10%; text-align: right; } .items-table-preview th:nth-child(8) { width: 8%; }
        .items-table-preview th:nth-child(9) { width: 10%; text-align: right; } .items-table-preview th:nth-child(10) { width: 10%; text-align: right; }
        .items-table-preview td { padding: 8px 5px; border-bottom: 1px solid #e5e7eb; font-size: 9px; vertical-align: middle; }
        .items-table-preview td:nth-child(1) { text-align: center; } .items-table-preview td:nth-child(2) { text-align: left; }
        .items-table-preview td:nth-child(3) { text-align: center; } .items-table-preview td:nth-child(4) { text-align: center; }
        .items-table-preview td:nth-child(5) { text-align: right; } .items-table-preview td:nth-child(6) { text-align: center; }
        .items-table-preview td:nth-child(7) { text-align: right; } .items-table-preview td:nth-child(8) { text-align: center; }
        .items-table-preview td:nth-child(9) { text-align: right; } .items-table-preview td:nth-child(10) { text-align: right; }
        .items-table-preview tr:nth-child(even) td { background: rgba(249, 250, 251, 0.7); }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-section { display: flex; gap: 20px; margin-top: 15px; }
        .bank-details { flex: 1.5; background: #f8f9fa; padding: 12px; font-size: 10px; }
        .bank-details h4 { color: #059669; margin-bottom: 8px; font-size: 11px; }
        .bank-details p { margin: 2px 0; }
        .totals-box { flex: 1; }
        .totals-box .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e5e7eb; }
        .totals-box .grand-total { background: #059669; color: white; padding: 8px 10px; margin-top: 5px; font-weight: 600; }
        .amount-words { background: #f0fdf4; padding: 10px; margin-top: 10px; font-size: 10px; }
        .notes-section { margin-top: 15px; padding: 12px; background: #fffbeb; border-left: 3px solid #f59e0b; }
        .notes-section h4 { color: #b45309; font-size: 10px; margin-bottom: 5px; }
        .notes-section p { font-size: 10px; color: #78350f; }
        .terms-section { margin-top: 15px; font-size: 9px; color: #666; }
        .terms-section h4 { font-size: 10px; color: #333; margin-bottom: 5px; }
        .terms-section ol { padding-left: 15px; }
        .terms-section li { margin: 2px 0; }
        .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature { text-align: center; }
        .signature-line { width: 150px; height: 50px; border-bottom: 1px solid #333; margin-bottom: 5px; }
        .signature p { font-size: 10px; color: #666; }
        .thank-you { font-size: 12px; color: #059669; font-weight: 600; }
        .generated-by { font-size: 10px; color: #666; font-style: italic; }
    `;
}

// ============== SETTINGS ==============
function loadSettings() {
    document.getElementById('company-name').value = settings.companyName;
    document.getElementById('company-gstin').value = settings.gstin;
    document.getElementById('company-address').value = settings.address;
    document.getElementById('company-email').value = settings.email;
    document.getElementById('company-phone').value = settings.phone;
    document.getElementById('company-state').value = settings.state;
    document.getElementById('company-state-code').value = settings.stateCode;
    document.getElementById('bank-name').value = settings.bankName;
    document.getElementById('bank-account').value = settings.bankAccount;
    document.getElementById('bank-ifsc').value = settings.bankIfsc;
    document.getElementById('bank-holder').value = settings.bankHolder;
    document.getElementById('bank-upi').value = settings.bankUpi;
    document.getElementById('invoice-format').value = settings.invoiceNumberFormat || 'financial_year';
    document.getElementById('invoice-prefix').value = settings.invoicePrefix || 'INV';
    document.getElementById('next-invoice-num').value = settings.nextInvoiceNum;
    document.getElementById('default-gst').value = settings.defaultGst;
    document.getElementById('default-terms').value = settings.defaultTerms;
    document.getElementById('terms-conditions').value = settings.termsConditions;
    document.getElementById('current-fy').value = getCurrentFinancialYear();
    
    // Custom pattern
    if (settings.customPattern) {
        document.getElementById('custom-pattern').value = settings.customPattern;
    }
    
    // Show/hide custom pattern field
    toggleCustomPattern();
    
    // Update preview
    updateFormatPreview();
    
    // Check for gaps
    checkAndDisplayGaps();
}

function toggleCustomPattern() {
    const format = document.getElementById('invoice-format').value;
    const customGroup = document.getElementById('custom-pattern-group');
    customGroup.style.display = format === 'custom' ? 'block' : 'none';
}

function updateFormatPreview() {
    toggleCustomPattern();
    
    const format = document.getElementById('invoice-format').value;
    const prefix = document.getElementById('invoice-prefix').value || 'INV';
    const nextNum = parseInt(document.getElementById('next-invoice-num').value) || 1;
    const num = nextNum.toString().padStart(3, '0');
    const now = new Date();
    const fy = getCurrentFinancialYear();
    
    let preview;
    
    switch (format) {
        case 'financial_year':
            preview = `${prefix}/${fy}/${num}`;
            break;
        case 'date_based':
            const dateStr = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0');
            preview = `${prefix}-${dateStr}-${num}`;
            break;
        case 'monthly':
            const monthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
            preview = `${prefix}-${monthStr}-${num}`;
            break;
        case 'sequential':
            preview = `${prefix}-${num}`;
            break;
        case 'custom':
            let pattern = document.getElementById('custom-pattern').value || '{PREFIX}/{FY}/{NUM}';
            const replacements = {
                '{PREFIX}': prefix,
                '{FY}': fy,
                '{YEAR}': now.getFullYear().toString(),
                '{YY}': now.getFullYear().toString().slice(-2),
                '{MONTH}': (now.getMonth() + 1).toString().padStart(2, '0'),
                '{DAY}': now.getDate().toString().padStart(2, '0'),
                '{NUM}': num,
                '{NUM4}': nextNum.toString().padStart(4, '0'),
                '{NUM5}': nextNum.toString().padStart(5, '0')
            };
            for (const [key, value] of Object.entries(replacements)) {
                pattern = pattern.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
            }
            preview = pattern;
            break;
        default:
            preview = `${prefix}/${fy}/${num}`;
    }
    
    document.getElementById('invoice-preview-box').textContent = preview;
    
    // Check if this number already exists
    if (isInvoiceNumberExists(preview)) {
        document.getElementById('invoice-preview-box').style.borderColor = 'var(--danger)';
        document.getElementById('invoice-preview-box').innerHTML = `${preview} <span style="color:var(--danger);font-size:0.8rem;">(⚠️ Already exists!)</span>`;
    } else {
        document.getElementById('invoice-preview-box').style.borderColor = 'var(--primary)';
    }
}

function checkAndDisplayGaps() {
    const gaps = findInvoiceGaps();
    const warningDiv = document.getElementById('gaps-warning');
    const gapsList = document.getElementById('gaps-list');
    
    if (gaps.length > 0) {
        warningDiv.style.display = 'block';
        if (gaps.length <= 5) {
            gapsList.textContent = ` Missing invoice numbers: ${gaps.map(g => g.toString().padStart(3, '0')).join(', ')}`;
        } else {
            gapsList.textContent = ` ${gaps.length} missing invoice numbers detected. First few: ${gaps.slice(0, 5).map(g => g.toString().padStart(3, '0')).join(', ')}...`;
        }
    } else {
        warningDiv.style.display = 'none';
    }
}

function saveSettings() {
    settings = {
        companyName: document.getElementById('company-name').value,
        gstin: document.getElementById('company-gstin').value,
        address: document.getElementById('company-address').value,
        email: document.getElementById('company-email').value,
        phone: document.getElementById('company-phone').value,
        state: document.getElementById('company-state').value,
        stateCode: document.getElementById('company-state-code').value,
        bankName: document.getElementById('bank-name').value,
        bankAccount: document.getElementById('bank-account').value,
        bankIfsc: document.getElementById('bank-ifsc').value,
        bankHolder: document.getElementById('bank-holder').value,
        bankUpi: document.getElementById('bank-upi').value,
        invoiceNumberFormat: document.getElementById('invoice-format').value,
        invoicePrefix: document.getElementById('invoice-prefix').value,
        customPattern: document.getElementById('custom-pattern').value,
        nextInvoiceNum: parseInt(document.getElementById('next-invoice-num').value),
        lastFinancialYear: settings.lastFinancialYear || getCurrentFinancialYear(),
        defaultGst: parseFloat(document.getElementById('default-gst').value),
        defaultTerms: document.getElementById('default-terms').value,
        termsConditions: document.getElementById('terms-conditions').value
    };
    
    saveData();
    alert('Settings saved successfully!');
}

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
    refreshDashboard();
    refreshCustomersTable();
    refreshProductsTable();
    refreshInvoicesTable();
    loadSettings();
});

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    }
});

