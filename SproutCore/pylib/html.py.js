export default `
import js
from pyodide import ffi


eventList = [
  "cancel", "change", "error", "load", "copy", "cut", "paste", "drag",
  "dragend", "dragenter", "dragleave", "dragover", "dragstart",
  "drop", "beforetoggle", "toggle",
  "afterscriptexecute", "beforeinput", "beforematch",
  "beforescriptexecute", "beforexrselect",
  "contentvisibilityautostatechange",
  "input", "securitypolicyviolation", "wheel",
  "animationcancel", "animationend", "animationiteration",
  "animationstart",
  "compositionend", "compositionstart", "compositionupdate",
  "blur", "focus", "focusin", "focusout",
  "fullscreenchange", "fullscreenerror",
  "keydown", "keypress", "keyup",
  "auxclick", "click", "contextmenu", "dblclick", "domactivate",
  "dommousescroll",
  "mousedown", "mouseenter", "mouseleave", "mousemove",
  "mouseout", "mouseover", "mouseup",
  "gotpointercapture", "lostpointercapture",
  "pointercancel", "pointerdown", "pointerenter",
  "pointerleave", "pointermove", "pointerout",
  "pointerover", "pointerrawupdate", "pointerup",
  "scroll", "scrollend",
  "touchcancel", "touchend", "touchmove", "touchstart",
  "transitioncancel", "transitionend", "transitionrun",
  "transitionstart"
]
HtmlAliases = {}
HtmlEvents = {}
for k in eventList:
  HtmlAliases["on" + k] = k
  HtmlEvents[k] = k
  HtmlEvents["on" + k] = k

def BuildElement(tag, data):
  """
  Constructs a single HTML element with provided tag and properties.
  Args:
      tag (string): Tag name indicating type of element
      data (dict(str, type[Any])): Dictionary of HTML properties to apply
  """
  if (isinstance(tag, str)):
    tag = js.document.createElement(tag)
  if (data == None): return tag
  lowerk = None
  altk = None
  evtk = None
  v = None
  for k in data:
    v = data[k]
    lowerk = k.lower()

    # Many attributes behave oddly when set under normal conditions.
    # This branch helps stabilize some of the apparent problems.
    if lowerk == "style":
      if isinstance(v, str):
        # Style can be changed wholesale
        tag.style.cssText = tag.style.cssText + v
      else:
        # Otherwise transfer information
        for stylekey in v:
          tag[stylekey] = v[stylekey]
    elif lowerk == "innerhtml":
      tag["textContent"] = v
    elif lowerk == "textcontent":
      tag["textContent"] = v
    else:
      # More general aliasing system
      altk = HtmlAliases[lowerk]
      evtk = None
      if altk == None:
        evtk = HtmlEvents[lowerk]
      else:
        evtk = HtmlEvents[altk]
      
      if evtk != None:
        tag.addEventListener(evtk, v)
      elif isinstance(v, function):
        tag[k] = v
      else:
        if (altk == None):
          tag.setAttribute(altk, v)
        else:
          tag.setAttribute(k, v)
  return tag

def Build(data, parent = None):
  if (data == None): return None

  # Build text node when a string is passed
  if (isinstance(data, str)):
    t = js.document.createTextNode(data)
    if (parent != None):
      parent.appendChild(t)
    return t
  
  # When two nodes are passed, append and return
  if (isinstance(data, js.Node) and isinstance(parent, js.Node)):
    parent.appendChild(data)
    return data
  
  if (isinstance(data[0], str)):
    element = None
    start = 1

    # Root element construction (usually \`build("tag", { ... })\`)
    if (isinstance(data[1], js.Node)):
      element = js.document.createElement(data[0])
    else:
      # If first element is tag,
      # construct an element using data[1] as arguments,
      # then use that element as the root.
      element = Build(data[0], data[start])
      start = start + 1
    
    for i in range(start, data.count):
      Build(data[i], element)
  else:
    # Batch construction case used on lists of children
    t = []
    for element in data:
      t.append(Build(element, parent))
    return t
  return t

`;