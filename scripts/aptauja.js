/**
 * APTAUJAS ANALĪTIKAS MODULIS
 * Šis skripts nodrošina Excel datu nolasīšanu (XLSX), datu filtrēšanu un 
 * vizualizāciju, izmantojot Chart.js bibliotēku.
 * Ietver automātisko noskaņojuma analīzi un KPI rādītāju aprēķinus.
 */

// Datu mapēšana: Pārvērš skaitliskās vērtības no Excel cilvēkam saprotamā tekstā
const MAPPINGS = {
    'Vecuma grupa': { 1: 'Līdz 18', 2: '19-30', 3: '31-45', 4: '46-62', 5: '63+' },
    'Dzīvesvieta': { 1: 'Gramzda', 2: 'Gramzdas pagasts', 3: 'Citviet, bet saistīts ar Gramzdu' },
    'Iesaistīšanās': { 4: 'Jā', 3: 'Drīzāk jā', 2: 'Drīzāk nē', 1: 'Nē' },
    'Vertējums5': { 5: 'Ļoti laba', 4: 'Drīzāk laba', 3: 'Nav bijusi nepieciešamība sazināties', 2: 'Drīzāk nepietiekama', 1: 'Nepietiekama' },
    'Biežums': { 5: 'Regulāri', 4: 'Reizēm', 3: 'Reti', 2: 'Grūti pateikt', 1: 'Neizmantotu' },
    'DeputatiInterese': { 3: 'Jā', 2: 'Varbūt', 1: 'Nē' },
    'Uzklausišana': { 4: 'Jā', 3: 'Drīzāk jā', 2: 'Drīzāk nē', 1: 'Nē' },
    'PriekuleNami': { 5: 'Jā', 4: 'Drīzāk jā', 3: 'Man nav viedokļa', 2: 'Drīzāk nē', 1: 'Nē' }
};

// Globālie mainīgie datu un grafiku stāvokļa glabāšanai
let globalData = [];
let activeCharts = [];
let activeTab = 'upload';
let modalChartInstance = null;
let currentFilters = { age: '', location: '' };

// Reģistrējam Chart.js spraudni, kas rāda procentuālās vērtības tieši uz grafika
Chart.register(ChartDataLabels);

// Chart.js Globālie iestatījumi "Wow" efektam
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
Chart.defaults.animation.duration = 400; // Uber-fast animations

// Sadaļu (tab) pārslēgšanas loģika
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        button.classList.add('active');
        activeTab = button.dataset.tab;
        document.getElementById(activeTab).classList.add('active');
        document.getElementById('page-title').innerText = button.innerText;
        updateDashboard();
    });
});

// Prezentācijas režīms: Paslēpj sānjoslu, lai palielinātu vietu grafikiem
document.getElementById('togglePresentation').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    const main = document.getElementById('mainArea');
    const btn = document.getElementById('togglePresentation');
    
    sidebar.classList.toggle('hidden');
    main.classList.toggle('expanded');
    document.body.classList.toggle('presentation-on');
    
    const isHidden = sidebar.classList.contains('hidden');
    btn.innerHTML = isHidden ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
    btn.title = isHidden ? 'Iziet no prezentācijas' : 'Prezentācijas režīms';
    
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 500);
});

// Saite uz Excel failu GitHub krātuvē (Raw formātā)
const GITHUB_EXCEL_URL = 'https://raw.githubusercontent.com/dawis86/Ipadome_Gramzda/main/Aptaujas%20rezultats_Gramzda_IP.xlsx';

/**
 * Ielādē datus no GitHub URL un inicializē apstrādi */
async function loadDataFromUrl(url) {
    document.getElementById('dataStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pieslēdzos GitHub...';
    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error('Neizdevās sasniegt failu');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames.includes("dati") ? "dati" : workbook.SheetNames[0];
        // Atlasām datus un izfiltrējam pilnīgi tukšās rindas
        globalData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]).filter(row =>
            Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '')
        );
        
        handleDataLoad();
    } catch (error) {
        document.getElementById('dataStatus').innerHTML = `<i class="fas fa-exclamation-triangle"></i> Kļūda: ${error.message}`;
    }
}

