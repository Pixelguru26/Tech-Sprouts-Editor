# Copies the contents of all python files into strings exported by js files.
# This allows the scripts to be loaded by a webpage without triggering CORS garbage.

from pathlib import Path

def packFile(file):
  print("Packing", file)
  data = file.read_text()
  data = data.replace("\\", "\\\\")
  data = data.replace("`", "\\`")
  data = data.replace("$", "\\$")
  data = "export default `\n" + data + "\n`;"
  file = file.with_suffix(".py.js")
  file.write_text(data)

def packDir(dir):
  for path in dir.iterdir():
    if path.is_dir():
      packDir(path)
    elif path.suffix == ".py":
      if (path.name != "packForJS.py"):
        packFile(path)

packDir(Path.cwd())