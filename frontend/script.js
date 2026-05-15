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

    let mapInstance = null;
    
    if (document.getElementById('bus-map')) {
        // Karur, Tamil Nadu Coordinates
        const karurLat = 10.9596;
        const karurLng = 78.0766;

        // Define Tile Layers
        const osm = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        });

        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        // Initialize Map with Satellite as default
        mapInstance = L.map('bus-map', {
            center: [karurLat, karurLng],
            zoom: 13,
            layers: [satellite],
            dragging: true,
            scrollWheelZoom: true,
            touchZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true
        });

        const baseMaps = {
            "Satellite View": satellite,
            "Street Map": osm
        };

        L.control.layers(baseMaps).addTo(mapInstance);

        // Fix for rendering issues in flex/hidden containers
        setTimeout(() => {
            mapInstance.invalidateSize();
        }, 500);

        // Enhanced SVG Icon Generator
        const createBusIcon = (color, isDelayed) => L.divIcon({
            html: `
            <div class="${isDelayed ? 'bus-pulse-delayed' : 'bus-pulse'}">
                <svg viewBox="0 0 24 24" style="width: 34px; height: 34px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                    <circle cx="12" cy="12" r="11" fill="white" />
                    <path d="M6 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h4v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4S6 2.5 6 6v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S8.67 14 9.5 14s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 14 14.5 14s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H8V6h8v5z" fill="${color}"/>
                </svg>
            </div>`,
            className: 'custom-bus-marker',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
        });

        // 📍 Define Major Bus Stops
        const busStops = [
            { name: "Karur Bus Stand", coords: [10.9596, 78.0766], desc: "Main district hub" },
            { name: "Vengamedu Stop", coords: [10.9750, 78.0700], desc: "Pugalur Road Junction" },
            { name: "VSB Engineering College", coords: [10.9150, 78.1500], desc: "Trichy Road stop" },
            { name: "Pavitharam Stop", coords: [10.8350, 78.0300], desc: "South Karur intersection" },
            { name: "Thanthonimalai Stop", coords: [10.9400, 78.0650], desc: "Collector Office area" },
            { name: "K. Paramathi Stand", coords: [10.8950, 77.9480], desc: "Western terminal" }
        ];

        // Draw Stops on Map
        const stopIcon = L.divIcon({
            html: `<div class="stop-marker-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
            className: 'stop-marker-div',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        busStops.forEach(stop => {
            L.marker(stop.coords, { icon: stopIcon }).addTo(mapInstance)
                .bindPopup(`<strong style="color: var(--primary)">${stop.name}</strong><br><span style="font-size: 0.8rem">${stop.desc}</span>`);
        });

        // 🛣️ Precision Waypoints for Karur Main Roads (Road-Bound Paths)
        const routes = {
            'trichy-rd': [
                [10.9596, 78.0766], [10.9540, 78.0850], [10.9480, 78.0950], 
                [10.9380, 78.1100], [10.9250, 78.1300], [10.9150, 78.1500] // VSB College
            ],
            'paramathi-rd': [
                [10.9596, 78.0766], [10.9500, 78.0600], [10.9350, 78.0400], 
                [10.9200, 78.0200], [10.9050, 77.9800], [10.8950, 77.9480] // K. Paramathi
            ],
            'thanthoni-rd': [
                [10.9596, 78.0766], [10.9550, 78.0750], [10.9500, 78.0720], 
                [10.9450, 78.0680], [10.9400, 78.0650] // Thanthonimalai
            ]
        };

        // Expanded Fleet with waypoint tracking
        const activeBuses = [
            { id: "TN-47-AF-1234", route: "Karur -> Trichy", speed: "40 km/h", status: "On Time", type: 'express', path: routes['trichy-rd'], step: 0, direction: 1 },
            { id: "MSB-TOWN", route: "K. Paramathi -> Karur", speed: "42 km/h", status: "On Time", type: 'town', path: routes['paramathi-rd'], step: 0, direction: 1 },
            { id: "SMS-TOWN", route: "Karur -> K. Paramathi", speed: "38 km/h", status: "On Time", type: 'town', path: routes['paramathi-rd'], step: routes['paramathi-rd'].length - 1, direction: -1 },
            { id: "TN-47-CQ-9101", route: "Karur -> Thanthoni", speed: "35 km/h", status: "On Time", type: 'town', path: routes['thanthoni-rd'], step: 0, direction: 1 },
            { id: "EXP-VSB", route: "Karur -> VSB College", speed: "50 km/h", status: "On Time", type: 'express', path: routes['trichy-rd'], step: 2, direction: 1 }
        ];

        const markers = {};

        // Initial Draw
        activeBuses.forEach(bus => {
            const color = bus.type === 'town' ? '#3b82f6' : '#6366f1';
            const startPos = bus.path[bus.step];
            const marker = L.marker(startPos, {
                icon: createBusIcon(color, bus.status === 'Traffic Delay')
            }).addTo(mapInstance);
            
            marker.bindPopup(`
                <div style="font-family: 'Outfit', sans-serif; min-width: 180px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981"></span>
                        <h3 style="margin: 0; font-size: 1rem; color: #1e293b;">Bus ${bus.id}</h3>
                    </div>
                    <p style="margin: 5px 0; font-size: 0.85rem;"><strong>Route:</strong> ${bus.route}</p>
                    <p style="margin: 5px 0; font-size: 0.85rem;"><strong>Speed:</strong> <span id="speed-${bus.id}">${bus.speed}</span></p>
                    <span class="badge badge-green" style="font-size: 0.75rem;">On Time</span>
                </div>
            `);
            markers[bus.id] = marker;
            bus.lat = startPos[0];
            bus.lng = startPos[1];
        });

        // 🚀 Improved Path-Based Movement Engine
        setInterval(() => {
            activeBuses.forEach(bus => {
                const targetStep = bus.step + bus.direction;
                
                // End of path logic (reverse direction)
                if (targetStep < 0 || targetStep >= bus.path.length) {
                    bus.direction *= -1;
                    return;
                }

                const targetPos = bus.path[targetStep];
                const currentPos = [bus.lat, bus.lng];

                // Smooth interpolation towards next waypoint
                const lerpFactor = 0.015; // Refined slow movement
                bus.lat += (targetPos[0] - currentPos[0]) * lerpFactor;
                bus.lng += (targetPos[1] - currentPos[1]) * lerpFactor;

                // Close enough to next waypoint? Move to next
                const dist = Math.sqrt(Math.pow(targetPos[0] - bus.lat, 2) + Math.pow(targetPos[1] - bus.lng, 2));
                if (dist < 0.001) {
                    bus.step = targetStep;
                }

                // Update marker
                if (markers[bus.id]) {
                    markers[bus.id].setLatLng([bus.lat, bus.lng]);
                    
                    const newSpeed = Math.floor(35 + Math.random() * 15);
                    const speedEl = document.getElementById(`speed-${bus.id}`);
                    if (speedEl) speedEl.innerText = `${newSpeed} km/h`;
                }
            });
        }, 2000); // Slower updates for realistic bus pace
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
                
                // If it's the map tab, fix map sizing issues on un-hide
                if(targetId === 'module-tracking' && mapInstance) {
                    setTimeout(() => {
                        mapInstance.invalidateSize();
                    }, 100);
                }
            }
        });
    });

    // Function to allow internal buttons to route back to map
    window.goToMap = function() {
        const liveTrackingTab = document.querySelector('[data-target="module-tracking"]');
        if (liveTrackingTab) {
            liveTrackingTab.click();
        }
    };

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

});
