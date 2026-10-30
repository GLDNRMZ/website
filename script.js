(() => {
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Footer year ---------- */
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    /* ---------- Resource count in hero ---------- */
    const cards = $$('.resource-card');
    const countEl = $('[data-count-target="resources"]');
    if (countEl) countEl.textContent = cards.length;

    /* ---------- Reveal on scroll (staggered) ---------- */
    const revealEls = $$('.reveal');
    // Stagger siblings that sit in the same grid
    revealEls.forEach(el => {
        const siblings = $$(':scope > .reveal', el.parentElement);
        const i = siblings.indexOf(el);
        if (i > 0) el.style.setProperty('--delay', `${Math.min(i, 6) * 40}ms`);
    });
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-in'));
    }

    /* ---------- Mobile menu ---------- */
    const nav = $('.nav');
    const toggle = $('.nav-toggle');
    const setMenu = open => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    };
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });

    /* ---------- Scroll-driven bits: nav state, progress, back-to-top, active link ---------- */
    const navWrap = $('.nav-wrap');
    const toTop = $('#to-top');
    const progress = $('.scroll-progress');
    const sectionLinks = $$('.nav-links a[data-section]');
    const sections = sectionLinks.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);

    let ticking = false;
    const onScroll = () => {
        const y = window.scrollY;
        navWrap.classList.toggle('is-scrolled', y > 20);
        toTop.classList.toggle('is-visible', y > 400);

        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);

        let current = sections[0] && sections[0].id;
        const line = y + window.innerHeight * 0.35;
        sections.forEach(s => { if (s.offsetTop <= line) current = s.id; });
        if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) {
            current = sections[sections.length - 1].id;
        }
        sectionLinks.forEach(a => a.classList.toggle('active', a.hash === '#' + current));
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        $('.nav-brand').focus({ preventScroll: true });
    });

    /* ---------- Cursor spotlight on cards ---------- */
    if (window.matchMedia('(hover: hover)').matches) {
        cards.forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        });
    }

    /* ---------- Keyboard navigation between cards (arrow keys) ---------- */
    const visibleCards = () => cards.filter(c => !c.classList.contains('is-hidden'));
    const columns = () => {
        const list = visibleCards();
        if (list.length < 2) return 1;
        const top = list[0].offsetTop;
        const n = list.findIndex(c => c.offsetTop !== top);
        return n === -1 ? list.length : n;
    };
    cards.forEach(card => {
        card.addEventListener('keydown', e => {
            const list = visibleCards();
            const i = list.indexOf(card);
            let next = null;
            if (e.key === 'ArrowRight') next = list[i + 1];
            if (e.key === 'ArrowLeft') next = list[i - 1];
            if (e.key === 'ArrowDown') next = list[Math.min(i + columns(), list.length - 1)];
            if (e.key === 'ArrowUp') next = list[Math.max(i - columns(), 0)];
            if (e.key === ' ') { e.preventDefault(); card.click(); }
            if (next) { e.preventDefault(); next.focus(); }
        });
    });

    /* ---------- Live search ---------- */
    const search = $('#resource-search');
    const empty = $('#empty-state');
    const emptyQuery = $('#empty-query');
    cards.forEach(c => {
        const h = $('h3', c), p = $('p', c);
        c.dataset.title = h.textContent;
        c.dataset.desc = p.textContent;
    });
    const escapeHtml = s => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlight = (text, q) => {
        if (!q) return escapeHtml(text);
        const re = new RegExp(`(${escapeRe(q)})`, 'ig');
        return text.split(re).map((part, i) => i % 2 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)).join('');
    };
    const runSearch = () => {
        const q = search.value.trim();
        const ql = q.toLowerCase();
        let shown = 0;
        cards.forEach(c => {
            const match = !ql || c.dataset.title.toLowerCase().includes(ql) || c.dataset.desc.toLowerCase().includes(ql);
            c.classList.toggle('is-hidden', !match);
            if (match) {
                shown++;
                c.classList.add('is-in');
                $('h3', c).innerHTML = highlight(c.dataset.title, q);
                $('p', c).innerHTML = highlight(c.dataset.desc, q);
            }
        });
        $('#resources-grid').classList.toggle('is-filtering', !!q);
        empty.hidden = shown !== 0;
        emptyQuery.textContent = q;
    };
    search.addEventListener('input', runSearch);
    search.addEventListener('keydown', e => {
        if (e.key === 'Escape') { search.value = ''; runSearch(); search.blur(); }
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
            const first = visibleCards()[0];
            if (first) { e.preventDefault(); first.focus(); }
        }
    });
    // Press "/" anywhere to jump to search
    document.addEventListener('keydown', e => {
        const tag = (e.target.tagName || '').toLowerCase();
        if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
            e.preventDefault();
            search.focus();
            search.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        }
    });

    /* ---------- Subtle 3D tilt on hero logo ---------- */
    const stage = $('[data-tilt]');
    if (stage && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
        const hero = $('.hero');
        hero.addEventListener('pointermove', e => {
            const r = stage.getBoundingClientRect();
            const x = (e.clientX - (r.left + r.width / 2)) / r.width;
            const y = (e.clientY - (r.top + r.height / 2)) / r.height;
            stage.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
        });
        hero.addEventListener('pointerleave', () => { stage.style.transform = ''; });
    }
})();
