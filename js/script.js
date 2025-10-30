// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');

if (menuToggle) {
    menuToggle.setAttribute('aria-controls', 'navLinks');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!expanded));
        navLinks.classList.toggle('active');
    });
}

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Theme toggle
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
        const isDark = theme === 'dark';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดกลางคืน');
    }
}

function initTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') {
            applyTheme(saved);
            return;
        }
    } catch(e) {}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
}

initTheme();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('theme', next); } catch(e) {}
    });
}

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('ขอบคุณสำหรับข้อความของคุณ! (นี่เป็นเพียงตัวอย่าง)');
    });
}

// Calendar replaced by Google Calendar embed (no JS required)
// Carousel scroll function
function scrollCarousel(carouselId, direction) {
    const carousel = document.getElementById(`${carouselId}-carousel`);
    if (!carousel) return;
    
    const scrollAmount = 250; // ระยะเลื่อนต่อครั้ง (ค่าเริ่มต้น)
    const currentScroll = carousel.scrollLeft;
    
    carousel.scrollTo({
        left: currentScroll + (direction * scrollAmount),
        behavior: 'smooth'
    });
}

// Enhance carousel usability: keyboard + drag + touch
function initCarousels() {
    const AUTO_ONLY = false; // เลื่อนแบบปกติ (ไม่ auto)
    const INFINITE = false;  // ไม่โคลนการ์ด (ไม่วนด้วยการโคลน)
    const AUTO_SPEED_PX_PER_SEC = 10; // ไม่ถูกใช้เมื่อ AUTO_ONLY=false
    document.querySelectorAll('.tools-carousel').forEach(carousel => {
        // Infinite wrap (ปิดไว้ให้เหมือนจุดเริ่มต้น)
        if (INFINITE && !carousel.dataset.infiniteInitialized) {
            const originalChildren = Array.from(carousel.children);
            if (originalChildren.length > 0) {
                // Base width before any clones
                const baseWidth = carousel.scrollWidth;
                const copiesBefore = 2; // buffer size (left)
                const copiesAfter = 2;  // buffer size (right)

                const buildCloneSet = () => {
                    const frag = document.createDocumentFragment();
                    originalChildren.forEach(node => {
                        const clone = node.cloneNode(true);
                        clone.setAttribute('aria-hidden', 'true');
                        clone.tabIndex = -1;
                        frag.appendChild(clone);
                    });
                    return frag;
                };

                // Prepend and append buffers
                for (let i = 0; i < copiesBefore; i++) {
                    carousel.insertBefore(buildCloneSet(), carousel.firstChild);
                }
                for (let i = 0; i < copiesAfter; i++) {
                    carousel.appendChild(buildCloneSet());
                }

                carousel.dataset.infiniteOriginalWidth = String(baseWidth);
                carousel.dataset.infiniteBefore = String(copiesBefore);
                carousel.dataset.infiniteAfter = String(copiesAfter);

                // Start centered at the first original set (after left buffer)
                carousel.classList.add('no-snap');
                requestAnimationFrame(() => {
                    carousel.scrollLeft = baseWidth * copiesBefore;
                    carousel.classList.remove('no-snap');
                });

                // Recenter when approaching edges (far from visible edges to avoid noticeable jumps)
                let ticking = false;
                carousel.addEventListener('scroll', () => {
                    if (ticking) return;
                    ticking = true;
                    requestAnimationFrame(() => {
                        const base = Number(carousel.dataset.infiniteOriginalWidth || 0);
                        const before = Number(carousel.dataset.infiniteBefore || 0);
                        if (!base) { ticking = false; return; }
                        const x = carousel.scrollLeft;
                        const leftThreshold = base * (before - 0.5);
                        const rightThreshold = base * (before + 1.5);
                        if (x < leftThreshold) {
                            carousel.classList.add('no-snap');
                            carousel.scrollLeft = x + base;
                            requestAnimationFrame(() => carousel.classList.remove('no-snap'));
                        } else if (x > rightThreshold) {
                            carousel.classList.add('no-snap');
                            carousel.scrollLeft = x - base;
                            requestAnimationFrame(() => carousel.classList.remove('no-snap'));
                        }
                        ticking = false;
                    });
                }, { passive: true });

                carousel.dataset.infiniteInitialized = '1';
            }
        }
        if (AUTO_ONLY) {
            // Disable manual scroll interactions
            carousel.setAttribute('tabindex', '-1');
            const block = (e) => e.preventDefault();
            carousel.addEventListener('wheel', block, { passive: false });
            carousel.addEventListener('touchstart', block, { passive: false });
            carousel.addEventListener('touchmove', block, { passive: false });
            carousel.addEventListener('mousedown', block);
            // Disable snap during continuous auto scroll so motion isn't resisted
            carousel.classList.add('no-snap');

            // Auto-scroll loop
            if (!carousel.dataset.autoScroll) {
                let last = null;
                const tick = (ts) => {
                    if (last == null) last = ts;
                    const dt = (ts - last) / 1000;
                    last = ts;
                    carousel.scrollLeft += AUTO_SPEED_PX_PER_SEC * dt;
                    requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                carousel.dataset.autoScroll = '1';
            }
        } else {
            // Keep keyboard + drag controls (legacy path)
            if (!carousel.hasAttribute('tabindex')) carousel.setAttribute('tabindex', '0');
            const KEY_STEP = 250; // ระยะเลื่อนต่อครั้งด้วยคีย์บอร์ด (ค่าเริ่มต้น)
            carousel.addEventListener('keydown', (e) => {
                const key = e.key;
                if (key === 'ArrowLeft') {
                    e.preventDefault();
                    carousel.scrollBy({ left: -KEY_STEP, behavior: 'smooth' });
                } else if (key === 'ArrowRight') {
                    e.preventDefault();
                    carousel.scrollBy({ left: KEY_STEP, behavior: 'smooth' });
                } else if (key === 'Home') {
                    e.preventDefault();
                    carousel.scrollTo({ left: 0, behavior: 'smooth' });
                } else if (key === 'End') {
                    e.preventDefault();
                    carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
                }
            });

            let isDown = false;
            let startX;
            let scrollLeft;
            const startDrag = (pageX) => {
                isDown = true;
                carousel.style.cursor = 'grabbing';
                startX = pageX - carousel.offsetLeft;
                scrollLeft = carousel.scrollLeft;
                document.body.classList.add('no-select');
            };
            const moveDrag = (pageX) => {
                if (!isDown) return;
                const x = pageX - carousel.offsetLeft;
                const walk = (x - startX) * 2; // ความไวการลากตามค่าเริ่มต้นเดิม
                carousel.scrollLeft = scrollLeft - walk;
            };
            const endDrag = () => {
                isDown = false;
                carousel.style.cursor = 'grab';
                document.body.classList.remove('no-select');
            };
            carousel.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.pageX); });
            carousel.addEventListener('mouseleave', endDrag);
            carousel.addEventListener('mouseup', endDrag);
            carousel.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); moveDrag(e.pageX); });
            carousel.addEventListener('touchstart', (e) => { if (e.touches && e.touches.length > 0) startDrag(e.touches[0].pageX); }, { passive: true });
            carousel.addEventListener('touchmove', (e) => { if (e.touches && e.touches.length > 0) moveDrag(e.touches[0].pageX); }, { passive: true });
            carousel.addEventListener('touchend', endDrag, { passive: true });
            carousel.style.cursor = 'grab';
        }
    });
}

