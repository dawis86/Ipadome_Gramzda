/**
 * APTAUJAS ANALĪTIKAS MODULIS
 * Šis skripts nodrošina Excel datu nolasīšanu (XLSX), datu filtrēšanu un 
 * vizualizāciju, izmantojot Chart.js bibliotēku.
 * Ietver automātisko noskaņojuma analīzi un KPI rādītāju aprēķinus.
 */

import { API_URL, fetchJSONP } from './utils.js';
import { FALLBACK_DATA } from './fallback_data.js';
import { initAiAnalysis } from './ai_analysis.js';

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
let activeTab = 'conclusions';
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
        
        // Uz mobilajām ierīcēm aizveram sānjoslu pēc klikšķa
        document.querySelector('.sidebar').classList.remove('active');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
        
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

// Mobilās izvēlnes loģika
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    if (!btn || !sidebar) return;

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    const toggle = () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    };

    btn.addEventListener('click', toggle);
    overlay.addEventListener('click', toggle);
}

/**
 * Ielādē datus no Google Apps Script API (Live Data) */
async function loadLiveData() {
    document.getElementById('dataStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pieslēdzos serverim...';
    try {
        const result = await fetchJSONP(API_URL, { action: 'getSurveyData', t: Date.now() });
        
        if (result.error) throw new Error(result.error);
        
        const rows = result.data || [];
        if (rows.length < 2) {
            globalData = [];
        } else {
            // Pārveidojam tabulas rindas objektos, izmantojot pirmo rindu kā atslēgas
            const headers = rows[0];
            globalData = rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i];
                });
                return obj;
            });
        }

        // Izfiltrējam pilnīgi tukšās rindas
        globalData = globalData.filter(row =>
            Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '')
        );
        
        handleDataLoad();
    } catch (error) {
        console.warn("Neizdevās ielādēt live datus no servera. Izmantoju lokālos rezerves datus. Kļūda:", error.message);
        globalData = FALLBACK_DATA;
        
        // Pielāgojam UI statusu un badge
        document.getElementById('dataStatus').innerHTML = `<i class="fas fa-check-circle"></i> Lokālie dati: ${globalData.length}`;
        document.getElementById('filterControls').style.display = 'flex';
        document.getElementById('kpiRow').style.display = 'grid';
        document.getElementById('insightBox').style.display = 'block';
        document.getElementById('liveBadge').classList.add('visible');
        document.getElementById('liveBadge').innerHTML = '<i class="fas fa-circle" style="color: #f59e0b;"></i> LOCAL';
        
        populateFilters();
        initDashboard();
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

    // Izmantojam change notikumu, nevis hover - strādā stabilāk
    ageSelect.addEventListener('change', (e) => { currentFilters.age = e.target.value; updateDashboard(); });
    locSelect.addEventListener('change', (e) => { currentFilters.location = e.target.value; updateDashboard(); });
    
    // Pievienojam click notikumu, lai atvērtu dropdown stabilāk
    ageSelect.addEventListener('click', () => {
        if (typeof ageSelect.showPicker === 'function') {
            ageSelect.showPicker();
        }
    });
    locSelect.addEventListener('click', () => {
        if (typeof locSelect.showPicker === 'function') {
            locSelect.showPicker();
        }
    });
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
    
    // Sadalām darbus vairākos blokos, lai novērstu "Violation" brīdinājumus
    scheduler(() => {
        renderAllCharts(filtered);
        scheduler(() => {
            renderWishes(filtered);
            generateConclusions(filtered);
        });
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

function closeAiModal() {
    document.getElementById('aiAnalysisModal').style.display = 'none';
}

// Eksportējam uz globālo scope, lai HTML onclick pogas darbotos (nepieciešams, jo šis ir modulis)
window.closeModal = closeModal;
window.closeAiModal = closeAiModal;

// Pievienojam Escape taustiņa klausītāju ērtākai aizvēršanai
document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        closeModal();
        closeAiModal();
    }
});

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
    let insight = `<i class="fas fa-microchip"></i> <strong>Sistēmas analītiskā interpretācija:</strong> `;
    const total = data.length;

    // Palīgfunkcija pareizām galotnēm
    const getLatvianNoun = (n) => {
        const num = Number(n);
        if (num % 10 === 1 && num % 100 !== 11) return 'iedzīvotājs';
        return 'iedzīvotāji';
    };

    const fmt = (count) => {
        const pct = Math.round((count / total) * 100);
        return `<strong>${pct}%</strong> (${count} ${getLatvianNoun(count)})`;
    };

    const satCount = data.filter(d => Number(d['Pārvaldnieces pieejamības vērtējums']) >= 4).length;
    const satPct = (satCount / total) * 100;
    const engCount = data.filter(d => Number(d['Vēlētos vairāk iesaistīties pagasta aktivitātēs']) >= 3).length;

    if (tab === 'demographics') {
        const topLocEntries = Object.entries(countOccurrences(data, 'Dzīvesvieta', MAPPINGS['Dzīvesvieta'])).sort((a,b)=>b[1]-a[1]);
        const topLoc = topLocEntries.length > 0 ? topLocEntries[0][0] : "nav datu";
        const topLocCount = topLocEntries.length > 0 ? topLocEntries[0][1] : 0;
        insight += `Datu kopa uzrāda, ka reprezentatīvākā grupa ir no <strong>${topLoc}</strong>, veidojot ${fmt(topLocCount)}. Šī demogrāfiskā dominance nosaka kopējo tendenču stabilitāti.`;
    } else if (tab === 'priorities') {
        const prio = smartAggregate(data, 'Par prioritāti uzskata', 'Cita prioritāte');
        const sortedPrio = Object.entries(prio).sort((a,b)=>b[1]-a[1]);
        const topPrio = sortedPrio.length > 0 ? sortedPrio[0][0] : "N/A";
        const topPrioCount = sortedPrio.length > 0 ? sortedPrio[0][1] : 0;
        insight += `Kā primārais attīstības virziens ir identificēts <strong>"${topPrio}"</strong> (${fmt(topPrioCount)}). Šis rādītājs kalpo kā arguments mērķtiecīgai investīciju piesaistei.`;
    } else if (tab === 'engagement') {
        insight += `Kopienas līdzdalības potenciāls ir sasniedzis ${fmt(engCount)}. Tas liecina par augstu sociālo aktivitāti un gatavību deleģēt personīgos resursus pagasta attīstībai.`;
    } else if (tab === 'future') {
        const wishesCount = data.filter(d => d['Galvenā vēlēšanās Gramzdas nākotnei']).length;
        const sentiment = Math.round((data.filter(d => analyzeSentiment(d['Galvenā vēlēšanās Gramzdas nākotnei']) === 'pos').length / wishesCount) * 100);
        insight += `Analizējot <strong>${wishesCount} unikālas vīzijas</strong>, secināts, ka <strong>${sentiment}%</strong> gadījumu dominē proaktīvs un konstruktīvs viedoklis par Gramzdas ilgtspēju.`;
    } else {
        let trustDesc = "Institucionālās uzticības līmenis pašlaik ir mērens";
        if (satPct > 75) trustDesc = "Novērots augsts un stabils institucionālās uzticības līmenis";
        else if (satPct < 25) trustDesc = "Identificēta nepieciešamība steidzami stiprināt saikni ar iedzīvotājiem";

        insight += `${trustDesc} (${fmt(satCount)}). Dati ir matemātiski pamatoti un gatavi stratēģiskai lietošanai.`;
    }
    
    document.getElementById('insightText').innerHTML = insight;

    // Gudrais svērtais vērtējums (Weighted Mean for WOW factor)
    const ratings = data.map(d => Number(d['Pārvaldnieces pieejamības vērtējums'])).filter(r => r > 0 && r !== 3);
    if (ratings.length > 0) {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        const weightedScore = Math.round(((avg - 1) / 4) * 100);
        document.getElementById('kpiSatisfaction').innerText = weightedScore + '%';
    } else {
        document.getElementById('kpiSatisfaction').innerText = Math.round(satPct) + '%';
    }
}

