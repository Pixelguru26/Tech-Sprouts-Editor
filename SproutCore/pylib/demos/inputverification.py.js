export default `
# Returns None if the supplied text does not represent a valid integer.
# Otherwise, returns the integer represented by the supplied text.
def validateInt(text):
  try:
    value = int(text)
    return value
  except:
    return None

# Returns True if the supplied text contains a valid integer. Otherwise, False.
def isValidInt(text):
  try:
    value = int(text)
    return True
  except:
    return False

# Returns None if the supplied text does not contain a valid number.
# Otherwise, returns the number represented by the supplied text.
def validateFloat(text):
  try:
    value = float(text)
    return value
  except:
    return None

# Returns True if the supplied text contains a valid number. Otherwise, False.
def isValidFloat(text):
  try:
    value = float(text)
    return True
  except:
    return False
`;