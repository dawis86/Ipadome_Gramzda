/**
 * GRAMZDA SMART WIDGET ENGINE v2026
 * Drošs, ātrs un centralizēts.
 */

const WIDGET_CONFIG = {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=503325924&single=true&output=csv',
    scriptUrl: 'https://script.google.com/macros/s/AKfycbz4LraZPmkpgP57ttB9SgRsRtISrdHFHe57mnp3JaBqgJxyKNr_3MjZJgyAL5sHrmcT/exec',
    votesUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKH9kIRSepkanwDWtDkYiyG4pVRNMYNTuSwsYPqzZ6h6h5CRptIsUxqENvdnFUWJb1H2JR63KQYVdJ/pub?gid=817326020&single=true&output=csv',
    cooldown: 2000 // 2 sekundes starp klikšķiem
};

let isVoting = false;
let lastActionTime = 0;

async function initSmartWidget(isCompact = false) {
    const container = document.getElementById('smart-widget-container');
    if (!container) return;

    try {
        const response = await fetch(`${WIDGET_CONFIG.sheetUrl}&t=${Date.now()}`);
        const data = await response.text();
        const rows = parseCSV(data).slice(1);

        let active = null;
        for (const cols of rows) {
            if (cols[0]?.toUpperCase() === 'X') {
                active = { type: cols[1].toUpperCase(), text: cols[2], data: cols[3], id: cols[4] };
                break;
            }
        }

        if (!active) {
            container.replaceChildren();
            return;
        }

        renderWidget(container, active, isCompact);
    } catch (e) {
        console.error("Logrīka ielādes kļūda:", e);
    }
}

function renderWidget(container, widget, isCompact) {
    const uid = getOrCreateUID();
    const hasVoted = localStorage.getItem(`voted_${widget.id}`);

    const wrapper = document.createElement('div');
    wrapper.className = `smart-widget type-${widget.type.toLowerCase()}`;
    if (isCompact) wrapper.classList.add('compact-view');

    const content = document.createElement('div');
    content.className = 'widget-content';

    const title = document.createElement('h3');
    title.textContent = widget.text;
    content.appendChild(title);

    if (widget.type === 'POLL') {
        renderPollLogic(content, widget, uid, hasVoted);
    } else if (widget.type === 'RATING') {
        renderRatingLogic(content, widget, uid, hasVoted);
    } else if (widget.type === 'ALERT') {
        const btn = document.createElement('a');
        btn.href = widget.data;
        btn.className = 'widget-btn';
        btn.target = '_blank';
        btn.textContent = 'Atvērt ';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-arrow-right';
        btn.appendChild(icon);
        content.appendChild(btn);
    }

    wrapper.appendChild(content);
    container.replaceChildren(wrapper);
}

function renderPollLogic(parent, widget, uid, hasVoted) {
    // 2026. gada risinājums: Gudrā skaldīšana. 
    // Ja tekstā ir komats (piem., iekavās), parastais .split(',') to saplēš.
    // Mēs izmantojam regex, kas skaldīs tikai tos komatus, kam seko atstarpe (tipisks CSV variants),
    // vai vēl labāk - izmantojam mūsu robusto parseCSV uz šo vienu virkni.
    
    // Pagaidām drošākais variants: ja lietotājs lieto komatus iekavās, splitējam pēc komata, kam seko atstarpe
    const options = widget.data.split(/,\s*/).map(o => o.trim()).filter(o => o.length > 0);
    
    const list = document.createElement('div');
    list.className = 'poll-options';

    if (hasVoted) {
        fetchResultsAndRender(parent, widget, options);
    } else {
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'poll-option-btn';
            btn.textContent = opt;
            btn.onclick = () => handleVote(widget, opt, uid, parent);
            list.appendChild(btn);
        });

        // Pievienojam "Cits..." variantu
        const otherBtn = document.createElement('button');
        otherBtn.className = 'poll-option-btn other-toggle';
        otherBtn.innerHTML = '<span>Cits...</span> <i class="fa-solid fa-pen-to-square" style="font-size: 0.8rem; opacity: 0.7;"></i>';
        otherBtn.onclick = () => {
            list.style.display = 'none';
            const otherWrap = document.createElement('div');
            otherWrap.className = 'other-input-wrap';
            otherWrap.style.marginTop = '10px';
            
            const input = document.createElement('input');
            input.className = 'poll-other-input';
            input.placeholder = 'Ierakstiet savu variantu...';
            
            const submit = document.createElement('button');
            submit.className = 'widget-btn';
            submit.style.width = '100%';
            submit.style.marginTop = '10px';
            submit.textContent = 'Balsot';
            submit.onclick = () => {
                const val = input.value.trim();
                if (val) handleVote(widget, val, uid, parent);
            };

            const back = document.createElement('button');
            back.className = 'back-to-options';
            back.textContent = 'Atpakaļ pie variantiem';
            back.onclick = () => {
                otherWrap.remove();
                list.style.display = 'block';
            };

            otherWrap.append(input, submit, back);
            parent.appendChild(otherWrap);
            input.focus();
        };
        list.appendChild(otherBtn);
        parent.appendChild(list);
    }
}

