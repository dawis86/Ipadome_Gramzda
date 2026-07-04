/**
 * APTAUJAS REZULTĀTU ANALĪZES MODULIS
 * Šis modulis nodrošina padziļinātu iedzīvotāju aptaujas datu apstrādi,
 * korelāciju noteikšanu un brīvo teksta atbilžu tēmu grupēšanu.
 */

// Vecuma grupu un dzīvesvietu teksta definīcijas ērtākai izvadīšanai
const AGE_LABELS = {
    1: 'Līdz 18',
    2: '19-30',
    3: '31-45',
    4: '46-62',
    5: '63+'
};

const LOCATION_LABELS = {
    1: 'Gramzda',
    2: 'Gramzdas pagasts',
    3: 'Citviet, bet saistīts ar Gramzdu'
};

/**
 * Inicializē un atver analīzes logu, renderējot cilnes atbilstoši atlasītajiem datiem.
 * @param {Array} data - Atlasītā (filtrētā) respondentu datu kopa
 */
export function initAiAnalysis(data) {
    if (!data || data.length === 0) {
        alert("Nav datu, ko analizēt!");
        return;
    }

    // Sagatavojam cilņu pārslēgšanu
    const tabs = document.querySelectorAll('.ai-tab-btn');
    tabs.forEach(tab => {
        tab.onclick = (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ai-tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetId = tab.dataset.aiTab;
            document.getElementById(targetId).classList.add('active');
        };
    });

    // Veicam analīzi katrai sadaļai
    renderSummary(data);
    renderCorrelations(data);
    renderSemanticAnalysis(data);
    renderRecommendations(data);
}

/**
 * Palīgfunkcija pareizām latviešu valodas galotnēm
 */
function getLatvianNoun(n) {
    const num = Number(n);
    if (num % 10 === 1 && num % 100 !== 11) return 'respondents';
    return 'respondenti';
}

/**
 * 1. KOPSAVILKUMA CILNE
 */
