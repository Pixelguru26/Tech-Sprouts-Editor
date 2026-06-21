export default class PageManager {
  /**
   * 
   * @param {HTMLDivElement} app 
   */
  constructor(app) {
    this.app = app;
    let input = document.createElement("input");
    input.type = "file";
    input.addEventListener("change", (event) => {
      let file = event.target.files[0];
      if (file) {
        let reader = new FileReader();
        reader.onload = (e) => {
          console.log(e.target.result);
        };
        reader.readAsText(file);
      }
    });
    this.app.appendChild(input);
  }
}