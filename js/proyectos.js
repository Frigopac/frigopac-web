/* ============================================
   FRIGOPAC - Página Proyectos
   Filtra las tarjetas de la galería por tipo de proyecto.
   ============================================ */
(function () {
    'use strict';
    const buttons = document.querySelectorAll('.py-filters__btn');
    const cards = document.querySelectorAll('.py-card');
    const count = document.getElementById('pyCount');
    if (!buttons.length || !cards.length) return;

    function filtrar(tipo) {
        let visibles = 0;
        cards.forEach(function (card) {
            const mostrar = tipo === 'todos' || card.dataset.cat === tipo;
            card.hidden = !mostrar;
            if (mostrar) visibles++;
        });
        buttons.forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(btn.dataset.filter === tipo));
        });
        if (count) count.textContent = 'Mostrando ' + visibles + ' de ' + cards.length + ' proyectos';
    }

    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filtrar(btn.dataset.filter);
        });
    });
})();
