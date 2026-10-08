/* ============================================
   FRIGOPAC - Del estado del proyecto a la entrada del motor.
   Lo usan la página del cliente (proyecto.js) y el informe interno (informe.js),
   para que los dos calculen exactamente lo mismo.
   ============================================ */
(function () {
    'use strict';
    const FE = window.FrigoPacEngine;
    if (!FE) return;

    const producto = (S) => FE.datos.producto(S.producto);
    const NOMBRE_CORTO = { res_canal: 'Carne de res en canal', pollo: 'Pollo', cebolla: 'Cebolla' };
    const nombreCorto = (p) => NOMBRE_CORTO[p.id] || p.nombre.replace(/^Pescado: /, '').replace(/ \(.*\)$/, '');
    function kgCanastilla(p) {
        const k = FE.datos.almacenamientoDatos().kg_por_canastilla;
        return (k.por_producto[p.id] || k[p.categoria]).valor;
    }
    const aKg = (S, x) => (x == null ? 0 : (S.unidad === 'kg' ? x : x * kgCanastilla(producto(S))));
    const ciudadMotor = (S) => (S.ciudad === 'otra' ? S.climaOtro : S.ciudad);

    function entrada(S, extra = {}) {
        const o = { cortina: S.cortina, piso: S.piso, ...extra };
        const e = {
            largo_m: S.largo, ancho_m: S.ancho, alto_m: S.alto, t_interior_c: S.t,
            producto_id: S.producto, producto_kg_dia: aKg(S, S.llegan), ciudad: ciudadMotor(S),
            uso_puerta: S.uso, producto_almacenado_kg: aKg(S, S.guardo), estado_entrada: S.estado
        };
        if (o.cortina) e.proteccion_puerta = 'cortina_pvc';
        e.piso_aislado = S.t < 0 ? true : !!o.piso;
        return e;
    }
    const tarifa = (S) => ({ tipoUsuario: S.lugar, estrato: S.lugar === 'residencial' ? Number(S.estrato) : null });
    function correr(S, extra) {
        const e = entrada(S, extra);
        return { e, r: FE.calcular(e), al: FE.capacidadDe(e, S.formato ? { formato: S.formato } : {}), en: FE.calcularEnergia(e, tarifa(S)) };
    }

    // ── Cómo se guarda el producto y cómo sale lo que cabe (mismo texto en la página y en el informe) ──
    const num = (x, d = 0) => Number(x).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
    const NOTA_CATEGORIA = {
        frutas_verduras: 'La fruta y la verdura se mueven en canastilla plástica: deja pasar el aire frío entre el producto.',
        carnes: 'La carne en cortes va en canastilla, llena por debajo del borde para poder apilar.',
        aves: 'El pollo fresco va en canastilla; congelado, en cajas de cartón.',
        pescados: 'El pescado fresco va en canastilla con hielo. El hielo ocupa espacio, por eso se cuentan menos kilos por canastilla.',
        lacteos: 'Leche, quesos y yogures van en canastilla o en las cajas del fabricante.',
        congelados: 'El helado va en las cajas del fabricante, apiladas sobre estibas.'
    };
    function explicarCapacidad(S, al) {
        const A = FE.datos.almacenamientoDatos();
        const p = producto(S);
        const sup = (k) => (al.supuestos || []).find((s) => s.clave === k);
        const kc = sup('kg_por_canastilla'), dc = sup('densidad_cajas'), fu = sup('fraccion_util');
        const can = A.unidades.canastilla, est = A.unidades.estiba;
        const volCan = can.largo_m * can.ancho_m * can.alto_m;
        const altura = A.geometria.altura_max_manual_m.valor;
        const porNivel = 5;                                   // 60×40 en estiba de 120×100: 5 por nivel
        const niveles = Math.floor(altura / can.alto_m);
        const V = S.largo * S.ancho * S.alto;
        const geo = al.distribucion || {};
        const out = { formato: al.formato, nota: al.formato === 'canastilla' ? (NOTA_CATEGORIA[p.categoria] || '') : '', pasos: [], alterno: null };
        if (al.formato === 'riel') {
            const d = geo.detalle || {};
            const kgm = A.unidades.riel.kg_por_metro.valor;
            out.titulo = 'Colgada en rieles';
            out.texto = `La carne en canal va colgada de ganchos en rieles, a 30 cm del techo y con 80 cm entre rieles para que circule el aire. Se cuentan unos ${kgm} kg por metro de riel (media canal de 110 a 140 kg cada 60 a 80 cm).`;
            out.pasos = [
                `Caben ${d.rieles || '–'} rieles a lo largo del cuarto: ${num(d.metros_riel || 0, 1)} m de riel`,
                `${num(d.metros_riel || 0, 1)} m × ${kgm} kg por metro = ${num(al.kg)} kg colgados`
            ];
            return out;
        }
        let kgm3, rango, unidadTxt;
        if (kc) {
            const r = (A.kg_por_canastilla.por_producto[p.id] || A.kg_por_canastilla[p.categoria]).rango;
            kgm3 = kc.valor / volCan; rango = r.map((k) => k / volCan); unidadTxt = 'canastillas apiladas';
            out.unidad = { nombre: 'Canastilla plástica', medidas: '60 × 40 × 25 cm', kg: kc.valor };
            out.titulo = al.formato === 'estiba' ? 'Canastillas sobre estibas' : 'En canastilla';
            out.texto = `Canastilla plástica de 60 × 40 × 25 cm con unos ${kc.valor} kg de ${nombreCorto(p).toLowerCase()}. Se apilan hasta ${niveles} de alto (${num(altura, 2)} m). Una canastilla ocupa ${num(volCan, 2)} m³, así que un metro cúbico de canastillas apiladas pesa unos ${num(kgm3)} kg. En una estiba de 1,2 × 1,0 m van ${porNivel} por nivel: ${porNivel * niveles} canastillas, unos ${num(porNivel * niveles * kc.valor)} kg.`;
        } else {
            const cat = A.densidad_cajas_kg_m3[p.categoria] || A.densidad_cajas_kg_m3.congelados;
            kgm3 = dc ? dc.valor : cat.valor; rango = cat.rango; unidadTxt = 'cajas apiladas';
            const volEst = est.largo_m * est.ancho_m * altura;
            out.unidad = { nombre: 'Estiba con cajas', medidas: '1,2 × 1,0 m, hasta 1,75 m de alto', kg: Math.round(volEst * kgm3) };
            out.titulo = al.formato === 'estiba' ? 'Cajas sobre estibas' : 'En cajas de cartón';
            out.texto = `El producto va en cajas de cartón apiladas sobre estibas. El tamaño de la caja cambia con cada proveedor, así que no se cuenta caja por caja: se usa cuánto pesa un metro cúbico de cajas apiladas, que para ${nombreCorto(p).toLowerCase()} es de unos ${num(kgm3)} kg (en bodegas se mide entre ${num(rango[0])} y ${num(rango[1])}). Una estiba de 1,2 × 1,0 m con cajas hasta ${num(altura, 2)} m (${num(volEst, 1)} m³) pesa unos ${num(volEst * kgm3)} kg.`;
        }
        const fr = fu ? fu.valor : A.regla_frigopac.fraccion_util.valor;
        out.kgm3 = kgm3; out.rango = rango;
        out.pasos = [
            `Volumen del cuarto: ${num(S.largo, 1)} × ${num(S.ancho, 1)} × ${num(S.alto, 1)} m = ${num(V, 1)} m³`,
            `Menos ${Math.round((1 - fr) * 100)} % para puerta, equipo y pasillos: ${num(V * fr, 1)} m³ para producto`,
            `${num(V * fr, 1)} m³ × ${num(kgm3)} kg por m³ de ${unidadTxt} = ${num(al.kg)} kg`
        ];
        if (geo.kg && geo.kg < al.kg * 0.9) out.alterno = { kg: geo.kg, texto: `Esa cifra supone llenar todo ese espacio, casi hasta el techo. Si carga a mano hasta ${num(altura, 2)} m, sin estantería y dejando pasillo, le caben unos ${num(Math.round(geo.kg / 10) * 10)} kg. FrigoPac confirma cuál aplica a su caso en la visita.` };
        return out;
    }
    const codificar = (estado) => btoa(unescape(encodeURIComponent(JSON.stringify(estado))));
    const decodificar = (b64) => JSON.parse(decodeURIComponent(escape(atob(b64))));

    window.FrigoPacModelo = { producto, nombreCorto, kgCanastilla, aKg, ciudadMotor, entrada, tarifa, correr, explicarCapacidad, codificar, decodificar };
})();
