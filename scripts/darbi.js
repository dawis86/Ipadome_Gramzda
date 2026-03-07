// --- LAIKA LĪNIJAS MAĢIJA ---

// 1. Tavas unikālās saites
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS7476-SDyWcv06cnNftpKCxwvXSxepfoqSOVul8heCsF-GDRQbb9k0VnAtEKCQe3aq4-TDP4fLclv/pub?output=csv';
const timeline = document.querySelector('.timeline');

// 2. Funkcija, kas nolasa datus no Google Sheet
async function fetchJobs() {
    try {
        const response = await fetch(sheetUrl);
        if (!response.ok) {
            throw new Error('Tīkla atbilde nebija veiksmīga.');
        }
        const data = await response.text();
        
        // Izmantojam globālo parseCSV no utils.js
        const rows = parseCSV(data);

        // Apstrādājam datus
        const jobs = rows.slice(1).map(columns => {
            if (columns.length < 4) return null;
            
            return {
                date: columns[1] ? columns[1].trim() : 'Bez datuma',
                title: columns[2] ? columns[2].trim() : 'Bez nosaukuma',
                description: columns[3] ? columns[3].trim() : '',
                category: columns[4] ? columns[4].trim() : 'Vispārīgi'
            };
        }).filter(job => job && job.title && job.title !== 'Bez nosaukuma');

        renderJobs(jobs);
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
    const loadingIndicator = document.getElementById('loading-indicator');
    if (jobs.length === 0) {
        if (loadingIndicator) {
            loadingIndicator.querySelector('.timeline-content').innerHTML = '<h3>Vēl nav pievienots neviens darbs.</h3><p>Visi paveiktie darbi tiks attēloti šeit.</p>';
        }
        return;
    }

    // Notīrām visu, lai neveidotos dublikāti
    timeline.innerHTML = ''; 

    let allItemsHTML = '';
    // Pievienojam jaunus ierakstus, sākot no augšas
    jobs.reverse().forEach(job => {
        allItemsHTML += `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-date">${job.date}</div>
                <div class="timeline-content">
                    <h3>${job.title}</h3>
                    <p>${job.description}</p>
                    <span class="tag">${job.category}</span>
                </div>
            </div>`;
    });
    timeline.innerHTML = allItemsHTML; // Ievietojam visu HTML vienā reizē - tas ir ātrāk un kvalitatīvāk
}

// 5. Palaižam visu procesu
document.addEventListener('DOMContentLoaded', fetchJobs);