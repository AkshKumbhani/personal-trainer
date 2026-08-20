function saveSession(result) {
    localStorage.setItem('user', JSON.stringify(result.user));
    if (result.token) localStorage.setItem('authToken', result.token);
}

document.addEventListener('DOMContentLoaded', function () {
    // AUTH STATUS & NAVBAR
    const user = JSON.parse(localStorage.getItem('user'));
    const adminLink = document.getElementById('adminLink');
    const adminDivider = document.querySelector('.admin-divider');
    const guestLinks = document.querySelectorAll('.guest-only');
    const userLinks = document.querySelectorAll('.user-only');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileMenu = document.querySelector('#mainMenu .nav-links-left');

    // The desktop account dropdown is intentionally compact.  Add clear
    // text actions to the collapsible phone menu so authentication is always
    // discoverable on small screens.
    if (mobileMenu && !mobileMenu.querySelector('.mobile-auth-link')) {
        const mobileActions = user
            ? '<li class="nav-item mobile-auth-link"><a class="nav-link" href="#" data-mobile-logout>LOG OUT</a></li>'
            : '<li class="nav-item mobile-auth-link"><a class="nav-link" href="login.html">LOG IN</a></li><li class="nav-item mobile-auth-link"><a class="nav-link" href="register.html">CREATE ACCOUNT</a></li>';
        mobileMenu.insertAdjacentHTML('beforeend', mobileActions);
    }

    if (user) {
        if (user.role === 'admin') {
            if (adminLink) adminLink.style.display = 'block';
            if (adminDivider) adminDivider.style.display = 'block';
        }
        guestLinks.forEach(l => l.style.display = 'none');
        userLinks.forEach(l => l.style.display = 'block');
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            window.location.reload();
        });
    }

    document.querySelectorAll('[data-mobile-logout]').forEach((mobileLogout) => {
        mobileLogout.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            window.location.reload();
        });
    });

    // TIMER LOGIC
    const timerElements = document.querySelectorAll('.timer');

    timerElements.forEach(timer => {
        let seconds = parseInt(timer.getAttribute('data-seconds'), 10);
        if (isNaN(seconds)) return;

        const updateTimer = () => {
            if (seconds <= 0) return;
            seconds--;
            timer.setAttribute('data-seconds', seconds);

            const days = Math.floor(seconds / (3600 * 24));
            const hours = Math.floor((seconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            timer.innerHTML = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        setInterval(updateTimer, 1000);
        updateTimer();
    });
    // CART DRAWER LOGIC
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartLink = document.querySelector('.cart-link');
    const closeCart = document.getElementById('closeCart');
    const cartDrawerBody = document.getElementById('cartDrawerBody');
    const drawerTotalItems = document.getElementById('drawerTotalItems');
    const drawerSubtotal = document.getElementById('drawerSubtotal');
    const itemCountSpan = document.querySelector('.cart-drawer-header .item-count');
    const cartBadge = document.querySelector('.cart-badge');

    // Cart Page Elements
    const cartPageBody = document.getElementById('cartPageBody');
    const cartPageSubtotal = document.getElementById('cartPageSubtotal');

    let cartData = [];

    const saveCart = () => {
        localStorage.setItem('cartData', JSON.stringify(cartData));
    };

    const loadCart = () => {
        const saved = localStorage.getItem('cartData');
        if (saved) {
            cartData = JSON.parse(saved);
        }
        updateCartUI();
    };

    const openDrawer = (e) => {
        if (e) e.preventDefault();
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('open');
            cartOverlay.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scroll
        }
    };

    const closeDrawer = () => {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('open');
            cartOverlay.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scroll
        }
    };

    const updateCartUI = () => {
        let totalItems = 0;
        let totalPrice = 0;

        // 1. UPDATE DRAWER
        if (cartDrawerBody) {
            const existingItems = cartDrawerBody.querySelectorAll('.cart-item');
            existingItems.forEach(item => item.remove());

            cartData.forEach((item, index) => {
                totalItems += item.qty;
                totalPrice += item.priceVal * item.qty;

                const itemHTML = `
                    <div class="cart-item">
                        <div class="item-img-box">
                            <img src="${item.img}" alt="${item.name}">
                        </div>
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="item-qty-price-row">
                                <div class="qty-control">
                                    <button class="minus" onclick="changeQty(${index}, -1)">-</button>
                                    <input type="text" value="${item.qty}" readonly>
                                    <button class="plus" onclick="changeQty(${index}, 1)">+</button>
                                </div>
                                <span class="cart-item-price">Rs. ${item.priceVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</span>
                            </div>
                            <button class="fa-regular fa-trash-can cart-item-remove" onclick="removeFromCart(${index})"></button>
                        </div>
                    </div>
                `;
                const footerIcons = cartDrawerBody.querySelector('.footer-icons');
                if (footerIcons) {
                    footerIcons.insertAdjacentHTML('beforebegin', itemHTML);
                } else {
                    cartDrawerBody.insertAdjacentHTML('beforeend', itemHTML);
                }
            });

            if (drawerTotalItems) drawerTotalItems.innerText = totalItems;
            if (itemCountSpan) itemCountSpan.innerText = `${totalItems} ITEMS`;
            if (drawerSubtotal) drawerSubtotal.innerText = `Rs. ${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`;

            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                const max = 10000;
                const percent = Math.min((totalPrice / max) * 100, 100);
                progressBar.style.width = percent + '%';
            }
        }

        // 2. UPDATE CART PAGE TABLE
        if (cartPageBody) {
            cartPageBody.innerHTML = '';
            if (cartData.length === 0) {
                cartPageBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 50px;">Your cart is empty.</td></tr>';
            } else {
                cartData.forEach((item, index) => {
                    const rowHTML = `
                        <tr>
                            <td class="product-img">
                                <img src="${item.img}" alt="${item.name}">
                            </td>
                            <td class="product-name">
                                <h4>${item.name}</h4>
                            </td>
                            <td class="product-price">Rs. ${item.priceVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</td>
                            <td class="product-qty">
                                <div class="qty-control">
                                    <button class="minus" onclick="changeQty(${index}, -1)">-</button>
                                    <input type="text" value="${item.qty}" readonly>
                                    <button class="plus" onclick="changeQty(${index}, 1)">+</button>
                                </div>
                            </td>
                            <td class="product-total">
                                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 15px;">
                                    <span>Rs. ${(item.priceVal * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</span>
                                    <button class="fa-regular fa-trash-can cart-item-remove" onclick="removeFromCart(${index})" style="background:none; border:none; padding:0; color:#ff4d4d;"></button>
                                </div>
                            </td>
                        </tr>
                    `;
                    cartPageBody.insertAdjacentHTML('beforeend', rowHTML);
                });
            }
            if (cartPageSubtotal) cartPageSubtotal.innerText = `Rs. ${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`;
        }

        // 3. UPDATE NAVBAR BADGE
        if (cartBadge) {
            totalItems = cartData.reduce((acc, item) => acc + item.qty, 0);
            cartBadge.innerText = totalItems;
        }

        saveCart();
    };

    window.changeQty = (index, delta) => {
        if (cartData[index]) {
            cartData[index].qty += delta;
            if (cartData[index].qty < 1) cartData[index].qty = 1;
            updateCartUI();
        }
    };

    window.removeFromCart = (index) => {
        cartData.splice(index, 1);
        updateCartUI();
    };

    loadCart();

    if (cartLink) cartLink.addEventListener('click', openDrawer);
    if (closeCart) closeCart.addEventListener('click', closeDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeDrawer);

    // WISHLIST LOGIC
    let wishlistData = [];

    const saveWishlist = () => {
        localStorage.setItem('wishlistData', JSON.stringify(wishlistData));
    };

    const loadWishlist = () => {
        const saved = localStorage.getItem('wishlistData');
        if (saved) {
            wishlistData = JSON.parse(saved);
        }
        updateWishlistUI();
    };

    const updateWishlistUI = () => {
        const wishlistContainer = document.getElementById('wishlistContainer');
        const itemCountHeader = document.getElementById('wishlistItemCount');
        const clearAllSection = document.getElementById('clearAllSection');

        if (itemCountHeader) {
            itemCountHeader.innerText = `WISHLIST (${wishlistData.length})`;
        }

        if (wishlistContainer) {
            if (wishlistData.length === 0) {
                wishlistContainer.innerHTML = `
                    <div class="empty-wishlist-msg">
                        <h2>Your wishlist is empty.</h2>
                        <a href="index.html" class="btn-account">Back to Shop <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                `;
                if (clearAllSection) clearAllSection.style.display = 'none';
            } else {
                let tableHTML = `
                    <table class="wishlist-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Details</th>
                                <th>Cart Button</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                wishlistData.forEach((item, index) => {
                    tableHTML += `
                        <tr>
                            <td class="product-img-cell">
                                <img src="${item.img}" alt="${item.name}">
                            </td>
                            <td class="details-cell">
                                <span class="brand-name">${item.brand || 'Personal Trainer'}</span>
                                <span class="product-name">${item.name}</span>
                                <div class="price-row">
                                    <span class="new-price">${item.priceText}</span>
                                </div>
                            </td>
                            <td>
                                <button class="btn-add-cart" onclick="wishlistToCart(${index})">ADD TO CART</button>
                            </td>
                            <td>
                                <button class="delete-btn" onclick="removeFromWishlist(${index})"><i class="fa-regular fa-trash-can"></i></button>
                            </td>
                        </tr>
                    `;
                });

                tableHTML += `</tbody></table>`;
                wishlistContainer.innerHTML = tableHTML;
                if (clearAllSection) clearAllSection.style.display = 'block';
            }
        }
    };

    window.addToWishlist = (product) => {
        const exists = wishlistData.find(item => item.name === product.name);
        if (!exists) {
            wishlistData.push(product);
            saveWishlist();
            updateWishlistUI();
            alert('Item added to wishlist!');
        } else {
            alert('Item is already in your wishlist!');
        }
    };

    window.removeFromWishlist = (index) => {
        wishlistData.splice(index, 1);
        saveWishlist();
        updateWishlistUI();
    };

    window.clearWishlist = () => {
        if (confirm('Are you sure you want to clear your entire wishlist?')) {
            wishlistData = [];
            saveWishlist();
            updateWishlistUI();
        }
    };

    window.wishlistToCart = (index) => {
        const item = wishlistData[index];
        if (item) {
            const priceVal = parseFloat(item.priceText.replace('Rs. ', '').replace(' INR', '').replace(/,/g, ''));
            const existingItem = cartData.find(c => c.name === item.name);
            if (existingItem) {
                existingItem.qty++;
            } else {
                cartData.push({ img: item.img, name: item.name, priceVal: priceVal, qty: 1 });
            }
            updateCartUI();
            openDrawer();
        }
    };

    loadWishlist();

    // Wishlist Heart Icon triggers
    const wishlistIcons = document.querySelectorAll('.card-icons .fa-heart');
    wishlistIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.b-card') || e.target.closest('.product-detail-info');
            if (card) {
                const img = card.querySelector('img') ? card.querySelector('img').src : '';
                const name = (card.querySelector('h5') || card.querySelector('h2')).innerText;
                const priceText = (card.querySelector('.card-bottom h6') || card.querySelector('.price-row')).innerText;
                const brand = card.querySelector('.img-name') ? card.querySelector('.img-name').innerText : 'Personal Trainer';

                window.addToWishlist({ img, name, priceText, brand });
            }
        });
    });

    // RECOMMENDATION SLIDER LOGIC
    const recTrack = document.getElementById('recTrack');
    const recDots = document.querySelectorAll('#recDots .dot');

    if (recTrack && recDots.length > 0) {
        recDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = dot.getAttribute('data-index');
                recTrack.style.transform = `translateX(-${index * 100}%)`;
                recDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    }

    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll('.b-card button, .btn-add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.b-card') || e.target.closest('.product-detail-info');
            if (card) {
                const img = card.querySelector('img') ? card.querySelector('img').src : '';
                const name = (card.querySelector('h5') || card.querySelector('h2')).innerText;
                const priceText = (card.querySelector('.card-bottom h6') || card.querySelector('.price-row')).innerText;
                const priceMatch = priceText.match(/Rs\. ([\d,.]+)/);
                const priceVal = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

                const existingItem = cartData.find(item => item.name === name);
                if (existingItem) {
                    existingItem.qty++;
                } else {
                    cartData.push({ img, name, priceVal, qty: 1 });
                }

                updateCartUI();
                openDrawer();
            }
        });
    });

    // CHECKOUT PAGE LOGIC
    window.updateCheckoutUI = () => {
        const checkoutItemsList = document.getElementById('checkoutItemsList');
        const checkoutTotalItems = document.getElementById('checkoutTotalItems');
        const checkoutSubtotal = document.getElementById('checkoutSubtotal');
        const checkoutTaxes = document.getElementById('checkoutTaxes');
        const checkoutTaxTotal = document.getElementById('checkoutTaxTotal');
        const checkoutGrandTotal = document.getElementById('checkoutGrandTotal');

        if (checkoutItemsList) {
            checkoutItemsList.innerHTML = '';
            let totalPrice = 0;
            let totalItems = 0;

            cartData.forEach(item => {
                totalPrice += item.priceVal * item.qty;
                totalItems += item.qty;

                const itemHTML = `
                    <div class="summary-item">
                        <div class="summary-img-box">
                            <img src="${item.img}" alt="${item.name}">
                            <span class="qty-badge">${item.qty}</span>
                        </div>
                        <div class="summary-item-info">
                            <h4>${item.name}</h4>
                        </div>
                        <span class="summary-item-price">₹ ${(item.priceVal * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                `;
                checkoutItemsList.insertAdjacentHTML('beforeend', itemHTML);
            });

            // Add "Scroll for more items" mock overlay if items exist
            if (cartData.length > 0) {
                const scrollOverlay = `
                    <div class="scroll-overlay">
                        <span>Scroll for more items <i class="fa-solid fa-arrow-down"></i></span>
                    </div>
                `;
                checkoutItemsList.insertAdjacentHTML('beforeend', scrollOverlay);
            }

            const taxes = totalPrice * 0.18; // 18% Tax
            const grandTotal = totalPrice + taxes;

            if (checkoutTotalItems) checkoutTotalItems.innerText = totalItems;
            if (checkoutSubtotal) checkoutSubtotal.innerText = `₹${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            if (checkoutTaxes) checkoutTaxes.innerText = `₹${taxes.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            if (checkoutTaxTotal) checkoutTaxTotal.innerText = `₹${taxes.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            if (checkoutGrandTotal) checkoutGrandTotal.innerText = `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        }
    };

    // REGISTRATION LOGIC
    const regForm = document.getElementById('registerForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('reg-password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    if (regForm) {
        regForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(regForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    saveSession(result);
                    alert('Registration successful! Redirecting to home...');
                    window.location.href = 'index.html';
                } else {
                    console.error('Registration failed details:', result);
                    alert('Registration failed: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error during registration catch block:', error);
                alert('An error occurred. Please check console for more details.');
            }
        });
    }

    // LOGIN LOGIC
    const loginForm = document.querySelector('.account-form-body form');
    if (loginForm && document.getElementById('login-email') && document.getElementById('login-password')) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();

                if (result.success) {
                    saveSession(result);
                    alert('Login successful! Redirecting...');
                    window.location.href = 'index.html';
                } else {
                    alert('Login failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again');
            }
        });
    }

    // APPOINTMENT BOOKING LOGIC
    const appointmentBtn = document.getElementById('submitAppointment');
    if (appointmentBtn) {
        appointmentBtn.addEventListener('click', async function (e) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                alert('Please log in to book an appointment.');
                window.location.href = 'login.html';
                return;
            }

            const service = document.getElementById('apptService').value;
            const duration = document.getElementById('apptDuration').value;
            const appointment_date = document.getElementById('apptDate').value;
            const appointment_time = document.getElementById('apptTime').value;
            const additional_info = document.getElementById('apptMessage').value;

            if (!appointment_date || !appointment_time) {
                alert('Please select date and time.');
                return;
            }

            try {
                const response = await fetch('/api/appointments/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        service,
                        duration,
                        appointment_date,
                        appointment_time,
                        additional_info
                    })
                });
                const result = await response.json();

                if (result.success) {
                    alert('Appointment booked successfully!');
                    window.location.href = 'index.html';
                } else {
                    alert('Booking failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error booking appointment:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    // Call dynamic content loading
    if (typeof window.loadDynamicContent === 'function') {
        window.loadDynamicContent();
    }

    window.addToCartFromDynamic = (img, name, priceVal, productId) => {
        const existingItem = cartData.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty++;
        } else {
            cartData.push({ img, name, priceVal: parseFloat(priceVal), productId, qty: 1 });
        }
        updateCartUI();
        openDrawer();
    };
});

// BESTSELLER SLIDER LOGIC
function slideLeft() {
    const slider = document.getElementById('bestsellerSlider');
    if (slider) {
        slider.scrollBy({ left: -300, behavior: 'smooth' });
    }
}

// DYNAMIC CONTENT LOADING
window.loadDynamicContent = async function () {
    // 1. Fetch Trainers for the top "PERSONAL TRAININGS" section
    const trainingContainer = document.getElementById('dynamicTrainingContainer');
    if (trainingContainer) {
        try {
            const res = await fetch('/api/trainers');
            const data = await res.json();
            if (data.success && data.trainers.length > 0) {
                trainingContainer.innerHTML = data.trainers.map(trainer => `
                    <div class="training-card" style="background: #000; border: 1px solid #1a1a1a;">
                        <div class="card-image" style="background-image:url('${trainer.image_url}');">
                        </div>
                        <div class="card-content" style="color: #fff;">
                            <span class="badge" style="background: #ccff00; color: #000;">BEST ONLINE</span>
                            <h2 style="color: #fff; margin-top: 15px;">${trainer.specialty || trainer.name}</h2>
                            <p style="color: #ccc;">${trainer.description}</p>
                            <a href="appointment.html?trainer=${trainer.id}" class="btn-readmore text-black" style="color: #ccff00; border-color: #ccff00;">READ MORE <i class="fa-solid fa-angles-right"></i></a>
                        </div>
                    </div>
                `).join('');
            }
        } catch (e) {
            console.error('Error fetching training programs:', e);
        }
    }

    // 2. Fetch Trainers for the spotlight carousel section
    const trainerContainer = document.getElementById('dynamicTrainerCard');
    if (trainerContainer) {
        try {
            const res = await fetch('/api/trainers');
            const data = await res.json();
            if (data.success && data.trainers.length > 0) {
                // Map all trainers into HTML blocks
                trainerContainer.innerHTML = data.trainers.map(trainer => `
                    <div class="trainer-card-inner-item" style="margin-bottom: 25px; background: #111; border: 1px solid #222; border-radius: 4px; overflow: hidden; color: #fff;">
                        <img src="${trainer.image_url}" alt="${trainer.name}" style="width: 100%; height: 210px; object-fit: cover;">
                        <div class="trainer-card-body" style="padding: 20px;">
                            <span class="trainer-tag" style="color: #c6ff00; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Professional Trainer</span>
                            <h3 style="color: #fff; margin: 10px 0 5px; font-size: 22px; font-weight: 800;">${trainer.name}</h3>
                            <h4 style="color: #ccff00; font-size: 14px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase;">${trainer.specialty}</h4>
                            <p style="color: #ccc; font-size: 14px; line-height: 1.5; margin-bottom: 15px;">${trainer.description}</p>
                            <a href="appointment.html" class="btn-read-more-double" style="color: #ccff00; text-decoration: none; font-weight: 800; font-size: 12px; display: inline-flex; align-items: center; gap: 8px;">BOOK SESSION <i class="fa-solid fa-angles-right"></i></a>
                        </div>
                    </div>
                `).join('');

                // If there are multiple trainers, make the container scrollable to maintain the 3-column layout
                if (data.trainers.length > 1) {
                    trainerContainer.style.background = 'transparent';
                    trainerContainer.style.maxHeight = '520px';
                    trainerContainer.style.overflowY = 'auto';
                    trainerContainer.style.paddingRight = '12px';
                    trainerContainer.style.border = 'none';
                } else {
                    // For a single trainer, remove the specific inner item background to blend with the card-style
                    const firstItem = trainerContainer.querySelector('.trainer-card-inner-item');
                    if (firstItem) {
                        firstItem.style.border = 'none';
                        firstItem.style.marginBottom = '0';
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching trainers:', e);
        }
    }

    // 2. Fetch Plans for Homepage
    const plansContainer = document.getElementById('dynamicPlansContainer');
    if (plansContainer) {
        try {
            const res = await fetch('/api/plans');
            const data = await res.json();
            if (data.success && data.plans.length > 0) {
                plansContainer.innerHTML = '';
                const displayPlans = data.plans.slice(0, 2);
                displayPlans.forEach((plan, idx) => {
                    const isHighlight = idx === 0 ? 'highlight' : '';
                    const badge = idx === 0 ? '<div class="card-badge">RECOMMENDED BY USERS</div>' : '';
                    const imgUrl = idx === 0 ? 'https://personaltrainer-workdo.myshopify.com/cdn/shop/files/pro-img-1.png?v=1684921182' : 'https://personaltrainer-workdo.myshopify.com/cdn/shop/files/pro-img-2.png?v=1684921182';

                    plansContainer.insertAdjacentHTML('beforeend', `
                        <div class="membership-card ${isHighlight}" style="min-width: 360px; background: #050505; border: 1px solid #222; color: #fff;">
                            ${badge}
                            <img src="${imgUrl}" alt="${plan.name}">
                            <div class="card-body" style="text-align: left; color: #fff;">
                                <h3 style="text-align: left; color: #fff;">${plan.name}</h3>
                                <p style="text-align: left; color: #ccc;">${plan.description}</p>
                                <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center;">
                                    <span class="price" style="white-space: nowrap; margin-right: 15px; color: #fff;">Rs. ${parseFloat(plan.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</span>
                                    <a href="appointment.html" class="select-btn" style="white-space: nowrap; background: #ccff00; color: #000;">SELECT ⟶</a>
                                </div>
                            </div>
                        </div>
                    `);
                });
            }
        } catch (e) {
            console.error('Error fetching plans:', e);
        }
    }

    // 3. Fetch Products for Bestseller Slider (Homepage)
    const bestsellerSlider = document.getElementById('dynamicBestsellerSlider');
    if (bestsellerSlider) {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success && data.products.length > 0) {
                bestsellerSlider.innerHTML = '';
                data.products.forEach(product => {
                    const priceString = `Rs. ${parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`;
                    const safeName = product.name.replace(/'/g, "\\'");
                    bestsellerSlider.insertAdjacentHTML('beforeend', `
                        <div class="b-card">
                            <div class="img-box">
                                <div class="card-icons">
                                    <i class="fa-regular fa-heart" onclick="addToWishlist({img: '${product.image_url}', name: '${safeName}', priceText: '${priceString}', brand: '${product.category}'})"></i>
                                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                                    <i class="fa-regular fa-eye"></i>
                                </div>
                                <img src="${product.image_url}" alt="${product.name}">
                            </div>
                            <span class="img-name">${product.category}</span>
                            <h5>${product.name}</h5>
                            <div class="rating">★★★★★</div>
                            <p>${product.description || ''}</p>
                            <div class="card-bottom">
                                <h6>${priceString}</h6>
                                <button onclick="addToCartFromDynamic('${product.image_url}', '${safeName}', '${product.price}', '${product.id}')">ADD TO CART →</button>
                            </div>
                        </div>
                    `);
                });
            }
        } catch (e) {
            console.error('Error fetching products:', e);
        }
    }

    // 4. Fetch Products for Collection Grid (Category Pages)
    const productGrid = document.getElementById('dynamicProductGrid');
    const categoryList = document.getElementById('dynamicCategoryList');
    if (productGrid) {
        let allProducts = [];
        let activeCategories = new Set();
        let maxPrice = 20000;
        const initialCategory = productGrid.getAttribute('data-category');

        const renderFilteredProducts = () => {
            const filtered = allProducts.filter(p => {
                const matchesCategory = activeCategories.size === 0 || activeCategories.has(p.category);
                const matchesPrice = parseFloat(p.price) <= maxPrice;
                return matchesCategory && matchesPrice;
            });

            productGrid.innerHTML = '';
            if (filtered.length === 0) {
                productGrid.innerHTML = '<p style="padding:20px;">No products found matching these filters.</p>';
            } else {
                filtered.forEach(product => {
                    const priceString = `Rs. ${parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`;
                    const safeName = product.name.replace(/'/g, "\\'");
                    productGrid.insertAdjacentHTML('beforeend', `
                        <div class="b-card">
                            <div class="img-box">
                                <div class="card-icons">
                                    <i class="fa-regular fa-heart" onclick="addToWishlist({img: '${product.image_url}', name: '${safeName}', priceText: '${priceString}', brand: '${product.category}'})"></i>
                                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                                    <i class="fa-regular fa-eye"></i>
                                </div>
                                <img src="${product.image_url}" alt="${product.name}">
                            </div>
                            <span class="img-name">${product.category}</span>
                            <h5>${product.name}</h5>
                            <div class="rating">★★★★★</div>
                            <p>${product.description || ''}</p>
                            <div class="card-bottom">
                                <h6>${priceString}</h6>
                                <button onclick="addToCartFromDynamic('${product.image_url}', '${safeName}', '${product.price}', '${product.id}')">ADD TO CART →</button>
                            </div>
                        </div>
                    `);
                });
            }
            const productSelectedCount = document.getElementById('productSelectedCount');
            if (productSelectedCount) {
                productSelectedCount.innerText = `${activeCategories.size} selected`;
            }
        };

        window.resetProductFilters = (e) => {
            if (e) e.preventDefault();
            activeCategories.clear();
            const checks = categoryList.querySelectorAll('input');
            checks.forEach(c => c.checked = false);
            maxPrice = 20000;
            const range = document.getElementById('priceRange');
            if (range) range.value = 20000;
            const priceVal = document.getElementById('priceValue');
            if (priceVal) priceVal.innerText = `Rs. 20,000`;
            renderFilteredProducts();
        };

        window.updatePriceFilter = (val) => {
            maxPrice = val;
            const priceVal = document.getElementById('priceValue');
            if (priceVal) priceVal.innerText = `Rs. ${parseInt(val).toLocaleString('en-IN')}`;
            renderFilteredProducts();
        };

        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                allProducts = data.products;

                // Set initial category if the page specifies one AND it matches data
                if (initialCategory) {
                    const hasMatch = allProducts.some(p => p.category.toLowerCase() === initialCategory.toLowerCase());
                    if (hasMatch) {
                        // Find the exact casing from the data to add to the Set
                        const exactCat = allProducts.find(p => p.category.toLowerCase() === initialCategory.toLowerCase()).category;
                        activeCategories.add(exactCat);
                    }
                }

                // Populate Category Filters
                const categories = [...new Set(allProducts.map(p => p.category))].sort();
                if (categoryList) {
                    categoryList.innerHTML = categories.map(cat => `
                        <div class="filter-item">
                            <label>
                                <input type="checkbox" value="${cat}" ${activeCategories.has(cat) ? 'checked' : ''} onchange="this.dispatchEvent(new CustomEvent('productFilterChanged', {bubbles:true}))"> 
                                ${cat}
                            </label>
                            <span>(${allProducts.filter(p => p.category === cat).length})</span>
                        </div>
                    `).join('');

                    categoryList.addEventListener('productFilterChanged', (e) => {
                        const cb = e.target;
                        if (cb.checked) activeCategories.add(cb.value);
                        else activeCategories.delete(cb.value);
                        renderFilteredProducts();
                    });
                }

                renderFilteredProducts();
            }
        } catch (e) {
            console.error('Error fetching product collection:', e);
        }
    }
    // 5. Fetch Cart Drawer Recommendations (Global)
    const recTrack = document.getElementById('recTrack');
    const recDotsTracker = document.getElementById('recDots');
    if (recTrack) {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success && data.products.length > 0) {
                const recProducts = data.products.slice(0, 3);
                recTrack.innerHTML = '';
                if (recDotsTracker) recDotsTracker.innerHTML = '';

                recProducts.forEach((product, idx) => {
                    const priceString = `Rs. ${parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                    const activeClass = idx === 0 ? 'active' : '';

                    recTrack.insertAdjacentHTML('beforeend', `
                        <div class="rec-card">
                            <img src="${product.image_url}" alt="${product.name}">
                            <div class="rec-info">
                                <h4 style="color: black;">${product.name}</h4>
                                <span class="price" style="color: black;">${priceString}</span>
                                <a href="#" class="details-link" style="color: black;">Details</a>
                            </div>
                        </div>
                    `);

                    if (recDotsTracker) {
                        recDotsTracker.insertAdjacentHTML('beforeend', `
                            <div class="dot ${activeClass}" data-index="${idx}"></div>
                        `);
                    }
                });

                if (recDotsTracker) {
                    const dots = recDotsTracker.querySelectorAll('.dot');
                    dots.forEach(dot => {
                        dot.addEventListener('click', () => {
                            const index = dot.getAttribute('data-index');
                            recTrack.style.transform = `translateX(-${index * 100}%)`;
                            dots.forEach(d => d.classList.remove('active'));
                            dot.classList.add('active');
                        });
                    });
                }
            }
        } catch (e) {
            console.error('Error fetching recommendations:', e);
        }
    }
    // 6. Fetch Trainers for the Collection Grid (cross-trainer.html)
    const trainerGrid = document.getElementById('dynamicTrainerGrid');
    const specialtyList = document.getElementById('dynamicSpecialtyList');
    if (trainerGrid) {
        let allTrainers = [];
        let activeFilters = new Set();

        const renderFilteredTrainers = () => {
            const filtered = activeFilters.size === 0
                ? allTrainers
                : allTrainers.filter(t => activeFilters.has(t.specialty));

            trainerGrid.innerHTML = '';
            if (filtered.length === 0) {
                trainerGrid.innerHTML = '<p style="padding:20px;">No trainers found matching these filters.</p>';
            } else {
                filtered.forEach(trainer => {
                    trainerGrid.insertAdjacentHTML('beforeend', `
                        <div class="b-card">
                            <div class="img-box">
                                <div class="card-icons">
                                    <i class="fa-regular fa-heart"></i>
                                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                                    <i class="fa-regular fa-eye"></i>
                                </div>
                                <img src="${trainer.image_url}" alt="${trainer.name}">
                            </div>
                            <span class="img-name">${trainer.specialty}</span>
                            <h5>${trainer.name}</h5>
                            <div class="rating">★★★★★</div>
                            <p>${trainer.description || ''}</p>
                            <div class="card-bottom">
                                <h6 style="font-size: 11px; color: #ccff00;">Professional Personal Trainer</h6>
                                <button onclick="window.location.href='appointment.html?trainer=${trainer.id}'">BOOK NOW →</button>
                            </div>
                        </div>
                    `);
                });
            }
            const collectionTitle = document.getElementById('collectionTitle');
            if (collectionTitle) {
                collectionTitle.querySelector('span').innerText = `(${filtered.length})`;
            }
            const selectedCount = document.getElementById('selectedCount');
            if (selectedCount) {
                selectedCount.innerText = `${activeFilters.size} selected`;
            }
        };

        window.resetTrainerFilters = (e) => {
            if (e) e.preventDefault();
            activeFilters.clear();
            const checks = specialtyList.querySelectorAll('input');
            checks.forEach(c => c.checked = false);
            renderFilteredTrainers();
        };

        try {
            const res = await fetch('/api/trainers');
            const data = await res.json();
            if (data.success) {
                allTrainers = data.trainers;

                // Populate Specialty Filters
                const specialties = [...new Set(allTrainers.map(t => t.specialty))].sort();
                if (specialtyList) {
                    specialtyList.innerHTML = specialties.map(spec => `
                        <div class="filter-item">
                            <label>
                                <input type="checkbox" value="${spec}" onchange="this.dispatchEvent(new CustomEvent('trainerFilterChanged', {bubbles:true}))"> 
                                ${spec}
                            </label>
                            <span>(${allTrainers.filter(t => t.specialty === spec).length})</span>
                        </div>
                    `).join('');

                    specialtyList.addEventListener('trainerFilterChanged', (e) => {
                        const cb = e.target;
                        if (cb.checked) activeFilters.add(cb.value);
                        else activeFilters.delete(cb.value);
                        renderFilteredTrainers();
                    });
                }

                renderFilteredTrainers();
            }
        } catch (e) {
            console.error('Error fetching trainer collection:', e);
        }
    }
}

// GOOGLE LOGIN CALLBACK
window.handleGoogleLogin = async function(response) {
    console.log('Google Login initiated. Response received:', response);
    try {
        const res = await fetch('/api/auth/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential: response.credential })
        });
        
        const result = await res.json();
        console.log('Backend response:', result);

        if (result.success) {
            if (result.requiresOtp) {
                // REDIRECT TO OTP PAGE
                window.location.href = `verify-otp.html?userId=${result.userId}`;
            } else {
                saveSession(result);
                alert('Login successful! Redirecting...');
                window.location.href = 'index.html';
            }
        } else {
            console.error('Login failed:', result.message);
            alert('Google login failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error during Google login fetch:', error);
        alert('An error occurred during Google login. Check console.');
    }
};

// OTP Verification Handler (for the new page)
document.addEventListener('DOMContentLoaded', function() {
    const verifyPageOtpBtn = document.getElementById('verifyPageOtpBtn');
    if (verifyPageOtpBtn) {
        // Get userId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');

        verifyPageOtpBtn.addEventListener('click', async () => {
            const otp = document.getElementById('otpPageInput').value;
            const otpError = document.getElementById('otpPageError');
            
            if (!otp || otp.length !== 6) {
                otpError.innerText = 'Please enter a 6-digit code.';
                otpError.style.display = 'block';
                return;
            }

            try {
                const res = await fetch('/api/auth/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, otp })
                });

                const result = await res.json();
                if (result.success) {
                    saveSession(result);
                    alert('OTP Verified! Redirecting...');
                    window.location.href = 'index.html';
                } else {
                    otpError.innerText = result.message;
                    otpError.style.display = 'block';
                }
            } catch (err) {
                console.error('OTP Verification Error:', err);
                alert('Error verifying OTP. Please try again.');
            }
        });
    }
});
