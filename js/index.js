// ------------------ State Management ------------------
let activeSection = null;
let inkAnimationId = null;
let inkDripInterval = null;
let inkActive = false;

// ------------------ DOM Elements ------------------
const container = document.getElementById('portfolio-container');
const modeSwitch = document.getElementById('mode-switch');
const contentArea = document.getElementById('content-area');
const closeButton = document.getElementById('close-button');
const navButtons = document.querySelectorAll('.nav-button');

// ------------------ Theme Management ------------------
let currentTheme = localStorage.getItem('theme') || 'light';
container.classList.add(`${currentTheme}-mode`);

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    container.classList.remove('light-mode', 'dark-mode');
    container.classList.add(`${currentTheme}-mode`);
    localStorage.setItem('theme', currentTheme);
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    container.className = `portfolio-container ${currentTheme}-mode`;
}

// ------------------ Section Templates ------------------
function getSectionContent(section) {
    switch (section) {
        case 'profile':
            return `
                <div class="section-content profile-content">
                    <h1>About Me</h1>
                    <div class="profile-card">
                        <div class="profile-image-placeholder"><div class="magnifier-icon">🔍</div></div>
                        <div class="profile-text">
                            <h2>Lee</h2>
                            <p class="subtitle">Creative Developer & Designer</p>
                            <p>Welcome to my desk! I create digital spaces that feel both modern and nostalgic.</p>
                            <div class="skills">
                                <span class="skill-tag">UI/UX Design</span>
                                <span class="skill-tag">Web Development</span>
                                <span class="skill-tag">Creative Coding</span>
                            </div>
                        </div>
                    </div>
                </div>`;
        case 'projects':
            return `
                <div class="section-content projects-content">
                    <h1>Projects</h1>
                    <div class="projects-grid">
                        <div class="project-card"><div class="project-icon">📓</div><h3>Project One</h3><p>A beautiful web app.</p></div>
                        <div class="project-card"><div class="project-icon">✏️</div><h3>Project Two</h3><p>An interactive art-tech piece.</p></div>
                        <div class="project-card"><div class="project-icon">📐</div><h3>Project Three</h3><p>A generative design experiment.</p></div>
                    </div>
                </div>`;
        case 'location':
            return `
                <div class="section-content location-content">
                    <h1>Location</h1>
                    <div class="location-card">
                        <div class="globe-icon">🌍</div>
                        <h2>Based in UK</h2>
                        <p>Available for remote work worldwide</p>
                    </div>
                </div>`;
        default:
            return '';
    }
}

// ------------------ Ink Wave Simulation ------------------
function startInkAnimation(container) {
    const canvas = document.createElement('canvas');
    canvas.classList.add('ink-canvas');
    canvas.style.position = 'absolute';
    canvas.style.bottom = 0;
    canvas.style.left = 0;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = 2;
    container.querySelector('.contact-container').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const width = canvas.width;
    const height = canvas.height;
    const resolution = 5;
    const cols = Math.ceil(width / resolution);

    let currentHeight = 0;
    const targetHeight = height * 0.87;

    const waves = new Array(cols).fill(0);
    const velocities = new Array(cols).fill(0);

    function addDrip() {
        const x = Math.floor(Math.random() * cols);
        velocities[x] -= 25; // 💨 slightly stronger ripple
    }

    inkActive = true;

    // 💨 Drip faster — every 50ms (was 150ms)
    inkDripInterval = setInterval(() => {
        if (!inkActive) return;
        if (currentHeight < targetHeight) {
            currentHeight += height / 75; // 💨 fill faster (~2s total)
            addDrip();
        } else {
            clearInterval(inkDripInterval);
        }
    }, 50);

    function animate() {
        if (!inkActive) return;

        ctx.clearRect(0, 0, width, height);

        // Slightly faster wave propagation 💨
        for (let i = 0; i < cols; i++) {
            velocities[i] += ((waves[i - 1] ?? 0) + (waves[i + 1] ?? 0) - 2 * waves[i]) * 0.15;
            velocities[i] *= 0.87;
        }
        for (let i = 0; i < cols; i++) {
            waves[i] += velocities[i];
        }

        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let i = 0; i < cols; i++) {
            const x = i * resolution;
            const y = height - currentHeight + waves[i];
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        inkAnimationId = requestAnimationFrame(animate);
    }

    animate();
}


// ------------------ Stop Ink Animation ------------------
function stopDripAndHideContact() {
    inkActive = false;
    if (inkDripInterval) {
        clearInterval(inkDripInterval);
        inkDripInterval = null;
    }
    if (inkAnimationId) {
        cancelAnimationFrame(inkAnimationId);
        inkAnimationId = null;
    }

    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
        contactSection.style.display = 'none';
        const canvas = contactSection.querySelector('.ink-canvas');
        if (canvas) canvas.remove();
    }
}

// ------------------ Section Handling ------------------
function handleSectionClick(section) {
    stopDripAndHideContact();
    activeSection = section;
    container.classList.add('section-active');
    contentArea.innerHTML = getSectionContent(section);

    if (section === 'contact') {
        const contactSection = document.querySelector('.contact-section');
        contactSection.style.display = 'flex';
        startInkAnimation(contactSection);
    }
}

function closeSection() {
    stopDripAndHideContact();
    activeSection = null;
    container.classList.remove('section-active');
    contentArea.innerHTML = '';
}

// ------------------ Event Listeners ------------------
modeSwitch.addEventListener('click', toggleTheme);
closeButton.addEventListener('click', closeSection);

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.getAttribute('data-section');
        if (section === 'contact') {
            handleSectionClick('contact');
        } else {
            stopDripAndHideContact();
            handleSectionClick(section);
        }
    });
});

// ------------------ Init ------------------
initTheme();
