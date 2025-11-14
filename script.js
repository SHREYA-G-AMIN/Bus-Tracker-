/**
 * SEARCH BAR - Filters bus cards by route name, from, or to destination in real-time
 * User types and matching buses are displayed, non-matching buses are hidden
 */

/**
 * ALL BUSES DROPDOWN - Displays all available bus routes
 * Shows bus name with departure time, allows user to select specific route
 */

/**
 * SEARCH NEAREST STOP - Lists all bus stops with next bus arrival info
 * Helps users find nearest stop and see when the next bus arrives
 */

let busesData = [];
let stopsData = [];

// DOM Elements
const searchInput = document.querySelector('#searchInput');
const busesGrid = document.querySelector('#busesGrid');
const busesDropdown = document.querySelector('#busesDropdown');
const busesBtn = document.querySelector('#busesBtn');
const busesMenu = document.querySelector('#busesMenu');
const stopsDropdown = document.querySelector('#stopsDropdown');
const stopsBtn = document.querySelector('#stopsBtn');
const stopsMenu = document.querySelector('#stopsMenu');
const sidebar = document.querySelector('#sidebar');
const menuBtn = document.querySelector('#menuBtn');
const themeToggle = document.querySelector('#themeToggle');
const routeModal = document.querySelector('#routeModal');
const closeModal = document.querySelector('#closeModal');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const routesContainer = document.querySelector('#routesContainer');
const timetableContainer = document.querySelector('#timetableContainer');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadBusesData();
    setupEventListeners();
    loadTheme();
    setupPageNavigation();
});

// Load buses from JSON
async function loadBusesData() {
    try {
        const response = await fetch('buses.json');
        if (!response.ok) {
            throw new Error('Failed to fetch buses.json');
        }
        busesData = await response.json();
        console.log('Buses loaded from JSON:', busesData);
    } catch (error) {
        console.warn('Could not load from buses.json, using fallback data:', error);
        // Fallback data if fetch fails (e.g., when opening HTML file directly)
        busesData = [
            {
                "busId": "1",
                "name": "Mangalore → Nitte",
                "from": "Mangalore",
                "to": "Nitte Campus",
                "travelTime": "50 min",
                "departure": "7:00 AM",
                "arrival": "7:50 AM",
                "totalStops": 5,
                "stops": [
                    {"stopNo": 1, "name": "Mangalore City Bus Stand", "arrival": "7:00", "departure": "7:02"},
                    {"stopNo": 2, "name": "Kadri Temple", "arrival": "7:10", "departure": "7:12"},
                    {"stopNo": 3, "name": "Kinnigoli", "arrival": "7:25", "departure": "7:27"},
                    {"stopNo": 4, "name": "Karkala", "arrival": "7:40", "departure": "7:42"},
                    {"stopNo": 5, "name": "Nitte Campus", "arrival": "7:50", "departure": "7:50"}
                ],
                "mapCoordinates": [{"lat": 12.9141, "lng": 74.8560}, {"lat": 12.9650, "lng": 74.9240}],
                "status": "On-Time",
                "seatsAvailable": 20
            },
            {
                "busId": "2",
                "name": "Udupi → Nitte",
                "from": "Udupi",
                "to": "Nitte Campus",
                "travelTime": "45 min",
                "departure": "7:15 AM",
                "arrival": "8:00 AM",
                "totalStops": 4,
                "stops": [
                    {"stopNo": 1, "name": "Udupi Bus Stand", "arrival": "7:15", "departure": "7:17"},
                    {"stopNo": 2, "name": "Kundapura", "arrival": "7:35", "departure": "7:37"},
                    {"stopNo": 3, "name": "Karkala", "arrival": "7:50", "departure": "7:52"},
                    {"stopNo": 4, "name": "Nitte Campus", "arrival": "8:00", "departure": "8:00"}
                ],
                "mapCoordinates": [{"lat": 13.3409, "lng": 74.7430}, {"lat": 13.0120, "lng": 74.8190}],
                "status": "On-Time",
                "seatsAvailable": 18
            },
            {
                "busId": "3",
                "name": "Moodbidri → Nitte",
                "from": "Moodbidri",
                "to": "Nitte Campus",
                "travelTime": "30 min",
                "departure": "7:30 AM",
                "arrival": "8:00 AM",
                "totalStops": 3,
                "stops": [
                    {"stopNo": 1, "name": "Moodbidri Bus Stand", "arrival": "7:30", "departure": "7:32"},
                    {"stopNo": 2, "name": "Karkala", "arrival": "7:50", "departure": "7:52"},
                    {"stopNo": 3, "name": "Nitte Campus", "arrival": "8:00", "departure": "8:00"}
                ],
                "mapCoordinates": [{"lat": 13.0870, "lng": 74.9980}, {"lat": 13.0120, "lng": 74.8190}],
                "status": "On-Time",
                "seatsAvailable": 15
            },
            {
                "busId": "4",
                "name": "Belthangadi → Nitte",
                "from": "Belthangadi",
                "to": "Nitte Campus",
                "travelTime": "40 min",
                "departure": "7:45 AM",
                "arrival": "8:25 AM",
                "totalStops": 3,
                "stops": [
                    {"stopNo": 1, "name": "Belthangadi Bus Stand", "arrival": "7:45", "departure": "7:47"},
                    {"stopNo": 2, "name": "Karkala", "arrival": "8:10", "departure": "8:12"},
                    {"stopNo": 3, "name": "Nitte Campus", "arrival": "8:25", "departure": "8:25"}
                ],
                "mapCoordinates": [{"lat": 12.9360, "lng": 75.0410}, {"lat": 13.0120, "lng": 74.8190}],
                "status": "On-Time",
                "seatsAvailable": 16
            }
        ];
    }
    
    // Generate stops from bus data
    generateStopsData();
    
    // Populate dropdowns
    populateDropdowns();
    
    // Display buses
    displayBuses();
}

