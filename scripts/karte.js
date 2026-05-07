/**
 * KARTES MODULIS
 * Inicializē interaktīvu karti, ielādē problēmu punktus no Google Apps Script API un ļauj ziņot par jaunām problēmām.
 */

// 1. Tavas unikālās saites
const apiUrl = 'https://script.google.com/macros/s/AKfycbx4Me3TQ3pl-pswtq6GINREobiH7DHYlVeF5QuSTAY9H5qaU2ief98p1tVOf3t0UAU5/exec?action=getPoints';

// 2. Kartes inicializācija
let map;
function initMap() {
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
        const response = await fetch(apiUrl + '&t=' + Date.now());
        if (!response.ok) throw new Error('Tīkla kļūda');
        
        const result = await response.json();
        const rows = result.data;

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
        mapContainer.innerHTML = `
            <div class="error-placeholder" style="height: 100%; display: flex; flex-direction: column; justify-content: center; border-radius: 0;">
                <i class="fa-solid fa-map-pin"></i>
                <h3>Neizdevās ielādēt karti</h3>
                <p>Mēģiniet pārlādēt lapu. Ja problēma atkārtojas, iespējams, ir problēmas ar datu avotu.</p>
            </div>`;
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
        
        // Droša popup izveide, neizmantojot innerHTML tieši ar lietotāja datiem
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `<b></b><br><span></span><br><i></i>`;
        popupContent.querySelector('b').textContent = point.category;
        popupContent.querySelector('span').textContent = point.description;
        popupContent.querySelector('i').textContent = `Statuss: ${point.status}`;
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
    
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Sūta...';

            const params = new URLSearchParams();
            params.append('action', 'addPoint');
            params.append('description', form.description.value);
            params.append('category', form.category.value);
            params.append('lat', form.lat.value);
            params.append('lng', form.lng.value);
            params.append('identity', getOrCreateUID());

            try {
                const scriptUrl = 'https://script.google.com/macros/s/AKfycbx4Me3TQ3pl-pswtq6GINREobiH7DHYlVeF5QuSTAY9H5qaU2ief98p1tVOf3t0UAU5/exec';
                await fetch(scriptUrl, { method: 'POST', mode: 'no-cors', body: params });
                alert("Paldies! Ziņojums saņemts un tiks izskatīts.");
                location.reload();
            } catch (err) {
                alert("Kļūda sūtot. Lūdzu mēģiniet vēlreiz.");
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