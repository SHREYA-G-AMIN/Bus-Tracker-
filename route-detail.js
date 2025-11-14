// Get bus ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const busId = urlParams.get('busId');

let currentBusData = null;
let map = null;

// Load theme on startup
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, busId:', busId);
    loadTheme();
    loadBusDetail();
    setupEventListeners();
});

// Load bus details from JSON
async function loadBusDetail() {
    try {
        const response = await fetch('buses.json');
        if (!response.ok) {
            throw new Error('Failed to fetch buses.json');
        }
        const buses = await response.json();
        
        // Match by busId (string comparison)
        const bus = buses.find(b => String(b.busId) === String(busId));
        
        if (!bus) {
            console.error('Bus not found with ID:', busId);
            // Try fallback data
            loadFallbackData();
            return;
        }
        
        currentBusData = bus;
        displayBusDetail();
        initializeMap();
    } catch (error) {
        console.error('Error loading bus data:', error);
        loadFallbackData();
    }
}

// Fallback data in case JSON loading fails
function loadFallbackData() {
    const fallbackBuses = [
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
    
    const bus = fallbackBuses.find(b => String(b.busId) === String(busId));
    if (bus) {
        currentBusData = bus;
        displayBusDetail();
        initializeMap();
    } else {
        alert('Bus not found');
    }
}

// Display bus details
function displayBusDetail() {
    const bus = currentBusData;
    
    console.log('Displaying bus details:', bus);
    
    // Update header
    document.getElementById('routeTitle').textContent = `🚌 ${bus.name}`;
    document.getElementById('routeSubtitle').textContent = `Route: ${bus.from} → ${bus.to} | Total Stops: ${bus.totalStops} | Travel Time: ${bus.travelTime}`;
    
    // Update stops table
    const tbody = document.getElementById('stopsTableBody');
    console.log('Stops tbody element:', tbody);
    console.log('Number of stops:', bus.stops.length);
    
    tbody.innerHTML = '';
    
    bus.stops.forEach((stop, index) => {
        console.log(`Adding stop ${index}:`, stop);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stop.stopNo}</td>
            <td>${stop.name}</td>
            <td>${stop.arrival}</td>
            <td>${stop.departure}</td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('Table populated with', bus.stops.length, 'stops');
}

// Initialize map
function initializeMap() {
    const bus = currentBusData;
    
    if (!bus.mapCoordinates || bus.mapCoordinates.length === 0) {
        document.getElementById('map').innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Map coordinates not available</p>';
        return;
    }
    
    // Initialize map centered on first coordinate
    const startCoord = bus.mapCoordinates[0];
    map = L.map('map').setView([startCoord.lat, startCoord.lng], 10);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add markers and route
    if (bus.mapCoordinates.length >= 2) {
        const startMarker = L.circleMarker([startCoord.lat, startCoord.lng], {
            radius: 8,
            fillColor: '#22c55e',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);
        
        startMarker.bindPopup(`<b>Start: ${bus.from}</b>`);
        
        // End marker
        const endCoord = bus.mapCoordinates[bus.mapCoordinates.length - 1];
        const endMarker = L.circleMarker([endCoord.lat, endCoord.lng], {
            radius: 8,
            fillColor: '#ef4444',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);
        
        endMarker.bindPopup(`<b>End: ${bus.to}</b>`);
        
        // Draw route line
        const coordinates = bus.mapCoordinates.map(coord => [coord.lat, coord.lng]);
        L.polyline(coordinates, {
            color: '#0284c7',
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5'
        }).addTo(map);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        if (map) map.zoomIn();
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        if (map) map.zoomOut();
    });
    
    // Theme toggle
    const themeToggle = document.querySelector('#themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
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
    const themeToggle = document.querySelector('#themeToggle');
    if (themeToggle) {
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}
