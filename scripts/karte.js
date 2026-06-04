/**
 * KARTES MODULIS
 * Inicializē interaktīvu karti, ielādē problēmu punktus no Google Apps Script API un ļauj ziņot par jaunām problēmām.
 */

import { getOrCreateUID, clean, API_URL, fetchJSONP } from './utils.js';

// 1. Tavas unikālās saites
const apiUrl = `${API_URL}?action=getPoints`;

// 2. Kartes inicializācija
let map;
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Pārbaudām, vai karte jau nav inicializēta
    if (L.DomUtil.get('map')._leaflet_id) return;

    map = L.map('map').setView([56.359722, 21.651944], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Pievienojam klikšķa notikumu
    map.on('click', onMapClick);
}

// 3. Funkcija, kas nolasa datus no Google Sheet
async function fetchPoints() {
    try {
        // Izmantojam JSONP lasīšanai
        const result = await fetchJSONP(API_URL, { action: 'getPoints', t: Date.now() });
        if (result.error) throw new Error(result.error);
        const rows = result.data || [];

        // Apstrādājam datus
        const points = rows.slice(1).map(columns => {
            // Pārbaude: vai ir vismaz 5 kolonnas (līdz Longitude)
            if (!columns || columns.length < 5) return null;
            
            return {
                description: columns[1] ? columns[1].trim() : '',
                category: columns[2] ? columns[2].trim() : 'Nenorādīts',
                lat: parseFloat(columns[3]),
                lng: parseFloat(columns[4]),
                // Statuss ir 6. kolonnā (ja tāda ir), citādi pēc noklusējuma 'jauns'
                status: (columns.length > 5 && columns[5]) ? columns[5].trim() : 'jauns'
            };
        }).filter(p => p && !isNaN(p.lat) && !isNaN(p.lng));

        renderPoints(points);
    } catch (error) {
        console.error('Kļūda, ielādējot punktus:', error);
        // Parādām paziņojumu kartes vietā
        const mapContainer = document.getElementById('map');
        mapContainer.replaceChildren();
        const errPlaceholder = document.createElement('div');
        errPlaceholder.className = 'error-placeholder';
        errPlaceholder.style.cssText = 'height: 100%; display: flex; flex-direction: column; justify-content: center; border-radius: 0;';
        const h3 = document.createElement('h3');
        h3.textContent = 'Neizdevās ielādēt karti';
        errPlaceholder.appendChild(h3);
        mapContainer.appendChild(errPlaceholder);
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
        
        const iconHtml = document.createElement('div');
        iconHtml.className = 'pin';
        iconHtml.style.backgroundColor = config.color;
        iconHtml.innerHTML = `<i class="fa-solid ${config.icon}"></i>`; // Ikona ir droša, jo nāk no statiskas konfigurācijas
        
        const customIcon = L.divIcon({
            html: iconHtml.outerHTML,
            className: 'custom-leaflet-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);
        
        const popupContent = document.createElement('div');
        const b = document.createElement('b'); b.textContent = point.category;
        const br1 = document.createElement('br');
        const span = document.createElement('span'); span.textContent = point.description;
        const br2 = document.createElement('br');
        const i = document.createElement('i'); i.textContent = `Statuss: ${point.status}`;
        
        popupContent.append(b, br1, span, br2, i);
        marker.bindPopup(popupContent);
    });
}

// 6. Notikuma apstrāde, kad lietotājs klikšķina uz kartes
function onMapClick(e) {
    const modal = document.getElementById('report-modal');
    if (!modal) return;

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    document.getElementById('form-lat').value = lat;
    document.getElementById('form-lng').value = lng;
    document.getElementById('display-coords').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    modal.style.display = 'flex';
}

// Modālā loga aizvēršana un formas sūtīšana
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('report-modal');
    const closeBtn = document.getElementById('close-report-modal');
    const form = document.getElementById('report-form');

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    
    // Aizvērt, noklikšķinot ārpusē vai nospiežot Escape
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") modal.style.display = 'none';
    });
    
    if (form) {
        // Pievienojam kļūdu noņemšanu, kad sāk rakstīt
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', () => {
                const group = field.parentElement;
                group.classList.remove('invalid');
                const err = group.querySelector('.error-message');
                if (err) err.remove();
            });
        });

        form.onsubmit = async (e) => {
            e.preventDefault();

            // Notīrām iepriekšējās kļūdas
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('invalid');
                const err = group.querySelector('.error-message');
                if (err) err.remove();
            });

            const description = clean(form.description.value);
            const visitorId = getOrCreateUID();

            if (description.length < 10) {
                const group = form.description.parentElement;
                group.classList.add('invalid');
                const errSpan = document.createElement('span');
                errSpan.className = 'error-message';
                errSpan.textContent = "Aprakstam jābūt vismaz 10 simbolus garam.";
                group.appendChild(errSpan);
                return;
            }

            const btn = form.querySelector('button');
            btn.disabled = true;
            btn.classList.add('loading');
            btn.textContent = 'Sūta...';

            try {
                const result = await fetchJSONP(API_URL, {
                    action: 'addPoint',
                    description: form.description.value,
                    category: form.category.value,
                    lat: form.lat.value,
                    lng: form.lng.value,
                    identity: visitorId,
                    t: Date.now()
                });

                if (result.status === 'Success') {
                    alert("Paldies! Ziņojums saņemts un tiks izskatīts.");
                    location.reload();
                } else {
                    throw new Error(result.error || "Kļūda saglabājot datus");
                }
            } catch (err) {
                alert("Kļūda sūtot. Lūdzu mēģiniet vēlreiz.");
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        };
    }
});

// 7. Palaižam visu procesu
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    fetchPoints();
});