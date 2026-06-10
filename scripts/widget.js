/**
 * GRAMZDAS VIEDĀ LOGRĪKA DZINĒJS v2026
 * Drošs, ātrs un centralizēts risinājums.
 */

import { getOrCreateUID, triggerWowEffect, sanitizeHTML, API_URL, fetchJSONP } from './utils.js';

const WIDGET_CONFIG = {
    scriptUrl: API_URL,
    // Datus tagad iegūsim caur scriptUrl, pievienojot parametru ?action=getData
    cooldown: 2000 // 2 sekundes starp klikšķiem
};

export let isVoting = false;
let lastActionTime = 0;

export async function initSmartWidget(isCompact = false) {
    const container = document.getElementById('smart-widget-container');
    if (!container) return;

    try {
        // Izmantojam JSONP lasīšanai, lai novērstu CORS problēmas
        const result = await fetchJSONP(WIDGET_CONFIG.scriptUrl, { action: 'getWidget', t: Date.now() });
        const rows = result.data; // Pieņemot, ka skripts atgriež JSON masīvu
        
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
    const visitorId = getOrCreateUID();
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
        renderPollLogic(content, widget, visitorId, hasVoted);
    } else if (widget.type === 'RATING') {
        renderRatingLogic(content, widget, visitorId, hasVoted);
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
    } else if (widget.type === 'COUNTDOWN') {
        renderCountdownLogic(content, widget);
    }

    wrapper.appendChild(content);
    container.replaceChildren(wrapper);
}

function renderPollLogic(parent, widget, visitorId, hasVoted) {
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
            btn.onclick = () => handleVote(widget, opt, visitorId, parent);
            list.appendChild(btn);
        });

        // Pievienojam "Cits..." variantu
        const otherBtn = document.createElement('button');
        otherBtn.className = 'poll-option-btn other-toggle';
        otherBtn.innerHTML = sanitizeHTML('<span>Cits...</span> <i class="fa-solid fa-pen-to-square"></i>');
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
                if (val && val.length < 100) handleVote(widget, val, visitorId, parent);
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

async function handleVote(widget, value, visitorId, container) {
    const now = Date.now();
    if (isVoting || (now - lastActionTime < WIDGET_CONFIG.cooldown)) {
        console.warn("Lūdzu uzgaidiet...");
        return;
    }
    isVoting = true;
    lastActionTime = now;

    // Atspējojam visas interaktīvās pogas logrīkā
    const interactiveElements = container.querySelectorAll('button, input');
    interactiveElements.forEach(el => { el.disabled = true; el.classList.add('loading'); });

    try {
        // Izmantojam JSONP arī balsošanai, lai novērstu CORS kļūdas un garantētu datu nonākšanu tabulā
        const result = await fetchJSONP(WIDGET_CONFIG.scriptUrl, {
            id: widget.id,
            vote: value,
            uid: visitorId,
            source: widget.text,
            t: now
        });

        if (result.error) {
            alert(result.error);
        } else {
            localStorage.setItem(`voted_${widget.id}`, 'true');
            triggerWowEffect();
        }
    } catch (e) { 
        console.error("Balsošanas tīkla kļūda:", e); 
    }

    // Pārzīmējam uz rezultātiem
    setTimeout(() => {
        initSmartWidget();
        isVoting = false;
    }, 500);
}

