import { fetchJSONP } from './utils.js';

const STYLE_ID = 'reallaiks-styles';

// REĀLLAIKA PANORAMIKAS JOSLA
// Izveido slīdošu teksta joslu, kas iegūd datus no Google Sheets "reallaiks" cilnes.
// Teksts plūst nepārtraukti no labās uz kreiso, pauze 1s, tad atkārto.
// Lietotājs var apturēt ar peli, aizvērt ar X, vai pārslīdzēt ar bultām.

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        #reallaiks-panorama {
            position: relative;
            width: 100%;
            height: 64px;
            background: rgba(8, 6, 6, 0.95);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border-top: 1px solid rgba(255, 77, 77, 0.35);
            border-bottom: 1px solid rgba(255, 77, 77, 0.25);
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            overflow: hidden;
            z-index: 500;
        }
        .reallaiks-inner {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: 0 36px;
            gap: 16px;
        }
        .reallaiks-date-badge {
            background: rgba(255, 77, 77, 0.12);
            border: 1px solid rgba(255, 77, 77, 0.4);
            color: #ff6b6b;
            padding: 4px 10px;
            border-radius: 3px;
            font-size: 18px;
            font-weight: 700;
            white-space: nowrap;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            flex-shrink: 0;
        }
        .reallaiks-track {
            flex: 1;
            position: relative;
            overflow: hidden;
            height: 100%;
            display: flex;
            align-items: center;
        }
        .reallaiks-scroll {
            position: absolute;
            white-space: nowrap;
            will-change: transform;
            pointer-events: none;
        }
        .reallaiks-scroll .reallaiks-title {
            color: #f5f7fa;
            font-size: 18px;
            font-weight: 600;
        }
        .reallaiks-scroll .reallaiks-sep {
            color: rgba(255, 77, 77, 0.7);
            margin: 0 18px;
            font-weight: 300;
        }
        .reallaiks-scroll .reallaiks-text {
            color: rgba(245, 247, 250, 0.7);
            font-size: 18px;
            font-weight: 400;
        }
        .reallaiks-close {
            position: absolute;
            top: 2px;
            right: 6px;
            background: none;
            border: none;
            color: rgba(245, 247, 250, 0.5);
            font-size: 22px;
            cursor: pointer;
            z-index: 20;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
            line-height: 1;
            padding: 0;
            flex-shrink: 0;
        }
        .reallaiks-close:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 768px) {
            #reallaiks-panorama { height: 78px; }
            .reallaiks-inner { padding: 0 32px; gap: 10px; }
            .reallaiks-date-badge { font-size: 18px; padding: 3px 7px; }
            .reallaiks-scroll .reallaiks-title { font-size: 18px; }
            .reallaiks-scroll .reallaiks-text { font-size: 18px; }
        }
    `;
    document.head.appendChild(style);
}

const PANORAMA_ID = 'reallaiks-panorama';

function createPanoramaBar() {
    const bar = document.createElement('div');
    bar.id = PANORAMA_ID;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'reallaiks-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Aizvērt reāllaika joslu');
    closeBtn.addEventListener('click', () => {
        bar.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        bar.style.opacity = '0';
        bar.style.transform = 'translateY(-6px)';
        setTimeout(() => bar.remove(), 350);
    });

    const inner = document.createElement('div');
    inner.className = 'reallaiks-inner';

    const dateBadge = document.createElement('span');
    dateBadge.className = 'reallaiks-date-badge';

    const track = document.createElement('div');
    track.className = 'reallaiks-track';

    const scroll = document.createElement('div');
    scroll.className = 'reallaiks-scroll';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'reallaiks-title';

    const sep = document.createElement('span');
    sep.className = 'reallaiks-sep';
    sep.textContent = '—';

    const textSpan = document.createElement('span');
    textSpan.className = 'reallaiks-text';

    scroll.append(titleSpan, sep, textSpan);
    track.appendChild(scroll);
    inner.append(dateBadge, track);
    bar.append(closeBtn, inner);

    return { bar, dateBadge, scroll, track };
}

// Formatē datumu no dažādiem formātiem uz DD.MM.YYYY
function formatDate(dateStr) {
    if (!dateStr) return '';
    if (/^\d{2}[.\/]\d{2}[.\/]\d{4}/.test(String(dateStr))) {
        const parts = dateStr.match(/(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/);
        if (parts) return `${parts[1].padStart(2,'0')}.${parts[2].padStart(2,'0')}.${parts[3]}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

