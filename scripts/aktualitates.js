// --- AKTUALITĀŠU SIENAS MAĢIJA ---

// 1. Tavas unikālās saites un elementi
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMxi1MyVSOkyS2cVSjVld57NoLmZyBujXzQk6ib1_GBFEQWwLMRO3I6z_0V4qgtC2WywJKYPZ08BXm/pub?output=csv';
const newsGrid = document.querySelector('.news-grid');
const modal = document.getElementById('news-modal');
const closeModalBtn = document.querySelector('.close-modal');

// 2. Funkcija, kas nolasa datus no Google Sheet
async function fetchNews() {
    try {
        const response = await fetch(sheetUrl + '&t=' + Date.now());
        if (!response.ok) throw new Error('Tīkla kļūda');
        const data = await response.text();
        
        // Izmantojam globālo parseCSV no utils.js
        const rows = parseCSV(data);

        // Apstrādājam datus
        const newsItems = rows.slice(1).map(columns => {
            // Mums vajag vismaz 5 kolonnas (Timestamp, Datums, Virsraksts, Kategorija, Teksts)
            if (columns.length < 5) return null;
            
            return {
                date: columns[1].trim(),
                title: columns[2].trim(),
                category: columns[3].trim(),
                text: columns[4].trim()
            };
        }).filter(item => item && item.title);

        renderNews(newsItems);
    } catch (error) {
        console.error('Kļūda, ielādējot jaunumus:', error);
        newsGrid.innerHTML = '<div class="news-card"><h3>Kļūda ielādējot datus.</h3><p>Mēģiniet pārlādēt lapu vēlāk.</p></div>';
    }
}

// 4. Funkcija, kas uzzīmē ziņas
function renderNews(newsItems) {
    if (newsItems.length === 0) {
        newsGrid.innerHTML = '<div class="news-card"><h3>Vēl nav pievienoti jaunumi.</h3></div>';
        return;
    }

    newsGrid.innerHTML = ''; // Notīrām "Ielādēju..." paziņojumu

    newsItems.reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        
        const normalizedCategory = item.category.toLowerCase().replace(/\s+/g, '-');

        card.innerHTML = `
            <div class="news-header">
                <span class="news-date">${item.date}</span>
                <span class="news-tag tag-${normalizedCategory}">${item.category}</span>
            </div>
            <h3>${item.title}</h3>
            <p class="news-excerpt">${item.text}</p>
        `;

        // Pievienojam notikumu, lai atvērtu modālo logu
        card.addEventListener('click', () => {
            document.getElementById('modal-date').textContent = item.date;
            document.getElementById('modal-category').textContent = item.category;
            document.getElementById('modal-category').className = `news-tag tag-${normalizedCategory}`;
            document.getElementById('modal-title').textContent = item.title;
            document.getElementById('modal-body').textContent = item.text;
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
document.addEventListener('DOMContentLoaded', fetchNews);