async function fetchResultsAndRender(parent, widget, options) {
    try {
        const result = await fetchJSONP(WIDGET_CONFIG.scriptUrl, { action: 'getVotes', t: Date.now() });
        const votes = result.data;

        const counts = {};
        const otherEntries = {}; // Krāsim konkrētos "Cits" ierakstus
        let total = 0;

        votes.slice(1).forEach(row => {
            // Drošāka ID salīdzināšana (pārvēršam abus par string)
            if (String(row[1]) === String(widget.id)) {
                const voteVal = row[2];
                if (options.includes(voteVal)) {
                    counts[voteVal] = (counts[voteVal] || 0) + 1;
                } else {
                    // Grupējam ierakstus, ignorējot reģistru un liekas atstarpes
                    const normalized = voteVal.trim();
                    otherEntries[normalized] = (otherEntries[normalized] || 0) + 1;
                }
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
        const otherVotesList = Object.entries(otherEntries).sort((a, b) => b[1] - a[1]);
        const otherCount = otherVotesList.reduce((sum, entry) => sum + entry[1], 0);

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

            // PIEVIENOJAM DETALIZĀCIJU:
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'other-details-toggle';
            toggleBtn.textContent = 'Skatīt iedzīvotāju ieteikumus...';
            
            const detailsList = document.createElement('div');
            detailsList.className = 'other-results-list';
            detailsList.style.display = 'none';

            otherVotesList.forEach(([text, count]) => {
                const entry = document.createElement('div');
                entry.className = 'other-result-entry';
                const s1 = document.createElement('span'); s1.textContent = text;
                const s2 = document.createElement('span'); s2.textContent = count;
                s2.style.cssText = 'font-weight:bold; color:var(--accent)';
                entry.append(s1, s2);
                detailsList.appendChild(entry);
            });

            toggleBtn.onclick = () => {
                const isHidden = detailsList.style.display === 'none';
                detailsList.style.display = isHidden ? 'block' : 'none';
                toggleBtn.textContent = isHidden ? 'Paslēpt ieteikumus' : 'Skatīt iedzīvotāju ieteikumus...';
            };

            resultsDiv.appendChild(toggleBtn);
            resultsDiv.appendChild(detailsList);
        }

        const thanks = document.createElement('div');
        thanks.className = 'poll-thanks';
        thanks.textContent = 'Paldies par balsojumu!';
        
        parent.replaceChildren(parent.querySelector('h3'), resultsDiv, thanks);
    } catch (e) {
        console.error("Rezultātu apstrādes kļūda:", e);
    }
}

/**
 * Aprēķina un attēlo atpakaļskaitīšanas taimeri.
 * Atbalsta formātus: DD.MM.YYYY HH:MM vai standarta ISO.
 */
function renderCountdownLogic(parent, widget) {
    const parseDate = (str) => {
        const parts = str.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
        if (parts) {
            return new Date(parts[3], parts[2] - 1, parts[1], parts[4] || 0, parts[5] || 0);
        }
        return new Date(str);
    };

    const targetDate = parseDate(widget.data);
    const targetTime = targetDate.getTime();

    // Noformējam datumu cilvēkam saprotamā veidā (DD.MM.YYYY HH:MM)
    const formattedDate = !isNaN(targetTime) 
        ? `${String(targetDate.getDate()).padStart(2, '0')}.${String(targetDate.getMonth() + 1).padStart(2, '0')}.${targetDate.getFullYear()} ${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`
        : widget.data;

    // 1. Izveidojam informatīvo bloku ar norises datumu/laiku
    const infoEl = document.createElement('div');
    infoEl.className = 'countdown-info';
    infoEl.innerHTML = `<i class="fa-regular fa-calendar-check"></i> Norises laiks: <strong>${formattedDate}</strong>`;
    parent.appendChild(infoEl);

    const countdownEl = document.createElement('div');
    countdownEl.className = 'countdown-timer';
    parent.appendChild(countdownEl);

    const updateTimer = () => {
        const now = Date.now();
        const diff = targetTime - now;

        if (diff <= 0) {
            countdownEl.innerHTML = `<div class="event-arrived">NOTIKUMS IR KLĀT!</div>`;
            return false;
        }

        const vals = [
            { v: Math.floor(diff / 86400000), l: 'd' },
            { v: Math.floor((diff % 86400000) / 3600000), l: 'st' },
            { v: Math.floor((diff % 3600000) / 60000), l: 'm' },
            { v: Math.floor((diff % 60000) / 1000), l: 's' }
        ];

        // WOW loģika: Atjaunojam elementus individuāli, lai varētu animēt ciparu maiņu
        if (countdownEl.children.length === 0 || countdownEl.querySelector('.event-arrived')) {
            countdownEl.innerHTML = '';
            vals.forEach(item => {
                const unit = document.createElement('div');
                unit.className = 'countdown-unit';
                unit.innerHTML = `<span>${item.v}</span><small>${item.l}</small>`;
                countdownEl.appendChild(unit);
            });
        } else {
            vals.forEach((item, i) => {
                const span = countdownEl.children[i].querySelector('span');
                if (span.textContent !== String(item.v)) {
                    span.textContent = item.v;
                    // Pievienojam "pop" animāciju cipara maiņas brīdī
                    span.classList.remove('pop');
                    void span.offsetWidth; // Piespiežam pārlūkam pārzīmēt elementu
                    span.classList.add('pop');
                }
            });
        }
        return true;
    };

    if (!isNaN(targetTime)) {
        updateTimer();
        const interval = setInterval(() => {
            // Pārbaudām, vai elements joprojām ir lapā, lai nekrātu liekus fonā intervālus
            if (!document.body.contains(countdownEl)) {
                clearInterval(interval);
                return;
            }
            if (!updateTimer()) clearInterval(interval);
        }, 1000);
    } else {
        countdownEl.textContent = "Kļūdains datuma formāts!";
    }
}