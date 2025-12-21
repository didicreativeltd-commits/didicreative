// CircularGallery - Pure JavaScript implementation
// Based on React CircularGallery component using OGL

(function() {
  'use strict';

  // Add missing OGL classes if not present
  if (window.OGL && !window.OGL.Plane) {
    // Plane geometry helper
    const Geometry = window.OGL.Geometry || window.Geometry;
    window.OGL.Plane = class Plane extends Geometry {
      constructor(gl, { width = 1, height = 1, widthSegments = 1, heightSegments = 1 } = {}) {
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const positions = [];
        const uvs = [];
        const indices = [];

        for (let i = 0; i <= hSegs; i++) {
          const y = (i / hSegs - 0.5) * height;
          for (let j = 0; j <= wSegs; j++) {
            const x = (j / wSegs - 0.5) * width;
            positions.push(x, y, 0);
            uvs.push(j / wSegs, 1 - i / hSegs);
          }
        }

        for (let i = 0; i < hSegs; i++) {
          for (let j = 0; j < wSegs; j++) {
            const a = i * (wSegs + 1) + j;
            const b = a + wSegs + 1;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
          }
        }

        super(gl, {
          position: { size: 3, data: new Float32Array(positions) },
          uv: { size: 2, data: new Float32Array(uvs) },
          index: { size: 1, data: new Uint16Array(indices) }
        });
      }
    };
  }

  if (window.OGL && !window.OGL.Camera) {
    // Camera class
    window.OGL.Camera = class Camera {
      constructor(gl) {
        this.gl = gl;
        this.fov = 45;
        this.near = 0.1;
        this.far = 100;
        this.aspect = 1;
        this.position = { x: 0, y: 0, z: 5 };
        this.projectionMatrix = new Float32Array(16);
        this.viewMatrix = new Float32Array(16);
        this.projectionMatrixInverse = new Float32Array(16);
      }

      perspective({ aspect, near = this.near, far = this.far, fov = this.fov } = {}) {
        this.aspect = aspect || this.aspect;
        this.near = near;
        this.far = far;
        this.fov = fov;
        const f = 1.0 / Math.tan((fov * Math.PI / 180) * 0.5);
        const nf = 1 / (near - far);
        this.projectionMatrix[0] = f / this.aspect;
        this.projectionMatrix[5] = f;
        this.projectionMatrix[10] = (far + near) * nf;
        this.projectionMatrix[11] = -1;
        this.projectionMatrix[14] = (2 * far * near) * nf;
        this.projectionMatrix[15] = 0;
      }
    };
  }

  if (window.OGL && !window.OGL.Texture) {
    // Texture class
    window.OGL.Texture = class Texture {
      constructor(gl, { generateMipmaps = true } = {}) {
        this.gl = gl;
        this.texture = gl.createTexture();
        this.generateMipmaps = generateMipmaps;
        this.image = null;
      }

      set image(img) {
        if (!img) return;
        this._image = img;
        const gl = this.gl;
        
        // Check if image is a canvas or valid image
        if (img instanceof HTMLCanvasElement || img instanceof ImageData) {
          try {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            if (this.generateMipmaps && (img.width > 0 && img.height > 0)) {
              gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            return;
          } catch (error) {
            console.warn('Texture: Failed to load canvas/imageData', error);
          }
        }
        
        // For HTMLImageElement, check if it's loaded
        if (img instanceof HTMLImageElement) {
          if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
            console.warn('Texture: Image not ready', img.src);
            return;
          }
          
          try {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            if (this.generateMipmaps) {
              gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          } catch (error) {
            console.warn('Texture: Failed to load image (CORS or other error)', img.src, error);
            // Create placeholder
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#999';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Image', 128, 128);
            try {
              gl.bindTexture(gl.TEXTURE_2D, this.texture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            } catch (e) {
              console.error('Texture: Failed to set placeholder', e);
            }
          }
        }
      }

      get image() {
        return this._image;
      }
    };
  }

  // Helper functions
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function lerp(p1, p2, t) {
    return p1 + (p2 - p1) * t;
  }

  function autoBind(instance) {
    const proto = Object.getPrototypeOf(instance);
    Object.getOwnPropertyNames(proto).forEach(key => {
      if (key !== 'constructor' && typeof instance[key] === 'function') {
        instance[key] = instance[key].bind(instance);
      }
    });
  }

  function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(parseInt(font, 10) * 1.2);
    canvas.width = textWidth + 20;
    canvas.height = textHeight + 20;
    context.font = font;
    context.fillStyle = color;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const Texture = window.OGL?.Texture;
    const texture = new Texture(gl, { generateMipmaps: false });
    texture.image = canvas;
    return { texture, width: canvas.width, height: canvas.height };
  }

  class Title {
    constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }) {
      autoBind(this);
      this.gl = gl;
      this.plane = plane;
      this.renderer = renderer;
      this.text = text;
      this.textColor = textColor;
      this.font = font;
      this.createMesh();
    }

    createMesh() {
      const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
      const Plane = window.OGL?.Plane;
      const Program = window.OGL?.Program || window.Program;
      const Mesh = window.OGL?.Mesh || window.Mesh;
      const geometry = new Plane(this.gl);
      const program = new Program(this.gl, {
        vertex: `
          attribute vec3 position;
          attribute vec2 uv;
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragment: `
          precision highp float;
          uniform sampler2D tMap;
          varying vec2 vUv;
          void main() {
            vec4 color = texture2D(tMap, vUv);
            if (color.a < 0.1) discard;
            gl_FragColor = color;
          }
        `,
        uniforms: { tMap: { value: texture } },
        transparent: true
      });
      this.mesh = new Mesh(this.gl, { geometry, program });
      const aspect = width / height;
      const textHeight = this.plane.scale.y * 0.15;
      const textWidth = textHeight * aspect;
      this.mesh.scale.set(textWidth, textHeight, 1);
      this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
      // Set parent manually
      this.mesh.parent = this.plane;
      if (this.plane.children) {
        this.plane.children.push(this.mesh);
      }
    }
  }

  class Media {
    constructor({
      geometry, gl, image, index, length, renderer, scene, screen, text, viewport,
      bend, textColor, borderRadius = 0, font
    }) {
      this.extra = 0;
      this.geometry = geometry;
      this.gl = gl;
      this.image = image;
      this.index = index;
      this.length = length;
      this.renderer = renderer;
      this.scene = scene;
      this.screen = screen;
      this.text = text;
      this.viewport = viewport;
      this.bend = bend;
      this.textColor = textColor;
      this.borderRadius = borderRadius;
      this.font = font;
      this.createShader();
      this.createMesh();
      this.createTitle();
      this.onResize();
    }

    createShader() {
      const Texture = window.OGL?.Texture;
      const Program = window.OGL?.Program || window.Program;
      const texture = new Texture(this.gl, { generateMipmaps: true });
      this.program = new Program(this.gl, {
        depthTest: false,
        depthWrite: false,
        vertex: `
          precision highp float;
          attribute vec3 position;
          attribute vec2 uv;
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          uniform float uTime;
          uniform float uSpeed;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragment: `
          precision highp float;
          uniform vec2 uImageSizes;
          uniform vec2 uPlaneSizes;
          uniform sampler2D tMap;
          uniform float uBorderRadius;
          varying vec2 vUv;
          float roundedBoxSDF(vec2 p, vec2 b, float r) {
            vec2 d = abs(p) - b;
            return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
          }
          void main() {
            vec2 ratio = vec2(
              min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
              min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
            );
            vec2 uv = vec2(
              vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
              vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
            );
            vec4 color = texture2D(tMap, uv);
            float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
            float edgeSmooth = 0.002;
            float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
            gl_FragColor = vec4(color.rgb, alpha);
          }
        `,
        uniforms: {
          tMap: { value: texture },
          uPlaneSizes: { value: [0, 0] },
          uImageSizes: { value: [0, 0] },
          uSpeed: { value: 0 },
          uTime: { value: 100 * Math.random() },
          uBorderRadius: { value: this.borderRadius }
        },
        transparent: true
      });
      const img = new Image();
      // Don't set crossOrigin for local files
      img.src = this.image;
      img.onload = () => {
        // Check if image loaded successfully
        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
          try {
            texture.image = img;
            this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
          } catch (error) {
            console.warn('Failed to set texture image:', this.image, error);
          }
        }
      };
      img.onerror = (e) => {
        console.warn('Failed to load image:', this.image, e);
        // Create a placeholder texture
        const gl = this.gl;
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, 1, 1);
        try {
          texture.image = canvas;
          this.program.uniforms.uImageSizes.value = [1, 1];
        } catch (error) {
          console.warn('Failed to set placeholder texture:', error);
        }
      };
    }

    createMesh() {
      const Mesh = window.OGL?.Mesh || window.Mesh;
      this.plane = new Mesh(this.gl, {
        geometry: this.geometry,
        program: this.program
      });
      // Set parent manually (OGL doesn't have setParent method)
      this.plane.parent = this.scene;
      if (this.scene.children) {
        this.scene.children.push(this.plane);
      }
    }

    createTitle() {
      this.title = new Title({
        gl: this.gl,
        plane: this.plane,
        renderer: this.renderer,
        text: this.text,
        textColor: this.textColor,
        font: this.font
      });
    }

    update(scroll, direction) {
      this.plane.position.x = this.x - scroll.current - this.extra;
      const x = this.plane.position.x;
      const H = this.viewport.width / 2;
      if (this.bend === 0) {
        this.plane.position.y = 0;
        this.plane.rotation.z = 0;
      } else {
        const B_abs = Math.abs(this.bend);
        const R = (H * H + B_abs * B_abs) / (2 * B_abs);
        const effectiveX = Math.min(Math.abs(x), H);
        const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
        if (this.bend > 0) {
          this.plane.position.y = -arc;
          this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
        } else {
          this.plane.position.y = arc;
          this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
        }
      }
      this.speed = scroll.current - scroll.last;
      this.program.uniforms.uTime.value += 0.04;
      this.program.uniforms.uSpeed.value = this.speed;
      const planeOffset = this.plane.scale.x / 2;
      const viewportOffset = this.viewport.width / 2;
      this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
      this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
      if (direction === 'right' && this.isBefore) {
        this.extra -= this.widthTotal;
        this.isBefore = this.isAfter = false;
      }
      if (direction === 'left' && this.isAfter) {
        this.extra += this.widthTotal;
        this.isBefore = this.isAfter = false;
      }
    }

    onResize({ screen, viewport } = {}) {
      if (screen) this.screen = screen;
      if (viewport) {
        this.viewport = viewport;
        if (this.plane.program.uniforms.uViewportSizes) {
          this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
        }
      }
      this.scale = this.screen.height / 1500;
      this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
      this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
      this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
      this.padding = 2;
      this.width = this.plane.scale.x + this.padding;
      this.widthTotal = this.width * this.length;
      this.x = this.width * this.index;
    }
  }

  class CircularGalleryApp {
    constructor(container, options = {}) {
      document.documentElement.classList.remove('no-js');
      this.container = container;
      this.scrollSpeed = options.scrollSpeed || 2;
      this.scroll = { ease: options.scrollEase || 0.05, current: 0, target: 0, last: 0 };
      this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
      this.createRenderer();
      this.createCamera();
      this.createScene();
      this.onResize();
      this.createGeometry();
      this.createMedias(options.items, options.bend, options.textColor, options.borderRadius, options.font);
      this.update();
      this.addEventListeners();
    }

    createRenderer() {
      const Renderer = window.OGL?.Renderer || window.Renderer;
      if (!Renderer) {
        console.error('CircularGallery: Renderer not found. Make sure OGL is loaded.');
        return;
      }
      this.renderer = new Renderer({
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2)
      });
      this.gl = this.renderer.gl;
      if (!this.gl) {
        console.error('CircularGallery: WebGL context not available');
        return;
      }
      this.gl.clearColor(0, 0, 0, 0);
      this.container.appendChild(this.gl.canvas);
    }

    createCamera() {
      const Camera = window.OGL?.Camera;
      this.camera = new Camera(this.gl);
      this.camera.fov = 45;
      this.camera.position.z = 20;
    }

    createScene() {
      const Transform = window.OGL?.Transform || window.Transform;
      this.scene = new Transform();
      // Ensure children array exists
      if (!this.scene.children) {
        this.scene.children = [];
      }
    }

    createGeometry() {
      const Plane = window.OGL?.Plane;
      this.planeGeometry = new Plane(this.gl, {
        heightSegments: 50,
        widthSegments: 100
      });
    }

    createMedias(items, bend = 1, textColor, borderRadius, font) {
      this.mediasImages = items && items.length ? items.concat(items) : [];
      this.medias = this.mediasImages.map((data, index) => {
        return new Media({
          geometry: this.planeGeometry,
          gl: this.gl,
          image: data.image,
          index,
          length: this.mediasImages.length,
          renderer: this.renderer,
          scene: this.scene,
          screen: this.screen,
          text: data.text,
          viewport: this.viewport,
          bend,
          textColor,
          borderRadius,
          font
        });
      });
    }

    onTouchDown(e) {
      this.isDown = true;
      this.scroll.position = this.scroll.current;
      this.start = e.touches ? e.touches[0].clientX : e.clientX;
    }

    onTouchMove(e) {
      if (!this.isDown) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const distance = (this.start - x) * (this.scrollSpeed * 0.025);
      this.scroll.target = this.scroll.position + distance;
    }

    onTouchUp() {
      this.isDown = false;
      this.onCheck();
    }

    onWheel(e) {
      const delta = e.deltaY || e.wheelDelta || e.detail;
      this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
      this.onCheckDebounce();
    }

    onCheck() {
      if (!this.medias || !this.medias[0]) return;
      const width = this.medias[0].width;
      const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
      const item = width * itemIndex;
      this.scroll.target = this.scroll.target < 0 ? -item : item;
    }

    onResize() {
      this.screen = {
        width: this.container.clientWidth,
        height: this.container.clientHeight
      };
      this.renderer.setSize(this.screen.width, this.screen.height);
      this.camera.perspective({
        aspect: this.screen.width / this.screen.height
      });
      const fov = (this.camera.fov * Math.PI) / 180;
      const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
      const width = height * this.camera.aspect;
      this.viewport = { width, height };
      if (this.medias) {
        this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
      }
    }

    update() {
      this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
      const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
      if (this.medias) {
        this.medias.forEach(media => media.update(this.scroll, direction));
      }
      
      // Update scene matrices
      if (this.scene && this.scene.updateMatrixWorld) {
        this.scene.updateMatrixWorld();
      }
      
      // Clear and render
      const gl = this.gl;
      if (this.renderer.autoClear !== false) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
      
      // Render all meshes in scene
      if (this.medias) {
        this.medias.forEach(media => {
          if (media.plane && media.plane.visible !== false) {
            // Update plane's world matrix
            if (media.plane.updateMatrixWorld) {
              media.plane.updateMatrixWorld();
            }
            
            // Calculate modelViewMatrix
            const Mat4 = window.OGL?.Mat4 || window.Mat4;
            if (Mat4 && media.plane.program && media.plane.program.uniforms) {
              // Calculate modelViewMatrix from worldMatrix
              if (!media.plane.modelViewMatrix) {
                media.plane.modelViewMatrix = new Mat4();
              }
              media.plane.modelViewMatrix.copy(media.plane.worldMatrix);
              
              // Set uniforms before drawing
              if (media.plane.program.uniforms.projectionMatrix) {
                media.plane.program.uniforms.projectionMatrix.value = this.camera.projectionMatrix;
              }
              if (media.plane.program.uniforms.modelViewMatrix) {
                media.plane.program.uniforms.modelViewMatrix.value = media.plane.modelViewMatrix.elements || media.plane.modelViewMatrix;
              }
            }
            
            // Draw mesh
            media.plane.draw({ camera: this.camera });
          }
        });
      }
      
      this.scroll.last = this.scroll.current;
      this.raf = window.requestAnimationFrame(this.update.bind(this));
    }

    addEventListeners() {
      this.boundOnResize = this.onResize.bind(this);
      this.boundOnWheel = this.onWheel.bind(this);
      this.boundOnTouchDown = this.onTouchDown.bind(this);
      this.boundOnTouchMove = this.onTouchMove.bind(this);
      this.boundOnTouchUp = this.onTouchUp.bind(this);
      window.addEventListener('resize', this.boundOnResize);
      window.addEventListener('mousewheel', this.boundOnWheel);
      window.addEventListener('wheel', this.boundOnWheel);
      this.container.addEventListener('mousedown', this.boundOnTouchDown);
      this.container.addEventListener('mousemove', this.boundOnTouchMove);
      this.container.addEventListener('mouseup', this.boundOnTouchUp);
      this.container.addEventListener('touchstart', this.boundOnTouchDown);
      this.container.addEventListener('touchmove', this.boundOnTouchMove);
      this.container.addEventListener('touchend', this.boundOnTouchUp);
    }

    destroy() {
      window.cancelAnimationFrame(this.raf);
      window.removeEventListener('resize', this.boundOnResize);
      window.removeEventListener('mousewheel', this.boundOnWheel);
      window.removeEventListener('wheel', this.boundOnWheel);
      this.container.removeEventListener('mousedown', this.boundOnTouchDown);
      this.container.removeEventListener('mousemove', this.boundOnTouchMove);
      this.container.removeEventListener('mouseup', this.boundOnTouchUp);
      this.container.removeEventListener('touchstart', this.boundOnTouchDown);
      this.container.removeEventListener('touchmove', this.boundOnTouchMove);
      this.container.removeEventListener('touchend', this.boundOnTouchUp);
      if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
        this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
      }
    }
  }

  // Initialize when DOM and OGL are ready
  function initCircularGallery() {
    const galleryContainer = document.getElementById('circular-gallery');
    if (!galleryContainer) {
      setTimeout(initCircularGallery, 100);
      return;
    }
    
    // Wait for OGL to be loaded
    if (!window.OGL && !window.Renderer) {
      setTimeout(initCircularGallery, 100);
      return;
    }

    // Collect all case images
    const items = [
      { image: 'assets/images/kol-001-o.png', text: 'KOL | KOC 口碑體驗' },
      { image: 'assets/images/kol-002-o.png', text: 'KOL | KOC 口碑體驗' },
      { image: 'assets/images/kol-003-o.png', text: 'KOL | KOC 口碑體驗' },
      { image: 'assets/images/kol-004-o.png', text: 'KOL | KOC 口碑體驗' },
      { image: 'assets/images/film-001-o.png', text: '廣告短片' },
      { image: 'assets/images/film-002-o.png', text: '廣告短片' },
      { image: 'assets/images/film-003-o.png', text: '廣告短片' },
      { image: 'assets/images/film-004-o.png', text: '廣告短片' },
      { image: 'assets/images/film-005-o.png', text: '廣告短片' },
      { image: 'assets/images/film-006-o.png', text: '廣告短片' },
      { image: 'assets/images/design-001-o.png', text: '社群圖文設計' },
      { image: 'assets/images/design-002-o.png', text: '社群圖文設計' },
      { image: 'assets/images/design-003-o.png', text: '社群圖文設計' },
      { image: 'assets/images/short-001-o.png', text: '短影音推廣' },
      { image: 'assets/images/short-002-o.png', text: '短影音推廣' },
      { image: 'assets/images/short-003-o.png', text: '短影音推廣' },
      { image: 'assets/images/short-004-o.png', text: '短影音推廣' },
      { image: 'assets/images/short-005-o.png', text: '短影音推廣' },
      { image: 'assets/images/gmap-001-o.png', text: 'Google Map 精準導流' },
      { image: 'assets/images/gmap-002-o.png', text: 'Google Map 精準導流' },
      { image: 'assets/images/gmap-003-o.png', text: 'Google Map 精準導流' },
      { image: 'assets/images/gmap-004-o.png', text: 'Google Map 精準導流' },
      { image: 'assets/images/plus-001-o.png', text: '加值服務' },
      { image: 'assets/images/plus-002-o.png', text: '加值服務' },
      { image: 'assets/images/plus-003-o.png', text: '加值服務' },
      { image: 'assets/images/plus-004-o.png', text: '加值服務' },
      { image: 'assets/images/plus-005-o.png', text: '加值服務' }
    ];

    try {
      console.log('Initializing CircularGallery with', items.length, 'items');
      window.circularGallery = new CircularGalleryApp(galleryContainer, {
        items: items,
        bend: 3,
        textColor: '#ffffff',
        borderRadius: 0.05,
        font: 'bold 30px A',
        scrollSpeed: 2,
        scrollEase: 0.02
      });
      console.log('CircularGallery initialized successfully');
    } catch (error) {
      console.error('CircularGallery initialization error:', error);
      console.error(error.stack);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCircularGallery);
  } else {
    // Wait a bit for OGL to load
    setTimeout(initCircularGallery, 100);
  }

  // Export for global use
  window.CircularGalleryApp = CircularGalleryApp;
})();

