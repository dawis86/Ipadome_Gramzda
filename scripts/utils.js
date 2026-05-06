/**
 * Robusts CSV parsētājs, kas tiek galā ar pēdiņām un "Enter" taustiņiem šūnu iekšienē.
 * @param {string} csvText - Neapstrādāts CSV teksts.
 * @returns {string[][]} - Masīvs ar rindām, kur katra rinda ir masīvs ar šūnām.
 */
function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Apstrādā dubultās pēdiņas iekš lauka ("" -> ")
                currentCell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            // Rindas beigas
            if (char === '\r' && nextChar === '\n') i++; // Pārlecam \n pēc \r
            currentRow.push(currentCell);
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    // Pievieno pēdējo šūnu un rindu, ja fails nebeidzas ar jaunu rindu
    if (currentCell.trim() !== '' || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }

    return rows;
}

/**
 * Atjaunina datu svaiguma laika zīmogu kājenē.
 * Šī funkcija tiek izsaukta automātiski katrā lapā, kur iekļauts utils.js.
 */
(function() {
    function updateDataFreshness() {
        const freshnessEl = document.getElementById('data-freshness');
        if (freshnessEl) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' });
            const dateString = now.toLocaleDateString('lv-LV');
            freshnessEl.textContent = `Dati aktuāli uz: ${dateString} ${timeString}`;
        }
    }

    document.addEventListener('DOMContentLoaded', updateDataFreshness);
})();

// --- SĪKDATŅU (COOKIES) PAZIŅOJUMA JOSLA ---
(function() {
    function initCookieBanner() {
        // Pārbaudām, vai lietotājs jau ir veicis izvēli (saglabāts pārlūkā)
        if (localStorage.getItem('cookie_consent')) return;

        // Izveidojam HTML elementus dinamiski
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'cookie-text';
        const p = document.createElement('p');
        p.textContent = 'Mēs izmantojam sīkdatnes (t.sk. Google Analytics), lai analizētu apmeklējumu un uzlabotu vietnes darbību. Turpinot lietot vietni, jūs piekrītat to izmantošanai.';
        textDiv.appendChild(p);

        const btnsDiv = document.createElement('div');
        btnsDiv.className = 'cookie-buttons';
        const btn = document.createElement('button');
        btn.id = 'cookie-accept';
        btn.className = 'cookie-btn';
        btn.textContent = 'Sapratu';
        btnsDiv.appendChild(btn);

        banner.append(textDiv, btnsDiv);

        document.body.appendChild(banner);
        
        // Ar nelielu aizturi parādām joslu (animācijai)
        setTimeout(() => banner.classList.add('visible'), 100);

        // Klausāmies pogas klikšķi
        document.getElementById('cookie-accept').addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'accepted'); // Saglabājam izvēli
            banner.classList.remove('visible'); // Paslēpjam
            setTimeout(() => banner.remove(), 500); // Izdzēšam no HTML
        });
    }

    document.addEventListener('DOMContentLoaded', initCookieBanner);
})();