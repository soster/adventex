# Adventex

Adventex is a simple interactive fiction (text adventure) game with its own adventure system. The adventure is defined by a couple of JSON files. The game is playable at [thoster.net](https://thoster.net/adventex).

It starts with a demo adventure (kind of an escape room game) and a tutorial.

![](screenshot.png)

## Prerequisites

You need Node.js and npm.

## Install

First, you need to install the npm dependencies:
```bash
npm install
```

## Run

You can serve Adventex locally:
```bash
npm run serve
```

or build it with:
```bash
npm run build
```

## Unit Tests

Unit tests only work with a real browser. Start them like this:
```bash
npm run serve-tests
```

## Playing

If you want to learn how to play text adventures, go to "options" and hit "tutorial". This is what you get if you enter *help*:

Most of the time, typing something like *verb object* works. Example: *open door*.

You can go to a possible direction typing *go (direction)*.

You can examine the room or any object typing *examine (object)*. Look around with *look*.

More complex sentences are possible, example: *open box with crowbar*.

Type *inventory* to show all your collected items.

Type *help verbs* to get a list of possible verbs.

## Adventure Creation

Adventures in Adventex are created / edited using JSON files. Below is a detailed explanation of how to set up an adventure.

There are multiple json files, the most important is the `gamestate.json` which describes events, locations and objects.

### Objects

Objects have states, effects, and interactive behaviors. They can change based on player actions.

```json
{
  "objects": {
    "trap_door": {
      "name": "trap door",
      "description": "A hidden trap door.",
      "portable": false,
      "states": {
        "closed": {
          "description": "The trap door is closed.",
          "hidden": true
        },
        "open": {
          "description": "The trap door is open.",
          "connections": {
            "down": "lower_cell"
          }
        }
      }
    },
    "torch": {
      "name": "torch",
      "description": "A burning torch.",
      "portable": true,
      "states": {
        "burning": {
          "effect": "fire",
          "description": "The torch emits bright light."
        }
      }
    }
  }
}
```

### Events

Events define the actions and descriptions of different events in the adventure, such as starting the game or interacting with objects. The first event in every adventure is called `start_event`.

```json
{
    "events": {
        "start_event": {
            "name": "Awake",
            "description": "Welcome to the Adventex tutorial!\nAdventex is a simple text adventure (also called 'interactive fiction').\nYou can:\nExplore different locations, pick up items (into your 'inventory') and interact with objects and the environment to solve puzzles.\nYou interact with your environment by entering simple sentences, starting with a verb.\nFor a list of possible verbs, enter 'help verbs'.\nOften it is useful to examine objects: 'examine table'. If you want to see the description of the current location, enter 'look'.\nSome objects are portable, to pick up a book, enter 'take book'\nStart with exploring your environment by visiting the other room. To do so, enter 'go east'\n",
            "action_move_to_location": "start_location"
        },
        "tutorial_openclose": {
            "name": "Open/Close Tutorial",
            "description": "You can open and close doors and containers. Try 'open door' or 'close chest'.",
            "action_move_to_location": "next_location"
        }
    }
}
```

### Locations

Locations define the different places in the adventure, including their descriptions and possible exits.

```json
{
    "locations": {
        "start_location": {
            "name": "Starting Room",
            "description": "You are in a small, dimly lit room. There is a door to the east.",
            "connections": {
                "east": "next_location"
            },
            "objects": ["book", "table"]
        },
        "next_location": {
            "name": "Next Room",
            "description": "You are in a larger room with a window. There is a door to the west.",
            "connections": {
                "west": "start_location"
            },
            "objects": ["chest", "window"]
        }
    }
}
```

**Important:** Location descriptions must mention direction words (north, south, east, west, etc.) for each exit. The engine replaces these words with clickable links in the terminal UI. Without them, players can't see available exits. The `connections` field defines the actual navigation, while the description provides the visible clickable links.
```

### Verbs

Verbs define the actions that players can perform in the game. They are used to interact with objects and the environment.

#### Example: `src/games/tutorial/verbs.json`

```json
{
    "verbs": {
        "go": {
            "description": "Move to a different location.",
            "action": "move_to_location"
        },
        "take": {
            "description": "Pick up an item.",
            "action": "pick_up_item"
        },
        "examine": {
            "description": "Look at an object or location.",
            "action": "examine_object"
        },
        "look": {
            "description": "Look around the current location.",
            "action": "look_around"
        },
        "open": {
            "description": "Open a door or container.",
            "action": "open_object"
        },
        "close": {
            "description": "Close a door or container.",
            "action": "close_object"
        }
    }
}
```

### Synonyms

Synonyms allow players to use different words for the same action, making the game more flexible and user-friendly.

#### Example: `src/games/tutorial/synonyms.json`

```json
{
    "synonyms": {
        "take": [
            "get",
            "pick"
        ],
        "go": [
            "walk",
            "drive",
            "climb"
        ],
        "look": [
            "watch"
        ],
        "push": [
            "press"
        ],
        "extinguish": [
            "delete"
        ],
        "clean": [
            "wash"
        ],
        "into": [
            "inside"
        ]
    }
}
```
By configuring these JSON files, you can create and customize your own text adventures in Adventex.

If you need any additional details or modifications, feel free to ask!