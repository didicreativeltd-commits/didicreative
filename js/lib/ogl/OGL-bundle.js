/* =========================
   OGL Library Bundle
   將所有依賴打包成一個可直接在瀏覽器使用的版本
   來源：https://github.com/oframe/ogl
========================= */

(function(window) {
    'use strict';

    // =========================
    // Vec3 - 3D 向量類別
    // =========================
    class Vec3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        set(x, y, z) {
            if (z === undefined) z = this.z;
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }

        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }

        applyMatrix4(m) {
            const x = this.x, y = this.y, z = this.z;
            const e = m.elements || m;
            
            const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
            this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
            this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
            this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
            
            return this;
        }

        getTranslation(m) {
            const e = m.elements || m;
            this.x = e[12];
            this.y = e[13];
            this.z = e[14];
            return this;
        }
    }

    // =========================
    // Mat3 - 3x3 矩陣類別
    // =========================
    class Mat3 {
        constructor(elements) {
            if (elements) {
                this.elements = [...elements];
            } else {
                this.elements = [
                    1, 0, 0,
                    0, 1, 0,
                    0, 0, 1
                ];
            }
        }

        getNormalMatrix(matrix4) {
            const e = matrix4.elements || matrix4;
            const me = this.elements;

            const m00 = e[0], m01 = e[1], m02 = e[2];
            const m10 = e[4], m11 = e[5], m12 = e[6];
            const m20 = e[8], m21 = e[9], m22 = e[10];

            const det = m00 * (m11 * m22 - m12 * m21) -
                       m01 * (m10 * m22 - m12 * m20) +
                       m02 * (m10 * m21 - m11 * m20);

            if (det === 0) {
                me[0] = 1; me[1] = 0; me[2] = 0;
                me[3] = 0; me[4] = 1; me[5] = 0;
                me[6] = 0; me[7] = 0; me[8] = 1;
                return this;
            }

            const invDet = 1 / det;

            me[0] = (m11 * m22 - m12 * m21) * invDet;
            me[1] = (m02 * m21 - m01 * m22) * invDet;
            me[2] = (m01 * m12 - m02 * m11) * invDet;
            me[3] = (m12 * m20 - m10 * m22) * invDet;
            me[4] = (m00 * m22 - m02 * m20) * invDet;
            me[5] = (m02 * m10 - m00 * m12) * invDet;
            me[6] = (m10 * m21 - m11 * m20) * invDet;
            me[7] = (m01 * m20 - m00 * m21) * invDet;
            me[8] = (m00 * m11 - m01 * m10) * invDet;

            return this;
        }
    }

    // =========================
    // Mat4 - 4x4 矩陣類別
    // =========================
    class Mat4 {
        constructor(elements) {
            if (elements) {
                this.elements = [...elements];
            } else {
                this.elements = [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ];
            }
        }

        multiply(a, b) {
            const ae = a.elements || a;
            const be = b.elements || b;
            const te = this.elements;

            const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
            const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
            const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
            const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

            const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
            const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
            const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
            const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

            te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
            te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
            te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
            te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

            te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
            te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
            te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
            te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

            te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
            te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
            te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
            te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

            te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
            te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
            te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
            te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

            return this;
        }

        copy(m) {
            const me = m.elements || m;
            const te = this.elements;
            te[0] = me[0]; te[1] = me[1]; te[2] = me[2]; te[3] = me[3];
            te[4] = me[4]; te[5] = me[5]; te[6] = me[6]; te[7] = me[7];
            te[8] = me[8]; te[9] = me[9]; te[10] = me[10]; te[11] = me[11];
            te[12] = me[12]; te[13] = me[13]; te[14] = me[14]; te[15] = me[15];
            return this;
        }

        determinant() {
            const te = this.elements;
            const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
            const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
            const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
            const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

            return (
                n41 * (
                    + n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33
                    + n13 * n22 * n34 - n12 * n23 * n34
                ) +
                n42 * (
                    + n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34
                    + n13 * n24 * n31 - n14 * n23 * n31
                ) +
                n43 * (
                    + n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34
                    + n14 * n22 * n31 - n12 * n24 * n31
                ) +
                n44 * (
                    - n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32
                    - n12 * n21 * n33 + n12 * n23 * n31
                )
            );
        }
    }

    // =========================
    // Transform - 變換基類
    // =========================
    class Transform {
        constructor() {
            this.position = new Vec3();
            this.rotation = new Vec3();
            this.scale = new Vec3(1, 1, 1);
            this.matrix = new Mat4();
            this.worldMatrix = new Mat4();
            this.matrixAutoUpdate = true;
            this.visible = true;
            this.children = [];
            this.parent = null;
        }

        updateMatrixWorld() {
            if (this.matrixAutoUpdate) this.updateMatrix();
            if (!this.parent) {
                this.worldMatrix.copy(this.matrix);
            } else {
                this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
            }
            
            this.children.forEach(child => {
                if (child.updateMatrixWorld) child.updateMatrixWorld();
            });
        }

        updateMatrix() {
            // 簡化版本 - 如果需要完整功能可以擴展
            this.matrix.elements[12] = this.position.x;
            this.matrix.elements[13] = this.position.y;
            this.matrix.elements[14] = this.position.z;
            // 旋轉和縮放可以在這裡添加，但對於 Balatro 背景不需要
        }

        traverse(callback) {
            callback(this);
            this.children.forEach(child => {
                if (child.traverse) child.traverse(callback);
            });
        }
    }

    // =========================
    // Renderer - WebGL 渲染器
    // =========================
    const tempVec3 = new Vec3();
    let rendererID = 1;

    class Renderer {
        constructor({
            canvas = document.createElement('canvas'),
            width = 300,
            height = 150,
            dpr = 1,
            alpha = false,
            depth = true,
            stencil = false,
            antialias = false,
            premultipliedAlpha = false,
            preserveDrawingBuffer = false,
            powerPreference = 'default',
            autoClear = true,
            webgl = 2,
        } = {}) {
            const attributes = { alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference };
            this.dpr = dpr;
            this.alpha = alpha;
            this.color = true;
            this.depth = depth;
            this.stencil = stencil;
            this.premultipliedAlpha = premultipliedAlpha;
            this.autoClear = autoClear;
            this.id = rendererID++;

            // Attempt WebGL2 unless forced to 1, if not supported fallback to WebGL1
            if (webgl === 2) this.gl = canvas.getContext('webgl2', attributes);
            this.isWebgl2 = !!this.gl;
            if (!this.gl) this.gl = canvas.getContext('webgl', attributes);
            if (!this.gl) console.error('unable to create webgl context');

            // Attach renderer to gl so that all classes have access to internal state functions
            this.gl.renderer = this;

            // initialise size values
            this.setSize(width, height);

            // gl state stores to avoid redundant calls on methods used internally
            this.state = {};
            this.state.blendFunc = { src: this.gl.ONE, dst: this.gl.ZERO };
            this.state.blendEquation = { modeRGB: this.gl.FUNC_ADD };
            this.state.cullFace = false;
            this.state.frontFace = this.gl.CCW;
            this.state.depthMask = true;
            this.state.depthFunc = this.gl.LEQUAL;
            this.state.premultiplyAlpha = false;
            this.state.flipY = false;
            this.state.unpackAlignment = 4;
            this.state.framebuffer = null;
            this.state.viewport = { x: 0, y: 0, width: null, height: null };
            this.state.textureUnits = [];
            this.state.activeTextureUnit = 0;
            this.state.boundBuffer = null;
            this.state.uniformLocations = new Map();
            this.state.currentProgram = null;

            // store requested extensions
            this.extensions = {};

            // Initialise extra format types
            if (this.isWebgl2) {
                this.getExtension('EXT_color_buffer_float');
                this.getExtension('OES_texture_float_linear');
            } else {
                this.getExtension('OES_texture_float');
                this.getExtension('OES_texture_float_linear');
                this.getExtension('OES_texture_half_float');
                this.getExtension('OES_texture_half_float_linear');
                this.getExtension('OES_element_index_uint');
                this.getExtension('OES_standard_derivatives');
                this.getExtension('EXT_sRGB');
                this.getExtension('WEBGL_depth_texture');
                this.getExtension('WEBGL_draw_buffers');
            }
            this.getExtension('WEBGL_compressed_texture_astc');
            this.getExtension('EXT_texture_compression_bptc');
            this.getExtension('WEBGL_compressed_texture_s3tc');
            this.getExtension('WEBGL_compressed_texture_etc1');
            this.getExtension('WEBGL_compressed_texture_pvrtc');
            this.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');

            // Create method aliases using extension (WebGL1) or native if available (WebGL2)
            this.vertexAttribDivisor = this.getExtension('ANGLE_instanced_arrays', 'vertexAttribDivisor', 'vertexAttribDivisorANGLE');
            this.drawArraysInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawArraysInstanced', 'drawArraysInstancedANGLE');
            this.drawElementsInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawElementsInstanced', 'drawElementsInstancedANGLE');
            this.createVertexArray = this.getExtension('OES_vertex_array_object', 'createVertexArray', 'createVertexArrayOES');
            this.bindVertexArray = this.getExtension('OES_vertex_array_object', 'bindVertexArray', 'bindVertexArrayOES');
            this.deleteVertexArray = this.getExtension('OES_vertex_array_object', 'deleteVertexArray', 'deleteVertexArrayOES');
            this.drawBuffers = this.getExtension('WEBGL_draw_buffers', 'drawBuffers', 'drawBuffersWEBGL');

            // Store device parameters
            this.parameters = {};
            this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
            this.parameters.maxAnisotropy = this.getExtension('EXT_texture_filter_anisotropic')
                ? this.gl.getParameter(this.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT)
                : 0;
        }

        setSize(width, height) {
            this.width = width;
            this.height = height;
            this.gl.canvas.width = width * this.dpr;
            this.gl.canvas.height = height * this.dpr;
            if (!this.gl.canvas.style) return;
            Object.assign(this.gl.canvas.style, {
                width: width + 'px',
                height: height + 'px',
            });
        }

        setViewport(width, height, x = 0, y = 0) {
            if (this.state.viewport.width === width && this.state.viewport.height === height) return;
            this.state.viewport.width = width;
            this.state.viewport.height = height;
            this.state.viewport.x = x;
            this.state.viewport.y = y;
            this.gl.viewport(x, y, width, height);
        }

        enable(id) {
            if (this.state[id] === true) return;
            this.gl.enable(id);
            this.state[id] = true;
        }

        disable(id) {
            if (this.state[id] === false) return;
            this.gl.disable(id);
            this.state[id] = false;
        }

        setBlendFunc(src, dst, srcAlpha, dstAlpha) {
            if (
                this.state.blendFunc.src === src &&
                this.state.blendFunc.dst === dst &&
                this.state.blendFunc.srcAlpha === srcAlpha &&
                this.state.blendFunc.dstAlpha === dstAlpha
            )
                return;
            this.state.blendFunc.src = src;
            this.state.blendFunc.dst = dst;
            this.state.blendFunc.srcAlpha = srcAlpha;
            this.state.blendFunc.dstAlpha = dstAlpha;
            if (srcAlpha !== undefined) this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
            else this.gl.blendFunc(src, dst);
        }

        setBlendEquation(modeRGB, modeAlpha) {
            modeRGB = modeRGB || this.gl.FUNC_ADD;
            if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha) return;
            this.state.blendEquation.modeRGB = modeRGB;
            this.state.blendEquation.modeAlpha = modeAlpha;
            if (modeAlpha !== undefined) this.gl.blendEquationSeparate(modeRGB, modeAlpha);
            else this.gl.blendEquation(modeRGB);
        }

        setCullFace(value) {
            if (this.state.cullFace === value) return;
            this.state.cullFace = value;
            this.gl.cullFace(value);
        }

        setFrontFace(value) {
            if (this.state.frontFace === value) return;
            this.state.frontFace = value;
            this.gl.frontFace(value);
        }

        setDepthMask(value) {
            if (this.state.depthMask === value) return;
            this.state.depthMask = value;
            this.gl.depthMask(value);
        }

        setDepthFunc(value) {
            if (this.state.depthFunc === value) return;
            this.state.depthFunc = value;
            this.gl.depthFunc(value);
        }

        getExtension(extension, webgl2Func, extFunc) {
            if (webgl2Func && this.gl[webgl2Func]) return this.gl[webgl2Func].bind(this.gl);
            if (!this.extensions[extension]) {
                this.extensions[extension] = this.gl.getExtension(extension);
            }
            if (!webgl2Func) return this.extensions[extension];
            if (!this.extensions[extension]) return null;
            return this.extensions[extension][extFunc].bind(this.extensions[extension]);
        }

        render({ scene, camera, target = null, update = true, sort = true, frustumCull = true, clear }) {
            if (target === null) {
                this.bindFramebuffer();
                this.setViewport(this.width * this.dpr, this.height * this.dpr);
            } else {
                this.bindFramebuffer(target);
                this.setViewport(target.width, target.height);
            }

            if (clear || (this.autoClear && clear !== false)) {
                if (this.depth && (!target || target.depth)) {
                    this.enable(this.gl.DEPTH_TEST);
                    this.setDepthMask(true);
                }
                if (this.stencil || !target || target.stencil) {
                    this.enable(this.gl.STENCIL_TEST);
                    this.setStencilMask(0xff);
                }
                this.gl.clear(
                    (this.color ? this.gl.COLOR_BUFFER_BIT : 0) |
                    (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
                    (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
                );
            }

            if (update && scene && scene.updateMatrixWorld) scene.updateMatrixWorld();
            if (camera && camera.updateMatrixWorld) camera.updateMatrixWorld();

            // 簡化的渲染 - 對於 Balatro 背景，我們直接渲染 mesh
            if (scene && scene.draw) {
                scene.draw({ camera });
            }
        }

        bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {}) {
            if (this.state.framebuffer === buffer) return;
            this.state.framebuffer = buffer;
            this.gl.bindFramebuffer(target, buffer);
        }

        setStencilMask(value) {
            if (this.state.stencilMask === value) return;
            this.state.stencilMask = value;
            this.gl.stencilMask(value);
        }
    }

    // =========================
    // Program - Shader 程式
    // =========================
    let programID = 1;
    const arrayCacheF32 = {};

    class Program {
        constructor(gl, {
            vertex,
            fragment,
            uniforms = {},
            transparent = false,
            cullFace = gl.BACK,
            frontFace = gl.CCW,
            depthTest = true,
            depthWrite = true,
            depthFunc = gl.LEQUAL,
        } = {}) {
            if (!gl.canvas) console.error('gl not passed as first argument to Program');
            this.gl = gl;
            this.uniforms = uniforms;
            this.id = programID++;

            if (!vertex) console.warn('vertex shader not supplied');
            if (!fragment) console.warn('fragment shader not supplied');

            this.transparent = transparent;
            this.cullFace = cullFace;
            this.frontFace = frontFace;
            this.depthTest = depthTest;
            this.depthWrite = depthWrite;
            this.depthFunc = depthFunc;
            this.blendFunc = {};
            this.blendEquation = {};
            this.stencilFunc = {};
            this.stencilOp = {};

            if (this.transparent && !this.blendFunc.src) {
                if (this.gl.renderer.premultipliedAlpha) this.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
                else this.setBlendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            }

            this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
            this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            this.program = gl.createProgram();
            gl.attachShader(this.program, this.vertexShader);
            gl.attachShader(this.program, this.fragmentShader);

            this.setShaders({ vertex, fragment });
        }

        setShaders({ vertex, fragment }) {
            if (vertex) {
                this.gl.shaderSource(this.vertexShader, vertex);
                this.gl.compileShader(this.vertexShader);
                if (this.gl.getShaderInfoLog(this.vertexShader) !== '') {
                    console.warn(`${this.gl.getShaderInfoLog(this.vertexShader)}\nVertex Shader\n${addLineNumbers(vertex)}`);
                }
            }
            if (fragment) {
                this.gl.shaderSource(this.fragmentShader, fragment);
                this.gl.compileShader(this.fragmentShader);
                if (this.gl.getShaderInfoLog(this.fragmentShader) !== '') {
                    console.warn(`${this.gl.getShaderInfoLog(this.fragmentShader)}\nFragment Shader\n${addLineNumbers(fragment)}`);
                }
            }
            this.gl.linkProgram(this.program);
            if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
                return console.warn(this.gl.getProgramInfoLog(this.program));
            }

            this.uniformLocations = new Map();
            let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
            for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
                let uniform = this.gl.getActiveUniform(this.program, uIndex);
                this.uniformLocations.set(uniform, this.gl.getUniformLocation(this.program, uniform.name));
                const split = uniform.name.match(/(\w+)/g);
                uniform.uniformName = split[0];
                uniform.nameComponents = split.slice(1);
            }

            this.attributeLocations = new Map();
            const locations = [];
            const numAttribs = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
            for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
                const attribute = this.gl.getActiveAttrib(this.program, aIndex);
                const location = this.gl.getAttribLocation(this.program, attribute.name);
                if (location === -1) continue;
                locations[location] = attribute.name;
                this.attributeLocations.set(attribute, location);
            }
            this.attributeOrder = locations.join('');
        }

        setBlendFunc(src, dst, srcAlpha, dstAlpha) {
            this.blendFunc.src = src;
            this.blendFunc.dst = dst;
            this.blendFunc.srcAlpha = srcAlpha;
            this.blendFunc.dstAlpha = dstAlpha;
            if (src) this.transparent = true;
        }

        setBlendEquation(modeRGB, modeAlpha) {
            this.blendEquation.modeRGB = modeRGB;
            this.blendEquation.modeAlpha = modeAlpha;
        }

        applyState() {
            if (this.depthTest) this.gl.renderer.enable(this.gl.DEPTH_TEST);
            else this.gl.renderer.disable(this.gl.DEPTH_TEST);
            if (this.cullFace) this.gl.renderer.enable(this.gl.CULL_FACE);
            else this.gl.renderer.disable(this.gl.CULL_FACE);
            if (this.blendFunc.src) this.gl.renderer.enable(this.gl.BLEND);
            else this.gl.renderer.disable(this.gl.BLEND);
            if (this.cullFace) this.gl.renderer.setCullFace(this.cullFace);
            this.gl.renderer.setFrontFace(this.frontFace);
            this.gl.renderer.setDepthMask(this.depthWrite);
            this.gl.renderer.setDepthFunc(this.depthFunc);
            if (this.blendFunc.src) this.gl.renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
            this.gl.renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);
        }

        use({ flipFaces = false } = {}) {
            let textureUnit = -1;
            const programActive = this.gl.renderer.state.currentProgram === this.id;
            if (!programActive) {
                this.gl.useProgram(this.program);
                this.gl.renderer.state.currentProgram = this.id;
            }

            this.uniformLocations.forEach((location, activeUniform) => {
                let uniform = this.uniforms[activeUniform.uniformName];
                for (const component of activeUniform.nameComponents) {
                    if (!uniform) break;
                    if (component in uniform) {
                        uniform = uniform[component];
                    } else if (Array.isArray(uniform.value)) {
                        break;
                    } else {
                        uniform = undefined;
                        break;
                    }
                }
                if (!uniform || uniform.value === undefined) return;
                setUniform(this.gl, activeUniform.type, location, uniform.value);
            });

            this.applyState();
            if (flipFaces) this.gl.renderer.setFrontFace(this.frontFace === this.gl.CCW ? this.gl.CW : this.gl.CCW);
        }
    }

    function setUniform(gl, type, location, value) {
        value = value.length ? flatten(value) : value;
        const setValue = gl.renderer.state.uniformLocations.get(location);
        if (value.length) {
            if (setValue === undefined || setValue.length !== value.length) {
                gl.renderer.state.uniformLocations.set(location, value.slice(0));
            } else {
                if (arraysEqual(setValue, value)) return;
                setValue.set ? setValue.set(value) : setArray(setValue, value);
                gl.renderer.state.uniformLocations.set(location, setValue);
            }
        } else {
            if (setValue === value) return;
            gl.renderer.state.uniformLocations.set(location, value);
        }

        switch (type) {
            case 5126: return value.length ? gl.uniform1fv(location, value) : gl.uniform1f(location, value);
            case 35664: return gl.uniform2fv(location, value);
            case 35665: return gl.uniform3fv(location, value);
            case 35666: return gl.uniform4fv(location, value);
            case 35670:
            case 5124:
            case 35678:
            case 36306:
            case 35680:
            case 36289:
                return value.length ? gl.uniform1iv(location, value) : gl.uniform1i(location, value);
            case 35671:
            case 35667: return gl.uniform2iv(location, value);
            case 35672:
            case 35668: return gl.uniform3iv(location, value);
            case 35673:
            case 35669: return gl.uniform4iv(location, value);
            case 35674: return gl.uniformMatrix2fv(location, false, value);
            case 35675: return gl.uniformMatrix3fv(location, false, value);
            case 35676: return gl.uniformMatrix4fv(location, false, value);
        }
    }

    function addLineNumbers(string) {
        let lines = string.split('\n');
        for (let i = 0; i < lines.length; i++) {
            lines[i] = i + 1 + ': ' + lines[i];
        }
        return lines.join('\n');
    }

    function flatten(a) {
        const arrayLen = a.length;
        const valueLen = a[0].length;
        if (valueLen === undefined) return a;
        const length = arrayLen * valueLen;
        let value = arrayCacheF32[length];
        if (!value) arrayCacheF32[length] = value = new Float32Array(length);
        for (let i = 0; i < arrayLen; i++) value.set(a[i], i * valueLen);
        return value;
    }

    function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0, l = a.length; i < l; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    function setArray(a, b) {
        for (let i = 0, l = a.length; i < l; i++) {
            a[i] = b[i];
        }
    }

    // =========================
    // Mesh - 網格物件
    // =========================
    let meshID = 0;

    class Mesh extends Transform {
        constructor(gl, { geometry, program, mode = gl.TRIANGLES, frustumCulled = true, renderOrder = 0 } = {}) {
            super();
            if (!gl.canvas) console.error('gl not passed as first argument to Mesh');
            this.gl = gl;
            this.id = meshID++;
            this.geometry = geometry;
            this.program = program;
            this.mode = mode;
            this.frustumCulled = frustumCulled;
            this.renderOrder = renderOrder;
            this.modelViewMatrix = new Mat4();
            this.normalMatrix = new Mat3();
            this.beforeRenderCallbacks = [];
            this.afterRenderCallbacks = [];
        }

        draw({ camera } = {}) {
            this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
            let flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;
            this.program.use({ flipFaces });
            this.geometry.draw({ mode: this.mode, program: this.program });
            this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
        }
    }

    // =========================
    // Geometry - 幾何體基類
    // =========================
    class Geometry {
        constructor(gl, attributes = {}) {
            this.gl = gl;
            this.attributes = attributes;
            this.id = 0;

            // 創建 attribute buffers
            Object.keys(attributes).forEach(name => {
                const attr = attributes[name];
                if (!attr.buffer) {
                    attr.buffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, attr.data, gl.STATIC_DRAW);
                }
            });
        }

        draw({ mode = this.gl.TRIANGLES, program } = {}) {
            const gl = this.gl;
            
            // 綁定 attribute buffers
            program.attributeLocations.forEach((location, attribute) => {
                const attr = this.attributes[attribute.name];
                if (!attr) return;
                
                gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, attr.size, gl.FLOAT, false, 0, 0);
            });

            // 計算頂點數量（從第一個 attribute）
            const firstAttr = Object.values(this.attributes)[0];
            const count = firstAttr ? firstAttr.data.length / firstAttr.size : 0;
            
            gl.drawArrays(mode, 0, count);
        }
    }

    // =========================
    // Triangle - 三角形幾何體
    // =========================
    class Triangle extends Geometry {
        constructor(gl, { attributes = {} } = {}) {
            Object.assign(attributes, {
                position: { 
                    size: 2, 
                    data: new Float32Array([-1, -1, 3, -1, -1, 3])
                },
                uv: { 
                    size: 2, 
                    data: new Float32Array([0, 0, 2, 0, 0, 2])
                },
            });
            super(gl, attributes);
        }
    }

    // =========================
    // 匯出到全域物件
    // =========================
    window.OGL = {
        Renderer: Renderer,
        Program: Program,
        Mesh: Mesh,
        Triangle: Triangle,
        Geometry: Geometry,
        Vec3: Vec3,
        Mat3: Mat3,
        Mat4: Mat4,
        Transform: Transform
    };

    // 為了向後兼容，也直接暴露到全域
    window.Renderer = Renderer;
    window.Program = Program;
    window.Mesh = Mesh;
    window.Triangle = Triangle;
    window.Geometry = Geometry;

})(window);

