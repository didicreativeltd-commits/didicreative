/* =========================
   主要功能初始化
========================= */
(function() {
    'use strict';

    // DOM 載入完成後執行
    document.addEventListener('DOMContentLoaded', function() {
        initHeroBanner();
        initCarousel();
        initLightbox();
        initRevealAnimation();
        smoothScroll();
        initMemberCardGlow();
    });

    /* =========================
       Hero Banner 輪播功能
    ========================= */
    function initHeroBanner() {
        const heroBanner = document.querySelector('.hero-banner');
        if (!heroBanner) return;

        const slides = heroBanner.querySelectorAll('.hero-banner-slide');
        const prevBtn = heroBanner.querySelector('.hero-banner-btn-prev');
        const nextBtn = heroBanner.querySelector('.hero-banner-btn-next');
        
        if (slides.length === 0) return;

        let currentIndex = 0;
        let autoPlayInterval = null;
        const autoPlayDelay = 5000; // 每5秒自動切換

        // 顯示指定索引的圖片
        function showSlide(index) {
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
        }

        // 下一張
        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }

        // 上一張
        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(currentIndex);
        }

        // 開始自動播放
        function startAutoPlay() {
            stopAutoPlay(); // 清除現有的interval
            autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
        }

        // 停止自動播放
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // 按鈕事件
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                nextSlide();
                startAutoPlay(); // 重新開始自動播放
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                prevSlide();
                startAutoPlay(); // 重新開始自動播放
            });
        }

        // 當滑鼠懸停時暫停自動播放
        heroBanner.addEventListener('mouseenter', stopAutoPlay);
        heroBanner.addEventListener('mouseleave', startAutoPlay);

        // 初始化顯示第一張
        showSlide(0);
        
        // 開始自動播放
        startAutoPlay();
    }

    /* =========================
       輪播（Carousel）功能
    ========================= */
    function initCarousel() {
        const carousels = document.querySelectorAll('.carousel');
        
        carousels.forEach(carousel => {
            const track = carousel.querySelector('.track');
            const prevBtn = carousel.querySelector('.carousel-btn-prev') || carousel.querySelector('.nav.prev');
            const nextBtn = carousel.querySelector('.carousel-btn-next') || carousel.querySelector('.nav.next');
            
            if (!track || !prevBtn || !nextBtn) return;

            // 取得每列顯示數量
            const colsDesktop = parseInt(carousel.dataset.colsDesktop) || 3;
            const colsMobile = parseInt(carousel.dataset.colsMobile) || 2;
            const isMobile = window.innerWidth <= 980;
            const cols = isMobile ? colsMobile : colsDesktop;

            // 計算滑動距離
            function getScrollAmount() {
                const items = track.querySelectorAll('.item');
                if (items.length === 0) return 0;
                
                const firstItem = items[0];
                const itemWidth = firstItem.offsetWidth;
                const gap = parseFloat(getComputedStyle(track).gap) || 16;
                return itemWidth + gap;
            }

            // 上一張
            prevBtn.addEventListener('click', function() {
                const scrollAmount = getScrollAmount();
                track.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });

            // 下一張
            nextBtn.addEventListener('click', function() {
                const scrollAmount = getScrollAmount();
                track.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });

            // 視窗大小改變時更新
            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    // 觸發重新計算
                }, 250);
            });
        });
    }

    /* =========================
       燈箱（Lightbox）功能
    ========================= */
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lbImg = lightbox?.querySelector('.lb-img');
        const lbClose = lightbox?.querySelector('.lb-close');
        const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
        
        if (!lightbox || !lbImg || !lbClose) return;

        // 開啟燈箱
        lightboxTriggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const imgSrc = trigger.href || trigger.dataset.lightbox;
                if (imgSrc) {
                    lbImg.src = imgSrc;
                    lbImg.alt = trigger.querySelector('img')?.alt || '燈箱圖片';
                    lightbox.classList.add('open');
                    lightbox.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden'; // 防止背景滾動
                }
            });
        });

        // 關閉燈箱
        function closeLightbox() {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        lbClose.addEventListener('click', closeLightbox);

        // 點擊背景關閉
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // ESC 鍵關閉
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
    }

    /* =========================
       Reveal 進場動畫
    ========================= */
    function initRevealAnimation() {
        const reveals = document.querySelectorAll('.reveal');
        if (reveals.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    
                    // 強制觸發 shiny-text 動畫
                    const shinyTexts = entry.target.querySelectorAll('.shiny-text');
                    shinyTexts.forEach(text => {
                        // 強制重新觸發動畫
                        text.style.animation = 'none';
                        void text.offsetWidth; // 觸發重排
                        text.style.animation = null;
                    });
                    
                    // 動畫執行後可以移除 observer（可選）
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        reveals.forEach(reveal => {
            observer.observe(reveal);
        });
        
        // 如果 hero 已經在視窗內，立即觸發
        const hero = document.querySelector('.hero.reveal');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                hero.classList.add('in');
            }
        }
        
        // 強制啟動 shiny-text 動畫（不管 reveal 狀態）
        function forceShinyTextAnimation() {
            const shinyTexts = document.querySelectorAll('.shiny-text');
            shinyTexts.forEach(text => {
                // 確保動畫執行 - 頻率慢一點（5秒），平滑過渡
                if (text.classList.contains('small')) {
                    text.style.animation = 'shine 5s linear infinite';
                } else if (text.classList.contains('big')) {
                    text.style.animation = 'shine 5s linear infinite 2.2s';
                }
                // 確保動畫播放
                text.style.animationPlayState = 'running';
            });
        }
        
        // 立即執行一次
        forceShinyTextAnimation();
        
        // 延遲執行確保樣式已載入
        setTimeout(forceShinyTextAnimation, 100);
        setTimeout(forceShinyTextAnimation, 500);
    }

    /* =========================
       平滑滾動（錨點連結）
    ========================= */
    function smoothScroll() {
        // 使用 CSS scroll-behavior: smooth 即可
        // 這裡可以添加額外的平滑滾動邏輯（如果需要）
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = link.getAttribute('href');
                if (href === '#' || href === '#top') return;
                
                const target = document.querySelector(href);
                if (target) {
                    // 讓瀏覽器自然處理平滑滾動
                    // CSS 已設定 scroll-behavior: smooth
                }
            });
        });
    }

    /* =========================
       成員卡片光暈效果（MagicBento 風格）
    ========================= */
    function initMemberCardGlow() {
        const members = document.querySelectorAll('.member, .member-ceo');
        const spotlightRadius = 300;
        
        function updateCardGlow(card, mouseX, mouseY, glow, radius) {
            const rect = card.getBoundingClientRect();
            const relativeX = ((mouseX - rect.left) / rect.width) * 100;
            const relativeY = ((mouseY - rect.top) / rect.height) * 100;
            card.style.setProperty('--glow-x', `${relativeX}%`);
            card.style.setProperty('--glow-y', `${relativeY}%`);
            card.style.setProperty('--glow-intensity', glow.toString());
            card.style.setProperty('--glow-radius', `${radius}px`);
        }
        
        function calculateSpotlightValues(radius) {
            return {
                proximity: radius * 0.5,
                fadeDistance: radius * 0.75
            };
        }
        
        members.forEach(member => {
            member.addEventListener('mousemove', function(e) {
                const rect = member.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
                const maxDistance = Math.max(rect.width, rect.height) / 2;
                const effectiveDistance = Math.max(0, distance - maxDistance);
                
                const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
                let glowIntensity = 0;
                
                if (effectiveDistance <= proximity) {
                    glowIntensity = 1;
                } else if (effectiveDistance <= fadeDistance) {
                    glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
                }
                
                updateCardGlow(member, e.clientX, e.clientY, glowIntensity, spotlightRadius);
            });
            
            member.addEventListener('mouseleave', function() {
                member.style.setProperty('--glow-intensity', '0');
            });
        });
    }

})();