// Ielādē datus no Google Sheets "reallaiks" cilnes un palaiž marquee animāciju
async function loadReallaiks(elements) {
    try {
        const result = await fetchJSONP('https://script.google.com/macros/s/AKfycbycb4PKQOx6PF-bpznjXo4sLE8NBaXRmW70WEmdb9ldFqskINnMorc6QUIzJm70nPhp/exec', {
            action: 'getReallaiks',
            t: Date.now()
        });

        if (result.error) {
            console.error('Reallaiks API kļūda:', result.error);
            elements.bar.remove();
            return;
        }

        const rows = result.data || [];
        const items = rows.slice(1).map(cols => {
            const idAktivs = String(cols[0] || '').trim().toUpperCase();
            if (idAktivs !== 'X') return null;
            return {
                datums: String(cols[1] || '').trim(),
                virsraksts: String(cols[2] || '').trim(),
                teksts: String(cols[3] || '').trim()
            };
        }).filter(Boolean);

        if (items.length === 0) {
            elements.bar.remove();
            return;
        }

        runMarquee(elements, items[0]);

    } catch (e) {
        console.error('Reallaiks ielādes kļūda:', e);
        elements.bar.remove();
    }
}

// Nepārtraukta teksta plūduma animācija (marquee efektu)
// Teksts slīd no labās uz kreiso, kad izlien ārā - pauze 1s, tad atkārto
function runMarquee(elements, item) {
    const { bar, dateBadge, scroll, track } = elements;

    const date = formatDate(item.datums);
    const title = item.virsraksts || '';
    const text = item.teksts || '';

    dateBadge.textContent = date || '';
    scroll.querySelector('.reallaiks-title').textContent = title;
    scroll.querySelector('.reallaiks-text').textContent = text;

    if (!title && !text) {
        bar.remove();
        return;
    }

    const speed = 0.5;
    let currentX = 0;
    let rafId = null;
    let paused = false;

    function getTrackWidth() {
        return track.offsetWidth;
    }

    function getTextWidth() {
        scroll.style.transform = 'translateX(0)';
        scroll.style.left = '0';
        const w = scroll.scrollWidth;
        return w;
    }

    function startAnimation() {
        const trackW = getTrackWidth();
        const textW = getTextWidth();
        currentX = trackW;
        paused = false;
        step(trackW, textW);
    }

    function resumeAnimation() {
        if (paused || rafId) return;
        const trackW = getTrackWidth();
        const textW = getTextWidth();
        paused = false;
        step(trackW, textW);
    }

    function step(trackW, textW) {
        currentX -= speed;

        if (currentX <= -textW) {
            scroll.style.transform = `translateX(${-textW}px)`;
            paused = true;
            setTimeout(() => {
                if (!bar.parentNode) return;
                startAnimation();
            }, 1000);
            return;
        }

        scroll.style.transform = `translateX(${currentX}px)`;
        rafId = requestAnimationFrame(() => step(trackW, textW));
    }

    bar.addEventListener('mouseenter', () => {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });
    bar.addEventListener('mouseleave', () => {
        if (paused) return;
        resumeAnimation();
    });
    bar.addEventListener('touchstart', () => {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }, { passive: true });
    bar.addEventListener('touchend', () => {
        if (paused) return;
        setTimeout(() => { if (!rafId && !paused) resumeAnimation(); }, 2000);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!rafId && !paused) startAnimation();
            } else {
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            }
        });
    }, { threshold: 0.1 });
    observer.observe(bar);

    startAnimation();
}

// Inicializē reāllaika joslu: ievieto DOM, ielādē datus, palaiž animāciju
function initPanorama() {
    injectStyles();
    const hero = document.querySelector('header.hero');
    if (!hero) return;

    const elements = createPanoramaBar();
    const bar = elements.bar;
    hero.insertAdjacentElement('afterend', bar);

    loadReallaiks(elements);
}

const alreadyInit = document.currentScript;
// Droša inicializācija: pārbauda, vai脚本 jau ielādēts, vai gaidīt DOMContentLoaded
if (alreadyInit) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanorama);
    } else {
        initPanorama();
    }
} else {
    document.addEventListener('DOMContentLoaded', initPanorama);
}
