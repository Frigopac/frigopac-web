/* ============================================
   FRIGOPAC - Entrada de la calculadora: el parque
   Un solo mundo en perspectiva: la cámara avanza por la vía, pasa bajo el portal
   y las farolas, y llega a la plaza donde están el local (cuarto frío) y la bodega.
   Es solo la puerta de entrada: no calcula nada.
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
    const frases = [...escena.querySelectorAll('.pe-entrada__frase')];
    const avance = escena.querySelector('.pe-entrada__avance i');

    // Lámina de 800 de alto. El horizonte está en FUGA y el ojo a OJO unidades del suelo:
    // algo dibujado con la base en y = 640 queda bien apoyado cuando su escala es 1.
    const VH = 800, FUGA = 500, OJO = 140, BASE = FUGA + OJO;
    const RECORRIDO = 3;            // cuánto avanza la cámara de principio a fin
    const Z_PORTAL = 1, Z_PLAZA = 3;
    let VW = 400, cx = 200, via = 40, zEdif = 4;
    let capas = [], piezas = {}, pAct = 0, pObj = 0, raf = 0, ocupado = false;

    // ── Operario con camisa de FRIGOPAC (los pies quedan en x, y) ──
    function operario({ x, y, s = 1, gira = false, pose = 'quieto', piel = '#D9A47E', casco = '#FFFFFF' }) {
        let brazos = '', extra = '';
        const mano = (mx, my) => `<circle cx="${mx}" cy="${my}" r="2.3" fill="${piel}"/>`;
        if (pose === 'quieto') {
            brazos = `<path class="pq-manga" d="M-8.5 -45 L-12 -30"/>${mano(-12.4, -28.2)}<path class="pq-manga" d="M8.5 -45 L12 -30"/>${mano(12.4, -28.2)}`;
        } else if (pose === 'planilla') {
            brazos = `<path class="pq-manga" d="M-8.5 -45 L-12 -30"/>${mano(-12.4, -28.2)}`;
            extra = `<g class="pq-anota"><rect class="pq-hoja" x="16" y="-51" width="10" height="13" rx="1"/><path class="pq-hoja-l" d="M18 -47 H24 M18 -44 H24 M18 -41 H22"/>
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
            <g class="pq-gente">${operario({ x: -36, y: -190, s: 0.72, casco: '#FFC857' })}</g>
            <rect class="pq-hl" x="-94" y="-226" width="188" height="230" rx="6"/>
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
            <rect class="pq-hl" x="-94" y="-196" width="188" height="200" rx="6"/>
        </g>`;
    }
    function camion(k) {
        return `<g class="pq-camion"><g transform="translate(0 ${BASE + 4}) scale(${k})">
            <rect class="pq-l" x="0" y="-38" width="58" height="36"/><path class="pq-cian-l" d="M0 -13 H58"/><text class="pq-camion-t" x="29" y="-21">FRIGOPAC</text>
            <rect class="pq-l" x="44" y="-44" width="11" height="6"/>
            <polygon class="pq-l" points="60,-28 74,-28 82,-14 82,-4 60,-4"/><polygon class="pq-vidrio" points="64,-25 73,-25 78,-16 64,-16"/>
            <rect class="pq-chasis" x="-2" y="-6" width="86" height="4"/>
            <circle class="pq-rueda" cx="14" cy="-3" r="6"/><circle class="pq-rueda" cx="40" cy="-3" r="6"/><circle class="pq-rueda" cx="70" cy="-3" r="6"/>
        </g></g>`;
    }
    // Farola o señal al borde de la vía; lado = -1 izquierda, 1 derecha
    function farola(lado, letrero) {
        const x = cx + lado * (via + 30);
        let g = `<path class="pq-poste" d="M${x} ${BASE} V${BASE - 150} h${-lado * 26}"/><rect class="pq-foco" x="${x - lado * 26 - 9}" y="${BASE - 153}" width="18" height="5" rx="2"/>
            <ellipse class="pq-halo-s" cx="${x - lado * 26}" cy="${BASE - 140}" rx="26" ry="16"/>`;
        if (letrero) g += `<rect class="pq-placa" x="${x + (lado < 0 ? -92 : 6)}" y="${BASE - 118}" width="86" height="26" rx="3"/><text class="pq-senal" x="${x + (lado < 0 ? -49 : 49)}" y="${BASE - 100.5}">${letrero}</text>`;
        return g;
    }

    // ── Armar el mundo para el ancho de la pantalla ──
    function construir() {
        const r = escena.getBoundingClientRect();
        if (!r.width || !r.height) return;
        VW = Math.round(clamp(VH * r.width / r.height, 380, 1500));
        cx = VW / 2;
        const ancho = VW >= 900;
        svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
        const g = ancho ? Math.min(330, VW * 0.23) : 130;         // del centro a cada poste
        const sep = ancho ? Math.min(400, VW * 0.27) : 122;       // del centro a cada edificio
        const k = ancho ? 1.9 : 1.1;
        via = ancho ? 96 : 34;
        zEdif = RECORRIDO + 1 / 0.8;
        svg.style.setProperty('--pq-llegada', (cx + sep - 84 * k - 10 - 86 * 0.9 * k) + 'px');
        svg.style.setProperty('--pq-salida', (-140 * k) + 'px');

        let f = `<defs>
            <pattern id="pqRayas" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="pq-rayas-a" width="12" height="12"/><rect class="pq-rayas-b" width="6" height="12"/></pattern>
            <radialGradient id="pqHalo"><stop offset="0" class="pq-halo-a"/><stop offset="1" class="pq-halo-b"/></radialGradient>
            <linearGradient id="pqCono" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="pq-cono-a"/><stop offset="1" class="pq-halo-b"/></linearGradient>
        </defs>`;
        // Fondo fijo: horizonte, cerros y las líneas del suelo que van al punto de fuga
        const cerros = [];
        for (let x = -20; x <= VW + 60; x += 46) cerros.push(`${x},${(FUGA - 20 - 34 * Math.abs(Math.sin(x * 0.011)) - 16 * Math.abs(Math.sin(x * 0.037 + 1))).toFixed(1)}`);
        let radios = '';
        for (let i = -10; i <= 10; i++) if (i) radios += `M${cx + i * 5} ${FUGA} L${cx + i * 200} ${VH}`;
        f += `<g id="pqMonte"><polyline class="pq-monte" points="${cerros.join(' ')}"/></g><path class="pq-fino" d="M0 ${FUGA} H${VW}"/>
            <path class="pq-reja" d="${radios}"/><path class="pq-reja" id="pqTraviesas"/>
            <rect class="pq-plaza" id="pqPlaza" x="0" width="${VW}" y="${FUGA}" height="0"/>
            <polygon class="pq-via" id="pqVia"/><path class="pq-marca" id="pqMarcas"/>`;

        // Capas del mundo, de la más lejana a la más cercana
        const capa = (id, z, html) => `<g class="pq-capa" id="${id}" data-z="${z}">${html}</g>`;
        const edificios = `<g transform="translate(${cx - sep} ${BASE}) scale(${k})">${local()}</g><g transform="translate(${cx + sep} ${BASE}) scale(${k})">${bodega()}</g>`;
        const calle = `<g class="pq-gente">${operario({ x: cx - sep + 84 * k + 16 * k, y: BASE + 6, s: 0.85 * k, gira: true, pose: 'planilla', piel: '#C58A63' })}</g>${camion(0.9 * k)}`;

        const pi = cx - g - 14, pd = cx + g - 14, tx = cx - g - 30, tw = 2 * g + 60;
        const poste = (x) => `<rect class="pq-l" x="${x}" y="300" width="28" height="340"/><path class="pq-fino" d="M${x + 20} 312 V608"/><rect class="pq-cian" x="${x}" y="424" width="28" height="14"/><rect class="pq-rayas" x="${x}" y="608" width="28" height="32"/>`;
        let peld = '';
        for (let i = 1; i < 10; i++) { const t = i / 10; peld += `M${pi - 40 + 24 * t} ${640 - 330 * t} h24`; }
        let celosia = '';
        for (let x = tx, i = 0; x < tx + tw - 1; x += 22, i++) celosia += `M${x} ${i % 2 ? 262 : 300} L${Math.min(x + 22, tx + tw)} ${i % 2 ? 300 : 262}`;
        let portal = `<ellipse class="pq-halo" cx="${cx}" cy="266" rx="230" ry="150"/>
            <polygon class="pq-cono-luz" points="${cx - 118},344 ${cx + 118},344 ${cx + 210},640 ${cx - 210},640"/>
            <path class="pq-escalera" d="M${pi - 40} 640 L${pi - 16} 310 M${pi - 16} 640 L${pi + 8} 310 ${peld}"/>
            ${poste(pi)}${poste(pd)}
            <rect class="pq-l" x="${tx}" y="258" width="${tw}" height="46"/><path class="pq-fino" d="${celosia}"/>
            <path class="pq-cota" d="M${tx} 158 H${tx + tw} M${tx} 150 V174 M${tx + tw} 150 V174 M${tx - 3} 161 l6 -6 M${tx + tw - 3} 161 l6 -6"/><text class="pq-cota-t" x="${cx}" y="149">PARQUE DEL FRÍO</text>`;
        if (ancho) {
            const wa = (tx + cx - 124) / 2, wb = (tx + tw + cx + 124) / 2;
            portal += `<rect class="pq-placa" x="${wa - 100}" y="262" width="200" height="38" rx="3"/><text class="pq-letrero" x="${wa}" y="287">‹ CUARTOS FRÍOS</text>
                <rect class="pq-placa" x="${wb - 100}" y="262" width="200" height="38" rx="3"/><text class="pq-letrero" x="${wb}" y="287">BODEGAS ›</text>`;
        }
        // Aviso luminoso con el logo: caja de luz montada sobre la viga
        portal += `<rect class="pq-soporte" x="${cx - 96}" y="176" width="8" height="14"/><rect class="pq-soporte" x="${cx + 88}" y="176" width="8" height="14"/><path class="pq-poste" d="M${cx - 110} 176 H${cx + 110}"/>
            <rect class="pq-luz-marco" x="${cx - 124}" y="186" width="248" height="158" rx="10"/>
            <rect class="pq-luz" x="${cx - 118}" y="192" width="236" height="146" rx="6"/>
            <image href="assets/images/logo-frigopac.jpg" x="${cx - 104}" y="198" width="208" height="134" preserveAspectRatio="xMidYMid meet"/>
            <rect class="pq-luz-brillo" x="${cx - 118}" y="192" width="236" height="146" rx="6"/>
            <g class="pq-gente">${operario({ x: pi - 8, y: 398, pose: 'escalera', piel: '#C58A63', casco: '#FFC857' })}
            ${operario({ x: pd - 22, y: 646, gira: true, pose: 'planilla', piel: '#E0B08A' })}
            <g class="pq-pasea"><g class="pq-voltea pq-camina">${operario({ x: cx - 70, y: 648, s: 1.05, pose: 'carga', piel: '#A9714B' })}</g></g></g>
            <polygon class="pq-cono" points="${cx - via - 12},640 ${cx - via - 2},640 ${cx - via - 7},620"/><polygon class="pq-cono" points="${cx + via + 2},640 ${cx + via + 12},640 ${cx + via + 7},620"/>`;

        svg.innerHTML = f +
            capa('pqEdificios', zEdif, edificios) +
            capa('pqCalle', zEdif - 0.1, calle) +
            capa('pqFarC', 2.7, farola(-1) + farola(1)) +
            capa('pqFarB', 2.05, farola(-1, 'CUARTOS ‹') + farola(1, '› BODEGAS')) +
            capa('pqFarA', 1.45, farola(-1) + farola(1)) +
            capa('pqPortal', Z_PORTAL, portal);
        capas = [...svg.querySelectorAll('.pq-capa')].map((el) => ({ el, z: Number(el.dataset.z), fijo: el.id === 'pqEdificios' || el.id === 'pqCalle' }));
        piezas = { monte: svg.querySelector('#pqMonte'), traviesas: svg.querySelector('#pqTraviesas'), plaza: svg.querySelector('#pqPlaza'), via: svg.querySelector('#pqVia'), marcas: svg.querySelector('#pqMarcas') };
        aplicar(pAct);
    }

    // ── El recorrido: p va de 0 (afuera del portal) a 1 (en la plaza) ──
    const altura = (d) => FUGA + OJO / d;                 // dónde cae en la lámina un punto del suelo a distancia d
    function aplicar(p) {
        if (!capas.length) return;
        const c = RECORRIDO * p;
        capas.forEach((o) => {
            const d = o.z - c;
            if (d < 0.14) { o.el.setAttribute('visibility', 'hidden'); return; }
            const s = 1 / d;
            o.el.setAttribute('visibility', 'visible');
            o.el.setAttribute('transform', `translate(${cx} ${FUGA}) scale(${s.toFixed(4)}) translate(${-cx} ${-FUGA})`);
            o.el.setAttribute('opacity', o.fijo ? clamp(0.35 + s * 0.9).toFixed(3) : (1 - suave((s - 2.4) / 2.2)).toFixed(3));
        });
        // Suelo: traviesas que se acercan, la plaza al fondo y la vía hasta donde empieza la plaza
        let trav = '', marcas = '';
        for (let z = 0.25; z < zEdif + 1; z += 0.25) { const d = z - c; if (d > 0.46) trav += `M0 ${altura(d).toFixed(1)} H${VW}`; }
        piezas.traviesas.setAttribute('d', trav);
        const dPlaza = Z_PLAZA - c;
        const yPlaza = dPlaza > 0.46 ? altura(dPlaza) : VH + 4;
        const yFondo = altura(zEdif + 0.7 - c);
        piezas.plaza.setAttribute('y', yFondo.toFixed(1));
        piezas.plaza.setAttribute('height', Math.max(0, yPlaza - yFondo).toFixed(1));
        const medio = (y) => via * (y - FUGA) / OJO;
        piezas.via.setAttribute('points', yPlaza >= VH ? '' : `${cx - medio(yPlaza)},${yPlaza.toFixed(1)} ${cx + medio(yPlaza)},${yPlaza.toFixed(1)} ${cx + medio(VH)},${VH} ${cx - medio(VH)},${VH}`);
        for (let z = 0.2; z < Z_PLAZA - 0.1; z += 0.22) {
            const d0 = z + 0.09 - c, d1 = z - c;
            if (d1 < 0.47) continue;
            const ya = altura(d0), yb = altura(d1), wa = 2.2 / d0, wb = 2.2 / d1;
            marcas += `M${(cx - wa).toFixed(1)} ${ya.toFixed(1)}H${(cx + wa).toFixed(1)}L${(cx + wb).toFixed(1)} ${yb.toFixed(1)}H${(cx - wb).toFixed(1)}Z`;
        }
        piezas.marcas.setAttribute('d', marcas);
        piezas.monte.setAttribute('transform', `translate(0 ${(p * 10).toFixed(1)})`);

        escena.classList.toggle('is-bajando', p > 0.04);
        escena.classList.toggle('is-viva', p > 0.9);
        frases.forEach((el, i) => el.classList.toggle('is-vista', i === 0 ? p > 0.16 && p < 0.44 : p > 0.5 && p < 0.82));
        if (avance) avance.style.transform = `scaleY(${p.toFixed(3)})`;
    }
    function objetivo() {
        const max = pista.offsetHeight - escena.offsetHeight;
        return reduce || max < 8 ? 1 : clamp(window.scrollY / max);
    }
    function cuadro() {
        pAct += (pObj - pAct) * 0.12;
        if (Math.abs(pObj - pAct) < 0.0005) pAct = pObj;
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
        espera = setTimeout(() => { if (!seccion.hidden && !ocupado) { construir(); alMover(); } }, 120);
    }

    // ── Entrar a un edificio: queda en líneas, la cámara se acerca y da paso al plano ──
    function entrar(tipo, listo) {
        const ed = svg.querySelector(`.pq-edif[data-tipo="${tipo}"] .pq-hl`);
        if (reduce || seccion.hidden || !velo) { listo(); return; }
        if (ocupado) return;
        ocupado = true;
        const enPlaza = pAct > 0.9 && ed;
        let x1 = 0, y1 = 0, w1 = VW, h1 = VH;
        if (enPlaza) {
            const r = svg.getBoundingClientRect(), b = ed.getBoundingClientRect();
            const sc = Math.max(r.width / VW, r.height / VH);
            const bx = (b.left + b.width / 2 - (r.left + (r.width - VW * sc) / 2)) / sc;
            const by = (b.top + b.height / 2 - (r.top + (r.height - VH * sc))) / sc;
            h1 = Math.max(b.height / sc * 1.25, b.width / sc * 1.25 * VH / VW); w1 = h1 * VW / VH;
            x1 = bx - w1 / 2; y1 = by - h1 / 2;
            escena.dataset.elige = tipo;
        }
        const t0 = performance.now(), dur = enPlaza ? 900 : 320;
        (function paso(ahora) {
            const t = clamp((ahora - t0) / dur), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            if (enPlaza) svg.setAttribute('viewBox', `${(x1 * e).toFixed(1)} ${(y1 * e).toFixed(1)} ${(VW + (w1 - VW) * e).toFixed(1)} ${(VH + (h1 - VH) * e).toFixed(1)}`);
            velo.style.opacity = clamp((t - 0.62) / 0.36).toFixed(3);
            if (t < 1) { requestAnimationFrame(paso); return; }
            listo();
            svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
            delete escena.dataset.elige;
            velo.style.opacity = '0';
            ocupado = false;
        })(t0);
    }

    // El botón de abajo y su edificio se iluminan juntos
    function foco(tipo) {
        svg.querySelectorAll('.pq-edif').forEach((b) => b.classList.toggle('is-foco', b.dataset.tipo === tipo));
        escena.querySelectorAll('.pe-entrada__op').forEach((b) => b.classList.toggle('is-foco', b.dataset.tipo === tipo));
    }
    escena.addEventListener('pointerover', (ev) => { const b = ev.target.closest && ev.target.closest('.pq-edif, .pe-entrada__op'); foco(b ? b.dataset.tipo : null); });
    escena.addEventListener('pointerleave', () => foco(null));
    escena.addEventListener('focusin', (ev) => { const b = ev.target.closest && ev.target.closest('.pq-edif, .pe-entrada__op'); foco(b ? b.dataset.tipo : null); });
    svg.addEventListener('keydown', (ev) => {
        const b = ev.target.closest && ev.target.closest('.pq-edif');
        if (b && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); b.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
    window.addEventListener('scroll', alMover, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(alCambiarTamano).observe(escena);
    else window.addEventListener('resize', alCambiarTamano);

    function reiniciar() { construir(); pObj = pAct = objetivo(); aplicar(pAct); }
    reiniciar();
    window.FrigoPacParque = { entrar, reiniciar, ver: (p) => { pAct = pObj = clamp(p); aplicar(pAct); } };
})();
