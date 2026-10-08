/* ============================================
   FRIGOPAC - Arme su cuarto frío (configurador)
   La física vive en js/frigopac-engine.js (window.FrigoPacEngine). Aquí no se calcula nada:
   se arma la entrada, se llama al motor y se muestra el resultado en lenguaje del cliente.
   Lo técnico (BTU, supuestos, confianza) solo viaja en la ficha para FrigoPac.
   ============================================ */
(function () {
    'use strict';
    const FE = window.FrigoPacEngine;
    const M = window.FrigoPacModelo;
    const raiz = document.getElementById('projectEngine');
    if (!FE || !M || !raiz) return;

    // ── Configuración de la página (no son datos de ingeniería) ──
    const CONFIG = Object.assign({
        whatsapp: '573103330737',
        crmEndpoint: '',               // URL de la hoja de Google (Apps Script). Vacío = solo WhatsApp.
        categorias: [
            { id: 'carnes', nombre: 'Carnes', icono: '<path d="M7 17c-3-3-3-8 1-11s9-2 10 2-1 7-4 9-5 3-7 0z"/><circle cx="14" cy="9" r="1.6"/>' },
            { id: 'aves', nombre: 'Pollo', icono: '<path d="M8 20h8M12 20v-4M6 10a6 6 0 1 1 12 0c0 3-2 6-6 6s-6-3-6-6z"/><path d="M15 6l3-2"/>' },
            { id: 'pescados', nombre: 'Pescado y mariscos', icono: '<path d="M3 12c3-4 8-5 12-3l4-3v12l-4-3c-4 2-9 1-12-3z"/><circle cx="8" cy="11" r="1"/>' },
            { id: 'frutas_verduras', nombre: 'Frutas y verduras', icono: '<path d="M12 7c-4-2-8 1-7 6s4 8 7 8 6-3 7-8-3-8-7-6z"/><path d="M12 7c0-2 1-4 3-4"/>' },
            { id: 'lacteos', nombre: 'Lácteos', icono: '<path d="M9 3h6v3l2 3v12H7V9l2-3z"/><path d="M7 13h10"/>' },
            { id: 'congelados', nombre: 'Helados', icono: '<path d="M8 10a4 4 0 0 1 8 0z"/><path d="M8 10l4 11 4-11"/>' },
            { id: 'otro', nombre: 'Otro producto', icono: '<rect x="4" y="7" width="16" height="12" rx="1"/><path d="M4 11h16M10 7V4h4v3"/>' }
        ],
        // Temperatura con la que arranca el dibujo (el cliente la mueve; FrigoPac la confirma).
        tempRefrigerado: { carnes: 2, aves: 2, pescados: 0, lacteos: 4 },
        tempCongelado: -18,
        tempHelado: -20,
        rangoRefrigerar: [-2, 16],
        rangoCongelar: [-30, -15],
        altoPorDefecto: 2.4,
        // Valores de arranque y rango de los controles de cantidad.
        inicio: { canastillas: [100, 20], kg: [1000, 300] },
        rango: { canastillas: [5, 3000], kg: [50, 60000] },
        // Proyectos reales para "Cuartos parecidos". Vacío = la sección no aparece.
        // { id, titulo, categoria, modo: 'refrigerar'|'congelar', largo, ancho, ciudad, dias, foto }
        proyectos: [],
        muestraParecidos: false
    }, window.FRIGOPAC_CONFIG || {});

    const $ = (id) => document.getElementById(id);
    const num = (x, d = 0) => Number(x).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
    const pesos = (x) => '$' + num(Math.round(x / 10000) * 10000);
    const productos = FE.datos.listaProductos();
    const ciudades = FE.datos.listaCiudades();
    const conservacion = FE.datos.conservacionDatos ? FE.datos.conservacionDatos() : { productos: {}, congelacion: { t_max_c: -18 } };
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const S = {
        pantalla: 'inicio',
        cat: null, producto: null, ciudad: null, climaOtro: null, lugar: 'comercial', estrato: '4',
        modo: 'refrigerar', t: null, formato: null, unidad: 'canastillas', guardo: null, llegan: null, estado: null,
        tam: 'auto', largo: 3, ancho: 3, alto: CONFIG.altoPorDefecto,
        uso: 'medio', cortina: false, piso: false,
        vista: 'cuarto', bt: null, bsis: null, balt: null, bmodo: 'toneladas', blargo: null, bancho: null,
        probados: [], armado: null,
        id: null, contacto: null, etapa: null
    };

    // ── Dominio ──
    const prod = () => (S.producto ? FE.datos.producto(S.producto) : null);
    const nombreProd = (p = prod()) => M.nombreCorto(p);
    const minus = (s) => s.charAt(0).toLowerCase() + s.slice(1);
    const kgCanastilla = M.kgCanastilla;
    const aKg = (x) => M.aKg(S, x);
    const ciudadMotor = () => M.ciudadMotor(S);
    const nombreCiudad = () => (S.ciudad === 'otra' ? 'su ciudad' : (ciudades.find((c) => c.id === S.ciudad) || {}).nombre);
    const fmtT = (t) => `${t < 0 ? '−' : ''}${Math.abs(t)} °C`;
    const esFruta = (p = prod()) => p.categoria === 'frutas_verduras';
    const rangoTxt = (lo, hi) => (lo === hi ? `a ${fmtT(lo)}` : `entre ${fmtT(lo)} y ${fmtT(hi)}`);

    function tempInicial(p, modo) {
        if (p.categoria === 'congelados') return CONFIG.tempHelado;
        if (modo === 'congelar') return CONFIG.tempCongelado;
        if (p.almacenamiento) return Math.round((p.almacenamiento.t_min_c + p.almacenamiento.t_max_c) / 2);
        return CONFIG.tempRefrigerado[p.categoria];
    }
    function estadoInicial(p) {
        if (S.modo === 'congelar' && p.t_congelacion_c != null) return 'congelado';
        return p.entrada_por_defecto.estado;
    }
    // Franja de temperatura que el cliente ve como "bien" para su producto (datos con fuente).
    function bandaIdeal(p) {
        if (S.modo === 'congelar' || p.categoria === 'congelados') return { lo: CONFIG.rangoCongelar[0], hi: conservacion.congelacion.t_max_c };
        if (p.almacenamiento) return { lo: p.almacenamiento.t_min_c, hi: p.almacenamiento.t_max_c };
        const c = conservacion.productos[p.id];
        if (!c) return null;
        if (c.t_ideal_c != null) return { lo: p.t_congelacion_c ?? c.t_ideal_c, hi: c.t_ideal_c, ideal: c.t_ideal_c };
        return { lo: c.t_min_c ?? p.t_congelacion_c ?? 0, hi: c.t_max_c, norma: true, loCongela: c.t_min_c == null && p.t_congelacion_c != null };
    }

    function proponer() {
        if (S.tam !== 'auto' || !prod()) return;
        const kg = aKg(S.guardo);
        if (!kg) return;
        const d = FE.dimensionar(S.producto, kg, S.t, { unidad: 'kg', altoM: S.alto, formato: S.formato || null });
        if (d.encontrado) { S.largo = d.largo_m; S.ancho = d.ancho_m; }
    }
    const correr = (extra) => M.correr(S, extra);

    // ── Pantallas ──
    function mostrar(p) {
        S.pantalla = p;
        raiz.querySelectorAll('.pe-pantalla').forEach((s) => { s.hidden = s.dataset.pantalla !== p; });
        document.body.classList.toggle('pe-en-taller', p === 'taller');
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function marcar(id, attr, valor) {
        $(id).querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-checked', String(b.dataset[attr] === String(valor))));
    }

    // ── Inicio ──
    function pintarInicio() {
        $('peCategorias').innerHTML = CONFIG.categorias.map((c) =>
            `<button type="button" class="pe-cat" role="radio" data-cat="${c.id}" aria-checked="${c.id === S.cat}"><svg viewBox="0 0 24 24" aria-hidden="true">${c.icono}</svg>${c.nombre}</button>`).join('');
        const lista = productos.filter((p) => p.categoria === S.cat);
        $('peProductos').hidden = lista.length < 2;
        $('peProductos').innerHTML = lista.map((p) =>
            `<button type="button" class="pe-chip" role="radio" data-prod="${p.id}" aria-checked="${p.id === S.producto}">${nombreProd(p)}</button>`).join('');
        $('peOtro').hidden = S.cat !== 'otro';
        $('peCiudades').innerHTML = ciudades.map((c) =>
            `<button type="button" class="pe-chip" role="radio" data-ciudad="${c.id}" aria-checked="${c.id === S.ciudad}">${c.nombre}</button>`).join('') +
            `<button type="button" class="pe-chip" role="radio" data-ciudad="otra" aria-checked="${S.ciudad === 'otra'}">Otra ciudad</button>`;
        $('peClimaWrap').hidden = S.ciudad !== 'otra';
        marcar('peClima', 'clima', S.climaOtro);
        marcar('peLugar', 'lugar', S.lugar);
        $('peEstratoWrap').hidden = S.lugar !== 'residencial';
        marcar('peEstrato', 'estrato', S.estrato);
        $('peArmar').disabled = !(S.producto && S.cat !== 'otro' && S.ciudad && (S.ciudad !== 'otra' || S.climaOtro));
    }

    // Al cambiar de producto (o la primera vez) el taller arranca en valores razonables.
    function prepararTaller() {
        const p = prod();
        if (S.armado === p.id) return;
        S.armado = p.id;
        S.modo = p.categoria === 'congelados' ? 'congelar' : 'refrigerar';
        S.t = tempInicial(p, S.modo);
        const riel = FE.capacidad(3, 3, CONFIG.altoPorDefecto, p.id, S.t).formato === 'riel';
        S.unidad = (p.categoria === 'congelados' || riel) ? 'kg' : 'canastillas';
        [S.guardo, S.llegan] = CONFIG.inicio[S.unidad];
        S.estado = estadoInicial(p);
        S.tam = 'auto'; S.alto = CONFIG.altoPorDefecto;
        S.cortina = false; S.piso = false; S.formato = null;
    }

    // ── Controles ──
    const logA = (v, [a, b]) => (v <= 0 ? 0 : Math.round(1000 * Math.log(Math.max(v, a) / a) / Math.log(b / a)));
    function logDe(x, [a, b]) {
        if (x <= 0) return 0;
        const v = a * Math.pow(b / a, x / 1000);
        const paso = v < 100 ? 1 : v < 1000 ? 10 : v < 10000 ? 50 : 100;
        return Math.round(v / paso) * paso;
    }
    function pintarControles() {
        const p = prod();
        const soloCongelar = p.categoria === 'congelados';
        const soloRefrigerar = esFruta(p) || p.categoria === 'lacteos';
        $('peModo').querySelector('[data-modo="refrigerar"]').disabled = soloCongelar;
        $('peModo').querySelector('[data-modo="congelar"]').disabled = soloRefrigerar;
        marcar('peModo', 'modo', S.modo);
        const [tmin, tmax] = S.modo === 'congelar' ? CONFIG.rangoCongelar : CONFIG.rangoRefrigerar;
        const tr = $('peTemp'); tr.min = tmin; tr.max = tmax; tr.value = S.t;
        $('peTempOut').textContent = fmtT(S.t);
        const b = bandaIdeal(p), banda = $('peBanda');
        if (b) {
            const pos = (t) => Math.max(0, Math.min(100, (t - tmin) / (tmax - tmin) * 100));
            banda.hidden = false;
            banda.style.left = pos(Math.max(b.lo, tmin)) + '%';
            banda.style.width = Math.max(2, pos(Math.min(b.hi, tmax)) - pos(Math.max(b.lo, tmin))) + '%';
            $('peTempHint').textContent = b.norma
                ? (b.loCongela ? `La franja verde va desde donde se empieza a congelar (${fmtT(b.lo)}) hasta lo que permite la norma (${fmtT(b.hi)}).` : `La franja verde es lo que pide la norma: ${rangoTxt(b.lo, b.hi)}.`)
                : b.ideal != null
                ? `La franja verde es lo mejor para ${minus(nombreProd(p))}: cerca de ${fmtT(b.ideal)}, como en hielo.`
                : S.modo === 'congelar' || soloCongelar
                    ? `La franja verde es lo que pide la norma para congelado: ${fmtT(b.hi)} o menos.`
                    : `La franja verde es lo mejor para ${minus(nombreProd(p))}: ${rangoTxt(b.lo, b.hi)}.`;
        } else { banda.hidden = true; $('peTempHint').textContent = ''; }

        const fmt = ultimo ? ultimo.al.formato : 'canastilla';
        $('peFormato').querySelector('[data-formato="riel"]').hidden = p.categoria !== 'carnes';
        marcar('peFormato', 'formato', fmt);
        $('peUnidad').hidden = fmt !== 'canastilla';
        marcar('peUnidad', 'unidad', S.unidad);
        const rg = CONFIG.rango[S.unidad];
        $('peGuardo').value = logA(S.guardo, rg); $('peLlegan').value = logA(S.llegan, rg);
        if (document.activeElement !== $('peGuardoNum')) $('peGuardoNum').value = S.guardo;
        if (document.activeElement !== $('peLleganNum')) $('peLleganNum').value = S.llegan;
        raiz.querySelectorAll('.peUnidadTxt').forEach((el) => { el.textContent = S.unidad === 'kg' ? 'kg' : 'canastillas'; });

        const opciones = p.categoria === 'congelados' ? ['congelado'] : S.t < 0 ? ['ambiente', 'refrigerado', 'congelado'] : ['ambiente', 'refrigerado'];
        if (!opciones.includes(S.estado)) S.estado = opciones.includes(p.entrada_por_defecto.estado) ? p.entrada_por_defecto.estado : opciones[0];
        $('peEstado').querySelectorAll('[data-estado]').forEach((b2) => { b2.hidden = !opciones.includes(b2.dataset.estado); });
        $('peEstado').hidden = opciones.length < 2; $('peEstadoLbl').hidden = opciones.length < 2;
        marcar('peEstado', 'estado', S.estado);

        marcar('peTam', 'tam', S.tam);
        [['peLargo', 'largo'], ['peAncho', 'ancho'], ['peAlto', 'alto']].forEach(([id, k]) => { $(id).value = S[k]; $(id + 'Out').textContent = num(S[k], 1) + ' m'; });
        $('peTamHint').textContent = S.tam === 'auto'
            ? 'Le proponemos el tamaño para lo que guarda, con espacio para crecer: casi siempre llega más producto del que se planea. Si mueve el largo o el ancho, pasa a "Tengo un espacio".'
            : 'Ponga las medidas por dentro del espacio que tiene.';
        marcar('pePuerta', 'uso', S.uso);
    }

    // ── Pintar todo ──
    let pendiente = false, ultimo = null;
    function actualizar() {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => { pendiente = false; pintarTaller(); });
    }
    function pintarTaller() {
        proponer();
        const p = prod();
        let x = correr();
        if (x.al.formato !== 'canastilla' && S.unidad === 'canastillas') {
            const k = kgCanastilla(p);
            S.guardo = Math.round(S.guardo * k); S.llegan = Math.round(S.llegan * k); S.unidad = 'kg';
        }
        ultimo = x;
        pintarControles();

        $('peCabezaSub').textContent = `${nombreProd(p)} · ${nombreCiudad()}`;
        $('peCabezaTitulo').textContent = `Cuarto ${S.t < 0 ? 'de congelación' : 'refrigerado'} de ${num(S.largo, 1)} × ${num(S.ancho, 1)} m`;

        const guardoKg = aKg(S.guardo);
        const frac = guardoKg / x.al.kg;
        dibujarCuarto($('peCuarto'), { L: S.largo, A: S.ancho, H: S.alto, formato: x.al.formato, frac, t: S.t, cat: p.categoria });
        const tc = $('peTempChip');
        tc.textContent = fmtT(S.t);
        tc.dataset.frio = S.t < 0 ? 'congelado' : 'refrigerado';

        const caben = textoCaben(x.al);
        $('peCaben').textContent = caben;
        $('peOcupBar').style.width = Math.min(100, frac * 100) + '%';
        $('peOcupBar').parentElement.dataset.lleno = frac > 1 ? 'no-cabe' : frac > 0.9 ? 'justo' : 'bien';
        $('peOcupTxt').textContent = frac > 1 ? 'Lo que guarda no cabe completo.' : `Lo que usted guarda ocupa el ${Math.round(frac * 100)} %.`;

        $('peLuz').textContent = `Cerca de ${pesos(x.en.costo_mes_promedio_cop)}`;
        const tf = x.en.tarifa;
        const quien = { comercial: 'local comercial', industrial: 'bodega o planta', residencial: `casa estrato ${S.estrato}` }[S.lugar];
        $('peLuzSub').textContent = `Tarifa de ${tf.operador}, ${quien}. Entre ${pesos(x.en.rango_costo_mes_cop[0])} y ${pesos(x.en.rango_costo_mes_cop[1])} según el equipo que se instale y el uso real.`;
        pintarMeses(x.en.meses);

        $('peBarraCaben').textContent = caben;
        $('peBarraLuz').textContent = pesos(x.en.costo_mes_promedio_cop);

        pintarGuarda(x);
        pintarPiso(x);
        const dm = S.tam === 'auto' ? FE.dimensionar(S.producto, aKg(S.guardo), S.t, { unidad: 'kg', altoM: S.alto, formato: S.formato || null }) : { encontrado: true };
        $('peAvisoBodega').hidden = !(aKg(S.guardo) > 60000 || !dm.encontrado);
        pintarCalor(x);
        pintarMejoras(x);
        pintarTarjetas(x, frac, caben);
        pintarVisita(x);
        pintarParecidos();
    }

    function textoCaben(al) {
        if (al.formato === 'canastilla') return `${num(Math.round(al.canastillas_equivalentes / 10) * 10)} canastillas`;
        if (al.formato === 'riel') return `${num(Math.round(al.kg / 10) * 10)} kg colgados`;
        return `${num(Math.round(al.kg / 100) * 100)} kg en cajas`;
    }

    const MESES = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    function pintarMeses(meses) {
        const vals = meses.map((m) => m.costo_cop);
        const max = Math.max(...vals), min = Math.min(...vals);
        const base = min - (max - min || max * 0.1) * 1.2;
        $('peMeses').innerHTML = meses.map((m, i) =>
            `<span title="${pesos(m.costo_cop)}"><i style="height:${Math.max(12, (m.costo_cop - base) / (max - base) * 100)}%"></i><b>${MESES[i]}</b></span>`).join('');
    }

    function pintarPiso(x) {
        const bajoCero = S.t < 0;
        $('pePiso').querySelector('[data-piso="no"]').disabled = bajoCero;
        marcar('pePiso', 'piso', bajoCero || S.piso ? 'si' : 'no');
        if (bajoCero) { $('pePisoHint').textContent = 'Bajo cero el piso va aislado siempre, con calefacción debajo para que el frío no congele la tierra y levante el piso.'; return; }
        const otro = correr({ piso: !S.piso });
        const d = Math.abs(otro.en.costo_mes_promedio_cop - x.en.costo_mes_promedio_cop);
        $('pePisoHint').textContent = S.piso
            ? `Aislado le ahorra cerca de ${pesos(d)} al mes frente a dejarlo sobre el concreto.`
            : `Sin aislar, el suelo le mete calor al cuarto. Aislarlo le ahorraría cerca de ${pesos(d)} al mes.`;
    }

    function pintarGuarda(x) {
        const ex = M.explicarCapacidad(S, x.al);
        $('peGuardaTitulo').textContent = `Cómo se guarda: ${ex.titulo.charAt(0).toLowerCase() + ex.titulo.slice(1)}`;
        $('peGuardaNota').textContent = ex.nota;
        $('peGuardaNota').hidden = !ex.nota;
        $('peGuardaTexto').textContent = ex.texto;
        $('peGuardaPasos').innerHTML = ex.pasos.map((t) => `<li>${t}</li>`).join('');
        $('peGuardaAlterno').textContent = ex.alterno ? ex.alterno.texto : '';
        $('peGuardaAlterno').hidden = !ex.alterno;
        $('peGuardaDibujo').innerHTML = dibujarUnidad(x.al.formato, prod().categoria);
    }

    // Dibujo pequeño de la unidad en que se guarda (canastilla, caja, estiba o riel)
    function dibujarUnidad(formato, cat) {
        const [c1, c2, c3] = COLOR[cat] || COLOR.congelados;
        const cs = Math.cos(Math.PI / 6), sn = 0.5;
        const caja = (x0, y0, w, d, h, s, colores, extra = '') => {
            const P = (x, y, z) => `${(x0 + (x - y) * cs * s).toFixed(1)},${(y0 + (x + y) * sn * s - z * s).toFixed(1)}`;
            const [a, b, c] = colores;
            return `<polygon points="${[P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)].join(' ')}" fill="${c}" stroke="${b}" stroke-width="1"/>` +
                `<polygon points="${[P(0, d, 0), P(w, d, 0), P(w, d, h), P(0, d, h)].join(' ')}" fill="${a}" stroke="${b}" stroke-width="1"/>` +
                `<polygon points="${[P(w, 0, 0), P(w, d, 0), P(w, d, h), P(w, 0, h)].join(' ')}" fill="${b}" stroke="${b}" stroke-width="1"/>` + extra;
        };
        if (formato === 'riel') {
            return '<line x1="20" y1="18" x2="160" y2="18" stroke="#475569" stroke-width="4" stroke-linecap="round"/>' +
                [55, 90, 125].map((x) => `<line x1="${x}" y1="18" x2="${x}" y2="30" stroke="#475569" stroke-width="1.5"/><path d="M${x - 9},30 C${x - 20},70 ${x - 14},112 ${x},112 C${x + 14},112 ${x + 20},70 ${x + 9},30 Z" fill="${c1}" stroke="${c2}"/>`).join('') +
                '<text x="90" y="126" text-anchor="middle" class="gu-t">rieles cada 80 cm</text>';
        }
        if (formato === 'canastilla') {
            const s = 110;
            let g = caja(70, 30, 0.6, 0.4, 0.25, s, [c1, c2, c3]);
            // ranuras de la canastilla
            for (let i = 1; i < 5; i++) {
                const x0 = 70 + (0.6 * i / 5 - 0.4) * cs * s, y0 = 30 + (0.6 * i / 5 + 0.4) * sn * s;
                g += `<line x1="${x0.toFixed(1)}" y1="${(y0 - 0.05 * s).toFixed(1)}" x2="${x0.toFixed(1)}" y2="${(y0 - 0.2 * s).toFixed(1)}" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>`;
            }
            return g + '<text x="90" y="124" text-anchor="middle" class="gu-t">60 × 40 × 25 cm</text>';
        }
        // cajas o estiba: estiba con cajas apiladas
        const s = 52;
        let g = caja(78, 36, 1.2, 1.0, 0.15, s, ['#B08A5A', '#8C6A40', '#C9A676']);
        const bw = 0.4, bd = 0.333, bh = 0.32;
        for (let z = 0; z < 5; z++) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
            const x0 = 78 + (i * bw - j * bd) * cs * s, y0 = 36 + (i * bw + j * bd) * sn * s - (0.15 + z * bh) * s;
            g += caja(x0, y0, bw - 0.01, bd - 0.01, bh - 0.01, s, formato === 'estiba' || cat !== 'congelados' ? ['#D9B98A', '#A9854F', '#E8D2AE'] : [c1, c2, c3]);
        }
        return g + '<text x="90" y="126" text-anchor="middle" class="gu-t">estiba 1,2 × 1,0 m</text>';
    }

    function pintarCalor(x) {
        const p = prod(), d = x.r.detalle;
        const nombres = {
            transmision: 'Paredes, techo y piso',
            producto: d.producto.respiracion_w > 0 ? `Enfriar ${minus(nombreProd(p))} y lo que respira` : d.producto.latente_w > 0 ? 'Enfriar y congelar lo que llega' : 'Enfriar lo que llega cada día',
            aire: d.aire.ventilacion_co2_w > 0 ? 'Aire de la puerta y de la ventilación' : 'Aire que entra por la puerta',
            internas: 'Luces y personas adentro',
            equipos: 'Ventiladores y deshielo del equipo'
        };
        const filas = Object.entries(x.r.desglose_pct).sort((a, b) => b[1] - a[1]);
        const cont = $('peCalor');
        if (cont.children.length !== filas.length) cont.innerHTML = filas.map(() => '<div class="pe-calor__f"><span class="pe-calor__n"></span><span class="pe-calor__p"></span><div class="pe-calor__b"><i></i></div></div>').join('');
        filas.forEach(([k, pct], i) => {
            const f = cont.children[i];
            f.querySelector('.pe-calor__n').textContent = nombres[k];
            f.querySelector('.pe-calor__p').textContent = `${Math.round(pct)} %`;
            f.querySelector('i').style.width = Math.max(1, pct) + '%';
            f.dataset.clave = k;
        });
    }

    function pintarMejoras(x) {
        const ops = [{ k: 'cortina', t: 'Cortina de PVC en la puerta', s: 'Tiras de plástico que frenan el aire caliente cada vez que se abre.' }];
        $('peMejoras').innerHTML = ops.map((o) => {
            const on = !!S[o.k];
            const otro = correr({ [o.k]: !on });
            const conE = on ? x : otro, sinE = on ? otro : x;
            const dLuz = sinE.en.costo_mes_promedio_cop - conE.en.costo_mes_promedio_cop;
            const dCalor = (1 - conE.r.carga_24h_kw / sinE.r.carga_24h_kw) * 100;
            const efecto = dLuz >= 5000 ? `Ahorra cerca de ${pesos(dLuz)} al mes` : dCalor >= 1 ? `${Math.round(dCalor)} % menos calor` : 'Cambio pequeño';
            return `<button type="button" class="pe-mejora" data-mejora="${o.k}" aria-pressed="${on}"><span class="pe-toggle" aria-hidden="true"></span><span><strong>${o.t}</strong><small>${o.s}</small><em>${efecto}</em></span></button>`;
        }).join('');
    }

    // ── Tarjetas de lo que debe saber (de persona a persona, sin referencias) ──
    function pintarTarjetas(x, frac, caben) {
        const p = prod(), n = nombreProd(p), nm = minus(n), t = S.t, T = [];
        const add = (nivel, titulo, texto) => T.push({ nivel, titulo, texto });
        const alertas = new Set(x.r.alertas.map((a) => a.regla));

        if (frac > 1) add('alerta', 'Lo que guarda no cabe', `En este cuarto le caben ${caben}. Agrande las medidas o toque "A la medida de mi producto" y se lo proponemos.`);

        const c = conservacion.productos[p.id];
        if (S.modo === 'congelar' || p.categoria === 'congelados') {
            if (t > conservacion.congelacion.t_max_c) add('alerta', 'Muy caliente para congelado', `El producto congelado se guarda a ${fmtT(conservacion.congelacion.t_max_c)} o menos. Más arriba se empieza a ablandar y pierde calidad.`);
            else add('ok', `${fmtT(t)} está bien para congelado`, `La norma pide ${fmtT(conservacion.congelacion.t_max_c)} o menos. Más frío de eso cuesta más luz y no mejora mucho el producto.`);
        } else if (p.almacenamiento) {
            const a = p.almacenamiento;
            if (p.t_congelacion_c != null && t <= p.t_congelacion_c) add('alerta', `${n} se congela`, `${n} se congela cerca de ${fmtT(p.t_congelacion_c)}. A ${fmtT(t)} se daña: queda aguada y no se vende.`);
            else if (t < a.t_min_c) add('alerta', `${n} no aguanta tanto frío`, `Por debajo de ${fmtT(a.t_min_c)} se quema con el frío: se mancha, se ablanda o no madura bien. Para ${nm} el cuarto va ${rangoTxt(a.t_min_c, a.t_max_c)}.`);
            else if (t > a.t_max_c) add('aviso', `A ${fmtT(t)} dura menos`, `Donde mejor se conserva es ${rangoTxt(a.t_min_c, a.t_max_c)}. Cada grado de más le quita días.`);
            else add('ok', `${fmtT(t)} está bien para ${nm}`, `Lo mejor para ${nm} es ${rangoTxt(a.t_min_c, a.t_max_c)}. No lo baje de ahí: el frío de más también la daña.`);
        } else if (c) {
            if (p.t_congelacion_c != null && t < p.t_congelacion_c) add('aviso', `${n} empieza a congelarse`, `Se congela cerca de ${fmtT(p.t_congelacion_c)}. Si lo quiere fresco, súbale un poco; si lo quiere congelado, cambie a "Congelar".`);
            else if (c.t_ideal_c != null) {
                if (t >= 10) add('alerta', 'Se daña muy rápido', `A ${fmtT(t)} el pescado se daña unas cuatro veces más rápido que a 0 °C, que es como se guarda en hielo.`);
                else if (t >= 5) add('aviso', 'Muy caliente para pescado', `A ${fmtT(t)} el pescado se daña casi el doble de rápido que a 0 °C. Lo mejor es 0 °C, como en hielo.`);
                else if (t > c.t_ideal_c) add('aviso', 'Mejor más cerca de 0 °C', 'El pescado dura más a 0 °C, como en hielo. Cada grado de más le quita días.');
                else add('ok', `${fmtT(t)} está bien para ${nm}`, 'Es la temperatura del hielo, la que más le alarga la vida al pescado.');
            } else if (c.t_max_c != null && t > c.t_max_c) {
                const regla = p.id === 'res_canal' ? `la carne en canal se guarda a ${fmtT(c.t_max_c)} o menos, medidos en el centro de la pieza` : `${nm} se guarda a ${fmtT(c.t_max_c)} o menos`;
                add('alerta', `A ${fmtT(t)} no cumple la norma`, `Por norma, ${regla}. Así no pasaría una visita de la secretaría de salud.`);
            } else if (c.t_min_c != null && t < c.t_min_c) add('aviso', `Muy frío para ${nm}`, `${n} se guarda entre ${fmtT(c.t_min_c)} y ${fmtT(c.t_max_c)}.`);
            else add('ok', `${fmtT(t)} cumple para ${nm}`, c.t_min_c != null ? `La norma pide entre ${fmtT(c.t_min_c)} y ${fmtT(c.t_max_c)}.` : `La norma pide ${fmtT(c.t_max_c)} o menos.`);
        }

        if (alertas.has('latente > umbral')) add('aviso', 'Congelar lo que llega fresco', 'Congelar producto fresco dentro del mismo cuarto es lento y pide mucho más equipo. Si le llega bastante producto fresco, a veces conviene un túnel de congelación. Eso lo miramos con usted.');
        if (alertas.has('ventilación de CO2 necesaria')) add('info', 'La fruta respira', 'Sigue viva dentro del cuarto: respira y suelta un gas que la madura más rápido. Su cuarto necesita una entrada de aire fresco controlada. Ya está tenida en cuenta.');
        if (alertas.has('puerta > umbral y sin protección')) {
            const pct = Math.round(x.r.detalle.aire.puerta_w / (x.r.carga_24h_kw * 1000) * 100);
            add('info', 'La puerta se lleva el frío', `Cerca del ${pct} % del calor le entra por la puerta. Una cortina de PVC le quita buena parte: pruébela en Uso.`);
        }
        const det = x.al.distribucion && x.al.distribucion.detalle;
        if (x.al.formato === 'riel' && det && det.largo_colgable_m) add('info', 'Va colgada en rieles', `La carne en canal va colgada. Con ${num(S.alto, 1)} m de alto caben piezas de hasta ${num(det.largo_colgable_m, 2)} m. Si cuelga medias canales, necesita más alto.`);

        $('peTarjetasTitulo').textContent = `Lo que debe saber de su ${nm}`;
        $('peTarjetas').innerHTML = T.map((k) => `<article class="pe-tarjeta" data-nivel="${k.nivel}"><h3>${k.titulo}</h3><p>${k.texto}</p></article>`).join('');
        $('peTarjetasBox').hidden = !T.length;
        S._tarjetas = T.map((k) => k.titulo);
    }

    function pintarVisita(x) {
        const alertas = new Set(x.r.alertas.map((a) => a.regla));
        const V = [
            ['Energía del local', 'Confirmamos que su conexión eléctrica aguante el equipo.'],
            ['Desagüe', 'El equipo bota agua al deshielar y hay que sacarla del cuarto.'],
            ['Dónde va el equipo de afuera', 'Necesita aire que circule y ojalá sombra.']
        ];
        if (S.t < 0) V.push(['Piso', 'Bajo cero el piso va aislado para que el frío no congele la tierra de abajo y lo levante.']);
        if (alertas.has('ventilación de CO2 necesaria')) V.push(['Entrada de aire fresco', 'Por dónde entra y sale el aire que necesita la fruta.']);
        if (x.al.formato === 'riel') V.push(['Rieles', 'Altura del techo y por dónde entran las canales.']);
        $('peVisita').innerHTML = V.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('');
    }

    function pintarParecidos() {
        const box = $('peParecidosBox');
        const p = prod();
        const area = S.largo * S.ancho;
        const lista = CONFIG.proyectos.map((pr) => ({ pr, s: (pr.categoria === p.categoria ? 3 : 0) + (pr.modo === S.modo ? 2 : 0) - Math.abs(pr.largo * pr.ancho - area) / Math.max(area, 1) }))
            .sort((a, b) => b.s - a.s).slice(0, 3).map((o) => o.pr);
        if (lista.length) {
            box.hidden = false;
            $('peParecidos').innerHTML = lista.map((pr) =>
                `<a class="pe-parecido" href="proyectos.html#${pr.id}"><img src="${pr.foto}" alt="${pr.titulo}" loading="lazy"><strong>${pr.titulo}</strong><span>${num(pr.largo, 1)} × ${num(pr.ancho, 1)} m · ${pr.ciudad}${pr.dias ? ` · montado en ${pr.dias} días` : ''}</span></a>`).join('');
        } else if (CONFIG.muestraParecidos) {
            box.hidden = false;
            $('peParecidos').innerHTML = [1, 2, 3].map(() =>
                `<div class="pe-parecido pe-parecido--vacio"><div class="pe-foto-vacia">Foto del cuarto terminado</div><strong>${nombreProd(p)} · ${S.t < 0 ? 'congelación' : 'refrigerado'}</strong><span>Medidas · ciudad · días de montaje</span></div>`).join('') +
                '<p class="pe-hint">Aquí van 2 o 3 proyectos reales de FrigoPac parecidos a este, con foto y enlace a la página de Proyectos. Faltan las fotos.</p>';
        } else box.hidden = true;
    }

    // ── Dibujo del cuarto en isométrico, a escala, con el producto adentro ──
    const COLOR = {
        frutas_verduras: ['#E39B2D', '#B97714', '#F2BC63'], carnes: ['#B84A3A', '#8E3427', '#D4705F'],
        aves: ['#D9A45A', '#AE8038', '#EBC285'], pescados: ['#4F8FC9', '#336A9C', '#7FB1DE'],
        lacteos: ['#D8D2C0', '#A9A18A', '#EDE8DA'], congelados: ['#8EC3DE', '#5E97B6', '#B9DCEE']
    };
    function dibujarCuarto(svg, o) {
        const { L, A, H } = o;
        const cos = Math.cos(Math.PI / 6), sin = 0.5;
        const s = Math.min(440 / ((L + A) * cos), 262 / ((L + A) * sin + H));
        const ox = 260 - (L - A) * cos * s / 2;
        const alto = ((L + A) * sin + H) * s;
        const oy = 34 + H * s + (330 - 34 - 30 - alto) / 2;
        const X = (x, y) => ox + (x - y) * cos * s;
        const Y = (x, y, z) => oy + (x + y) * sin * s - z * s;
        const P = (x, y, z) => `${X(x, y).toFixed(1)},${Y(x, y, z).toFixed(1)}`;
        const poly = (pts, cls, extra = '') => `<polygon points="${pts.join(' ')}" class="${cls}"${extra}/>`;
        const frio = o.t < 0;
        let g = '';
        g += poly([P(0, 0, 0), P(L, 0, 0), P(L, A, 0), P(0, A, 0)], 'cq-piso');
        g += poly([P(0, 0, 0), P(L, 0, 0), P(L, 0, H), P(0, 0, H)], 'cq-pared-a');
        g += poly([P(0, 0, 0), P(0, A, 0), P(0, A, H), P(0, 0, H)], 'cq-pared-b');
        // Evaporador en la pared del fondo
        const ew = Math.min(1.2, L * 0.35), ex = (L - ew) / 2, ez = H - 0.12, eh = 0.36, ed = 0.4;
        g += poly([P(ex, 0, ez), P(ex + ew, 0, ez), P(ex + ew, ed, ez), P(ex, ed, ez)], 'cq-evap-t');
        g += poly([P(ex, ed, ez), P(ex + ew, ed, ez), P(ex + ew, ed, ez - eh), P(ex, ed, ez - eh)], 'cq-evap-f');
        const nAsp = 2;
        for (let i = 0; i < nAsp; i++) {
            const cx = ex + ew * (i + 0.5) / nAsp;
            g += `<ellipse cx="${X(cx, ed).toFixed(1)}" cy="${Y(cx, ed, ez - eh / 2).toFixed(1)}" rx="${(eh * 0.32 * s).toFixed(1)}" ry="${(eh * 0.36 * s).toFixed(1)}" class="cq-aspa"/>`;
        }

        const pw = Math.min(0.9, L * 0.4), px = Math.min(0.3, L * 0.1);
        const frac = Math.max(0, o.frac);
        if (o.formato === 'riel') {
            const rieles = Math.max(1, Math.min(4, Math.floor((A - 0.6) / 0.7) + 1));
            const zr = H - 0.3, largo = Math.min(1.8, H - 0.6);
            const ys = rieles === 1 ? [A / 2] : Array.from({ length: rieles }, (_, i) => 0.45 + i * (A - 0.9) / (rieles - 1));
            ys.forEach((y) => { g += `<line x1="${X(0.1, y).toFixed(1)}" y1="${Y(0.1, y, zr).toFixed(1)}" x2="${X(L - 0.1, y).toFixed(1)}" y2="${Y(L - 0.1, y, zr).toFixed(1)}" class="cq-riel"/>`; });
            const porRiel = Math.max(1, Math.floor((L - 0.3) / 0.45));
            const n = Math.round(Math.min(1, frac) * porRiel * rieles);
            const [c1, c2] = COLOR.carnes;
            const piezas = [];
            for (let i = 0; i < rieles; i++) for (let j = 0; j < porRiel; j++) piezas.push({ x: 0.3 + j * (L - 0.6) / Math.max(1, porRiel - 1), y: ys[i] });
            piezas.sort((a, b) => (a.x + a.y) - (b.x + b.y)).slice(0, n).forEach((pz) => {
                const tx = X(pz.x, pz.y), ty = Y(pz.x, pz.y, zr), by = Y(pz.x, pz.y, zr - largo);
                const w = Math.max(3, 0.14 * s), h0 = ty + 0.12 * s;
                g += `<line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${tx.toFixed(1)}" y2="${h0.toFixed(1)}" class="cq-gancho"/>`;
                g += `<path d="M${(tx - w * 0.5).toFixed(1)},${h0.toFixed(1)} C${(tx - w * 1.3).toFixed(1)},${((h0 + by) / 2).toFixed(1)} ${(tx - w).toFixed(1)},${by.toFixed(1)} ${tx.toFixed(1)},${by.toFixed(1)} C${(tx + w).toFixed(1)},${by.toFixed(1)} ${(tx + w * 1.3).toFixed(1)},${((h0 + by) / 2).toFixed(1)} ${(tx + w * 0.5).toFixed(1)},${h0.toFixed(1)} Z" fill="${c1}" stroke="${c2}" stroke-width="1"/>`;
            });
        } else {
            const canast = o.formato === 'canastilla';
            let cw = canast ? 0.6 : 0.5, cd = 0.4;
            const ch = canast ? 0.3 : 0.32;
            const esc = Math.max(1, Math.sqrt(((L - 0.2) / cw) * ((A - 0.2) / cd) / 90));
            cw *= esc; cd *= esc;
            const nx = Math.max(1, Math.floor((L - 0.2) / cw)), ny = Math.max(1, Math.floor((A - 0.2) / cd));
            const niveles = Math.max(1, Math.min(8, Math.floor((H - 0.55) / ch)));
            const celdas = [];
            for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
                const x = 0.1 + i * cw, y = 0.1 + j * cd;
                if (x + cw > px - 0.05 && x < px + pw + 0.05 && y + cd > A * 0.4) continue;   // pasillo desde la puerta
                celdas.push({ x, y });
            }
            celdas.sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.x - b.x);
            let n = Math.round(Math.min(1, frac) * celdas.length * niveles);
            const [c1, c2, c3] = COLOR[o.cat] || COLOR.congelados;
            celdas.forEach((c) => {
                const k = Math.min(niveles, n); n -= k;
                for (let z0 = 0; z0 < k; z0++) {
                    const z = z0 * ch, x = c.x + 0.02 * esc, y = c.y + 0.02 * esc, w = cw - 0.04 * esc, d = cd - 0.04 * esc, h = ch - 0.02;
                    g += poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], 'cq-caja', ` fill="${c3}" stroke="${c2}"`);
                    g += poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], 'cq-caja', ` fill="${c1}" stroke="${c2}"`);
                    g += poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], 'cq-caja', ` fill="${c2}" stroke="${c2}"`);
                }
            });
        }
        // Paredes del frente, transparentes, y la puerta
        g += poly([P(0, A, 0), P(L, A, 0), P(L, A, H), P(0, A, H)], 'cq-vidrio');
        g += poly([P(L, 0, 0), P(L, A, 0), P(L, A, H), P(L, 0, H)], 'cq-vidrio');
        const ph = Math.min(2, H - 0.15);
        g += poly([P(px, A, 0), P(px + pw, A, 0), P(px + pw, A, ph), P(px, A, ph)], 'cq-puerta');
        g += `<line x1="${X(px + pw - 0.1, A).toFixed(1)}" y1="${Y(px + pw - 0.1, A, 1).toFixed(1)}" x2="${X(px + pw - 0.1, A).toFixed(1)}" y2="${Y(px + pw - 0.1, A, 1.2).toFixed(1)}" class="cq-manija"/>`;
        if (frio) g += poly([P(0, 0, H), P(L, 0, H), P(L, A, H), P(0, A, H)], 'cq-escarcha');
        const cota = (x1, y1, x2, y2, txt, dx, dy, anchor) => `<text x="${((x1 + x2) / 2 + dx).toFixed(1)}" y="${((y1 + y2) / 2 + dy).toFixed(1)}" text-anchor="${anchor}" class="cq-cota">${txt}</text>`;
        g += cota(X(0, A), Y(0, A, 0), X(L, A), Y(L, A, 0), `${num(L, 1)} m`, -6, 18, 'end');
        g += cota(X(L, A), Y(L, A, 0), X(L, 0), Y(L, 0, 0), `${num(A, 1)} m`, 8, 18, 'start');
        g += cota(X(0, A), Y(0, A, 0), X(0, A), Y(0, A, H), `${num(H, 1)} m`, -8, 4, 'end');
        if (frac > 1) g += '<text x="260" y="24" text-anchor="middle" class="cq-nocabe">No cabe todo</text>';
        svg.innerHTML = g;
        svg.dataset.frio = frio ? 'si' : 'no';
    }

    // ── Bodega grande ──
    const BD = FE.datos.bodegasDatos();
    const RANGO_T = [10, 500000];
    const RANGO_LADO = [5, 500];
    const estimarBodegaActual = () => (S.bmodo === 'medidas'
        ? FE.capacidadBodega(S.blargo, S.bancho, S.balt, S.producto, S.t, S.bsis)
        : FE.estimarBodega(S.bt, S.producto, S.t, S.bsis, S.balt));
    function abrirBodega() {
        if (S.bt == null) S.bt = Math.max(RANGO_T[0], Math.round(aKg(S.guardo) / 1000));
        S.bsis = S.bsis || BD.sistema_por_defecto;
        S.balt = S.balt || BD.altura_libre_m.valor;
        S.vista = 'bodega';
        mostrar('bodega');
        pintarBodega();
    }
    const miles = (x) => (x >= 1e6 ? `${num(x / 1e6, 1)} millones de` : num(Math.round(x / (x >= 1e4 ? 100 : 10)) * (x >= 1e4 ? 100 : 10)));
    function pintarBodega() {
        const p = prod();
        $('peBodSub').textContent = `${nombreProd(p)} · ${nombreCiudad()}`;
        const med = S.bmodo === 'medidas';
        if (med && (!S.blargo || !S.bancho)) {
            const lado = Math.max(RANGO_LADO[0], Math.round(Math.sqrt(FE.estimarBodega(S.bt, S.producto, S.t, S.bsis, S.balt).area_m2)));
            S.blargo = S.blargo || lado; S.bancho = S.bancho || lado;
        }
        marcar('peBodModo', 'bmodo', S.bmodo);
        $('peBodMedWrap').hidden = !med; $('peBodTWrap').hidden = med;
        if (med) {
            if (document.activeElement !== $('peBodLNum')) $('peBodLNum').value = S.blargo;
            if (document.activeElement !== $('peBodANum')) $('peBodANum').value = S.bancho;
            $('peBodL').value = logA(S.blargo, RANGO_LADO); $('peBodA').value = logA(S.bancho, RANGO_LADO);
        }
        const bd = estimarBodegaActual();
        const tCap = bd.toneladas;
        $('peBodTitulo').textContent = med ? `Bodega de ${num(S.blargo)} × ${num(S.bancho)} × ${num(S.balt)} m` : `Bodega para ${num(S.bt)} toneladas`;
        const comp = $('peBodComp');
        comp.hidden = !med || !S.bt;
        if (med && S.bt) comp.textContent = tCap >= S.bt
            ? `Usted quería guardar ${num(S.bt)} t: le caben, y quedan libres unas ${miles(tCap - S.bt)} t.`
            : `Usted quería guardar ${num(S.bt)} t: le faltan unas ${miles(S.bt - tCap)} t de espacio. Agrande las medidas o elija un sistema más apretado.`;
        $('peBodTemp').textContent = fmtT(S.t);
        $('peBodTemp').dataset.frio = S.t < 0 ? 'congelado' : 'refrigerado';
        if (document.activeElement !== $('peBodTNum')) $('peBodTNum').value = S.bt;
        $('peBodT').value = logA(S.bt, RANGO_T);
        $('peBodTemp2').value = S.t; $('peBodTempOut').textContent = fmtT(S.t);
        $('peBodAlt').value = S.balt; $('peBodAltOut').textContent = `${num(S.balt)} m`;
        $('peBodSis').innerHTML = Object.entries(BD.sistemas).map(([k, s]) =>
            `<button type="button" class="pe-sistema" role="radio" data-sistema="${k}" aria-checked="${k === S.bsis}"><strong>${s.nombre}<span>usa ${Math.round(s.fraccion_volumen * 100)} % del volumen</span></strong><small>${s.nota}</small></button>`).join('');

        $('peBodVolLbl').textContent = med ? 'Le caben' : 'Volumen refrigerado';
        $('peBodVol').textContent = med ? `${miles(tCap)} t` : `${miles(bd.volumen_m3)} m³`;
        $('peBodVolSub').textContent = med ? `En ${miles(bd.volumen_m3)} m³ de cámaras, unos ${num(bd.kg_por_m3_bruto)} kg por m³.` : `Unos ${num(bd.kg_por_m3_bruto)} kg por m³ de bodega.`;
        $('peBodArea').textContent = `${miles(bd.area_m2)} m²`;
        $('peBodAreaSub').textContent = bd.canchas >= 0.5 ? `Como ${num(bd.canchas, bd.canchas < 10 ? 1 : 0)} canchas de fútbol, con ${num(S.balt)} m de alto.` : `Con ${num(S.balt)} m de alto.`;
        $('peBodPos').textContent = miles(bd.posiciones);
        $('peBodPosSub').textContent = `Estibas de 1,2 × 1,0 m con unos ${num(Math.round(bd.kg_por_estiba / 10) * 10)} kg cada una.`;
        const tf = FE.tarifa(ciudadMotor(), S.lugar, null, S.lugar === 'residencial' ? Number(S.estrato) : null);
        const [e0, e1] = bd.energia_kwh_anual;
        const m0 = e0 / 12 * tf.cop_kwh, m1 = e1 / 12 * tf.cop_kwh;
        const corto = (v) => (v >= 1e9 ? `$${num(v / 1e9, 1)} mil millones` : v >= 1e6 ? `$${num(v / 1e6, v >= 1e8 ? 0 : 1)} millones` : pesos(v));
        $('peBodLuz').textContent = `${corto(m0)} a ${corto(m1)}`;
        $('peBodLuzSub').textContent = `El valor bajo es una bodega nueva con la mejor tecnología; el alto, el promedio de bodegas medidas en Europa. Tarifa de ${tf.operador}.`;

        const unidad = bd.formato_carga === 'canastilla' ? 'canastillas' : 'cajas';
        const est = BD.estiba, volEst = est.largo_m * est.ancho_m * est.alto_carga_m;
        const kgEst = Math.round(bd.kg_por_estiba / 10) * 10;
        const niveles = Math.max(1, Math.floor(S.balt / BD.altura_por_nivel_m.valor));
        const lado = Math.sqrt(bd.area_m2);
        const pct = Math.round(bd.fraccion_volumen * 100);
        const paso = (t, d) => `<li><strong>${t}</strong><br>${d}</li>`;
        const pasoEstiba = paso(`Cada estiba lleva unos ${num(kgEst)} kg`,
            `Una estiba mide ${num(est.largo_m, 1)} × ${num(est.ancho_m, 1)} m y se carga hasta ${num(est.alto_carga_m, 2)} m de alto: ${num(volEst, 1)} m³ de ${unidad}. Un m³ de ${unidad} de ${nombreProd(p).toLowerCase()} pesa unos ${num(bd.densidad_carga_kg_m3)} kg, así que cada estiba lleva unos ${num(kgEst)} kg.`);
        const pasoParte = paso('Solo una parte de la bodega es producto',
            `Con ${BD.sistemas[S.bsis].nombre.toLowerCase()}, de cada 100 m³ de bodega solo ${pct} tienen producto. El resto es pasillo para el montacargas, la estructura de la estantería y el aire que tiene que circular. Por eso cada m³ de bodega guarda ${num(bd.densidad_carga_kg_m3)} kg × ${pct} % = <b>${num(bd.kg_por_m3_bruto)} kg</b>.`);
        $('peBodPasos').innerHTML = (med ? [
            paso(`La bodega tiene ${miles(bd.volumen_m3)} m³`,
                `${num(S.blargo)} × ${num(S.bancho)} × ${num(S.balt)} m = <b>${miles(bd.volumen_m3)} m³</b> por dentro.`),
            pasoParte,
            paso(`Le caben unas ${miles(tCap)} toneladas`,
                `${miles(bd.volumen_m3)} m³ × ${num(bd.kg_por_m3_bruto)} kg por m³ = <b>${miles(tCap * 1000)} kg</b>, unas ${miles(tCap)} t de ${nombreProd(p).toLowerCase()}.`),
            paso(`Son unas ${miles(bd.posiciones)} estibas`,
                `${pasoEstiba.replace(/^<li><strong>.*?<\/strong><br>/, '').replace(/<\/li>$/, '')} ${miles(tCap * 1000)} kg ÷ ${num(kgEst)} kg = <b>${miles(bd.posiciones)} estibas</b>. Con ${num(S.balt)} m de alto van ${niveles} una encima de otra, unas ${miles(bd.posiciones / niveles)} por nivel.`)
        ] : [
            paso(`Cada estiba lleva unos ${num(kgEst)} kg`,
                `Una estiba mide ${num(est.largo_m, 1)} × ${num(est.ancho_m, 1)} m y se carga hasta ${num(est.alto_carga_m, 2)} m de alto: ${num(volEst, 1)} m³ de ${unidad}. Un m³ de ${unidad} de ${nombreProd(p).toLowerCase()} pesa unos ${num(bd.densidad_carga_kg_m3)} kg, así que cada estiba lleva unos ${num(kgEst)} kg. Para ${num(S.bt)} t: ${num(S.bt * 1000)} kg ÷ ${num(kgEst)} kg = <b>${miles(bd.posiciones)} estibas</b>.`),
            pasoParte,
            paso(`La bodega necesita ${miles(bd.volumen_m3)} m³`,
                `${num(S.bt * 1000)} kg ÷ ${num(bd.kg_por_m3_bruto)} kg por m³ = <b>${miles(bd.volumen_m3)} m³</b> de cámaras frías.`),
            paso(`Con ${num(S.balt)} m de alto, son ${miles(bd.area_m2)} m² de piso`,
                `${miles(bd.volumen_m3)} m³ ÷ ${num(S.balt)} m = <b>${miles(bd.area_m2)} m²</b>, como un cuadrado de ${num(lado)} × ${num(lado)} m. Con ${num(S.balt)} m de alto van ${niveles} estibas una encima de otra, unas ${miles(bd.posiciones / niveles)} por nivel. A eso falta sumarle muelles de carga y antecámaras.`)
        ]).join('');
        const gcca = bd.volumen_referencia_gcca_m3;
        $('peBodRef').textContent = `Para comparar: el promedio mundial de bodegas frigoríficas (GCCA) es 4,3 m³ por tonelada, que daría ${miles(gcca)} m³. ${gcca < bd.volumen_m3 ? 'Sale menos porque muchas bodegas usan sistemas más apretados que la estantería selectiva, como drive-in o estantería móvil.' : 'Sale más porque el promedio mundial incluye bodegas con estantería selectiva y pasillos anchos.'} Emergent Cold, en Funza, guarda 12.000 t en 81.000 m³.`;
        dibujarBodega($('peBodDibujo'), bd);
    }
    function dibujarBodega(svg, bd) {
        const LX = bd.largo_m || Math.sqrt(bd.area_m2), LY = bd.ancho_m || Math.sqrt(bd.area_m2);
        const lado = LY, H = S.balt, cL = 105, cA = 68, sep = Math.max(8, Math.max(LX, LY) * 0.08);
        const cos = Math.cos(Math.PI / 6), sin = 0.5;
        const U = (x, y) => (x - y) * cos, V = (x, y, z) => (x + y) * sin - z;
        const pts = [[0, 0, 0], [LX, 0, 0], [LX, LY, 0], [0, LY, 0], [0, 0, H], [LX, 0, H], [LX, LY, H], [0, LY, H],
            [0, lado + sep, 0], [cL, lado + sep, 0], [cL, lado + sep + cA, 0], [0, lado + sep + cA, 0]];
        const us = pts.map(([x, y]) => U(x, y)), vs = pts.map(([x, y, z]) => V(x, y, z));
        const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
        const s = Math.min(470 / (u1 - u0), 250 / (v1 - v0));
        const ox = 260 - (u0 + u1) / 2 * s, oy = 165 - (v0 + v1) / 2 * s;
        const P = (x, y, z = 0) => [ox + U(x, y) * s, oy + V(x, y, z) * s];
        const pp = (...ps) => ps.map((q) => P(...q).map((v) => v.toFixed(1)).join(',')).join(' ');
        let g = '';
        g += `<polygon points="${pp([0, LY, 0], [LX, LY, 0], [LX, LY, H], [0, LY, H])}" class="bd-a"/>`;
        g += `<polygon points="${pp([LX, 0, 0], [LX, LY, 0], [LX, LY, H], [LX, 0, H])}" class="bd-b"/>`;
        g += `<polygon points="${pp([0, 0, H], [LX, 0, H], [LX, LY, H], [0, LY, H])}" class="bd-c"/>`;
        const niveles = Math.max(1, Math.min(12, Math.floor(H / 1.9)));
        for (let k = 1; k < niveles; k++) {
            const z = H * k / niveles, [x1, y1] = P(0, LY, z), [x2, y2] = P(LX, LY, z);
            g += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="bd-rack"/>`;
        }
        g += `<polygon points="${pp([0, lado + sep], [cL, lado + sep], [cL, lado + sep + cA], [0, lado + sep + cA])}" class="bd-cancha"/>`;
        const [m1x, m1y] = P(cL / 2, lado + sep), [m2x, m2y] = P(cL / 2, lado + sep + cA);
        g += `<line x1="${m1x.toFixed(1)}" y1="${m1y.toFixed(1)}" x2="${m2x.toFixed(1)}" y2="${m2y.toFixed(1)}" class="bd-linea"/>`;
        const [tx, ty] = P(LX, LY, 0);
        g += `<text x="${tx.toFixed(1)}" y="${Math.min(324, ty + 18).toFixed(1)}" text-anchor="middle" class="bd-t">${miles(bd.area_m2)} m² · ${num(S.balt)} m de alto</text>`;
        const cy = Math.max(...[[0, lado + sep], [cL, lado + sep], [cL, lado + sep + cA], [0, lado + sep + cA]].map((q) => P(...q)[1]));
        const [cx] = P(cL / 2, lado + sep + cA / 2);
        g += `<text x="${Math.max(60, cx).toFixed(1)}" y="${Math.min(324, cy + 16).toFixed(1)}" text-anchor="middle" class="bd-t">cancha de fútbol</text>`;
        svg.innerHTML = g;
    }

    // ── Guardar y ficha para FrigoPac ──
    function nuevoId() {
        const a = new Date().getFullYear();
        const r = (Date.now().toString(36).slice(-3) + Math.random().toString(36).slice(2, 4)).toUpperCase();
        return `FP-${a}-${r}`;
    }
    function estadoParaGuardar() {
        const { pantalla, contacto, _tarjetas, armado, ...resto } = S;
        return resto;
    }
    function enlaceProyecto(pagina) {
        const base = location.origin + location.pathname;
        const url = pagina ? base.replace(/[^/]*$/, pagina) : base;
        return url + '#p=' + M.codificar(estadoParaGuardar());
    }
    function ficha(evento) {
        if (S.vista === 'bodega') {
            const bd = estimarBodegaActual();
            const params = new URLSearchParams(location.search);
            return {
                evento, id: S.id, fecha: new Date().toISOString(),
                nombre: S.contacto?.nombre, whatsapp: S.contacto?.whatsapp, correo: S.contacto?.correo, empresa: S.contacto?.empresa, etapa: S.contacto?.etapa,
                ciudad: nombreCiudad(), clima_motor: ciudadMotor(), lugar: S.lugar, producto: prod().nombre, temperatura_c: S.t,
                guarda: S.bmodo === 'medidas' ? `caben ${Math.round(bd.toneladas)} t (quería ${S.bt || '–'} t)` : `${S.bt} t`,
                medidas_m: S.bmodo === 'medidas' ? `BODEGA ${S.blargo} x ${S.bancho} x ${S.balt} m (dadas por el cliente)` : `BODEGA ${Math.round(bd.area_m2)} m2 x ${S.balt} m (${Math.round(bd.volumen_m3)} m3)`,
                escenarios_probados: `sistema ${bd.sistema_nombre}; ${S.probados.join(', ')}`,
                publico_caben_kg: S.bt * 1000,
                interno_revisar: `Bodega: ${Math.round(bd.posiciones)} estibas, ${Math.round(bd.volumen_m3)} m³, energía ${Math.round(bd.energia_kwh_anual[0])}–${Math.round(bd.energia_kwh_anual[1])} kWh/año`,
                enlace: enlaceProyecto(), enlace_informe: enlaceProyecto('informe.html'),
                origen: [document.referrer || 'directo', params.get('utm_source'), params.get('utm_campaign')].filter(Boolean).join(' · '),
                version_motor: FE.VERSION
            };
        }
        const x = ultimo || correr();
        const p = prod();
        const params = new URLSearchParams(location.search);
        const u = S.unidad === 'kg' ? 'kg' : 'canastillas';
        return {
            evento, id: S.id, fecha: new Date().toISOString(),
            nombre: S.contacto?.nombre, whatsapp: S.contacto?.whatsapp, correo: S.contacto?.correo, empresa: S.contacto?.empresa, etapa: S.contacto?.etapa,
            ciudad: nombreCiudad(), clima_motor: ciudadMotor(), lugar: S.lugar + (S.lugar === 'residencial' ? ` estrato ${S.estrato}` : ''),
            producto: p.nombre, temperatura_c: S.t, llega: S.estado,
            guarda: `${S.guardo} ${u}`, llegan_dia: `${S.llegan} ${u}`,
            medidas_m: `${S.largo} x ${S.ancho} x ${S.alto}`, medidas_propuestas: S.tam === 'auto', uso_puerta: S.uso,
            escenarios_probados: S.probados.join(', '),
            escenarios_activos: ['cortina', 'piso'].filter((k) => S[k]).join(', '),
            publico_caben_kg: Math.round(x.al.kg), publico_equipo_kw: '',
            publico_luz_mes: `${Math.round(x.en.rango_costo_mes_cop[0])}-${Math.round(x.en.rango_costo_mes_cop[1])}`,
            publico_avisos: (S._tarjetas || []).join(' | '),
            interno_btu_recomendado: Math.round(x.r.capacidad.btu_h), interno_btu_tecnico: Math.round(x.r.capacidad_tecnica.btu_h),
            interno_kw_rango: x.r.capacidad.rango_kw.map((v) => v.toFixed(2)).join('-'), interno_confianza: x.r.confianza,
            interno_preguntar: x.r.para_mejorar_precision.join(' | '),
            interno_alertas: x.r.alertas.filter((a) => a.nivel !== 'info').map((a) => a.mensaje).join(' | '),
            interno_revisar: [...$('peVisita').querySelectorAll('strong')].map((el) => el.textContent).join(' | '),
            interno_kwh_mes: Math.round(x.en.kwh_mes_promedio),
            enlace: enlaceProyecto(),
            enlace_informe: enlaceProyecto('informe.html'),
            origen: [document.referrer || 'directo', params.get('utm_source'), params.get('utm_campaign')].filter(Boolean).join(' · '),
            version_motor: FE.VERSION
        };
    }
    function enviarCRM(evento) {
        const datos = ficha(evento);
        try {
            const g = JSON.parse(localStorage.getItem('frigopac_proyectos') || '[]');
            g.push({ id: S.id, fecha: datos.fecha, estado: estadoParaGuardar() });
            localStorage.setItem('frigopac_proyectos', JSON.stringify(g.slice(-10)));
        } catch (e) { /* sin almacenamiento local */ }
        const url = raiz.dataset.crm || CONFIG.crmEndpoint;
        if (!url) return;
        fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(datos) }).catch(() => {});
    }
    function mensajeRevision() {
        const p = prod(), u = S.unidad === 'kg' ? 'kg' : 'canastillas';
        if (S.vista === 'bodega') {
            const bd = estimarBodegaActual();
            return [
                `Hola FrigoPac, quiero que revisen mi proyecto ${S.id}.`,
                S.bmodo === 'medidas' ? `Bodega de ${num(S.blargo)} × ${num(S.bancho)} × ${num(S.balt)} m para ${nombreProd(p).toLowerCase()} en ${nombreCiudad()}, a ${S.t} °C: caben unas ${num(Math.round(bd.toneladas))} t.` : `Bodega de ${num(S.bt)} t de ${nombreProd(p).toLowerCase()} en ${nombreCiudad()}, a ${S.t} °C.`,
                `${bd.sistema_nombre}, ${num(S.balt)} m de altura libre: unos ${num(Math.round(bd.area_m2 / 100) * 100)} m² de planta.`,
                S.contacto?.nombre ? `Soy ${S.contacto.nombre}${S.contacto.empresa ? ', de ' + S.contacto.empresa : ''}.` : '',
                `Mi proyecto: ${enlaceProyecto()}`
            ].filter(Boolean).join('\n');
        }
        return [
            `Hola FrigoPac, quiero que revisen mi proyecto ${S.id}.`,
            `${nombreProd(p)} en ${nombreCiudad()}, a ${S.t} °C.`,
            `Cuarto de ${num(S.largo, 1)} × ${num(S.ancho, 1)} × ${num(S.alto, 1)} m.`,
            `Guardo ${num(S.guardo)} ${u} y me llegan ${num(S.llegan)} ${u} al día.`,
            S.contacto?.nombre ? `Soy ${S.contacto.nombre}${S.contacto.empresa ? ', de ' + S.contacto.empresa : ''}.` : '',
            `Mi proyecto: ${enlaceProyecto()}`
        ].filter(Boolean).join('\n');
    }

    // ── Eventos ──
    raiz.addEventListener('click', (ev) => {
        const b = (sel) => ev.target.closest(sel);
        let el;
        if ((el = b('[data-ir]'))) {
            const d = el.dataset.ir;
            if (d === 'inicio') { pintarInicio(); mostrar('inicio'); }
            else if (d === 'bodega') { abrirBodega(); }
            else if (d === 'taller') { if (S.vista === 'bodega' && S.pantalla === 'listo') { abrirBodega(); } else { S.vista = 'cuarto'; mostrar('taller'); pintarTaller(); } }
            else if (d === 'guardar') {
                S.vista = S.pantalla === 'bodega' ? 'bodega' : (S.pantalla === 'taller' ? 'cuarto' : S.vista);
                $('peGuardarResumen').textContent = S.vista === 'bodega'
                    ? (S.bmodo === 'medidas' ? `Bodega de ${num(S.blargo)} × ${num(S.bancho)} × ${num(S.balt)} m para ${nombreProd().toLowerCase()} en ${nombreCiudad()} a ${fmtT(S.t)}.` : `Bodega de ${num(S.bt)} t de ${nombreProd().toLowerCase()} en ${nombreCiudad()} a ${fmtT(S.t)}.`)
                    : `${nombreProd()} en ${nombreCiudad()} · cuarto de ${num(S.largo, 1)} × ${num(S.ancho, 1)} × ${num(S.alto, 1)} m a ${fmtT(S.t)}.`;
                mostrar('guardar');
            }
            return;
        }
        if ((el = b('[data-cat]'))) {
            S.cat = el.dataset.cat;
            const lista = productos.filter((p) => p.categoria === S.cat);
            if (!lista.some((p) => p.id === S.producto)) S.producto = lista.length === 1 ? lista[0].id : null;
            pintarInicio(); return;
        }
        if ((el = b('[data-prod]'))) { S.producto = el.dataset.prod; pintarInicio(); return; }
        if ((el = b('[data-ciudad]'))) { S.ciudad = el.dataset.ciudad; pintarInicio(); return; }
        if ((el = b('[data-clima]'))) { S.climaOtro = el.dataset.clima; pintarInicio(); return; }
        if ((el = b('[data-lugar]'))) { S.lugar = el.dataset.lugar; pintarInicio(); return; }
        if ((el = b('[data-estrato]'))) { S.estrato = el.dataset.estrato; pintarInicio(); return; }
        if ((el = b('[data-modo]'))) {
            if (el.disabled || el.dataset.modo === S.modo) return;
            S.modo = el.dataset.modo; S.formato = null; S.t = tempInicial(prod(), S.modo); S.estado = estadoInicial(prod());
            actualizar(); return;
        }
        if ((el = b('[data-unidad]'))) {
            const antes = S.unidad; S.unidad = el.dataset.unidad;
            if (antes !== S.unidad) {
                const k = kgCanastilla(prod());
                const conv = (v) => Math.max(0, Math.round(S.unidad === 'kg' ? v * k : v / k));
                S.guardo = Math.max(1, conv(S.guardo)); S.llegan = conv(S.llegan);
            }
            actualizar(); return;
        }
        if ((el = b('[data-piso]'))) {
            if (el.disabled) return;
            S.piso = el.dataset.piso === 'si';
            if (!S.probados.includes('piso')) S.probados.push('piso');
            actualizar(); return;
        }
        if ((el = b('[data-bmodo]'))) { S.bmodo = el.dataset.bmodo; pintarBodega(); return; }
        if ((el = b('[data-sistema]'))) { S.bsis = el.dataset.sistema; pintarBodega(); return; }
        if ((el = b('[data-formato]'))) {
            S.formato = el.dataset.formato;
            if (S.formato !== 'canastilla' && S.unidad === 'canastillas') {
                const k = kgCanastilla(prod());
                S.guardo = Math.round(S.guardo * k); S.llegan = Math.round(S.llegan * k); S.unidad = 'kg';
            }
            if (!S.probados.includes('formato:' + S.formato)) S.probados.push('formato:' + S.formato);
            actualizar(); return;
        }
        if ((el = b('[data-estado]'))) { S.estado = el.dataset.estado; actualizar(); return; }
        if ((el = b('[data-tam]'))) { S.tam = el.dataset.tam; actualizar(); return; }
        if ((el = b('[data-uso]'))) { S.uso = el.dataset.uso; actualizar(); return; }
        if ((el = b('[data-mejora]'))) {
            const k = el.dataset.mejora; S[k] = !S[k];
            if (!S.probados.includes(k)) S.probados.push(k);
            actualizar(); return;
        }
        if ((el = b('[data-etapa]'))) { S.etapa = el.dataset.etapa; marcar('peEtapa', 'etapa', S.etapa); }
    });

    $('peBodT').addEventListener('input', (ev) => { S.bt = Math.max(RANGO_T[0], logDe(Number(ev.target.value), RANGO_T)); pintarBodega(); });
    $('peBodTNum').addEventListener('input', (ev) => { const v = Number(ev.target.value); if (!Number.isFinite(v) || v <= 0) return; S.bt = Math.min(RANGO_T[1], v); pintarBodega(); });
    $('peBodTemp2').addEventListener('input', (ev) => { S.t = Number(ev.target.value); S.modo = S.t < 0 ? 'congelar' : 'refrigerar'; pintarBodega(); });
    [['peBodL', 'blargo'], ['peBodA', 'bancho']].forEach(([id, k]) => {
        $(id).addEventListener('input', (ev) => { S[k] = Math.max(RANGO_LADO[0], logDe(Number(ev.target.value), RANGO_LADO)); pintarBodega(); });
        $(id + 'Num').addEventListener('input', (ev) => { const v = Number(ev.target.value); if (!Number.isFinite(v) || v < RANGO_LADO[0]) return; S[k] = Math.min(RANGO_LADO[1], v); pintarBodega(); });
    });
    $('peBodAlt').addEventListener('input', (ev) => { S.balt = Number(ev.target.value); pintarBodega(); });
    $('peArmar').addEventListener('click', () => { prepararTaller(); mostrar('taller'); pintarTaller(); });
    $('peTemp').addEventListener('input', (ev) => { S.t = Number(ev.target.value); actualizar(); });
    [['peGuardo', 'guardo'], ['peLlegan', 'llegan']].forEach(([id, k]) => {
        $(id).addEventListener('input', (ev) => {
            const v = logDe(Number(ev.target.value), CONFIG.rango[S.unidad]);
            S[k] = k === 'guardo' ? Math.max(1, v) : v; actualizar();
        });
        $(id + 'Num').addEventListener('input', (ev) => {
            const v = Number(ev.target.value);
            if (!Number.isFinite(v) || v < 0 || ev.target.value === '') return;
            S[k] = k === 'guardo' ? Math.max(1, v) : v; actualizar();
        });
    });
    [['peLargo', 'largo'], ['peAncho', 'ancho'], ['peAlto', 'alto']].forEach(([id, k]) => {
        $(id).addEventListener('input', (ev) => {
            S[k] = Number(ev.target.value);
            if (k !== 'alto') S.tam = 'manual';
            actualizar();
        });
    });
    $('peOtroWa').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hola FrigoPac, necesito un cuarto frío para un producto que no está en la página. ¿Me pueden asesorar?')}`;

    $('peForm').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const nombre = $('peNombre').value.trim();
        const wa = $('peWhatsappNum').value.replace(/\D/g, '');
        const err = !nombre ? 'Escriba su nombre.' : wa.length < 7 ? 'Revise el número de WhatsApp.' : !$('peAutorizo').checked ? 'Para guardar el proyecto necesitamos su autorización.' : '';
        $('peError').textContent = err;
        if (err) return;
        S.id = S.id || nuevoId();
        S.contacto = { nombre, whatsapp: wa, correo: $('peCorreo').value.trim(), empresa: $('peEmpresa').value.trim(), etapa: S.etapa || '' };
        enviarCRM('proyecto_guardado');
        $('peId').textContent = S.id;
        $('peRevisionWa').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensajeRevision())}`;
        mostrar('listo');
    });
    $('peRevisionWa').addEventListener('click', () => enviarCRM('pidio_revision'));

    // ── Abrir un proyecto guardado desde el enlace (#p=...) ──
    function restaurar() {
        const m = location.hash.match(/^#p=(.+)$/);
        if (!m) return false;
        try {
            Object.assign(S, M.decodificar(m[1]));
            S.armado = S.producto;
            pintarInicio();
            if (S.vista === 'bodega') abrirBodega(); else { mostrar('taller'); pintarTaller(); }
            return true;
        } catch (e) { return false; }
    }

    pintarInicio();
    if (!restaurar()) mostrar('inicio');
    window.FrigoPacProyecto = { estado: () => ({ ...estadoParaGuardar(), contacto: S.contacto }) };
})();