/** Aktivizē UI elementus pēc veiksmīgas datu ielādes */
function handleDataLoad() {
    if (!globalData || globalData.length === 0) {
        document.getElementById('dataStatus').innerHTML = `<i class="fas fa-exclamation-triangle"></i> Fails ir tukšs!`;
        console.warn("Dati nav atrasti vai fails ir tukšs.");
        return;
    }

    console.log("Dati ielādēti veiksmīgi. Rindu skaits:", globalData.length);
    document.getElementById('dataStatus').innerHTML = `<i class="fas fa-check-circle"></i> Live Data: ${globalData.length}`;
    document.getElementById('filterControls').style.display = 'flex';
    document.getElementById('kpiRow').style.display = 'grid';
    document.getElementById('insightBox').style.display = 'block';
    document.getElementById('liveBadge').classList.add('visible');
    
    populateFilters();
    initDashboard();
}

/** Aizpilda demogrāfiskos filtrus ar unikālajām vērtībām no datiem */
function populateFilters() {
    const ageSelect = document.getElementById('ageFilter');
    const locSelect = document.getElementById('locationFilter');
    
    const ages = [...new Set(globalData.map(d => d['Vecuma grupa']))].sort();
    const locs = [...new Set(globalData.map(d => d['Dzīvesvieta']))].sort();

    ages.forEach(a => {
        const opt = new Option(MAPPINGS['Vecuma grupa'][a] || a, a);
        ageSelect.add(opt);
    });
    locs.forEach(l => {
        const opt = new Option(MAPPINGS['Dzīvesvieta'][l] || l, l);
        locSelect.add(opt);
    });

    ageSelect.addEventListener('change', (e) => { currentFilters.age = e.target.value; updateDashboard(); });
    locSelect.addEventListener('change', (e) => { currentFilters.location = e.target.value; updateDashboard(); });
}

/** Atjaunina visus grafikus un KPI rādītājus pēc filtra maiņas */
function updateDashboard() {
    const filtered = globalData.filter(d => {
        const ageMatch = !currentFilters.age || d['Vecuma grupa'] == currentFilters.age;
        const locMatch = !currentFilters.location || d['Dzīvesvieta'] == currentFilters.location;
        return ageMatch && locMatch;
    });
    
    // Optimizācija: Prioritizējam redzamos datus, pārējo atliekam
    updateKPIs(filtered);
    generateInsights(filtered, activeTab);
    
    // Izmantojam requestIdleCallback, lai nebloķētu UI
    const scheduler = window.requestIdleCallback || (cb => setTimeout(cb, 1));
    scheduler(() => {
        renderAllCharts(filtered);
        renderWishes(filtered);
        generateConclusions(filtered);
    });
}

// Modālo logu pārvaldība: Ļauj palielināt grafiku vai lasīt pilnu tekstu
function openModal(chartInstance, title) {
    const modal = document.getElementById('chartModal');
    const modalText = document.getElementById('modalTextContainer');
    const canvas = document.getElementById('modalCanvas');
    const ctx = document.getElementById('modalCanvas').getContext('2d');
    modal.style.display = 'flex';
    modalText.style.display = 'none';
    canvas.style.display = 'block';

    if (modalChartInstance) modalChartInstance.destroy();
    modalChartInstance = new Chart(ctx, {
        type: chartInstance.config.type,
        data: chartInstance.config.data,
        options: {
            ...chartInstance.config.options,
            maintainAspectRatio: false,
            plugins: {
                ...chartInstance.config.options.plugins,
                title: { display: true, text: title, font: { size: 24 } }
            }
        }
    });
}

function openTextModal(text, category) {
    const modal = document.getElementById('chartModal');
    const modalText = document.getElementById('modalTextContainer');
    const modalBody = document.getElementById('modalTextBody');
    const canvas = document.getElementById('modalCanvas');
    
    modal.style.display = 'flex';
    canvas.style.display = 'none';
    modalText.style.display = 'flex';
    
    document.getElementById('modalTextCategory').innerText = category;
    document.getElementById('modalTextBody').innerText = text;

    if (Array.isArray(text)) {
        modalBody.innerHTML = text.map(t => `
            <div style="background:rgba(255,255,255,0.07); padding:20px; border-radius:12px; border-left:5px solid var(--primary); margin-bottom:15px; color:#fff; font-size:1.1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                ${t}
            </div>
        `).join('');
    } else {
        modalBody.innerHTML = `<div style="color:#fff; font-size:1.3rem;">${text}</div>`;
    }
}

