/**
 * AKTUALITĀŠU SIENAS MODULIS
 * Atbild par jaunumu ielādi no Google Apps Script API un to attēlošanu sarakstā.
 * Ietver automātisku saišu ekstrakciju no teksta un modālo logu pārvaldību.
 */

import { initSmartWidget } from './widget.js';
import { clean, API_URL, fetchJSONP } from './utils.js';

// 1. Tavas unikālās saites un elementi
const apiUrl = `${API_URL}?action=getNews`;
const newsGrid = document.querySelector('.news-grid');
const modal = document.getElementById('news-modal');
const closeModalBtn = document.querySelector('.close-modal');

// 2. Funkcija, kas nolasa datus no Google Sheet
async function fetchNews() {
    try {
        // Izmantojam JSONP lasīšanai
        const result = await fetchJSONP(API_URL, { action: 'getNews', t: Date.now() });
        const rows = result.data;

        // Apstrādājam rindas, sākot no otrās (pirmā ir galvene).
        const newsItems = rows.slice(1).map(columns => {
            if (!columns || columns.length < 4) return null; // Drošības pārbaude
            
            // Tīrām datus no liekām atstarpēm.
            const date = clean(columns[1]) || 'Nav datuma';
            const title = clean(columns[2]);
            const category = clean(columns[3]) || 'Jaunums';
            const rawText = clean(columns[4]);
            const manualLink = columns[5] ? columns[5].trim() : null;
            
            // Meklējam saites tekstā, ja tās nav norādītas atsevišķā kolonnā.
            const linkMatch = rawText.match(/(https?:\/\/[^\s]+|protokols[\/\\][^\s]+\.pdf)$/i);
            
            let cleanText = rawText;
            let extractedLink = manualLink;
            
            // Ja saite atrasta tekstā, mēs to izdalām, lai teksts būtu tīrāks.
            if (!extractedLink && linkMatch) {
                extractedLink = linkMatch[0];
                cleanText = rawText.replace(extractedLink, '').trim();
            }

            return {
                date: date,
                title: title,
                category: category,
                text: cleanText,
                link: extractedLink
            };
        }).filter(item => item && item.title);

        renderNews(newsItems);
    } catch (error) {
        console.error('Kļūda, ielādējot aktualitātes:', error);
        newsGrid.replaceChildren();
        const errBox = document.createElement('div');
        errBox.className = 'error-placeholder';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-triangle-exclamation';
        const h3 = document.createElement('h3');
        h3.textContent = 'Kļūda ielādējot datus';
        const p = document.createElement('p');
        p.textContent = 'Neizdevās saņemt jaunumus. Lūdzu, mēģiniet pārlādēt lapu vēlāk.';
        errBox.append(icon, h3, p);
        newsGrid.appendChild(errBox);
    }
}

// 4. Funkcija, kas uzzīmē ziņas
function renderNews(newsItems) {
    newsGrid.replaceChildren();

    if (newsItems.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'news-card';
        const h3 = document.createElement('h3');
        h3.textContent = 'Vēl nav pievienoti jaunumi.';
        emptyCard.appendChild(h3);
        newsGrid.appendChild(emptyCard);
        return;
    }

    newsItems.reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        
        const normalizedCategory = item.category.toLowerCase().replace(/\s+/g, '-');
        const hasLink = !!item.link;

        const header = document.createElement('div');
        header.className = 'news-header';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'news-date';
        dateSpan.textContent = item.date;
        
        const tagSpan = document.createElement('span');
        tagSpan.className = `news-tag tag-${normalizedCategory}`;
        tagSpan.textContent = item.category;
        
        header.append(dateSpan, tagSpan);
        
        const h3 = document.createElement('h3');
        h3.textContent = item.title;
        if (hasLink) {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-paperclip';
            icon.style.cssText = 'color: var(--gold); font-size: 0.8em; margin-left: 10px;';
            h3.appendChild(icon);
        }
        
        const p = document.createElement('p');
        p.className = 'news-excerpt';
        p.textContent = item.text;
        
        card.append(header, h3, p);

        card.addEventListener('click', () => {
            const mDate = document.getElementById('modal-date');
            const mCat = document.getElementById('modal-category');
            mDate.textContent = item.date;
            mCat.textContent = item.category;
            mCat.className = `news-tag tag-${normalizedCategory}`;
            document.getElementById('modal-title').textContent = item.title;
            document.getElementById('modal-body').textContent = item.text;
            
            const modalFooter = document.getElementById('modal-footer');
            if (modalFooter) {
                modalFooter.replaceChildren();
                if (item.link) {
                    const a = document.createElement('a');
                    a.href = item.link;
                    a.className = 'widget-btn';
                    a.target = '_blank';
                    a.style.textDecoration = 'none';
                    a.textContent = 'Atvērt saistīto failu vai saiti ';
                    const icon = document.createElement('i');
                    icon.className = 'fa-solid fa-arrow-up-right-from-square';
                    icon.style.marginLeft = '8px';
                    a.appendChild(icon);
                    modalFooter.appendChild(a);
                }
            }

            modal.style.display = 'flex';
        });

        newsGrid.appendChild(card);
    });
}

// 5. Modālā loga aizvēršanas loģika
closeModalBtn.onclick = () => {
    modal.style.display = 'none';
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        modal.style.display = "none";
    }
});

// 6. Palaižam visu procesu
document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    initSmartWidget();
});