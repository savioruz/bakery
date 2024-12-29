import './style.css'
import { 
  showAuthModal, 
  generateCaptcha, 
  handleSignIn, 
  handleRegister, 
  handleLogout 
} from './auth.js';

const button = document.querySelector('.btn');
button.addEventListener('click', () => {
  alert('Button clicked!');
});

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get the theme toggle checkbox
  const themeToggle = document.querySelector('.swap input[type="checkbox"]');
  
  // Check if there's a saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
  }

  // Add event listener for theme toggle
  themeToggle.addEventListener('change', (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
});

// Menu item active state
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    // Remove active class from all menu items
    menuItems.forEach(menuItem => {
      menuItem.classList.remove('active');
      menuItem.classList.remove('border-primary');
    });
    
    // Add active class to clicked item
    item.classList.add('active');
    item.classList.add('border-primary');
  });
});

// Set initial active state
const currentPage = 'index'; // You can change this based on current page
const activeItem = document.querySelector(`.menu-item[data-page="${currentPage}"]`);
if (activeItem) {
  activeItem.classList.add('active');
  activeItem.classList.add('border-primary');
}

// Menu tabs functionality
const menuTabs = document.querySelectorAll('.tabs .tab');
if (menuTabs.length > 0) {
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      menuTabs.forEach(t => t.classList.remove('tab-active'));
      // Add active class to clicked tab
      tab.classList.add('tab-active');
      
      // Here you can add logic to filter menu items based on category
      const category = tab.textContent.toLowerCase();
      // ... filtering logic ...
    });
  });
}

// Handle menu item links
const menuLinks = document.querySelectorAll('a[href^="menu.html"]');
menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const category = link.getAttribute('href').split('#')[1];
    if (category) {
      localStorage.setItem('activeCategory', category);
    }
  });
});

// Set active menu item based on current page
// const currentPage = window.location.pathname.split('/').pop() || 'index.html';
// const menuItems = document.querySelectorAll('.menu a');
// menuItems.forEach(item => {
//   if (item.getAttribute('href') === currentPage) {
//     item.classList.add('active');
//   }
// });

// Shopping cart functionality
let cartItems = [];
const cartCount = document.querySelector('.indicator-item');
const cartSubtotal = document.querySelector('.text-info');
const cartItemCount = document.querySelector('.text-lg.font-bold');

// Add to cart functionality
const addToCartButtons = document.querySelectorAll('.card-actions .btn-primary');
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Check if user is logged in
    if (!currentUser) {
      showToast('Please sign in to add items to cart!');
      showAuthModal('signin');
      return;
    }

    // Get product details from the card
    const card = button.closest('.card');
    const productName = card.querySelector('.card-title').textContent;
    const productPrice = card.querySelector('.text-primary').textContent;
    const productImage = card.querySelector('img').src;

    // Create product object
    const product = {
      name: productName,
      price: parseFloat(productPrice.replace('Rp. ', '').replace(',', '')),
      image: productImage
    };

    // Add to cart array
    cartItems.push(product);

    // Update cart UI
    updateCartUI();

    // Show success notification
    showToast('Product added to cart!');
  });
});

// Get the cart dropdown content
const cartDropdown = document.querySelector('.dropdown-content .card-body');

