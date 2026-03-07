let current = 0;
const slides = document.querySelectorAll('.slide');
const total = slides.length;
const container = document.querySelector('.slides');
const progress = document.getElementById('progress');
const counter = document.getElementById('counter');
const ticker = document.getElementById('tickerText');

// Subtitru teksti katram slaidam
const speeches = [
    "Labvakar, cienījamie gramzdenieki! Paldies, ka atradāt laiku šovakar atnākt uz Tautas namu.",
    "Kā zināt, mums ir izveidota jauna Iedzīvotāju padome. Mēs neesam nekādi 'augsti kungi' vai tāla administrācija – mēs esam jūsu kaimiņi, draugi un tieši tādi paši iedzīvotāji kā jūs. Mēs šeit dzīvojam, staigājam pa tām pašām ielām un redzam tās pašas problēmas, ko redzat jūs.",
    "Mēs neesam tikai entuziastu grupa. Mūsu darbību nosaka Pašvaldību likuma 58. pants un Dienvidkurzemes novada saistošie noteikumi Nr. 2025/13. Mums ir likumīgas tiesības pārstāvēt jūsu intereses domē.",
    "Šovakar vēlos jūs iepazīstināt ar mūsu komandu. Mēs esam dažādi, bet mūs vieno viena lieta – mēs gribam, lai Gramzdas pagasts ir vieta, kurā ir patīkami dzīvot.",
    "Mūsu galvenais uzdevums ir būt kā 'tiltam' starp jums un novada domi. Bieži vien ir sajūta, ka iedzīvotāju balsis pazūd kaut kur lielajos gaiteņos. Padome ir šeit, lai tas vairs nenotiktu.",
    "Pirmkārt, panākt, ka pagasta vajadzības tiek sadzirdētas pirms tiek pieņemti lēmumi, nevis pēc tam. Mēs gribam būt klāt pie galda, kad tiek lemts par mūsu naudu un mūsu zemi.",
    "Otrkārt, rūpēties par mūsu kopējo vidi – lai infrastruktūra un pakalpojumi šeit nesabrukst, bet attīstās. Treškārt, radīt kopības sajūtu. Mēs nevaram izdarīt visu jūsu vietā, bet mēs varam palīdzēt organizēt.",
    "Gribu uzsvērt – padome viena pati nav brīnumdaris. Mums vajag jūs. Varbūt jums ir ideja, kā uzlabot bērnu laukumu, vai redzat kādu bīstamu bedri? Tikai kopā mēs esam spēks, ar ko pašvaldībai ir jārēķinās.",
    "Drīz būs pavasaris un laiks talkai. Tā būs pirmā lielā iespēja mums visiem kopā izkustēties un pielikt roku, lai mūsu pagasts pēc ziemas atplauktu. Aicinu jau tagad domāt par darāmajiem darbiem.",
    "Noslēgumā gribu teikt – šī ir mūsu pirmā tikšanās, un mēs vēl tikai mācāmies. Tāpēc tagad es gribu dot vārdu jums. Kādas ir jūsu pirmās domas? Kas ir tas, kas jums šobrīd Gramzdā 'deg' visvairāk?",
    "Lūdzu, nebaidieties teikt visu, kā ir – mēs esam šeit, lai klausītos! Sazinieties ar mums jebkurā laikā."
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
    
    // Reset animation logic
    ticker.style.animation = 'none';
    ticker.offsetHeight; /* trigger reflow */
    
    // Aprēķināt animācijas ilgumu balstoties uz teksta garumu (lai nav pa ātru vai lēnu)
    const duration = Math.max(10, speeches[current].length / 8); // Aptuveni 8 simboli sekundē
    ticker.style.animation = `ticker ${duration}s linear forwards`;
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
document.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e=>{
    let diff = e.changedTouches[0].clientX - startX;
    if(diff > 50) prevSlide();
    if(diff < -50) nextSlide();
});

// Initialize
updateSlide();