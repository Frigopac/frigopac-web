/* ============================================
   FRIGOPAC - Entrada de la calculadora: el parque
   Un portal con el logo, operarios trabajando y, al bajar, una calle con un local
   (cuarto frío) y una bodega. Es solo la puerta de entrada: no calcula nada.
   El dibujo se arma aquí para que se adapte al ancho de la pantalla.
   ============================================ */
(function () {
    'use strict';
    const seccion = document.getElementById('peEntrada');
    const svg = document.getElementById('peParque');
    const pista = document.getElementById('pePista');
    const escena = document.getElementById('peEscenaParque');
    const velo = document.getElementById('peVelo');
    if (!seccion || !svg || !pista || !escena) return;

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const suave = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
    const VH = 800, SUELO = 640, FUGA = 500, CALLE = 590;
    let VW = 400, cx = 200, portal = null, calle = null, monte = null;
    let centros = {}, pAct = 0, pObj = 0, raf = 0, ocupado = false;

    // ── Operario con camisa de FRIGOPAC (los pies quedan en x, y) ──
    function operario({ x, y, s = 1, gira = false, pose = 'quieto', piel = '#D9A47E', casco = '#FFFFFF' }) {
        let brazos = '', extra = '';
        const mano = (mx, my) => `<circle cx="${mx}" cy="${my}" r="2.3" fill="${piel}"/>`;
        if (pose === 'quieto') {
            brazos = `<path class="pq-manga" d="M-8.5 -45 L-12 -30"/>${mano(-12.4, -28.2)}<path class="pq-manga" d="M8.5 -45 L12 -30"/>${mano(12.4, -28.2)}`;
        } else if (pose === 'planilla') {
            brazos = `<path class="pq-manga" d="M-8.5 -45 L-12 -30"/>${mano(-12.4, -28.2)}`;
            extra = `<g class="pq-flota pq-flota--lenta"><rect class="pq-hoja" x="16" y="-51" width="10" height="13" rx="1"/><path class="pq-hoja-l" d="M18 -47 H24 M18 -44 H24 M18 -41 H22"/>
                <path class="pq-manga" d="M8.5 -45 L14 -37 L19 -40"/>${mano(19.4, -40.4)}</g>`;
        } else if (pose === 'carga') {
            extra = `<rect class="pq-caja" x="8" y="-43" width="18" height="15"/><path class="pq-caja-l" d="M17 -43 V-28"/><path class="pq-manga" d="M-6 -44 L10 -33"/>${mano(11, -32)}`;
        } else if (pose === 'escalera') {
            brazos = `<path class="pq-manga" d="M-8.5 -45 L-12 -50 L-9 -58"/>${mano(-9, -59)}`;
            extra = `<g class="pq-llave"><path class="pq-manga" d="M8.5 -45 L16 -57 L21 -66"/>${mano(21.4, -66.6)}<path class="pq-herr" d="M21 -67 L31 -75"/><circle class="pq-herr" cx="32" cy="-76" r="3"/></g>`;
        }
        return `<g transform="translate(${x} ${y}) scale(${gira ? -s : s} ${s})">
            <rect class="pq-pierna pq-pierna--a" x="-6" y="-27" width="5" height="25" rx="1.5"/><rect class="pq-pierna pq-pierna--b" x="1" y="-27" width="5" height="25" rx="1.5"/>
            <rect class="pq-bota" x="-7" y="-3" width="6.5" height="3" rx="1"/><rect class="pq-bota" x="0.5" y="-3" width="6.5" height="3" rx="1"/>
            <rect class="pq-camisa" x="-9" y="-48" width="18" height="23" rx="3"/><rect class="pq-cinta" x="-9" y="-33" width="18" height="2.4"/>
            <text class="pq-fpc" x="0" y="-39.6">FPC</text>
            ${brazos}
            <circle cx="0" cy="-55" r="6.3" fill="${piel}"/><circle class="pq-ojo" cx="2.8" cy="-54.4" r="0.8"/>
            <path d="M-7.2 -56 A7.2 7.2 0 0 1 7.2 -56 Z" fill="${casco}"/><rect x="-8.8" y="-56.4" width="17.6" height="1.9" rx="0.8" fill="${casco}"/>
            ${extra}
        </g>`;
    }
    const caminante = (o, clase) => `<g class="pq-pasea ${clase}"><g class="pq-voltea ${clase} pq-camina">${operario(o)}</g></g>`;
    const ENTRAR = (x, y, clase = '') => `<g class="pq-flota ${clase}"><rect class="pq-entrar" x="${x - 34}" y="${y}" width="68" height="22" rx="11"/><text class="pq-entrar-t" x="${x}" y="${y + 15.5}">ENTRAR ›</text></g>`;

    // ── Los dos edificios, en alzado. El origen es el centro de la base. ──
    function local() {
        let juntas = '';
        for (let x = 12; x < 74; x += 15.5) juntas += `M${x} -92 V0`;
        let toldo = '';
        for (let x = -70; x < 80; x += 20) toldo += `M${x} -124 V-104`;
        return `<g class="pq-edif" data-tipo="cuarto" role="button" tabindex="0" aria-label="Cuarto frío: carnicería, restaurante, minimercado">
            <rect class="pq-l" x="-84" y="-178" width="168" height="178"/><rect class="pq-l" x="-89" y="-190" width="178" height="12"/>
            <path class="pq-tubo" d="M64 -190 V-92"/>
            <rect class="pq-placa" x="-68" y="-168" width="136" height="32" rx="2"/><text class="pq-rotulo" x="0" y="-146">CUARTO FRÍO</text>
            <rect class="pq-l" x="-80" y="-124" width="160" height="20"/><path class="pq-fino" d="${toldo}"/>
            <rect class="pq-vidrio" x="-74" y="-92" width="64" height="76"/><path class="pq-fino" d="M-64 -92 L-74 -60 M-50 -92 L-74 -30"/>
            <rect class="pq-l" x="-66" y="-46" width="40" height="30"/><path class="pq-cian-l" d="M-66 -40 H-26"/>
            <rect class="pq-frio" x="-2" y="-92" width="78" height="92"/><path class="pq-frio-j" d="${juntas}"/>
            <rect class="pq-frio-p" x="24" y="-58" width="26" height="58"/><path class="pq-cian-l" d="M45 -34 V-22"/>
            <text class="pq-frio-t" x="37" y="-72">0 °C</text>
            <rect class="pq-l" x="14" y="-218" width="56" height="28"/><g class="pq-gira"><circle class="pq-l" cx="42" cy="-204" r="10"/><path class="pq-fino" d="M42 -204 V-213 M42 -204 L50 -199 M42 -204 L34 -199"/></g>
            ${operario({ x: -36, y: -190, s: 0.72, casco: '#FFC857' })}
            ${ENTRAR(0, -262)}
            <rect class="pq-hl" x="-94" y="-268" width="188" height="272" rx="6"/>
        </g>`;
    }
    function bodega() {
        let lamina = '';
        for (let x = -76; x < 84; x += 8) lamina += `M${x} -148 V-96`;
        const muelle = (x, abierto) => `<rect class="pq-l" x="${x}" y="-74" width="36" height="74"/><path class="pq-fino" d="M${x + 3} -64 H${x + 33} M${x + 3} -54 H${x + 33} M${x + 3} -44 H${x + 33}${abierto ? '' : ` M${x + 3} -34 H${x + 33} M${x + 3} -24 H${x + 33} M${x + 3} -14 H${x + 33}`}"/>${abierto ? `<rect class="pq-hueco" x="${x + 3}" y="-38" width="30" height="38"/>` : ''}`;
        return `<g class="pq-edif" data-tipo="bodega" role="button" tabindex="0" aria-label="Bodega con precámara: distribución y almacenamiento grande">
            <rect class="pq-l" x="-84" y="-160" width="168" height="160"/><path class="pq-reja" d="${lamina}"/>
            <rect class="pq-l" x="-89" y="-172" width="178" height="12"/><path class="pq-cian-l" d="M-84 -152 H84"/>
            <rect class="pq-placa" x="-52" y="-144" width="104" height="38" rx="2"/><text class="pq-rotulo" x="0" y="-124">BODEGA</text><text class="pq-rotulo pq-rotulo--sub" x="0" y="-112">CON PRECÁMARA</text>
            <rect class="pq-frio" x="-76" y="-90" width="152" height="90"/>
            <rect class="pq-l" x="-72" y="-90" width="144" height="8"/>
            ${muelle(-62, false)}${muelle(-18, true)}${muelle(26, false)}
            <rect class="pq-rayas" x="-80" y="-6" width="160" height="6"/>
            <rect class="pq-l" x="-70" y="-188" width="16" height="16"/><rect class="pq-l" x="-46" y="-184" width="12" height="12"/>
            <circle class="pq-humo" cx="-62" cy="-194" r="5"/><circle class="pq-humo pq-humo--b" cx="-62" cy="-194" r="5"/>
            ${ENTRAR(0, -216, 'pq-flota--b')}
            <rect class="pq-hl" x="-94" y="-222" width="188" height="226" rx="6"/>
        </g>`;
    }
    function camion(k) {
        return `<g class="pq-camion"><g transform="translate(0 ${CALLE + 52}) scale(${k})">
            <rect class="pq-l" x="0" y="-38" width="58" height="36"/><path class="pq-cian-l" d="M0 -13 H58"/><text class="pq-camion-t" x="29" y="-21">FRIGOPAC</text>
            <rect class="pq-l" x="44" y="-44" width="11" height="6"/>
            <polygon class="pq-l" points="60,-28 74,-28 82,-14 82,-4 60,-4"/><polygon class="pq-vidrio" points="64,-25 73,-25 78,-16 64,-16"/>
            <rect class="pq-chasis" x="-2" y="-6" width="86" height="4"/>
            <circle class="pq-rueda" cx="14" cy="-3" r="6"/><circle class="pq-rueda" cx="40" cy="-3" r="6"/><circle class="pq-rueda" cx="70" cy="-3" r="6"/>
        </g></g>`;
    }

    // ── Armar el dibujo para el ancho de la pantalla ──
    function construir() {
        const r = escena.getBoundingClientRect();
        if (!r.width || !r.height) return;
        VW = Math.round(clamp(VH * r.width / r.height, 380, 1500));
        cx = VW / 2;
        const ancho = VW >= 900;
        svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
        svg.style.setProperty('--pq-recorrido', (VW + 280) + 'px');
        const g = ancho ? Math.min(330, VW * 0.23) : 130;        // del centro a cada poste
        const sep = ancho ? Math.min(340, VW * 0.235) : 104;      // del centro a cada edificio
        const k = ancho ? 1.65 : 1;
        centros = { cuarto: { x: cx - sep, y: CALLE - 100 * k }, bodega: { x: cx + sep, y: CALLE - 90 * k } };

        // Fondo: horizonte, montañas, suelo en perspectiva y la vía de acceso
        let f = '<defs><pattern id="pqRayas" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="pq-rayas-a" width="12" height="12"/><rect class="pq-rayas-b" width="6" height="12"/></pattern></defs>';
        const cerros = [];
        for (let x = -20; x <= VW + 60; x += 46) cerros.push(`${x},${(FUGA - 20 - 34 * Math.abs(Math.sin(x * 0.011)) - 16 * Math.abs(Math.sin(x * 0.037 + 1))).toFixed(1)}`);
        f += `<g id="pqMonte"><polyline class="pq-monte" points="${cerros.join(' ')}"/></g><path class="pq-fino" d="M0 ${FUGA} H${VW}"/>`;
        let reja = '';
        for (let i = -10; i <= 10; i++) if (i) reja += `M${cx + i * 5} ${FUGA} L${cx + i * 200} ${VH}`;
        for (let i = 1; i <= 7; i++) { const y = (FUGA + 300 * Math.pow(i / 8, 1.7)).toFixed(1); reja += `M0 ${y} H${VW}`; }
        f += `<path class="pq-reja" d="${reja}"/>`;
        f += `<polygon class="pq-via" points="${cx - 10},${FUGA} ${cx + 10},${FUGA} ${cx + 250},${VH} ${cx - 250},${VH}"/>`;
        for (let i = 0; i < 9; i++) {
            const t0 = Math.pow(i / 9, 1.7), t1 = Math.pow((i + 0.55) / 9, 1.7);
            const ya = FUGA + 300 * t0, yb = FUGA + 300 * t1, wa = 0.6 + 4.5 * t0, wb = 0.6 + 4.5 * t1;
            f += `<polygon class="pq-marca" points="${cx - wa},${ya.toFixed(1)} ${cx + wa},${ya.toFixed(1)} ${cx + wb},${yb.toFixed(1)} ${cx - wb},${yb.toFixed(1)}"/>`;
        }

        // La calle del parque
        let c = `<g id="pqCalle" opacity="0"><rect class="pq-plaza" x="${-VW}" y="${CALLE - 4}" width="${VW * 3}" height="700"/>
            <path class="pq-fino" d="M${-VW} ${CALLE - 4} H${VW * 2} M${-VW} ${CALLE + 50} H${VW * 2} M${-VW} ${CALLE + 110} H${VW * 2}"/>
            <g transform="translate(${cx - sep} ${CALLE}) scale(${k})">${local()}</g>
            <g transform="translate(${cx + sep} ${CALLE}) scale(${k})">${bodega()}</g>
            ${operario({ x: cx - 14, y: CALLE + 28, s: 0.85 * k, gira: true, pose: 'planilla', piel: '#C58A63' })}
            ${caminante({ x: cx + 26, y: CALLE + 22, s: 0.8 * k, pose: 'carga', piel: '#E0B08A' }, 'pq-pasea--b')}
            ${camion(0.9 * k)}
        </g>`;

        // El portal de entrada
        const pi = cx - g - 14, pd = cx + g - 14, tx = cx - g - 36, tw = 2 * g + 72;
        const poste = (x) => `<rect class="pq-l" x="${x}" y="330" width="28" height="310"/><path class="pq-fino" d="M${x + 20} 340 V608"/><rect class="pq-cian" x="${x}" y="424" width="28" height="14"/><rect class="pq-rayas" x="${x}" y="608" width="28" height="32"/>`;
        let peld = '';
        for (let i = 1; i < 10; i++) { const t = i / 10; peld += `M${pi - 40 + 24 * t} ${640 - 302 * t} h24`; }
        let p = `<g id="pqPortal">
            <path class="pq-escalera" d="M${pi - 40} 640 L${pi - 16} 338 M${pi - 16} 640 L${pi + 8} 338 ${peld}"/>
            ${poste(pi)}${poste(pd)}
            <path class="pq-cota" d="M${tx} 168 H${tx + tw} M${tx} 160 V184 M${tx + tw} 160 V184 M${tx - 3} 171 l6 -6 M${tx + tw - 3} 171 l6 -6"/><text class="pq-cota-t" x="${cx}" y="160">ACCESO</text>
            <rect class="pq-tablero" x="${tx}" y="190" width="${tw}" height="150" rx="4"/><rect class="pq-tablero-i" x="${tx + 7}" y="197" width="${tw - 14}" height="136" rx="2"/>
            <text class="pq-letrero" x="${cx}" y="216">PARQUE DEL FRÍO</text>
            <rect class="pq-blanco" x="${cx - 84}" y="224" width="168" height="104" rx="3"/>
            <image href="assets/images/logo-frigopac.jpg" x="${cx - 80}" y="226" width="160" height="100" preserveAspectRatio="xMidYMid meet"/>`;
        if (ancho) {
            p += `<text class="pq-letrero pq-letrero--lado" x="${(tx + cx - 84) / 2}" y="284">‹ CUARTOS FRÍOS</text><text class="pq-letrero pq-letrero--lado" x="${(tx + tw + cx + 84) / 2}" y="284">BODEGAS ›</text>`;
        }
        p += `<rect class="pq-foco" x="${tx + 40}" y="182" width="22" height="5" rx="2"/><rect class="pq-foco" x="${cx - 11}" y="182" width="22" height="5" rx="2"/><rect class="pq-foco" x="${tx + tw - 62}" y="182" width="22" height="5" rx="2"/>
            ${operario({ x: pi - 8, y: 398, pose: 'escalera', piel: '#C58A63', casco: '#FFC857' })}
            ${operario({ x: pd - 22, y: 654, gira: true, pose: 'planilla', piel: '#E0B08A' })}
            ${caminante({ x: cx - 104, y: 730, s: 1.35, pose: 'carga', piel: '#A9714B' }, 'pq-pasea--a')}
            <polygon class="pq-cono" points="${cx - 82},690 ${cx - 74},690 ${cx - 78},672"/><polygon class="pq-cono" points="${cx + 92},690 ${cx + 100},690 ${cx + 96},672"/>
        </g>`;

        svg.innerHTML = f + c + p;
        portal = svg.querySelector('#pqPortal'); calle = svg.querySelector('#pqCalle'); monte = svg.querySelector('#pqMonte');
        aplicar(pAct);
    }

    // ── El recorrido: p va de 0 (afuera del portal) a 1 (en la calle) ──
    function aplicar(p) {
        if (!portal) return;
        const t1 = suave((p - 0.06) / 0.46);
        portal.setAttribute('transform', `translate(${cx} ${SUELO}) scale(${(1 + 3.4 * t1).toFixed(4)}) translate(${-cx} ${-SUELO})`);
        portal.setAttribute('opacity', (1 - suave((p - 0.34) / 0.18)).toFixed(3));
        portal.setAttribute('visibility', p > 0.53 ? 'hidden' : 'visible');
        const t2 = suave((p - 0.24) / 0.52);
        calle.setAttribute('transform', `translate(${cx} 520) scale(${(0.62 + 0.38 * t2).toFixed(4)}) translate(${-cx} -520)`);
        calle.setAttribute('opacity', clamp((p - 0.24) / 0.2).toFixed(3));
        monte.setAttribute('transform', `translate(0 ${(p * 14).toFixed(1)})`);
        escena.classList.toggle('is-bajando', p > 0.05);
        escena.classList.toggle('is-viva', p > 0.8);
    }
    function objetivo() {
        const max = pista.offsetHeight - escena.offsetHeight;
        return reduce || max < 8 ? 1 : clamp(window.scrollY / max);
    }
    function cuadro() {
        pAct += (pObj - pAct) * 0.14;
        if (Math.abs(pObj - pAct) < 0.0006) pAct = pObj;
        aplicar(pAct);
        raf = pAct === pObj ? 0 : requestAnimationFrame(cuadro);
    }
    function alMover() {
        if (seccion.hidden || ocupado) return;
        pObj = objetivo();
        if (reduce) { pAct = pObj; aplicar(pAct); return; }
        if (!raf) raf = requestAnimationFrame(cuadro);
    }
    let espera = 0;
    function alCambiarTamano() {
        clearTimeout(espera);
        espera = setTimeout(() => { if (!seccion.hidden) { construir(); alMover(); } }, 120);
    }

    // ── Entrar a un edificio: la cámara se acerca y da paso a la calculadora ──
    function entrar(tipo, listo) {
        const c = centros[tipo];
        if (reduce || seccion.hidden || !c || !velo) { listo(); return; }
        if (ocupado) return;
        ocupado = true;
        const enCalle = pAct > 0.8;
        const w1 = VW * 0.14, h1 = VH * 0.14, x1 = c.x - w1 / 2, y1 = c.y - h1 / 2;
        const t0 = performance.now(), dur = enCalle ? 640 : 280;
        (function avanza(ahora) {
            const t = clamp((ahora - t0) / dur), e = t * t * t;
            if (enCalle) svg.setAttribute('viewBox', `${(x1 * e).toFixed(1)} ${(y1 * e).toFixed(1)} ${(VW + (w1 - VW) * e).toFixed(1)} ${(VH + (h1 - VH) * e).toFixed(1)}`);
            velo.style.opacity = clamp((t - 0.4) / 0.55).toFixed(3);
            if (t < 1) { requestAnimationFrame(avanza); return; }
            listo();
            svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
            velo.style.opacity = '0';
            ocupado = false;
        })(t0);
    }

    svg.addEventListener('keydown', (ev) => {
        const b = ev.target.closest && ev.target.closest('.pq-edif');
        if (b && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); b.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
    window.addEventListener('scroll', alMover, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(alCambiarTamano).observe(escena);
    else window.addEventListener('resize', alCambiarTamano);

    function reiniciar() { construir(); pObj = pAct = objetivo(); aplicar(pAct); }
    reiniciar();
    window.FrigoPacParque = { entrar, reiniciar };
})();
