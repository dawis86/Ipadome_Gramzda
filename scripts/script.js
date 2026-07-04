/**
 * PREZENTĀCIJAS MODULIS
 * Pārvalda slaidrādes funkcionalitāti, navigāciju un subtitru attēlošanu.
 */

let current = 0;
const slides = document.querySelectorAll('.slide');
const total = slides.length;
const container = document.querySelector('.slides');
const progress = document.getElementById('progress');
const counter = document.getElementById('counter');
const ticker = document.getElementById('tickerText');

// Subtitru teksti katram slaidam
const speeches = [
    "Sveicam šovakar! Aptaujas rezultātu analīze parāda, ko iedzīvotāji no Gramzdas pagasta svarīgāk vēlas.",
    "Izvirzījās 5 svarīgākās lietas – pagasta 'dzīvība', infrastruktūra, jaunieši, ekonomika un komunikācija.",
    "Galvenie secinājumi: cilvēki vēlas redzamāku un aktīvāku Gramzdu ar vairāk iespējām ģimenēm, bērniem un senioriem.",
    "Kas pietrūkst visvairāk? Pirmā prioritāte – darba vietas un uzņēmējdarbības iespējas.",
    "Iesaistes rādītāji: zinām, kāda ir gatavība iesaistīties un ko cilvēki nolemj par nākotni.",
    "Demogrāfija rāda, kā respondenti sadalās pa vecuma grupām un dzīvesvietām.",
    "Iesaistes līmenis ir augsts – cilvēki ir gatavi palīdzēt, īpaši organizēt pasākumus un sniegt idejas.",
    "Vēlākie pasākumi: koncerti, ģimenes pasākumi, bērnu un jauniešu aktivitātes, sporta pasākumi, darbnīcas.",
    "Nākotnē cilvēki vēlas sakoptu, drošu un dzīvīgu pagastu – ar darbošanos, mājokļiem un kultūras dzīvi.",
    "Priekšlikumi: daudzdzīvokļu māju uzraudzība, ceļu uzlabošana, bērnu programma, uzņēmējdarbības attīstība.",
    "Paldies par klātbūtni! Kopā mēs veidosim labāku nākotni Gramzdai."
];

function updateSlide(){
    container.style.transform = `translateX(-${current * 100}%)`;
    progress.style.width = ((current+1)/total)*100 + "%";
    counter.innerText = `${current + 1} / ${total}`;
    
    // Manage active class for animations
    slides.forEach((slide, index) => {
        if(index === current){
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    // Update Ticker Text and Restart Animation
    const tickerItem = ticker.querySelector('.ticker-item');
    tickerItem.innerText = speeches[current];
    
}

function nextSlide(){
    if(current < total-1){
        current++;
        updateSlide();
    }
}

function prevSlide(){
    if(current > 0){
        current--;
        updateSlide();
    }
}

document.addEventListener('keydown', e=>{
    if(e.key === "ArrowRight" || e.key === "Space") nextSlide();
    if(e.key === "ArrowLeft") prevSlide();
    if(e.key === "f") toggleFullscreen();
});

// Click anywhere to advance (except on buttons)
document.body.addEventListener('click', e => {
    // Ja klikšķis nav uz pogām, ejam uz priekšu
    if(!e.target.closest('button')){
        nextSlide();
    }
});

function toggleFullscreen(){
    if(!document.fullscreenElement){
        document.documentElement.requestFullscreen().catch(e => {
            console.log("Fullscreen not supported or blocked");
        });
    } else {
        document.exitFullscreen();
    }
}

let startX = 0;
let startY = 0;

document.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

document.addEventListener("touchend", e=>{
    let diffX = e.changedTouches[0].clientX - startX;
    let diffY = e.changedTouches[0].clientY - startY;

    // Ja vertikālā kustība ir lielāka par horizontālo, tas ir "scroll" - nemainām slaidu
    if(Math.abs(diffY) > Math.abs(diffX)) return;

    if(diffX > 50) prevSlide();
    if(diffX < -50) nextSlide();
});

function startPresentation() {
    // Mēģinām ieslēgt pilnekrānu
    toggleFullscreen();
    // Noslēpjam sākuma ekrānu
    document.getElementById('mobile-start-overlay').style.display = 'none';
}

// Initialize
updateSlide();