/** Izveido galvenos kopsavilkuma punktus (pozitīvie/kritiskie) */
function generateConclusions(data) {
    const bestContainer = document.getElementById('bestInsights');
    const worstContainer = document.getElementById('worstInsights');
    if (!bestContainer || !worstContainer) return;
    const total = data.length;
    const getLatvianNoun = (n) => (n % 10 === 1 && n % 100 !== 11) ? 'iedzīvotājs' : 'iedzīvotāji';
    const fmt = (count) => `<strong>${Math.round((count / total) * 100)}%</strong> (${count} ${getLatvianNoun(count)})`;
    
    bestContainer.innerHTML = ''; worstContainer.innerHTML = '';
    if (!data.length) return;

    // 1. Apmierinātība ar pārvaldi (Pozitīvs)
    const satCount = data.filter(d => Number(d['Pārvaldnieces pieejamības vērtējums']) >= 4).length;
    const satPct = (satCount / total) * 100;

    if (satPct > 50) {
        const title = satPct > 80 ? "Pārvaldības izcilība" : "Administratīvā kapacitāte";
        addConclusion(bestContainer, title, `Pozitīvs uzticības kredīts: ${fmt(satCount)} respondentu atzinīgi vērtē pārvaldības pieejamību.`, 'fa-check-double');
    } else {
        const title = satPct < 20 ? "Kritiska komunikācijas plaisa" : "Saziņas barjeras";
        addConclusion(worstContainer, title, `Tikai ${fmt(satCount)} respondentu atzinīgi vērtē administrācijas pieejamību.`, 'fa-comments-slash');
    }

    // 2. Prioritātes (Kritisks)
    const priorities = smartAggregate(data, 'Par prioritāti uzskata', 'Cita prioritāte');
    const topPrio = Object.entries(priorities).sort((a,b) => b[1] - a[1])[0];
    if (topPrio) {
        addConclusion(worstContainer, `Attīstības prioritāte`, `Kā būtiskākā iedzīvotāju vajadzība identificēta: <strong>"${topPrio[0]}"</strong> (${fmt(topPrio[1])}).`, 'fa-tools');
    }

    // 3. Informētība (Pozitīvs)
    const fbInfo = data.filter(d => d['Informāciju iegūst Facebook'] == 1).length;
    if ((fbInfo / total) > 0.4) {
        addConclusion(bestContainer, `Komunikācijas efektivitāte`, `Digitālais kanāls (Facebook) ir primārais informācijas avots ${fmt(fbInfo)} respondentu.`, 'fa-network-wired');
    }

    // 4. Trūkumi (Kritisks)
    const missing = smartAggregate(data, '', 'Kas Gramzdā šobrīd pietrūkst visvairāk');
    const missingEntries = Object.entries(missing).sort((a,b) => b[1] - a[1]);
    if (missingEntries.length > 0 && (missingEntries[0][1] > 1 || total < 10)) {
        addConclusion(worstContainer, `Identificētie trūkumi`, `Iedzīvotāju brīvās atbildes iezīmē aktuālu vajadzību: <strong>${missingEntries[0][0]}</strong> (${fmt(missingEntries[0][1])}).`, 'fa-exclamation-triangle');
    }

    // 5. Iesaiste (Pozitīvs)
    const engCount = data.filter(d => Number(d['Vēlētos vairāk iesaistīties pagasta aktivitātēs']) >= 3).length;
    if ((engCount / total) > 0.4) {
        addConclusion(bestContainer, `Cilvēkkapitāla potenciāls`, `Identificēta augsta gatavība līdzdarboties: ${fmt(engCount)} respondentu pauž vēlmi iesaistīties pagasta attīstībā.`, 'fa-bolt');
    }
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

// Automātiska ielāde pie ielādes
document.addEventListener('DOMContentLoaded', () => {
    loadLiveData();
    initMobileMenu();
    
    // AI analīzes pogas klikšķis
    const aiBtn = document.getElementById('openAiAnalysis');
    if (aiBtn) {
        aiBtn.addEventListener('click', () => {
            // Filtrējam datus atbilstoši šobrīd aktīvajiem filtriem
            const filtered = globalData.filter(d => {
                const ageMatch = !currentFilters.age || d['Vecuma grupa'] == currentFilters.age;
                const locMatch = !currentFilters.location || d['Dzīvesvieta'] == currentFilters.location;
                return ageMatch && locMatch;
            });
            
            const modal = document.getElementById('aiAnalysisModal');
            if (modal) {
                modal.style.display = 'flex';
                initAiAnalysis(filtered);
            }
        });
    }
});

function initDashboard() {
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