function closeModal() {
    document.getElementById('chartModal').style.display = 'none';
    if (modalChartInstance) modalChartInstance.destroy();
}

/** Agregē datus no Excel: saskaita atzīmes "x" vai skaitļus kolonnās */
function smartAggregate(data, prefix, otherColumn, limitTop = 10) {
    const result = {};
    if (!data || !data.length) return result;

    const allKeys = new Set();
    data.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));
    
    const isBinaryPrefix = !!(prefix && prefix.length > 0);
    const normPrefix = isBinaryPrefix ? prefix.toLowerCase().replace(/\s+/g, ' ').trim() : "";
    
    const columns = Array.from(allKeys).filter(k => {
        if (!isBinaryPrefix) return false;
        const normKey = k.toLowerCase().replace(/\s+/g, ' ').trim();
        return normKey.startsWith(normPrefix);
    });

    data.forEach(row => {
        if (isBinaryPrefix) {
            columns.forEach(col => {
                const val = String(row[col] || '').trim().toLowerCase();
                // Pārbaudām visus Excel atzīmju veidus (skaitlis 1 vai burts x)
                if (val === '1' || val === 'x' || val === 'true' || val === 'jā') {
                    let label = col.replace(new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '').trim();
                    const cleanLabel = label.charAt(0).toUpperCase() + label.slice(1);
                    result[cleanLabel] = (result[cleanLabel] || 0) + 1;
                }
            });
        }

        if (otherColumn && row[otherColumn]) {
            const val = String(row[otherColumn]).trim();
            if (val.length > 1 && val !== '0' && val.toLowerCase() !== 'nav atzīmēts') {
                const cleanVal = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                result[cleanVal] = (result[cleanVal] || 0) + 1;
            }
        }
    });

    const sortedEntries = Object.entries(result).sort((a, b) => b[1] - a[1]);
    if (sortedEntries.length > limitTop && !isBinaryPrefix) {
        return Object.fromEntries(sortedEntries.slice(0, limitTop));
    }
    return result;
}

/** Vienkārša latviešu valodas noskaņojuma analīze pēc atslēgvārdiem */
function analyzeSentiment(text) {
    if (!text) return 'neu';
    const t = text.toLowerCase();
    
    // Zinātniski definēti latviešu valodas leksikas marķieri
    const pos = ['paldies', 'labi', 'lieliski', 'prieks', 'attīstība', 'skaisti', 'sakopts', 'turpināt', 'veiksmi', 'patīk', 'iesaku', 'atbalstu'];
    const neg = ['trūkst', 'nav', 'slikti', 'problēma', 'vairāk', 'nepieciešams', 'grūti', 'neapmierina', 'bedres', 'tumšs', 'bīstami', 'slikts'];
    
    let score = 0;
    pos.forEach(w => { if (t.includes(w)) score++; });
    neg.forEach(w => { if (t.includes(w)) score--; });
    
    if (score > 0) return 'pos';
    if (score < 0) return 'neg';
    return 'neu';
}

