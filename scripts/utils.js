/**
 * Šis fails satur palīgfunkcijas, kas tiek izmantotas visā projektā.
 * Iepriekš šeit bija CSV parsētājs, bet tagad dati tiek saņemti JSON formātā,
 * tāpēc šī funkcija vairs nav nepieciešama.
 */

import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.3/dist/purify.es.mjs';

/**
 * Centralizēta Google Apps Script API adrese.
 */
export const API_URL = 'https://script.google.com/macros/s/AKfycbwhNT_d9aiEGCo30DH8ofxOWDgGUysxZOfcJVxk5Nff9JA6os_2O3zfx5G-i0eCa0-/exec';

/**
 * Droši sanitizē HTML virkni, noņemot bīstamos elementus (XSS aizsardzība).
 */
export function sanitizeHTML(htmlString) {
    return DOMPurify.sanitize(htmlString);
}

/**
 * Pārvērš ISO datumu vai jebkuru tekstu par DD.MM.YYYY formātu.
 */
export function formatDisplayDate(dateStr) {
    if (!dateStr) return 'Bez datuma';
    if (typeof dateStr === 'string' && /^\d{2}\.\d{2}\.\d{4}/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('lv-LV');
}

/**
 * Tīra tekstu no null/undefined un liekām atstarpēm.
 * Izmantots vairākos moduļos datu sanitizācijai no Google Sheets.
 */
export function clean(text) {
    return (text !== null && text !== undefined) ? String(text).trim() : '';
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

/**
 * Iegūst vai izveido unikālu lietotāja identifikatoru (UID).
 * Koplietojama funkcija visiem moduļiem.
 */
export function getOrCreateUID() {
    let uid = localStorage.getItem('gramzda_uid');
    if (!uid) {
        uid = 'usr_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('gramzda_uid', uid);
    }
    return uid;
}

/**
 * WOW EFEKTS: TĪRS JS KONFETI
 * Pieejams visā projektā.
 */
export function triggerWowEffect() {
    const colors = ['#3ecf8e', '#d4af37', '#ffffff'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed; left: ${Math.random() * 100}vw; top: -10px;
            width: ${Math.random() * 10 + 5}px; height: ${Math.random() * 5 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            z-index: 10001; opacity: ${Math.random()};
            transform: rotate(${Math.random() * 360}deg);
            transition: transform ${Math.random() * 2 + 1}s linear, top ${Math.random() * 2 + 1}s linear;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => {
            confetti.style.top = '100vh';
            confetti.style.transform = `rotate(${Math.random() * 1000}deg) translateX(${Math.random() * 100 - 50}px)`;
        }, 10);
        setTimeout(() => confetti.remove(), 3000);
    }
}