import JSLib from "./lib.js";
import data from "./docdata.js";

// Early attempt at collapsible documentation
// export class JSECollapsar extends HTMLElement {
//   /** @type {Node} */
//   content = null;
//   constructor() {
//     super();
//   }

//   connectedCallback() {
//     this.indicator = JSLib.buildElement("i", {
//       class: "fa fa-caret-down",
//       style: {width: "2ch"}
//     });
//     this.prepend(this.indicator);

//     this.toggleAttribute("open");

//     if (this.nextElementSibling) {
//       // ???
//       this.content = this.nextElementSibling;
//       this.append(this.nextElementSibling);
//       this.setAttribute("open", "true");
//     }

//     this.observer = new MutationObserver(function(changes) {
//       changes.forEach(function(change) {
//         if (change.target === this && change.type === "attributes") {
//           this.attrChange(change);
//         }
//       });
//     });

//     this.addEventListener("click", function(evt) {
//       this.toggleAttribute("open");
//     });
//   }

//   /**
//    * 
//    * @param {MutationRecord} change 
//    */
//   attrChange(change) {
//     switch (change.attributeName) {
//       case "open":
//         if (this.getAttribute("open")) {
//           this.append(this.content);
//           this.indicator.classList.remove("fa-caret-right");
//           this.indicator.classList.add("fa-caret-down");
//         } else {
//           this.content.remove();
//           this.indicator.classList.remove("fa-caret-down");
//           this.indicator.classList.add("fa-caret-right");
//         }
//         break;
//       default: break;
//     }
//   }
// }
// customElements.define("jse-collapsar", JSECollapsar);

export default () => {
  let tab = document.getElementById("tab-docs");
  tab.append(...data);
}