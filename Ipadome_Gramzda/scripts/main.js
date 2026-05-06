// --- DINAMISKO DATU MAĢIJA GALVENAJĀ LAPĀ ---

// Saite uz problēmu kartes datiem
const problemSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=1538187153&single=true&output=csv';

// Saites "Svaiguma" pārbaudei
const ideasSheetUrlCheck = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=2085625299&single=true&output=csv';
const newsSheetUrlCheck = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=2047508827&single=true&output=csv';
const worksSheetUrlCheck = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=1098530004&single=true&output=csv';

// Breaking News dati
const breakingNewsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=1217546429&single=true&output=csv';

// Robustāka palīgfunkcija: vai datums ir pēdējo 14 dienu laikā?
function isRecent(dateString) {
    if (!dateString) return false;
    
    let postDate;
    // 1. Mēģinām tiešo pārvēršanu. Tā strādā ar ISO formātu (YYYY-MM-DD) un amerikāņu (MM/DD/YYYY).
    const directParse = new Date(dateString);

    // 2. Ja tiešā pārvēršana dod nederīgu datumu, mēģinām manuāli parsēt DD.MM.YYYY vai DD/MM/YYYY formātu.
    if (isNaN(directParse.getTime())) {
        // Mēģinājums #1: DD.MM.YYYY
        const partsDMY = dateString.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/);
        if (partsDMY) {
            // parts[1] = diena, parts[2] = mēnesis, parts[3] = gads
            const d = new Date(`${partsDMY[3]}-${partsDMY[2]}-${partsDMY[1]}`);
            if (!isNaN(d.getTime())) {
                postDate = d;
            }
        } else {
            // Mēģinājums #2: YYYY.DD.MM (kā redzams kļūdas paziņojumā)
            const partsYDM = dateString.match(/^(\d{4})[.\/](\d{1,2})[.\/](\d{1,2})/);
            if (partsYDM) {
                // parts[1] = gads, parts[2] = diena, parts[3] = mēnesis
                const d = new Date(`${partsYDM[1]}-${partsYDM[3]}-${partsYDM[2]}`);
                if (!isNaN(d.getTime())) { postDate = d; }
            }
        }
    } else {
        postDate = directParse;
    }

    // 3. Ja datums joprojām nav atrasts, atgriežam false.
    if (!postDate) {
        console.warn(`Neizdevās nolasīt datumu: "${dateString}"`);
        return false;
    }

    // 4. Salīdzinām atrastu datumu ar šodienu.
    const now = new Date();
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 14; // Rādām "Jauns" 14 dienas
}

// Pievieno emblēmu kartītei
function addNotificationBadge(selector, text = "JAUNUMS") {
    const card = document.querySelector(selector);
    if (card && text !== "APTAUJA" && text !== "VĒRTĒJUMS") {
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = text;
        card.appendChild(badge);
        // Pievienojam arī pulsējošo klasi, lai karte izceltos
        card.classList.add('has-new-content');
    }
}

// JAUNA FUNKCIJA: Pievieno aptaujas indikatoru kartītes apakšā
function addActivePollIndicator(selector, question) {
    const card = document.querySelector(selector);
    if (!card) return;
    
    // Pārbaudām, vai indikators jau neeksistē, lai novērstu dublikātus
    if (card.querySelector('.poll-indicator-bar')) return;

    // Pievienojam klasi uzreiz, lai CSS noteikumi stātos spēkā
    card.classList.add('has-poll');

    // Veidojam elementu
    const indicator = document.createElement('div');
    indicator.className = 'poll-indicator-bar';

    const content = document.createElement('div');
    content.className = 'poll-indicator-content';
    
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-square-poll-vertical';
    content.appendChild(icon);
    
    const span = document.createElement('span');
    span.className = 'poll-question-preview';
    span.textContent = question;
    content.appendChild(span);
    
    const hint = document.createElement('div');
    hint.className = 'poll-action-hint';
    hint.textContent = 'Balsot';
    
    indicator.append(content, hint);
    
    // Pievienojam elementu kartītei - Flexbox to automātiski noliks apakšā
    card.appendChild(indicator);
}

async function countNewProblems() {
    try {
        const response = await fetch(problemSheetUrl + '&t=' + Date.now());
        if (!response.ok) return;

        const data = await response.text();
        const rows = parseCSV(data);
        
        let newProblemCount = 0;
        rows.slice(1).forEach(columns => {
            if (columns && columns.length >= 5) {
                // Ja statuss (6. kolonna) nav norādīts, uzskatām to par jaunu ziņojumu
                const status = (columns.length > 5 && columns[5]) 
                    ? columns[5].trim().replace(/^"|"$/g, '').toLowerCase() 
                    : 'jauns';

                if (status === 'jauns' || status === '') {
                    newProblemCount++;
                }
            }
        });

        if (newProblemCount > 0) {
            // Kartes gadījumā izmantojam standarta badge apakšā (kā bija), vai jauno?
            // Atstājam veco apakšā teksta formā, bet varam pielikt arī "Spiegu" augšā
            const mapCard = document.querySelector('a[href="karte.html"]');
            if(mapCard) {
                const badge = document.createElement('span');
                badge.className = 'notification-badge'; // Izmantojam to pašu klasi, kas tiek pozicionēta apakšā
                badge.textContent = String(newProblemCount);
                mapCard.appendChild(badge);
            }
        }
    } catch (error) {
        console.error("Neizdevās saskaitīt jaunos ziņojumus:", error);
    }
}

