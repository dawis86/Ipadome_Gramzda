/**
 * PAVEIKTO DARBU LAIKA LĪNIJA
 * Nolasa padarītos darbus un projektus, nodrošinot meklēšanas funkciju
 * un dinamiskus ieteikumus meklēšanas laukā.
 */

import { formatDisplayDate, clean, API_URL } from './utils.js';

// 1. Tavas unikālās saites
const apiUrl = `${API_URL}?action=getJobs`;
const timeline = document.querySelector('.timeline');
let allJobsCache = []; // Kešatmiņa visiem darbiem

// 2. Funkcija, kas nolasa datus no Google Sheet
async function fetchJobs() {
    try {
        // Iegūstam datus JSON formātā no mūsu centralizētā API.
        const response = await fetch(apiUrl + '&t=' + Date.now());
        if (!response.ok) throw new Error('Tīkla atbilde nebija veiksmīga.');
        
        const result = await response.json();
        const rows = result.data;

        // Apstrādājam datus
        const jobs = rows.slice(1).map(columns => {
            // LABOJUMS: Atļaujam rindu, ja ir vismaz 2 kolonnas (lai būtu droši)
            if (!columns || columns.length < 2) return null; 
            
            return {
                date: formatDisplayDate(columns[1]),
                title: clean(columns[2]) || 'Bez nosaukuma',
                // Pārbaudām, vai kolonna eksistē pirms piekļūstam
                description: clean(columns[3]),
                category: clean(columns[4]) || 'Vispārīgi',
                link: clean(columns[5]) || null
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
            const dot = document.createElement('div');
            dot.className = 'timeline-dot';
            item.appendChild(dot);
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
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        item.appendChild(dot);
        
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
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-file-arrow-down';
            down.append(icon, document.createTextNode(' Lejupielādēt dokumentu'));
            content.appendChild(down);
        }
        
        item.appendChild(content);
        timeline.appendChild(item);
    });
}

// --- MEKLĒŠANAS UN IETEIKUMU LOĢIKA ---
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
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            performSearch(searchTerm);
            
            // Rādām ieteikumus
            const suggestions = getSuggestions(searchTerm);
            showSuggestions(suggestions);
        }, 250); // 250ms pauze pirms apstrādes
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