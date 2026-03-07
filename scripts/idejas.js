// --- IDEJU SIENAS MAĢIJA ---

// 1. Tavas jaunās formas datu saite
// PĀRLIECINIES: File -> Share -> Publish to Web -> CSV
const ideasSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnAtcd_8Td4Xe_1AmZAoQ_pFzTHlU-VIYdq8l6nLc14utKcUTusQGBFjeOTCgF8fJNpLLnjLV1az44/pub?output=csv';
const board = document.querySelector('.board'); // HTML ir <div class="board">

// 2. Funkcija, kas nolasa datus
async function fetchIdeas() {
    try {
        // Pievienojam laika zīmogu, lai apietu kešatmiņu (cache busting)
        const response = await fetch(ideasSheetUrl + '&t=' + Date.now());
        
        if (!response.ok) throw new Error(`Tīkla kļūda: ${response.status}`);
        
        const data = await response.text();

        // Pārbaude: Vai saite tiešām atgriež CSV, vai varbūt Google Login lapu?
        if (data.trim().startsWith('<!DOCTYPE html>') || data.includes('<html')) {
            throw new Error('Saite ved uz mājaslapu, nevis CSV failu. Pārbaudi "Publish to Web" iestatījumus (jābūt CSV).');
        }

        // Izmantojam globālo parseCSV no utils.js
        const rows = parseCSV(data);

        // Apstrādājam datus
        const ideas = rows.slice(1).map(columns => {
            if (!columns || columns.length < 2 || columns.every(c => c.trim() === '')) return null;
            
            const clean = (text) => text ? text.trim() : '';
            
            const col1 = clean(columns[1]); 
            const col2 = clean(columns[2]); 
            const col3 = clean(columns[3]); 

            let title = col1 || 'Jauna ideja';
            let description = col2;
            let category = col3 || 'Ideja';

            if (col1 && !col2) {
                title = 'Ierosinājums';
                description = col1;
            }

            return { date: clean(columns[0]).split(' ')[0], title, description, category };
        }).filter(item => item && (item.title || item.description));

        renderIdeas(ideas);
    } catch (error) {
        console.error('Kļūda, ielādējot idejas:', error);
        if(board) {
            // Parādām kļūdu tieši uz ekrāna, lai redzi, kas notiek
            const loading = document.getElementById('loading-indicator');
            if(loading) {
                loading.innerHTML = `
                    <h3 style="color: #e53e3e;">Kļūda!</h3>
                    <p>${error.message}</p>
                `;
                loading.style.background = '#fff5f5';
                loading.style.borderColor = '#e53e3e';
            }
        }
    }
}

// 5. Zīmēšana
function renderIdeas(ideas) {
    if (!board) return;
    
    // Saglabājam "Pievienot" pogu
    const addBtn = board.querySelector('.add-note');
    board.innerHTML = '';
    if (addBtn) board.appendChild(addBtn);

    if (ideas.length === 0) {
        // Ja nav ideju, parādām paziņojumu
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'note loading-note';
        emptyMsg.innerHTML = '<p>Vēl nav iesniegta neviena ideja. Esi pirmais!</p>';
        board.appendChild(emptyMsg);
        return;
    }

    const colors = ['yellow', 'blue', 'pink', 'green'];

    ideas.reverse().forEach((idea, index) => {
        const note = document.createElement('div');
        const color = colors[index % colors.length];
        note.className = `note ${color}`;
        
        note.innerHTML = `
            <h3>${idea.title}</h3>
            <p>${idea.description}</p>
            <div class="likes">
                <span>${idea.category}</span> • <span>${idea.date}</span>
            </div>
        `;
        
        board.appendChild(note);
    });
}

document.addEventListener('DOMContentLoaded', fetchIdeas);