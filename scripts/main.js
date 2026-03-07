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

document.addEventListener('DOMContentLoaded', countNewProblems);

// --- HERO CANVAS ANIMATION (PARTICLES) ---
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Konfigurācija
    const particleCount = window.innerWidth < 768 ? 30 : 80; // Mazāk uz telefoniem
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
});