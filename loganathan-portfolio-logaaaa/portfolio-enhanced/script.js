// ============================================================
// PAGE LOADER
// ============================================================
window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }, 600);
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // MOBILE NAV
    // ============================================================
    // Handled via global functions below

    // Removed SCROLL PROGRESS BAR logic

    // ============================================================
    // CURSOR GLOW (desktop)
    // ============================================================
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow && window.innerWidth >= 1024) {
        document.addEventListener('mousemove', e => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    } else if (cursorGlow) {
        cursorGlow.style.display = 'none';
    }

    // ============================================================
    // BACK TO TOP
    // ============================================================
    const backToTop = document.getElementById('back-to-top');

    // ============================================================
    // Initialize tsParticles (Master Background)
    // ============================================================
    if (typeof tsParticles !== 'undefined') {
        tsParticles.load("particles-js", {
            particles: {
                number: { value: 30, density: { enable: true, value_area: 800 } },
                color: { value: "#00c3ff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#329bdd", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2.5, direction: "none", out_mode: "out" }
            },
            interactivity: {
                events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } },
                modes: { grab: { distance: 160 }, push: { particles_nb: 4 } }
            },
            retina_detect: true
        });
    }

    // ============================================================
    // THEME TOGGLE
    // ============================================================
    const themeIcon = document.querySelector('#theme-icon i');
    const body = document.body;
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    if (themeIcon) {
        themeIcon.onclick = () => {
            body.classList.toggle('light-mode');
            if (body.classList.contains('light-mode')) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'light');
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'dark');
            }
        };
    }

    // ============================================================
    // SCROLL SECTIONS ACTIVE LINK + STICKY NAV + BACK TO TOP
    // ============================================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');

    window.onscroll = () => {
        const scrollY = window.scrollY;

        sections.forEach(sec => {
            let offset = sec.offsetTop - 150;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');
            if (scrollY >= offset && scrollY < offset + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const target = document.querySelector('header nav a[href*=' + id + ']');
                    if (target) target.classList.add('active');
                });
            }
        });

        const header = document.querySelector('.header');
        if (header) header.classList.toggle('sticky', scrollY > 100);

        // Back to top removed in favor of fixed IG button

        // Removed leftover scroll progress logic
        // Close mobile nav on scroll
        closeMobileNav();

        // Animate skill bars when visible
        animateSkillBarsOnScroll();
    };

    // ============================================================
    // SCROLL REVEAL
    // ============================================================
    if (typeof ScrollReveal !== 'undefined') {
        ScrollReveal({ distance: '80px', duration: 2000, delay: 200 });
        ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
        ScrollReveal().reveal('.home-img, .skills-container, .projects-container, .contact-card-container', { origin: 'bottom' });
        ScrollReveal().reveal('.home-content h1, .about-img, .timeline-item.left', { origin: 'left' });
        ScrollReveal().reveal('.home-content h3, .home-content p, .about-content, .timeline-item.right', { origin: 'right' });
        ScrollReveal().reveal('.about-stats-grid', {
            origin: 'bottom',
            afterReveal: (el) => {
                el.querySelectorAll('.counter').forEach(animateCounter);
            }
        });
    }

    // ============================================================
    // TYPED JS
    // ============================================================
    if (document.querySelector('.multiple-text') && typeof Typed !== 'undefined') {
        new Typed('.multiple-text', {
            strings: ['Mobile Developer', 'Web Developer', 'AI Enthusiast', 'Data Scientist', 'Full Stack Dev'],
            typeSpeed: 100, backSpeed: 100, backDelay: 1000, loop: true
        });
    }

    // ============================================================
    // RESUME MODAL
    // ============================================================
    const resumeModal = document.getElementById('resumeModal');
    const viewResumeBtn = document.getElementById('view-resume-btn');
    const closeResume = document.querySelector('.close-resume');

    if (viewResumeBtn && resumeModal) {
        viewResumeBtn.onclick = () => {
            resumeModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        };
    }
    if (closeResume) {
        closeResume.onclick = () => {
            resumeModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    // ============================================================
    // CONTACT FORM — Firebase Save + Formspree
    // ============================================================
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.onsubmit = async (e) => {
            e.preventDefault();
            const data = new FormData(contactForm);
            const name = data.get('name');
            const email = data.get('email');
            const message = data.get('message');

            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.style.pointerEvents = 'none';
            submitBtn.style.opacity = '0.7';

            try {
                // Save to Firebase
                try {
                    const db = firebase.firestore();
                    await db.collection('messages').add({
                        name, email, message,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (fbErr) { /* Firebase not set up yet, skip */ }

                // Send via Formspree
                const response = await fetch(contactForm.action, {
                    method: 'POST', body: data, headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message sent successfully! 👍';
                    formStatus.classList.add('active');
                    submitBtn.innerHTML = 'Sent! <i class="fa-solid fa-check-double"></i>';
                    submitBtn.style.background = 'linear-gradient(90deg, #00eeff, #00ff88)';
                    submitBtn.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.4)';
                    contactForm.reset();
                    showToast('Message sent successfully!', 'success');
                    setTimeout(() => {
                        formStatus.classList.remove('active');
                        submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
                        submitBtn.style.background = '';
                        submitBtn.style.boxShadow = '';
                        submitBtn.style.pointerEvents = 'all';
                        submitBtn.style.opacity = '1';
                    }, 5000);
                } else { throw new Error(); }
            } catch (error) {
                formStatus.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Oops! Something went wrong.';
                formStatus.classList.add('active', 'error');
                submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
                submitBtn.style.pointerEvents = 'all';
                submitBtn.style.opacity = '1';
                setTimeout(() => formStatus.classList.remove('active', 'error'), 4000);
            }
        };
    }

    // ============================================================
    // COUNTER ANIMATION
    // ============================================================
    function animateCounter(el) {
        const duration = 2000;
        let start = null;
        const step = (ts) => {
            // Dynamically read target to handle async Firebase updates
            const target = parseInt(el.getAttribute('data-target')) || 0;
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const val = Math.floor(progress * target);
            el.innerText = target >= 1000 ? ((val / 1000).toFixed(1).replace('.0', '')) + 'k+' : val + '+';
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.innerText = target >= 1000 ? (target / 1000) + 'k+' : target + '+';
            }
        };
        requestAnimationFrame(step);
    }

    // ============================================================
    // SKILL BARS ANIMATION
    // ============================================================
    let skillBarsAnimated = false;
    function animateSkillBarsOnScroll() {
        if (skillBarsAnimated) return;
        const fills = document.querySelectorAll('.skill-bar-fill');
        if (!fills.length) return;
        const firstFill = fills[0].closest('.skill-progress-section');
        if (!firstFill) return;
        const rect = firstFill.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            fills.forEach(bar => { bar.style.width = bar.getAttribute('data-width') + '%'; });
            skillBarsAnimated = true;
        }
    }

    // ============================================================
    // CANVAS (Skills section canvas)
    // ============================================================
    const canvas = document.getElementById('skills-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // Subtle animated lines
        let particles = [];
        for (let i = 0; i < 20; i++) {
            particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5 });
        }
        function drawCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            });
            requestAnimationFrame(drawCanvas);
        }
        drawCanvas();
    }

    // ============================================================
    // LOAD DYNAMIC FIREBASE CONTENT
    // ============================================================
    async function loadDynamicPortfolioContent() {
        if (typeof firebase === 'undefined') return;
        try {
            const db = firebase.firestore();

            // Load Certificates
            const certGrid = document.querySelector('.cert-grid');
            if (certGrid) {
                const certsSnap = await db.collection('certificates').get();
                if (!certsSnap.empty) {
                    let certsData = [];
                    certsSnap.forEach(doc => certsData.push({ id: doc.id, ...doc.data() }));

                    // Sort by order field, fallback to createdAt
                    certsData.sort((a, b) => {
                        const orderA = a.order !== undefined ? a.order : (a.createdAt?.seconds || 0);
                        const orderB = b.order !== undefined ? b.order : (b.createdAt?.seconds || 0);
                        return orderA - orderB;
                    });

                    let visibleHtml = '';
                    let hiddenHtml = '';
                    let count = 0;

                    certsData.forEach(d => {
                        let iconHTML = '';
                        if (d.iconClass) {
                            if (d.iconClass.startsWith('http') || d.iconClass.startsWith('assets/') || d.iconClass.includes('.')) {
                                iconHTML = `<img src="${esc(d.iconClass)}" alt="icon" style="width:26px;height:26px;border-radius:4px;object-fit:contain;margin-right:8px;background:var(--bg);padding:2px;">`;
                            } else {
                                iconHTML = `<i class="${esc(d.iconClass)}" style="font-size:1.4rem;color:var(--accent);margin-right:10px;"></i>`;
                            }
                        } else {
                            if (d.name.toLowerCase().includes('html')) iconHTML = '<i class="fa-brands fa-html5 html-icon"></i>';
                            else if (d.name.toLowerCase().includes('css')) iconHTML = '<i class="fa-brands fa-css3-alt css-icon"></i>';
                            else if (d.name.toLowerCase().includes('javascript') || d.name.toLowerCase().includes('js')) iconHTML = '<i class="fa-brands fa-js-square js-icon"></i>';
                            else if (d.name.toLowerCase().includes('cyber') || d.name.toLowerCase().includes('security')) iconHTML = '<i class="fa-solid fa-shield-halved cyber-icon"></i>';
                            else if (d.name.toLowerCase().includes('stat')) iconHTML = '<i class="fa-solid fa-clock stats-icon"></i>';
                            else iconHTML = '<i class="fa-solid fa-award award-icon"></i>';
                        }

                        const cardHtml = `
                            <div class="cert-card cert-professional">
                                <div class="cert-card-img">
                                    ${d.imageUrl ? `<img src="${esc(d.imageUrl)}" alt="${esc(d.name)}">` : `<div style="width:100%; height:100%; min-height:200px; display:flex; align-items:center; justify-content:center; background:var(--second-bg-color); border-bottom:1px solid rgba(0, 238, 255, 0.1);"><i class="fa-solid fa-award" style="font-size:4rem; color:var(--main-color); opacity:0.5; filter:drop-shadow(0 0 10px var(--main-color));"></i></div>`}
                                    <div class="scan-line"></div>
                                    <div class="verified-badge"><i class="fa-solid fa-circle-check"></i> VERIFIED</div>
                                </div>
                                <div class="cert-card-info">
                                    <div class="cert-title-row">${iconHTML}<h4>${esc(d.name)}</h4></div>
                                    <p class="cert-desc">${esc(d.issuer)}</p>
                                    ${d.link ? `<a href="${esc(d.link)}" target="_blank" class="view-cert-btn">View Certificate <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                                </div>
                            </div>
                        `;

                        if (count < 6) {
                            visibleHtml += cardHtml;
                        } else {
                            hiddenHtml += cardHtml;
                        }
                        count++;
                    });

                    certGrid.innerHTML = visibleHtml;

                    // If there are more than 6, add the 'View All' button and hidden container
                    if (count > 6) {
                        const hiddenContainer = document.createElement('div');
                        hiddenContainer.className = 'cert-grid';
                        hiddenContainer.style.display = 'none';
                        hiddenContainer.style.marginTop = '3rem'; // Match grid gap
                        hiddenContainer.innerHTML = hiddenHtml;

                        const btnContainer = document.createElement('div');
                        btnContainer.style.textAlign = 'center';
                        btnContainer.style.marginTop = '40px';
                        btnContainer.style.width = '100%';

                        const viewAllBtn = document.createElement('button');
                        viewAllBtn.className = 'btn-view-all';
                        viewAllBtn.innerHTML = '🎓 View All Certificates';
                        viewAllBtn.style.background = 'linear-gradient(to right, #1fa2ff, #7b2cbf)';
                        viewAllBtn.style.border = 'none';
                        viewAllBtn.style.cursor = 'pointer';

                        viewAllBtn.onclick = () => {
                            hiddenContainer.style.display = 'grid'; // .cert-grid is a grid
                            btnContainer.style.display = 'none';
                        };

                        btnContainer.appendChild(viewAllBtn);

                        // Insert after the main certGrid
                        certGrid.insertAdjacentElement('afterend', hiddenContainer);
                        hiddenContainer.insertAdjacentElement('afterend', btnContainer);
                    }
                }
            }

            // Load Projects
            const projGrid = document.querySelector('.projects-container');
            if (projGrid) {
                const projsSnap = await db.collection('projects').orderBy('createdAt', 'asc').get();
                if (!projsSnap.empty) {
                    let html = '';
                    projsSnap.forEach(doc => {
                        const d = doc.data();
                        html += `
                            <div class="project-card glass-card">
                                <div class="project-card-top">
                                    ${d.imageUrl ? `<img src="${esc(d.imageUrl)}" alt="${esc(d.name)}">` : `<div style="width:100%; height:100%; min-height:220px; display:flex; align-items:center; justify-content:center; background:var(--second-bg-color); border-bottom:1px solid rgba(0, 238, 255, 0.1);"><i class="fa-solid fa-laptop-code" style="font-size:5rem; color:var(--main-color); opacity:0.5; filter:drop-shadow(0 0 10px var(--main-color));"></i></div>`}
                                    <div class="project-hover-layer">
                                        ${d.url ? `<a href="${esc(d.url)}" target="_blank" class="live-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live View</a>` : ''}
                                    </div>
                                </div>
                                <div class="project-card-bottom">
                                    <h4>${esc(d.name)}</h4>
                                    <p>${esc(d.desc)}</p>
                                </div>
                            </div>
                        `;
                    });
                    projGrid.innerHTML = html;
                }
            }

            // Load Education
            const eduTimeline = document.querySelector('.timeline');
            if (eduTimeline) {
                const eduSnap = await db.collection('education').orderBy('order', 'desc').get();
                if (!eduSnap.empty) {
                    let html = '<div class="timeline-line"></div>';
                    let isLeft = true;
                    eduSnap.forEach(doc => {
                        const d = doc.data();
                        let pointsHtml = '';
                        if (d.points && d.points.length > 0) {
                            pointsHtml = '<ul class="check-list-simple">' + d.points.map(p => `<li>${esc(p)}</li>`).join('') + '</ul>';
                        }

                        html += `
                            <div class="timeline-item ${isLeft ? 'left' : 'right'}">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content card-dark">
                                    <h3 class="cyan-text">${esc(d.degree)}</h3>
                                    <p class="institution">${esc(d.institution)} | ${esc(d.year)}</p>
                                    ${pointsHtml}
                                </div>
                            </div>
                        `;
                        isLeft = !isLeft;
                    });
                    eduTimeline.innerHTML = html;
                }
            }

            // Load Reviews
            const reviewsContainer = document.getElementById('reviews-container');
            if (reviewsContainer) {
                const revSnap = await db.collection('reviews').orderBy('timestamp', 'asc').get();
                if (!revSnap.empty) {
                    let html = '';
                    revSnap.forEach(doc => {
                        const d = doc.data();
                        const initials = d.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        html += `
                        <div class="review-card">
                            <i class="fa-solid fa-quote-right quote-icon"></i>
                            <p class="review-text">"${esc(d.text)}"</p>
                            <div class="reviewer-info">
                                <div class="reviewer-avatar" style="color: #000;">${initials}</div>
                                <div class="reviewer-details">
                                    <h4>${esc(d.name)}</h4>
                                    <span>${esc(d.title)}</span>
                                </div>
                            </div>
                        </div>`;
                    });
                    reviewsContainer.innerHTML = html;
                } else {
                    reviewsContainer.innerHTML = '<div style="text-align: center; width: 100%; color: var(--muted);"><i class="fa-regular fa-comments"></i> No reviews available yet.</div>';
                }
            }

            // Load Footer Settings
            const footerDoc = await db.collection('settings').doc('footer').get();
            if (footerDoc.exists) {
                const fd = footerDoc.data();

                // Description
                if (fd.description) {
                    const descEl = document.querySelector('.footer-grid .footer-section:nth-child(1) p');
                    if (descEl) descEl.textContent = fd.description;
                }

                // Social Links in Footer
                if (fd.github) document.querySelector('.footer-socials a[href*="github.com"]')?.setAttribute('href', fd.github);
                if (fd.linkedin) document.querySelector('.footer-socials a[href*="linkedin.com"]')?.setAttribute('href', fd.linkedin);
                if (fd.instagram) document.querySelector('.footer-socials a[href*="instagram.com"]')?.setAttribute('href', fd.instagram);
                if (fd.whatsapp) document.querySelector('.footer-socials a[href*="wa.me"]')?.setAttribute('href', fd.whatsapp);

                // Copyright
                if (fd.copyright) {
                    const copyEl = document.querySelector('.footer-bottom p');
                    if (copyEl) {
                        copyEl.innerHTML = esc(fd.copyright);
                    }
                }
            }

            // Load Profile Settings
            const profileDoc = await db.collection('settings').doc('profile').get();
            if (profileDoc.exists) {
                const pd = profileDoc.data();

                // Update text fields if available
                if (pd.name) {
                    const heroName = document.querySelector('.home-content h1');
                    if (heroName) heroName.innerHTML = `Hi, I'm <span>${esc(pd.name)}</span>`;
                    const aboutName = document.querySelector('.about-content h3');
                    if (aboutName) aboutName.textContent = esc(pd.name);
                    const logoName = document.querySelector('.logo');
                    if (logoName) {
                        const imgNode = logoName.querySelector('img');
                        const imgSrc = imgNode ? imgNode.src : 'assets/img/Blue_Modern_Computer_Technology_Logo-removebg-preview.png';
                        const firstPart = esc(pd.name.split(' ')[0] || '');
                        const secondPart = pd.name.split(' ')[1] ? `.${esc(pd.name.split(' ')[1])}` : '';

                        logoName.innerHTML = `<img src="${imgSrc}" alt="Logo"><span style="white-space:nowrap">${firstPart}<span style="color:var(--main-color)">${secondPart}</span></span>`;
                    }

                    const footerLogo = document.querySelector('.footer-section h2');
                    if (footerLogo) {
                        const firstPart = esc(pd.name.split(' ')[0] || '');
                        const secondPart = pd.name.split(' ')[1] ? `.${esc(pd.name.split(' ')[1])}` : '';
                        footerLogo.innerHTML = `<span style="white-space:nowrap">${firstPart}<span style="color:var(--main-color)">${secondPart}</span></span>`;
                    }
                }

                if (pd.title) {
                    const homeTitle = document.querySelector('.text-animate h3');
                    if (homeTitle) homeTitle.textContent = esc(pd.title);
                    const aboutTitle = document.querySelector('.about-content h4');
                    if (aboutTitle) aboutTitle.innerHTML = `${esc(pd.title)} <span>& Developer</span>`;
                }

                if (pd.about) {
                    const aboutP = document.querySelector('.about-content p');
                    if (aboutP) aboutP.innerHTML = pd.about;
                }

                // Update Footer Contact Info from Profile
                const footerContactList = document.querySelectorAll('.footer-contact-list li');
                if (footerContactList.length >= 3) {
                    if (pd.location) footerContactList[0].innerHTML = `<i class="fa-solid fa-location-dot"></i> ${esc(pd.location)}`;
                    if (pd.phone) footerContactList[1].innerHTML = `<i class="fa-solid fa-phone"></i> ${esc(pd.phone)}`;
                    if (pd.email) footerContactList[2].innerHTML = `<i class="fa-solid fa-envelope"></i> ${esc(pd.email)}`;
                }

                // Update Stats from Profile
                const parseStatValue = (str) => {
                    if (!str) return 0;
                    let s = String(str).toLowerCase().trim();
                    let num = parseFloat(s) || 0;
                    if (s.includes('k')) num *= 1000;
                    if (s.includes('m')) num *= 1000000;
                    return num;
                };

                if (pd.stat1_name) document.getElementById('stat-1-text').innerText = pd.stat1_name;
                if (pd.stat1_value !== undefined) {
                    const val1 = parseStatValue(pd.stat1_value);
                    const el = document.getElementById('stat-1-num');
                    el.setAttribute('data-target', val1);
                    el.innerText = val1 >= 1000 ? (val1 / 1000) + 'k+' : val1 + '+';
                }
                if (pd.stat2_name) document.getElementById('stat-2-text').innerText = pd.stat2_name;
                if (pd.stat2_value !== undefined) {
                    const val2 = parseStatValue(pd.stat2_value);
                    const el = document.getElementById('stat-2-num');
                    el.setAttribute('data-target', val2);
                    el.innerText = val2 >= 1000 ? (val2 / 1000) + 'k+' : val2 + '+';
                }
                if (pd.stat3_name) document.getElementById('stat-3-text').innerText = pd.stat3_name;
                if (pd.stat3_value !== undefined) {
                    const val3 = parseStatValue(pd.stat3_value);
                    const el = document.getElementById('stat-3-num');
                    el.setAttribute('data-target', val3);
                    el.innerText = val3 >= 1000 ? (val3 / 1000) + 'k+' : val3 + '+';
                }

                // Update Contact Section info from Profile
                if (pd.email) document.querySelector('.contact-info .contact-card:nth-child(1) p')?.setAttribute('textContent', pd.email);
                if (pd.phone) document.querySelector('.contact-info .contact-card:nth-child(2) p')?.setAttribute('textContent', pd.phone);

                // Update Images
                if (pd.hero_photo) {
                    const heroImg = document.querySelector('.home-img .img-box img');
                    if (heroImg) heroImg.src = pd.hero_photo;
                }
                if (pd.about_photo) {
                    const aboutImg = document.querySelector('.about-img img');
                    if (aboutImg) aboutImg.src = pd.about_photo;
                }
            }

        } catch (e) { console.error('Dynamic load error:', e); }
    }

    function esc(str) {
        if (!str) return '';
        return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    loadDynamicPortfolioContent();

    // ============================================================
    // VISITOR TRACKING (FIREBASE + IPAPI)
    // ============================================================
    async function recordVisitor() {
        if (typeof firebase === 'undefined') return;
        const lastVisit = localStorage.getItem('last_visit_timestamp');
        const now = Date.now();
        // Prevent spamming API: Only track once every 1 minute per device for testing
        if (lastVisit && (now - parseInt(lastVisit) < 60000)) return;

        let locationData = {
            ip: 'Unknown', city: 'Unknown', region: 'Unknown',
            country_name: 'Unknown', country_code: '',
            latitude: 0, longitude: 0, org: 'Unknown'
        };

        try {
            // Attempt 1: freeipapi.com (No cloudflare blocks)
            const res = await fetch('https://freeipapi.com/api/json');
            const data = await res.json();
            if (data && data.ipAddress) {
                locationData = {
                    ip: data.ipAddress,
                    city: data.cityName || 'Unknown',
                    region: data.regionName || 'Unknown',
                    country_name: data.countryName || 'Unknown',
                    country_code: data.countryCode || '',
                    latitude: data.latitude || 0,
                    longitude: data.longitude || 0,
                    org: data.asnOrganization || 'Unknown'
                };
            } else {
                throw new Error('Fallback');
            }
        } catch (e) {
            try {
                // Attempt 2: ipinfo.io
                const res = await fetch('https://ipinfo.io/json');
                const data = await res.json();
                if (data && data.ip) {
                    const loc = data.loc ? data.loc.split(',') : [0, 0];
                    locationData = {
                        ip: data.ip,
                        city: data.city || 'Unknown',
                        region: data.region || 'Unknown',
                        country_name: data.country || 'Unknown',
                        country_code: data.country || '',
                        latitude: parseFloat(loc[0]) || 0,
                        longitude: parseFloat(loc[1]) || 0,
                        org: data.org || 'Unknown'
                    };
                }
            } catch (err) {
                console.log('Location APIs blocked, logging standard visitor data anyway.');
            }
        } // <-- Added missing closing brace

        try {
            const db = firebase.firestore();
            await db.collection('visitors').add({
                ip: locationData.ip,
                city: locationData.city || 'Unknown',
                region: locationData.region || 'Unknown',
                country: locationData.country_name || 'Unknown',
                countryCode: locationData.country_code || '',
                latitude: locationData.latitude || 0,
                longitude: locationData.longitude || 0,
                org: locationData.org || 'Unknown',
                userAgent: navigator.userAgent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            localStorage.setItem('last_visit_timestamp', now.toString());
        } catch (e) {
            console.log('Failed to write visitor to Firestore.');
        }
    }

    // Slight delay to not block main thread rendering
    setTimeout(recordVisitor, 2000);
});

// ============================================================
// MOBILE NAV GLOBAL FUNCTIONS
// ============================================================
function toggleMobileNav() {
    const navbar = document.getElementById('navbar');
    const overlay = document.getElementById('mobile-overlay');
    navbar.classList.toggle('active');
    overlay.classList.toggle('show');
    document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
}

function closeMobileNav() {
    const navbar = document.getElementById('navbar');
    const overlay = document.getElementById('mobile-overlay');
    if (navbar) navbar.classList.remove('active');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Close nav on link click
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
}

// ============================================================
// PROJECT MODAL
// ============================================================
const projectData = {
    project_hub: { title: "Project Ecosystem Hub", desc: "A centralized, high-performance portal showcasing my collection of AI systems and immersive web applications.", steps: ["Step 1: Open the Hub.", "Step 2: Explore Masterpieces.", "Step 3: Try Live Demos.", "Step 4: View Source."], link: "https://project.loganathanm.in/" },
    learning: { title: "Learning Platform", desc: "An immersive educational ecosystem designed to redefine online learning.", steps: ["Step 1: Open the Platform.", "Step 2: Sign Up Profile.", "Step 3: Access HD Videos.", "Step 4: Track Progress."], link: "https://learn.loganathanm.in/" },
    healthcare: { title: "Healthcare Portal", desc: "A next-gen medical dashboard with high-security data compliance.", steps: ["Step 1: Secure Login.", "Step 2: Vitals Tracking.", "Step 3: Appointment Hub.", "Step 4: Digital Reports."], link: "https://healthcare.loganathanm.in/" },
    language: { title: "Language App", desc: "Linguistic tool leveraging smart algorithms for language mastery.", steps: ["Step 1: Choose Language.", "Step 2: Daily Fluency Goals.", "Step 3: AI Practice Sessions.", "Step 4: Leaderboard Status."], link: "https://ling.loganathanm.in/" },
    exampro: { title: "ExamPro DSU", desc: "ExamPro DSU is an advanced online examination platform transforming campus education digitally. Secure, automated, and analytical.", steps: ["Step 1: Open Homepage.", "Step 2: Login as Admin/Student.", "Step 3: Dashboard View.", "Step 4: MCQ Creation.", "Step 5: Attend Exam.", "Step 6: Auto Evaluation.", "Step 7: Analytics.", "Step 8: Save Time."], link: "https://dsu.loganathanm.in/" },
    chatbot: { title: "Xyntra AI Chat", desc: "Intelligent AI simulating human conversation using NLP.", steps: ["Step 1: Open interface.", "Step 2: Type Message.", "Step 3: AI Response.", "Step 4: 24/7 Availability.", "Step 5: Processing."], link: "https://share.google/vKPAHlGLL3HRZXxN8" },
    weather: { title: "Weather Analysis", desc: "Real-time weather data visualization using APIs.", steps: ["Step 1: Open Dashboard.", "Step 2: Enter City.", "Step 3: Charts.", "Step 4: Forecasts."], link: "https://weather-analysis-6.onrender.com/" },
    javachat: { title: "Java Chat App", desc: "Real-time messaging with Java infrastructure.", steps: ["Step 1: Open App.", "Step 2: Register.", "Step 3: Messaging.", "Step 4: Voice Messaging."], link: "https://www.loganathanm.in/" },
    faceexam: { title: "AI Proctor", desc: "Facial recognition proctoring system.", steps: ["Step 1: Launch Proctor.", "Step 2: Calibration.", "Step 3: Recognition.", "Step 4: Fraud Detection."], link: "https://www.loganathanm.in/" },
    memegen: { title: "AI Meme Gen", desc: "AI-generated humorous captions for templates.", steps: ["Step 1: Open App.", "Step 2: Choose Template.", "Step 3: AI Captions.", "Step 4: Download/Share."], link: "https://www.loganathanm.in/" },
    attendance: { title: "AI Attendance", desc: "Automated attendance via facial recognition.", steps: ["Step 1: Setup Kiosk.", "Step 2: Registration.", "Step 3: Checkin.", "Step 4: Reports."], link: "https://www.loganathanm.in/" }
};

function openModal(projectId) {
    const modal = document.getElementById("projectModal");
    const modalBody = document.getElementById("modalBody");
    const data = projectData[projectId];
    if (!data) return;
    modalBody.innerHTML = `
        <h3>${data.title}</h3>
        <div class="modal-desc">${data.desc}</div>
        <h4>How to Use (Step-by-Step Explanation)</h4>
        <ul>
            ${data.steps.map(s => `<li>${s.includes(':') ? `<strong>${s.split(':')[0]}:</strong>${s.split(':')[1]}` : s}</li>`).join('')}
        </ul>
        <a href="${data.link}" target="_blank" class="launch-btn">Launch Platform</a>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    document.querySelector(".close-modal").onclick = () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    };
}

window.onclick = (e) => {
    const projectModal = document.getElementById("projectModal");
    const resumeModal = document.getElementById("resumeModal");
    if (e.target == projectModal) { projectModal.style.display = "none"; document.body.style.overflow = "auto"; }
    if (e.target == resumeModal) { resumeModal.style.display = "none"; document.body.style.overflow = "auto"; }
};

// Escape key closes modals
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        ['projectModal', 'resumeModal'].forEach(id => {
            const m = document.getElementById(id);
            if (m && m.style.display === 'block') { m.style.display = 'none'; document.body.style.overflow = 'auto'; }
        });
    }
});

// ==========================================
// GITHUB PROJECTS FETCHER
// ==========================================
async function loadGithubProjects() {
    const btn = document.getElementById('btn-load-github');
    const section = document.getElementById('github-projects');
    const grid = document.getElementById('github-grid');

    // Local escape function to prevent ReferenceError
    const escapeHTML = (str) => {
        if (!str) return '';
        return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    if (btn) btn.style.display = 'none'; // Hide button after clicking
    if (section) section.style.display = 'block'; // Show section

    try {
        const username = 'LOGANATHAN2008';
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`);
        if (!response.ok) throw new Error('Failed to fetch from GitHub API');

        const repos = await response.json();

        if (repos.length === 0) {
            grid.innerHTML = '<div style="text-align: center; width: 100%; color: var(--muted);">No repositories found.</div>';
            return;
        }

        let html = '';
        repos.forEach(repo => {
            const desc = repo.description || 'No description available.';
            const lang = repo.language || 'Code';

            html += `
            <a href="${repo.html_url}" target="_blank" class="github-card">
                <div class="gh-card-top">
                    <i class="fa-solid fa-folder gh-folder"></i>
                    <div class="gh-stats">
                        <span><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fa-solid fa-code-branch"></i> ${repo.forks_count}</span>
                    </div>
                </div>
                <h4 class="gh-title">${escapeHTML(repo.name)}</h4>
                <p class="gh-desc">${escapeHTML(desc)}</p>
                <div class="gh-card-bottom">
                    <div class="gh-lang">
                        <span class="gh-lang-dot"></span> ${escapeHTML(lang)}
                    </div>
                    <i class="fa-brands fa-github gh-link"></i>
                </div>
            </a>`;
        });

        grid.innerHTML = html;

    } catch (error) {
        console.error("GitHub API Error:", error);
        grid.innerHTML = `<div style="text-align: center; width: 100%; color: var(--red);"><i class="fa-solid fa-triangle-exclamation"></i> Could not load GitHub projects. Try again later.</div>`;
    }
}

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

