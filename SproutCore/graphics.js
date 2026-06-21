import Asset from "./asset.js";

const deg = Math.PI / 180;

export default class Graphics {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    /** @type {CanvasRenderingContext2D} */
    this.canvasContext = null;
    this.resizeReceivers = [];
    this.backCanvas = document.createElement("canvas");
    this.backCanvas.width = width;
    this.backCanvas.height = height;
    this.backCanvas.style.display = "none";
    document.body.appendChild(this.backCanvas);
    this.maxWidth = 8192;
    this.maxHeight = 8192;
  }
  
  bindCanvasContext(ctx) {
    this.canvasContext = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.backCanvasContext = this.backCanvas.getContext("2d");
    this.backCanvas.width = this.width;
    this.backCanvas.height = this.height;
    this.backCanvasContext.resetTransform();
    this.backCanvasContext.fillStyle = "black";
    this.backCanvasContext.fillRect(0, 0, this.width, this.height);
  }

  addEventListener(eventType, listener) {
    if (eventType === "resize") {
      this.resizeReceivers.push(listener);
    }
  }

  removeEventListener(eventType, listener) {
    if (eventType === "resize") {
      const index = this.resizeReceivers.indexOf(listener);
      if (index !== -1) {
        this.resizeReceivers.splice(index, 1);
      }
    }
  }

  publishEvent(eventType, ...args) {
    if (eventType === "resize") {
      for (let listener of this.resizeReceivers) {
        try {
          listener(...args);
        } catch (e) {
          console.error(`Error in resize event listener:`, e);
        }
      }
    }
  }

  /**
   * Notifies the graphics library of a canvas resize
   * and updates the canvas.
   * @param {number} width 
   * @param {number} height 
   */
  resize(width, height) {
    let oldWidth = this.width;
    let oldHeight = this.height;
    this.width = width;
    this.height = height;
    // if (this.canvasContext) {
    //   this.canvasContext.canvas.width = width;
    //   this.canvasContext.canvas.height = height;
    // }
    this.publishEvent("resize", width, height, oldWidth, oldHeight);
  }

  resizeBackCanvas(width, height, expandOnly = true) {
    let newBackCanvas;
    if (expandOnly) {
      // Expand back canvas as necessary to cover full screen size
      // To avoid loss of contents, does not shrink
      if (width > this.backCanvas.width || height > this.backCanvas.height) {
        // Construct new back canvas
        newBackCanvas = document.createElement("canvas");
        newBackCanvas.width = Math.max(this.backCanvas.width, Math.min(width, this.maxWidth));
        newBackCanvas.height = Math.max(this.backCanvas.height, Math.min(height, this.maxHeight));
      } else return;
    } else {
      newBackCanvas = document.createElement("canvas");
      newBackCanvas.width = width;
      newBackCanvas.height = height;
    }
    newBackCanvas.style.display = "none";
    document.body.appendChild(newBackCanvas);
    this.backCanvasContext = newBackCanvas.getContext("2d");
    // Clear new back canvas
    this.backCanvasContext.fillStyle = "black";
    this.backCanvasContext.fillRect(0, 0, newBackCanvas.width, newBackCanvas.height);
    // Transfer contents from old canvas
    this.backCanvasContext.drawImage(this.backCanvas, 0, 0);
    // Swap new canvas into place
    this.backCanvas.remove(); // Todo: test to ensure this is disposed properly
    this.backCanvas = newBackCanvas;
    return newBackCanvas;
  }

  /**
   * Passthrough for `canvas.resetTransform();`
   */
  ResetTransform() {
    this.canvasContext?.resetTransform();
  }

  /**
   * Fills the canvas with the specified color
   * regardless of current transformations.
   * @param {string} color 
   * @returns 
   */
  fillCanvas(color) {
    if (!this.canvasContext) return;
    let ctx = this.canvasContext;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let oldColor = ctx.fillStyle;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = oldColor;
    ctx.restore();
  }

  /**
   * Fills an axis-aligned rectangle with the specified color.
   * To rotate, use transforms.
   * @param {number} x 
   * @param {number} y 
   * @param {number} w 
   * @param {number} h 
   * @param {string} color 
   * @returns 
   */
  fillRect(x, y, w, h, color) {
    if (!this.canvasContext) return;
    let ctx = this.canvasContext;
    let oldColor = ctx.fillStyle;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldColor;
  }

  /**
   * 
   * @param {string} color 
   * @param {boolean} close 
   * @param  {...number} points Line points in the form [x1, y1, x2, y2, ...]
   * @returns 
   */
  polyLine(color, close = false, ...points) {
    if (!this.canvasContext) return;
    let ctx = this.canvasContext;
    let oldColor = ctx.strokeStyle;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }
    if (close) {
      ctx.closePath();
    }
    ctx.stroke();
    ctx.strokeStyle = oldColor;
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
    this.canvasContext?.transform(scaleX, skewVert, skewHoriz, scaleY, dx, dy);
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
    if (!this.canvasContext) return;
    const c = this.canvasContext;
    if (!c) return;
    const widthFactor = c.canvas.width / this.width;
    const heightFactor = c.canvas.height / this.height;
    if (r != 0) {
      c.translate(cx * widthFactor, cy * heightFactor);
      c.rotate(r * deg);
      c.translate(-cx * widthFactor, -cy * heightFactor);
    }
    c.translate(dx * widthFactor, dy * heightFactor);
    c.scale(sx * widthFactor, sy * heightFactor);
  }
  debugRect(x, y, w, h = null) {
    const c = this.canvasContext;
    if (!c) return;
    const widthFactor = c.canvas.width / this.width;
    const heightFactor = c.canvas.height / this.height;
    h ??= w;
    let oldColor = c.strokeStyle;
    let oldWidth = c.lineWidth;
    c.strokeStyle = "red";
    c.lineWidth = 3;
    c.strokeRect(x * widthFactor, y * heightFactor, w * widthFactor, h * heightFactor);
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
    const c = this.canvasContext;
    if (!c) return;
    const widthFactor = c.canvas.width / this.width;
    const heightFactor = c.canvas.height / this.height;
    let oldColor = c.strokeStyle;
    let oldWidth = c.lineWidth;
    c.strokeStyle = "red";
    c.lineWidth = 3;

    c.beginPath();
    c.arc(x * widthFactor, y * heightFactor, r * widthFactor, 0, Math.PI + Math.PI);
    c.stroke();
    c.closePath();

    c.strokeStyle = oldColor;
    c.lineWidth = oldWidth;
  }
  debugLine(x1, y1, x2, y2) {
    const c = this.canvasContext;
    if (!c) return;
    const widthFactor = c.canvas.width / this.width;
    const heightFactor = c.canvas.height / this.height;
    let oldColor = c.strokeStyle;
    let oldWidth = c.lineWidth;
    c.strokeStyle = "red";
    c.lineWidth = 3;

    c.beginPath();
    c.moveTo(x1 * widthFactor, y1 * heightFactor);
    c.lineTo(x2 * widthFactor, y2 * heightFactor);
    c.stroke();
    c.closePath();

    c.strokeStyle = oldColor;
    c.lineWidth = oldWidth;
  }
  debugDot(x, y) {
    const c = this.canvasContext;
    if (!c) return;
    const widthFactor = c.canvas.width / this.width;
    const heightFactor = c.canvas.height / this.height;
    let oldColor = c.fillStyle;
    c.fillStyle = "red";
    
    c.beginPath();
    c.arc(x * widthFactor, y * heightFactor, 3 * widthFactor, 0, Math.PI * 2);
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
   * @param {number} [sx=1] horizontal scale
   * @param {number} [sy=1] vertical scale
   * @param {number} [r=0] angle, in degrees
   * @param {number} [cx=x] x position of pivot point
   * @param {number} [cy=y] y position of pivot point
   * @param {number} [clock=0] time in seconds for animated images
   */
  draw(img, x, y, sx = 1, sy = 1, r = 0, cx = null, cy = null, clock = 0) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    this.transform(x, y, sx, sy, r, cx ?? x, cy ?? y);
    if (img instanceof Asset) {
      img.draw(c, clock);
    } else {
      c.drawImage(img, 0, 0);
    }
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
   * @param {number} [clock=0] time in seconds for animated images
   */
  drawCentered(img, x, y, sx, sy, r = 0, cx = null, cy = null, clock = 0) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    this.transform(x, y, sx, sy, r, cx ?? x, cy ?? y);
    c.translate(-(img.width ?? img.w ?? img.naturalWidth) / 2, -(img.height ?? img.h ?? img.naturalHeight) / 2);
    if (img instanceof Asset) {
      img.draw(c, clock);
    } else {
      c.drawImage(img, 0, 0);
    }
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
   * @param {number} [clock=0] time in seconds for animated images
   */
  drawRect(img, x, y, w, h, r = 0, cx = null, cy = null, clock = 0) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    this.transform(x, y, w / (img.width ?? img.w ?? img.naturalWidth), h / (img.height ?? img.h ?? img.naturalHeight), r, cx ?? x, cy ?? y);
    if (img instanceof Asset) {
      img.draw(c, clock);
    } else {
      c.drawImage(img, 0, 0);
    }
    c.restore();
  }

  /**
   * Warning: final width defined by size, font, and text content.
   * @param {string} string 
   * @param {number} x top left corner
   * @param {number} y top left corner
   * @param {string} font defaults to "16px sans-serif"
   * @param {string} color defaults to "white"
   * @param {string} outline defaults to "black"
   * @param {number} outlineWidth defaults to 3
   */
  drawTextSimple(string, x, y, font = "16px sans-serif", color = "white", outline = "black", outlineWidth = 3) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    c.font = font;
    c.textBaseline = "top";
    c.fillStyle = color;
    c.strokeStyle = outline;
    c.lineWidth = outlineWidth;
    c.fillText(string, x, y);
    c.strokeText(string, x, y);
    c.restore();
  }

  /**
   * Warning: final width defined by size, font, and text content.
   * Draws text centered vertically and horizontally on the provided coordinates.
   * @param {string} string 
   * @param {number} x center x
   * @param {number} y center y
   * @param {string} font defaults to "16px sans-serif"
   * @param {string} color defaults to "white"
   * @param {string} outline defaults to "black"
   * @param {number} outlineWidth defaults to 3
   */
  drawTextCentered(string, x, y, font = "16px sans-serif", color = "white", outline = "black", outlineWidth = 3) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    c.font = font;
    c.textBaseline = "top";
    const textMetrics = c.measureText(string);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    c.fillStyle = color;
    c.strokeStyle = outline;
    c.lineWidth = outlineWidth;
    c.fillText(string, x - textWidth * 0.5, y - textHeight * 0.5);
    c.strokeText(string, x - textWidth * 0.5, y - textHeight * 0.5);
    c.restore();
  }


  /**
   * Draws text that is scaled to fit within a given rectangle.
   * @param {string} string
   * @param {number} x top left corner of bounds
   * @param {number} y top left corner of bounds
   * @param {number} width
   * @param {number} height
   * @param {string?} font defaults to "16px sans-serif", actual size determined by bounding box
   * @param {string?} color defaults to "white"
   * @param {string?} outline defaults to "black"
   * @param {number?} outlineWidth defaults to 3
   */
  drawFittedText(string, x, y, width, height, font = "16px sans-serif", color = "white", outline = "black", outlineWidth = 3) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    c.font = font;
    c.textBaseline = "top";
    const textMetrics = c.measureText(string);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    let scale = Math.min(width / textWidth, height / textHeight);
    c.translate(x, y);
    c.scale(scale, scale);
    c.fillStyle = color;
    c.strokeStyle = outline;
    c.lineWidth = outlineWidth;
    c.strokeText(string, 0, 0);
    c.fillText(string, 0, 0);
    c.restore();
  }

  /**
   * Draws text that is scaled and centered to fit within a given rectangle.
   * @param {string} string
   * @param {number} x top left corner of bounds
   * @param {number} y top left corner of bounds
   * @param {number} width
   * @param {number} height
   * @param {string?} font defaults to "16px sans-serif", actual size determined by bounding box
   * @param {string?} color defaults to "white"
   * @param {string?} outline defaults to "black"
   * @param {number?} outlineWidth defaults to 3
   */
  drawFittedTextCentered(string, x, y, width, height, font = "16px sans-serif", color = "white", outline = "black", outlineWidth = 3) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    c.font = font;
    c.textBaseline = "top";
    const textMetrics = c.measureText(string);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    let scale = Math.min(width / textWidth, height / textHeight);
    c.translate(x + (width - textWidth * scale) * 0.5, y + (height - textHeight * scale) * 0.5);
    c.scale(scale, scale);
    c.fillStyle = color;
    c.strokeStyle = outline;
    c.lineWidth = outlineWidth;
    c.strokeText(string, 0, 0);
    c.fillText(string, 0, 0);
    c.restore();
  }

  /**
   * Draws text that is stretched to exactly fit within the given rectangle.
   * @param {string} string 
   * @param {number} x top left corner
   * @param {number} y top left corner
   * @param {number} width 
   * @param {number} height 
   * @param {string?} font defaults to "16px sans-serif"
   * @param {string?} color defaults to "white"
   * @param {string?} outline defaults to "black"
   * @param {number?} outlineWidth defaults to 3
   */
  drawStretchText(string, x, y, width, height, font = "16px sans-serif", color = "white", outline = "black", outlineWidth = 3) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    c.font = font;
    c.textBaseline = "top";
    const textMetrics = c.measureText(string);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    let scaleX = width / textWidth;
    let scaleY = height / textHeight;
    c.translate(x, y);
    c.scale(scaleX, scaleY);
    c.fillStyle = color;
    c.strokeStyle = outline;
    c.lineWidth = outlineWidth;
    c.strokeText(string, 0, 0);
    c.fillText(string, 0, 0);
    c.restore();
  }

  /**
   * Draws text in a given rectangle, with options for fitting and alignment.
   * "fit" uses the minimum uniform scale necessary to fit the text within the bounds.
   * "stretch" scales the text non-uniformly to fill the bounds exactly.
   * @param {string} string 
   * @param {number} x top left corner of bounds
   * @param {number} y top left corner of bounds
   * @param {number} width width of bounds in pixels
   * @param {number} height height of bounds in pixels
   * @param {string?} font defaults to "16px sans-serif"
   * @param {string?} color defaults to "white"
   * @param {string?} outline defaults to "black"
   * @param {number?} outlineWidth defaults to 3
   * @param {string?} fit any of "none", "fit", or "stretch". Defaults to "none". Determines automatic scaling behavior.
   * @param {string?} alignHoriz any of "left", "center", or "right". Defaults to "center". Determines horizontal alignment within the bounding box and sets canvas text alignment for the operation.
   * @param {string?} alignVert any of "top", "center", or "bottom". Defaults to "center". Determines vertical alignment within the bounding box.
   */
  drawText(string, x, y, width, height, font = "16px sans-serif", color = "white", outline = "black", outlineWidth = 3, fit = "none", alignHoriz = "center", alignVert = "center") {    const c = this.canvasContext;
    if (!c) return;
    // Validate horizontal alignment before I screw up the canvas state
    if (!["left", "center", "right"].includes(alignHoriz)) return;
    c.save();
    c.font = font;
    c.textBaseline = "top";
    c.textAlign = alignHoriz;
    const textMetrics = c.measureText(string);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    let scaleX = 1;
    let scaleY = 1;
    if (fit === "fit") {
      let scale = Math.min(width / textWidth, height / textHeight);
      scaleX = scaleY = scale;
    } else if (fit === "stretch") {
      scaleX = width / textWidth;
      scaleY = height / textHeight;
    }
    if (alignHoriz === "center") {
      if (alignVert === "center") {
        c.translate(x + (width - textWidth * scaleX) * 0.5, y + (height - textHeight * scaleY) * 0.5);
      } else if (alignVert === "bottom") {
        c.translate(x + (width - textWidth * scaleX) * 0.5, y + height - textHeight * scaleY);
      } else {
        c.translate(x + (width - textWidth * scaleX) * 0.5, y);
      }
    } else if (alignHoriz === "right") {
      if (alignVert === "center") {
        c.translate(x + width - textWidth * scaleX, y + (height - textHeight * scaleY) * 0.5);
      } else if (alignVert === "bottom") {
        c.translate(x + width - textWidth * scaleX, y + height - textHeight * scaleY);
      } else {
        c.translate(x + width - textWidth * scaleX, y);
      }
    } else {
      if (alignVert === "center") {
        c.translate(x, y + (height - textHeight * scaleY) * 0.5);
      } else if (alignVert === "bottom") {
        c.translate(x, y + height - textHeight * scaleY);
      } else {
        c.translate(x, y);
      }
    }
    c.scale(scaleX, scaleY);
    c.fillStyle = color;
    c.strokeStyle = outline;
    c.lineWidth = outlineWidth;
    c.strokeText(string, 0, 0);
    c.fillText(string, 0, 0);
    c.restore();
  }

  // Back canvas utils

  fillBackCanvas(color) {
    if (!this.backCanvasContext) return;
    let ctx = this.backCanvasContext;
    let oldColor = ctx.fillStyle;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = oldColor;
  }

  lineBack(x0, y0, x1, y1, color = "white", width = 1) {
    if (!this.backCanvasContext) return;
    this.resizeBackCanvas(Math.max(x0, x1), Math.max(y0, y1));
    let ctx = this.backCanvasContext;
    let oldColor = ctx.strokeStyle;
    let oldWidth = ctx.lineWidth;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = oldColor;
    ctx.lineWidth = oldWidth;
  }

  /**
   * Renders an image to the background canvas.
   * @param {CanvasImageSource} img 
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} [sx=1] horizontal scale
   * @param {number} [sy=1] vertical scale
   * @param {number} [r=0] angle, in degrees
   * @param {number} [cx=x] x position of pivot point
   * @param {number} [cy=y] y position of pivot point
   * @param {number} [clock=0] time in seconds for animated images
   */
  drawBack(img, x, y, sx = 1, sy = 1, r = 0, cx = null, cy = null, clock = 0) {
    const c = this.canvasContext;
    if (!c) return;
    c.save();
    this.transform(x, y, sx, sy, r, cx ?? x, cy ?? y);
    if (img instanceof Asset) {
      img.draw(c, clock);
    } else {
      c.drawImage(img, 0, 0);
    }
    c.restore();
  }
}