// Initialize enhanced carousels after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
} else {
    initCarousels();
}

// Animate skill bars only when visible
(function initSkillsObserver() {
    const skillsBars = document.querySelector('#skills .skills-bars');
    if (!skillsBars || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillsBars.classList.add('animate');
                observer.disconnect();
            }
        });
    }, { threshold: 0.2 });
    observer.observe(skillsBars);
})();

// Prefetch project pages on hover/focus to speed navigation
(function prefetchProjects() {
    const prefetched = new Set();
    const addPrefetch = (href) => {
        if (!href || prefetched.has(href)) return;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'document';
        link.href = href;
        document.head.appendChild(link);
        prefetched.add(href);
    };
    document.querySelectorAll('.projects-grid a.project-card').forEach(a => {
        a.addEventListener('mouseenter', () => addPrefetch(a.href));
        a.addEventListener('focus', () => addPrefetch(a.href));
        a.addEventListener('touchstart', () => addPrefetch(a.href), { passive: true });
    });
})();

// Basic copy protection: block selection/copy on non-editable areas
(function protectCopy() {
    const isEditable = (el) => !!(el && (el.closest('input, textarea, [contenteditable="true"], .allow-select')));
    // Add no-copy class to body
    if (document.body) document.body.classList.add('no-copy');
    else document.addEventListener('DOMContentLoaded', () => document.body.classList.add('no-copy'));

    // Block context menu except on editable areas
    document.addEventListener('contextmenu', (e) => {
        if (!isEditable(e.target)) e.preventDefault();
    });

    // Block copy/cut/paste events on non-editable
    ['copy','cut','paste'].forEach(type => {
        document.addEventListener(type, (e) => {
            if (!isEditable(e.target)) e.preventDefault();
        });
    });

    // Block selection start and drag start on non-editable
    document.addEventListener('selectstart', (e) => {
        if (!isEditable(e.target)) e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
        if (!isEditable(e.target)) e.preventDefault();
    });

    // Block common shortcut keys (Ctrl/Cmd + C/X/A/S/P) outside editable
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && ['c','x','a','s','p'].includes(key) && !isEditable(e.target)) {
            e.preventDefault();
        }
    });
})();


