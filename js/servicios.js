/* ============================================
   FRIGOPAC - Página Servicios
   Marca en el índice el servicio que se está leyendo.
   ============================================ */
(function () {
    'use strict';
    const capitulos = document.querySelectorAll('.sv-chapter');
    const enlaces = document.querySelectorAll('.sv-nav__link');
    const contador = document.getElementById('svActual');
    if (!capitulos.length || !enlaces.length || !('IntersectionObserver' in window)) return;

    function marcar(id) {
        enlaces.forEach(function (a, i) {
            const activo = a.getAttribute('href') === '#' + id;
            a.classList.toggle('is-active', activo);
            if (activo) {
                a.setAttribute('aria-current', 'true');
                if (contador) contador.textContent = String(i + 1);
                // En celular el índice es una barra que se desliza: mantener visible el activo
                const barra = a.closest('.sv-nav__list');
                if (barra && barra.scrollWidth > barra.clientWidth) {
                    barra.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
                }
            } else {
                a.removeAttribute('aria-current');
            }
        });
    }

    const observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) marcar(e.target.id);
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    capitulos.forEach(function (c) { observador.observe(c); });
    marcar(capitulos[0].id);
})();
