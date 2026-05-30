# This is a script demonstrating a Bellasso (aka Vingenére) cipher in Python

# Method first described by Giovan Battista Bellaso in 1553,
# commonly missattributed to Blaise de Vingenére.

alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

# Individual letters are encoded exactly the same way as in the Caesar cipher
def encodeLetter(letter, offset):
  index = alphabet.find(letter)
  if index > -1:
    index = index + offset
    # Handle offsets that are too low
    while index < 0: index += len(alphabet)
    # Handle offsets that are too high
    index = index % len(alphabet)
    # Produce result
    return alphabet[index]
  # Convert unknowns to spaces
  return ' '

def encodeText(text, key):
  output = ""
  for i in range(0, len(text)):
    # Encode each letter individually and add it to the output
    # Calculate letter and its offset
    letter = text[i].upper()
    keyLetter = key[i % len(key)]
    offset = alphabet.find(keyLetter.upper())

    if offset > -1:
      # Encode letter with its individual offset
      output = output + encodeLetter(letter, offset)
    else:
      # Convert unknowns to spaces
      output = output + ' '
  return output

def decodeText(text, key):
  output = ""
  for i in range(0, len(text)):
    letter = text[i].upper()
    letterKey = alphabet.find(key[i % len(key)].upper())
    if letterKey > -1:
      output = output + encodeLetter(letter, -letterKey)
    else:
      output = output + ' '
  return output

while True:
  print("Do you wish to encode or decode?")
  operation = input()
  if operation == "encode":
    print("Please enter some text to encode:")
    text = input()
    print("Now, please enter an encoding key:")
    key = input()
    print("The encoded version is: " + encodeText(text, key))
  elif operation == "decode":
    print("Please enter some text to decode:")
    text = input()
    print("Now, please enter a decoding key:")
    key = input()
    print("The decoded version is: " + decodeText(text, key))
  else:
    print("Exiting program.")
    break