async function checkNewIdeas() {
    try {
        const response = await fetch(ideasSheetUrlCheck + '&t=' + Date.now());
        if (!response.ok) return;
        const data = await response.text();
        
        const rows = parseCSV(data);
        if (rows.length < 2) return;
        
        // Pārbaudām pēdējās rindas datumu (0. kolonna)
        // Google Sheets jauni ieraksti parasti nāk apakšā
        const columns = rows[rows.length - 1];
        if (!columns || columns.length === 0) return;
        
        const dateStr = columns[0];
        
        if (isRecent(dateStr)) {
            addNotificationBadge('a[href="idejas.html"]', "JAUNA IDEJA");
        }
    } catch (e) { console.error("Ideju pārbaudes kļūda", e); }
}

async function checkNewArticles() {
    try {
        const response = await fetch(newsSheetUrlCheck + '&t=' + Date.now());
        if (!response.ok) return;
        const data = await response.text();
        
        const rows = parseCSV(data);
        if (rows.length < 2) return;
        
        const columns = rows[rows.length - 1];
        if (!columns || columns.length < 2) return;
        
        // Jaunajā struktūrā datums (Timestamp) ir 0. kolonna
        const dateStr = columns[0] ? columns[0].trim().replace(/^"|"$/g, '') : '';
        
        if (isRecent(dateStr)) {
            addNotificationBadge('a[href="aktualitates.html"]', "JAUNUMS");
        }
    } catch (e) { console.error("Ziņu pārbaudes kļūda", e); }
}

async function checkNewWorks() {
    try {
        const response = await fetch(worksSheetUrlCheck + '&t=' + Date.now());
        if (!response.ok) return;
        const data = await response.text();
        
        const rows = parseCSV(data);
        if (rows.length < 2) return;
        
        const columns = rows[rows.length - 1];
        if (!columns || columns.length < 2) return;
        
        // Saskaņā ar darbi.js, datums ir 2. kolonnā (indekss 1)
        const dateStr = columns[1] ? columns[1].trim().replace(/^"|"$/g, '') : '';
        
        if (isRecent(dateStr)) {
            addNotificationBadge('a[href="darbi.html"]', "JAUNS DARBS");
        }
    } catch (e) { console.error("Darbu pārbaudes kļūda", e); }
}

async function checkBreakingNews() {
    try {
        const response = await fetch(breakingNewsUrl + '&t=' + Date.now());
        if (!response.ok) return;
        
        const data = await response.text();
        const rowsData = parseCSV(data);
        if (rowsData.length < 2) return; 

        // 1. Apstrādājam visas rindas un filtrējam aktīvās
        const allNewsItems = rowsData.slice(1).map(columns => {
            const clean = (val) => (val ? val.trim().replace(/^"|"$/g, '').replace(/\r/g, '') : '');
            return {
                text: clean(columns[1]),
                link: clean(columns[2])
            };
        }).filter(item => item.text && item.text.toUpperCase() !== 'OFF');

        // 2. Paņemam tikai pēdējos 3 (jaunākos) ierakstus
        const newsItems = allNewsItems.slice(-3);

        // Ja nav ziņu vai tās ir tukšas, paslēpjam joslu
        if (newsItems.length === 0 || (newsItems.length === 1 && !newsItems[0].text)) {
            document.getElementById('news-bar').style.display = 'none';
            return;
        }

        // 3. Sagatavojam elementus
        const newsBar = document.getElementById('news-bar');
        const textEl = document.getElementById('news-text');
        const linkEl = document.getElementById('news-link');

        // Pievienojam pārejas efektu stilus caur JS (lai nav jāaiztiek CSS)
        textEl.style.transition = 'opacity 0.5s ease';
        linkEl.style.transition = 'opacity 0.5s ease';

        // Apgriežam otrādi, lai jaunākā (pēdējā rindā) rādās pirmā
        newsItems.reverse();

        let currentIndex = 0;

        const showItem = (index) => {
            const item = newsItems[index];
            // Pārbaudām, vai saite nav tukša un nav vienāda ar pogas tekstu (bieža kļūda tabulās)
            const hasValidLink = item.link && 
                                item.link !== '#' && 
                                item.link !== '' && 
                                item.link.toLowerCase() !== 'skatīt vairāk';

            // Iestatām saturu
            textEl.replaceChildren();
            const label = document.createElement('span');
            label.className = 'news-label';
            label.innerHTML = '<i class="fa-solid fa-circle"></i> AKTUĀLI';
            const newsTxt = document.createElement('span');
            newsTxt.style.color = '#f5f7fa';
            newsTxt.textContent = ` ${item.text}`;
            textEl.append(label, newsTxt);

            if (hasValidLink) {
                linkEl.href = item.link;
                linkEl.style.display = 'inline-flex';
            } else {
                linkEl.style.display = 'none';
            }
        };

        // Parādām pirmo ziņu uzreiz
        newsBar.style.display = 'flex';
        showItem(0);

        // Ja ir vairāk par 1 ziņu, palaižam rotāciju
        if (newsItems.length > 1) {
            setInterval(() => {
                // Izgaisinām
                textEl.style.opacity = '0';
                linkEl.style.opacity = '0';
                
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % newsItems.length;
                    showItem(currentIndex);
                    
                    // Iegaisinām atpakaļ
                    textEl.style.opacity = '1';
                    linkEl.style.opacity = '1';
                }, 500); // 500ms gaidām, kamēr izdziest
            }, 7000); // Mainās ik pēc 7 sekundēm
        }
    } catch (e) {
        console.error("Ziņu joslas kļūda:", e);
    }
}

