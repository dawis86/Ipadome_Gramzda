// --- KARTES MAĢIJA ---

// 1. Tavas unikālās saites
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKnnovF3pnz0La8c0Nl1G-BGpChs7WuAIq61CDON6eubdSnuNGpACja0Fm0Up4xyvD0w1b5JimKqKO/pub?output=csv';
const formUrlTemplate = 'https://docs.google.com/forms/d/e/1FAIpQLSe7iX1RhQQReMdC6xqiSuhfENlz0zXmpvXgBTC2_lxhB8jr8w/viewform?usp=pp_url&entry.882553378=LATITUDE&entry.1270898407=LONGITUDE';

// 2. Kartes inicializācija
// Centra koordinātes un zoom līmenis - noregulēts uz Gramzdu
const map = L.map('map').setView([56.516, 21.63], 13);

// Pievienojam kartes "slāni" no OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// 3. Funkcija, kas nolasa datus no Google Sheet
async function fetchPoints() {
    try {
        const response = await fetch(sheetUrl);
        if (!response.ok) throw new Error('Tīkla kļūda');
        const data = await response.text();

        // Izmantojam globālo parseCSV no utils.js
        const rows = parseCSV(data);

        // Apstrādājam datus
        const points = rows.slice(1).map(columns => {
            if (columns.length < 6) return null;
            
            return {
                description: columns[1] ? columns[1].trim() : '',
                category: columns[2] ? columns[2].trim() : 'Nenorādīts',
                lat: parseFloat(columns[3]),
                lng: parseFloat(columns[4]),
                status: columns[5] ? columns[5].trim() : 'jauns'
            };
        }).filter(p => p && !isNaN(p.lat) && !isNaN(p.lng));

        renderPoints(points);
    } catch (error) {
        console.error('Kļūda, ielādējot punktus:', error);
    }
}

// 5. Funkcija, kas uzzīmē punktus kartē
function renderPoints(points) {
    const statusConfig = {
        'jauns': { color: '#e53e3e', icon: 'fa-triangle-exclamation' },
        'procesā': { color: '#d69e2e', icon: 'fa-person-digging' },
        'atrisināts': { color: '#3ecf8e', icon: 'fa-check' }
    };

    points.forEach(point => {
        // Normalizējam statusu (mazie burti, bez atstarpēm), lai vieglāk sakrīt un tu vari rakstīt kā gribi
        const normalizedStatus = point.status ? point.status.toLowerCase().trim() : 'jauns';

        // Ja statuss ir 'slēpts' vai 'spam', mēs to nerādām kartē (Moderēšana)
        if (normalizedStatus === 'slēpts' || normalizedStatus === 'spam') return;

        const config = statusConfig[normalizedStatus] || statusConfig['jauns'];
        
        const iconHtml = `<div class="pin" style="background-color: ${config.color};"><i class="fa-solid ${config.icon}"></i></div>`;
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-leaflet-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`<b>${point.category}</b><br>${point.description}<br><i>Statuss: ${point.status}</i>`);
    });
}

// 6. Notikuma apstrāde, kad lietotājs klikšķina uz kartes
map.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    
    // Aizvietojam veidnes mainīgos ar reālajām koordinātēm
    const url = formUrlTemplate
        .replace('LATITUDE', lat)
        .replace('LONGITUDE', lng);

    // Atveram jaunu logu ar anketu
    window.open(url, '_blank');
});

// 7. Palaižam visu procesu
fetchPoints();