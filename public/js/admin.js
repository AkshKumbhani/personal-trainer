document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert('Access denied. Admin only.');
        window.location.href = 'index.html';
        return;
    }

    // Attach the signed session token to every protected admin request without
    // changing the dashboard UI or its individual fetch calls.
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        const url = typeof input === 'string' ? input : input.url;
        if (!url.startsWith('/api/admin/') && !url.startsWith('/api/contact/admin/')) {
            return originalFetch(input, init);
        }
        const headers = new Headers(init.headers || {});
        headers.set('Authorization', `Bearer ${localStorage.getItem('authToken') || ''}`);
        return originalFetch(input, { ...init, headers });
    };

    document.getElementById('adminName').innerText = `${user.first_name} ${user.last_name}`;

    // Sidebar navigation
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const sections = document.querySelectorAll('.admin-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            menuItems.forEach(li => li.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === target + 'Section') sec.classList.add('active');
            });

            if (target === 'dashboard') loadDashboard();
            if (target === 'appointments') loadAllAppointments();
            if (target === 'trainers') loadAllTrainers();
            if (target === 'plans') loadAllPlans();
            if (target === 'products') loadAllProducts();
            if (target === 'users') loadAllUsers();
            if (target === 'messages') loadAllMessages();
        });
    });

    // Initial load
    loadDashboard();

    async function loadDashboard() {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                document.getElementById('totalUsers').innerText = data.stats.totalUsers;
                document.getElementById('totalAppointments').innerText = data.stats.totalAppointments;
                document.getElementById('confirmedAppointments').innerText = data.stats.confirmedAppointments;
                document.getElementById('pendingAppointments').innerText = data.stats.pendingAppointments;
            }

            // Load recent for dashboard
            const appRes = await fetch('/api/admin/appointments');
            const appData = await appRes.json();
            if (appData.success) {
                renderAppointmentsTable(appData.appointments.slice(0, 5), 'recentAppointmentsTable');
            }
        } catch (err) {
            console.error('Error loading dashboard:', err);
        }
    }

    async function loadAllAppointments() {
        try {
            const res = await fetch('/api/admin/appointments');
            const data = await res.json();
            if (data.success) {
                renderAppointmentsTable(data.appointments, 'allAppointmentsTable', true);
            }
        } catch (err) {
            console.error('Error loading appointments:', err);
        }
    }

    // Trainer Management
    async function loadAllTrainers() {
        try {
            const res = await fetch('/api/admin/trainers');
            const data = await res.json();
            if (data.success) {
                const tbody = document.querySelector('#trainersTable tbody');
                tbody.innerHTML = data.trainers.map(t => `
                    <tr>
                        <td><img src="${t.image_url}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;"></td>
                        <td>${t.name}</td>
                        <td>${t.specialty}</td>
                        <td>
                            <button class="btn-action btn-confirm" onclick="editTrainer(${JSON.stringify(t).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn-action btn-cancel" onclick="deleteTrainer(${t.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading trainers:', err);
        }
    }

    window.openTrainerModal = () => {
        document.getElementById('trainerModalTitle').innerText = 'Add Trainer';
        document.getElementById('trainerForm').reset();
        document.getElementById('trainerId').value = '';
        document.getElementById('existingTrainerImage').value = '';
        document.getElementById('currentTrainerImageLabel').innerText = '';
        document.getElementById('trainerModal').style.display = 'block';
    };

    window.closeTrainerModal = () => {
        document.getElementById('trainerModal').style.display = 'none';
    };

    window.editTrainer = (trainer) => {
        document.getElementById('trainerModalTitle').innerText = 'Edit Trainer';
        document.getElementById('trainerId').value = trainer.id;
        document.getElementById('trainerName').value = trainer.name;
        document.getElementById('trainerSpecialty').value = trainer.specialty;
        
        const imageUrl = trainer.image_url || '';
        document.getElementById('existingTrainerImage').value = imageUrl;
        document.getElementById('currentTrainerImageLabel').innerText = imageUrl ? `Current Image: ${imageUrl.split('/').pop()}` : 'No image set';
        
        document.getElementById('trainerDesc').value = trainer.description || '';
        document.getElementById('trainerModal').style.display = 'block';
    };

    document.getElementById('trainerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Submitting trainer form...');
        
        try {
            const formData = new FormData(e.target);
            const id = formData.get('id');
            const method = id ? 'PUT' : 'POST';

            console.log('Method:', method);
            console.log('Trainer Name:', formData.get('name'));

            const res = await fetch('/api/admin/trainers', {
                method,
                body: formData 
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server responded with ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            if (data.success) {
                alert(data.message);
                closeTrainerModal();
                loadAllTrainers();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (err) {
            console.error('Error saving trainer:', err);
            alert('Failed to save trainer: ' + err.message);
        }
    });

    window.deleteTrainer = async (id) => {
        if (!confirm('Are you sure you want to delete this trainer?')) return;
        try {
            const res = await fetch(`/api/admin/trainers/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                loadAllTrainers();
            }
        } catch (err) {
            console.error('Error deleting trainer:', err);
        }
    };

    // Plan Management
    async function loadAllPlans() {
        try {
            const res = await fetch('/api/admin/plans');
            const data = await res.json();
            if (data.success) {
                const tbody = document.querySelector('#plansTable tbody');
                tbody.innerHTML = data.plans.map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td>₹${p.price}</td>
                        <td>${p.duration}</td>
                        <td>
                            <button class="btn-action btn-confirm" onclick="editPlan(${JSON.stringify(p).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn-action btn-cancel" onclick="deletePlan(${p.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading plans:', err);
        }
    }

    window.openPlanModal = () => {
        document.getElementById('planModalTitle').innerText = 'Add Plan';
        document.getElementById('planForm').reset();
        document.getElementById('planId').value = '';
        document.getElementById('planDesc').value = '';
        document.getElementById('planModal').style.display = 'block';
    };

    window.closePlanModal = () => {
        document.getElementById('planModal').style.display = 'none';
    };

    window.editPlan = (plan) => {
        document.getElementById('planModalTitle').innerText = 'Edit Plan';
        document.getElementById('planId').value = plan.id;
        document.getElementById('planName').value = plan.name;
        document.getElementById('planPrice').value = plan.price;
        document.getElementById('planDuration').value = plan.duration;
        document.getElementById('planDesc').value = plan.description || '';
        
        // Convert features array/string to comma separated
        let features = plan.features || [];
        if (typeof features === 'string') {
            try { features = JSON.parse(features); } catch (e) { features = []; }
        }
        document.getElementById('planFeatures').value = Array.isArray(features) ? features.join(', ') : '';
        
        document.getElementById('planModal').style.display = 'block';
    };

    document.getElementById('planForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('planId').value;
        
        // Process features: comma separated string to array
        const featuresStr = document.getElementById('planFeatures').value;
        const featuresArray = featuresStr.split(',').map(f => f.trim()).filter(f => f !== '');

        const body = {
            name: document.getElementById('planName').value,
            price: document.getElementById('planPrice').value,
            duration: document.getElementById('planDuration').value,
            description: document.getElementById('planDesc').value,
            features: featuresArray
        };

        const method = id ? 'PUT' : 'POST';
        if (id) body.id = id;

        try {
            const res = await fetch('/api/admin/plans', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                closePlanModal();
                loadAllPlans();
            }
        } catch (err) {
            console.error('Error saving plan:', err);
        }
    });

    window.deletePlan = async (id) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            const res = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                loadAllPlans();
            }
        } catch (err) {
            console.error('Error deleting plan:', err);
        }
    };

    // Product Management
    async function loadAllProducts() {
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            if (data.success) {
                const tbody = document.querySelector('#productsTable tbody');
                tbody.innerHTML = data.products.map(p => `
                    <tr>
                        <td><img src="${p.image_url}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;"></td>
                        <td>${p.name}</td>
                        <td>₹${p.price}</td>
                        <td>${p.category}</td>
                        <td>
                            <button class="btn-action btn-confirm" onclick="editProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn-action btn-cancel" onclick="deleteProduct(${p.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading products:', err);
        }
    }

    window.openProductModal = () => {
        document.getElementById('productModalTitle').innerText = 'Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('existingImage').value = '';
        document.getElementById('currentImageLabel').innerText = '';
        document.getElementById('productModal').style.display = 'block';
    };

    window.closeProductModal = () => {
        document.getElementById('productModal').style.display = 'none';
    };

    window.editProduct = (product) => {
        document.getElementById('productModalTitle').innerText = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        
        const imageUrl = product.image_url || '';
        document.getElementById('existingImage').value = imageUrl;
        document.getElementById('currentImageLabel').innerText = imageUrl ? `Current Image: ${imageUrl.split('/').pop()}` : 'No image set';
        
        document.getElementById('productDesc').value = product.description || '';
        document.getElementById('productModal').style.display = 'block';
    };

    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Submitting product form...');
        
        try {
            const formData = new FormData(e.target);
            const id = formData.get('id');
            const method = id ? 'PUT' : 'POST';

            console.log('Method:', method);
            console.log('Product Name:', formData.get('name'));

            const res = await fetch('/api/admin/products', {
                method,
                body: formData 
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server responded with ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            if (data.success) {
                alert(data.message);
                closeProductModal();
                loadAllProducts();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Failed to save product: ' + err.message);
        }
    });

    window.deleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                loadAllProducts();
            }
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    async function loadAllUsers() {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                const tbody = document.querySelector('#usersTable tbody');
                tbody.innerHTML = data.users.map(u => `
                    <tr>
                        <td>#${u.id}</td>
                        <td>${u.first_name} ${u.last_name}</td>
                        <td>${u.email}</td>
                        <td><span class="status-badge status-confirmed">${u.role}</span></td>
                        <td>${new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading users:', err);
        }
    }

    function renderAppointmentsTable(appointments, tableId, showActions = false) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = appointments.map(a => `
            <tr>
                ${tableId === 'allAppointmentsTable' ? `<td>#${a.id}</td>` : ''}
                <td>
                    <div style="font-weight: 600;">${a.first_name} ${a.last_name}</div>
                    <div style="font-size: 11px; color: #888;">${a.email}</div>
                </td>
                <td>${a.service}</td>
                <td>
                    <div>${new Date(a.appointment_date).toLocaleDateString()}</div>
                    <div style="font-size: 11px; color: #888;">${a.appointment_time}</div>
                </td>
                <td><span class="status-badge status-${a.status}">${a.status}</span></td>
                <td>
                    ${a.status === 'pending' ? `
                        <button class="btn-action btn-confirm" onclick="updateStatus(${a.id}, 'confirmed')">Confirm</button>
                        <button class="btn-action btn-cancel" onclick="updateStatus(${a.id}, 'cancelled')">Cancel</button>
                    ` : '-'}
                </td>
            </tr>
        `).join('');
    }

    window.updateStatus = async (id, status) => {
        try {
            const res = await fetch('/api/admin/appointments/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                alert('Status updated!');
                loadDashboard();
                loadAllAppointments();
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    async function loadAllMessages() {
        try {
            console.log('Fetching messages...');
            const res = await fetch('/api/contact/admin/all');
            
            if (!res.ok) {
                const errorText = await res.text();
                alert('Admin Fetch Error: ' + res.status + ' - ' + errorText);
                return;
            }

            const data = await res.json();
            if (data.success) {
                const tbody = document.querySelector('#messagesTable tbody');
                tbody.innerHTML = data.contacts.map(m => `
                    <tr>
                        <td>${new Date(m.created_at).toLocaleDateString()}</td>
                        <td>
                            <div style="font-weight: 600;">${m.name}</div>
                            <div style="font-size: 11px; color: #888;">${m.email}</div>
                        </td>
                        <td>${m.subject || 'No Subject'}</td>
                        <td><div style="max-width: 300px; font-size: 13px;">${m.message}</div></td>
                        <td>
                            <button class="btn-action btn-cancel" onclick="deleteMessage(${m.id})"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    }

    window.deleteMessage = async (id) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            const res = await fetch(`/api/contact/admin/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                loadAllMessages();
            }
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    };

    document.getElementById('logoutAdmin').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});
