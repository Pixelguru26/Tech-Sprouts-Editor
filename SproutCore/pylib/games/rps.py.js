export default `
# This is a demo script, it should be pasted into the editor directly.

"""
This is the section for importing the libraries we will use for this project.
Random is a library we have used before.
"""
import random

"""
These are the entities we will be using as buttons.
Before we can modify them, they have to be created.
"""
rockButtonEntity = game.entity()
paperButtonEntity = game.entity()
scissorsButtonEntity = game.entity()

# Set up the buttons for the user's options
"""
Here we set up the options for each of the buttons.
The x and y variables are the position of the button center.
The r variable is the radius of the circle where the button
will detect clicks.
"""
rockButtonEntity.sprite = game.asset.getAsset("rock")
paperButtonEntity.sprite = game.asset.getAsset("paper")
scissorsButtonEntity.sprite = game.asset.getAsset("scissors")
rockButtonEntity.x = 100
rockButtonEntity.y = 100
rockButtonEntity.r = 50
paperButtonEntity.x = 100
paperButtonEntity.y = 300
paperButtonEntity.r = 50
scissorsButtonEntity.x = 100
scissorsButtonEntity.y = 500
scissorsButtonEntity.r = 50

"""
Now that the buttons are created, we can add them to the game.
Entities don't do anything until they're added to the game world,
to ensure they're completely set up before anything happens to them.
"""
game.world.addEntity(rockButtonEntity)
game.world.addEntity(paperButtonEntity)
game.world.addEntity(scissorsButtonEntity)

"""
Here we set up the display for the computer's choice.
Like the buttons, it is an entity so that it can be displayed on the screen.
It will be added later when the user actually makes a choice.
"""
computerOutputEntity = game.entity()
computerOutputEntity.x = 700
computerOutputEntity.y = 300

"""
The last entity we will add is a simple solid-color rectangle to separate
the user's options and the computer's choice.
SproutCore provides the UIEntity utility to make this easy.
"""
block = game.entity.UIEntity(400, 0, 550, 600, "#272822")
game.world.addEntity(block)

"""
This function runs whenever the user clicks on an entity, like a button.
Here is where we will perform all the logic and check who wins each round.
"""
def entityClick(entity, button, x, y):
    """
    Here we read the user's choice.
    """
    # This variable will store the user's choice. For now, it's unknown.
    userChoice = "unknown"

    # Read the user's choice, or stop the function if there isn't one
    if (entity.unitid == rockButtonEntity.unitid):
        # The user picked rock
        userChoice = "rock"
        print("You chose to rock on!")
    elif (entity.unitid == paperButtonEntity.unitid):
        # The user picked paper
        userChoice = "paper"
        print("You chose paper, fair and square!")
    elif (entity.unitid == scissorsButtonEntity.unitid):
        # The user picked scissors
        userChoice = "scissors"
        print("You chose scissors, real snippy!")
    else:
        # User must have just clicked some other entity like the divider
        # In that case, we don't want to do anything,
        # so we just use return to end the function early.
        return
    
    """
    Now the computer can make a choice and display it.
    """
    # randChoice can be any decimal between 0 and 3
    randChoice = random.uniform(0, 3)
    computerChoice = "unknown"

    # Check each third of the range one at a time
    # Doing this in reverse order so that ranges don't overlap
    if randChoice > 2:
        computerChoice = "scissors"
    elif randChoice > 1:
        computerChoice = "paper"
    else:
        computerChoice = "rock"
    
    # Display the computer's choice
    computerOutputEntity.sprite = game.asset.getAsset(computerChoice)
    game.world.addEntity(computerOutputEntity) # In case this is the first match
    print("Computer chose " + computerChoice + "!")
    
    """
    Finally, we check who won the match and tell the user
    via the console.
    """
    # Display results of the match
    if userChoice == computerChoice:
        print("It's a draw!")
    elif userChoice == "rock":
        # Computer must not have chosen rock
        if computerChoice == "paper":
            print("Computer wins!")
        else:
            # Computer must have chosen scissors
            print("You win!")
    elif userChoice == "paper":
        # Computer must not have chosen paper
        if computerChoice == "rock":
            print("You win!")
        else:
            # Computer must have chosen scissors
            print("Computer wins!")
    else:
        # User must have chosen scissors
        # Computer must not have chosen scissors
        if computerChoice == "rock":
            print("Computer wins!")
        else:
            # Computer must have chosen paper
            print("You win!")

`;