// Tracker admin/view-only permission layer
(function secureTrackerPermissions(){ return;
    const root = document.getElementById('tracker');
    if (!root) return;
    const headerEl = root.querySelector('.tracker-header');
    const form = root.querySelector('.tracker-form');
    const listEl = root.querySelector('.tracker-list');

    // Set your admin code here
    const TRACKER_ADMIN_CODE = 'kumaxx7'; // TODO: change to your secret
    const ADMIN_FLAG_KEY = 'tracker:admin';
    const isAdmin = () => localStorage.getItem(ADMIN_FLAG_KEY) === '1';
    const setAdmin = (on) => { try { localStorage.setItem(ADMIN_FLAG_KEY, on ? '1' : '0'); } catch {} };

    // Controls
    const controls = document.createElement('div');
    controls.className = 'tracker-admin-controls';
    controls.innerHTML = '<button type="button" class="tracker-admin-login">เข้าสู่โหมด Admin</button>' +
                         '<button type="button" class="tracker-admin-logout" style="display:none">ออกจากโหมด Admin</button>';
    headerEl && headerEl.appendChild(controls);
    const loginBtn = controls.querySelector('.tracker-admin-login');
    const logoutBtn = controls.querySelector('.tracker-admin-logout');
    loginBtn.addEventListener('click', () => {
        if (!TRACKER_ADMIN_CODE || TRACKER_ADMIN_CODE === 'kumaxx7') {
            alert('ยังไม่ได้ตั้งค่าโค้ด Admin ในไฟล์ script.js (TRACKER_ADMIN_CODE)');
            return;
        }
        const code = prompt('กรุณาใส่โค้ด Admin');
        if (code === TRACKER_ADMIN_CODE) { setAdmin(true); applyPermissions(); }
        else alert('โค้ดไม่ถูกต้อง');
    });
    logoutBtn.addEventListener('click', () => { setAdmin(false); applyPermissions(); });

    function applyPermissions(){
        const admin = isAdmin();
        if (form) form.style.display = admin ? '' : 'none';
        loginBtn.style.display = admin ? 'none' : '';
        logoutBtn.style.display = admin ? '' : 'none';
        hideActionControls(!admin);
    }

    function hideActionControls(hide){
        if (!listEl) return;
        listEl.querySelectorAll('input[type="checkbox"]').forEach(el=>{ el.style.display = hide ? 'none' : ''; });
        listEl.querySelectorAll('.tracker-actions').forEach(el=>{ el.style.display = hide ? 'none' : ''; });
    }

    // Prevent actions for non-admin (capture-phase)
    if (form) form.addEventListener('submit', (e)=>{ if(!isAdmin()){ e.preventDefault(); e.stopImmediatePropagation(); }}, true);
    if (listEl) listEl.addEventListener('click', (e)=>{
        if (!isAdmin()) {
            if (e.target.closest('input[type="checkbox"], .btn-done, .btn-undo, .btn-del')) {
                e.preventDefault(); e.stopImmediatePropagation();
            }
        }
    }, true);

    // Observe list changes to re-apply hiding for view-only
    if (listEl) {
        const mo = new MutationObserver(()=> hideActionControls(!isAdmin()));
        mo.observe(listEl, { childList: true, subtree: true });
    }

    applyPermissions();
})();
// Back-to-top button
(function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const toggleBtn = () => {
        const threshold = 300; // px scrolled before showing
        if (window.scrollY > threshold) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    };

    window.addEventListener('scroll', toggleBtn, { passive: true });
    // Run once on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', toggleBtn);
    } else {
        toggleBtn();
    }

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();




