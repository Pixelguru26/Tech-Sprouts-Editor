
ret = node.right
node.right = ret.left
if ret.left != t.nil
  ret.left.parent = node
ret.parent = node.parent
if node.parent == t.nil
  t.root = ret
elseif node == node.parent.left
  node.parent.left = ret
else
  node.parent.right = ret
ret.left = node
node.parent = ret


  static gradient = class Gradient {
    constructor() {

    }

    static newNode() {
      return {
        red: false
      };
    }
    static getSibling(node) {
      if (node == null) return null;
      let parent = node.parent;
      if (parent) {
        if (parent.left === node) {
          return parent.right;
        }
        if (parent.right === node) {
          return parent.left;
        }
      }
      return null;
    }
    static getUncle(node) {
      if (node == null) return null;
      let parent = node.parent;
      if (parent) {
        return Gradient.getSibling(parent);
      }
      return null;
    }
    
    search(query) {

    }
    fix(v) {
      let parent = v.parent;
      if (parent) {
        let grandparent = parent.parent;
        if (grandparent) {
          let uncle = Gradient.getSibling(parent);
          if (uncle) {
            let grandparent = parent.parent;
            if (grandparent) {
              if (uncle.red) {
                // Red uncle
                uncle.red = false;
                parent.red = false;
                v.red = true;
                grandparent.red = true;
              } else {
                // Uncle black
                let vLeft = v === parent.left;
                let pLeft = parent === grandparent.left;
                // Logical xor on direction
                if (!vLeft != !pLeft) {
                  // Triangle case
                  if (vLeft) {
                    this.rotateRight(parent);
                  } else {
                    this.rotateLeft(parent);
                  }
                } else {
                  // Line case
                }
              }
            }
          } else {
            // No uncle, what do?
          }
        }
      } else {
        // Root node is always black
        v.red = false;
      }
    }
    insert(v) {
    }
    remove(query) {

    }
    /**
     * Return value is the new source node.
     * @param {{}} node Source node. Rotates right child into source position.
     */
    rotateLeft(node) {
      let ret = node.right;
      if (ret) {
        node.right = ret.left;
        node.right.parent = node;
        ret.left = node;
        ret.parent = node.parent;
        node.parent = ret;
        if (ret.parent) {
          if (node === ret.parent.left) {
            ret.parent.left = ret;
          } else {
            ret.parent.right = ret;
          }
        } else {
          this.root = ret;
        }
        return ret;
      }
    }
    /**
     * Return value is the new source node.
     * @param {{}} node Source node. Rotates left child into source position.
     */
    rotateRight(node) {
      let ret = node.left;
      if (ret) {
        node.left = ret.right;
        node.left.parent = node;
        ret.right = node;
        // Swap parents
        ret.parent = node.parent;
        node.parent = ret;
        // Replace origin
        if (ret.parent) {
          if (node === ret.parent.left) {
            ret.parent.left = ret;
          } else {
            ret.parent.right = ret;
          }
        } else {
          this.root = ret;
        }
        return ret;
      }
    }
  }