// ECONIRVA Quotation Generator - Main Application
// Version 1.0.0

// Data Storage
const APP_DATA = {
    customers: [
        'Kaaram', 'Kamadhenu', 'Andhra Ruchulu', 'Fire and Ice',
        'Old A1 (Manikonda)', 'Syla', 'Leons', 'California Buretto',
        'Spice venue', 'Anthera', 'Gamyam', '1980 Military Hotel Manikonda',
        'Maa chilli patnam kitchen', 'Crispy cream', 'Subway', 'Minerva coffe'
    ],
    products: [
        {
            name: 'Normal Grade - Milk White',
            priceExclGST: 153.60,
            priceInclGST: 161.00,
            category: 'Standard'
        },
        {
            name: 'High Strength - Special Grade',
            priceExclGST: 194.40,
            priceInclGST: 204.00,
            category: 'Premium'
        },
        {
            name: 'Colored Grade - Milk White',
            priceExclGST: 159.60,
            priceInclGST: 168.00,
            category: 'Colored'
        },
        {
            name: 'Colored High Strength',
            priceExclGST: 194.40,
            priceInclGST: 204.00,
            category: 'Colored Premium'
        }
    ],
    printingOptions: [
        { name: 'No Printing', pricePerKg: 0 },
        { name: '1+0 (1 Color, 1 Side)', pricePerKg: 10 },
        { name: '1+1 (1 Color, 2 Sides)', pricePerKg: 16 },
        { name: '2+0 (2 Colors, 1 Side)', pricePerKg: 16 },
        { name: '2+2 (2 Colors, 2 Sides)', pricePerKg: 28 },
        { name: '3+0 (3 Colors, 1 Side)', pricePerKg: 22 },
        { name: '3+3 (3 Colors, 2 Sides)', pricePerKg: 40 }
    ],
    savedQuotations: [],
    termsAndConditions: [
        '50% advance payment required. Balance on delivery.',
        'Delivery: 5-7 days for standard orders, 10-15 days for printed orders.',
        'GST 5% included in prices. Transportation charges extra.',
        'Valid for 30 days from issue date.',
        'All products certified compostable as per IS/ISO 17088.'
    ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupFormHandlers();
    loadCustomers();
    setupDateFields();
    generateQuoteNumber();
    addProductRow(); // Add first product row
    loadSavedData();
}

// Navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageName = btn.dataset.page;
            
            // Update active nav button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`${pageName}-page`).classList.add('active');
            
            // Update header
            updatePageHeader(pageName);
        });
    });
}

function updatePageHeader(pageName) {
    const titles = {
        'new-quote': ['New Quotation', 'Create a new quotation for your customer'],
        'saved-quotes': ['Saved Quotations', 'View and manage your saved quotations'],
        'customers': ['Customers', 'Manage your customer database'],
        'products': ['Products', 'View product catalog and pricing'],
        'settings': ['Settings', 'Configure application settings']
    };
    
    const [title, subtitle] = titles[pageName];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = subtitle;
}

// Form Handlers
function setupFormHandlers() {
    // Add product button
    document.getElementById('add-product-btn').addEventListener('click', addProductRow);
    
    // Clear form
    document.getElementById('clear-form').addEventListener('click', clearForm);
    
    // Preview
    document.getElementById('preview-btn').addEventListener('click', showPreview);
    
    // Generate PDF
    document.getElementById('generate-pdf').addEventListener('click', generatePDF);
    
    // Modal close
    document.getElementById('close-preview').addEventListener('click', closeModal);
    document.getElementById('close-preview-btn').addEventListener('click', closeModal);
    
    // Download PDF from modal
    document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);
}

// Date Fields
function setupDateFields() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    document.getElementById('quote-date').value = todayStr;
    
    // Set valid until date (30 days from today)
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + 30);
    document.getElementById('valid-until').value = validUntil.toISOString().split('T')[0];
}

// Generate Quote Number
function generateQuoteNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    document.getElementById('quote-number').value = `ECO/${year}/${random}`;
}