function updateCartUI() {
  // Update cart count
  cartCount.textContent = cartItems.length;
  cartItemCount.textContent = `${cartItems.length} Items`;

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  cartSubtotal.textContent = `Subtotal: Rp. ${subtotal.toLocaleString()}`;

  // Update cart dropdown content
  if (cartDropdown) {
    // Clear existing content except the last button
    while (cartDropdown.children.length > 3) {
      cartDropdown.removeChild(cartDropdown.firstChild);
    }

    // Add cart items
    cartItems.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'flex items-center gap-2 mb-2 border-b pb-2';
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-lg">
        <div class="flex-1">
          <p class="text-sm font-semibold">${item.name}</p>
          <p class="text-xs text-primary">Rp. ${item.price.toLocaleString()}</p>
        </div>
        <button class="btn btn-ghost btn-xs text-error" onclick="removeFromCart(${index})">×</button>
      `;
      
      // Insert before the count element
      cartDropdown.insertBefore(itemElement, cartDropdown.firstChild);
    });
  }
}

// Add remove from cart functionality
window.removeFromCart = function(index) {
  cartItems.splice(index, 1);
  updateCartUI();
  showToast('Item removed from cart');
};

// Modify the cart dropdown HTML in both index.html and menu.html
const cartHTML = `
  <div class="card-body">
    <!-- Cart items will be inserted here -->
    <span class="text-lg font-bold">${cartItems.length} Items</span>
    <span class="text-info">Subtotal: Rp. 0</span>
    <div class="card-actions">
      <button class="btn btn-primary btn-block" onclick="showCartModal()">View cart</button>
    </div>
  </div>
`;

// Add modal HTML to the body
document.body.insertAdjacentHTML('beforeend', `
  <dialog id="cart-modal" class="modal">
    <div class="modal-box w-11/12 max-w-3xl">
      <h3 class="font-bold text-lg mb-4">Shopping Cart</h3>
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Name</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="cart-items">
            <!-- Cart items will be inserted here -->
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" class="text-right font-bold">Total:</td>
              <td colspan="2" class="font-bold text-primary" id="cart-total"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="modal-action">
        <button class="btn btn-primary" onclick="proceedToCheckout()">Proceed to Checkout</button>
        <button class="btn" onclick="closeCartModal()">Close</button>
      </div>
    </div>
  </dialog>
`);

// Add modal functionality
window.showCartModal = function() {
  const modal = document.getElementById('cart-modal');
  const tbody = document.getElementById('cart-items');
  const totalElement = document.getElementById('cart-total');
  
  // Clear existing items
  tbody.innerHTML = '';
  
  // Add cart items to table
  cartItems.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
      </td>
      <td>${item.name}</td>
      <td>Rp. ${item.price.toLocaleString()}</td>
      <td>
        <button class="btn btn-error btn-sm" onclick="removeFromCart(${index})">Remove</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Update total
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  totalElement.textContent = `Rp. ${total.toLocaleString()}`;
  
  modal.showModal();
};

window.closeCartModal = function() {
  const modal = document.getElementById('cart-modal');
  modal.close();
};

window.proceedToCheckout = function() {
  if (!currentUser) {
    showToast('Please sign in to checkout!');
    showAuthModal('signin');
    return;
  }

  if (cartItems.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  // Show address modal
  showAddressModal();
};

// Add address modal functionality
window.showAddressModal = function() {
  const modal = document.getElementById('address-modal');
  modal.showModal();
};

// Handle address submission and generate receipt
window.handleAddressSubmit = function(event) {
  event.preventDefault();
  
  // Get address details
  const addressData = {
    address_line: document.getElementById('address_line').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    postal_code: document.getElementById('postal_code').value,
    country: document.getElementById('country').value
  };

  // Close address modal
  document.getElementById('address-modal').close();

  // Generate receipt with address
  generateReceipt(addressData);
};

// Generate receipt with address
function generateReceipt(addressData) {
  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const date = new Date().toLocaleDateString('en-ID');
  const time = new Date().toLocaleTimeString('en-ID');
  const invoiceNumber = 'INV' + Date.now().toString().slice(-8);

  // Create PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text('Bake & Bloom', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Receipt', 105, 30, { align: 'center' });

  // Add invoice details
  doc.setFontSize(10);
  doc.text([
    `Invoice Number: ${invoiceNumber}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Customer: ${currentUser.username}`,
    `Email: ${currentUser.email}`,
    '',
    'Shipping Address:',
    `${addressData.address_line}`,
    `${addressData.city}, ${addressData.state} ${addressData.postal_code}`,
    `${addressData.country}`
  ], 15, 40);

  // Add items table
  const tableData = cartItems.map(item => [
    item.name,
    'Rp. ' + item.price.toLocaleString()
  ]);

  doc.autoTable({
    startY: 90,
    head: [['Item', 'Price']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [156, 39, 176] },
    foot: [['Total', 'Rp. ' + total.toLocaleString()]],
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  // Save the PDF
  doc.save(`BakeAndBloom_Receipt_${invoiceNumber}.pdf`);

  // Clear cart after successful checkout
  cartItems = [];
  updateCartUI();
  showToast('Thank you for your purchase! Download started.');
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-end';
  toast.innerHTML = `
    <div class="alert alert-info">
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Add auth modal HTML to the body
document.body.insertAdjacentHTML('beforeend', `
  <dialog id="auth-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4" id="auth-title">Sign In</h3>
      
      <!-- Sign In Form -->
      <form id="signinForm" class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input type="email" placeholder="email@example.com" class="input input-bordered" required />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input type="password" placeholder="Enter your password" class="input input-bordered" required />
        </div>
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary">Sign In</button>
        </div>
        <p class="text-sm text-center">
          Don't have an account? 
          <a onclick="showAuthModal('register')" class="text-primary cursor-pointer">Register</a>
        </p>
      </form>

      <!-- Register Form -->
      <form id="registerForm" class="space-y-4 hidden">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Username</span>
          </label>
          <input type="text" placeholder="Enter your username" class="input input-bordered" required />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input type="email" placeholder="email@example.com" class="input input-bordered" required />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input type="password" placeholder="Enter your password" class="input input-bordered" required />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Phone</span>
          </label>
          <input type="tel" placeholder="Enter your phone number" class="input input-bordered" required />
        </div>
        
        <!-- Address Fields -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Address Line</span>
          </label>
          <input type="text" name="address_line" placeholder="Enter your address" class="input input-bordered" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">City</span>
            </label>
            <input type="text" name="city" placeholder="City" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">State</span>
            </label>
            <input type="text" name="state" placeholder="State" class="input input-bordered" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Postal Code</span>
            </label>
            <input type="text" name="postal_code" placeholder="Postal Code" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Country</span>
            </label>
            <input type="text" name="country" placeholder="Country" class="input input-bordered" required />
          </div>
        </div>
        
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary">Register</button>
        </div>
        <p class="text-sm text-center">
          Already have an account? 
          <a onclick="showAuthModal('signin')" class="text-primary cursor-pointer">Sign In</a>
        </p>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
`);

// Add authentication functionality
let currentUser = null;

window.showAuthModal = function(mode) {
  const modal = document.getElementById('auth-modal');
  const signinForm = document.getElementById('signinForm');
  const registerForm = document.getElementById('registerForm');
  const authTitle = document.getElementById('auth-title');

  if (mode === 'signin') {
    authTitle.textContent = 'Sign In';
    signinForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    authTitle.textContent = 'Register';
    signinForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }

  modal.showModal();
};

// Handle form submissions
document.getElementById('signinForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelector('input[type="password"]').value;

  try {
    const response = await fetch(`${baseUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', data.data.access_token);
    localStorage.setItem('refreshToken', data.data.refresh_token);

    // Fetch user details using the access token
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${data.data.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user details');
    }

    const userData = await userResponse.json();
    
    // Handle successful login
    handleLogin({
      username: userData.data.name,
      email: userData.data.email,
      id: userData.data.id
    });

    document.getElementById('auth-modal').close();
    showToast('Successfully signed in!');
  } catch (error) {
    console.error('Login error:', error);
    showToast('Invalid email or password!');
  }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = this.querySelector('input[type="text"]').value;
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelector('input[type="password"]').value;
  const phone = this.querySelector('input[type="tel"]').value; // Add phone input to your form
  
  // Get address fields
  const addressData = {
    address_line: this.querySelector('input[name="address_line"]').value,
    city: this.querySelector('input[name="city"]').value,
    state: this.querySelector('input[name="state"]').value,
    postal_code: this.querySelector('input[name="postal_code"]').value,
    country: this.querySelector('input[name="country"]').value
  };

  try {
    const response = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username,
        email: email,
        password: password,
        phone: phone,
        address: addressData
      })
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    
    // Handle successful registration
    handleLogin({
      username: data.data.name,
      email: data.data.email,
      id: data.data.id
    });
    
    document.getElementById('auth-modal').close();
    showToast('Successfully registered!');
    
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Registration failed. Please try again.');
  }
});

function handleLogin(user) {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Update UI
  document.getElementById('signedOutItems').classList.add('hidden');
  document.getElementById('signedInItems').classList.remove('hidden');
  document.getElementById('profileName').textContent = user.username;
}

window.handleLogout = function() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Update UI
  document.getElementById('signedOutItems').classList.remove('hidden');
  document.getElementById('signedInItems').classList.add('hidden');
  showToast('Successfully logged out!');
};

// Check for existing login on page load
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
  handleLogin(JSON.parse(savedUser));
}

// Search functionality
const searchData = {
  products: [
    { name: 'Chocolate Cake', category: 'Cakes', url: '/menu.html#cakes' },
    { name: 'Croissant', category: 'Pastries', url: '/menu.html#pastries' },
    { name: 'Sourdough Bread', category: 'Breads', url: '/menu.html#breads' },
    // Add more searchable items here
  ],
  pages: [
    { name: 'Home', url: '/index.html' },
    { name: 'Menu', url: '/menu.html' },
    { name: 'About Us', url: '/about.html' },
  ]
};

window.handleSearch = function() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const query = searchInput.value.toLowerCase();

  // Clear previous results
  searchResults.innerHTML = '';

  if (query.length < 2) {
    return;
  }

  // Search products
  const productResults = searchData.products.filter(product => 
    product.name.toLowerCase().includes(query) || 
    product.category.toLowerCase().includes(query)
  );

  // Search pages
  const pageResults = searchData.pages.filter(page =>
    page.name.toLowerCase().includes(query)
  );

  // Display results
  if (productResults.length === 0 && pageResults.length === 0) {
    searchResults.innerHTML = `
      <div class="text-sm text-base-content/70">
        No results found for "${query}"
      </div>
    `;
    return;
  }

  // Add page results
  if (pageResults.length > 0) {
    searchResults.innerHTML += `
      <div class="text-sm font-bold mb-2">Pages</div>
      ${pageResults.map(page => `
        <a href="${page.url}" class="block p-2 hover:bg-base-200 rounded-lg">
          ${page.name}
        </a>
      `).join('')}
    `;
  }

  // Add product results
  if (productResults.length > 0) {
    searchResults.innerHTML += `
      <div class="text-sm font-bold mb-2 mt-4">Products</div>
      ${productResults.map(product => `
        <a href="${product.url}" class="block p-2 hover:bg-base-200 rounded-lg">
          ${product.name} <span class="text-sm text-base-content/70">${product.category}</span>
        </a>
      `).join('')}
    `;
  }
};

// Add event listener for real-time search
document.getElementById('searchInput')?.addEventListener('input', handleSearch);

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const searchDropdown = document.querySelector('.dropdown-content');
  const searchButton = document.querySelector('.dropdown .btn-circle');
  
  if (!searchDropdown?.contains(event.target) && !searchButton?.contains(event.target)) {
    searchDropdown?.removeAttribute('open');
  }
});

// Make functions available globally
window.showAuthModal = showAuthModal;
window.generateCaptcha = generateCaptcha;
window.handleLogout = handleLogout;

// Add event listeners when document loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize CAPTCHA if on a page with auth modal
  if (document.getElementById('captchaText')) {
    generateCaptcha();
  }

  // Add form submit handlers
  document.getElementById('signinForm')?.addEventListener('submit', handleSignIn);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

  // Check for existing login
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    handleLogin(JSON.parse(savedUser));
  }
});

// Function to fetch products
async function fetchProducts(page = 1, limit = 8) {
  try {
    const response = await fetch(`${baseUrl}/products?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    showToast('Failed to load products');
    return null;
  }
}

// Function to render products
function renderProducts(products) {
  const productsGrid = document.querySelector('.grid.grid-cols-1');
  productsGrid.innerHTML = ''; // Clear existing products

  products.forEach(product => {
    const productCard = `
      <div class="card bg-base-100 shadow-lg">
        <figure class="px-4 pt-4">
          <img src="${product.image}" 
               alt="${product.name}" 
               class="rounded-xl h-48 w-full object-cover" />
        </figure>
        <div class="card-body items-center text-center">
          <h2 class="card-title">${product.name}</h2>
          <p class="text-primary font-bold">Rp. ${product.price.toLocaleString()}</p>
          <div class="rating rating-sm">
            <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-warning" />
            <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-warning" />
            <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-warning" />
            <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-warning" checked />
            <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-warning" />
          </div>
          <div class="card-actions">
            <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to cart</button>
          </div>
        </div>
      </div>
    `;
    productsGrid.insertAdjacentHTML('beforeend', productCard);
  });
}

// Function to initialize the menu page
async function initializeMenu() {
  const productsData = await fetchProducts();
  if (productsData && productsData.data) {
    renderProducts(productsData.data);
  }
}

// Search products function
async function searchProducts(query) {
  try {
    const response = await fetch(`${baseUrl}/products/search?name=${query}`);
    if (!response.ok) {
      throw new Error('Failed to search products');
    }
    const data = await response.json();
    if (data.data) {
      renderProducts(data.data);
    }
  } catch (error) {
    console.error('Error searching products:', error);
    showToast('Failed to search products');
  }
}

// Add to cart function (placeholder)
window.addToCart = function(productId) {
  // TODO: Implement add to cart functionality
  console.log('Adding product to cart:', productId);
  showToast('Added to cart!');
};

// Initialize the menu when the page loads
document.addEventListener('DOMContentLoaded', initializeMenu);

// Handle search
document.getElementById('searchInput').addEventListener('input', debounce(async (e) => {
  const query = e.target.value;
  if (query.length >= 3) {
    await searchProducts(query);
  } else if (query.length === 0) {
    initializeMenu();
  }
}, 300));

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
