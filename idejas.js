// --- IDEJU SIENAS MAĢIJA ---

// --- 2. GOOGLE SHEET UN ELEMENTU SAITES ---
const apiReadIdeas = 'https://script.google.com/macros/s/AKfycbxxu8muZq5TmRw1tPXakDsFEjLJ2nf5xGVINhk9KRbiz73sJu2o-ZnaW251tdUhogHu/exec?action=getIdeas';
const apiReadVotes = 'https://script.google.com/macros/s/AKfycbxxu8muZq5TmRw1tPXakDsFEjLJ2nf5xGVINhk9KRbiz73sJu2o-ZnaW251tdUhogHu/exec?action=getVotes';
const voteScriptUrl = 'https://script.google.com/macros/s/AKfycbxxu8muZq5TmRw1tPXakDsFEjLJ2nf5xGVINhk9KRbiz73sJu2o-ZnaW251tdUhogHu/exec';
const apiIdeaFormUrl = 'https://script.google.com/macros/s/AKfycbxxu8muZq5TmRw1tPXakDsFEjLJ2nf5xGVINhk9KRbiz73sJu2o-ZnaW251tdUhogHu/exec?action=getIdeaFormUrl'; // Jauns API gals ideju formas URL iegūšanai

const board = document.querySelector('.board'); // HTML ir <div class="board">
let allIdeasCache = []; // Kešatmiņa idejām no Google Sheet
const topIdeasGrid = document.getElementById('top-ideas-grid');

// 3. Funkcija, kas nolasa datus no Google Sheet
async function fetchIdeas() {
    try {
        const response = await fetch(apiReadIdeas + '&t=' + Date.now());
        if (!response.ok) throw new Error(`Tīkla kļūda: ${response.status}`);

        const result = await response.json();
        const rows = result.data;

        // Palīgfunkcija, kas pārvērš jebkuru datuma formātu tekstā, 
        // kas sakrīt ar tavu esošo tabulas ID loģiku (DD.MM.YYYY HH:MM)
        const formatDateForId = (val) => {
            if (!val) return '';
            if (val instanceof Date || (typeof val === 'string' && val.includes('T'))) {
                const d = new Date(val);
                if (isNaN(d)) return String(val);
                const pad = n => String(n).padStart(2, '0');
                // Atgriežam formātu, no kura .replace(/[^a-zA-Z0-9]/g, '') izveidos pareizo ID
                return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }
            return String(val);
        };

        // Apstrādājam datus
        const ideas = rows.slice(1).map(columns => {
            if (!columns || columns.length < 2 || columns.every(c => c.trim() === '')) return null;
            
            const clean = (text) => (text !== null && text !== undefined) ? String(text).trim() : '';
            
            const col1 = clean(columns[1]); 
            const col2 = clean(columns[2]); 
            const col3 = clean(columns[3]); 
            const timestamp = formatDateForId(columns[0]);

            let title = col1 || 'Jauna ideja';
            let description = col2;
            let category = col3 || 'Ideja';

            if (col1 && !col2) {
                title = 'Ierosinājums';
                description = col1;
            }

            return { 
                timestamp: timestamp, // Pilnais laika zīmogs ID veidošanai
                date: timestamp.split(' ')[0], // Datums attēlošanai
                title, 
                description, 
                category 
            };
        }).filter(item => item && (item.title || item.description));

        return ideas;
    } catch (error) {
        console.error('Kļūda, ielādējot idejas:', error);
        return { error: error.message };
    }
}

// 4. Funkcija, kas uzzīmē idejas (bez "Patīk" skaita)
function renderIdeas(ideas, likes = {}) {
    if (!board) return;
    
    // Saglabājam "Pievienot" pogu
    const addBtn = board.querySelector('.add-note');
    board.innerHTML = '';
    if (addBtn) board.appendChild(addBtn);

    const likedIdeas = getLikedIdeas(); // Iegūstam idejas, par kurām lietotājs nobalsojis
    if (ideas.length === 0) {
        // Ja nav ideju, parādām paziņojumu
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'note loading-note';
        const p = document.createElement('p');
        p.textContent = 'Vēl nav iesniegta neviena ideja. Esi pirmais!';
        emptyMsg.appendChild(p);
        board.appendChild(emptyMsg);
        return;
    }

    const colors = ['yellow', 'blue', 'pink', 'green'];

    ideas.reverse().forEach((idea, index) => {
        const ideaId = generateIdeaId(idea); // Katrai idejai izveidojam unikālu ID
        const note = document.createElement('div');
        const color = colors[index % colors.length];
        note.className = `note ${color}`;
        
        const isLiked = likedIdeas.includes(ideaId); // Pārbaudām, vai šī ideja ir "patīk" sarakstā

        const content = document.createElement('div');
        content.className = 'note-content';
        const h3 = document.createElement('h3');
        h3.textContent = idea.title;
        const p = document.createElement('p');
        p.textContent = idea.description;
        content.append(h3, p);
        
        const footer = document.createElement('div');
        footer.className = 'note-footer';
        const meta = document.createElement('div');
        meta.className = 'note-meta';
        meta.textContent = `${idea.category} • ${idea.date}`;
        
        const btn = document.createElement('button');
        btn.className = 'like-btn' + (isLiked ? ' active' : '');
        btn.dataset.ideaId = ideaId;
        btn.title = 'Patīk';
        btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
        const span = document.createElement('span');
        span.className = 'like-count';
        span.textContent = likes[ideaId] || 0;
        btn.appendChild(span);
        
        footer.append(meta, btn);
        note.append(content, footer);
        
        board.appendChild(note);
    });
}

