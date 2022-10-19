# Adventex
Adventex is a simple interactive fiction (text adventure) game with its own adventure system. The adventure is defined by a couple of json files. The game is accessible at [thoster.net](https://thoster.net/adventex).

It starts with a demo adventure (kind of an escape room game) and a tutorial.

## Prerequisites
You need node.js and npm

## Install
First you need to install the npm dependencies:
`npm install`

jspm and it's module loader system.js is needed as well:
`npm install jspm -g`

After installing jspm you can initialize the jspm dependencies:
`jspm install`

Now you need to install gulp:
`npm install gulp-cli -g`

## Unit Tests
Unit tests only work with a real browser. Start them like this:
`gulp serve:tests`

## Startup
You can start adventex locally with
`gulp serve`

Look into the gulp file `gulpfile.js` for other targets. If you want to deploy adventex to a server you can build it using this command:
`gulp build`

The files in the folder `dist` can be served by any web server (like Apache or nginx).

## Playing
If you want to learn playing text adventures, go to "options" and hit "tutorial". This is what you get if you enter *help*:

Most of the time, typing something like *verb object* works. Example: *open door*.

You can go to a possible direction typing *go (direction)*.

You can examine the room or any object typing *examine (object)*. Look around with *look*. More complex sentences are possible, example: *open box with crowbar*.

Type *help verbs* to get a list of possible verbs.