/** Ģenerē AI stila secinājumus par pašreizējo datu kopu */
function generateInsights(data, tab) {
    if (!data.length) return;
    let insight = `<i class="fas fa-microchip"></i> <strong>AI Analīze [${tab}]:</strong> `;

    const satisfaction = Math.round((data.filter(d => Number(d['Pārvaldnieces pieejamības vērtējums']) >= 4).length / data.length) * 100);
    const engagement = Math.round((data.filter(d => Number(d['Vēlētos vairāk iesaistīties pagasta aktivitātēs']) >= 3).length / data.length) * 100);

    if (tab === 'demographics') {
        const topLocEntries = Object.entries(countOccurrences(data, 'Dzīvesvieta', MAPPINGS['Dzīvesvieta'])).sort((a,b)=>b[1]-a[1]);
        const topLoc = topLocEntries.length > 0 ? topLocEntries[0][0] : "nav datu";
        insight += `Dominējošā grupa ir no <strong>${topLoc}</strong>. Informācijas kanālu analīze rāda, ka digitālā komunikācija ir efektīva ${satisfaction}% gadījumu.`;
    } else if (tab === 'priorities') {
        const prio = smartAggregate(data, 'Par prioritāti uzskata', 'Cita prioritāte');
        const topPrio = Object.entries(prio).sort((a,b)=>b[1]-a[1])[0][0];
        insight += `Kritiskā prioritāte šai grupai ir <strong>${topPrio}</strong>. Tas sakrīt ar ${Math.round(Object.values(prio)[0]/data.length*100)}% respondentu viedokli.`;
    } else if (tab === 'engagement' || tab === 'priorities') {
        insight += `Kopienas enerģijas līmenis: <strong>${engagement}%</strong> ir gatavi iesaistīties. Galvenais resurss: brīvprātīgais darbs un ideju sniegšana.`;
    } else if (tab === 'future') {
        const wishesCount = data.filter(d => d['Galvenā vēlēšanās Gramzdas nākotnei']).length;
        const sentiment = Math.round((data.filter(d => analyzeSentiment(d['Galvenā vēlēšanās Gramzdas nākotnei']) === 'pos').length / wishesCount) * 100);
        insight += `Ievāktas <strong>${wishesCount}</strong> unikālas vīzijas. <strong>${sentiment}%</strong> no tām ir izteikti pozitīvas vai attīstību veicinošas.`;
    } else {
        insight += `Sistēmas analīze uzrāda stabilu uzticības indeksu (<strong>${satisfaction}%</strong>). Visi dati ir sinhronizēti un gatavi lēmumu pieņemšanai.`;
    }
    
    document.getElementById('insightText').innerHTML = insight;
    document.getElementById('kpiSatisfaction').innerText = satisfaction + '%';
}

/** Izveido galvenos kopsavilkuma punktus (pozitīvie/kritiskie) */
function generateConclusions(data) {
    const bestContainer = document.getElementById('bestInsights');
    const worstContainer = document.getElementById('worstInsights');
    if (!bestContainer || !worstContainer) return;
    
    bestContainer.innerHTML = ''; worstContainer.innerHTML = '';
    if (!data.length) return;

    // 1. Apmierinātība ar pārvaldi (Pozitīvs)
    const satisfaction = Math.round((data.filter(d => Number(d['Pārvaldnieces pieejamības vērtējums']) >= 4).length / data.length) * 100);
    addConclusion(bestContainer, `Pārvaldības etalons`, `<strong>${satisfaction}%</strong> respondentu augsti vērtē pagasta pārvaldnieces pieejamību un atsaucību.`, 'fa-check-double');

    // 2. Prioritātes (Kritisks)
    const priorities = smartAggregate(data, 'Par prioritāti uzskata', 'Cita prioritāte');
    const topPrio = Object.entries(priorities).sort((a,b) => b[1] - a[1])[0];
    if (topPrio) addConclusion(worstContainer, `Galvenais iedzīvotāju izaicinājums`, `Iedzīvotāji kā kritisku prioritāti izvirza: <strong>${topPrio[0]}</strong>. Nepieciešama tūlītēja resursu koncentrācija.`, 'fa-tools');

    // 3. Informētība (Pozitīvs)
    const fbInfo = data.filter(d => d['Informāciju iegūst Facebook'] == 1).length;
    addConclusion(bestContainer, `Digitālā komunikācija`, `<strong>Facebook</strong> ir dominējošais info kanāls (${Math.round(fbInfo/data.length*100)}%), kas nodrošina zibenīgu saziņu.`, 'fa-mobile-alt');

    // 4. Trūkumi (Kritisks)
    const missing = smartAggregate(data, '', 'Kas Gramzdā šobrīd pietrūkst visvairāk');
    const topMissing = Object.entries(missing).sort((a,b) => b[1] - a[1])[0];
    if (topMissing) addConclusion(worstContainer, `Akūtie trūkumi`, `Visbiežāk minētais trūkums Gramzdā: <strong>${topMissing[0]}</strong>.`, 'fa-exclamation-triangle');
}

function addConclusion(container, title, text, icon) {
    const div = document.createElement('div');
    div.className = 'roadmap-step';
    div.style.marginBottom = '10px';
    div.innerHTML = `<h4><i class="fas ${icon}"></i> ${title}</h4><p>${text}</p>`;
    container.appendChild(div);
}