// Generate stops data from buses
function generateStopsData() {
    const stopsMap = new Map();
    
    busesData.forEach(bus => {
        bus.stops.forEach((stop, index) => {
            const key = stop.name;
            if (!stopsMap.has(key)) {
                stopsMap.set(key, {
                    id: stopsMap.size + 1,
                    name: stop.name,
                    nextBus: bus.name,
                    time: stop.arrival,
                    busId: bus.busId
                });
            }
        });
    });
    
    stopsData = Array.from(stopsMap.values());
}

/**
 * SEARCH BAR FUNCTIONALITY
 * Filters bus cards based on user input
 * Searches across: route name, departure location (from), and destination (to)
 */
function displayBuses(busesToDisplay = null) {
    busesGrid.innerHTML = '';
    const buses = busesToDisplay || busesData;
    buses.forEach(bus => {
        createBusCard(bus);
    });
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.bus-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * ALL BUSES DROPDOWN POPULATION
 * Populates the "All Buses" dropdown with all available bus routes
 * SEARCH NEAREST STOP DROPDOWN POPULATION  
 * Populates the "Select Nearest Stop" dropdown with all bus stops
 */
function populateDropdowns() {
    // Populate buses dropdown
    busesMenu.innerHTML = '';
    busesData.forEach(bus => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = `${bus.name} (${bus.departure})`;
        item.onclick = () => selectBus(item, bus);
        busesMenu.appendChild(item);
    });

    // Populate stops dropdown
    stopsMenu.innerHTML = '';
    stopsData.forEach(stop => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = `${stop.name} (Next: ${stop.time} - ${stop.nextBus})`;
        item.onclick = () => selectStop(item, stop);
        stopsMenu.appendChild(item);
    });
}