function renderSummary(data) {
    const container = document.getElementById('ai-summary');
    const total = data.length;

    // A. Aprēķinām KPI rādītājus
    // 1. Pārvaldes uzticamība (Pārvaldnieces pieejamība >= 4 no 5)
    // Izslēdzam vērtējumu 3 (nav nepieciešamība sazināties), lai iegūtu reālo apmierinātību
    const validRatings = data.map(d => Number(d['Pārvaldnieces pieejamības vērtējums'])).filter(r => r > 0 && r !== 3);
    const avgRating = validRatings.length > 0 ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length) : 0;
    const satisfactionIndex = avgRating > 0 ? Math.round(((avgRating - 1) / 4) * 100) : 0;

    // 2. Saliedētība / Gatavība līdzdarboties
    // Respondenti, kuri ir gatavi iesaistīties (vismaz viens gatavības rādītājs = 1) un nav norādījuši, ka nevēlas
    const readyToEngage = data.filter(d => {
        const wantsMore = Number(d['Vēlētos vairāk iesaistīties pagasta aktivitātēs']) >= 3;
        const volunteer = d['Gatavs iesaistīties brīvprātīgajā darbā'] === 1;
        const organize = d['Gatavs iesaistīties pasākumu organizēšanā'] === 1;
        const cleanup = d['Gatavs iesaistīties apkārtnes sakopšanā'] === 1;
        const youth = d['Gatavs iesaistīties jauniešu aktivitātēs'] === 1;
        const seniors = d['Gatavs iesaistīties senioru aktivitātēs'] === 1;
        const ideas = d['Gatavs sniegt idejas'] === 1;
        const doesntWant = d['Nevēlas iesaistīties aktivitātēs'] === 1;
        const hasEngagement = wantsMore || volunteer || organize || cleanup || youth || seniors || ideas;
        return hasEngagement && !doesntWant;
    }).length;
    const engagementPct = Math.round((readyToEngage / total) * 100);

    // 3. Infrastruktūras prioritāte
    const roadPrio = data.filter(d => d['Par prioritāti uzskata ceļu un infrastruktūras uzlabošanu'] === 1).length;
    const roadPrioPct = Math.round((roadPrio / total) * 100);

    // 4. Tikšanās pieprasījums ar pārstāvjiem (Priekules nami jeb vēlas tikties >= 4)
    const priekuleMeet = data.filter(d => Number(d['Vēlas tikšanos ar Priekules namu pārstāvjiem']) >= 4).length;
    const priekuleMeetPct = Math.round((priekuleMeet / total) * 100);

    // 5. Nākotnes vēlēšanās noskaņojums (pozitīvs/neitāls/negatīvs)
    const futureWishes = data.filter(d => d['Galvenā vēlēšanās Gramzdas nākotnei'] && d['Galvenā vēlēšanās Gramzdas nākotnei'].length > 3);
    const positiveWishes = futureWishes.filter(d => {
        const text = String(d['Galvenā vēlēšanās Gramzdas nākotnei']).toLowerCase();
        const positiveWords = ['lab', 'priek', 'attīst', 'dzīv', 'ros', 'cieņ', 'sakop', 'turpin', 'veiksm'];
        return positiveWords.some(word => text.includes(word));
    }).length;
    const sentimentPct = futureWishes.length > 0 ? Math.round((positiveWishes / futureWishes.length) * 100) : 0;

    // 6. Informācijas kanālu efektivitāte (vai vismaz viens digitālais kanāls)
    const digitalUsers = data.filter(d => d['Informāciju iegūst Facebook'] == 1 || d['Informāciju iegūst WhatsApp grupās'] == 1).length;
    const digitalPct = Math.round((digitalUsers / total) * 100);

    // B. Analītiskā interpretācija (teksta ģenerēšana)
    let summaryText = `<p>Analizējot <strong>${total} ${getLatvianNoun(total)}</strong> iesniegtās anketas, analīze rāda vairākas nozīmīgas tendences pagastā.</p>`;

    if (roadPrioPct > 50) {
        summaryText += `<p>⚠️ <strong style="color:#ef4444;">Kritiskā prioritāte:</strong> <strong>Ceļu un infrastruktūras sakārtošana</strong> ir neapstrīdams līderis iedzīvotāju vajadzībās, ko par prioritāti izvirza <strong>${roadPrioPct}%</strong> no visiem respondentiem. Šis rādītājs prasa tūlītēju uzmanību un budžeta līdzekļu pārdali ceļu greiderēšanai un uzturēšanai.</p>`;
    } else {
        summaryText += `<p>ℹ️ <strong style="color:var(--primary);">Attīstības prioritāte:</strong> Ceļu jautājums joprojām ir svarīgs (atzīmē ${roadPrioPct}% respondentu), taču tas nav vienīgais dominējošais faktors.</p>`;
    }

    if (satisfactionIndex > 70) {
        summaryText += `<p>✅ <strong style="color:#10b981;">Administratīvais novērtējums:</strong> Pagasta pārvaldnieces darba pieejamības indekss ir <strong>${satisfactionIndex}%</strong>. Tas liecina par augstu iedzīvotāju uzticību vietējai pārvaldei, kas kalpo kā labs resurss tālāku projektu realizācijai.</p>`;
    } else if (satisfactionIndex < 40) {
        summaryText += `<p>❌ <strong style="color:#ef4444;">Administratīvais novērtējums:</strong> Pārvaldnieces pieejamības vērtējums ir zems (apmierinātības indekss <strong>${satisfactionIndex}%</strong>). Tas norāda uz nepieciešamību uzlabot komunikācijas kanālus un pieejamību iedzīvotājiem.</p>`;
    } else {
        summaryText += `<p>⚡ <strong style="color:#f59e0b;">Administratīvais novērtējums:</strong> Apmierinātība ar pārvaldnieces pieejamību ir mērena (indekss: <strong>${satisfactionIndex}%</strong>), kas liecina par telpu komunikācijas uzlabojumiem.</p>`;
    }

    if (engagementPct > 50) {
        summaryText += `<p>🤝 <strong style="color:var(--primary);">Kopienas potenciāls:</strong> <strong>${engagementPct}%</strong> iedzīvotāju pauž reālu gatavību iesaistīties pagasta aktivitātēs, brīvprātīgajā darbā vai apkārtnes sakopšanā. Šis ir ārkārtīgi augsts kopienas līdzdalības rādītājs, kas liecina, ka iedzīvotāji vēlas ne tikai sūdzēties, bet arī paši aktīvi darboties, ja viņiem tiks sniegta iespēja.</p>`;
    }

    if (priekuleMeetPct > 35) {
        summaryText += `<p>🏠 <strong style="color:#f59e0b;">Nekustamā īpašuma pārvaldība:</strong> Ievērojama daļa respondentu (<strong>${priekuleMeetPct}%</strong>) pieprasa klātienes tikšanos ar SIA "Priekules nami" pārstāvjiem. Ņemot vērā brīvajās atbildēs minētos komentārus par daudzdzīvokļu māju briesmīgajām fasādēm un nesakārtotajām kāpņu telpām, šīs tikšanās organizēšana ir steidzama.</p>`;
    }

    if (sentimentPct > 60) {
        summaryText += `<p>🌟 <strong style="color:#10b981;">Nākotnes cerība:</strong> <strong>${sentimentPct}%</strong> no nākotnes vēlēšanām ir pozitīvas, kas liecina par optimistisku skatu uz pagasta attīstību.</p>`;
    }

    if (digitalPct < 50) {
        summaryText += `<p>📱 <strong style="color:#f59e0b;">Informācijas plaisa:</strong> Tikai <strong>${digitalPct}%</strong> iedzīvotāju izmanto digitālos kanālus (Facebook/WhatsApp), kas norāda uz nepieciešamību paplašināt informācijas pieejamību.</p>`;
    }

    container.innerHTML = `
        <div class="ai-kpi-grid">
            <div class="ai-kpi-card">
                <div class="kpi-title">Pārvaldes uzticība</div>
                <div class="kpi-value">${satisfactionIndex}%</div>
                <div class="kpi-desc">Cik cilvēki ir apmierināti ar pārvaldnieces pieejamību</div>
                <div class="ai-progress-bg"><div class="ai-progress-bar" style="width: ${satisfactionIndex}%"></div></div>
            </div>

            <div class="ai-kpi-card">
                <div class="kpi-title">Līdzdalības gatavība</div>
                <div class="kpi-value">${engagementPct}%</div>
                <div class="kpi-desc">Cilvēki, kuri vēlas iesaistīties brīvprātīgajos darbos</div>
                <div class="ai-progress-bg"><div class="ai-progress-bar" style="width: ${engagementPct}%"></div></div>
            </div>

            <div class="ai-kpi-card">
                <div class="kpi-title">Infrastruktūras spiediens</div>
                <div class="kpi-value">${roadPrioPct}%</div>
                <div class="kpi-desc">Respondenti, kam svarīgākie ir ceļi un infrastruktūra</div>
                <div class="ai-progress-bg"><div class="ai-progress-bar" style="width: ${roadPrioPct}%"></div></div>
            </div>

            <div class="ai-kpi-card">
                <div class="kpi-title">Māju apsaimniekošana</div>
                <div class="kpi-value">${priekuleMeetPct}%</div>
                <div class="kpi-desc">Pieprasa tikšanos ar māju apsaimniekotājiem</div>
                <div class="ai-progress-bg"><div class="ai-progress-bar" style="width: ${priekuleMeetPct}%"></div></div>
            </div>

            <div class="ai-kpi-card">
                <div class="kpi-title">Nākotnes cerība</div>
                <div class="kpi-value">${sentimentPct}%</div>
                <div class="kpi-desc">Pozitīvas nākotnes vēlēšanās par pagasta attīstību</div>
                <div class="ai-progress-bg"><div class="ai-progress-bar" style="width: ${sentimentPct}%"></div></div>
            </div>

            <div class="ai-kpi-card">
                <div class="kpi-title">Digitālie kanāli</div>
                <div class="kpi-value">${digitalPct}%</div>
                <div class="kpi-desc">Izmanto Facebook vai WhatsApp informācijai</div>
                <div class="ai-progress-bg"><div class="ai-progress-bar" style="width: ${digitalPct}%"></div></div>
            </div>
        </div>
        
        <div class="ai-card">
            <h3><i class="fas fa-chart-pie"></i> Galvenie secinājumi</h3>
            <div class="ai-narrative">${summaryText}</div>
        </div>
    `;

    // Trigger progressive animation for progress bars
    setTimeout(() => {
        container.querySelectorAll('.ai-progress-bar').forEach(bar => {
            bar.style.width = bar.parentElement.nextElementSibling ? bar.parentElement.previousElementSibling.innerText : bar.style.width;
        });
    }, 100);
}

