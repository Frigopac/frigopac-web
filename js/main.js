/* ============================================
   FRIGOPAC - JavaScript Principal
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // 1. CABECERA: sombra al bajar
    // ============================================
    const siteHeader = document.getElementById('siteHeader');

    if (siteHeader) {
        const marcarScroll = function() {
            siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        window.addEventListener('scroll', marcarScroll, { passive: true });
        marcarScroll();
    }

    // ============================================
    // 2. MENÚ EN CELULAR
    // ============================================
    const menuToggle = document.getElementById('siteMenuToggle');
    const siteMenu = document.getElementById('siteMenu');

    if (menuToggle && siteMenu) {
        const abrirMenu = function(abrir) {
            menuToggle.setAttribute('aria-expanded', String(abrir));
            menuToggle.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
            siteMenu.classList.toggle('is-open', abrir);
            document.body.classList.toggle('has-menu-open', abrir);
        };

        menuToggle.addEventListener('click', function() {
            abrirMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
        });

        siteMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                abrirMenu(false);
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && siteMenu.classList.contains('is-open')) {
                abrirMenu(false);
                menuToggle.focus();
            }
        });

        const escritorio = window.matchMedia('(min-width: 960px)');
        escritorio.addEventListener('change', function(e) {
            if (e.matches) abrirMenu(false);
        });
    }
    
    // ============================================
    // 3. STATS COUNTER ANIMATION
    // ============================================
    const statNumbers = document.querySelectorAll('.stats__number');
    let hasCounterAnimated = false;
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounterAnimated) {
                hasCounterAnimated = true;
                
                statNumbers.forEach(num => {
                    const target = parseInt(num.getAttribute('data-target'));
                    animateCounter(num, target);
                });
            }
        });
    }, {
        threshold: 0.5
    });
    
    const statsSection = document.getElementById('stats');
    if (statsSection) {
        counterObserver.observe(statsSection);
    }
    
    function animateCounter(element, target) {
        let current = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        
        const updateCounter = () => {
            current += increment;
            
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    }
    
    // ============================================
    // 4. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const header = document.getElementById('siteHeader');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ============================================
    // 5. PARALLAX EFFECT ON HERO
    // ============================================
    const heroBackground = document.querySelector('.hero__background img, .hero__background video');
    
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBackground.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        });
    }
    
    // ============================================
    // 7. CARRUSEL FUNCIONAL
    // ============================================
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(function(carousel) {
        const slides = carousel.querySelector('.carousel__slides');
        const totalSlides = carousel.querySelectorAll('.carousel__slide').length;
        const btnPrev = carousel.querySelector('.carousel__btn--prev');
        const btnNext = carousel.querySelector('.carousel__btn--next');
        const dots = carousel.querySelectorAll('.carousel__dot');
        let currentSlide = 0;

        // Función para ir a una slide específica
        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            currentSlide = index;
            slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';

            // Actualizar los puntos
            dots.forEach(function(dot, i) {
                if (i === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Botón siguiente
        btnNext.addEventListener('click', function() {
            goToSlide(currentSlide + 1);
        });

        // Botón anterior
        btnPrev.addEventListener('click', function() {
            goToSlide(currentSlide - 1);
        });

        // Click en los puntos
        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                goToSlide(i);
            });
        });

        // Auto-play: cambia cada 4 segundos
        setInterval(function() {
            goToSlide(currentSlide + 1);
        }, 4000);
    });

    // ============================================
    // 8. SCROLL REVEAL ANIMATIONS
    // ============================================
    const revealEls = document.querySelectorAll('.reveal');

    if (revealEls.length) {
        const revealObserver = new IntersectionObserver(function(entries, obs) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach(function(el) {
            revealObserver.observe(el);
        });
    }

    // ============================================
    // 9. VIDEO DEL HERO — reanudar si el navegador lo pausa
    // ============================================
    const heroVideo = document.querySelector('.hero__bg-video');

    if (heroVideo) {
        const playHeroVideo = function() {
            if (heroVideo.paused && !document.hidden) {
                const attempt = heroVideo.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function() {});
                }
            }
        };

        playHeroVideo();
        heroVideo.addEventListener('loadeddata', playHeroVideo);
        heroVideo.addEventListener('canplay', playHeroVideo);
        document.addEventListener('visibilitychange', playHeroVideo);
    }
});
