const baseUrl = import.meta.env.VITE_API_BASE_URL;
let currentDeleteId = null;

// Check if user is admin
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.data.role !== 'admin') {
            window.location.href = '/';
            return;
        }

        // Load products if user is admin
        loadProducts();
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/';
    }
});

// Load products
async function loadProducts() {
    try {
        const response = await fetch(`${baseUrl}/products`);
        const data = await response.json();
        renderProducts(data.data);
        updateStats(data.data);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    }
}

// Render products in table
function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded">
            </td>
            <td>${product.name}</td>
            <td>${product.description}</td>
            <td>Rp. ${product.price.toLocaleString()}</td>
            <td>${product.stock}</td>
            <td>
                <button onclick="editProduct('${product.id}')" class="btn btn-sm btn-info">Edit</button>
                <button onclick="showDeleteModal('${product.id}')" class="btn btn-sm btn-error">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Show product modal for adding/editing
window.showProductModal = function(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        modalTitle.textContent = 'Edit Product';
        // Load product data
        loadProductData(productId);
    } else {
        modalTitle.textContent = 'Add New Product';
        form.reset();
    }
    
    modal.showModal();
};

// Load product data for editing
async function loadProductData(productId) {
    try {
        const response = await fetch(`${baseUrl}/products/${productId}`);
        const data = await response.json();
        const product = data.data;

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.image;
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Failed to load product data');
    }
}

// Handle form submission
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value
    };

    try {
        const token = localStorage.getItem('accessToken');
        const url = productId 
            ? `${baseUrl}/products/${productId}`
            : `${baseUrl}/products`;
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error('Failed to save product');
        }

        showToast(productId ? 'Product updated successfully' : 'Product added successfully');
        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Failed to save product');
    }
});

// Show delete confirmation modal
window.showDeleteModal = function(productId) {
    currentDeleteId = productId;
    document.getElementById('deleteModal').showModal();
};

// Handle delete confirmation
window.confirmDelete = async function() {
    if (!currentDeleteId) return;

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${baseUrl}/products/${currentDeleteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete product');
        }

        showToast('Product deleted successfully');
        closeDeleteModal();
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product');
    }
};

// Close modals
window.closeProductModal = function() {
    document.getElementById('productModal').close();
};

window.closeDeleteModal = function() {
    document.getElementById('deleteModal').close();
    currentDeleteId = null;
};

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast toast-end';
    
    const alertClass = type === 'error' ? 'alert-error' : 
                      type === 'success' ? 'alert-success' : 
                      'alert-info';
    
    toast.innerHTML = `
        <div class="alert ${alertClass}">
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Make functions available globally
window.editProduct = function(productId) {
    showProductModal(productId);
};

// Update stats
function updateStats(products) {
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('outOfStock').textContent = outOfStock;
    document.getElementById('totalValue').textContent = `Rp. ${totalValue.toLocaleString()}`;
} 