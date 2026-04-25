
export class DocsObject {
  constructor(container, name, desc) {
    this.container = container;
    this.name = name;
    this.desc = desc;
  }

  get signature() {
    if (JSLib.isString(this.container))
      return `${this.container}.${this.name}`;
    return `${this.container?.signature}.${this.name}`;
  }
}
export class DocsClassObject extends DocsObject {
  constructor(container, name, desc, parent = null) {
    super(container, name, desc);
    this.parent = parent ?? container;
  }
}
export class DocsFunctionObject extends DocsObject {
  constructor(container, name, desc, ...args) {
    super(container, name, desc);
    this.args = [];
    for (let i = 0; i < args.length; i++) {
      this.args.append();
    }
  }
}

let classDocSubsec = (t, heading) => {
  let list = [];
  for (let key in t) list.push(key);
  list.sort();
  return subsec(heading, memberTable(list.forEach(key => {
    let str = t[key];
    let splitIndex = str.indexOf(';');
    return member(key, str.substring(0, splitIndex), str.substring(splitIndex + 1).trimStart());
  })));
};
export function classDoc(signature, name, desc, data) {
  let children = [];
  if (data.static !== null)
    children.push(classDocSubsec(data.static, "Static Variables"));
  if (data.members !== null)
    children.push(classDocSubsec(data.members, "Instance Variables"));
  if (data.functions !== null) {

  }
  let ret = section(uid(signature), name, desc);
}