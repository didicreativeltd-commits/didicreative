/* =========================
   Balatro 背景效果（WebGL）
   轉換自 React 組件為純 JavaScript
========================= */

(function() {
    'use strict';

    // 工具函數：將十六進位顏色轉換為 vec4
    function hexToVec4(hex) {
        let hexStr = hex.replace('#', '');
        let r = 0, g = 0, b = 0, a = 1;
        
        if (hexStr.length === 6) {
            r = parseInt(hexStr.slice(0, 2), 16) / 255;
            g = parseInt(hexStr.slice(2, 4), 16) / 255;
            b = parseInt(hexStr.slice(4, 6), 16) / 255;
        } else if (hexStr.length === 8) {
            r = parseInt(hexStr.slice(0, 2), 16) / 255;
            g = parseInt(hexStr.slice(2, 4), 16) / 255;
            b = parseInt(hexStr.slice(4, 6), 16) / 255;
            a = parseInt(hexStr.slice(6, 8), 16) / 255;
        }
        
        return [r, g, b, a];
    }

    // Shader 程式碼
    const vertexShader = `
        attribute vec2 uv;
        attribute vec2 position;
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 0, 1);
        }
    `;

    const fragmentShader = `
        precision highp float;
        #define PI 3.14159265359
        
        uniform float iTime;
        uniform vec3 iResolution;
        uniform float uSpinRotation;
        uniform float uSpinSpeed;
        uniform vec2 uOffset;
        uniform vec4 uColor1;
        uniform vec4 uColor2;
        uniform vec4 uColor3;
        uniform float uContrast;
        uniform float uLighting;
        uniform float uSpinAmount;
        uniform float uPixelFilter;
        uniform float uSpinEase;
        uniform bool uIsRotate;
        uniform vec2 uMouse;
        
        varying vec2 vUv;
        
        vec4 effect(vec2 screenSize, vec2 screen_coords) {
            float pixel_size = length(screenSize.xy) / uPixelFilter;
            vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
            float uv_len = length(uv);
            
            float speed = (uSpinRotation * uSpinEase * 0.2);
            if(uIsRotate){
                speed = iTime * speed;
            }
            speed += 302.2;
            
            float mouseInfluence = (uMouse.x * 2.0 - 1.0);
            speed += mouseInfluence * 0.1;
            
            float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
            vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
            uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);
            
            uv *= 30.0;
            float baseSpeed = iTime * uSpinSpeed;
            speed = baseSpeed + mouseInfluence * 2.0;
            
            vec2 uv2 = vec2(uv.x + uv.y);
            
            for(int i = 0; i < 5; i++) {
                uv2 += sin(max(uv.x, uv.y)) + uv;
                uv += 0.5 * vec2(
                    cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
                    sin(uv2.x - 0.113 * speed)
                );
                uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
            }
            
            float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
            float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
            float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
            float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
            float c3p = 1.0 - min(1.0, c1p + c2p);
            float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);
            
            return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
        }
        
        void main() {
            vec2 uv = vUv * iResolution.xy;
            gl_FragColor = effect(iResolution.xy, uv);
        }
    `;

    // 簡化的 OGL 實作（因為需要引入 OGL 庫）
    // 這裡我們將使用 Three.js 或原生 WebGL 來實作
    // 或者可以從 CDN 引入 OGL

    // Balatro 背景類別
    class BalatroBackground {
        constructor(options = {}) {
            this.options = {
                spinRotation: options.spinRotation || -2.0,
                spinSpeed: options.spinSpeed || 7.0,
                offset: options.offset || [0.0, 0.0],
                color1: options.color1 || '#f7e7a7',  // 使用網站的 gold1
                color2: options.color2 || '#d4b56a',  // 使用網站的 gold2
                color3: options.color3 || '#a67c52',  // 使用網站的 bronze
                contrast: options.contrast || 3.5,
                lighting: options.lighting || 0.4,
                spinAmount: options.spinAmount || 0.25,
                pixelFilter: options.pixelFilter || 700,
                spinEase: options.spinEase || 1.0,
                isRotate: options.isRotate !== undefined ? options.isRotate : false,
                mouseInteraction: options.mouseInteraction !== undefined ? options.mouseInteraction : true
            };

            this.container = null;
            this.gl = null;
            this.program = null;
            this.mesh = null;
            this.renderer = null;
            this.animationFrameId = null;
            this.time = 0;
        }

        init(containerElement) {
            if (!containerElement) {
                console.error('BalatroBackground: Container element is required');
                return;
            }

            this.container = containerElement;

            // 使用注入的類別或全域類別
            const RendererClass = this.Renderer || window.OGL?.Renderer || window.Renderer;
            const ProgramClass = this.Program || window.OGL?.Program || window.Program;
            const MeshClass = this.Mesh || window.OGL?.Mesh || window.Mesh;
            const TriangleClass = this.Triangle || window.OGL?.Triangle || window.Triangle;

            if (!RendererClass || !ProgramClass || !MeshClass || !TriangleClass) {
                console.error('BalatroBackground: OGL library classes not found. Please ensure OGL is loaded.');
                return;
            }

            try {
                // 確保容器有正確的尺寸
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;

                // 創建 WebGL 渲染器（啟用透明背景、抗鋸齒、高像素比）
                const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2); // 限制最高為 2 以平衡性能
                this.renderer = new RendererClass({
                    alpha: true,
                    width: containerWidth,
                    height: containerHeight,
                    dpr: devicePixelRatio,
                    antialias: true  // 啟用抗鋸齒，讓渲染更平滑
                });
                this.gl = this.renderer.gl;
                this.gl.clearColor(0, 0, 0, 0); // 透明背景
                
                // 確保 canvas 填滿容器（強制覆蓋）
                const canvas = this.gl.canvas;
                Object.assign(canvas.style, {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100vw',
                    height: '100vh',
                    display: 'block',
                    margin: '0',
                    padding: '0',
                    zIndex: '0',
                    opacity: '1'
                });
                console.log('BalatroBackground: Canvas created and styled', canvas);

                // 創建程式
                this.program = new ProgramClass(this.gl, {
                    vertex: vertexShader,
                    fragment: fragmentShader,
                    uniforms: {
                        iTime: { value: 0 },
                        iResolution: {
                            value: [
                                this.gl.canvas.width,
                                this.gl.canvas.height,
                                this.gl.canvas.width / this.gl.canvas.height
                            ]
                        },
                        uSpinRotation: { value: this.options.spinRotation },
                        uSpinSpeed: { value: this.options.spinSpeed },
                        uOffset: { value: this.options.offset },
                        uColor1: { value: hexToVec4(this.options.color1) },
                        uColor2: { value: hexToVec4(this.options.color2) },
                        uColor3: { value: hexToVec4(this.options.color3) },
                        uContrast: { value: this.options.contrast },
                        uLighting: { value: this.options.lighting },
                        uSpinAmount: { value: this.options.spinAmount },
                        uPixelFilter: { value: this.options.pixelFilter },
                        uSpinEase: { value: this.options.spinEase },
                        uIsRotate: { value: this.options.isRotate },
                        uMouse: { value: [0.5, 0.5] }
                    }
                });

                // 創建幾何體和網格
                const geometry = new TriangleClass(this.gl);
                this.mesh = new MeshClass(this.gl, { geometry, program: this.program });

                // 將 canvas 添加到容器（先添加才能設定大小）
                this.container.appendChild(this.gl.canvas);

                // 調整大小（添加後再設定）
                this.resize();
                
                // 監聽視窗大小改變
                const resizeHandler = () => {
                    this.resize();
                };
                window.addEventListener('resize', resizeHandler);
                this.resizeHandler = resizeHandler; // 儲存以便後續清理

                // 開始渲染循環
                this.animate();

                // 滑鼠互動
                if (this.options.mouseInteraction) {
                    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
                }

                // 開始動畫
                this.animate();
            } catch (error) {
                console.error('BalatroBackground initialization error:', error);
            }
        }

        resize() {
            if (!this.renderer || !this.container) return;

            // 使用視窗大小而不是容器大小（因為容器是 fixed）
            const width = window.innerWidth;
            const height = window.innerHeight;

            // 設定 renderer 大小（內部會設定 canvas 的實際尺寸）
            this.renderer.setSize(width, height);

            // 強制更新 canvas 樣式以確保填滿（覆蓋 Renderer 的固定像素設定）
            if (this.gl && this.gl.canvas) {
                const canvas = this.gl.canvas;
                // 使用 setTimeout 確保 Renderer.setSize 執行後再覆蓋
                setTimeout(() => {
                    Object.assign(canvas.style, {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        display: 'block',
                        margin: '0',
                        padding: '0'
                    });
                }, 0);
            }

            // 設定 viewport
            if (this.gl) {
                this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
            }

            // 更新 resolution uniform
            if (this.program && this.program.uniforms && this.program.uniforms.iResolution) {
                const gl = this.gl;
                this.program.uniforms.iResolution.value = [
                    gl.drawingBufferWidth || gl.canvas.width,
                    gl.drawingBufferHeight || gl.canvas.height,
                    (gl.drawingBufferWidth || gl.canvas.width) / (gl.drawingBufferHeight || gl.canvas.height)
                ];
            }
        }

        handleMouseMove(e) {
            if (!this.program || !this.container) return;

            const rect = this.container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;

            this.program.uniforms.uMouse.value = [x, y];
        }

        animate() {
            this.animationFrameId = requestAnimationFrame(() => this.animate());

            if (this.program && this.renderer && this.mesh) {
                this.time = performance.now() * 0.001;
                
                // 更新時間 uniform
                if (this.program.uniforms && this.program.uniforms.iTime) {
                    this.program.uniforms.iTime.value = this.time;
                }

                // 設定 viewport 為整個畫布
                const gl = this.gl;
                gl.viewport(0, 0, gl.drawingBufferWidth || gl.canvas.width, gl.drawingBufferHeight || gl.canvas.height);

                // 清除畫布（透明）
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // 使用 program 並設置 uniforms
                if (this.program.use) {
                    this.program.use();
                }

                // 渲染 mesh
                if (this.mesh && this.mesh.draw) {
                    this.mesh.draw({ camera: null });
                }
            }
        }

        destroy() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }

            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
            }

            if (this.container && this.gl && this.gl.canvas) {
                this.container.removeEventListener('mousemove', (e) => this.handleMouseMove(e));
                if (this.container.contains(this.gl.canvas)) {
                    this.container.removeChild(this.gl.canvas);
                }
                const ext = this.gl.getExtension('WEBGL_lose_context');
                if (ext) {
                    ext.loseContext();
                }
            }
        }
    }

    // 等待 DOM 和 OGL 載入完成後初始化
    function initBalatroBackground() {
        // 檢查 OGL 是否已載入
        if (typeof window.OGL === 'undefined' && typeof window.Renderer === 'undefined') {
            // 如果還沒載入，等待一下再試（最多等待 5 秒）
            let attempts = 0;
            const maxAttempts = 50; // 5 秒
            const checkInterval = setInterval(() => {
                attempts++;
                if (typeof window.OGL !== 'undefined' || typeof window.Renderer !== 'undefined' || attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    if (attempts < maxAttempts) {
                        initBalatroBackground();
                    } else {
                        console.warn('BalatroBackground: OGL library failed to load');
                    }
                }
            }, 100);
            return;
        }

        const container = document.querySelector('.balatro-container');
        if (!container) {
            console.warn('BalatroBackground: .balatro-container not found');
            return;
        }

        // 嘗試獲取 OGL（可能是 window.OGL 或全域變數）
        const OGL = window.OGL || window;
        const RendererClass = OGL.Renderer || window.Renderer;
        const ProgramClass = OGL.Program || window.Program;
        const MeshClass = OGL.Mesh || window.Mesh;
        const TriangleClass = OGL.Triangle || window.Triangle;

        if (!RendererClass) {
            console.error('BalatroBackground: Renderer class not found. OGL:', window.OGL, 'Renderer:', window.Renderer);
            return;
        }

        console.log('BalatroBackground: Initializing with OGL classes found');

        // 使用白底金色配色方案
        const balatro = new BalatroBackground({
            isRotate: false,
            mouseInteraction: true,
            pixelFilter: 1500,  // 增加 pixelFilter 讓效果更平滑（原本 700）
            color1: '#ffffff',  // 白色基礎
            color2: '#f7e7a7',  // 淡金色
            color3: '#d4b56a',   // 金色點綴
            contrast: 2.5,       // 降低對比度，讓效果更柔和
            lighting: 0.3        // 降低亮度
        });

        // 注入 OGL 類別
        balatro.Renderer = RendererClass;
        balatro.Program = ProgramClass;
        balatro.Mesh = MeshClass;
        balatro.Triangle = TriangleClass;

        balatro.init(container);

        // 儲存實例以便後續清理
        window.balatroInstance = balatro;
        
        console.log('BalatroBackground: Initialization complete');
    }

    // DOM 載入完成後執行
    function startInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initBalatroBackground, 100);
            });
        } else {
            setTimeout(initBalatroBackground, 100);
        }
    }

    startInit();

})();

