const BASE_URL = '/api/auth';

function showAlert(message, isSuccess, containerId) {
    const alertMessage = document.getElementById(containerId);
    if (!alertMessage) return;
    alertMessage.style.display = 'block';
    alertMessage.innerText = message;
    alertMessage.style.backgroundColor = isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    alertMessage.style.color = isSuccess ? '#34d399' : '#f87171';
    alertMessage.style.border = `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`;
}

async function register() {
    const usernameInput = document.getElementById('regUsername');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('regConfirmPassword');

    if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) return;

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username || !email || !password || !confirmPassword) {
        return showAlert('Please fill all fields', false, 'registerAlert');
    }

    if (password !== confirmPassword) {
        return showAlert('Passwords do not match', false, 'registerAlert');
    }

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const text = await response.text();
        if (response.ok) {
            showAlert('Account created successfully! Redirecting...', true, 'registerAlert');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } else {
            showAlert(text, false, 'registerAlert');
        }
    } catch (error) {
        showAlert('Failed to connect to backend', false, 'registerAlert');
    }
}

async function login() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        return showAlert('Please enter an email and password', false, 'loginAlert');
    }

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const userData = await response.json();
            
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            showAlert("Login successful! Entering dashboard...", true, 'loginAlert');
            
            // Redirect to the newly created dashboard page
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            const text = await response.text();
            showAlert(text, false, 'loginAlert');
        }
    } catch (error) {
        showAlert('Failed to connect to backend', false, 'loginAlert');
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Profile Dropdown Toggle
window.toggleProfileDropdown = function() {
    const dropdown = document.getElementById('profile-dropdown');
    const toggle = document.getElementById('profile-toggle');
    dropdown.classList.toggle('show');
    toggle.classList.toggle('active');
};

// Global Module Switcher
window.showModule = function(moduleId) {
    const modules = document.querySelectorAll('.dashboard-module');
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');

    // Hide all
    modules.forEach(m => m.style.display = 'none');
    navItems.forEach(n => n.classList.remove('active'));

    // Show target
    const targetModule = document.getElementById(moduleId);
    if (targetModule) {
        targetModule.style.display = 'block';
        
        // Update Nav Item Active State
        const navItem = document.querySelector(`[data-target="${moduleId}"]`);
        if (navItem) {
            navItem.classList.add('active');
            pageTitle.innerText = navItem.innerText === 'Live Tracking' ? 'Karur Live Tracking' : navItem.innerText;
        }

        // Close dropdown
        const dropdown = document.getElementById('profile-dropdown');
        const toggle = document.getElementById('profile-toggle');
        if (dropdown) dropdown.classList.remove('show');
        if (toggle) toggle.classList.remove('active');
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const container = document.querySelector('.user-profile-container');
    const dropdown = document.getElementById('profile-dropdown');
    const toggle = document.getElementById('profile-toggle');
    
    if (container && !container.contains(e.target)) {
        if (dropdown) dropdown.classList.remove('show');
        if (toggle) toggle.classList.remove('active');
    }
});

// ----------------------------------------------------
// UI INITIALIZATION (Only runs if on Dashboard)
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    
    // Load User Profile Data
    const userJson = localStorage.getItem('user');
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            const nameSpan = document.getElementById('user-name-display');
            const emailSpan = document.getElementById('user-email-display');
            const avatarDiv = document.getElementById('user-avatar-display');
            
            const displayUsername = user.username || 'User';
            const displayEmail = user.email || 'user@example.com';
            
            if (nameSpan) nameSpan.innerText = displayUsername;
            if (emailSpan) emailSpan.innerText = displayEmail;
            if (avatarDiv) avatarDiv.innerText = displayUsername.charAt(0).toUpperCase();

            // Also update settings fields if they exist
            const settingsName = document.getElementById('settings-username');
            const settingsEmail = document.getElementById('settings-email');
            if (settingsName) settingsName.value = user.username || '';
            if (settingsEmail) settingsEmail.value = user.email || '';
        } catch (e) {
            console.error('Error parsing user data', e);
        }
    } else {
        // Redirect to login if no session found
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }

    // ----------------------------------------------------
    // MAP SYSTEM INITIALIZATION
    // ----------------------------------------------------
    let mapInstance = null;
    
    if (document.getElementById('bus-map')) {
        const karurCoords = [10.9596, 78.0766];
        
        // Define Layers
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        });

        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        });

        // Init Map
        mapInstance = L.map('bus-map', {
            center: karurCoords,
            zoom: 13,
            layers: [osm],
            zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
        
        const baseMaps = { "Street": osm, "Satellite": satellite };
        L.control.layers(baseMaps, null, { position: 'topright' }).addTo(mapInstance);

        // Map Fix
        setTimeout(() => mapInstance.invalidateSize(), 800);

        // Bus Icon Generator
        const getBusIcon = (color) => L.divIcon({
            html: `<div class="bus-pulse-wrapper"><svg viewBox="0 0 24 24" fill="${color}" style="width:32px;height:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))"><path d="M6 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h4v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4S6 2.5 6 6v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S8.67 14 9.5 14s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 14 14.5 14s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H8V6h8v5z"/></svg></div>`,
            className: 'custom-bus-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        // Waypoints
        const waypoints = {
            'trichy': [[10.9596, 78.0766], [10.945, 78.1], [10.93, 78.12], [10.915, 78.15]],
            'paramathi': [[10.9596, 78.0766], [10.94, 78.05], [10.92, 78.02], [10.895, 77.948]],
            'thanthoni': [[10.9596, 78.0766], [10.95, 78.072], [10.94, 78.065]]
        };

        const activeFleet = [
            { id: "TN-47-AF-1234", route: "Karur -> Trichy", path: waypoints['trichy'], step: 0, dir: 1, color: '#6366f1' },
            { id: "MSB-TOWN", route: "K. Paramathi -> Karur", path: waypoints['paramathi'], step: 0, dir: 1, color: '#3b82f6' },
            { id: "EXP-VSB", route: "Karur -> VSB", path: waypoints['trichy'], step: 1, dir: 1, color: '#6366f1' }
        ];

        const markers = {};
        activeFleet.forEach(bus => {
            const start = bus.path[bus.step];
            const marker = L.marker(start, { icon: getBusIcon(bus.color) }).addTo(mapInstance);
            marker.bindPopup(`<b>Bus ${bus.id}</b><br>${bus.route}`);
            markers[bus.id] = marker;
            bus.lat = start[0]; bus.lng = start[1];
        });

        // Movement Loop
        setInterval(() => {
            activeFleet.forEach(bus => {
                const targetIdx = bus.step + bus.dir;
                if (targetIdx < 0 || targetIdx >= bus.path.length) { bus.dir *= -1; return; }
                
                const target = bus.path[targetIdx];
                const lerp = 0.02;
                bus.lat += (target[0] - bus.lat) * lerp;
                bus.lng += (target[1] - bus.lng) * lerp;
                
                if (Math.abs(target[0] - bus.lat) < 0.001 && Math.abs(target[1] - bus.lng) < 0.001) {
                    bus.step = targetIdx;
                }
                
                if (markers[bus.id]) markers[bus.id].setLatLng([bus.lat, bus.lng]);
            });
        }, 1000);
    }


    // Module Nav Switching Logic
    const navItems = document.querySelectorAll('.nav-item');
    const modules = document.querySelectorAll('.dashboard-module');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Hide all modules
            modules.forEach(mod => mod.style.display = 'none');

            // Add active class to clicked nav item
            item.classList.add('active');

            // Show corresponding module
            const targetId = item.getAttribute('data-target');
            if(targetId) {
                document.getElementById(targetId).style.display = 'block';
                pageTitle.innerText = item.innerText === 'Live Tracking' ? 'Karur Live Tracking' : item.innerText;
                
                if(targetId === 'module-tracking' && mapInstance) {
                    setTimeout(() => mapInstance.invalidateSize(), 200);
                }
                

            }
        });
    });



    // Notification Toggle Logic
    window.toggleNotifications = function() {
        const panel = document.getElementById('notification-panel');
        panel.classList.toggle('active');
    };

    // Search Results Logic
    window.searchBuses = function() {
        const resultsContainer = document.getElementById('search-results');
        const list = resultsContainer.querySelector('.results-list');
        
        // Show container
        resultsContainer.style.display = 'block';
        list.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 2rem;">Searching for the best routes...</div>`;

        setTimeout(() => {
            list.innerHTML = `
                <div class="stop-card" style="margin-bottom: 1rem; border-left: 4px solid var(--primary);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin-bottom: 4px;">SuperFast Express (KRR-TN-101)</h4>
                            <p style="font-size: 0.85rem; color: var(--text-muted);">Starts at 09:30 AM | Estimated Arrival: 11:45 AM</p>
                        </div>
                        <span class="badge badge-green">Available</span>
                    </div>
                    <button class="btn-primary btn-sm" style="width: auto; margin-top: 1rem;" onclick="goToMap()">Track Live</button>
                </div>
                <div class="stop-card" style="margin-bottom: 1rem; border-left: 4px solid var(--text-muted);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin-bottom: 4px;">Local City Bus (KRR-L-404)</h4>
                            <p style="font-size: 0.85rem; color: var(--text-muted);">Starts at 10:15 AM | Estimated Arrival: 12:30 PM</p>
                        </div>
                        <span class="badge badge-yellow">Delayed</span>
                    </div>
                    <button class="btn-secondary btn-sm" style="width: auto; margin-top: 1rem;" onclick="goToMap()">View Stop</button>
                </div>
            `;
        }, 1500);
    };

    // Update Profile Logic
    window.updateProfile = async function() {
        const username = document.getElementById('settings-username').value;
        const email = document.getElementById('settings-email').value;
        const password = document.querySelector('#module-settings input[type="password"]').value;
        
        const userJson = localStorage.getItem('user');
        if (!userJson) return;
        const currentUser = JSON.parse(userJson);

        try {
            const response = await fetch(`${BASE_URL}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: currentUser.id,
                    username,
                    email,
                    password
                })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Update UI immediately
                const nameSpan = document.getElementById('user-name-display');
                const emailSpan = document.getElementById('user-email-display');
                const avatarDiv = document.getElementById('user-avatar-display');
                if (nameSpan) nameSpan.innerText = updatedUser.username;
                if (emailSpan) emailSpan.innerText = updatedUser.email;
                if (avatarDiv) avatarDiv.innerText = updatedUser.username.charAt(0).toUpperCase();
                
                showAlert('Profile updated successfully!', true, 'settingsAlert');
            } else {
                const text = await response.text();
                showAlert(text, false, 'settingsAlert');
            }
        } catch (error) {
            showAlert('Connection error', false, 'settingsAlert');
        }
    };

    // Route Search Logic
    const routeSearch = document.getElementById('routeSearch');
    if (routeSearch) {
        routeSearch.addEventListener('input', (e) => {
            const filter = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#routesTable tbody tr');
            
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
    }

    // ----------------------------------------------------
    // PASSENGER TICKET AUTO-GENERATION SYSTEM
    // ----------------------------------------------------

    // Load passengers from backend
    window.loadPassengers = async function() {
        const tbody = document.getElementById('passengers-list');
        const noMsg = document.getElementById('no-passengers-msg');
        if (!tbody) return;

        try {
            const response = await fetch('/api/passengers');
            if (response.ok) {
                const passengers = await response.json();
                renderPassengerTable(passengers);
            }
        } catch (error) {
            console.error('Error loading passengers:', error);
        }
    };

    function renderPassengerTable(passengers) {
        const tbody = document.getElementById('passengers-list');
        const noMsg = document.getElementById('no-passengers-msg');
        const table = document.getElementById('passengersTable');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (passengers.length === 0) {
            if (table) table.style.display = 'none';
            if (noMsg) noMsg.style.display = 'block';
            return;
        }

        if (table) table.style.display = '';
        if (noMsg) noMsg.style.display = 'none';

        passengers.forEach(p => {
            const tr = document.createElement('tr');
            tr.style.animation = 'fadeIn 0.4s ease';
            tr.innerHTML = `
                <td><span class="badge" style="background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); font-family: monospace;">TKT-${String(p.id).padStart(4, '0')}</span></td>
                <td>${p.name}</td>
                <td>${p.phoneNumber}</td>
                <td>${p.boardingPoint}</td>
                <td>${p.destination}</td>
                <td><span class="badge" style="background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3);">${p.busId}</span></td>
                <td><button class="btn-secondary btn-sm" onclick="deletePassenger(${p.id})" style="width: auto; padding: 6px 12px; font-size: 0.8rem;">Remove</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Load all existing passengers on page load
    if (document.getElementById('passengers-list')) {
        loadPassengers();
    }

    // Generate tickets automatically
    window.generateTickets = async function() {
        const busId = document.getElementById('generate-bus-select').value;
        const count = document.getElementById('generate-count').value || 5;
        const loading = document.getElementById('passenger-loading');

        if (loading) loading.style.display = 'block';

        try {
            const response = await fetch(`/api/passengers/generate?busId=${encodeURIComponent(busId)}&count=${count}`, {
                method: 'POST'
            });

            if (response.ok) {
                const generated = await response.json();
                showAlert(`${generated.length} ticket(s) generated for bus ${busId}!`, true, 'passengerAlert');
                loadPassengers();
            } else {
                showAlert('Failed to generate tickets', false, 'passengerAlert');
            }
        } catch (error) {
            showAlert('Connection error while generating tickets', false, 'passengerAlert');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    };

    // Delete a single passenger
    window.deletePassenger = async function(id) {
        try {
            const response = await fetch(`/api/passengers/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadPassengers();
            }
        } catch (error) {
            console.error('Error deleting passenger:', error);
        }
    };

    // Clear all passengers
    window.clearAllPassengers = async function() {
        try {
            const response = await fetch('/api/passengers');
            if (response.ok) {
                const passengers = await response.json();
                // Delete all one by one
                await Promise.all(passengers.map(p => 
                    fetch(`/api/passengers/${p.id}`, { method: 'DELETE' })
                ));
                showAlert('All passenger records cleared', true, 'passengerAlert');
                loadPassengers();
            }
        } catch (error) {
            showAlert('Error clearing passengers', false, 'passengerAlert');
        }
    };

    // Navigate to Live Tracking map module
    window.goToMap = function() {
        showModule('module-tracking');
        if (mapInstance) {
            setTimeout(() => mapInstance.invalidateSize(), 300);
        }
    };

});
