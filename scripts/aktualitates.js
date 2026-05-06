// --- AKTUALITĀŠU SIENAS MAĢIJA ---

// 1. Tavas unikālās saites un elementi
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=0&single=true&output=csv';
const newsGrid = document.querySelector('.news-grid');
const modal = document.getElementById('news-modal');
const closeModalBtn = document.querySelector('.close-modal');

// --- WOW EFEKTS: TĪRS JS KONFETI ---
function triggerWowEffect() {
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

// 2. Funkcija, kas nolasa datus no Google Sheet
async function fetchNews() {
    try {
        const response = await fetch(sheetUrl + '&t=' + Date.now());
        if (!response.ok) throw new Error('Tīkla kļūda');
        const data = await response.text();
        
        const rows = parseCSV(data);

        const newsItems = rows.slice(1).map(columns => {
            if (!columns || columns.length < 4) return null; // Drošības pārbaude
            
            const date = columns[1] ? columns[1].trim() : 'Nav datuma';
            const title = columns[2] ? columns[2].trim() : '';
            const category = columns[3] ? columns[3].trim() : 'Jaunums';
            const rawText = columns[4] ? columns[4].trim() : '';
            const manualLink = columns[5] ? columns[4].trim() : null;
            
            const linkMatch = rawText.match(/(https?:\/\/[^\s]+|protokols[\/\\][^\s]+\.pdf)$/i);
            
            let cleanText = rawText;
            let extractedLink = manualLink;
            
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
            document.getElementById('modal-date').textContent = item.date;
            document.getElementById('modal-category').textContent = item.category;
            document.getElementById('modal-category').className = `news-tag tag-${normalizedCategory}`;
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