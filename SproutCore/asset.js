

class Asset {
  static reg = {};

  /**
   * @param {string} path 
   */
  constructor(path, name = null, abs = false) {
    if (abs) this.path = path;
    else this.path = "./Assets/" + path;

    // Remove file extension
    let i = path.lastIndexOf('.');
    if (i > 0) {
      path = path.substring(0, i);
    }

    // Assign short name
    // If none is provided, generate one from path
    if (name) {
      this.name = name;
      Asset.reg[name] = this;
    } else {
      let tmp = path.split('/');
      this.name = tmp.pop();
      if (!this.name) this.name = path;
      Asset.reg[this.name] = this;
    }
  }

  static getAsset (src) {
    if (src in this.reg) return this.reg[src];
    let tmp = "./Assets/" + src;
    if (tmp in this.reg) return this.reg[tmp];
    return null;
  }
}

Asset.ImageAsset = class ImageAsset extends Asset {
  /**
   * @param {string} path 
   * @param {string?} name 
   */
  constructor(path, name = null) {
    if (path.includes('.')) super(path, name);
    else super(path + ".png", name);

    this.element = document.createElement("img");
    this.src = this.path;
    (document.getElementById("assets"))?.appendChild?.(this.element);
  }

  get src() { return this.element.src; }
  set src(v) { this.element.src = v; }

  static getImage(src) {
    return Asset.getAsset(src) ?? new ImageAsset(src);
  }

  get width() { return this.element.naturalWidth; }
  get height() { return this.element.naturalHeight; }
}

export default Asset;