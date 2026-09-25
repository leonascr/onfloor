document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // Ano do rodapé
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // ─── NAV: borda ao rolar ──────────────────────────────
    const siteNav = document.getElementById('siteNav');
    const onScroll = () => siteNav?.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

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
        drawerClose?.focus();
    }

    function closeDrawer() {
        if (!mobileDrawer.classList.contains('is-open')) return;
        mobileDrawer.classList.remove('is-open');
        mobileOverlay.classList.remove('is-open');
        menuTrigger.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    menuTrigger?.addEventListener('click', openDrawer);
    drawerClose?.addEventListener('click', closeDrawer);
    mobileOverlay?.addEventListener('click', closeDrawer);
    document.querySelectorAll('[data-close-drawer]').forEach(link => link.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });

    // ─── SCROLL REVEAL ────────────────────────────────────
    // Classes (e não estilos inline) para não travar o efeito de hover dos cards
    const groups = ['.compare-row', '.bento-card', '.showcase-panels', '.step', '.contact-panel'];
    if (!reduceMotion && 'IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        // Atraso escalonado dentro de cada grupo (não acumula pela página toda)
        groups.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, i) => {
                el.classList.add('reveal');
                el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 0.07}s`);
                scrollObserver.observe(el);
            });
        });
    } else {
        groups.forEach(selector => document.querySelectorAll(selector).forEach(el => el.classList.add('is-visible')));
    }

    // ─── LOGOS DE CLIENTES: carrossel infinito ────────────
    // Repete os logos até cobrir a largura visível e duplica o conjunto;
    // a animação anda exatamente meia trilha, então o loop não tem emenda.
    const track = document.querySelector('.clients-track');
    if (track && !reduceMotion) {
        const originals = [...track.children];
        const cloneSet = () => originals.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.querySelectorAll('a').forEach(link => link.setAttribute('tabindex', '-1'));
            track.appendChild(clone);
        });
        const visible = track.parentElement.clientWidth;
        let sets = 1;
        while (track.scrollWidth < visible && sets < 6) {
            cloneSet();
            sets++;
        }
        const half = [...track.children];
        half.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.querySelectorAll('a').forEach(link => link.setAttribute('tabindex', '-1'));
            track.appendChild(clone);
        });
        // velocidade constante (~45px/s), independente de quantos logos existem
        track.style.setProperty('--marquee-duration', `${Math.round(track.scrollWidth / 2 / 45)}s`);
    }

    // ─── HERO: demonstração animada ───────────────────────
    // Tarefas chegam (WhatsApp, formulário, planilha), passam pela On Floor e saem prontas.
    const flow = document.getElementById('heroFlow');
    if (flow) {
        const stage = flow.querySelector('.flow-stage');
        const svg = document.getElementById('flowLines');
        const core = flow.querySelector('.flow-core');
        const coreBtn = flow.querySelector('.core-btn');
        const inputs = [...flow.querySelectorAll('[data-in]')];
        const outputs = [...flow.querySelectorAll('[data-out]')];
        const feed = document.getElementById('flowFeed');
        const messages = [
            'Mensagem do WhatsApp virou pedido no sistema',
            'Orçamento do site respondido na hora',
            'Relatório do dia atualizado e enviado',
        ];
        const NS = 'http://www.w3.org/2000/svg';
        let inPaths = [];
        let outPaths = [];

        const box = (el) => {
            const s = stage.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            return { l: r.left - s.left, r: r.right - s.left, t: r.top - s.top, b: r.bottom - s.top,
                cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2 };
        };

        const makePath = (d) => {
            const p = document.createElementNS(NS, 'path');
            p.setAttribute('d', d);
            p.setAttribute('class', 'line');
            svg.appendChild(p);
            return p;
        };

        function drawLines() {
            svg.innerHTML = '';
            const c = box(coreBtn);
            const coreBox = box(core);
            // layout vertical (mobile) quando o núcleo fica abaixo das entradas
            const vertical = c.t > box(inputs[0]).b;
            inPaths = inputs.map(el => {
                const a = box(el);
                if (vertical) {
                    const my = (a.b + c.t) / 2;
                    return makePath(`M${a.cx},${a.b} C${a.cx},${my} ${c.cx},${my} ${c.cx},${c.t}`);
                }
                const mx = (a.r + c.l) / 2;
                return makePath(`M${a.r},${a.cy} C${mx},${a.cy} ${mx},${c.cy} ${c.l},${c.cy}`);
            });
            outPaths = outputs.map(el => {
                const a = box(el);
                if (vertical) {
                    // no vertical, sai de baixo do rótulo "On Floor" para não cruzar o texto
                    const my = (coreBox.b + a.t) / 2;
                    return makePath(`M${c.cx},${coreBox.b} C${c.cx},${my} ${a.cx},${my} ${a.cx},${a.t}`);
                }
                const mx = (c.r + a.l) / 2;
                return makePath(`M${c.r},${c.cy} C${mx},${c.cy} ${mx},${a.cy} ${a.l},${a.cy}`);
            });
        }

        // Move um ponto luminoso ao longo do caminho
        function travel(path, duration) {
            return new Promise(resolve => {
                const dot = document.createElementNS(NS, 'circle');
                dot.setAttribute('r', 5);
                dot.setAttribute('class', 'pulse');
                svg.appendChild(dot);
                path.classList.add('is-hot');
                const len = path.getTotalLength();
                const start = performance.now();
                const step = (now) => {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                    const pt = path.getPointAtLength(eased * len);
                    dot.setAttribute('cx', pt.x);
                    dot.setAttribute('cy', pt.y);
                    if (t < 1) requestAnimationFrame(step);
                    else {
                        dot.remove();
                        path.classList.remove('is-hot');
                        resolve();
                    }
                };
                requestAnimationFrame(step);
            });
        }

        const setFeed = async (text) => {
            feed.classList.add('is-out');
            await wait(250);
            feed.textContent = text;
            feed.classList.remove('is-out');
        };

        drawLines();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawLines, 150);
        });
        document.fonts?.ready.then(drawLines);

        if (reduceMotion) {
            outputs.forEach(o => o.classList.add('is-done'));
        } else {
            // Só anima enquanto o hero está visível e a aba está ativa
            let visible = true;
            new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.1 }).observe(flow);
            const idle = async () => {
                while (!visible || document.hidden) await wait(400);
            };

            (async function loop() {
                await wait(1200);
                for (;;) {
                    for (let i = 0; i < inputs.length; i++) {
                        await idle();
                        inputs[i].classList.add('is-active');
                        await travel(inPaths[i], 900);
                        inputs[i].classList.remove('is-active');
                        core.classList.add('is-working');
                        await wait(280);
                        core.classList.remove('is-working');
                        await travel(outPaths[i], 900);
                        outputs[i].classList.add('is-done', 'is-active');
                        setFeed(messages[i]);
                        await wait(1100);
                        outputs[i].classList.remove('is-active');
                    }
                    await wait(1800);
                    outputs.forEach(o => o.classList.remove('is-done'));
                    await wait(500);
                }
            })();
        }
    }

    // ─── VITRINE DE SITES: abas com troca automática ──────
    const showcase = document.getElementById('sites');
    if (showcase) {
        const tabs = [...showcase.querySelectorAll('[role="tab"]')];
        const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
        const TAB_MS = 6000;
        let current = 0;
        let timer = null;
        let userTook = false;
        showcase.style.setProperty('--tab-duration', `${TAB_MS}ms`);

        const select = (i, focus = false) => {
            current = (i + tabs.length) % tabs.length;
            tabs.forEach((t, k) => {
                const on = k === current;
                t.classList.toggle('is-active', on);
                t.setAttribute('aria-selected', on);
                t.tabIndex = on ? 0 : -1;
                panels[k].hidden = !on;
                panels[k].classList.toggle('is-active', on);
            });
            if (focus) tabs[current].focus();
            const row = tabs[current].parentElement;
            if (row.scrollWidth > row.clientWidth) {
                row.scrollTo({ left: tabs[current].offsetLeft - 12, behavior: reduceMotion ? 'auto' : 'smooth' });
            }
        };
        const stop = () => {
            clearInterval(timer);
            timer = null;
            showcase.classList.remove('is-autoplay');
        };
        const start = () => {
            if (reduceMotion || timer || userTook) return;
            showcase.classList.add('is-autoplay');
            timer = setInterval(() => select(current + 1), TAB_MS);
        };
        const take = (i, focus) => {
            userTook = true;
            stop();
            select(i, focus);
        };

        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => take(i));
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); take(current + 1, true); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); take(current - 1, true); }
            });
        });

        // Nomes na faixa de projetos abrem o site certo na vitrine
        document.querySelectorAll('[data-show-site]').forEach(link => {
            link.addEventListener('click', () => {
                const i = tabs.findIndex(t => t.id === link.dataset.showSite);
                if (i >= 0) take(i);
            });
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.35 }).observe(showcase);
        }
    }

    // ─── FORMULÁRIO DE DIAGNÓSTICO → n8n (Supabase) ────────
    // O lead é enviado ao n8n, que grava na tabela leads_site do Supabase.
    const LEAD_WEBHOOK = 'https://n8n.onfloor.com.br/webhook/onfloor-diagnostico';
    const form = document.getElementById('diagnosticForm');
    const formStatus = document.getElementById('formStatus');
    const setStatus = (text, type) => {
        formStatus.textContent = text;
        formStatus.dataset.type = type || '';
    };

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;

        const data = new FormData(form);
        const field = (name) => (data.get(name) || '').toString().trim();
        const lead = {
            nome: field('nome'),
            empresa: field('empresa'),
            whatsapp: field('whatsapp'),
            mensagem: field('mensagem'),
            website: field('website'),
            pagina: window.location.href,
        };

        // Robô preencheu o campo escondido: finge sucesso e não envia nada
        if (lead.website) {
            setStatus('Recebemos seus dados. Obrigado!', 'ok');
            form.reset();
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        setStatus('Enviando…', 'loading');

        let registered = false;
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(LEAD_WEBHOOK, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(lead),
                signal: controller.signal,
                keepalive: true,
            });
            clearTimeout(timer);
            registered = res.ok;
        } catch {
            registered = false;
        }

        button.disabled = false;
        if (registered) {
            setStatus('Recebemos seus dados! Em breve entraremos em contato.', 'ok');
            form.reset();
        } else {
            setStatus('Não conseguimos enviar agora. Tente novamente em instantes.', 'error');
        }
    });
});
