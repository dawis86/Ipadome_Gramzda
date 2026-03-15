// --- LAIKA LĪNIJAS MAĢIJA ---

// 1. Tavas unikālās saites
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS7476-SDyWcv06cnNftpKCxwvXSxepfoqSOVul8heCsF-GDRQbb9k0VnAtEKCQe3aq4-TDP4fLclv/pub?output=csv';
const timeline = document.querySelector('.timeline');
let allJobsCache = []; // Kešatmiņa visiem darbiem

// 2. Funkcija, kas nolasa datus no Google Sheet
async function fetchJobs() {
    try {
        const response = await fetch(sheetUrl + '&t=' + Date.now()); // &t=... apiet kešatmiņu
        if (!response.ok) {
            throw new Error('Tīkla atbilde nebija veiksmīga.');
        }
        const data = await response.text();
        
        // Izmantojam globālo parseCSV no utils.js
        const rows = parseCSV(data);

        // Apstrādājam datus
        const jobs = rows.slice(1).map(columns => {
            if (columns.length < 5) return null; // Vajag vismaz līdz Kategorijai
            
            return {
                date: columns[1] ? columns[1].trim() : 'Bez datuma',
                title: columns[2] ? columns[2].trim() : 'Bez nosaukuma',
                description: columns[3] ? columns[3].trim() : '',
                category: columns[4] ? columns[4].trim() : 'Vispārīgi',
                link: columns[5] ? columns[5].trim() : null // Jauna kolonna saitei
            };
        }).filter(job => job && job.title && job.title !== 'Bez nosaukuma');

        allJobsCache = jobs; // Saglabājam visus darbus kešatmiņā
        renderJobs(allJobsCache); // Attēlojam visus darbus sākumā
    } catch (error) {
        console.error('Kļūda, ielādējot darbus:', error);
        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator) {
            loadingIndicator.querySelector('.timeline-content').innerHTML = '<h3>Kļūda ielādējot datus.</h3><p>Mēģiniet pārlādēt lapu vēlāk.</p>';
        }
    }
}

// 4. Funkcija, kas uzzīmē darbus laika līnijā
function renderJobs(jobs) {
    timeline.innerHTML = ''; // Notīrām visu, ieskaitot ielādes indikatoru

    if (jobs.length === 0) {
        if (allJobsCache.length > 0) {
            // Ir darbi, bet meklēšana neko neatrada
            timeline.innerHTML = '<div class="no-results"><h3>Nekas netika atrasts.</h3><p>Mēģiniet izmantot citus atslēgvārdus.</p></div>';
        } else {
            // Vispār nav darbu sarakstā (sākotnējā ielāde)
            timeline.innerHTML = '<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><h3>Vēl nav pievienots neviens darbs.</h3><p>Visi paveiktie darbi tiks attēloti šeit.</p></div></div>';
        }
        return;
    }

    let allItemsHTML = '';
    // Pievienojam jaunus ierakstus, sākot no augšas
    jobs.reverse().forEach(job => {
        const hasLink = job.link && job.link.trim() !== '';
        
        // Veidojam satura bloku
        const contentHTML = `
            <h3>${job.title}</h3>
            <p>${job.description}</p>
            <span class="tag">${job.category}</span>
            ${hasLink ? `<span class="download-indicator"><i class="fa-solid fa-file-arrow-down"></i> Lejupielādēt dokumentu</span>` : ''}
        `;

        // Ietinam saturu vai nu <a> tagā, vai <div>
        const contentWrapper = hasLink 
            ? `<a href="${job.link}" class="timeline-content link" target="_blank" download>`
            : `<div class="timeline-content">`;
        const closingTag = hasLink ? `</a>` : `</div>`;

        allItemsHTML += `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-date">${job.date}</div>
                ${contentWrapper}${contentHTML}${closingTag}
            </div>`;
    });
    timeline.innerHTML = allItemsHTML; // Ievietojam visu HTML vienā reizē - tas ir ātrāk un kvalitatīvāk
}

// --- MEKLĒŠANAS MAĢIJA ---
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('suggestions-box');
    if (!searchInput) return;

    // Funkcija, kas ģenerē unikālos ieteikumus no kešatmiņas
    function getSuggestions(query) {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        
        // Savācam visus nosaukumus un kategorijas
        const allTitles = allJobsCache.map(job => job.title);
        const allCategories = allJobsCache.map(job => job.category);
        
        // Apvienojam un izņemam dublikātus
        const uniqueSource = [...new Set([...allTitles, ...allCategories])];

        // Filtrējam tos, kas satur meklēto frāzi
        return uniqueSource.filter(item => item.toLowerCase().includes(lowerQuery));
    }

    // Funkcija, kas parāda ieteikumus
    function showSuggestions(suggestions) {
        if (suggestions.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }

        suggestionsBox.innerHTML = '';
        suggestions.forEach(text => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = text;
            
            // Klikšķis uz ieteikuma
            div.addEventListener('click', () => {
                searchInput.value = text;
                suggestionsBox.style.display = 'none';
                // Izsaucam meklēšanu manuāli
                performSearch(text);
            });

            suggestionsBox.appendChild(div);
        });

        suggestionsBox.style.display = 'block';
    }

    // Galvenā meklēšanas loģika (izdalīta atsevišķi)
    function performSearch(searchTerm) {
        const term = searchTerm.toLowerCase().trim();

        if (term === '') {
            renderJobs(allJobsCache);
            return;
        }

        const filteredJobs = allJobsCache.filter(job => {
            const title = job.title.toLowerCase();
            const description = job.description.toLowerCase();
            const category = job.category.toLowerCase();

            return title.includes(term) || 
                   description.includes(term) || 
                   category.includes(term);
        });

        renderJobs(filteredJobs);
    }

    // Klausāmies rakstīšanu
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        performSearch(searchTerm);
        
        // Rādām ieteikumus
        const suggestions = getSuggestions(searchTerm);
        showSuggestions(suggestions);
    });

    // Paslēpjam ieteikumus, ja noklikšķina ārpusē
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
}

// 5. Palaižam visu procesu
document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();
    initializeSearch();
});