// Pārbaudām aptauju priekš indikatora sākumlapā
async function checkPollForIndicator() {
    const resp = await fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=503325924&single=true&output=csv&t=${Date.now()}`);
    const text = await resp.text();
    const rows = parseCSV(text).slice(1);
    for (const cols of rows) {
        if (cols[0]?.toUpperCase() === 'X') {
            const type = cols[1].toUpperCase();
            if (type === 'POLL' || type === 'RATING') {
                addActivePollIndicator('a[href="aktualitates.html"]', cols[2]);
            }
            break;
        }
    }
}

function initializeParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Konfigurācija
    let particleCount = 80;
    if (window.innerWidth < 768) particleCount = 30; // Telefoni
    if (window.innerWidth > 1920) particleCount = 150; // Projektori un 4K

    const connectionDistance = 150;
    const mouseDistance = 200;

    let mouse = { x: null, y: null };

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr); // Mērogojam kontekstu, lai zīmējums būtu ass
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 0.5; // Nedaudz smalkākas daļiņas elegantākam izskatam
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Atstarošanās no malām
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Peles interakcija
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;
                    const directionX = forceDirectionX * force * 0.5; // Stiprums
                    const directionY = forceDirectionY * force * 0.5;
                    this.vx -= directionX;
                    this.vy -= directionY;
                }
            }
        }

        draw() {
            ctx.fillStyle = 'rgba(62, 207, 142, 0.6)'; // Accent color
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width * (window.devicePixelRatio || 1), height * (window.devicePixelRatio || 1));
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Savienojumi
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    let opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity * 0.15 + ')';
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        init();
    });

    init();
    animate();
}

function initializeSpotlightEffect() {
    const grid = document.querySelector('.gateway-grid');
    if (!grid) return;

    grid.addEventListener('mousemove', e => {
        const target = e.target.closest('.gateway-card');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
    });
}

function initializeShareWidget() {
    const widget = document.querySelector('.share-widget-container');
    const toggleBtn = document.querySelector('.share-toggle-btn');
    const copyBtn = document.querySelector('.copy-link');
    
    if (!widget || !toggleBtn) return;

    // 1. Atvēršanas/Aizvēršanas loģika
    toggleBtn.addEventListener('click', () => {
        widget.classList.toggle('active');
        
        // Nomainām ikonu
        const icon = toggleBtn.querySelector('i');
        if (widget.classList.contains('active')) {
            icon.classList.remove('fa-share-nodes');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-share-nodes');
        }
    });

    // 2. Dinamiskās saites (lai strādātu uz jebkura domēna)
    const currentUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent("Gramzdas iedzīvotāju padome - Digitālais centrs");

    document.querySelector('.share-item.facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
    document.querySelector('.share-item.whatsapp').href = `https://wa.me/?text=${title}%20${currentUrl}`;
    document.querySelector('.share-item.twitter').href = `https://x.com/intent/tweet?text=${title}&url=${currentUrl}`;

    // 3. Saites kopēšana ar "Toast" paziņojumu
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                // Paziņojums
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                copyBtn.style.background = '#3ecf8e'; // Accent color
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    copyBtn.style.background = '';
                    widget.classList.remove('active'); // Aizveram pēc kopēšanas
                    toggleBtn.querySelector('i').classList.replace('fa-xmark', 'fa-share-nodes');
                }, 2000);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    countNewProblems();
    checkNewIdeas();
    checkNewArticles();
    checkNewWorks();
    checkBreakingNews();
    initializeParticles();
    initializeSpotlightEffect();
    initializeShareWidget();
    checkPollForIndicator();
});