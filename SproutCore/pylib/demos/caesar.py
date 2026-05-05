# This is a script demonstrating a simple Caesar cipher in Python

alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

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

def encodeText(text, offset):
  output = ""
  for letter in text.upper():
    # Encode each letter individually and add it to the output
    output = output + encodeLetter(letter, offset)
  return output
def decodeText(text, offset):
  # Decoding is just encoding with the opposite offset
  return encodeText(text, -offset)

# Now we build an interactive menu for the user
while True:
  print("Do you wish to encode or decode?")
  operation = input()

  if operation == "encode":
    print("Please enter some text to encode:")
    text = input()

    print("Now, please enter an encoding offset:")
    # The key must be a number, so we convert it using the int() function
    key = int(input())
    print("The encoded version is: " + encodeText(text, key))

  elif operation == "decode":
    print("Please enter some text to decode:")
    text = input()

    print("Now, please enter a decoding offset:")
    # The key must be a number, so we convert it using the int() function
    key = int(input())
    print("The decoded version is: " + decodeText(text, key))

  else:
    # If the operation specified doesn't exist, just exit the program
    print("Exiting program.")
    break