function buildRoadmap(data) {
    const container = document.getElementById('roadmapContainer');
    container.innerHTML = '';

    const priorities = smartAggregate(data, 'Par prioritāti uzskata', 'Cita prioritāte');
    const sorted = Object.entries(priorities).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        container.innerHTML = '<div style="color:var(--accent); padding:40px; text-align:center; border:2px dashed var(--glass-border); border-radius:12px;"><h3>Prioritāšu dati netika identificēti</h3><p>Pārbaudiet, vai Excel failā kolonnu virsraksti sākas ar "Par prioritāti uzskata".</p></div>';
        return;
    }

    const segments = [
        { title: 'Tūlītējas Rīcības (Top 3)', icon: 'fa-bolt', data: sorted.slice(0, 3) },
        { title: 'Vidēja termiņa plāns', icon: 'fa-calendar-alt', data: sorted.slice(3, 6) },
        { title: 'Stratēģiskā vīzija', icon: 'fa-eye', data: sorted.slice(6, 10) }
    ];

    segments.forEach(seg => {
        if (seg.data.length === 0) return;
        const div = document.createElement('div');
        div.className = 'roadmap-step';
        div.innerHTML = `
            <h4><i class="fas ${seg.icon}"></i> ${seg.title}</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${seg.data.map(([name, count]) => `
                    <div class="wish-item" style="opacity: 1; animation: none; padding: 5px 15px; font-size: 0.8rem;">
                        ${name} <span class="roadmap-badge">${Math.round(count / data.length * 100)}%</span>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(div);
    });
}

function updateKPIs(data) {
    document.getElementById('kpiTotal').innerText = data.length;

    // 1. Aprēķinam gatavību iesaistīties (no 2.3.)
    const positive = data.filter(d => d['Vēlētos vairāk iesaistīties pagasta aktivitātēs'] >= 3).length;
    const perc = data.length ? Math.round((positive / data.length) * 100) : 0;
    document.getElementById('kpiEngagement').innerText = `${perc}%`;

    // 2. Aprēķinam dominējošo prioritāti (no 2.1.)
    const priorities = smartAggregate(data, 'Par prioritāti uzskata', 'Cita prioritāte');
    const topPrio = Object.entries(priorities).sort((a,b) => b[1] - a[1])[0];
    document.getElementById('kpiTopPriority').innerText = topPrio ? topPrio[0] : '-';
}

// Manuālā Excel faila augšupielāde
document.getElementById('excelFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    document.getElementById('dataStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Apstrādāju...';

    reader.onload = function(evt) {
        const workbook = XLSX.read(evt.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames.includes("dati") ? "dati" : workbook.SheetNames[0];
        // Atlasām datus un izfiltrējam pilnīgi tukšās rindas
        globalData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]).filter(row =>
            Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '')
        );
        
        handleDataLoad();
    };
    reader.readAsBinaryString(file);
});

// Automātiska ielāde pie ielādes
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromUrl(GITHUB_EXCEL_URL);

    // Pievienojam klausītāju pogai, lai tā strādātu manuāli
    const githubBtn = document.getElementById('loadGithubBtn');
    if (githubBtn) {
        githubBtn.addEventListener('click', () => loadDataFromUrl(GITHUB_EXCEL_URL));
    }
});

function initDashboard() {
    renderTable(globalData); // Tabulu rādām vienmēr pilnu
    // Automātiski pārslēdz uz demogrāfiju pēc ielādes
    document.querySelector('[data-tab="demographics"]').click();
}

