
const deg = Math.PI / 180;

class GLSystem {
  constructor(gl) {
    /** @type {WebGLRenderingContext} */
    this.cl = gl;
  }

  init() {
    let gl = this.cl;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, SproutCore.vsSource);
    this.fragShader = this.loadShader(gl, gl.FRAGMENT_SHADER, SproutCore.fsSource);
    this.clProgram = gl.createProgram();
    gl.attachShader(this.clProgram, this.vertexShader);
    gl.attachShader(this.clProgram, this.fragShader);
    gl.linkProgram(this.clProgram);
    if (!gl.getProgramParameter(this.clProgram, gl.LINK_STATUS)) {
      alert("WebGL program initialization failed. System cannot run.");
      return;
    }

    this.vertexLocation = gl.getAttribLocation(this.clProgram, "aVertexPosition");
    this.projMatrixLocation = gl.getUniformLocation(this.clProgram, "uProjectionMatrix");
    this.mviewMatrixLocation = gl.getUniformLocation(this.clProgram, "uModelViewMatrix");
  }

  loadShader(gl, type, src) {
    // const gl = this.cl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("WebGL shader compilation failed. System cannot run.");
      let err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`webgl shader compilation error: ${err}`);
    }
    return shader;
  }

  static vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
  static fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;
}

export default class Graphics {
  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   */
  constructor(ctx) {
    /** @type {CanvasRenderingContext2D} */
    this.c = ctx;
  }

  /**
     * Passthrough for `canvas.transform(...);`\
     * Parameters correspond exactly to the first 6 entries in the 3x3
     * transform matrix, and are named roughly in correspondence
     * to what role that entry performs if modified in isolation.
     * @param {number?} scaleX 1 by default
     * @param {number?} skewVert 0 by default
     * @param {number?} skewHoriz 0 by default
     * @param {number?} scaleY 1 by default
     * @param {number?} dx 0 by default
     * @param {number?} dy 0 by default
     */
  transformRaw(scaleX = 1, skewVert = 0, skewHoriz = 0, scaleY = 1, dx = 0, dy = 0) {
    this.c.transform(scaleX, skewVert, skewHoriz, scaleY, dx, dy);
  }
  /**
   * Applies a common image drawing transform.
   * (rotation, position, and scale)
   * @param {number} dx x position
   * @param {number} dy y position
   * @param {number} sx horizontal scale
   * @param {number} sy vertical scale
   * @param {number} r angle, in degrees
   * @param {number} cx x position of pivot point
   * @param {number} cy y position of pivot point
   */
  transform(dx, dy, sx, sy, r, cx, cy) {
    const c = this.c;
    if (r != 0) {
      c.translate(cx, cy);
      c.rotate(r * deg);
      c.translate(-cx, -cy);
    }
    c.translate(dx, dy);
    c.scale(sx, sy);
  }
  debugRect(x, y, w, h = null) {
    h ??= w;
    const c = this.c;
    let oldColor = c.strokeStyle;
    let oldWidth = c.lineWidth;
    c.strokeStyle = "red";
    c.lineWidth = 3;
    c.strokeRect(x, y, w, h);
    c.strokeStyle = oldColor;
    c.lineWidth = oldWidth;
  }
  debugCRect(x, y, w, h = null) {
    h ??= w;
    x -= w/2;
    y -= h/2;
    this.debugRect(x, y, w, h);
  }
  debugCircle(x, y, r) {
    const c = this.c;
    let oldColor = c.strokeStyle;
    let oldWidth = c.lineWidth;
    c.strokeStyle = "red";
    c.lineWidth = 3;

    c.beginPath();
    c.arc(x, y, r, 0, Math.PI + Math.PI);
    c.stroke();
    c.closePath();

    c.strokeStyle = oldColor;
    c.lineWidth = oldWidth;
  }
  debugLine(x1, y1, x2, y2) {
    const c = this.c;
    let oldColor = c.strokeStyle;
    let oldWidth = c.lineWidth;
    c.strokeStyle = "red";
    c.lineWidth = 3;

    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.closePath();

    c.strokeStyle = oldColor;
    c.lineWidth = oldWidth;
  }
  debugDot(x, y) {
    const c = this.c;
    let oldColor = c.fillStyle;
    c.fillStyle = "red";
    
    c.beginPath();
    c.arc(x, y, 3, 0, Math.PI + Math.PI);
    c.fill();
    c.closePath();

    c.fillStyle = oldColor;
  }
  /**
   * Renders an image to the canvas
   * just like an actually reasonable game engine.
   * @param {CanvasImageSource} img 
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} sx horizontal scale
   * @param {number} sy vertical scale
   * @param {number} r angle, in degrees
   * @param {number} cx x position of pivot point
   * @param {number} cy y position of pivot point
   */
  draw(img, x, y, sx, sy, r = 0, cx = null, cy = null) {
    if (img.element) img = img.element;
    const c = this.c;
    c.save();
    this.transform(x, y, sx, sy, r, cx ?? x, cy ?? y);
    c.drawImage(img, 0, 0);
    c.restore();
  }
  /**
   * Renders an image to the canvas,
   * using the center as the pivot point.
   * @param {CanvasImageSource} img 
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} sx horizontal scale
   * @param {number} sy vertical scale
   * @param {number} r angle, in degrees
   * @param {number} cx x position of pivot point
   * @param {number} cy y position of pivot point
   */
  drawCentered(img, x, y, sx, sy, r = 0, cx = null, cy = null) {
    if (img.element) img = img.element;
    const c = this.c;
    c.save();
    this.transform(x, y, sx, sy, r, cx ?? x, cy ?? y);
    c.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);
    c.drawImage(img, 0, 0);
    c.restore();
  }

  /**
   * Renders an image to the canvas,
   * using the center as the pivot point
   * and the provided rectangle as the initial
   * location and scale.
   * @param {CanvasImageSource} img 
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} w target width
   * @param {number} h target height
   * @param {number} r angle, in degrees
   * @param {number} cx x position of pivot point
   * @param {number} cy y position of pivot point
   */
  drawRect(img, x, y, w, h, r = 0, cx = null, cy = null) {
    if (img.element) img = img.element;
    const c = this.c;
    c.save();
    this.transform(x, y, w / img.naturalWidth, h / img.naturalHeight, r, cx ?? x, cy ?? y);
    c.drawImage(img, 0, 0);
    c.restore();
  }
}