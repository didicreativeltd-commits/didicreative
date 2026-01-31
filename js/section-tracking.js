/* =========================
   區塊停留時間追蹤
   使用 Google Analytics 追蹤用戶在每個區塊的停留時間
========================= */
(function() {
    'use strict';

    // 檢查 Google Analytics 是否已載入
    if (typeof gtag === 'undefined') {
        console.warn('Section Tracking: Google Analytics (gtag) not found.');
        return;
    }

    // 定義要追蹤的區塊
    const sectionsToTrack = [
        { id: 'top', name: '首頁 Hero' },
        { id: 'goals', name: '核心目標' },
        { id: 'brand-strategy', name: '品牌營銷策略' },
        { id: 'case-kol', name: 'KOL KOC 口碑體驗' },
        { id: 'case-film', name: '廣告短片' },
        { id: 'case-design', name: '社群圖文設計' },
        { id: 'case-short', name: '短影音推廣' },
        { id: 'case-gmap', name: 'Google Map 精準導流' },
        { id: 'case-plus', name: '加值服務' },
        { id: 'team', name: '核心成員' },
        { id: 'plans', name: '推廣方案' },
        { id: 'contact', name: '聯絡我們' }
    ];

    // 儲存每個區塊的進入時間
    const sectionTimers = {};
    
    // 儲存每個區塊的累計停留時間（本次會話）
    const sectionTotalTime = {};

    // Intersection Observer 選項
    const observerOptions = {
        root: null, // 使用 viewport 作為根
        rootMargin: '-20% 0px -20% 0px', // 當區塊進入視窗中間 60% 區域時觸發
        threshold: [0, 0.25, 0.5, 0.75, 1.0] // 多個閾值，更精確追蹤
    };

    // 追蹤區塊進入視窗
    function handleSectionEnter(sectionId, sectionName) {
        const now = Date.now();
        
        // 如果已經在追蹤，先記錄離開時間
        if (sectionTimers[sectionId]) {
            handleSectionLeave(sectionId, sectionName);
        }

        // 開始追蹤
        sectionTimers[sectionId] = {
            enterTime: now,
            sectionName: sectionName
        };

        // 發送進入事件到 Google Analytics
        gtag('event', 'section_view', {
            'section_id': sectionId,
            'section_name': sectionName,
            'event_category': 'Section Tracking',
            'event_label': sectionName
        });

        console.log(`[Section Tracking] 進入區塊: ${sectionName} (${sectionId})`);
    }

    // 追蹤區塊離開視窗
    function handleSectionLeave(sectionId, sectionName) {
        if (!sectionTimers[sectionId]) {
            return;
        }

        const enterTime = sectionTimers[sectionId].enterTime;
        const leaveTime = Date.now();
        const duration = Math.round((leaveTime - enterTime) / 1000); // 轉換為秒

        // 累計停留時間
        if (!sectionTotalTime[sectionId]) {
            sectionTotalTime[sectionId] = 0;
        }
        sectionTotalTime[sectionId] += duration;

        // 發送停留時間事件到 Google Analytics
        gtag('event', 'section_time', {
            'section_id': sectionId,
            'section_name': sectionName,
            'time_spent': duration,
            'total_time': sectionTotalTime[sectionId],
            'event_category': 'Section Tracking',
            'event_label': sectionName,
            'value': duration
        });

        console.log(`[Section Tracking] 離開區塊: ${sectionName} (${sectionId}), 停留時間: ${duration} 秒`);

        // 清除計時器
        delete sectionTimers[sectionId];
    }

    // Intersection Observer 回調函數
    function createObserverCallback(sectionId, sectionName) {
        let isVisible = false;
        let lastVisibleTime = null;

        return function(entries) {
            entries.forEach(entry => {
                const visibilityRatio = entry.intersectionRatio;
                
                // 當區塊可見度超過 50% 時，視為進入
                if (visibilityRatio >= 0.5 && !isVisible) {
                    isVisible = true;
                    lastVisibleTime = Date.now();
                    handleSectionEnter(sectionId, sectionName);
                }
                // 當區塊可見度低於 25% 時，視為離開
                else if (visibilityRatio < 0.25 && isVisible) {
                    isVisible = false;
                    if (lastVisibleTime) {
                        handleSectionLeave(sectionId, sectionName);
                    }
                }
            });
        };
    }

    // 初始化追蹤
    function initSectionTracking() {
        // 為每個區塊創建 Intersection Observer
        sectionsToTrack.forEach(section => {
            const element = document.getElementById(section.id);
            
            if (!element) {
                console.warn(`[Section Tracking] 找不到區塊: ${section.id}`);
                return;
            }

            // 創建專屬的 observer
            const observer = new IntersectionObserver(
                createObserverCallback(section.id, section.name),
                observerOptions
            );

            // 開始觀察
            observer.observe(element);
        });

        // 頁面離開時，記錄所有正在追蹤的區塊
        window.addEventListener('beforeunload', function() {
            sectionsToTrack.forEach(section => {
                if (sectionTimers[section.id]) {
                    handleSectionLeave(section.id, section.name);
                }
            });
        });

        // 頁面隱藏時（切換標籤頁），也記錄時間
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                sectionsToTrack.forEach(section => {
                    if (sectionTimers[section.id]) {
                        handleSectionLeave(section.id, section.name);
                    }
                });
            }
        });

        console.log('[Section Tracking] 初始化完成，開始追蹤', sectionsToTrack.length, '個區塊');
    }

    // DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // 等待一下確保所有元素都已渲染
            setTimeout(initSectionTracking, 500);
        });
    } else {
        setTimeout(initSectionTracking, 500);
    }

})();
