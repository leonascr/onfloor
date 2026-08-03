document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Boot sequence animation trigger
    setTimeout(() => {
        document.body.classList.add('loading');
    }, 100);

    // ─── MOBILE DRAWER ────────────────────────────────────
    const menuTrigger  = document.getElementById('menuTrigger');
    const drawerClose  = document.getElementById('drawerClose');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openDrawer() {
        mobileDrawer.classList.add('is-open');
        mobileOverlay.classList.add('is-open');
        menuTrigger.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        mobileDrawer.classList.remove('is-open');
        mobileOverlay.classList.remove('is-open');
        menuTrigger.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    menuTrigger?.addEventListener('click', openDrawer);
    drawerClose?.addEventListener('click', closeDrawer);
    mobileOverlay?.addEventListener('click', closeDrawer);

    // Fechar drawer ao clicar em qualquer link interno
    document.querySelectorAll('[data-close-drawer]').forEach(link => {
        link.addEventListener('click', () => {
            closeDrawer();
        });
    });

    // Fechar drawer com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });

    // ─── SCROLL REVEAL ────────────────────────────────────
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply observation to cards and showcase items
    document.querySelectorAll('.matrix-card, .portfolio-case').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = `opacity 0.7s cubic-bezier(0.165, 0.84, 0.44, 1) ${i * 0.07}s, transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1) ${i * 0.07}s`;
        scrollObserver.observe(el);
    });

    // ─── PARALLAX HERO DESKTOP ────────────────────────────
    const visualAnchor = document.querySelector('.visual-anchor');
    if (visualAnchor && window.innerWidth > 1024) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;

            requestAnimationFrame(() => {
                visualAnchor.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }
});