async function handleVote(widget, value, uid, container) {
    const now = Date.now();
    if (isVoting || (now - lastActionTime < WIDGET_CONFIG.cooldown)) {
        console.warn("Lūdzu uzgaidiet...");
        return;
    }
    isVoting = true;
    lastActionTime = now;

    localStorage.setItem(`voted_${widget.id}`, 'true');
    
    try {
        const url = `${WIDGET_CONFIG.scriptUrl}?id=${encodeURIComponent(widget.id)}&vote=${encodeURIComponent(value)}&uid=${uid}&source=${encodeURIComponent(widget.text)}&t=${now}`;
        await fetch(url, { mode: 'no-cors' });
    } catch (e) { console.error("Balsošanas kļūda", e); }

    if (window.triggerWowEffect) triggerWowEffect();

    // Pārzīmējam uz rezultātiem
    setTimeout(() => {
        initSmartWidget();
        isVoting = false;
    }, 500);
}

async function fetchResultsAndRender(parent, widget, options) {
    try {
        const resp = await fetch(`${WIDGET_CONFIG.votesUrl}&t=${Date.now()}`);
        const text = await resp.text();
        const votes = parseCSV(text);
        
        const counts = {};
        let total = 0;
        votes.forEach(row => {
            if (row[1] === widget.id) {
                counts[row[2]] = (counts[row[2]] || 0) + 1;
                total++;
            }
        });

        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'poll-results';

        options.forEach(opt => {
            const count = counts[opt] || 0;
            const pc = total === 0 ? 0 : Math.round((count / total) * 100);
            
            const row = document.createElement('div');
            row.className = 'poll-result-row';
            
            const label = document.createElement('div');
            label.className = 'poll-option-label';
            
            const name = document.createElement('span');
            name.textContent = opt;
            const val = document.createElement('span');
            val.className = 'poll-count-text';
            val.textContent = `${count} (${pc}%)`;
            
            label.append(name, val);
            
            const barBg = document.createElement('div');
            barBg.className = 'poll-bar-bg';
            const barFill = document.createElement('div');
            barFill.className = 'poll-bar-fill';
            barFill.style.width = `${pc}%`;
            
            barBg.appendChild(barFill);
            row.append(label, barBg);
            resultsDiv.appendChild(row);
        });

        // Aprēķinām un parādām "Citi varianti" rezultātus
        const otherCount = Object.keys(counts)
            .filter(key => !options.includes(key))
            .reduce((sum, key) => sum + counts[key], 0);

        if (otherCount > 0) {
            const pc = total === 0 ? 0 : Math.round((otherCount / total) * 100);
            const row = document.createElement('div');
            row.className = 'poll-result-row';
            
            const label = document.createElement('div');
            label.className = 'poll-option-label';
            const name = document.createElement('span');
            name.textContent = 'Citi varianti';
            const val = document.createElement('span');
            val.className = 'poll-count-text';
            val.textContent = `${otherCount} (${pc}%)`;
            label.append(name, val);
            
            const barBg = document.createElement('div');
            barBg.className = 'poll-bar-bg';
            const barFill = document.createElement('div');
            barFill.className = 'poll-bar-fill';
            barFill.style.width = `${pc}%`;
            barFill.style.background = 'linear-gradient(90deg, var(--soft) 0%, #718096 100%)'; // Citādāka krāsa "Citiem"
            
            barBg.appendChild(barFill);
            row.append(label, barBg);
            resultsDiv.appendChild(row);
        }

        const thanks = document.createElement('div');
        thanks.className = 'poll-thanks';
        thanks.textContent = 'Paldies par balsojumu!';
        
        parent.replaceChildren(parent.querySelector('h3'), resultsDiv, thanks);
    } catch (e) {
        console.error("Rezultātu apstrādes kļūda:", e);
    }
}

function getOrCreateUID() {
    let uid = localStorage.getItem('gramzda_uid');
    if (!uid) {
        uid = 'usr_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('gramzda_uid', uid);
    }
    return uid;
}

// Saziņas formas sūtīšana uz Google (Aizstāj Formspree)
window.sendContactToGoogle = async (event) => {
    event.preventDefault();
    const now = Date.now();
    if (now - lastActionTime < WIDGET_CONFIG.cooldown) return;
    lastActionTime = now;

    const form = event.target;
    const uid = getOrCreateUID();

    // Izmantojam URLSearchParams, lai sūtītu datus kā POST body
    const body = new URLSearchParams();
    body.append('name', form.name.value);
    body.append('email', form.email.value);
    body.append('message', form.message.value);
    body.append('identity', uid); // Atbilst Script 'params.identity'
    body.append('t', now);

    try {
        // Izmantojam POST, lai izsauktu doPost funkciju Scriptā, kas sūta e-pastu un ieraksta datus
        await fetch(WIDGET_CONFIG.scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: body
        });
    } catch (e) {
        console.error("Sūtīšanas kļūda:", e);
    }
    
    window.location.href = 'paldies.html';
};