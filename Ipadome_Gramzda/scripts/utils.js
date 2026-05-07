/**
 * Šis fails satur palīgfunkcijas, kas tiek izmantotas visā projektā.
 * Iepriekš šeit bija CSV parsētājs, bet tagad dati tiek saņemti JSON formātā,
 * tāpēc šī funkcija vairs nav nepieciešama.
 */
// function parseCSV(csvText) { /* ... vairs netiek izmantota ... */ }

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