// Simple hero slider dots + snapping for project pages
(function initHeroSlider(){
    const slider = document.getElementById('heroSlider');
    const dotsWrap = document.getElementById('heroDots');
    if (!slider || !dotsWrap) return;
    const slides = Array.from(slider.querySelectorAll('.hero-slide-card'));
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'hero-dot' + (i===0?' active':'');
        b.type = 'button';
        b.setAttribute('aria-label', ��ѧ��Ŵ��� );
        b.addEventListener('click', () => {
            const targetLeft = i * slider.clientWidth;
            slider.scrollTo({ left: targetLeft, behavior: 'smooth' });
        });
        dotsWrap.appendChild(b);
    });

    function updateActive(){
        const idx = Math.round(slider.scrollLeft / slider.clientWidth);
        const dots = dotsWrap.querySelectorAll('.hero-dot');
        dots.forEach((d, i) => d.classList.toggle('active', i===idx));
    }
    slider.addEventListener('scroll', () => {
        if (slider._ticking) return; slider._ticking = true;
        requestAnimationFrame(()=>{ updateActive(); slider._ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', () => updateActive());
})();

// Hero slider enhanced: drag + auto ping-pong + dots
(function initHeroSlider2(){
  var slider = document.getElementById("heroSlider");
  var dotsWrap = document.getElementById("heroDots");
  if (!slider || !dotsWrap) return;
  var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide-card"));
  if (slides.length <= 1) return;
  dotsWrap.innerHTML = "";
  var dots = slides.map(function(_, i){
    var b = document.createElement("button");
    b.className = "hero-dot" + (i===0?" active":"");
    b.type = "button";
    b.setAttribute("aria-label", "��ѧ��Ŵ��� " + (i+1));
    b.addEventListener("click", function(){ pauseAuto(); goTo(i); resumeAuto(); });
    dotsWrap.appendChild(b);
    return b;
  });
  function getIndex(){ return Math.round(slider.scrollLeft / slider.clientWidth); }
  var current = 0;
  function updateActive(){ var idx = getIndex(); dots.forEach(function(d, i){ d.classList.toggle("active", i===idx); }); current = idx; }
  function goTo(i){ var left = Math.max(0, Math.min(i, slides.length-1)) * slider.clientWidth; slider.scrollTo({ left: left, behavior: "smooth" }); }
  var dir = 1; var autoTimer = null; var INTERVAL_MS = 4000;
  function tick(){ var next = current + dir; if (next >= slides.length) { dir = -1; next = current + dir; } if (next < 0) { dir = 1; next = current + dir; } goTo(next); }
  function resumeAuto(){ if (!autoTimer) autoTimer = setInterval(tick, INTERVAL_MS); }
  function pauseAuto(){ if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  slider.addEventListener("mouseenter", pauseAuto); slider.addEventListener("mouseleave", resumeAuto);
  dotsWrap.addEventListener("mouseenter", pauseAuto); dotsWrap.addEventListener("mouseleave", resumeAuto);
  var isDown = false, startX = 0, startScroll = 0;
  function startDrag(x){ isDown = true; startX = x; startScroll = slider.scrollLeft; slider.style.cursor = "grabbing"; pauseAuto(); }
  function moveDrag(x){ if (!isDown) return; slider.scrollLeft = startScroll - (x - startX); }
  function endDrag(){ if (!isDown) return; isDown = false; slider.style.cursor = "grab"; resumeAuto(); updateActive(); }
  slider.addEventListener("mousedown", function(e){ e.preventDefault(); startDrag(e.pageX); });
  slider.addEventListener("mousemove", function(e){ if(!isDown) return; e.preventDefault(); moveDrag(e.pageX); });
  slider.addEventListener("mouseup", endDrag); slider.addEventListener("mouseleave", endDrag);
  slider.addEventListener("touchstart", function(e){ if(e.touches && e.touches.length) startDrag(e.touches[0].pageX); }, {passive:true});
  slider.addEventListener("touchmove", function(e){ if(e.touches && e.touches.length) moveDrag(e.touches[0].pageX); }, {passive:true});
  slider.addEventListener("touchend", endDrag, {passive:true});
  slider.addEventListener("scroll", function(){ if (slider._ticking) return; slider._ticking = true; requestAnimationFrame(function(){ updateActive(); slider._ticking = false; }); }, {passive:true});
  window.addEventListener("resize", updateActive);
  slider.style.cursor = "grab"; updateActive(); resumeAuto();
})();
