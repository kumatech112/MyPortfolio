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
        themeToggle.textContent = isDark ? '☀️' : '🌙';
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

    const scrollAmount = 250; // ระยะเลื่อนต่อครั้ง
    const currentScroll = carousel.scrollLeft;

    carousel.scrollTo({
        left: currentScroll + (direction * scrollAmount),
        behavior: 'smooth'
    });
}

// Enhance carousel usability: keyboard + drag + touch
function initCarousels() {
    document.querySelectorAll('.tools-carousel').forEach(carousel => {
        // Make focusable for keyboard users
        if (!carousel.hasAttribute('tabindex')) carousel.setAttribute('tabindex', '0');

        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key === 'ArrowLeft') {
                e.preventDefault();
                carousel.scrollBy({ left: -250, behavior: 'smooth' });
            } else if (key === 'ArrowRight') {
                e.preventDefault();
                carousel.scrollBy({ left: 250, behavior: 'smooth' });
            } else if (key === 'Home') {
                e.preventDefault();
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (key === 'End') {
                e.preventDefault();
                carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
            }
        });

        // Mouse drag support
        let isDown = false;
        let startX;
        let scrollLeft;

        const startDrag = (pageX) => {
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            // Prevent text selection across the page during drag
            document.body.classList.add('no-select');
        };

        const moveDrag = (pageX) => {
            if (!isDown) return;
            const x = pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        };

        const endDrag = () => {
            isDown = false;
            carousel.style.cursor = 'grab';
            document.body.classList.remove('no-select');
        };

        carousel.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDrag(e.pageX);
        });
        carousel.addEventListener('mouseleave', endDrag);
        carousel.addEventListener('mouseup', endDrag);
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            moveDrag(e.pageX);
        });

        // Touch support
        carousel.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                startDrag(e.touches[0].pageX);
            }
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches.length > 0) {
                moveDrag(e.touches[0].pageX);
            }
        }, { passive: true });

        carousel.addEventListener('touchend', endDrag, { passive: true });

        // Add grab cursor
        carousel.style.cursor = 'grab';
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
