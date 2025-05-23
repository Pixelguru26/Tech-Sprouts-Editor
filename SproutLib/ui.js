SproutCore.registerLib("ui", ["geometry"], (game) => {
  game.ui = class UI {
    static build = JSLib2.build;
    static buildTree = JSLib2.buildTree;
    static awaitBuild = JSLib2.awaitBuild;

    static gradient = class Gradient {
      stops = [];
      colorSpace = "srgb";
      constructor(...stops) {
        let max = stops[0];
        for (let i = 0; i < stops.length; i+=2) {
          if (stops[i] > max) max = stops[i];
        }
        for (let i = 0; i < stops.length; i+=2) {
          this.addStop(stops[i]/max, stops[i+1]);
        }
      }
      newSimple(...stops) {
        let ret = new Gradient();
        for (let i = 0; i < stops.length; i++) {
          ret.addStop(i/(stops.length-1), stops[i]);
        }
      }

      index(pos) {
        for (let i = 0; i < this.stops.length; i++) {
          if (this.stops[i].pos > pos) {
            return i;
          }
        }
        return this.stops.length;
      }
      insertRaw(pos, val) {
        this.stops.splice(this.index(pos), 0, val);
      }

      addStop(pos, value) {
        let stop = {
          pos: pos,
          val: value
        };
        this.insertRaw(pos, stop);
      }

      getInterval(pos) {
        if (this.stops.length < 1) return [{pos: 0, val: "black"}, {pos: 0, val: "black"}];
        let i = this.index(pos);
        return [
          this.stops[Math.max(i-1, 0)],
          this.stops[Math.min(i, this.stops.length-1)]
        ];
      }

      /**
       * Returns the css string blending between the nearest gradient stops.
       * @param {number} pos 
       * @returns {string} color-mix(in this.colorSpace, prevColor, nextColor, factor)
       */
      read(pos) {
        let [prev, next] = this.getInterval(pos);
        let fac;
        if (prev.pos === next.pos) fac = 0;
        else fac = (pos-prev.pos)/(next.pos - prev.pos);
        return `color-mix(in ${this.colorSpace}, ${prev.val}, ${next.val} ${(fac * 100).toFixed(1)}%)`;
      }
    }
    static barDisplay = class BarDisplay extends HTMLElement {
      __layers = [];
      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.rootContainer = JSLib2.build("div", {
          style:{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            display: "inline-block"
          }
        });
        this.shadowRoot.append(this.rootContainer);
        this.textNode = JSLib2.build("div", {
          style: {
            position: "absolute",
            top: 0, left: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            textAlign: "center",
            zIndex: 1,
            color: "white",
            textShadow: "0 0 4px black"
          }
        });
        this.rootContainer.append(this.textNode);
      }
      connectedCallback() {
        this.style.display = "inline-block";
        this.classList.add("jse-bar-display");
      }

      addLayer(val, max, min, colorSrc) {
        let layer = {
          min: min,
          max: max,
          colorSrc: colorSrc,
          element: JSLib2.build("div", {
            style: {
              position: "absolute",
              height: "100%"
            }
          })
        };
        let i = this.__layers.push(layer) - 1;
        this.rootContainer.append(layer.element);
        this.setLayerValue(i, val);
        return layer;
      }
      setLayerValue(i, v) {
        let layer = this.__layers[i];
        if (!layer) return; // Error protection
        if (layer.value == v) return; // Only recalculate when necessary
        // Set value and width
        layer.value = v;
        v = (v-layer.min)/(layer.max-layer.min);
        layer.element.style.width = `${(v*100).toFixed(2)}%`;
        // console.log(layer.value, v, layer.min, layer.max, layer.max-layer.min);
        // Set color
        if (layer.colorSrc instanceof UI.gradient) {
          // console.log(layer.colorSrc.read(v));
          layer.element.style.backgroundColor = layer.colorSrc.read(v);
        } else {
          // console.log(layer.colorSrc);
          layer.element.style.backgroundColor = layer.colorSrc;
        }
      }
    }
  }
  customElements.define("jse-bar-display", game.ui.barDisplay);
});