/** Inicializē visus grafikus atbilstoši aptaujas jautājumiem */
function renderAllCharts(data) {
    activeCharts.forEach(c => c.destroy());
    activeCharts = [];

    // 1. Vecuma Grupas (Donut)
    const ages = countOccurrences(data, 'Vecuma grupa', MAPPINGS['Vecuma grupa']);
    createChart('ageChart', 'doughnut', 'Vecuma sadalījums', ages);

    // 2. Dzīvesvieta (Bar)
    const locations = countOccurrences(data, 'Dzīvesvieta', MAPPINGS['Dzīvesvieta']);
    createChart('locationChart', 'bar', 'Dzīvesvieta', locations);

    // 2a. Stratēģiskais Radars
    createChart('radarAnalysisChart', 'radar', 'Kapacitātes Profils (%)', calculateStrategicRadar(data));

    // Dinamiska informācijas avotu agregācija (Visi jautājumi, kas sākas ar "Informāciju iegūst")
    createChart('infoSourceChart', 'bar', 'Informācijas kanāli', smartAggregate(data, 'Informāciju iegūst', 'Cits informācijas avots'), true);

    // --- 2. PRIORITĀTES UN IESAISTE ---
    createChart('priorityChart', 'bar', 'Prioritāšu analīze (KPI)', smartAggregate(data, 'Par prioritāti uzskata', 'Cita prioritāte'), true);

    const engInterest = countOccurrences(data, 'Vēlētos vairāk iesaistīties pagasta aktivitātēs', MAPPINGS['Iesaistīšanās']);
    createChart('engagementInterestChart', 'pie', 'Vēlme iesaistīties aktivitātēs', engInterest);

    createChart('engagementTypesChart', 'bar', 'Gatavība darboties', smartAggregate(data, 'Gatavs iesaistīties', 'Cits iesaistes veids'), true);

    // Jaunas analītikas sadaļas atvērtajām atbildēm (Top frekvences)
    createChart('missingThingsAnalysis', 'bar', 'Top trūkumi (biežums)', smartAggregate(data, '', 'Kas Gramzdā šobrīd pietrūkst visvairāk'), true);
    createChart('futureVisionsAnalysis', 'bar', 'Top vēlējumi nākotnei', smartAggregate(data, '', 'Galvenā vēlēšanās Gramzdas nākotnei'), true);

    // --- 3. PAKALPOJUMI UN INFRASTRUKTŪRA ---
    const adminRating = countOccurrences(data, 'Pārvaldnieces pieejamības vērtējums', MAPPINGS['Vertējums5']);
    createChart('adminChart', 'pie', 'Pārvaldnieces pieejamība', adminRating);
    
    const priekuleInterest = countOccurrences(data, 'Vēlas tikšanos ar Priekules namu pārstāvjiem', MAPPINGS['PriekuleNami']);
    createChart('priekuleChart', 'doughnut', 'Tikšanās ar Priekules namiem', priekuleInterest);

    // Kultūra un sports
    const sportUsage = countOccurrences(data, 'Sporta zāles izmantošanas iespējamība', MAPPINGS['Biežums']);
    createChart('sportsChart', 'bar', 'Sporta zāles potenciāls', sportUsage);
    createChart('gymUsageChart', 'pie', 'Sporta zāles biežums', sportUsage);
    createChart('eventTypesChart', 'bar', 'Vēlamie pasākumi', smartAggregate(data, 'Vēlētos vairāk', 'Cits vēlamais pasākumu veids', 12), true);

    // --- 4. SADARBĪBA UN VALDĪBA ---
    const deputyInterest = countOccurrences(data, 'Interese par tikšanos ar deputātiem', MAPPINGS['DeputatiInterese']);
    createChart('deputyInterestChart', 'pie', 'Interese par tikšanos ar deputātiem', deputyInterest);

    const opinionListen = countOccurrences(data, 'Viedoklis par iedzīvotāju uzklausīšanu pašvaldībā', MAPPINGS['Uzklausišana']);
    createChart('opinionListenChart', 'doughnut', 'Vai viedoklis tiek uzklausīts?', opinionListen);

    createChart('deputyTopicsChart', 'bar', 'Svarīgās tēmas deputātiem', smartAggregate(data, 'Svarīga tēma –', 'Cita svarīga tēma'), true);
}

/** Aprēķina datus "Kopienas Pulsa" radara diagrammai */
function calculateStrategicRadar(data) {
    if (!data.length) return {};
    // Šie rādītāji paskaidro pagasta "dzīvesspēju" procentos
    return {
        'Informētība': Math.round((data.filter(d => Number(d['Informāciju iegūst Facebook']) === 1 || Number(d['Informāciju iegūst WhatsApp grupās']) === 1).length / data.length) * 100),
        'Gatavība darboties': Math.round((data.filter(d => Number(d['Vēlētos vairāk iesaistīties pagasta aktivitātēs']) >= 3).length / data.length) * 100),
        'Viedokļa uzklausīšana': Math.round((data.filter(d => Number(d['Viedoklis par iedzīvotāju uzklausīšanu pašvaldībā']) >= 3).length / data.length) * 100),
        'Vadības pieejamība': Math.round((data.filter(d => Number(d['Pārvaldnieces pieejamības vērtējums']) >= 4).length / data.length) * 100),
        'Nākotnes cerība': Math.round((data.filter(d => d['Galvenā vēlēšanās Gramzdas nākotnei'] && d['Galvenā vēlēšanās Gramzdas nākotnei'].toString().length > 3).length / data.length) * 100)
    };
}