// Load Customers
function loadCustomers() {
    const customerList = document.getElementById('customer-list');
    customerList.innerHTML = '';
    
    APP_DATA.customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer;
        customerList.appendChild(option);
    });
}

// Product Rows
let productCounter = 0;

function addProductRow() {
    productCounter++;
    const container = document.getElementById('products-container');
    
    const productRow = document.createElement('div');
    productRow.className = 'product-row';
    productRow.id = `product-${productCounter}`;
    
    productRow.innerHTML = `
        <div class="product-row-header">
            <span class="product-row-title">Product ${productCounter}</span>
            <button class="btn btn-sm btn-danger" onclick="removeProduct(${productCounter})">
                <span class="icon">🗑️</span> Remove
            </button>
        </div>
        <div class="product-fields">
            <div class="form-group">
                <label>Product Type</label>
                <select class="product-type" onchange="calculateTotal()">
                    ${APP_DATA.products.map(p => 
                        `<option value="${p.priceInclGST}">${p.name} - ₹${p.priceInclGST}/kg</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Quantity (Kg)</label>
                <input type="number" class="product-quantity" min="1" value="1" step="0.5" onchange="calculateTotal()">
            </div>
            <div class="form-group">
                <label>Size</label>
                <input type="text" class="product-size" placeholder="e.g. 10x12">
            </div>
            <div class="form-group">
                <label>Printing</label>
                <select class="product-printing" onchange="calculateTotal()">
                    ${APP_DATA.printingOptions.map(p => 
                        `<option value="${p.pricePerKg}">${p.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="text" class="product-amount" readonly style="font-weight: 700; color: var(--primary-dark);">
            </div>
        </div>
    `;
    
    container.appendChild(productRow);
    calculateTotal();
}

function removeProduct(id) {
    const product = document.getElementById(`product-${id}`);
    if (product) {
        product.remove();
        calculateTotal();
    }
}

// Calculate Total
function calculateTotal() {
    let subtotal = 0;
    let printingTotal = 0;
    
    const productRows = document.querySelectorAll('.product-row');
    
    productRows.forEach(row => {
        const pricePerKg = parseFloat(row.querySelector('.product-type').value);
        const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
        const printing = parseFloat(row.querySelector('.product-printing').value) || 0;
        
        const productSubtotal = pricePerKg * quantity;
        const productPrinting = (printing * 1.05) * quantity; // GST on printing
        const productTotal = productSubtotal + productPrinting;
        
        row.querySelector('.product-amount').value = `₹${productTotal.toFixed(2)}`;
        
        subtotal += productSubtotal;
        printingTotal += productPrinting;
    });
    
    // Calculate GST (already included in prices, so back-calculate)
    const subtotalExclGST = subtotal / 1.05;
    const gst = subtotal - subtotalExclGST;
    
    const total = subtotal + printingTotal;
    
    document.getElementById('subtotal-value').textContent = `₹${subtotalExclGST.toFixed(2)}`;
    document.getElementById('gst-value').textContent = `₹${gst.toFixed(2)}`;
    document.getElementById('printing-value').textContent = `₹${printingTotal.toFixed(2)}`;
    document.getElementById('total-value').textContent = `₹${total.toFixed(2)}`;
}

// Clear Form
function clearForm() {
    if (confirm('Are you sure you want to clear the form?')) {
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('customer-email').value = '';
        document.getElementById('customer-gstin').value = '';
        document.getElementById('customer-address').value = '';
        document.getElementById('transport-cost').value = '';
        document.getElementById('additional-notes').value = '';
        
        document.getElementById('products-container').innerHTML = '';
        productCounter = 0;
        addProductRow();
        
        generateQuoteNumber();
        setupDateFields();
    }
}

// Preview
function showPreview() {
    const quoteData = getFormData();
    const previewHTML = generateQuoteHTML(quoteData);
    
    document.getElementById('preview-content').innerHTML = previewHTML;
    document.getElementById('preview-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('preview-modal').classList.remove('active');
}

// Get Form Data
function getFormData() {
    const products = [];
    const productRows = document.querySelectorAll('.product-row');
    
    productRows.forEach(row => {
        const type = row.querySelector('.product-type');
        const quantity = parseFloat(row.querySelector('.product-quantity').value);
        const size = row.querySelector('.product-size').value;
        const printing = row.querySelector('.product-printing');
        const amount = row.querySelector('.product-amount').value;
        
        products.push({
            name: type.options[type.selectedIndex].text,
            pricePerKg: parseFloat(type.value),
            quantity,
            size,
            printing: printing.options[printing.selectedIndex].text,
            printingCost: parseFloat(printing.value),
            amount
        });
    });
    
    return {
        quoteNumber: document.getElementById('quote-number').value,
        date: document.getElementById('quote-date').value,
        validUntil: document.getElementById('valid-until').value,
        customer: {
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            email: document.getElementById('customer-email').value,
            gstin: document.getElementById('customer-gstin').value,
            address: document.getElementById('customer-address').value
        },
        products,
        subtotal: document.getElementById('subtotal-value').textContent,
        gst: document.getElementById('gst-value').textContent,
        printing: document.getElementById('printing-value').textContent,
        transport: document.getElementById('transport-cost').value || 'As Actual',
        total: document.getElementById('total-value').textContent,
        notes: document.getElementById('additional-notes').value
    };
}

// Generate Quote HTML
function generateQuoteHTML(data) {
    return `
        <div style="max-width: 800px; margin: 0 auto; font-family: 'Segoe UI', sans-serif;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; border-bottom: 4px solid #2e7d32; padding-bottom: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <img src="logo.png" alt="ECONIRVA" style="width: 70px; height: 70px; object-fit: contain; flex-shrink: 0;">
                    <div>
                        <h1 style="color: #1b5e20; font-size: 32px; margin-bottom: 5px; font-weight: 800;">ECONIRVA</h1>
                        <p style="color: #2e7d32; font-size: 14px; font-weight: 600;">Bio Solutions Private Limited</p>
                        <p style="font-size: 12px; color: #666; margin-top: 8px;">Hyderabad, Telangana, India<br>
                        Phone: +91 70758 35854<br>
                        Email: info@econirva.com</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <h2 style="color: #1b5e20; font-size: 24px; margin-bottom: 10px;">QUOTATION</h2>
                    <p style="font-size: 12px;"><strong>Quote No:</strong> ${data.quoteNumber}<br>
                    <strong>Date:</strong> ${data.date}<br>
                    <strong>Valid Until:</strong> ${data.validUntil}</p>
                </div>
            </div>
            
            <!-- Customer Info -->
            <div style="background: #f1f8e9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #1b5e20; margin-bottom: 10px;">Bill To:</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${data.customer.name}</p>
                ${data.customer.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${data.customer.phone}</p>` : ''}
                ${data.customer.email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${data.customer.email}</p>` : ''}
                ${data.customer.gstin ? `<p style="margin: 5px 0;"><strong>GSTIN:</strong> ${data.customer.gstin}</p>` : ''}
                ${data.customer.address ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${data.customer.address}</p>` : ''}
            </div>
            
            <!-- Products Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #2e7d32; color: white;">
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Product</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Size</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qty (Kg)</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Printing</th>
                        <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.products.map((p, i) => `
                        <tr style="${i % 2 === 0 ? 'background: #f9f9f9;' : ''}">
                            <td style="padding: 10px; border: 1px solid #ddd;">${p.name}</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${p.size || '-'}</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${p.quantity}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${p.printing}</td>
                            <td style="padding: 10px; text-align: right; font-weight: 700; border: 1px solid #ddd;">${p.amount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Summary -->
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span>Subtotal (Excl. GST):</span>
                    <span style="font-weight: 700;">${data.subtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span>GST @ 5%:</span>
                    <span style="font-weight: 700;">${data.gst}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span>Printing Charges:</span>
                    <span style="font-weight: 700;">${data.printing}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span>Transportation:</span>
                    <span style="font-weight: 700;">${data.transport}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px 0 0 0; margin-top: 10px; border-top: 3px solid #2e7d32; font-size: 20px; font-weight: 700; color: #1b5e20;">
                    <span>Total Amount:</span>
                    <span style="color: #4CAF50;">${data.total}</span>
                </div>
            </div>
            
            ${data.notes ? `
            <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #e65100; margin-bottom: 10px;">Additional Notes:</h4>
                <p style="white-space: pre-wrap;">${data.notes}</p>
            </div>
            ` : ''}
            
            <!-- Terms -->
            <div style="font-size: 11px; line-height: 1.6; margin-bottom: 20px;">
                <h4 style="color: #1b5e20; margin-bottom: 10px;">Terms & Conditions:</h4>
                <ul style="margin-left: 20px;">
                    ${APP_DATA.termsAndConditions.map(term => `<li>${term}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e8f5e9;">
                <p style="color: #2e7d32; font-weight: 600;">🌿 Thank you for choosing ECONIRVA!</p>
                <p style="font-size: 12px; color: #666;">Making Earth Greener, One Bag at a Time</p>
            </div>
        </div>
    `;
}

// Generate PDF (Browser print)
function generatePDF() {
    const quoteData = getFormData();
    
    if (!quoteData.customer.name) {
        alert('Please enter customer name');
        return;
    }
    
    const previewHTML = generateQuoteHTML(quoteData);
    
    // Open new window for printing
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>Quotation</title></head><body>');
    printWindow.document.write(previewHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
    
    // Save quotation
    saveQuotation(quoteData);
}

function downloadPDF() {
    generatePDF();
    closeModal();
}

// Save Quotation
function saveQuotation(data) {
    const savedQuotes = JSON.parse(localStorage.getItem('econirva_quotes') || '[]');
    savedQuotes.push({
        ...data,
        savedDate: new Date().toISOString()
    });
    localStorage.setItem('econirva_quotes', JSON.stringify(savedQuotes));
    
    loadSavedQuotations();
}

// Load Saved Data
function loadSavedData() {
    loadSavedQuotations();
    loadProductsCatalog();
    loadCustomersList();
    loadSettings();
}

// Save and Load Settings
function saveSettings() {
    const settings = {
        companyName: document.getElementById('company-name').value,
        companyPhone: document.getElementById('company-phone').value,
        companyEmail: document.getElementById('company-email').value,
        companyWebsite: document.getElementById('company-website').value,
        companyAddress: document.getElementById('company-address').value,
        termsAndConditions: document.getElementById('terms-conditions').value.split('\n').filter(line => line.trim())
    };
    
    localStorage.setItem('econirva_settings', JSON.stringify(settings));
    
    // Update APP_DATA
    APP_DATA.termsAndConditions = settings.termsAndConditions;
    
    alert('✅ Settings saved successfully!');
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('econirva_settings') || 'null');
    
    if (settings) {
        // Load company info
        if (settings.companyName) document.getElementById('company-name').value = settings.companyName;
        if (settings.companyPhone) document.getElementById('company-phone').value = settings.companyPhone;
        if (settings.companyEmail) document.getElementById('company-email').value = settings.companyEmail;
        if (settings.companyWebsite) document.getElementById('company-website').value = settings.companyWebsite;
        if (settings.companyAddress) document.getElementById('company-address').value = settings.companyAddress;
        
        // Load terms and conditions
        if (settings.termsAndConditions) {
            APP_DATA.termsAndConditions = settings.termsAndConditions;
            document.getElementById('terms-conditions').value = settings.termsAndConditions.join('\n');
        }
    }
}

function loadSavedQuotations() {
    const savedQuotes = JSON.parse(localStorage.getItem('econirva_quotes') || '[]');
    const container = document.getElementById('saved-quotes-list');
    
    if (savedQuotes.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No saved quotations yet</p>';
        return;
    }
    
    container.innerHTML = savedQuotes.reverse().map((quote, index) => `
        <div class="quote-item">
            <div class="quote-info">
                <h4>${quote.quoteNumber} - ${quote.customer.name}</h4>
                <p>Date: ${quote.date} | Total: ${quote.total}</p>
            </div>
            <div class="quote-actions">
                <button class="btn btn-sm btn-primary" onclick="viewQuote(${index})">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteQuote(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

function viewQuote(index) {
    const savedQuotes = JSON.parse(localStorage.getItem('econirva_quotes') || '[]');
    const quote = savedQuotes.reverse()[index];
    
    const previewHTML = generateQuoteHTML(quote);
    document.getElementById('preview-content').innerHTML = previewHTML;
    document.getElementById('preview-modal').classList.add('active');
}

function deleteQuote(index) {
    if (confirm('Delete this quotation?')) {
        const savedQuotes = JSON.parse(localStorage.getItem('econirva_quotes') || '[]');
        savedQuotes.reverse().splice(index, 1);
        localStorage.setItem('econirva_quotes', JSON.stringify(savedQuotes.reverse()));
        loadSavedQuotations();
    }
}

function loadProductsCatalog() {
    const container = document.getElementById('products-catalog');
    container.innerHTML = APP_DATA.products.map((product, index) => `
        <div class="product-card">
            <h4>${product.name}</h4>
            <p class="price">₹${product.priceInclGST}/kg</p>
            <p style="font-size: 12px; color: #666;">Excl. GST: ₹${product.priceExclGST}/kg</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">${product.category}</p>
            <div style="margin-top: 15px; display: flex; gap: 8px; justify-content: center;">
                <button class="btn btn-sm btn-primary" onclick="editProduct(${index})">
                    <span class="icon">✏️</span> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${index})">
                    <span class="icon">🗑️</span> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function loadCustomersList() {
    const container = document.getElementById('customers-list');
    
    if (APP_DATA.customers.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No customers yet. Click "Add Customer" to get started.</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Customer Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${APP_DATA.customers.map((customer, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${customer}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editCustomer(${index})">
                                <span class="icon">✏️</span> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${index})">
                                <span class="icon">🗑️</span> Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Customer Management Functions
function addNewCustomer() {
    showCustomerModal();
}

function editCustomer(index) {
    showCustomerModal(APP_DATA.customers[index], index);
}

function deleteCustomer(index) {
    if (confirm(`Delete customer "${APP_DATA.customers[index]}"?`)) {
        APP_DATA.customers.splice(index, 1);
        loadCustomers();
        loadCustomersList();
        saveToLocalStorage();
    }
}

function showCustomerModal(customerName = null, index = null) {
    const isEdit = customerName !== null;
    const modalHTML = `
        <div class="modal active" id="customer-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? '✏️ Edit Customer' : '➕ Add New Customer'}</h3>
                    <button class="modal-close" onclick="closeCustomerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form" onsubmit="saveCustomer(event, ${index})">
                        <div class="form-group">
                            <label>Customer Name *</label>
                            <input type="text" id="customer-name-input" value="${customerName || ''}" required placeholder="Enter customer name" autofocus>
                        </div>
                        
                        <p style="font-size: 12px; color: #666; margin-top: 10px;">
                            💡 This name will appear in the customer dropdown when creating quotations.
                        </p>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeCustomerModal()">Cancel</button>
                    <button type="submit" form="customer-form" class="btn btn-success">
                        <span class="icon">💾</span> Save Customer
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('customer-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.remove();
    }
}

function saveCustomer(event, index) {
    event.preventDefault();
    
    const customerName = document.getElementById('customer-name-input').value.trim();
    
    if (!customerName) {
        alert('Please enter a customer name');
        return;
    }
    
    // Check for duplicates (except when editing the same customer)
    const isDuplicate = APP_DATA.customers.some((cust, idx) => {
        return cust.toLowerCase() === customerName.toLowerCase() && idx !== index;
    });
    
    if (isDuplicate) {
        alert('A customer with this name already exists!');
        return;
    }
    
    if (index !== null) {
        // Edit existing customer
        APP_DATA.customers[index] = customerName;
    } else {
        // Add new customer
        APP_DATA.customers.push(customerName);
    }
    
    // Sort customers alphabetically
    APP_DATA.customers.sort();
    
    loadCustomers();
    loadCustomersList();
    updateProductDropdowns();
    saveToLocalStorage();
    closeCustomerModal();
}

// Add Customer button event listener
document.getElementById('add-customer-btn')?.addEventListener('click', () => {
    addNewCustomer();
});

// Product Management Functions
function addNewProduct() {
    showProductModal();
}

function editProduct(index) {
    showProductModal(APP_DATA.products[index], index);
}

function deleteProduct(index) {
    if (confirm(`Delete "${APP_DATA.products[index].name}"?`)) {
        APP_DATA.products.splice(index, 1);
        loadProductsCatalog();
        updateProductDropdowns();
        saveToLocalStorage();
    }
}

function showProductModal(product = null, index = null) {
    const isEdit = product !== null;
    const modalHTML = `
        <div class="modal active" id="product-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                    <button class="modal-close" onclick="closeProductModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="product-form" onsubmit="saveProduct(event, ${index})">
                        <div class="form-group">
                            <label>Product Name *</label>
                            <input type="text" id="product-name" value="${product?.name || ''}" required placeholder="e.g., Normal Grade - Milk White">
                        </div>
                        
                        <div class="form-group">
                            <label>Category *</label>
                            <input type="text" id="product-category" value="${product?.category || ''}" required placeholder="e.g., Standard, Premium">
                        </div>
                        
                        <div class="form-row" style="margin-bottom: 0;">
                            <div class="form-group">
                                <label>Price Excl. GST (₹/kg) *</label>
                                <input type="number" id="product-price-excl" value="${product?.priceExclGST || ''}" step="0.01" required placeholder="153.60" onchange="calculateGSTPrice()">
                            </div>
                            
                            <div class="form-group">
                                <label>Price Incl. GST (₹/kg) *</label>
                                <input type="number" id="product-price-incl" value="${product?.priceInclGST || ''}" step="0.01" required placeholder="161.00" readonly style="background: #f5f5f5;">
                            </div>
                        </div>
                        
                        <p style="font-size: 12px; color: #666; margin-top: 10px;">
                            💡 Enter price excluding GST. Price with GST will be calculated automatically (5% GST)
                        </p>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeProductModal()">Cancel</button>
                    <button type="submit" form="product-form" class="btn btn-success">
                        <span class="icon">💾</span> Save Product
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('product-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function calculateGSTPrice() {
    const priceExcl = parseFloat(document.getElementById('product-price-excl').value) || 0;
    const priceIncl = (priceExcl * 1.05).toFixed(2);
    document.getElementById('product-price-incl').value = priceIncl;
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.remove();
    }
}

function saveProduct(event, index) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value.trim(),
        category: document.getElementById('product-category').value.trim(),
        priceExclGST: parseFloat(document.getElementById('product-price-excl').value),
        priceInclGST: parseFloat(document.getElementById('product-price-incl').value)
    };
    
    if (index !== null) {
        // Edit existing product
        APP_DATA.products[index] = productData;
    } else {
        // Add new product
        APP_DATA.products.push(productData);
    }
    
    closeProductModal();
    loadProductsCatalog();
    updateProductDropdowns();
    saveToLocalStorage();
    
    alert(index !== null ? 'Product updated successfully!' : 'Product added successfully!');
}

function updateProductDropdowns() {
    // Update all product dropdowns in the form
    const productSelects = document.querySelectorAll('.product-type');
    productSelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = APP_DATA.products.map(p => 
            `<option value="${p.priceInclGST}">${p.name} - ₹${p.priceInclGST}/kg</option>`
        ).join('');
        
        // Try to restore previous selection
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('econirva_products', JSON.stringify(APP_DATA.products));
    localStorage.setItem('econirva_customers', JSON.stringify(APP_DATA.customers));
}

function loadFromLocalStorage() {
    const savedProducts = localStorage.getItem('econirva_products');
    const savedCustomers = localStorage.getItem('econirva_customers');
    
    if (savedProducts) {
        APP_DATA.products = JSON.parse(savedProducts);
    }
    
    if (savedCustomers) {
        APP_DATA.customers = JSON.parse(savedCustomers);
    }
}

// Load saved data on startup
loadFromLocalStorage();

console.log('ECONIRVA Quotation Generator v1.0.0 - Ready! 🌿');
