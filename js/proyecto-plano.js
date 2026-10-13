/* ============================================
   FRIGOPAC - Plano de referencia del cuarto o de la bodega
   Solo dibuja: recibe las medidas que ya tiene la calculadora y las pone a escala,
   con algo conocido al lado para comparar (una persona, estibas, una tractomula,
   una cancha de fútbol). Aquí no se calcula nada.
   ============================================ */
(function () {
    'use strict';
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const num = (x, d = 0) => Number(x).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const COS = 0.866, SIN = 0.5;
    const VW = 520, VH = 330;
    const CLAVES = ['L', 'A', 'H'];
    const estados = new WeakMap();

    // Las medidas llegan de golpe; el dibujo las alcanza poco a poco para que el cambio se vea fluido.
    function pintar(svg, o, opc) {
        if (!svg) return;
        let e = estados.get(svg);
        if (!e) { e = { cur: null, raf: 0, visto: false }; estados.set(svg, e); svg.classList.add('pe-plano'); }
        if (opc && opc.entra) e.visto = false;      // volver a trazar el plano, como recién dibujado
        svg.classList.toggle('pe-plano--entra', !e.visto && !reduce);
        e.visto = true;
        e.obj = o;
        if (!e.cur || e.cur.tipo !== o.tipo || reduce) e.cur = { tipo: o.tipo, L: o.L, A: o.A, H: o.H };
        if (!e.raf) e.raf = requestAnimationFrame(() => paso(svg, e));
    }
    function paso(svg, e) {
        let falta = 0;
        CLAVES.forEach((k) => {
            const d = e.obj[k] - e.cur[k];
            e.cur[k] = Math.abs(d) < 0.004 * Math.max(1, e.obj[k]) ? e.obj[k] : e.cur[k] + d * 0.24;
            falta = Math.max(falta, Math.abs(e.obj[k] - e.cur[k]));
        });
        dibujar(svg, e.obj, e.cur);
        e.raf = falta > 0 ? requestAnimationFrame(() => paso(svg, e)) : 0;
    }

    const bonito = (x) => [1, 2, 5, 10, 20, 50, 100].find((u) => u >= x) || 100;

    function dibujar(svg, o, c) {
        const bodega = o.tipo === 'bodega';
        const L = c.L, A = c.A, H = c.H;
        const mayor = Math.max(L, A);
        let ox, oy, W, D, Hs, off, malla, pre = 0, xc = 0, cancha = false, sep = 0;
        if (bodega) {
            const m = Math.max(3, mayor * 0.08);
            ox = oy = m;
            pre = clamp(L * 0.12, 4, 12);
            off = Math.max(1.6, mayor * 0.05);
            xc = ox + L + pre + off * 3.4;
            cancha = L * A >= 3000;
            sep = off * 2.6;
            W = Math.max(xc + 16.3 + m, cancha ? ox + 105 + m : 0);
            D = cancha ? oy + A + sep + 68 + m : oy + A + off * 2 + m;
            Hs = H;
            malla = bonito(mayor / 8);
        } else {
            ox = oy = 0.8; off = 1; malla = 1;
            W = Math.max(7.4, ox + L + 5);
            D = Math.max(6.2, oy + A + 3.4);
            Hs = Math.max(3.2, H + 0.9);
        }
        const x0 = ox, x1 = ox + L, y0 = oy, y1 = oy + A, yc = oy + A / 2;

        // Encaje del dibujo en la lámina
        const pr = (x, y, z) => [(x - y) * COS, (x + y) * SIN - z];
        const esquinas = [[0, 0, 0], [W, 0, 0], [0, D, 0], [W, D, 0], [0, 0, Hs], [W, 0, Hs], [0, D, Hs], [x0, y0, H], [x1, y0, H], [x0, y1, H]].map((q) => pr(...q));
        const us = esquinas.map((q) => q[0]), vs = esquinas.map((q) => q[1]);
        const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
        const s = Math.min((VW - 52) / (u1 - u0), (VH - 74) / (v1 - v0));
        const tx = (VW - (u1 - u0) * s) / 2 - u0 * s, ty = 42 + (VH - 74 - (v1 - v0) * s) / 2 - v0 * s;
        const P = (x, y, z = 0) => { const q = pr(x, y, z); return [q[0] * s + tx, q[1] * s + ty]; };
        const M = (q) => { const p = P(...q); return p[0].toFixed(1) + ' ' + p[1].toFixed(1); };
        const seg = (a, b) => `M${M(a)}L${M(b)}`;
        const poly = (...pp) => 'M' + pp.map(M).join('L') + 'Z';
        // Caja de alambre: aristas que se ven, aristas ocultas y caras del frente
        const caja = (x, y, z, dx, dy, dz) => ({
            vis: poly([x, y, z + dz], [x + dx, y, z + dz], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]) +
                seg([x + dx, y, z], [x + dx, y + dy, z]) + seg([x, y + dy, z], [x + dx, y + dy, z]) +
                seg([x + dx, y, z], [x + dx, y, z + dz]) + seg([x + dx, y + dy, z], [x + dx, y + dy, z + dz]) + seg([x, y + dy, z], [x, y + dy, z + dz]),
            oc: seg([x, y, z], [x + dx, y, z]) + seg([x, y, z], [x, y + dy, z]) + seg([x, y, z], [x, y, z + dz]),
            caras: poly([x, y, z + dz], [x + dx, y, z + dz], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]) +
                poly([x + dx, y, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x + dx, y, z + dz]) +
                poly([x, y + dy, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x, y + dy, z + dz])
        });
        const out = [];
        const traza = (cls, d, extra = '') => { if (d) out.push(`<path class="${cls}" d="${d}"${extra}/>`); };
        const texto = (cls, a, b, rot, dx, dy, t) => {
            const pa = P(...a), pb = P(...b);
            out.push(`<text class="${cls}" transform="translate(${((pa[0] + pb[0]) / 2 + dx).toFixed(1)} ${((pa[1] + pb[1]) / 2 + dy).toFixed(1)}) rotate(${rot})">${t}</text>`);
        };
        const marca = (a) => { const q = P(...a); return `M${(q[0] - 2.6).toFixed(1)} ${(q[1] - 2.6).toFixed(1)}L${(q[0] + 2.6).toFixed(1)} ${(q[1] + 2.6).toFixed(1)}`; };

        // Suelo, malla y lo que rodea
        traza('pl-suelo', poly([0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]));
        let reja = '';
        for (let x = malla; x < W; x += malla) reja += seg([x, 0, 0], [x, D, 0]);
        for (let y = malla; y < D; y += malla) reja += seg([0, y, 0], [W, y, 0]);
        traza('pl-reja', reja);
        if (bodega) {
            traza('pl-estr-o', poly([0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]));
        } else {
            traza('pl-muro', poly([0, 0, 0], [0, D, 0], [0, D, Hs], [0, 0, Hs]) + poly([0, 0, 0], [W, 0, 0], [W, 0, Hs], [0, 0, Hs]));
            traza('pl-estr-o', seg([W, D, 0], [W, D, Hs]) + seg([W, 0, Hs], [W, D, Hs]) + seg([0, D, Hs], [W, D, Hs]));
            traza('pl-estr', poly([0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]) + seg([0, 0, 0], [0, 0, Hs]) + seg([W, 0, 0], [W, 0, Hs]) +
                seg([0, D, 0], [0, D, Hs]) + seg([0, 0, Hs], [W, 0, Hs]) + seg([0, 0, Hs], [0, D, Hs]), ' pathLength="1"');
        }

        // El cuarto o la bodega
        const cuerpo = caja(x0, y0, 0, L, A, H);
        traza('pl-oculta', cuerpo.oc);
        if (!bodega) {
            const ew = Math.min(1.2, A * 0.4);
            const evap = caja(x0 + 0.06, yc - ew / 2, H - 0.52, 0.4, ew, 0.38);
            traza('pl-equipo', evap.vis + evap.oc);
        }
        if (!bodega && o.formato) producto();
        traza('pl-cara', cuerpo.caras);
        let juntas = '';
        const pj = bodega ? malla : 1;
        for (let k = pj; k < A - 0.05; k += pj) juntas += seg([x1, y0 + k, 0], [x1, y0 + k, H]);
        for (let k = pj; k < L - 0.05; k += pj) juntas += seg([x0 + k, y1, 0], [x0 + k, y1, H]);
        if (bodega) {
            const niveles = clamp(Math.floor(H / 1.9), 1, 12);
            for (let k = 1; k < niveles; k++) { const z = H * k / niveles; juntas += seg([x0, y1, z], [x1, y1, z]) + seg([x1, y0, z], [x1, y1, z]); }
        }
        traza('pl-junta', juntas);
        traza('pl-cuarto', cuerpo.vis, ' pathLength="1"');

        if (bodega) {
            const hp = Math.min(H, 6);
            const zona = caja(x1, y0, 0, pre, A, hp);
            traza('pl-pre', zona.caras);
            traza('pl-pre-l', zona.vis);
            const n = clamp(Math.floor(A / 8), 1, 8), pw = Math.min(3, A * 0.5), ph = Math.min(3.2, hp - 0.3);
            let puertas = '';
            for (let i = 0; i < n; i++) {
                const y = y0 + A * (i + 0.5) / n - pw / 2;
                puertas += poly([x1 + pre, y, 0], [x1 + pre, y + pw, 0], [x1 + pre, y + pw, ph], [x1 + pre, y, ph]);
            }
            traza('pl-puerta', puertas);
        } else {
            const dw = Math.min(0.9, A * 0.6), dh = Math.min(2, H - 0.2);
            traza('pl-puerta', poly([x1, yc - dw / 2, 0], [x1, yc + dw / 2, 0], [x1, yc + dw / 2, dh], [x1, yc - dw / 2, dh]));
            const cond = caja(x0 + 0.25, y0 + 0.25, H, 0.9, 0.55, 0.5);
            traza('pl-tubo', seg([x0 + 0.3, y0 + 0.8, H], [x0 + 0.3, yc, H]) + seg([x0 + 0.3, yc, H], [x0 + 0.3, yc, H - 0.14]));
            traza('pl-equipo-f', cond.caras);
            traza('pl-equipo', cond.vis);
            texto('pl-nota', [x0 + 0.25, y0 + 0.25, H + 0.5], [x0 + 1.15, y0 + 0.8, H + 0.5], 0, 0, -7, 'equipo de frío');
            texto('pl-nota', [0, 0, Hs], [W, 0, Hs], 30, 0, -5, 'local de ejemplo');
        }

        // El producto adentro: columnas de canastillas o cajas, o piezas colgadas en rieles
        function producto() {
            const [c1, c2, c3] = o.color || ['#8EC3DE', '#5E97B6', '#B9DCEE'];
            const frac = Math.max(0, Math.min(1, o.frac || 0));
            const cara = (pts, fill) => out.push(`<path class="pl-prod" d="${poly(...pts)}" fill="${fill}" stroke="${c2}"/>`);
            const bloque = (x, y, z, dx, dy, dz) => {
                cara([[x, y, z + dz], [x + dx, y, z + dz], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]], c3);
                cara([[x, y + dy, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]], c1);
                cara([[x + dx, y, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x + dx, y, z + dz]], c2);
            };
            if (o.formato === 'riel') {
                const rieles = clamp(Math.floor((A - 0.6) / 0.7) + 1, 1, 4), zr = H - 0.3, largo = Math.min(1.8, H - 0.6);
                const ys = rieles === 1 ? [yc] : Array.from({ length: rieles }, (_, i) => y0 + 0.45 + i * (A - 0.9) / (rieles - 1));
                traza('pl-riel', ys.map((y) => seg([x0 + 0.1, y, zr], [x1 - 0.1, y, zr])).join(''));
                const porRiel = Math.max(1, Math.floor((L - 0.3) / 0.45));
                const lugares = [];
                ys.forEach((y) => { for (let j = 0; j < porRiel; j++) lugares.push([x0 + 0.3 + j * (L - 0.6) / Math.max(1, porRiel - 1), y]); });
                lugares.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1])).slice(0, Math.round(frac * lugares.length))
                    .forEach(([x, y]) => bloque(x - 0.07, y - 0.16, zr - largo, 0.14, 0.32, largo - 0.12));
                return;
            }
            let cw = o.formato === 'canastilla' ? 0.6 : 0.5, cd = 0.4;
            const ch = o.formato === 'canastilla' ? 0.3 : 0.32;
            const esc = Math.max(1, Math.sqrt(((L - 0.2) / cw) * ((A - 0.2) / cd) / 70));
            cw *= esc; cd *= esc;
            const nx = Math.max(1, Math.floor((L - 0.2) / cw)), ny = Math.max(1, Math.floor((A - 0.2) / cd));
            const niveles = clamp(Math.floor((H - 0.55) / ch), 1, 8);
            const celdas = [];
            for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
                const x = x0 + 0.1 + i * cw, y = y0 + 0.1 + j * cd;
                if (y + cd > yc - 0.45 && y < yc + 0.45 && x + cw > x0 + L * 0.45) continue;      // pasillo desde la puerta
                celdas.push([x, y]);
            }
            celdas.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[0] - b[0]);
            let n = Math.round(frac * celdas.length * niveles);
            celdas.forEach(([x, y]) => {
                const k = Math.min(niveles, n); n -= k;
                if (k > 0) bloque(x + 0.03 * esc, y + 0.03 * esc, 0, cw - 0.06 * esc, cd - 0.06 * esc, k * ch);
            });
        }

        // Referencias a escala
        const persona = (px, py) => {
            const h = P(px, py, 1.6);
            out.push(`<circle class="pl-ref-p" cx="${h[0].toFixed(1)}" cy="${h[1].toFixed(1)}" r="${Math.max(1.4, 0.11 * s).toFixed(1)}"/>`);
            traza('pl-ref pl-ref--persona', seg([px, py, 1.46], [px, py, 0.88]) + seg([px, py, 0.88], [px - 0.1, py + 0.1, 0]) + seg([px, py, 0.88], [px + 0.1, py - 0.1, 0]) +
                seg([px, py, 1.36], [px - 0.24, py + 0.12, 0.98]) + seg([px, py, 1.36], [px + 0.24, py - 0.12, 0.98]));
        };
        if (bodega) {
            const remolque = caja(xc, yc - 1.3, 0.9, 13.6, 2.6, 3.1), cabina = caja(xc + 13.9, yc - 1.25, 0.5, 2.4, 2.5, 2.9);
            traza('pl-ref-f', remolque.caras + cabina.caras);
            traza('pl-ref', remolque.vis + cabina.vis + seg([xc, yc - 1.3, 0], [xc, yc - 1.3, 0.9]) + seg([xc + 13.6, yc + 1.3, 0], [xc + 13.6, yc + 1.3, 0.9]));
            if (1.7 * s >= 6) persona(xc + 3, yc + 3.2);
            if (16.3 * s >= 60) texto('pl-nota', [xc, yc + 1.3, 0], [xc + 16.3, yc + 1.3, 0], 30, 0, 13, 'tractomula · 16 m');
            if (cancha) {
                const cy0 = y1 + sep;
                traza('pl-ref-f', poly([ox, cy0, 0], [ox + 105, cy0, 0], [ox + 105, cy0 + 68, 0], [ox, cy0 + 68, 0]));
                traza('pl-ref', poly([ox, cy0, 0], [ox + 105, cy0, 0], [ox + 105, cy0 + 68, 0], [ox, cy0 + 68, 0]) + seg([ox + 52.5, cy0, 0], [ox + 52.5, cy0 + 68, 0]));
                texto('pl-nota', [ox, cy0 + 68, 0], [ox + 105, cy0 + 68, 0], 30, 0, 14, o.canchas ? `cancha de fútbol · su bodega mide ${num(o.canchas, o.canchas < 10 ? 1 : 0)} canchas` : 'cancha de fútbol · 105 × 68 m');
            }
        } else {
            const ya = yc - 0.45;
            const yp = Math.max(0.2, ya - 1.5);
            const e1 = caja(x1 + 1.9, yp, 0, 1, 1.2, 0.15), e2 = caja(x1 + 3.1, yp, 0, 1, 1.2, 0.15);
            traza('pl-ref', e1.vis + e2.vis);
            persona(x1 + 2.9, yc + 1.9);
        }

        // Cotas
        const yL = y1 + off, xA = x1 + pre + off;
        let cota = seg([x0, y1, 0], [x0, yL, 0]) + seg([x1, y1, 0], [x1, yL, 0]) + seg([x0, yL, 0], [x1, yL, 0]) +
            seg([x1 + pre, y0, 0], [xA, y0, 0]) + seg([x1 + pre, y1, 0], [xA, y1, 0]) + seg([xA, y0, 0], [xA, y1, 0]) +
            seg([x0, yL, 0], [x0, yL, H]) + seg([x0, y1, H], [x0, yL, H]);
        cota += marca([x0, yL, 0]) + marca([x1, yL, 0]) + marca([xA, y0, 0]) + marca([xA, y1, 0]) + marca([x0, yL, H]);
        traza('pl-cota', cota);
        const m = (v) => `${num(v, bodega && (v >= 20 || Number.isInteger(v)) ? 0 : 1)} m`;
        texto('pl-cota-t', [x0, yL, 0], [x1, yL, 0], 30, -6, 15, m(o.L));
        texto('pl-cota-t', [xA, y0, 0], [xA, y1, 0], -30, 6, 15, m(o.A));
        texto('pl-cota-t', [x0, yL, 0], [x0, yL, H], -90, -7, 0, m(o.H));

        // Escala gráfica
        const bx = W - (bodega ? ox * 0.35 : 0.4), by = D - (bodega ? oy * 0.35 : 0.3);
        traza('pl-escala', seg([bx - malla, by, 0], [bx, by, 0]) + marca([bx - malla, by, 0]) + marca([bx, by, 0]));
        texto('pl-nota', [bx - malla, by, 0], [bx, by, 0], 30, 0, -5, `${num(malla)} m`);

        if (!bodega && o.frac > 1) out.push(`<text class="pl-aviso" x="${VW / 2}" y="26">No cabe todo</text>`);
        out.push(`<text class="pl-rotulo" x="${VW - 12}" y="${VH - 10}">${o.rotulo || 'DIBUJO A ESCALA · MEDIDAS POR DENTRO'}</text>`);
        svg.innerHTML = out.join('');
    }

    window.FrigoPacPlano = { pintar };
})();