/**
 * 2. KORELĀCIJU UN TENDENČU CILNE
 */
function renderCorrelations(data) {
    const container = document.getElementById('ai-correlations');
    const total = data.length;

    // A. Krustojums: Vecuma grupa vs Prioritātes
    // Sadalām respondentus "Jaunieši/Vidējā paaudze" (Līdz 45 gadiem, grupas 1,2,3) un "Vecākā paaudze" (46+ gadi, grupas 4,5)
    const groupYoung = data.filter(d => Number(d['Vecuma grupa']) <= 3);
    const groupOld = data.filter(d => Number(d['Vecuma grupa']) >= 4);

    const getPrioPct = (subData, prioCol) => {
        if (subData.length === 0) return 0;
        const count = subData.filter(d => d[prioCol] === 1).length;
        return Math.round((count / subData.length) * 100);
    };

    // Aprēķinām specifiskos prioritāšu procentus abās grupās
    const youngRoads = getPrioPct(groupYoung, 'Par prioritāti uzskata ceļu un infrastruktūras uzlabošanu');
    const oldRoads = getPrioPct(groupOld, 'Par prioritāti uzskata ceļu un infrastruktūras uzlabošanu');

    const youngKids = getPrioPct(groupYoung, 'Par prioritāti uzskata bērnu un jauniešu aktivitātes');
    const oldKids = getPrioPct(groupOld, 'Par prioritāti uzskata bērnu un jauniešu aktivitātes');

    const youngSenior = getPrioPct(groupYoung, 'Par prioritāti uzskata atbalstu senioriem');
    const oldSenior = getPrioPct(groupOld, 'Par prioritāti uzskata atbalstu senioriem');

    // B. Krustojums: Vecums vs Informācijas kanāli
    const getInfoPct = (subData, infoCol) => {
        if (subData.length === 0) return 0;
        const count = subData.filter(d => d[infoCol] === 1).length;
        return Math.round((count / subData.length) * 100);
    };

    const youngFb = getInfoPct(groupYoung, 'Informāciju iegūst Facebook');
    const oldFb = getInfoPct(groupOld, 'Informāciju iegūst Facebook');

    const youngWa = getInfoPct(groupYoung, 'Informāciju iegūst WhatsApp grupās');
    const oldWa = getInfoPct(groupOld, 'Informāciju iegūst WhatsApp grupās');

    const youngNeighbors = getInfoPct(groupYoung, 'Informāciju iegūst no kaimiņiem vai paziņām');
    const oldNeighbors = getInfoPct(groupOld, 'Informāciju iegūst no kaimiņiem vai paziņām');

    // C. Krustojums: Dzīvesvieta vs Prioritātes
    const groupCenter = data.filter(d => Number(d['Dzīvesvieta']) === 1);
    const groupRural = data.filter(d => Number(d['Dzīvesvieta']) === 2);
    const groupAway = data.filter(d => Number(d['Dzīvesvieta']) === 3);

    const centerRoads = getPrioPct(groupCenter, 'Par prioritāti uzskata ceļu un infrastruktūras uzlabošanu');
    const ruralRoads = getPrioPct(groupRural, 'Par prioritāti uzskata ceļu un infrastruktūras uzlabošanu');
    const awayRoads = getPrioPct(groupAway, 'Par prioritāti uzskata ceļu un infrastruktūras uzlabošanu');

    const centerTransport = getPrioPct(groupCenter, 'Par prioritāti uzskata sabiedriskā transporta jautājumus');
    const ruralTransport = getPrioPct(groupRural, 'Par prioritāti uzskata sabiedriskā transporta jautājumus');

    container.innerHTML = `
        <div class="ai-card">
            <h3><i class="fas fa-chart-line"></i> Kā dažādas grupas domā un vēlas</h3>
            <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:20px;">Šī analīze palīdz saprast, kā atšķiras viedokļi starp dažādām iedzīvotāju grupām, lai labāk pielāgotu lēmumus katram.</p>
            
            <div class="correlation-grid">
                <!-- Korelācija 1: Vecums un prioritātes -->
                <div class="correlation-card">
                    <h4><i class="fas fa-users-cog"></i> Vecums & Prioritātes</h4>
                    <div class="correlation-stats-container">
                        <div class="correlation-stat" style="border-left: 3px solid ${youngRoads > oldRoads ? '#10b981' : '#ef4444'}">
                            Ceļi kā prioritāte (Paudze &le; 45 gadi): <span>${youngRoads}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${oldRoads > youngRoads ? '#10b981' : '#ef4444'}">
                            Ceļi kā prioritāte (Paudze &ge; 46 gadi): <span>${oldRoads}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${youngKids > oldKids ? '#10b981' : '#ef4444'}">
                            Bērnu / jauniešu aktivitātes (&le; 45 gadi): <span>${youngKids}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${oldKids > youngKids ? '#10b981' : '#ef4444'}">
                            Bērnu / jauniešu aktivitātes (&ge; 46 gadi): <span>${oldKids}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${youngSenior > oldSenior ? '#10b981' : '#ef4444'}">
                            Atbalsts senioriem (&le; 45 gadi): <span>${youngSenior}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${oldSenior > youngSenior ? '#10b981' : '#ef4444'}">
                            Atbalsts senioriem (&ge; 46 gadi): <span>${oldSenior}%</span>
                        </div>
                    </div>
                    <div class="correlation-commentary">
                        <strong>Kas nozīmē:</strong> Jaunieši un vidējā paaudze ievērojami biežāk pieprasa bērnu/jauniešu aktivitātes (atšķirība: <strong>${Math.abs(youngKids - oldKids)}%</strong>), bet seniori vairāk domā par sociālo atbalstu. Tomēr ceļi ir svarīgi visiem vecumiem.
                    </div>
                </div>

                <!-- Korelācija 2: Vecums un informācijas avoti -->
                <div class="correlation-card">
                    <h4><i class="fas fa-bullhorn"></i> Informācijas plūsma & Vecums</h4>
                    <div class="correlation-stats-container">
                        <div class="correlation-stat" style="border-left: 3px solid ${youngFb > oldFb ? '#10b981' : '#ef4444'}">
                            Facebook izmantošana (Paudze &le; 45 gadi): <span>${youngFb}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${oldFb > youngFb ? '#10b981' : '#ef4444'}">
                            Facebook izmantošana (Paudze &ge; 46 gadi): <span>${oldFb}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${youngWa > oldWa ? '#10b981' : '#ef4444'}">
                            WhatsApp grupas (&le; 45 gadi): <span>${youngWa}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${oldWa > youngWa ? '#10b981' : '#ef4444'}">
                            WhatsApp grupas (&ge; 46 gadi): <span>${oldWa}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${youngNeighbors > oldNeighbors ? '#10b981' : '#ef4444'}">
                            Kaimiņi & paziņas (&le; 45 gadi): <span>${youngNeighbors}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${oldNeighbors > youngNeighbors ? '#10b981' : '#ef4444'}">
                            Kaimiņi & paziņas (&ge; 46 gadi): <span>${oldNeighbors}%</span>
                        </div>
                    </div>
                    <div class="correlation-commentary">
                        <strong>Kas nozīmē:</strong> Jaunieši galvenokārt izmanto Facebook (<strong>${youngFb}%</strong>), bet vecākā paaudze vairāk uzzina no kaimiņiem un WhatsApp grupām. Lai informācija nonāktu pie visiem, jālieto vairāki kanāli.
                    </div>
                </div>

                <!-- Korelācija 3: Dzīvesvieta un prioritātes -->
                <div class="correlation-card">
                    <h4><i class="fas fa-map-marked-alt"></i> Dzīvesvieta & Vajadzības</h4>
                    <div class="correlation-stats-container">
                        <div class="correlation-stat" style="border-left: 3px solid ${centerRoads > ruralRoads ? '#10b981' : '#ef4444'}">
                            Ceļu prioritāte (Gramzdas centrs): <span>${centerRoads}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${ruralRoads > centerRoads ? '#10b981' : '#ef4444'}">
                            Ceļu prioritāte (Gramzdas pagasts / lauki): <span>${ruralRoads}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${awayRoads > Math.max(centerRoads, ruralRoads) ? '#10b981' : '#ef4444'}">
                            Ceļu prioritāte (Saistītie / Citur dzīvojošie): <span>${awayRoads}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${centerTransport > ruralTransport ? '#10b981' : '#ef4444'}">
                            Sabiedriskais transports (Centrs): <span>${centerTransport}%</span>
                        </div>
                        <div class="correlation-stat" style="border-left: 3px solid ${ruralTransport > centerTransport ? '#10b981' : '#ef4444'}">
                            Sabiedriskais transports (Pagasts / lauki): <span>${ruralTransport}%</span>
                        </div>
                    </div>
                    <div class="correlation-commentary">
                        <strong>Kas nozīmē:</strong> Ārpus centra dzīvojošiem (Gramzdas pagastā) ceļi ir vēl svarīgāki (<strong>${ruralRoads}%</strong>) un viņi vairāk vēlas sabiedrisko transportu. Tas ir saprotami, jo viņiem jābrauc uz darbu un jāved bērni uz skolu.
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 3. SEMANTISKĀS TEKSTA ANALĪZES CILNE
 */
function renderSemanticAnalysis(data) {
    const container = document.getElementById('ai-semantic');
    const total = data.length;

    // A. Definējam semantiskās tēmas un meklēšanas atslēgvārdus latviešu valodā
    const THEMES = [
        {
            id: 'roads',
            name: 'Ceļi & Infrastruktūra',
            stems: ['ceļ', 'bedr', 'grēd', 'tīr', 'asfalt', 'iel', 'ceļš', 'grants', 'lukt', 'apgaism', 'grāv', 'ziema', 'ziemas', 'snieg', 'zāle', 'pļau'],
            keywords: 'ceļi, bedres, greiderēšana, sniega tīrīšana, ielu apgaismojums, zāles pļaušana',
            count: 0,
            quotes: []
        },
        {
            id: 'kids',
            name: 'Bērni, Jaunieši & Skola',
            stems: ['bērn', 'jaun', 'skol', 'rotaļ', 'smilš', 'zāl', 'spēl', 'laukum', 'jaunieš', 'jauniet'],
            keywords: 'aizslēgtā skola, bērnu rotaļu laukums, sporta zāles pieejamība jauniešiem',
            count: 0,
            quotes: []
        },
        {
            id: 'housing',
            name: 'Dzīvojamais fonds & Ēkas',
            stems: ['dzīvok', 'māj', 'remont', 'fasād', 'dzīvot', 'renov', 'apkur', 'briesmīg', 'nabagmāj', 'logs', 'logi', 'dzīv', 'apdzīv', 'iekārt', 'kāpņ'],
            keywords: 'daudzdzīvokļu māju fasādes, logi, apkure, dzīvokļu kvalitāte, kāpņu telpas',
            count: 0,
            quotes: []
        },
        {
            id: 'culture',
            name: 'Pasākumi & Izklaide',
            stems: ['pasāk', 'koncert', 'ball', 'svētk', 'kultūr', 'izklai', 'ģimen', 'sporta spēl', 'mūziķ'],
            keywords: 'zaļumballes, pagasta svētki, koncerti, ģimenes sporta spēles',
            count: 0,
            quotes: []
        },
        {
            id: 'governance',
            name: 'Pārvalde, Vadība & Komunikācija',
            stems: ['pārvald', 'saimniek', 'deputāt', 'vadīt', 'komunik', 'uzklaus', 'lēmum', 'reklām', 'info', 'dzirdēt'],
            keywords: 'kārtīgs pagasta pārvaldnieks, uzklausīšana, deputātu tikšanās',
            count: 0,
            quotes: []
        },
        {
            id: 'community',
            name: 'Saliedētība & Iedzīvotāju trūkums',
            stems: ['cilvēk', 'iedzīv', 'salied', 'vienot', 'cieņ', 'dzīvīb', 'dzērāj', 'klātbūt', 'kopīg', 'atsauc', 'ros'],
            keywords: 'iedzīvotāju trūkums, cieņa vienam pret otru, saliedētība, rosība, kopīgums',
            count: 0,
            quotes: []
        },
        {
            id: 'environment',
            name: 'Vide & Daba',
            stems: ['zaļ', 'kok', 'park', 'gāj', 'jūdz', 'dab', 'ekolo', 'tīr', 'atkrit', 'apsaimn', 'mež', 'tak'],
            keywords: 'zaļās zonas, parki, gājēju celiņi, atkritumu apsaimniekošana, meža takas',
            count: 0,
            quotes: []
        },
        {
            id: 'safety',
            name: 'Drošība',
            stems: ['droš', 'briesm', 'nogalin', 'zagl', 'poli', 'uzraudz', 'kontrol', 'apgaism', 'luktur', 'latern'],
            keywords: 'apgaismojums, policijas uzraudzība, drošība, briesmīgas vietas, laternas',
            count: 0,
            quotes: []
        },
        {
            id: 'transport',
            name: 'Transports',
            stems: ['autob', 'maršrut', 'brauk', 'transport', 'pārvad', 'stac', 'pietur', 'sabiedr'],
            keywords: 'sabiedriskais transports, autobusu maršruti, pieturas',
            count: 0,
            quotes: []
        },
        {
            id: 'health',
            name: 'Veselība',
            stems: ['vesel', 'ārst', 'klīnik', 'medicīn', 'slim', 'palīdz', 'aprūp', 'farm', 'vingroš', 'pilat', 'nūjoš'],
            keywords: 'medicīniskā palīdzība, veselības aprūpe, ārsti, vingrošana, pilates',
            count: 0,
            quotes: []
        },
        {
            id: 'business',
            name: 'Darba vietas & Uzņēmējdarbība',
            stems: ['darb', 'uzņēm', 'iekārt', 'remont', 'saimniek', 'raž', 'produc', 'pakalpoj'],
            keywords: 'darba vietas, uzņēmējdarbība, iekārtošana, remonts',
            count: 0,
            quotes: []
        }
    ];

    // B. Veicam analīzi katrai tēmai
    const checkColumns = [
        'Kas Gramzdā šobrīd pietrūkst visvairāk',
        'Cita prioritāte',
        'Vēlamais deputāts vai speciālists tikšanās reizei',
        'Vēlamā jaunā aktivitāte vai pakalpojums',
        'Galvenā vēlēšanās Gramzdas nākotnei'
    ];

    const ageMap = AGE_LABELS;
    const locMap = LOCATION_LABELS;

    data.forEach(row => {
        // Apkopojam visus brīvos tekstus no šī respondenta vienā stringā
        let combinedText = '';
        checkColumns.forEach(col => {
            if (row[col]) combinedText += ' ' + String(row[col]);
        });
        
        const lowerText = combinedText.toLowerCase();

        // Pārbaudām katru tēmu
        THEMES.forEach(theme => {
            const hasMatch = theme.stems.some(stem => lowerText.includes(stem));
            if (hasMatch) {
                theme.count++;
                
                // Paņemam labāko citātu (piemēram, no "Kas pietrūkst visvairāk" vai "Nākotnes vēlēšanās")
                let quoteText = row['Kas Gramzdā šobrīd pietrūkst visvairāk'] || row['Galvenā vēlēšanās Gramzdas nākotnei'] || '';
                quoteText = String(quoteText).trim();
                
                if (quoteText.length > 5 && theme.quotes.length < 5) {
                    const ageLabel = ageMap[row['Vecuma grupa']] || 'Nav norādīts';
                    const locLabel = locMap[row['Dzīvesvieta']] || 'Nav norādīts';
                    theme.quotes.push({
                        text: quoteText,
                        meta: `${ageLabel} gadi | ${locLabel}`
                    });
                }
            }
        });
    });

    // Kārtojam tēmas pēc biežuma
    THEMES.sort((a, b) => b.count - a.count);

    // Citātu saraksta izveide (apvienojam no visām tēmām)
    let allQuotes = [];
    THEMES.forEach(t => {
        t.quotes.forEach(q => {
            if (!allQuotes.some(aq => aq.text === q.text)) {
                allQuotes.push(q);
            }
        });
    });
    // Samaisām vai paņemam pirmos 15
    allQuotes = allQuotes.slice(0, 15);

    // C. Renderējam saturu
    let themeListHtml = '';
    THEMES.forEach(theme => {
        const themePct = Math.round((theme.count / total) * 100);
        themeListHtml += `
            <div class="theme-item">
                <div class="theme-header">
                    <span class="theme-name">${theme.name}</span>
                    <span class="theme-percentage">${themePct}%</span>
                </div>
                <div class="theme-bar-bg">
                    <div class="theme-bar" style="width: ${themePct}%;"></div>
                </div>
                <div class="theme-keywords">Biežākie atslēgvārdi: ${theme.keywords}</div>
            </div>
        `;
    });

    let quotesHtml = '';
    allQuotes.forEach(q => {
        quotesHtml += `
            <div class="analysis-quote">
                "${q.text}"
                <span>— ${q.meta}</span>
            </div>
        `;
    });

    if (quotesHtml === '') {
        quotesHtml = '<p style="color:#64748b;">Nav atbilžu citātu.</p>';
    }

    container.innerHTML = `
        <div class="ai-card">
            <h3><i class="fas fa-comments"></i> Ko cilvēki rakstīja brīvajās atbildēs</h3>
            <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:20px;">Analīze ir sagrupējusi iedzīvotāju brīvās atbildes pa tēmām, lai vieglāk saprastu, kas visvairāk uztrauc un ko vēlas.</p>
            
            <div class="semantic-container">
                <div>
                    <h4 style="color:var(--primary); margin-bottom:15px;"><i class="fas fa-list-ol"></i> Visbiežāk minētās tēmas</h4>
                    <div class="theme-list">
                        ${themeListHtml}
                    </div>
                </div>
                <div>
                    <h4 style="color:var(--accent); margin-bottom:15px;"><i class="fas fa-quote-left"></i> Iedzīvotāju balsis (Citāti)</h4>
                    <div class="quote-scroller">
                        ${quotesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Trigger theme bar animation after rendering
    setTimeout(() => {
        container.querySelectorAll('.theme-bar').forEach(bar => {
            bar.style.width = bar.parentElement.previousElementSibling.querySelector('.theme-percentage').innerText;
        });
    }, 100);
}

/**
 * 4. REKOMENDĀCIJU CILNE
 */
function renderRecommendations(data) {
    const container = document.getElementById('ai-recommendations');
    const total = data.length;

    // A. Sagatavojam dinamiskos aprēķinus lēmumu pamatošanai
    const roadPrio = data.filter(d => d['Par prioritāti uzskata ceļu un infrastruktūras uzlabošanu'] === 1).length;
    const roadPct = Math.round((roadPrio / total) * 100);

    const priekuleMeet = data.filter(d => Number(d['Vēlas tikšanos ar Priekules namu pārstāvjiem']) >= 4).length;
    const priekulePct = Math.round((priekuleMeet / total) * 100);

    const gymUsage = data.filter(d => Number(d['Sporta zāles izmantošanas iespējamība']) >= 4).length;
    const gymPct = Math.round((gymUsage / total) * 100);

    const volunteer = data.filter(d => {
        const wantsMore = Number(d['Vēlētos vairāk iesaistīties pagasta aktivitātēs']) >= 3;
        const volunteerReady = d['Gatavs iesaistīties brīvprātīgajā darbā'] === 1;
        const doesntWant = d['Nevēlas iesaistīties aktivitātēs'] === 1;
        return (wantsMore || volunteerReady) && !doesntWant;
    }).length;
    const volunteerPct = Math.round((volunteer / total) * 100);

    container.innerHTML = `
        <div class="ai-card">
            <h3><i class="fas fa-route"></i> Darīšanas plāns balstoties uz aptaujas rezultātiem</h3>
            <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:20px;">Šie ieteikumi ir balstīti uz iedzīvotāju aptaujas rezultātiem, sadalīti pēc steidzamības un ietekmes.</p>
            
            <div class="roadmap-timeline">
                <!-- Fāze 1: Tūlītēji darbi -->
                <div class="roadmap-phase phase-immediate">
                    <h4><i class="fas fa-exclamation-triangle"></i> Īstermiņa prioritātes (1 - 3 mēneši)</h4>
                    <ul>
                        <li>
                            <i class="fas fa-tools"></i>
                            <div>
                                <strong>Ceļu uzturēšanas audits:</strong> Ņemot vērā, ka <strong>${roadPct}%</strong> iedzīvotāju to uzskata par prioritāti, nepieciešams uzsākt tūlītēju ceļa posmu greiderēšanas un ziemas tīrīšanas auditu, īpaši ārpus centra esošajos posmos.
                            </div>
                        </li>
                        <li>
                            <i class="fas fa-home"></i>
                            <div>
                                <strong>Tikšanās ar "Priekules nami" pārstāvjiem:</strong> Organizēt klātienes tikšanos ar apsaimniekotāju (pieprasa <strong>${priekulePct}%</strong> respondentu) par daudzdzīvokļu māju fasāžu renovāciju un briesmīgo kāpņu telpu remontu.
                            </div>
                        </li>
                        <li>
                            <i class="fas fa-shield-alt"></i>
                            <div>
                                <strong>Bērnu rotaļu laukuma sakārtošana:</strong> Vairākos komentāros minēts steidzams trūkums - smilšu kastes vāka uzstādīšana bērnu laukumā, lai novērstu dzīvnieku nokārtošanos, kā arī laternu uzstādīšana pie gružu novietnēm.
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Fāze 2: Vidēja termiņa plāns -->
                <div class="roadmap-phase phase-medium">
                    <h4><i class="fas fa-calendar-alt"></i> Vidēja termiņa plāns (3 - 12 mēneši)</h4>
                    <ul>
                        <li>
                            <i class="fas fa-running"></i>
                            <div>
                                <strong>Skolas sporta zāles atvēršana un inventāra uzlabošana:</strong> Aptauja rāda, ka <strong>${gymPct}%</strong> iedzīvotāju regulāri vai reizēm izmantotu sporta zāli. Ir jāizstrādā pieejamības grafiks jauniešiem un pieaugušajiem pēc stundām/darba laika un jāuzstāda trenažieri.
                            </div>
                        </li>
                        <li>
                            <i class="fas fa-hands-helping"></i>
                            <div>
                                <strong>Brīvprātīgo datubāzes un talku aktivizācija:</strong> Tā kā <strong>${volunteerPct}%</strong> iedzīvotāju ir gatavi līdzdarboties (sakopšanā, idejās, pasākumos), nepieciešams izveidot aktīvo iedzīvotāju WhatsApp/e-pastu kopienas grupu ātrai koordinācijai un talku plānošanai.
                            </div>
                        </li>
                        <li>
                            <i class="fas fa-microphone-alt"></i>
                            <div>
                                <strong>Kultūras un ģimenes pasākumu kalendārs:</strong> Vēlmes pēc zaļumballēm, koncertiem un ģimenes komandu sporta spēlēm ir izteiktas. Nepieciešams organizēt vismaz vienus lielus pagasta svētkus / zaļumballi vasaras sezonā un regulāras meistarklases.
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Fāze 3: Ilgtermiņa stratēģija -->
                <div class="roadmap-phase phase-long">
                    <h4><i class="fas fa-rocket"></i> Ilgtermiņa stratēģiskā vīzija (1 - 3 gadi)</h4>
                    <ul>
                        <li>
                            <i class="fas fa-users"></i>
                            <div>
                                <strong>Jaunu ģimeņu piesaistes programma:</strong> Brīvajās atbildēs kā galvenā vēlēšanās nākotnei tiek uzsvērta "dzīvība pagastā un iedzīvotāju piesaiste". Nepieciešams strādāt pie apdzīvojamā fonda sakārtošanas (pašvaldības dzīvokļu renovācijas programmas) un jaunu darba vietu/uzņēmējdarbības atbalsta.
                            </div>
                        </li>
                        <li>
                            <i class="fas fa-comments"></i>
                            <div>
                                <strong>Komunikācijas plaisas mazināšana un vietējais saimnieks:</strong> Stiprināt pagasta pārvaldes un deputātu saikni ar iedzīvotājiem (organizējot regulāras tikšanās un izglītojošus seminārus), kā arī veicināt iedzīvotāju savstarpējo cieņu un kopīgā darba novērtēšanu, lai novērstu sabiedriskā īpašuma bojāšanu.
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}
