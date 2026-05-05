# This is a script that checks if a word is a palindrome

# A palindrome is a word that is spelled the same forward and backwards.
# Some examples:
#   civic
#   level
#   taco cat
#   was it a car or a cat I saw

# We'll need this later for finding the halfway point
import math

# To detect a palindrome, we'll first have to remove all
# punctuation, spacing, and capitalization from the input.
invalidCharacters = " !?:,.'"
def stripString(text):
  for char in invalidCharacters:
    text = text.replace(char, '')
  return text

def detectPalindrome(text):
  text = stripString(text).lower()

  # Next, we need to check if the text is even or odd.
  # This will determine how we split it.
  isEven = (len(text) % 2) < 1

  # math.floor makes absolutely sure that "halfway" is an integer
  halfway = math.floor(len(text) / 2)
  firstHalf = text[0:halfway]
  lastHalf = None # define this in the if below

  if isEven:
    # text splits evenly in half
    lastHalf = text[halfway:len(text)]
  else:
    # text has one character in the middle
    # we can ignore the character, but the last half
    # will need to be moved over one character
    lastHalf = text[(halfway + 1):len(text)]
  
  # Now we reverse the last half
  lastHalf = lastHalf[::-1]

  # Finally, return whether this is a palindrome or not
  return firstHalf == lastHalf

while True:
  print("Please enter a word or phrase:")
  text = input()
  if (detectPalindrome(text)):
    print(text + " is a palindrome!")
  else:
    print(text + " is not a palindrome.")