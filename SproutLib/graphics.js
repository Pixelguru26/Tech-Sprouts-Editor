SproutCore.registerLib("graphics", [], (game) => {
  /**
   * An entirely static class providing utilities for rendering
   * in a style more in line with conventions of game development.
   */
  game.graphics = class Graphics {
    /** Used to define the canvas context used when the transform stack empties */
    static defaultCanvasContext = null;
    /** Target canvas for the library */
    static canvas = null;
    static transformStack = [];
    /**
     * Initializes the library.
     * Settings, especially canvas, are global for simplicity.
     * @param {CanvasRenderingContext2D} canvasContext 
     */
    static init(canvasContext) {
      Graphics.canvas = canvasContext;
      Graphics.defaultCanvasContext = canvasContext;
    }

    /**
     * Rotates the current canvas about a given origin point.
     * Does not persist across canvas changes.
     * @param {number} r Angle in degrees clockwise
     * @param {number?} cx x center of rotation (offset from current transform)
     * @param {number?} cy y center of rotation (offset from current transform)
     */
    static rotate(r, cx = 0, cy = 0) {
      r *= Math.PI/180;
      if (cx != 0 || cy != 0) {
        Graphics.canvas.translate(cx, cy);
        Graphics.canvas.rotate(r);
        Graphics.canvas.translate(-cx, -cy);
      } else {
        Graphics.canvas.rotate(r);
      }
    }

    /**
     * Passthrough for the `game.graphics.canvas.translate(dx, dy);` operation.
     * @param {number} dx 
     * @param {number} dy 
     */
    static translate(dx, dy) { Graphics.canvas.translate(dx, dy); }

    /**
     * Passthrough for `game.graphics.canvas.scale(sx, sy);`
     * @param {number} sx 
     * @param {number} sy 
     */
    static scale(sx, sy) { Graphics.canvas.scale(sx, sy); }

    /**
     * Passthrough for `game.graphics.canvas.transform(...);`\
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
    static transform(scaleX = 1, skewVert = 0, skewHoriz = 0, scaleY = 1, dx = 0, dy = 0) {
      Graphics.canvas.transform(scaleX, skewVert, skewHoriz, scaleY, dx, dy);
    }

    /**
     * Draws an image at the provided location.
     * Generally prefer `game.graphics.draw(...);`
     * @param {*} img 
     * @param {number} x 
     * @param {number} y 
     * @param {number?} clock 
     */
    static blit(img, x, y, clock = 0) {
      if (img instanceof game.asset) {
        if (img instanceof game.asset.assetImageAnimated) {
          img.blit(Graphics.canvas, x, y, clock);
        } else {
          img.blit(Graphics.canvas, x, y);
        }
      } else {
        Graphics.canvas.drawImage(img, x, y);
      }
    }

    /**
     * Pushes the graphics state and applies transformations
     * corresponding to a conventional draw call.
     * @param {TexImageSource | game.asset.assetImage} img 
     * @param {number} x 
     * @param {number} y 
     * @param {number?} r Angle in degrees clockwise
     * @param {number?} sx Horizontal scale (default: 1)
     * @param {number?} sy Vertical scale (default: sx)
     */
    static transformSimple(x, y, r = 0, sx = 1, sy = null) {
      Graphics.push();
      Graphics.translate(x, y);
      if (r != 0) Graphics.rotate(r);
      if (sy || sx != 1) Graphics.scale(sx, sy ?? sx);
    }

    /**
     * Pushes the graphics state and applies transformations
     * corresponding to a conventional draw call.\
     * This version centers the provided image origin (cx, cy) on the draw
     * coordinates. The origin is provided as a fraction of the image's dimensions.
     * @param {TexImageSource | game.asset.assetImage} img 
     * @param {number} x 
     * @param {number} y 
     * @param {number?} r Angle in degrees clockwise
     * @param {number?} sx Horizontal scale (default: 1)
     * @param {number?} sy Vertical scale (default: sx)
     * @param {number?} cx Center x (default: 0.5)
     * @param {number?} cy Center y (default: 0.5)
     */
    static transformSimpleCentered(img, x, y, r = 0, sx = 1, sy = null, cx = 0.5, cy = 0.5) {
      Graphics.push();
      Graphics.translate(x, y);
      if (r != 0) Graphics.rotate(r);
      let w = img.w ?? img.naturalWidth;
      let h = img.h ?? img.naturalHeight;
      if (sy || sx != 1) Graphics.scale(sx, sy ?? sx);
      Graphics.translate(-cx * w, -cy * h);
    }

    /**
     * Bundles transform and blit into the same call.
     * Intended to be the primary function in this library.\
     * If supplied an animated image, must include clock as an argument -
     * see overloads.
     * @overload
     * @param {TexImageSource | game.asset.assetImage} img 
     * @param {number} x 
     * @param {number} y 
     * @param {number} r rotation in degrees clockwise
     * @param {number} sx horizontal scale (default: 1)
     * @param {number?} sy vertical scale (default: sx)
     */
    /**
     * Bundles transform and blit into the same call.
     * Intended to be the primary function in this library.\
     * If supplied an animated image, must include clock as an argument -
     * see overloads.
     * @overload
     * @param {game.asset.assetImageAnimated} img 
     * @param {number} clock 
     * @param {number} x 
     * @param {number} y 
     * @param {number} r rotation in degrees clockwise
     * @param {number} sx horizontal scale (default: 1)
     * @param {number?} sy vertical scale (default: sx)
     */
    static draw(img, x, y, r = 0, sx = 1, sy = null, buffer = null) {
      if (img instanceof game.asset.assetImageAnimated) {
        // Function overload: draw(img, clock, x, y, r, sx, sy)
        let clock = x;
        // Shift arguments back
        x = y; y = r; r = sx; sx = sy; sy = buffer;
        Graphics.transformSimple(x, y, r, sx, sy);
        img.blit(Graphics.canvas, 0, 0, clock);
      } else {
        Graphics.transformSimple(x, y, r, sx, sy);
        Graphics.blit(img, 0, 0);
      }
      Graphics.pop();
    }

    /**
     * Bundles transform and blit into the same call.\
     * By default, draws the image centered at the provided coordinates: `cx = 0.5, cy = 0.5`.\
     * Different numbers may be supplied to center the image in different places
     * relative to its dimensions.\
     * If supplied an animated image, must include clock as an argument -
     * see overloads.
     * @overload
     * @param {TexImageSource | game.asset.assetImage} img 
     * @param {number} x 
     * @param {number} y 
     * @param {number?} r rotation in degrees clockwise
     * @param {number?} sx horizontal scale (default: 1)
     * @param {number?} sy vertical scale (default: sx)
     * @param {number?} cx offset x ratio of the image center
     * @param {number?} cy offset y ratio of the image center
     */
    /**
     * Bundles transform and blit into the same call.\
     * By default, draws the image centered at the provided coordinates: `cx = 0.5, cy = 0.5`.\
     * Different numbers may be supplied to center the image in different places
     * relative to its dimensions.\
     * If supplied an animated image, must include clock as an argument -
     * see overloads.
     * @overload
     * @param {game.asset.assetImageAnimated} img 
     * @param {number} clock 
     * @param {number} x 
     * @param {number} y 
     * @param {number?} r rotation in degrees clockwise
     * @param {number?} sx horizontal scale (default: 1)
     * @param {number?} sy vertical scale (default: sx)
     * @param {number?} cx offset x ratio of the image center
     * @param {number?} cy offset y ratio of the image center
     */
    static drawCentered(img, x, y, r = 0, sx = 1, sy = null, cx = 0.5, cy = 0.5, buffer = 0.5) {
      if (img instanceof game.asset.assetImageAnimated) {
        let clock = x;
        x = y; y = r; r = sx; sx = sy; sy = cx; cx = cy; cy = buffer;
        Graphics.transformSimpleCentered(img, x, y, r, sx, sy, cx, cy);
        img.blit(Graphics.canvas, 0, 0, clock);
      } else {
        Graphics.transformSimpleCentered(img, x, y, r, sx, sy, cx, cy);
        Graphics.blit(img, 0, 0);
      }
      Graphics.pop();
    }

    /**
     * Pushes a new layer onto the transform stack,
     * allowing the current sate to be returned to via `game.graphics.pop();`
     */
    static push() {
      Graphics.canvas.save();
      Graphics.transformStack.push(Graphics.canvas ?? Graphics.defaultCanvasContext);
    }

    /**
     * Rather flimsy way to revert changes to the transform of the graphics system.\
     * Use with care, as it handles canvas changes particularly poorly.
     * @returns the result of `Graphics.canvas.restore();`
     */
    static pop() {
      let ret = Graphics.canvas?.getTransform?.();
      Graphics.canvas?.restore();
      Graphics.canvas = Graphics.transformStack.pop();
      return ret;
    }

    /**
     * Resets the transform stack completely
     */
    static reset() {
      Graphics.transformStack.clear();
      Graphics.canvas.resetTransform();
    }
  }
});