function selectBus(element, bus) {
    document.querySelectorAll('.buses-menu .dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    element.classList.add('active');
    busesBtn.textContent = `${bus.name} 🚌`;
    busesDropdown.classList.remove('active');
    
    // Filter bus cards to show only selected bus
    filterBusCards(bus.busId, null);
}

function selectStop(element, stop) {
    document.querySelectorAll('.stops-menu .dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    element.classList.add('active');
    stopsBtn.textContent = `${stop.name} ⊝`;
    stopsDropdown.classList.remove('active');
    
    // Filter bus cards to show only buses that have this stop
    filterBusesByStop(stop.busId);
}

// Filter bus cards by bus ID
function filterBusCards(busId, stopId) {
    const cards = document.querySelectorAll('.bus-card');
    cards.forEach(card => {
        // You can add data attributes to cards to track bus/stop IDs
        // For now, we'll re-render with filtered data
    });
    
    // Re-render only the selected bus
    busesGrid.innerHTML = '';
    const selectedBus = busesData.find(bus => bus.busId == busId);
    if (selectedBus) {
        createBusCard(selectedBus);
    }
}

// Filter bus cards by stop
function filterBusesByStop(busId) {
    // Show only buses that service this stop
    busesGrid.innerHTML = '';
    const filteredBuses = busesData.filter(bus => bus.busId == busId);
    filteredBuses.forEach(bus => {
        createBusCard(bus);
    });
}

// Helper function to create a single bus card
function createBusCard(bus) {
    const card = document.createElement('div');
    card.className = 'bus-card';
    card.innerHTML = `
        <div class="bus-card-title">🚌 ${bus.name}</div>
        <div class="bus-card-subtitle">From: ${bus.from} → ${bus.to}</div>
        <div class="bus-card-info">
            <div class="bus-card-field">
                <span class="bus-card-label">Travel Time</span>
                <span class="bus-card-value">${bus.travelTime}</span>
            </div>
        </div>
        <div class="bus-card-info">
            <div class="bus-card-field">
                <span class="bus-card-label">Departure</span>
                <span class="bus-card-value">${bus.departure}</span>
            </div>
            <div class="bus-card-field">
                <span class="bus-card-label">Arrival</span>
                <span class="bus-card-value">${bus.arrival}</span>
            </div>
        </div>
        <div class="bus-card-footer">
            <span class="seats-info">Seats: ${bus.seatsAvailable}</span>
            <button class="view-details-btn" onclick="goToRouteDetail('${bus.busId}')">View Details →</button>
        </div>
    `;
    busesGrid.appendChild(card);
}

// Navigate to route detail page
function goToRouteDetail(busId) {
    window.location.href = `route-detail.html?busId=${busId}`;
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    
    // Dropdown toggles
    busesBtn.addEventListener('click', () => {
        // If clicked again on same button, reset filter and show all buses
        if (busesDropdown.classList.contains('active')) {
            displayBuses();
            busesBtn.textContent = 'All Buses 🚌';
            document.querySelectorAll('.buses-menu .dropdown-item').forEach(item => {
                item.classList.remove('active');
            });
        }
        busesDropdown.classList.toggle('active');
        stopsDropdown.classList.remove('active');
    });
    
    stopsBtn.addEventListener('click', () => {
        // If clicked again on same button, reset filter and show all buses
        if (stopsDropdown.classList.contains('active')) {
            displayBuses();
            stopsBtn.textContent = 'Select Nearest Stop ⊝';
            document.querySelectorAll('.stops-menu .dropdown-item').forEach(item => {
                item.classList.remove('active');
            });
        }
        stopsDropdown.classList.toggle('active');
        busesDropdown.classList.remove('active');
    });
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!busesDropdown.contains(e.target)) {
            busesDropdown.classList.remove('active');
        }
        if (!stopsDropdown.contains(e.target)) {
            stopsDropdown.classList.remove('active');
        }
    });
    
    // Mobile menu toggle
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    // Close sidebar when item clicked on mobile
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Only prevent default for anchor tags that have data-page
            if (item.dataset.page) {
                e.preventDefault();
                const pageId = item.dataset.page;
                navigateToPage(pageId);
            }
            
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Modal close
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            routeModal.classList.remove('active');
        });
    }
    
    if (routeModal) {
        routeModal.addEventListener('click', (e) => {
            if (e.target === routeModal) {
                routeModal.classList.remove('active');
            }
        });
    }
}

// Page navigation
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.querySelector(`#${pageId}`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update sidebar
    sidebarItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    // Load page content
    if (pageId === 'routes') {
        loadRoutesPage();
    } else if (pageId === 'timetable') {
        loadTimetablePage();
    }
}

function setupPageNavigation() {
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.dataset.page) {
                e.preventDefault();
                navigateToPage(item.dataset.page);
            }
        });
    });
}

// Load routes page
function loadRoutesPage() {
    routesContainer.innerHTML = '';
    busesData.forEach(bus => {
        const card = document.createElement('div');
        card.className = 'route-card';
        card.innerHTML = `
            <h3>${bus.name}</h3>
            <p><strong>From:</strong> ${bus.from}</p>
            <p><strong>To:</strong> ${bus.to}</p>
            <p><strong>Departure:</strong> ${bus.departure}</p>
            <p><strong>Arrival:</strong> ${bus.arrival}</p>
            <p><strong>Travel Time:</strong> ${bus.travelTime}</p>
        `;
        card.addEventListener('click', () => goToRouteDetail(bus.busId));
        routesContainer.appendChild(card);
    });
}

// Load timetable page
function loadTimetablePage() {
    timetableContainer.innerHTML = '';
    busesData.forEach(bus => {
        const section = document.createElement('div');
        section.className = 'timetable-section';
        
        let tableHTML = '<table><thead><tr><th>Stop No</th><th>Stop Name</th><th>Arrival</th><th>Departure</th></tr></thead><tbody>';
        
        bus.stops.forEach(entry => {
            tableHTML += `<tr><td>${entry.stopNo}</td><td>${entry.name}</td><td>${entry.arrival}</td><td>${entry.departure}</td></tr>`;
        });
        
        tableHTML += '</tbody></table>';
        
        section.innerHTML = `<h3>${bus.name}</h3>${tableHTML}`;
        timetableContainer.appendChild(section);
    });
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
