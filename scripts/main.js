// --- DINAMISKO DATU MAĢIJA GALVENAJĀ LAPĀ ---

// Saite uz problēmu kartes datiem
const problemSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKnnovF3pnz0La8c0Nl1G-BGpChs7WuAIq61CDON6eubdSnuNGpACja0Fm0Up4xyvD0w1b5JimKqKO/pub?output=csv';

async function countNewProblems() {
    try {
        const response = await fetch(problemSheetUrl + '&t=' + Date.now());
        if (!response.ok) return;

        const data = await response.text();
        const rows = data.split('\n').slice(1);
        
        let newProblemCount = 0;
        rows.forEach(row => {
            const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            if (columns.length > 5) {
                const status = (columns[5] ? columns[5].replace(/"/g, '').trim() : '').toLowerCase();
                if (status === 'jauns' || status === '') { // Skaitam gan "jauns", gan tukšus kā jaunus
                    newProblemCount++;
                }
            }
        });

        if (newProblemCount > 0) {
            const mapCard = document.querySelector('a[href="karte.html"]');
            const badge = document.createElement('span');
            badge.classList.add('badge');
            badge.textContent = `${newProblemCount} ${newProblemCount === 1 ? 'jauns ziņojums' : 'jauni ziņojumi'}`;
            mapCard.appendChild(badge);
        }
    } catch (error) {
        console.error("Neizdevās saskaitīt jaunos ziņojumus:", error);
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
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
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
            ctx.fillStyle = 'rgba(62, 207, 142, 0.5)'; // Accent color
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
        ctx.clearRect(0, 0, width, height);
        
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
    initializeParticles();
    initializeSpotlightEffect();
    initializeShareWidget();
});