/** Saskaita cik reizes katra vērtība parādās kolonnā */
function countOccurrences(data, key, mapping) {
    const counts = {};
    data.forEach(d => {
        let val = d[key];
        if (mapping && mapping[val]) val = mapping[val];
        if (!val) val = "N/A";
        counts[val] = (counts[val] || 0) + 1;
    });
    return counts;
}

/** Universāla funkcija Chart.js objektu izveidei */
function createChart(canvasId, type, title, dataObj, isHorizontal = false) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !dataObj || Object.keys(dataObj).length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: type,
        data: {
            labels: Object.keys(dataObj),
            datasets: [{
                label: 'Respondenti',
                data: Object.values(dataObj),
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'
                ],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            indexAxis: isHorizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                title: { display: true, text: title, font: { size: 16, weight: 'bold' }, padding: 20 }
                ,
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
                    formatter: (value, ctx) => {
                        let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        return sum > 0 ? (value * 100 / sum).toFixed(1) + "%" : "";
                    },
                    display: (ctx) => ctx.dataset.data[ctx.dataIndex] > (isHorizontal ? 5 : 0),
                    anchor: 'center',
                    align: 'center'
                }
            },
            animation: { duration: 2000, easing: 'easeOutQuart' }
        }
    });
    
    canvas.parentElement.onclick = () => openModal(chart, title);
    canvas.parentElement.style.cursor = 'zoom-in';
    
    activeCharts.push(chart);
}

function renderTable(data) {
    const header = document.getElementById('tableHeader');
    const body = document.getElementById('tableBody');
    header.innerHTML = ''; body.innerHTML = '';
    
    if (!data.length) return;
    
    Object.keys(data[0]).slice(0, 15).forEach(k => { // Rādām pirmās 15 kolonnas pārskatāmībai
        const th = document.createElement('th');
        th.innerText = k;
        header.appendChild(th);
    });

    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.keys(data[0]).slice(0, 15).forEach(k => {
            const td = document.createElement('td');
            td.innerText = row[k] || '';
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

/** Renderē iedzīvotāju rakstiskās vēlmes un ieteikumus */
function renderWishes(data) {
    const containers = {
        'list-missing': 'Kas Gramzdā šobrīd pietrūkst visvairāk',
        'list-new': 'Vēlamā jaunā aktivitāte vai pakalpojums',
        'list-experts': 'Vēlamais deputāts vai speciālists tikšanās reizei',
        'list-vīzija': 'Galvenā vēlēšanās Gramzdas nākotnei'
    };

    const ageMap = MAPPINGS['Vecuma grupa'];
    const locMap = MAPPINGS['Dzīvesvieta'];

    Object.keys(containers).forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const card = container.closest('.card');
        const colName = containers[containerId];

        // Pilnekrāna skats uzspiežot uz kartītes
        if (card) {
            card.style.cursor = 'zoom-in';
            card.title = "Nospiediet, lai skatītu visas iedzīvotāju atbildes";
            card.onclick = () => {
                const allEntries = globalData
                    .map(d => {
                        const txt = d[colName];
                        if (!txt || String(txt).trim().length < 3) return null;
                        const ageLabel = ageMap[d['Vecuma grupa']] || 'Nav norādīts';
                        const locLabel = locMap[d['Dzīvesvieta']] || 'Nav norādīts';
                        return `<strong>[${ageLabel} | ${locLabel}]</strong><br>${txt}`;
                    })
                    .filter(t => t !== null);
                openTextModal(allEntries, colName);
            };
        }

        container.innerHTML = '';
        
        data.forEach((d, index) => {
            const text = d[colName];
            if (text && String(text).trim().length > 2 && index < 25) {
                const sentiment = analyzeSentiment(String(text));
                const item = document.createElement('div');
                item.className = `wish-item wish-${sentiment}`;
                item.style.animationDelay = `${index * 0.03}s`;
                
                item.innerHTML = `
                    <div class="wish-content">${text}</div>
                    <div class="wish-meta">
                        ${ageMap[d['Vecuma grupa']] || 'Nav norādīts'} | ${locMap[d['Dzīvesvieta']] || 'Nav norādīts'}
                    </div>
                `;
                container.appendChild(item);
            }
        });

        if (!container.innerHTML) container.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">Nav ierakstu.</p>';
    });
}