# Adventex
Adventex is a simple interactive fiction (text adventure) game with its own adventure system. The adventure is defined by a couple of json files.

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

## Startup
You can start adventex locally with
`gulp serve`

Look into the gulp file `gulpfile.js` for other targets. If you want to deploy adventex to a server you can build it using this command:
`gulp build`

The files in the folder `dist` can be served by any web server (like Apache or nginx).
