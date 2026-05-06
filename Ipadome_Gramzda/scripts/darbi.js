// --- LAIKA LĪNIJAS MAĢIJA ---

// 1. Tavas unikālās saites
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=1098530004&single=true&output=csv';
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

        // Pārbaude: ja fails ir HTML (Google login lapa), metam kļūdu
        if (data.trim().startsWith('<!DOCTYPE html>') || data.includes('<html')) {
            throw new Error('Datu avots nav pieejams (iespējams, Google Sheets atļaujas problēma).');
        }

        // Apstrādājam datus
        const jobs = rows.slice(1).map(columns => {
            // LABOJUMS: Atļaujam rindu, ja ir vismaz 2 kolonnas (lai būtu droši)
            if (!columns || columns.length < 2) return null; 
            
            return {
                date: columns[1] ? columns[1].trim() : 'Bez datuma',
                title: columns[2] ? columns[2].trim() : 'Bez nosaukuma',
                // Pārbaudām, vai kolonna eksistē pirms piekļūstam
                description: (columns.length > 3 && columns[3]) ? columns[3].trim() : '',
                category: (columns.length > 4 && columns[4]) ? columns[4].trim() : 'Vispārīgi',
                link: (columns.length > 5 && columns[5]) ? columns[5].trim() : null
            };
        }).filter(job => job && job.title && job.title !== 'Bez nosaukuma');

        allJobsCache = jobs; // Saglabājam visus darbus kešatmiņā
        renderJobs(allJobsCache); // Attēlojam visus darbus sākumā
    } catch (error) {
        console.error('Kļūda, ielādējot darbus:', error);
        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator) {
            const errDiv = document.createElement('div');
            errDiv.className = 'error-placeholder';
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-server';
            const h3 = document.createElement('h3');
            h3.textContent = 'Kļūda ielādējot datus';
            const p = document.createElement('p');
            p.textContent = 'Neizdevās savienoties ar datu avotu. Lūdzu, mēģiniet pārlādēt lapu vēlāk.';
            errDiv.append(icon, h3, p);
            
            loadingIndicator.replaceChildren(errDiv);
            loadingIndicator.className = '';
        }
    }
}

// 4. Funkcija, kas uzzīmē darbus laika līnijā
function renderJobs(jobs) {
    timeline.replaceChildren();

    if (!jobs || jobs.length === 0) {
        if (allJobsCache.length > 0) {
            const noRes = document.createElement('div');
            noRes.className = 'no-results';
            const h3 = document.createElement('h3');
            h3.textContent = 'Nekas netika atrasts.';
            const p = document.createElement('p');
            p.textContent = 'Mēģiniet izmantot citus atslēgvārdus.';
            noRes.append(h3, p);
            timeline.appendChild(noRes);
        } else {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = '<div class="timeline-dot"></div>';
            const content = document.createElement('div');
            content.className = 'timeline-content';
            const h3 = document.createElement('h3');
            h3.textContent = 'Vēl nav pievienots neviens darbs.';
            const p = document.createElement('p');
            p.textContent = 'Visi paveiktie darbi tiks attēloti šeit.';
            content.append(h3, p);
            item.appendChild(content);
            timeline.appendChild(item);
        }
        return;
    }

    [...jobs].reverse().forEach(job => {
        const hasLink = job.link && job.link.trim() !== '';
        
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = '<div class="timeline-dot"></div>';
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'timeline-date';
        dateDiv.textContent = job.date;
        item.appendChild(dateDiv);

        const content = document.createElement(hasLink ? 'a' : 'div');
        content.className = 'timeline-content' + (hasLink ? ' link' : '');
        if (hasLink) {
            content.href = job.link;
            content.target = '_blank';
            content.download = '';
        }
        
        const h3 = document.createElement('h3');
        h3.textContent = job.title;
        const p = document.createElement('p');
        p.textContent = job.description;
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = job.category;
        
        content.append(h3, p, tag);

        if (hasLink) {
            const down = document.createElement('span');
            down.className = 'download-indicator';
            down.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> Lejupielādēt dokumentu';
            content.appendChild(down);
        }
        
        item.appendChild(content);
        timeline.appendChild(item);
    });
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