/* =========================
   CardNav 導覽列功能
   使用 GSAP 實現動畫效果
========================= */
(function() {
    'use strict';

    // 等待 DOM 和 GSAP 載入完成
    function initCardNav() {
        // 檢查 GSAP 是否已載入
        if (typeof gsap === 'undefined') {
            console.warn('CardNav: GSAP library not found. Please include GSAP CDN.');
            return;
        }

        const cardNav = document.getElementById('cardNav');
        const hamburgerMenu = cardNav?.querySelector('.hamburger-menu');
        const menuWrap = cardNav?.querySelector('.menu-wrap');
        const menuItems = cardNav?.querySelectorAll('.menu__item');
        const hamburgerMenuContent = cardNav?.querySelector('.hamburger-menu-content');

        // 檢查是否有新的漢堡選單結構
        if (!cardNav || !hamburgerMenu) {
            console.warn('CardNav: Required elements not found.');
            return;
        }

        // 如果有新的漢堡選單結構，使用新的簡單邏輯
        if (hamburgerMenuContent) {
            let isOpen = false;

            function toggleHamburgerMenu() {
                isOpen = !isOpen;
                if (isOpen) {
                    hamburgerMenu.classList.add('open');
                    cardNav.classList.add('open');
                } else {
                    hamburgerMenu.classList.remove('open');
                    cardNav.classList.remove('open');
                }
            }

            hamburgerMenu.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                toggleHamburgerMenu();
            });

            // 點擊選單項目後關閉選單
            const menuItemLinks = hamburgerMenuContent.querySelectorAll('.hamburger-menu-item');
            menuItemLinks.forEach(link => {
                link.addEventListener('click', function() {
                    setTimeout(() => {
                        isOpen = false;
                        hamburgerMenu.classList.remove('open');
                        cardNav.classList.remove('open');
                    }, 100);
                });
            });

            // 點擊外部關閉選單
            document.addEventListener('click', function(e) {
                if (isOpen && !cardNav.contains(e.target)) {
                    isOpen = false;
                    hamburgerMenu.classList.remove('open');
                    cardNav.classList.remove('open');
                }
            });

            return; // 使用新結構，不需要執行舊代碼
        }

        // 舊結構的邏輯（保留兼容性）
        if (!menuWrap || !menuItems.length) {
            console.warn('CardNav: Required elements not found.');
            return;
        }

        let isExpanded = false;
        let isHamburgerOpen = false;
        let tl = null;
        let scrollPosition = 0; // 保存滾動位置
        let shouldRestoreScroll = true; // 標記是否應該恢復滾動位置

        // 計算導覽列高度
        function calculateHeight() {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            const itemCount = menuItems.length;
            const topBar = isMobile ? 60 : 90;
            
            if (isMobile) {
                // 手機版：讓高度由內容決定，基於文字大小計算
                // 獲取第一個選單項目的文字樣式來計算單個項目高度
                const firstLink = menuItems[0]?.querySelector('.menu__item-link');
                if (firstLink) {
                    const computedStyle = window.getComputedStyle(firstLink);
                    const fontSize = parseFloat(computedStyle.fontSize) || 20; // 預設 20px
                    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.2;
                    
                    // 每個項目的高度 = 文字行高（沒有額外的 padding）
                    const itemHeight = lineHeight;
                    
                    // 計算總高度：頂部欄 + 所有項目高度
                    const totalHeight = topBar + (itemHeight * itemCount);
                    const maxAllowedHeight = window.innerHeight * 0.9; // 最大不超過視窗的90%
                    
                    // 如果總高度超過最大允許高度，則使用最大高度（允許滾動）
                    return Math.min(totalHeight, maxAllowedHeight);
                }
                
                // 如果無法獲取樣式，使用最小高度
                return topBar + (itemCount * 25); // 每個項目至少 25px
            }
            
            // 桌機版：根據項目數量計算，確保所有項目都能顯示
            // 使用實際可視區域高度，確保不會被切掉
            const viewportHeight = window.innerHeight;
            const availableHeight = viewportHeight - topBar - 60; // 留更多邊距，確保不被切
            const itemHeight = Math.floor(availableHeight / itemCount);
            
            // 確保每個項目有一定高度，但更緊密（再縮短一半）
            const minItemHeight = 60;
            const maxItemHeight = 80;
            const finalItemHeight = Math.max(minItemHeight, Math.min(itemHeight, maxItemHeight));
            
            // 計算總高度，減少間距讓項目更緊密
            const totalHeight = topBar + (finalItemHeight * itemCount) - 20; // 再減少20px讓項目更緊密
            const maxAllowedHeight = viewportHeight * 0.95; // 最大不超過視窗的95%
            
            return Math.min(totalHeight, maxAllowedHeight);
        }

        // 創建 GSAP 時間軸
        function createTimeline() {
            // 重置狀態
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            const initialHeight = isMobile ? 60 : 90;
            gsap.set(cardNav, { height: initialHeight, overflow: 'hidden' });

            // 創建時間軸
            const timeline = gsap.timeline({ paused: true });

            // 展開高度動畫
            timeline.to(cardNav, {
                height: calculateHeight,
                duration: 0.4,
                ease: 'power3.out'
            });

            return timeline;
        }

        // 初始化時間軸
        tl = createTimeline();

        // 初始化 FlowingMenu
        function initFlowingMenu() {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            
            menuItems.forEach(item => {
                const link = item.querySelector('.menu__item-link');
                const marquee = item.querySelector('.marquee');
                const marqueeInner = item.querySelector('.marquee__inner');
                const marqueeInnerWrap = item.querySelector('.marquee__inner-wrap');
                
                if (!link || !marquee || !marqueeInner || !marqueeInnerWrap) return;

                const text = link.getAttribute('data-menu-text') || link.textContent;

                // 生成 marquee 內容 - 生成足夠的文字組以實現無縫循環
                function generateMarqueeContent() {
                    if (!text || text.trim() === '') {
                        console.warn('CardNav: Menu item text is empty');
                        return;
                    }
                    
                    // 為了無縫循環，生成足夠的文字組（20組）以實現無限循環
                    // CSS動畫從0%移動到-50%，需要至少2組相同的內容
                    // 生成20組確保即使長時間懸停也能無限循環
                    const repeatedTexts = Array.from({ length: 20 }).map(() => text.trim());
                    
                    // 將文字組合成HTML
                    marqueeInner.innerHTML = repeatedTexts.map(t => 
                        `<span>${t}</span>`
                    ).join('');
                    
                    // 確保內容已經生成
                    if (marqueeInner.children.length === 0) {
                        console.warn('CardNav: Failed to generate marquee content');
                    }
                }

                generateMarqueeContent();
                
                // 確保內容生成後，動畫可以正常運行
                // 使用 requestAnimationFrame 確保 DOM 更新完成
                requestAnimationFrame(() => {
                    if (marqueeInner.children.length > 0) {
                        // 內容已生成，可以運行動畫
                        marqueeInner.style.animation = 'marquee 15s linear infinite';
                        marqueeInner.style.animationPlayState = 'running';
                    }
                });

                // 手機版：添加簡單的觸控反饋效果
                if (isMobile) {
                    // 手機版保持 marquee 隱藏，但添加觸控反饋
                    gsap.set(marquee, { visibility: 'hidden', opacity: 0 });
                    
                    // 手機版：添加觸控反饋（不影響點擊）
                    let isTouching = false;
                    
                    link.addEventListener('touchstart', function(e) {
                        isTouching = true;
                        // 觸控開始時立即添加視覺反饋（咖啡金色半透明背景）
                        item.classList.add('touching'); // 添加 class 以便 CSS 也能控制
                        item.style.backgroundColor = 'rgba(166, 124, 82, 0.2)';
                        item.style.transition = 'background-color 0.1s ease';
                        link.style.transform = 'scale(0.95)';
                        link.style.transition = 'transform 0.1s ease, color 0.1s ease';
                        // 確保文字始終可見（手機版不隱藏文字）
                        link.style.opacity = '1';
                        link.style.visibility = 'visible';
                        link.style.color = '#d4b56a'; // 變亮金色
                    }, { passive: true });
                    
                    link.addEventListener('touchend', function(e) {
                        // 稍微延遲恢復，讓用戶看到反饋
                        setTimeout(() => {
                            isTouching = false;
                            item.classList.remove('touching');
                            // 確保樣式正確恢復，但文字始終可見
                            item.style.backgroundColor = '';
                            item.style.transition = '';
                            link.style.transform = '';
                            link.style.transition = '';
                            link.style.opacity = '1'; // 確保文字可見
                            link.style.color = '';
                            link.style.visibility = 'visible'; // 確保文字可見
                            link.style.textShadow = '';
                            // 強制瀏覽器應用樣式變更
                            void link.offsetWidth;
                        }, 150);
                    }, { passive: true });
                    
                    link.addEventListener('touchcancel', function(e) {
                        isTouching = false;
                        item.classList.remove('touching');
                        // 觸控取消時立即恢復，但文字始終可見
                        item.style.backgroundColor = '';
                        item.style.transition = '';
                        link.style.transform = '';
                        link.style.transition = '';
                        link.style.opacity = '1'; // 確保文字可見
                        link.style.color = '';
                        link.style.visibility = 'visible'; // 確保文字可見
                        link.style.textShadow = '';
                        // 強制瀏覽器應用樣式變更
                        void link.offsetWidth;
                    }, { passive: true });
                    
                    // 手機版：也支持滑鼠懸停（適用於平板等設備）
                    item.addEventListener('mouseenter', function(e) {
                        if (!isTouching) {
                            // 使用 !important 確保手機版樣式優先級最高
                            item.style.backgroundColor = 'rgba(166, 124, 82, 0.2)';
                            item.style.transition = 'background-color 0.15s ease';
                            link.style.transform = 'scale(0.97)';
                            link.style.transition = 'transform 0.15s ease, color 0.15s ease';
                            // 確保文字始終可見（手機版不隱藏文字），使用 setProperty 設置 !important
                            link.style.setProperty('opacity', '1', 'important');
                            link.style.setProperty('visibility', 'visible', 'important');
                            link.style.setProperty('color', '#d4b56a', 'important'); // 變亮金色
                        }
                    }, { passive: true });
                    
                    item.addEventListener('mouseleave', function(e) {
                        if (!isTouching) {
                            item.style.backgroundColor = '';
                            item.style.transition = '';
                            link.style.transform = '';
                            link.style.transition = '';
                            // 使用 setProperty 設置 !important 確保文字可見
                            link.style.setProperty('opacity', '1', 'important');
                            link.style.setProperty('color', '', 'important');
                            link.style.setProperty('visibility', 'visible', 'important');
                            link.style.setProperty('text-shadow', '', 'important');
                            // 強制瀏覽器應用樣式變更
                            void link.offsetWidth;
                        }
                    }, { passive: true });
                    
                    // 手機版：點擊時的反饋
                    link.addEventListener('click', function() {
                        // 點擊時的視覺反饋
                        item.style.backgroundColor = 'rgba(166, 124, 82, 0.2)';
                        link.style.transform = 'scale(0.95)';
                        link.style.color = '#d4b56a'; // 變亮金色
                        // 確保文字始終可見
                        link.style.opacity = '1';
                        link.style.visibility = 'visible';
                        
                        // 快速恢復
                        setTimeout(() => {
                            item.style.backgroundColor = '';
                            link.style.transform = '';
                            link.style.color = '';
                            link.style.opacity = '1'; // 確保文字可見
                            link.style.visibility = 'visible'; // 確保文字可見
                            link.style.textShadow = '';
                            // 強制瀏覽器應用樣式變更
                            void link.offsetWidth;
                        }, 200);
                    });
                    
                    return; // 手機版不綁定桌機版的 marquee 互動
                }

                // 桌機版：啟用 marquee 互動
                // 找到最近的邊緣
                const findClosestEdge = (mouseX, mouseY, width, height) => {
                    const distMetric = (x, y, x2, y2) => {
                        const xDiff = x - x2;
                        const yDiff = y - y2;
                        return xDiff * xDiff + yDiff * yDiff;
                    };
                    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
                    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
                    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
                };

                // 初始化 marquee 位置（預設隱藏）
                gsap.set(marquee, { y: '101%', opacity: 0, visibility: 'hidden' });
                gsap.set(marqueeInnerWrap, { y: '-101%', visibility: 'hidden' });
                
                // 確保動畫始終運行（但不重置動畫進度）
                function ensureAnimationRunning() {
                    // 檢查動畫是否正在運行
                    const computedStyle = window.getComputedStyle(marqueeInner);
                    const animationPlayState = computedStyle.animationPlayState;
                    
                    // 如果動畫沒有運行，啟動它
                    if (animationPlayState !== 'running') {
                        marqueeInner.style.animationPlayState = 'running';
                    }
                    
                    // 確保動畫屬性正確
                    if (!marqueeInner.style.animation || marqueeInner.style.animation === 'none') {
                        marqueeInner.style.animation = 'marquee 15s linear infinite';
                        marqueeInner.style.animationPlayState = 'running';
                    }
                }
                
                // 初始化時確保動畫準備就緒（但保持暫停狀態，直到 hover）
                marqueeInner.style.animation = 'marquee 15s linear infinite';
                marqueeInner.style.animationPlayState = 'paused'; // 預設暫停
                marqueeInner.style.willChange = 'transform';

                const animationDefaults = { duration: 0.6, ease: 'expo.out' };
                // 滑鼠離開時的動畫設置（更快，讓文字立即出現）
                const leaveAnimationDefaults = { duration: 0.3, ease: 'power2.in' };

                // 滑鼠進入（僅桌機版）
                item.addEventListener('mouseenter', (ev) => {
                    // 再次確認不是手機版，防止手機版觸發桌機版邏輯
                    const currentIsMobile = window.matchMedia('(max-width: 768px)').matches;
                    if (currentIsMobile) {
                        return; // 手機版直接返回，不執行桌機版邏輯
                    }
                    
                    const rect = item.getBoundingClientRect();
                    const x = ev.clientX - rect.left;
                    const y = ev.clientY - rect.top;
                    const edge = findClosestEdge(x, y, rect.width, rect.height);

                    // 添加過渡效果（僅在進入時）
                    link.style.setProperty('transition', 'color 0.2s ease, opacity 0.2s ease, visibility 0s', 'important');
                    
                    // 立即隱藏原始文字（在動畫開始前）
                    link.style.setProperty('color', 'transparent', 'important');
                    link.style.setProperty('opacity', '0', 'important');
                    link.style.setProperty('visibility', 'hidden', 'important');
                    link.style.setProperty('text-shadow', 'none', 'important');
                    
                    // 立即顯示 marquee（在動畫開始前）
                    marquee.style.setProperty('visibility', 'visible', 'important');
                    marquee.style.setProperty('opacity', '0', 'important');
                    marqueeInnerWrap.style.setProperty('visibility', 'visible', 'important');
                    
                    // 啟動 marquee 動畫
                    marqueeInner.style.setProperty('animation-play-state', 'running', 'important');
                    // 確保動畫屬性存在
                    if (!marqueeInner.style.animation || marqueeInner.style.animation.includes('none')) {
                        marqueeInner.style.animation = 'marquee 15s linear infinite';
                    }
                    
                    // 強制瀏覽器應用 visibility 變更
                    void marquee.offsetWidth;
                    
                    gsap
                        .timeline({ defaults: animationDefaults })
                        .set(marquee, { 
                            y: edge === 'top' ? '-101%' : '101%',
                            opacity: 0
                        }, 0)
                        .set(marqueeInnerWrap, { 
                            y: edge === 'top' ? '101%' : '-101%'
                        }, 0)
                        .to([marquee, marqueeInnerWrap], { 
                            y: '0%',
                            opacity: 1,
                            onStart: () => {
                                // 在 GSAP 動畫開始時，確保 CSS 動畫正在運行
                                marqueeInner.style.setProperty('animation-play-state', 'running', 'important');
                                marquee.style.setProperty('visibility', 'visible', 'important');
                                marqueeInnerWrap.style.setProperty('visibility', 'visible', 'important');
                                // 確保原始文字完全隱藏
                                link.style.setProperty('color', 'transparent', 'important');
                                link.style.setProperty('opacity', '0', 'important');
                                link.style.setProperty('visibility', 'hidden', 'important');
                            },
                            onUpdate: () => {
                                // 在動畫過程中持續檢查動畫狀態
                                marqueeInner.style.setProperty('animation-play-state', 'running', 'important');
                                marquee.style.setProperty('visibility', 'visible', 'important');
                                // 確保原始文字始終完全隱藏
                                link.style.setProperty('color', 'transparent', 'important');
                                link.style.setProperty('opacity', '0', 'important');
                                link.style.setProperty('visibility', 'hidden', 'important');
                            },
                            onComplete: () => {
                                // 動畫完成後，確保動畫持續運行
                                marqueeInner.style.setProperty('animation-play-state', 'running', 'important');
                                marquee.style.setProperty('visibility', 'visible', 'important');
                                marquee.style.setProperty('opacity', '1', 'important');
                                // 確保原始文字完全隱藏
                                link.style.setProperty('color', 'transparent', 'important');
                                link.style.setProperty('opacity', '0', 'important');
                                link.style.setProperty('visibility', 'hidden', 'important');
                            }
                        }, 0);
                });

                // 滑鼠離開（僅桌機版）
                item.addEventListener('mouseleave', (ev) => {
                    // 再次確認不是手機版，防止手機版觸發桌機版邏輯
                    const currentIsMobile = window.matchMedia('(max-width: 768px)').matches;
                    if (currentIsMobile) {
                        return; // 手機版直接返回，不執行桌機版邏輯
                    }
                    
                    const rect = item.getBoundingClientRect();
                    const x = ev.clientX - rect.left;
                    const y = ev.clientY - rect.top;
                    const edge = findClosestEdge(x, y, rect.width, rect.height);

                    // 立即停止 marquee 動畫
                    marqueeInner.style.setProperty('animation-play-state', 'paused', 'important');
                    
                    // 立即隱藏 marquee（同步執行，無延遲）
                    gsap.killTweensOf([marquee, marqueeInnerWrap]); // 停止所有 GSAP 動畫
                    marquee.style.setProperty('opacity', '0', 'important');
                    marquee.style.setProperty('visibility', 'hidden', 'important');
                    marqueeInnerWrap.style.setProperty('visibility', 'hidden', 'important');
                    
                    // 重置 marquee 位置
                    gsap.set(marquee, { y: edge === 'top' ? '-101%' : '101%', opacity: 0, visibility: 'hidden' });
                    gsap.set(marqueeInnerWrap, { y: edge === 'top' ? '101%' : '-101%', visibility: 'hidden' });
                    
                    // 立即恢復原始文字顏色和可見性（同步執行，無延遲）
                    // 先移除所有可能造成問題的樣式屬性
                    link.style.removeProperty('transition');
                    link.style.removeProperty('color');
                    link.style.removeProperty('opacity');
                    link.style.removeProperty('visibility');
                    link.style.removeProperty('text-shadow');
                    link.style.removeProperty('z-index');
                    link.style.removeProperty('-webkit-text-stroke');
                    link.style.removeProperty('-webkit-background-clip');
                    link.style.removeProperty('background-clip');
                    
                    // 然後設置正確的樣式（不使用 important，讓 CSS 自然優先級生效）
                    link.style.color = 'var(--bronze)';
                    link.style.opacity = '1';
                    link.style.visibility = 'visible';
                    link.style.zIndex = '3';
                    
                    // 強制瀏覽器立即應用樣式變更
                    void link.offsetWidth;
                });
            });
        }

        // 初始化 FlowingMenu
        initFlowingMenu();
        
        // 確保所有 menu item 的動畫都能正常運行
        function ensureAllAnimationsRunning() {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            if (isMobile) return; // 手機版不需要
            
            menuItems.forEach(item => {
                const marqueeInner = item.querySelector('.marquee__inner');
                if (marqueeInner) {
                    // 確保動畫正在運行
                    const computedStyle = window.getComputedStyle(marqueeInner);
                    if (computedStyle.animationPlayState !== 'running') {
                        marqueeInner.style.animationPlayState = 'running';
                    }
                    // 確保動畫屬性存在
                    if (!marqueeInner.style.animation || marqueeInner.style.animation.includes('none')) {
                        marqueeInner.style.animation = 'marquee 15s linear infinite';
                    }
                }
            });
        }

        // 切換選單
        function toggleMenu() {
            if (!tl) return;
            const isMobile = window.matchMedia('(max-width: 768px)').matches;

            if (!isExpanded) {
                // 開啟選單
                isHamburgerOpen = true;
                isExpanded = true;
                hamburgerMenu.classList.add('open');
                hamburgerMenu.setAttribute('aria-label', '關閉選單');
                cardNav.classList.add('open');
                menuWrap.setAttribute('aria-hidden', 'false');
                
                // 手機版：防止背景滾動
                if (isMobile) {
                    // 保存當前滾動位置
                    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                    // 固定 body 位置
                    document.body.style.position = 'fixed';
                    document.body.style.top = `-${scrollPosition}px`;
                    document.body.style.left = '0';
                    document.body.style.right = '0';
                    document.body.style.overflow = 'hidden';
                } else {
                    // 桌機版：確保所有動畫都能正常運行
                    // 使用 requestAnimationFrame 確保 DOM 更新完成
                    requestAnimationFrame(() => {
                        ensureAllAnimationsRunning();
                    });
                }
                
                // 播放動畫
                tl.play(0);
            } else {
                // 關閉選單
                isHamburgerOpen = false;
                hamburgerMenu.classList.remove('open');
                hamburgerMenu.setAttribute('aria-label', '開啟選單');
                menuWrap.setAttribute('aria-hidden', 'true');
                
                // 手機版：恢復背景滾動
                if (isMobile) {
                    // 恢復 body 樣式
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.left = '';
                    document.body.style.right = '';
                    document.body.style.overflow = '';
                    // 恢復滾動位置（只有在應該恢復時才恢復）
                    if (shouldRestoreScroll && scrollPosition > 0) {
                        window.scrollTo(0, scrollPosition);
                    }
                    scrollPosition = 0;
                    shouldRestoreScroll = true; // 重置標記
                }
                
                // 反向播放動畫
                tl.eventCallback('onReverseComplete', function() {
                    isExpanded = false;
                    cardNav.classList.remove('open');
                });
                tl.reverse();
            }
        }

        // 點擊漢堡選單
        hamburgerMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            toggleMenu();
        });

        // 手機版：使用 touchstart 事件（更可靠）
        if (window.matchMedia('(max-width: 768px)').matches) {
            hamburgerMenu.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            });
        }

        // 鍵盤支援（Enter 和 Space）
        hamburgerMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // 點擊選單連結時關閉選單（手機版）並處理平滑滾動
        const menuLinks = menuWrap.querySelectorAll('.menu__item-link');
        menuLinks.forEach(link => {
            // 阻止事件冒泡，避免觸發外部點擊關閉
            link.addEventListener('click', function(e) {
                e.stopPropagation();
                const href = link.getAttribute('href');
                const isMobile = window.matchMedia('(max-width: 768px)').matches;
                
                // 如果是錨點連結（以 # 開頭），處理平滑滾動
                if (href && href.startsWith('#') && href !== '#' && href !== '#top') {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        
                        // 手機版：保存目標位置，關閉選單後再滾動
                        if (isMobile && isExpanded) {
                            // 保存目標元素
                            const targetElement = target;
                            const cardNavHeight = 70;
                            
                            // 如果背景滾動被鎖定，使用保存的滾動位置；否則使用當前滾動位置
                            const currentScroll = scrollPosition > 0 ? scrollPosition : (window.pageYOffset || document.documentElement.scrollTop);
                            
                            // 計算目標元素的絕對位置
                            const targetRect = targetElement.getBoundingClientRect();
                            const targetPosition = targetRect.top + currentScroll - cardNavHeight - 20;
                            
                            // 設置標記，告訴 toggleMenu 不要恢復到之前的滾動位置
                            shouldRestoreScroll = false;
                            
                            // 關閉選單
                            toggleMenu();
                            
                            // 等待選單關閉動畫完成後滾動到目標位置
                            setTimeout(() => {
                                window.scrollTo({
                                    top: Math.max(0, targetPosition),
                                    behavior: 'smooth'
                                });
                            }, 400); // 延遲以確保選單關閉動畫完成並恢復背景滾動
                        } else {
                            // 桌機版：直接滾動
                            // 使用更可靠的方法計算目標位置
                            const cardNavHeight = cardNav.offsetHeight || 90;
                            const targetRect = target.getBoundingClientRect();
                            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                            const targetPosition = targetRect.top + currentScroll - cardNavHeight - 20;
                            
                            // 確保滾動到正確位置
                            window.scrollTo({
                                top: Math.max(0, targetPosition),
                                behavior: 'smooth'
                            });
                            
                            // 備用方案：如果 scrollTo 不工作，使用 scrollIntoView
                            setTimeout(() => {
                                const currentPos = window.pageYOffset || document.documentElement.scrollTop;
                                const expectedPos = Math.max(0, targetPosition);
                                // 如果滾動沒有發生（誤差在 10px 內），使用 scrollIntoView
                                if (Math.abs(currentPos - expectedPos) > 10) {
                                    target.scrollIntoView({ 
                                        behavior: 'smooth', 
                                        block: 'start' 
                                    });
                                    // 手動調整位置以考慮導覽列高度
                                    setTimeout(() => {
                                        window.scrollBy(0, -cardNavHeight - 20);
                                    }, 100);
                                }
                            }, 100);
                        }
                    }
                } else if (isMobile && isExpanded) {
                    // 非錨點連結，手機版直接關閉選單
                    toggleMenu();
                }
            });
            
            // 手機版：使用 touchstart 事件（更可靠）
            if (window.matchMedia('(max-width: 768px)').matches) {
                link.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                }, { passive: true });
            }
        });

        // 視窗大小改變時重新計算
        let resizeTimer;
        let lastIsMobile = window.matchMedia('(max-width: 768px)').matches;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                const currentIsMobile = window.matchMedia('(max-width: 768px)').matches;
                
                // 如果從桌機切換到手機（或相反），重新初始化 FlowingMenu
                if (lastIsMobile !== currentIsMobile) {
                    lastIsMobile = currentIsMobile;
                    initFlowingMenu();
                }
                
                // 如果選單是開啟狀態，更新高度和背景滾動
                if (isExpanded) {
                    const isMobile = window.matchMedia('(max-width: 768px)').matches;
                    
                    // 更新背景滾動狀態
                    if (isMobile) {
                        // 手機版：防止背景滾動
                        if (document.body.style.position !== 'fixed') {
                            scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                            document.body.style.position = 'fixed';
                            document.body.style.top = `-${scrollPosition}px`;
                            document.body.style.left = '0';
                            document.body.style.right = '0';
                        }
                        document.body.style.overflow = 'hidden';
                    } else {
                        // 桌機版：恢復背景滾動
                        if (document.body.style.position === 'fixed') {
                            document.body.style.position = '';
                            document.body.style.top = '';
                            document.body.style.left = '';
                            document.body.style.right = '';
                            if (scrollPosition > 0) {
                                window.scrollTo(0, scrollPosition);
                                scrollPosition = 0;
                            }
                        }
                        document.body.style.overflow = '';
                    }
                    
                    // 更新高度
                    const newHeight = calculateHeight();
                    gsap.set(cardNav, { height: newHeight });

                    // 重新創建時間軸
                    if (tl) {
                        tl.kill();
                    }
                    tl = createTimeline();
                    if (tl) {
                        tl.progress(1); // 設置為完成狀態
                    }
                } else {
                    // 如果選單是關閉狀態，確保背景滾動正常
                    if (document.body.style.position === 'fixed') {
                        document.body.style.position = '';
                        document.body.style.top = '';
                        document.body.style.left = '';
                        document.body.style.right = '';
                        document.body.style.overflow = '';
                    }
                    
                    // 重新創建時間軸
                    if (tl) {
                        tl.kill();
                    }
                    tl = createTimeline();
                }
            }, 250);
        });

        // 點擊外部區域關閉選單（手機版）
        function handleOutsideClick(e) {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            if (!isMobile || !isExpanded) return;
            
            // 檢查點擊是否在選單內部
            const clickedInsideNav = cardNav.contains(e.target);
            const clickedOnHamburger = hamburgerMenu.contains(e.target);
            
            // 如果點擊在選單外部且不在漢堡選單上，則關閉選單
            if (!clickedInsideNav && !clickedOnHamburger) {
                toggleMenu();
            }
        }
        
        // 使用 capture phase 確保能夠正確檢測點擊
        document.addEventListener('click', handleOutsideClick, true);
        
        // 手機版：使用 touchstart 事件（更可靠）
        if (window.matchMedia('(max-width: 768px)').matches) {
            document.addEventListener('touchstart', function(e) {
                handleOutsideClick(e);
            }, { passive: true, capture: true });
        }
    }

    // DOM 載入完成後執行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // 確保 GSAP 已載入
            if (typeof gsap !== 'undefined') {
                setTimeout(initCardNav, 100);
            } else {
                // 如果 GSAP 還沒載入，等待一下再試
                let retries = 0;
                const checkGSAP = setInterval(function() {
                    retries++;
                    if (typeof gsap !== 'undefined' || retries > 50) {
                        clearInterval(checkGSAP);
                        if (typeof gsap !== 'undefined') {
                            setTimeout(initCardNav, 100);
                        }
                    }
                }, 100);
            }
        });
    } else {
        // DOM 已經載入完成
        if (typeof gsap !== 'undefined') {
            setTimeout(initCardNav, 100);
        } else {
            // 等待 GSAP 載入
            let retries = 0;
            const checkGSAP = setInterval(function() {
                retries++;
                if (typeof gsap !== 'undefined' || retries > 50) {
                    clearInterval(checkGSAP);
                    if (typeof gsap !== 'undefined') {
                        setTimeout(initCardNav, 100);
                    }
                }
            }, 100);
        }
    }

})();

