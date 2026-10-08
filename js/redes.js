/* ============================================
   FRIGOPAC - Red animada de fondo
   Dibuja puntos celestes que se mueven despacio y se unen con líneas
   en cada <canvas class="net-canvas">. Con "reducir movimiento" queda quieta.
   ============================================ */
(function () {
    'use strict';
    const lienzos = document.querySelectorAll('canvas.net-canvas');
    if (!lienzos.length) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lienzos.forEach(function (canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let ancho = 0, alto = 0, puntos = [], visible = true, cuadro = null;

        function medir() {
            const r = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            ancho = r.width; alto = r.height;
            canvas.width = Math.round(ancho * dpr);
            canvas.height = Math.round(alto * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const cantidad = Math.round(Math.min(70, Math.max(24, (ancho * alto) / 9000)));
            puntos = Array.from({ length: cantidad }, function () {
                return {
                    x: Math.random() * ancho,
                    y: Math.random() * alto,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    r: 1.4 + Math.random() * 2
                };
            });
        }

        function dibujar() {
            ctx.clearRect(0, 0, ancho, alto);
            const enlace = Math.min(140, ancho / 4);
            for (let i = 0; i < puntos.length; i++) {
                const a = puntos[i];
                for (let j = i + 1; j < puntos.length; j++) {
                    const b = puntos[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < enlace) {
                        ctx.strokeStyle = 'rgba(0, 180, 216, ' + (0.35 * (1 - d / enlace)).toFixed(3) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
            }
            ctx.fillStyle = 'rgba(0, 180, 216, 0.85)';
            puntos.forEach(function (p) {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            });
        }

        function mover() {
            puntos.forEach(function (p) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > ancho) p.vx *= -1;
                if (p.y < 0 || p.y > alto) p.vy *= -1;
            });
            dibujar();
            if (visible) cuadro = requestAnimationFrame(mover);
        }

        medir();
        dibujar();
        window.addEventListener('resize', function () { medir(); dibujar(); });
        if (quieto) return;

        // Solo se anima mientras está en pantalla
        new IntersectionObserver(function (entradas) {
            visible = entradas[0].isIntersecting;
            cancelAnimationFrame(cuadro);
            if (visible) cuadro = requestAnimationFrame(mover);
        }).observe(canvas);
    });
})();
