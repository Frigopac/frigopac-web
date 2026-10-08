/* ============================================
   FRIGOPAC - Informe técnico interno de un proyecto guardado.
   Solo para FrigoPac: muestra todo lo que calcula el motor (BTU, supuestos,
   sensibilidad, alertas) y los datos para repetir el caso en INTARCON Client360.
   ============================================ */
(function () {
    'use strict';
    const FE = window.FrigoPacEngine;
    const M = window.FrigoPacModelo;
    if (!FE || !M) return;

    const n = (x, d = 0) => (x == null || Number.isNaN(x) ? '–' : Number(x).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }));
    const pesos = (x) => '$' + n(Math.round(x / 1000) * 1000);
    const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const tabla = (cab, filas, cls = '') => `<div class="inf-tabla ${cls}"><table><thead><tr>${cab.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${filas.map((f) => `<tr>${f.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const seccion = (t, cuerpo, sub = '') => `<section class="inf-sec"><h2>${t}</h2>${sub ? `<p class="inf-sub">${sub}</p>` : ''}${cuerpo}</section>`;
    const LLEGA = { ambiente: 'Sin frío (a temperatura ambiente)', refrigerado: 'Ya frío', congelado: 'Ya congelado' };
    const PUERTA = { bajo: 'Pocas veces', medio: 'Varias veces', alto: 'Todo el día' };
    const LUGAR = { comercial: 'Local comercial', industrial: 'Bodega o planta', residencial: 'Casa o finca' };
    const CARGA = { transmision: 'Transmisión (paredes, techo, piso, puerta)', producto: 'Producto (enfriar, congelar, respiración)', aire: 'Aire (puerta y ventilación)', internas: 'Internas (personas, luces)', equipos: 'Equipos (ventiladores, deshielo, resistencia)' };

    function render(el, S) {
        if (S.vista === 'bodega') return renderBodega(el, S);
        const x = M.correr(S);
        const { e, r, al, en } = x;
        const p = FE.datos.producto(S.producto);
        const c = FE.datos.listaCiudades().find((k) => k.id === M.ciudadMotor(S)) || {};
        const P = r.parametros, d = r.detalle;
        const u = S.unidad === 'kg' ? 'kg' : 'canastillas';
        const kgGuardo = M.aKg(S, S.guardo), kgDia = M.aKg(S, S.llegan);
        const btuTec = r.capacidad_tecnica.btu_h, btuRec = r.capacidad.btu_h;
        const rangoBtu = r.capacidad.rango_kw.map((k) => k * 3412.14);
        const ciudad = S.ciudad === 'otra' ? `Otra ciudad (clima de ${c.nombre})` : c.nombre;
        let h = '';

        h += `<header class="inf-cab">
            <div><p class="inf-eyebrow">Informe técnico · solo FrigoPac</p>
            <h1>${esc(S.id || 'Proyecto sin guardar')} · ${esc(p.nombre)} en ${esc(ciudad)}</h1>
            <p class="inf-sub">Motor v${FE.VERSION} · ${new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })} · Estimación preliminar, se confirma en la visita.</p></div>
        </header>`;

        h += `<div class="inf-kpis">
            <div class="inf-kpi inf-kpi--prin"><span>Capacidad recomendada</span><strong>${n(btuRec)} BTU/h</strong><small>${n(r.capacidad.kw, 2)} kW · ${n(r.capacidad.tr, 2)} TR · margen ${n(r.capacidad.margen * 100)} % · ${r.capacidad.horas_operacion} h/día</small></div>
            <div class="inf-kpi"><span>Capacidad técnica (sin margen)</span><strong>${n(btuTec)} BTU/h</strong><small>${n(r.capacidad_tecnica.kw, 2)} kW · la que se compara con INTARCON</small></div>
            <div class="inf-kpi"><span>Rango por incertidumbre</span><strong>${n(rangoBtu[0])} – ${n(rangoBtu[1])}</strong><small>BTU/h recomendados · confianza ${esc(r.confianza)}</small></div>
            <div class="inf-kpi"><span>Carga del día</span><strong>${n(r.carga_24h_kj_dia)} kJ/día</strong><small>${n(r.carga_24h_kw, 2)} kW promedio · ${esc(r.proceso.replace(/_/g, ' '))}</small></div>
        </div>`;

        if (S.contacto) {
            const ct = S.contacto;
            h += seccion('Cliente', tabla(['Dato', 'Valor'], [
                ['Nombre', esc(ct.nombre)], ['WhatsApp', esc(ct.whatsapp)], ['Correo', esc(ct.correo || '–')], ['Negocio', esc(ct.empresa || '–')],
                ['En qué punto está', esc({ explorando: 'Mirando opciones', meses: 'Próximos meses', cotizar: 'Quiere cotizar ya' }[ct.etapa] || '–')]
            ], 'inf-tabla--kv'));
        }

        h += seccion('Lo que dijo el cliente', tabla(['Dato', 'Valor', 'Origen'], [
            ['Producto', esc(p.nombre), 'cliente'],
            ['Ciudad / lugar', `${esc(ciudad)} · ${LUGAR[S.lugar]}${S.lugar === 'residencial' ? ` estrato ${S.estrato}` : ''}`, 'cliente'],
            ['Temperatura del cuarto', `${S.t} °C`, 'cliente (arrancó en la usual del producto)'],
            ['Cómo llega el producto', LLEGA[S.estado] || S.estado, 'cliente'],
            ['Guarda como máximo', u === 'kg' ? `${n(kgGuardo)} kg` : `${n(S.guardo)} ${u} (${n(kgGuardo)} kg)`, 'cliente'],
            ['Le llega al día', u === 'kg' ? `${n(kgDia)} kg` : `${n(S.llegan)} ${u} (${n(kgDia)} kg)`, 'cliente'],
            ['Medidas interiores', `${n(S.largo, 1)} × ${n(S.ancho, 1)} × ${n(S.alto, 1)} m (${n(S.largo * S.ancho * S.alto, 1)} m³)`, S.tam === 'auto' ? 'propuestas por la página' : 'cliente'],
            ['Uso de la puerta', PUERTA[S.uso], 'cliente'],
            ['Cortina de PVC / piso aislado', `${S.cortina ? 'Sí' : 'No'} / ${e.piso_aislado ? 'Sí' : 'No'}`, 'cliente'],
            ['Escenarios que probó', esc((S.probados || []).join(', ') || 'ninguno'), 'página']
        ]));

        const filas = Object.keys(r.desglose_kw).map((k) => [CARGA[k], n(r.desglose_kw[k] * 1000), n(r.desglose_kj_dia[k]), `${n(r.desglose_pct[k], 1)} %`]);
        filas.push(['<b>Total</b>', `<b>${n(r.carga_24h_kw * 1000)}</b>`, `<b>${n(r.carga_24h_kj_dia)}</b>`, '<b>100 %</b>']);
        h += seccion('Desglose de la carga', tabla(['Carga', 'W (24 h)', 'kJ/día', '%'], filas, 'inf-num'));

        const t = d.transmision;
        const sup = ['paredes', 'techo', 'piso', 'puertas'].map((k) => [k.charAt(0).toUpperCase() + k.slice(1), n(t.areas_m2[k], 2), n(k === 'piso' ? t.u_piso : k === 'puertas' ? t.u_puerta : t.u_panel, 3), n(t.delta_t_k[k], 1), n(t[`${k}_w`])]);
        let det = tabla(['Superficie', 'Área m²', 'U W/m²K', 'ΔT K', 'W'], sup, 'inf-num');
        det += tabla(['Producto', 'Valor'], [
            ['Enfriar arriba del punto de congelación', `${n(d.producto.sensible_arriba_w)} W`],
            ['Congelar (latente)', `${n(d.producto.latente_w)} W`],
            ['Enfriar bajo el punto de congelación', `${n(d.producto.sensible_abajo_w)} W`],
            ['Respiración', `${n(d.producto.respiracion_w)} W`],
            ['Propiedades', `c arriba ${n(d.producto.propiedades.c_arriba_kj_kgk, 2)} · c abajo ${n(d.producto.propiedades.c_abajo_kj_kgk, 2)} kJ/kg·K · latente ${n(d.producto.propiedades.h_latente_kj_kg, 1)} kJ/kg · congela a ${n(d.producto.propiedades.t_congelacion_c, 1)} °C · agua ${n(d.producto.propiedades.x_agua * 100, 1)} %`],
            ['Fuente de propiedades', esc(d.producto.propiedades.origen)]
        ], 'inf-tabla--kv');
        det += tabla(['Aire', 'Valor'], [
            ['Método usado', esc(d.aire.metodo_puerta)],
            ['Renovaciones por día', n(d.aire.renovaciones_dia, 1)],
            ['Puerta (método usado)', `${n(d.aire.puerta_w)} W`],
            ['Puerta con ASHRAE Gosney-Olama (referencia)', `${n(d.aire.ashrae_gosney_olama_w)} W`],
            ['Ventilación por CO2', d.aire.ventilacion_co2_m3h ? `${n(d.aire.ventilacion_co2_w)} W · ${n(d.aire.ventilacion_co2_m3h, 1)} m³/h · ${n(d.aire.co2_kg_dia, 1)} kg CO2/día` : 'No aplica'],
            ['Protección de puerta (E)', n(d.aire.E, 2)]
        ], 'inf-tabla--kv');
        det += tabla(['Internas y equipos', 'Valor'], [
            ['Personas', `${n(d.internas.personas_w)} W`], ['Iluminación', `${n(d.internas.iluminacion_w)} W`],
            ['Ventiladores del evaporador', `${n(d.equipos.ventiladores_w)} W`],
            ['Deshielo', `${n(d.equipos.desescarche_w)} W (${esc(d.equipos.desescarche)})`],
            ['Resistencia de puerta', `${n(d.equipos.resistencia_puerta_w)} W`]
        ], 'inf-tabla--kv');
        h += seccion('Detalle por carga', det);

        h += seccion('Supuestos del cálculo', tabla(['Parámetro', 'Valor', 'Origen', 'Confianza', 'Fuente'],
            r.supuestos.map((s) => [esc(s.descripcion), `${esc(typeof s.valor === 'boolean' ? (s.valor ? 'sí' : 'no') : s.valor)} ${esc(s.unidad === '–' ? '' : s.unidad)}`, esc(s.origen), esc(s.confianza || '–'), `<small>${esc(s.fuente)}</small>`])),
            'Lo que el motor tuvo que asumir porque el cliente no lo dijo. Lo de confianza baja es lo primero que se confirma.');

        h += seccion('Qué mueve más el resultado', tabla(['Variable', 'Impacto', 'Mueve la capacidad (kW)', 'Pregunta al cliente'],
            r.sensibilidad.slice(0, 8).map((s) => [esc(s.variable), `${n(s.impacto_pct, 1)} %`, `${s.mueve_kw[0] >= 0 ? '+' : ''}${n(s.mueve_kw[0], 2)} / +${n(s.mueve_kw[1], 2)}`, esc(s.pregunta || '–')]), 'inf-num'));

        h += seccion('Para la llamada', `<ol class="inf-lista">${r.para_mejorar_precision.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>`);
        const alertas = r.alertas.concat(al.alertas || []);
        h += seccion('Alertas técnicas', alertas.length ? `<ul class="inf-alertas">${alertas.map((a) => `<li data-nivel="${a.nivel}"><b>${esc(a.nivel)}</b> ${esc(a.mensaje)}</li>`).join('')}</ul>` : '<p>Ninguna.</p>');

        const ex = M.explicarCapacidad(S, al);
        h += seccion(`Cómo se guarda y cómo sale lo que cabe · ${esc(ex.titulo)}`,
            `<p>${esc(ex.texto)}</p><ol class="inf-lista">${ex.pasos.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>` +
            (ex.alterno ? `<p class="inf-sub">${esc(ex.alterno.texto)}</p>` : ''),
            S.formato ? 'Formato elegido por el cliente.' : 'Formato por defecto para este producto y temperatura (el cliente no lo cambió).');
        const dis = al.distribucion || {};
        h += seccion('Almacenamiento', tabla(['Dato', 'Valor'], [
            ['Formato', esc(al.formato)], ['Método', esc(al.metodo)],
            ['Capacidad', `${n(al.kg)} kg (rango ${n(al.rango_kg[0])} – ${n(al.rango_kg[1])})${al.canastillas_equivalentes ? ` · ${n(al.canastillas_equivalentes)} canastillas` : ''}`],
            ['Volumen útil', al.volumen_util_m3 != null ? `${n(al.volumen_util_m3, 1)} m³` : '–'],
            ['Ocupación declarada', `${n(kgGuardo / al.kg * 100)} %`],
            ['Distribución a mano (referencia)', dis.kg != null ? `${n(dis.kg)} kg · ${esc(dis.descripcion || '')}` : '–'],
            ['Con separación de la Res. 2674', dis.res_2674 && dis.res_2674.kg != null ? `${n(dis.res_2674.kg)} kg` : '–']
        ], 'inf-tabla--kv'));

        const tf = en.tarifa;
        let ener = tabla(['Dato', 'Valor'], [
            ['Consumo', `${n(en.kwh_mes_promedio)} kWh/mes (rango ${n(en.rango_kwh_mes[0])} – ${n(en.rango_kwh_mes[1])})`],
            ['Costo', `${pesos(en.costo_mes_promedio_cop)} al mes (rango ${pesos(en.rango_costo_mes_cop[0])} – ${pesos(en.rango_costo_mes_cop[1])}) · ${pesos(en.costo_anual_cop)} al año`],
            ['Tarifa', `${esc(tf.operador)} · ${n(tf.cu_cop_kwh)} $/kWh${tf.contribucion ? ` + ${n(tf.contribucion * 100)} % contribución` : ''} = ${n(tf.cop_kwh)} $/kWh · ${esc(tf.tipo_usuario)}${tf.periodo ? ` · pliego ${tf.periodo}` : ''}`],
            ['COP promedio del año', n(en.cop_promedio, 2)],
            ['Reparto del consumo', Object.entries(en.desglose_kwh_anual).filter(([, v]) => v > 0).map(([k, v]) => `${k.replace(/_/g, ' ')} ${n(v / 12)} kWh/mes`).join(' · ')]
        ], 'inf-tabla--kv');
        ener += tabla(['Mes', 'T aire °C', 'COP', 'kWh', '$'], en.meses.map((m) => [esc(m.mes), n(m.t_aire_c, 1), n(m.cop, 2), n(m.kwh), pesos(m.costo_cop)]), 'inf-num');
        h += seccion('Energía', ener);

        // Datos para repetir el caso en INTARCON Client360 (no tiene cortina de PVC: se compara el cuarto sin ella)
        const xi = S.cortina ? M.correr(S, { cortina: false }) : x;
        const ri = xi.r, Pi = ri.parametros, di = ri.detalle;
        const pr = di.producto.propiedades;
        const intar = [
            ['Tipo de cámara', 'Cámara frigorífica modular'],
            ['Espesor de aislamiento', `${n(Pi.panel_espesor_m * 1000)} mm · poliuretano ${n(Pi.panel_lambda, 3)} W/m·K`],
            ['Aislamiento del suelo', Pi.piso_aislado ? `Sí · ${n(Pi.piso_espesor_m * 1000)} mm` : 'No'],
            ['Largo × fondo × alto (interior)', `${n(Pi.largo_m, 2)} × ${n(Pi.ancho_m, 2)} × ${n(Pi.alto_m, 2)} m`],
            ['Aplicación', esc(ri.supuestos.find((s) => s.clave === 'proceso')?.valor || ri.proceso)],
            ['Temperatura de cámara', `${Pi.t_int} °C`],
            ['Humedad de conservación', `${n(Pi.hr_int * 100)} %`],
            ['Localización', 'España (Client360 no tiene Colombia); escribir a mano la temperatura y la humedad de abajo'],
            ['Emplazamiento', Pi.instalacion === 'interior' ? 'En interior de edificio' : 'Intemperie'],
            ['Temperatura ambiente', `${n(Pi.t_ext, 1)} °C (diseño de ${esc(c.nombre)})`],
            ['Humedad relativa ambiente', `${n(Pi.hr_ext * 100)} %`],
            ['Altitud', `${n(Pi.elevacion_m)} m`],
            ['Temperatura del terreno (para el piso)', `${n(Pi.t_terreno, 1)} °C · Client360 usa sus medias mensuales de España; si el piso va sin aislar, la diferencia sale de aquí`],
            ['Tipo de producto', esc(p.nombre)],
            ['Punto de congelación', `${n(pr.t_congelacion_c, 1)} °C`],
            ['Contenido en agua', `${n(pr.x_agua * 100, 1)} %`],
            ['Calor específico / congelado', `${n(pr.c_arriba_kj_kgk, 2)} / ${n(pr.c_abajo_kj_kgk, 2)} kJ/kg·K`],
            ['Carga total', `${n(Pi.kg_almacenado || kgGuardo)} kg`],
            ['Rotación diaria', `${n(Pi.kg_dia)} kg/24h (tasa ${n(Pi.kg_dia / Math.max(1, Pi.kg_almacenado || kgGuardo) * 100, 1)} %)`],
            ['Temperatura de entrada', `${n(Pi.t_entrada, 1)} °C`],
            ['Puerta', `${n(Pi.puerta_ancho, 2)} × ${n(Pi.puerta_alto, 2)} m · ${Pi.n_puertas} puerta(s)`],
            ['Renovaciones diarias', `${n(di.aire.renovaciones_dia, 1)} /24h (poner este número; Client360 calcula las aperturas)`],
            ['Personas', `${Pi.personas} · ${Pi.horas_personas} h/día`],
            ['Iluminación', `${n(Pi.iluminacion_w_m2)} W/m²`],
            ['Desescarche', esc(Pi.desescarche)],
            ['Tiempo de funcionamiento', `${Pi.horas_operacion} h`]
        ];
        const cmp = [
            ['Refrigeración del producto', n(ri.desglose_kj_dia.producto)],
            ['Transmisión de calor', n(ri.desglose_kj_dia.transmision)],
            ['Renovación de aire', n(ri.desglose_kj_dia.aire)],
            ['Cargas térmicas (personas, luces, ventiladores, deshielo)', n(ri.desglose_kj_dia.internas + ri.desglose_kj_dia.equipos)],
            ['<b>TOTAL</b>', `<b>${n(ri.carga_24h_kj_dia)}</b>`],
            ['<b>Potencia frigorífica total</b>', `<b>${n(ri.capacidad_tecnica.btu_h)} BTU/h · ${n(ri.capacidad_tecnica.kw * 1000)} W</b>`]
        ];
        h += seccion('Para repetir este caso en INTARCON Client360',
            tabla(['Campo en Client360', 'Valor'], intar, 'inf-tabla--kv') +
            `<p class="inf-sub">Lo que debería dar (el motor sin margen, igual que Client360)${S.cortina ? '. Client360 no tiene cortina de PVC: esta comparación es el mismo cuarto sin cortina' : ''}:</p>` +
            tabla(['Necesidades frigoríficas', 'kJ/día (motor)'], cmp, 'inf-num') +
            `<p class="inf-sub">Con los mismos datos, los 4 casos anteriores quedaron dentro de ±3 %. Si la diferencia pasa de 5 %, casi siempre es el piso sin aislar (terreno) o la respiración de la fruta.</p>`);

        el.innerHTML = h;
    }


    function renderBodega(el, S) {
        const p = FE.datos.producto(S.producto);
        const bd = S.bmodo === 'medidas' ? FE.capacidadBodega(S.blargo, S.bancho, S.balt, S.producto, S.t, S.bsis) : FE.estimarBodega(S.bt, S.producto, S.t, S.bsis, S.balt);
        const tGuard = S.bmodo === 'medidas' ? bd.toneladas : S.bt;
        const tf = FE.tarifa(M.ciudadMotor(S), S.lugar, null, S.lugar === 'residencial' ? Number(S.estrato) : null);
        const c = FE.datos.listaCiudades().find((k) => k.id === M.ciudadMotor(S)) || {};
        let h = `<header class="inf-cab"><div><p class="inf-eyebrow">Informe técnico · solo FrigoPac</p>
            <h1>${esc(S.id || 'Proyecto sin guardar')} · Bodega de ${n(tGuard)} t de ${esc(p.nombre)}${S.bmodo === 'medidas' ? ` (${n(S.blargo)} × ${n(S.bancho)} × ${n(S.balt)} m del cliente)` : ''} en ${esc(c.nombre || '')}</h1>
            <p class="inf-sub">Motor 4 (bodega) v${FE.VERSION} · Orden de magnitud con datos de industria; no es diseño.</p></div></header>`;
        h += `<div class="inf-kpis">
            <div class="inf-kpi inf-kpi--prin"><span>Volumen de cámaras</span><strong>${n(bd.volumen_m3)} m³</strong><small>${n(bd.kg_por_m3_bruto)} kg por m³ bruto</small></div>
            <div class="inf-kpi"><span>Área de planta</span><strong>${n(bd.area_m2)} m²</strong><small>${n(S.balt)} m de altura libre · ${n(bd.canchas, 1)} canchas</small></div>
            <div class="inf-kpi"><span>Posiciones de estiba</span><strong>${n(bd.posiciones)}</strong><small>${n(bd.kg_por_estiba)} kg por estiba</small></div>
            <div class="inf-kpi"><span>Energía</span><strong>${n(bd.energia_kwh_anual[0] / 1000)}–${n(bd.energia_kwh_anual[1] / 1000)} MWh/año</strong><small>${n(bd.energia_kwh_m3_anual[0], 1)}–${n(bd.energia_kwh_m3_anual[1], 1)} kWh/m³·año · ${n(tf.cop_kwh)} $/kWh</small></div>
        </div>`;
        if (S.contacto) h += seccion('Cliente', tabla(['Dato', 'Valor'], [['Nombre', esc(S.contacto.nombre)], ['WhatsApp', esc(S.contacto.whatsapp)], ['Negocio', esc(S.contacto.empresa || '–')]], 'inf-tabla--kv'));
        h += seccion('Datos y supuestos', tabla(['Dato', 'Valor', 'Fuente'], [
            ['Producto guardado', S.bmodo === 'medidas' ? `${n(bd.toneladas)} t que caben (quería ${S.bt ? n(S.bt) + ' t' : '–'})` : `${n(S.bt)} t`, S.bmodo === 'medidas' ? 'calculado de las medidas del cliente' : 'cliente'],
            ['Temperatura', `${S.t} °C (${bd.congelado ? 'congelado' : 'refrigerado'})`, 'cliente'],
            ['Sistema', `${esc(bd.sistema_nombre)}: usa el ${n(bd.fraccion_volumen * 100)} % del volumen`, 'Dexion'],
            ['Carga', `${bd.formato_carga} · ${n(bd.densidad_carga_kg_m3)} kg por m³ de carga`, 'almacenamiento.json'],
            ['Estiba', `1,2 × 1,0 m, 1,52 m de carga, máximo 1.000 kg`, 'FAO'],
            ['Altura libre', `${n(S.balt)} m`, 'cliente'],
            ['Referencia mundial', `${n(bd.volumen_referencia_gcca_m3)} m³ con 4,3 m³/t`, 'GCCA 2020'],
            ['Energía baja / alta', `${n(bd.energia_kwh_anual[0])} / ${n(bd.energia_kwh_anual[1])} kWh/año`, 'Cold Chain Federation / ICE-E']
        ]));
        h += seccion('Lo que falta para diseñar', '<ol class="inf-lista"><li>Número de cámaras, temperaturas y rotación de cada una.</li><li>Muelles: camiones por día, puertas y antecámaras.</li><li>Sistema de frío central (amoníaco, CO₂) y redundancia.</li><li>Subestación eléctrica, lote y normas locales.</li></ol>');
        el.innerHTML = h;
    }

    window.FrigoPacInforme = { render };

    // Página informe.html: lee el proyecto del enlace (#p=...).
    const raiz = document.getElementById('informe');
    if (raiz && raiz.dataset.auto !== 'no') {
        const m = location.hash.match(/^#p=(.+)$/);
        if (!m) { raiz.innerHTML = '<p class="inf-vacio">Abra este informe desde el enlace de la hoja de proyectos.</p>'; return; }
        try { render(raiz, M.decodificar(m[1])); } catch (err) { raiz.innerHTML = '<p class="inf-vacio">El enlace del proyecto no se pudo leer. Revise que esté completo.</p>'; }
    }
})();