// Jauna funkcija, kas atjauno tikai skaitļus galvenajā sienā (lai nav jāpārzīmē viss)
function updateMainBoardLikes(likes) {
    if (!board) return;
    const buttons = board.querySelectorAll('.like-btn');
    buttons.forEach(btn => {
        const ideaId = btn.dataset.ideaId;
        const countSpan = btn.querySelector('.like-count');
        if (countSpan) {
            const newCount = likes[ideaId] || 0;
            updateCountUI(countSpan, newCount);
        }
    });
}

// Jauna funkcija, kas zīmē Top 3 idejas
function renderTopIdeas(allIdeas, likes) {
    if (!topIdeasGrid) return;

    // 1. Pievienojam 'likes' skaitu katrai idejai
    const ideasWithLikes = allIdeas.map(idea => ({
        ...idea,
        likes: likes[generateIdeaId(idea)] || 0
    }));

    // 2. Sakārtojam idejas pēc 'likes' skaita dilstošā secībā
    // Ja 'likes' skaits ir vienāds, kārtojam pēc datuma (jaunākās pirmās)
    ideasWithLikes.sort((a, b) => {
        if (b.likes !== a.likes) {
            return b.likes - a.likes;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // 3. Paņemam pirmās 3 idejas
    const top3 = ideasWithLikes.slice(0, 3);

    topIdeasGrid.innerHTML = ''; // Notīrām veco saturu

    if (top3.length === 0 || top3[0].likes === 0) {
        topIdeasGrid.innerHTML = '<p>Vēl nav populāru ideju. Esi pirmais, kas balso!</p>';
        return;
    }

    top3.forEach(idea => {
        const ideaId = generateIdeaId(idea);
        const isLiked = getLikedIdeas().includes(ideaId);

        const card = document.createElement('div');
        card.className = 'note';
        
        const content = document.createElement('div');
        const h3 = document.createElement('h3');
        h3.textContent = idea.title;
        const p = document.createElement('p');
        p.textContent = idea.description;
        content.append(h3, p);
        
        const footer = document.createElement('div');
        footer.className = 'note-footer';
        const meta = document.createElement('div');
        meta.className = 'note-meta';
        meta.textContent = `${idea.category} • ${idea.date}`;
        
        const display = document.createElement('div');
        display.className = 'like-display' + (isLiked ? ' active' : '');
        display.innerHTML = '<i class="fa-solid fa-heart"></i>';
        const count = document.createElement('span');
        count.className = 'like-count';
        count.textContent = idea.likes;
        display.appendChild(count);
        
        footer.append(meta, display);
        card.append(content, footer);
        topIdeasGrid.appendChild(card);
    });
}

// Jauna palīgfunkcija skaitļa atjaunošanai ar animāciju
function updateCountUI(span, newCount) {
    const oldCount = parseInt(span.textContent, 10);
    if (oldCount !== newCount) {
        span.textContent = newCount;
        span.classList.add('updated');
        setTimeout(() => {
            span.classList.remove('updated');
        }, 300); // Animācijas ilgums
    }
}


// --- 6. "PATĪK" LOKĀLĀ UN DATUBĀZES LOĢIKA ---

function generateIdeaId(idea) {
    // Izveidojam vienkāršu, atkārtojamu ID no idejas datiem.
    // SVARĪGI: Firebase atslēgas nedrīkst saturēt ".", "#", "$", "[", "]" vai "/"
    // Tāpēc mēs izņemam visus simbolus, atstājot tikai burtus un ciparus.
    // Izmantojam pilno laika zīmogu (timestamp), lai nodrošinātu unikalitāti, jo datums var atkārtoties.
    const safeTimestamp = idea.timestamp.replace(/[^a-zA-Z0-9]/g, '');
    const safeTitle = idea.title.replace(/[^a-zA-Z0-9ā-žĀ-Ž]/g, ''); // Burti (arī latviešu) un cipari
    return `${safeTimestamp}-${safeTitle.slice(0, 20)}`;
}

function getLikedIdeas() {
    return JSON.parse(localStorage.getItem('likedIdeas')) || [];
}

function saveLikedIdeas(ideas) {
    localStorage.setItem('likedIdeas', JSON.stringify(ideas));
}

function getOrCreateUID() {
    let uid = localStorage.getItem('gramzda_uid');
    if (!uid) {
        uid = 'usr_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('gramzda_uid', uid);
    }
    return uid;
}

function handleLikeClick(event) {
    const likeBtn = event.target.closest('.like-btn');
    if (!likeBtn || likeBtn.disabled) return; // Novēršam dubultklikšķus

    likeBtn.disabled = true; // Atspējojam pogu
    likeBtn.classList.add('loading'); // Pievienojam ielādes klasi

    const ideaId = likeBtn.dataset.ideaId;
    const countSpan = likeBtn.querySelector('.like-count');
    
    let uid = getOrCreateUID();

    try {
        let likedIdeas = getLikedIdeas();
        let currentCount = parseInt(countSpan.textContent, 10);

        if (likedIdeas.includes(ideaId)) { 
            // ATSAUKT "PATĪK" (Optimistiskais UI)
            likedIdeas = likedIdeas.filter(id => id !== ideaId);
            likeBtn.classList.remove('active');
            // Tūlītēja (optimistiska) skaitītāja atjaunošana
            updateCountUI(countSpan, Math.max(0, currentCount - 1));
            fetch(voteScriptUrl + `?id=${ideaId}&vote=REMOVE&uid=${uid}&source=Ideju_siena&t=${Date.now()}`, { mode: 'no-cors' })
                .finally(() => {
                    likeBtn.disabled = false; // Atkal iespējojam pogu
                    likeBtn.classList.remove('loading'); // Noņemam ielādes klasi
                });
        } else { 
            // NOSPIEST "PATĪK" (Optimistiskais UI)
            likedIdeas.push(ideaId);
            likeBtn.classList.add('active');
            // Tūlītēja (optimistiska) skaitītāja atjaunošana
            updateCountUI(countSpan, currentCount + 1);
            fetch(voteScriptUrl + `?id=${ideaId}&vote=LIKE&uid=${uid}&source=Ideju_siena&t=${Date.now()}`, { mode: 'no-cors' })
                .finally(() => {
                    likeBtn.disabled = false; // Atkal iespējojam pogu
                    likeBtn.classList.remove('loading'); // Noņemam ielādes klasi
                });
        }
        saveLikedIdeas(likedIdeas);
    } catch (error) {
        console.error("Kļūda balsojot:", error);
        alert("Neizdevās nobalsot. Iespējams, datubāzes savienojuma kļūda.");
        likeBtn.disabled = false; // Atkal iespējojam pogu kļūdas gadījumā
        likeBtn.classList.remove('loading'); // Noņemam ielādes klasi
    }
}

// --- 7. GALVENĀ FUNKCIJA, KAS VISU PALAIŽ ---
async function initializeIdeaWall() {
    if (board) {
        board.addEventListener('click', handleLikeClick);
        if (topIdeasGrid) topIdeasGrid.addEventListener('click', handleLikeClick);
    }

    // Ielādējam ideju iesniegšanas formas URL
    let ideaFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf7UqVFJNeew-k_eaijKhDMrLLPsPXIxWj63fYYZK5JcCcZ-w/viewform'; // Noklusējuma/rezerves URL
    try {
        const formResponse = await fetch(apiIdeaFormUrl + '&t=' + Date.now());
        if (formResponse.ok) {
            const formResult = await formResponse.json();
            // Pieņemam, ka URL ir pirmajā rindā, pirmajā kolonnā
            if (formResult.data && formResult.data[0] && formResult.data[0][0]) {
                ideaFormUrl = formResult.data[0][0];
            }
        } else {
            console.warn("Neizdevās ielādēt ideju iesniegšanas formas URL no API. Izmantoju noklusējuma URL.");
        }
    } catch (e) {
        console.error("Kļūda ielādējot ideju formas URL:", e);
        console.warn("Izmantoju noklusējuma ideju iesniegšanas formas URL.");
    }

    // Atjaunojam "Pievienot ideju" pogas saiti
    const addIdeaButton = document.querySelector('.add-note');
    if (addIdeaButton) {
        addIdeaButton.href = ideaFormUrl;
    }

    // Ielādējam idejas un balsis paralēli
    const likes = {};
    try {
        const [ideasData, votesData] = await Promise.all([
            fetchIdeas(),
            fetch(apiReadVotes + '&t=' + Date.now()).then(res => res.json())
        ]);

        if (ideasData.error) throw new Error(ideasData.error);
        
        allIdeasCache = ideasData;

        // Apstrādājam balsis
        // Pievienots .slice(1), lai izlaistu tabulas galveni (Laiks, ID, Balsojums...)
        votesData.data.slice(1).forEach(row => {
            const ideaId = row[1];
            const action = row[2];
            if (action === 'LIKE') likes[ideaId] = (likes[ideaId] || 0) + 1;
            if (action === 'REMOVE') likes[ideaId] = Math.max(0, (likes[ideaId] || 1) - 1);
        });

        renderIdeas(allIdeasCache, likes);
        renderTopIdeas(allIdeasCache, likes);

    } catch (err) { console.error("Kļūda ielādējot likes:", err); }
}

document.addEventListener('DOMContentLoaded', initializeIdeaWall);