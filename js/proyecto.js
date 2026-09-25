/* ============================================
   FRIGOPAC - Project Engine, Fase 1 "Explorar"
   Toda la física está en js/frigopac-engine.js (window.FrigoPacEngine).
   Este archivo solo conecta los controles con el motor y pinta resultados.
   ============================================ */
(function () {
    'use strict';
    const FE = window.FrigoPacEngine;
    if (!FE || !document.getElementById('projectEngine')) return;

    // ── Configuración de la interfaz (no son datos de ingeniería) ──
    const CONFIG = {
        whatsapp: '573103330737',
        categorias: [
            { id: 'carnes', nombre: 'Carnes', icono: '<path d="M7 17c-3-3-3-8 1-11s9-2 10 2-1 7-4 9-5 3-7 0z"/><circle cx="14" cy="9" r="1.6"/>' },
            { id: 'aves', nombre: 'Pollo', icono: '<path d="M8 20h8M12 20v-4M6 10a6 6 0 1 1 12 0c0 3-2 6-6 6s-6-3-6-6z"/><path d="M15 6l3-2"/>' },
            { id: 'pescados', nombre: 'Pescado y mariscos', icono: '<path d="M3 12c3-4 8-5 12-3l4-3v12l-4-3c-4 2-9 1-12-3z"/><circle cx="8" cy="11" r="1"/>' },
            { id: 'lacteos', nombre: 'Lácteos', icono: '<path d="M9 3h6v3l2 3v12H7V9l2-3z"/><path d="M7 13h10"/>' },
            { id: 'frutas_verduras', nombre: 'Frutas y verduras', icono: '<path d="M12 7c-4-2-8 1-7 6s4 8 7 8 6-3 7-8-3-8-7-6z"/><path d="M12 7c0-2 1-4 3-4"/>' },
            { id: 'congelados', nombre: 'Helados', icono: '<path d="M8 10a4 4 0 0 1 8 0z"/><path d="M8 10l4 11 4-11"/>' }
        ],
        // Temperatura sugerida al elegir producto (el cliente la cambia).
        tempSugerida: { carnes: 2, aves: 2, pescados: 0, lacteos: 4, frutas_verduras: null, congelados: -20 },
        tempCongelar: -18,
        rangoRefrigerar: [-2, 15],
        rangoCongelar: [-30, -10],
        nombresCarga: {
            transmision: 'Paredes, techo y piso',
            producto: 'Enfriar el producto',
            aire: 'Aire que entra por la puerta',
            internas: 'Personas y luces',
            equipos: 'Ventiladores y deshielo'
        }
    };

    const $ = (id) => document.getElementById(id);
    const num = (x, d = 0) => Number(x).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
    const pesos = (x) => '$' + num(Math.round(x / 1000) * 1000);
    const productos = FE.datos.listaProductos();
    const ciudades = FE.datos.listaCiudades();

    const S = {
        cat: 'carnes', producto: 'res_magra', modo: 'refrigerar', temp: 2,
        ciudad: 'bogota', lugar: 'comercial', estrato: 4,
        tam: 'medidas', largo: 3, ancho: 2, alto: 2.4, cantidad: 100, unidad: 'canastillas',
        kgDia: 300, uso: 'medio'
    };

    // ── Construcción de controles ──
    function pintarCategorias() {
        $('peCategorias').innerHTML = CONFIG.categorias.map((c) =>
            `<button type="button" class="pe-cat" role="radio" data-cat="${c.id}" aria-checked="${c.id === S.cat}">
                <svg viewBox="0 0 24 24" aria-hidden="true">${c.icono}</svg>${c.nombre}</button>`).join('');
    }
    function pintarProductos() {
        const lista = productos.filter((p) => p.categoria === S.cat);
        $('peProducto').innerHTML = lista.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('');
        if (!lista.some((p) => p.id === S.producto)) S.producto = lista[0].id;
        $('peProducto').value = S.producto;
    }
    function pintarCiudades() {
        $('peCiudad').innerHTML = ciudades.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');
        $('peCiudad').value = S.ciudad;
    }
    function marcar(grupo, attr, valor) {
        $(grupo).querySelectorAll('[' + attr + ']').forEach((b) => b.setAttribute('aria-checked', String(b.getAttribute(attr) === valor)));
    }
    function productoActual() { return FE.datos.producto(S.producto); }

    function tempPorDefecto() {
        const p = productoActual();
        if (S.modo === 'congelar') return p.categoria === 'congelados' ? CONFIG.tempSugerida.congelados : CONFIG.tempCongelar;
        if (p.almacenamiento) return Math.round((p.almacenamiento.t_min_c + p.almacenamiento.t_max_c) / 2);
        return CONFIG.tempSugerida[p.categoria];
    }
    function ajustarTemperatura(resetear) {
        const p = productoActual();
        const soloCongelar = p.categoria === 'congelados';
        if (soloCongelar) S.modo = 'congelar';
        $('peModo').querySelector('[data-modo="refrigerar"]').disabled = soloCongelar;
        marcar('peModo', 'data-modo', S.modo);
        const [mn, mx] = S.modo === 'congelar' ? CONFIG.rangoCongelar : CONFIG.rangoRefrigerar;
        const t = $('peTemp');
        t.min = mn; t.max = mx;
        if (resetear || S.temp < mn || S.temp > mx) S.temp = tempPorDefecto();
        t.value = S.temp;
        const a = p.almacenamiento;
        $('peTempHint').textContent = S.modo === 'refrigerar' && a
            ? (a.t_min_c === a.t_max_c
                ? `Recomendado para ${p.nombre.toLowerCase()}: ${a.t_min_c} °C.`
                : `Recomendado para ${p.nombre.toLowerCase()}: ${a.t_min_c} a ${a.t_max_c} °C.`)
            : S.modo === 'congelar' ? 'Congelados se guardan normalmente entre −18 y −25 °C.' : '';
    }

    function pintarSliders() {
        const set = (id, v, txt) => { const el = $(id); el.value = v; $(id + 'Out').textContent = txt; rellenar(el); };
        set('peTemp', S.temp, `${num(S.temp)} °C`);
        set('peLargo', S.largo, `${num(S.largo, 1)} m`);
        set('peAncho', S.ancho, `${num(S.ancho, 1)} m`);
        set('peAlto', S.alto, `${num(S.alto, 1)} m`);
        set('peKgDia', S.kgDia, `${num(S.kgDia)} kg`);
    }
    function rellenar(el) {
        const pct = (el.value - el.min) / (el.max - el.min) * 100;
        el.style.setProperty('--pct', pct + '%');
    }

    // ── Cálculo ──
    function entrada() {
        const e = {
            largo_m: S.largo, ancho_m: S.ancho, alto_m: S.alto, t_interior_c: S.temp,
            producto_id: S.producto, producto_kg_dia: S.kgDia, ciudad: S.ciudad, uso_puerta: S.uso
        };
        if (S.tam === 'cantidad') {
            const p = productoActual();
            e.producto_almacenado_kg = S.unidad === 'kg' ? S.cantidad : S.cantidad * kgCanastilla(p);
        }
        return e;
    }
    function kgCanastilla(p) {
        const k = FE.datos.almacenamientoDatos().kg_por_canastilla;
        return (k.por_producto[p.id] || k[p.categoria]).valor;
    }

    function dimensionarSiHaceFalta() {
        if (S.tam !== 'cantidad') return;
        const d = FE.dimensionar(S.producto, S.cantidad, S.temp, { unidad: S.unidad, altoM: S.alto });
        if (d.encontrado) {
            S.largo = d.largo_m; S.ancho = d.ancho_m;
            $('peDimHint').innerHTML = `Con el margen FrigoPac (+${Math.round(d.margen * 100)} %) necesita un cuarto de <b>${num(d.largo_m, 1)} × ${num(d.ancho_m, 1)} × ${num(d.alto_m, 1)} m</b> (interior). Puede ajustar las medidas en "Sé las medidas".`;
        } else {
            $('peDimHint').textContent = d.mensaje;
        }
    }

    let ultimo = {};
    function mostrar(id, texto) {
        const el = $(id);
        if (!el) return;
        if (el.textContent !== texto) {
            el.textContent = texto;
            if (ultimo[id] !== undefined) { el.classList.remove('pe-flash'); void el.offsetWidth; el.classList.add('pe-flash'); }
            ultimo[id] = texto;
        }
    }

    function calcularYMostrar() {
        let r, al, inv, en, ah;
        try {
            dimensionarSiHaceFalta();
            pintarSliders();
            const e = entrada();
            const tarifa = { tipoUsuario: S.lugar, estrato: S.lugar === 'residencial' ? S.estrato : null };
            r = FE.calcular(e);
            al = FE.capacidadDe(e);
            inv = FE.revisarInventario(e, al);
            en = FE.calcularEnergia(e, tarifa);
            ah = FE.oportunidadesAhorro(e, tarifa);
        } catch (err) {
            console.error(err);
            $('peCapSub').textContent = 'No se pudo calcular con estos datos. Revise medidas y temperatura.';
            return;
        }

        // Equipo
        const c = r.capacidad;
        const btuPorKw = c.btu_h / c.kw;
        const btuLo = c.rango_kw[0] * btuPorKw, btuHi = c.rango_kw[1] * btuPorKw;
        mostrar('peBtu', num(c.btu_h));
        $('peCapSub').textContent = `Rango probable ${num(btuLo)} – ${num(btuHi)} BTU/h · ${num(c.kw, 2)} kW · ${num(c.tr, 2)} TR`;
        $('peCapNote').textContent = `Incluye el margen FrigoPac de ${Math.round(c.margen * 100)} % (casi siempre entra más producto del que se planea). Sin margen serían ${num(r.capacidad_tecnica.btu_h)} BTU/h, con el equipo trabajando ${c.horas_operacion} h al día.`;
        const conf = $('peConf');
        conf.dataset.nivel = r.confianza;
        conf.textContent = 'Confianza ' + r.confianza;

        // Almacenamiento
        mostrar('peKg', num(al.kg));
        $('peKgSub').textContent = al.formato === 'riel'
            ? `En rieles (canales colgadas) · ${num(al.toneladas, 1)} t`
            : `≈ ${num(al.canastillas_equivalentes)} canastillas · ${num(al.toneladas, 1)} t`;
        const oc = $('peOcup');
        if (inv.ocupacion !== null && inv.origen === 'usuario') {
            oc.hidden = false;
            oc.dataset.estado = inv.ocupacion > 1 ? 'no_cabe' : inv.ocupacion > 0.9 ? 'lleno' : 'ok';
            $('peOcupFill').style.width = Math.min(100, inv.ocupacion * 100) + '%';
            $('peOcupTxt').textContent = `Lo que guarda ocupa el ${Math.round(inv.ocupacion * 100)} % del cuarto.`;
        } else oc.hidden = true;

        // Energía
        mostrar('peCosto', pesos(en.costo_mes_promedio_cop));
        const t = en.tarifa;
        const extra = t.contribucion > 0 ? ` + ${Math.round(t.contribucion * 100)} %` : '';
        $('peCostoSub').textContent = `Entre ${pesos(en.rango_costo_mes_cop[0])} y ${pesos(en.rango_costo_mes_cop[1])} · ${num(en.kwh_mes_promedio)} kWh/mes · ${t.operador} $${num(t.cu_cop_kwh)}/kWh${extra}`;
        const maxK = Math.max(...en.meses.map((m) => m.kwh));
        $('peMeses').innerHTML = en.meses.map((m) =>
            `<div class="pe-mes${m.kwh === maxK ? ' is-max' : ''}" data-tip="${m.mes}: ${num(m.kwh)} kWh · ${pesos(m.costo_cop)}">
                <i style="height:${(m.kwh / maxK * 100).toFixed(1)}%"></i><span>${m.mes.charAt(0)}</span></div>`).join('');
        $('peMeses').setAttribute('aria-label', 'Consumo por mes: ' + en.meses.map((m) => `${m.mes} ${num(m.kwh)} kWh`).join(', '));

        // Desglose
        const pct = r.desglose_pct;
        const orden = Object.keys(pct).sort((a, b) => pct[b] - pct[a]);
        $('peDesglose').innerHTML = orden.map((k, i) =>
            `<div class="pe-fila${i === 0 ? ' is-max' : ''}"><span>${CONFIG.nombresCarga[k]}</span>
                <div class="pe-fila__bar"><i style="width:${pct[k].toFixed(1)}%"></i></div>
                <span class="pe-fila__pct">${Math.round(pct[k])} %</span></div>`).join('');

        // Ahorros
        $('peAhorroBox').hidden = !ah.length;
        $('peAhorro').innerHTML = ah.slice(0, 4).map((a) =>
            `<li><span>${a.medida}</span><b>−${pesos(a.ahorro_cop_anual)}/año</b></li>`).join('');

        // Alertas (sin la de carga dominante, que ya se ve en el desglose)
        const peso = { critica: 0, critico: 0, advertencia: 1, info: 2 };
        const nombreNivel = { critica: 'Importante', critico: 'Importante', advertencia: 'Atención', info: 'Dato útil' };
        const alertas = r.alertas.filter((a) => a.regla !== 'carga dominante')
            .concat(inv.origen === 'usuario' ? inv.alertas : [])
            .concat(al.alertas.filter((a) => a.nivel !== 'info' || al.formato === 'riel'))
            .sort((a, b) => peso[a.nivel] - peso[b.nivel]).slice(0, 4);
        $('peAlertasBox').hidden = !alertas.length;
        $('peAlertas').innerHTML = alertas.map((a) =>
            `<li class="pe-alerta" data-nivel="${a.nivel}"><strong>${nombreNivel[a.nivel]}</strong>${a.mensaje}</li>`).join('');

        // Supuestos
        const sup = r.supuestos.filter((s) => s.origen !== 'usuario');
        $('peNSup').textContent = `(${sup.length})`;
        $('peSupuestos').innerHTML = sup.map((s) =>
            `<li><span>${s.descripcion}</span><span>${formatoSupuesto(s)}</span>${s.confianza ? `<em>Confianza ${s.confianza}</em>` : ''}</li>`).join('');

        // Afinar y cotizar
        $('peAfinar').innerHTML = r.para_mejorar_precision.length
            ? '<b>Para afinar el cálculo</b>, FrigoPac le preguntará: ' + r.para_mejorar_precision.map((q) => q.replace(/^¿/, '¿').toLowerCase()).join(' · ')
            : '';
        const p = productoActual();
        const ciudad = ciudades.find((x) => x.id === S.ciudad).nombre;
        const msg = [
            'Hola FrigoPac, diseñé mi cuarto frío en su página:',
            `• Producto: ${p.nombre}`,
            `• Cuarto: ${num(S.largo, 1)} × ${num(S.ancho, 1)} × ${num(S.alto, 1)} m a ${S.temp} °C en ${ciudad}`,
            `• Entran ~${num(S.kgDia)} kg al día`,
            `• Equipo estimado: ${num(c.btu_h)} BTU/h (confianza ${r.confianza})`,
            `• Caben ~${num(al.kg)} kg · Luz ~${pesos(en.costo_mes_promedio_cop)}/mes`,
            'Quiero cotizar mi proyecto.'
        ].join('\n');
        $('peWhatsapp').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

        // Barra de celular
        $('peBarBtu').textContent = num(c.btu_h) + ' BTU/h';
        $('peBarKg').textContent = num(al.kg) + ' kg';
        $('peBarCosto').textContent = pesos(en.costo_mes_promedio_cop);
    }

    function formatoSupuesto(s) {
        const v = s.valor;
        if (typeof v === 'boolean') return v ? 'sí' : 'no';
        if (s.unidad === '–' && typeof v === 'number') return Math.round(v * 100) + ' %';
        if (s.unidad === 'fracción') return Math.round(v * 100) + ' %';
        if (s.unidad === 'nivel') return { bajo: 'poco', medio: 'normal', alto: 'mucho' }[v] || v;
        if (typeof v === 'number') return `${num(v, Number.isInteger(v) ? 0 : 1)} ${s.unidad}`.trim();
        return `${v} ${s.unidad}`.trim();
    }

    let pendiente = null;
    function programar() {
        if (pendiente) cancelAnimationFrame(pendiente);
        pendiente = requestAnimationFrame(() => { pendiente = null; calcularYMostrar(); });
    }

    // ── Eventos ──
    $('peCategorias').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-cat]'); if (!b) return;
        S.cat = b.dataset.cat;
        marcar('peCategorias', 'data-cat', S.cat);
        if (S.cat !== 'congelados' && S.modo === 'congelar' && productoActual().categoria === 'congelados') S.modo = 'refrigerar';
        pintarProductos();
        if (S.cat === 'congelados') S.modo = 'congelar';
        ajustarTemperatura(true);
        programar();
    });
    $('peProducto').addEventListener('change', (ev) => { S.producto = ev.target.value; ajustarTemperatura(true); programar(); });
    $('peModo').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-modo]'); if (!b || b.disabled) return;
        S.modo = b.dataset.modo; ajustarTemperatura(true); programar();
    });
    $('peTemp').addEventListener('input', (ev) => { S.temp = +ev.target.value; programar(); });
    $('peCiudad').addEventListener('change', (ev) => { S.ciudad = ev.target.value; programar(); });
    $('peLugar').addEventListener('change', (ev) => { S.lugar = ev.target.value; $('peEstratoWrap').hidden = S.lugar !== 'residencial'; programar(); });
    $('peEstrato').addEventListener('change', (ev) => { S.estrato = +ev.target.value; programar(); });
    $('peTamanoModo').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-tam]'); if (!b) return;
        S.tam = b.dataset.tam;
        marcar('peTamanoModo', 'data-tam', S.tam);
        $('peMedidas').hidden = S.tam !== 'medidas';
        $('peCantidad').hidden = S.tam !== 'cantidad';
        programar();
    });
    ['peLargo', 'peAncho', 'peAlto', 'peKgDia'].forEach((id) => $(id).addEventListener('input', (ev) => {
        const k = { peLargo: 'largo', peAncho: 'ancho', peAlto: 'alto', peKgDia: 'kgDia' }[id];
        S[k] = +ev.target.value; programar();
    }));
    $('peCantidadNum').addEventListener('input', (ev) => { const v = +ev.target.value; if (v > 0) { S.cantidad = v; programar(); } });
    $('peCantidadUnidad').addEventListener('change', (ev) => { S.unidad = ev.target.value; programar(); });
    $('pePuerta').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-uso]'); if (!b) return;
        S.uso = b.dataset.uso; marcar('pePuerta', 'data-uso', S.uso); programar();
    });

    // Barra de celular: se esconde cuando los resultados están a la vista
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((ents) => ents.forEach((en) => $('peBar').classList.toggle('is-oculta', en.isIntersecting)),
            { threshold: 0.25 }).observe($('peResultados'));
    }

    // ── Arranque ──
    pintarCategorias();
    pintarProductos();
    pintarCiudades();
    marcar('peTamanoModo', 'data-tam', S.tam);
    marcar('pePuerta', 'data-uso', S.uso);
    ajustarTemperatura(false);
    calcularYMostrar();
})();
