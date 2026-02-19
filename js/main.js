/* ============================================
   FRIGOPAC - JavaScript Principal
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // 1. HEADER SCROLL EFFECT
    // ============================================
    const header = document.getElementById('header');
    
    function handleScroll() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // ============================================
    // 2. MOBILE MENU TOGGLE
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        const mobileLinks = document.querySelectorAll('.mobile-menu__link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
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
                    const headerHeight = header.offsetHeight;
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
    // 6. ACTIVE NAV LINK ON SCROLL
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header__link');
    
    function setActiveLink() {
        const scrollPosition = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}` || 
                        (sectionId === 'hero' && link.getAttribute('href') === 'index.html')) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', setActiveLink);
    
});

<!-- CARRUSEL FUNCIONAL -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Buscar todos los carruseles en la página
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
});
</script>
