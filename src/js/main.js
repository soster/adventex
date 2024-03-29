import Parser from './parser.js';
import { default as parseJson } from './json.js';
import {
  checkSynonyms,
  findFirstMatch,
  findItemIds,
  findItemIdsForName,
  getDescription,
  getFirstOfType,
  getLastOfType,
  getName,
  getOfType,
  getProperty,
  getSecondOfType,
  isHidden,
  listFormattedObjects,
  setStateOfObject,
  getObjectNameArray,
  getJSON,
  removeTargetFromLinks
} from './helper.js'

import InventoryHandler from './inventoryhandler.js'
import LocationHandler from './locationhandler.js'
import EventHandler from './eventhandler.js'
import Interpreter from './interpreter.js'





/**
 * Set advntx as global variable. 
 * window is needed because of system.js.
 */
 window.advntx = {
  
  echo(text, color, clazz, bold) {
    if (color != undefined || clazz != undefined || bold != undefined) {
      if (clazz === undefined) {
        clazz = '';
      }
      if (color === undefined) {
        color = '';
      }
      var formatting = '';
      if (bold) {
        formatting = 'b';
      }
      text = '[[' + formatting + ';' + color + ';;' + clazz + ']' + text + ']';
    }

    var old_prompt = advntx.term.get_prompt();
    var less = true;
    var cols = advntx.term.cols();
    var rows = advntx.term.rows()-2;
    var lines = text.split('\n');
    var numLines = lines.length;
    for (var i=0;i<lines.length;i++) {
      var textWithoutFormatting = $.terminal.strip(lines[i])
      numLines += Math.floor(textWithoutFormatting.length/(cols+1));
    }

    // if number of lines to big, stop after some lines to display "press any key":
    if (numLines >= rows) {
      var pos = 0;
      var left = 0;
      advntx.waitForKey = true;
      function print() {
        var to_print = [];
        var numOfLines = 0;
        var origLinesPrinted = 0;
        for (var i=pos;i<lines.length;i++) {
          numOfLines++;
          var textWithoutFormatting = $.terminal.strip(lines[i])
          numOfLines += Math.floor(textWithoutFormatting.length/(cols+1));
          origLinesPrinted+=1;
          to_print.push(lines[i]);
          if (numOfLines>=rows) {
            break;
          }
        }
        pos+=origLinesPrinted;
        advntx.term.echo(to_print.join('\n'), {
          keepWords: true
        });
      }

      print();

      advntx.term.push($.noop, {
        keydown: function (e) {
          print();
          if (pos >= lines.length) {
            advntx.term.pop();
            advntx.term.set_prompt(old_prompt);
            advntx.waitForKey = false;
            removeTargetFromLinks();
            return false;
          }

        }
      });

      advntx.term.set_prompt(advntx.messages.info_press_key);

    } else {
      advntx.term.echo(text, {
        keepWords: true
      });
    }
    removeTargetFromLinks();

  },

  formatHeadline(text) {
    var lines = text.split('\n');
    for (var i=0;i<lines.length;i++) {
      lines[i] = lines[i].replace('\n','');
      lines[i] = '[[;;;headline]' + lines[i] + ']';
    }
    return lines.join('\n');
  },

  describeLocationEcho(locationId, alwaysShowFullDescription, preEventText, postEventText) {
    var loc = advntx.locationHandler.getLocationById(locationId);
    var name = getName(advntx.state.locations, locationId);
    var headline = '';
    var description = '';
    var image = 'fallback.png';

    if (!advntx.locationHandler.visited(locationId) || alwaysShowFullDescription) {
      headline = advntx.formatHeadline(name);
      description = advntx.locationHandler.getLocationDescription(locationId);
      image = advntx.currentGame+'/'+advntx.locationHandler.getLocationImage(locationId);
      // loop through possible directions:
      for (var key in loc.connections) {
        var direction = key;
        description = description.replace(direction, '[[!;;;;javascript:advntx.terminalLink(\' ' + direction + ' \');]' + direction + ']');
      }
    }
    var prompt = name + '>';
    advntx.term.set_prompt('[[b;;]' + prompt + ']');

    var objects = advntx.locationHandler.getItemIdsFromLocation(advntx.state.locations[locationId]);
    var message = advntx.messages.info_you_see;
    var objectsMessage = listFormattedObjects(objects, advntx.state.objects, advntx.inventoryHandler);

    var text = '';

    if (!isEmpty(preEventText)) {
      text = preEventText+'\n';
    }
    text += headline+'\n'+description+'\n';


    if (!isEmpty(objectsMessage)) {
      text+=message+'\n'+objectsMessage;
    } else {
      text+=advntx.messages.info_you_see_nothing;
    }

    if (!isEmpty(postEventText)) {
      text+=postEventText;
    }

    advntx.echo(text);

    if (!isEmpty(image)) {
      document.getElementById("imagecontainer").src=image;
    }


  },

  addToInventoryEcho(item) {
    advntx.inventoryHandler.addToInventory(item);
    advntx.initInventory();
  },


  initGame(refreshJson, gameId) {
    // version string, add to json calls to avoid browser caching:
    advntx.version = g_ver;

    getJSON('games/games.json', function (result) {
      advntx.games = result;
      $('#game_buttons').children().remove();
      for (var key in advntx.games) {
        if (key == 'default') {
          continue;
        }
        var $button = $('<button type="button" class="btn btn-secondary btn-sm" id="btn_escape" onclick="advntx.initGame(true,\'' + key + '\');">' + advntx.games[key].name + '</button>');
        var $space = $('<span>&nbsp;</span>');
        $button.appendTo($('#game_buttons'));
        $space.appendTo($('#game_buttons'));
      }

      if (isEmpty(gameId)) {
        gameId = result.default;
      }
      advntx.gameId = gameId;
      advntx.currentGame = 'games/' + result[gameId].path;
      if (advntx.term != undefined) {
        advntx.term.clear();
      }


      if (refreshJson == true) {
        parseJson(advntx.initGameAsync, advntx);
      } else {
        advntx.initGameAsync(false);
      }

    });
    removeTargetFromLinks();
  },

  terminalLink(name) {
    advntx.term.insert(name);
    advntx.asyncRefocusTerminal();
  },

  executeLink(name) {
    advntx.term.exec(name);
    advntx.asyncRefocusTerminal();
  },

  executeCurrent() {
    if (advntx.waitForKey) {
      // simulate backspace key:
      var e = $.Event('keydown', { keyCode: 8});
      advntx.term.trigger(e);
    } else {
      advntx.term.exec(advntx.term.get_command());
      advntx.term.set_command('');
    }
    advntx.asyncRefocusTerminal();
  },

  load(name) {
    var retrievedObject = localStorage.getItem('advntx' + name);
    if (retrievedObject != undefined) {
      advntx.state = JSON.parse(retrievedObject);
      advntx.echo(advntx.messages.info_game_loaded.format(name));
      advntx.term.exec('clear');
      advntx.initGame(false);
    }
  },

  save(name) {
    localStorage.setItem('advntx' + name, JSON.stringify(advntx.state));
    advntx.echo(advntx.messages.info_game_saved.format(name));
    advntx.initInventory();
    advntx.asyncRefocusTerminal();
  },

  listSavegames() {
    for (var i in localStorage) {
      if (i.startsWith('advntx')) {
        var name = i.replace('advntx', '');
        var link = name;
        if (isEmpty(name)) {
          name = 'default';
        }
        advntx.echo('[[!;;;;javascript:advntx.terminalLink(\'load ' + link + '\');]' + name + ']');
      }
    }
  },

  initGameAsync(reset) {

    if (advntx.term === undefined) {
      advntx.term = $('#terminal').terminal(function (command) {
        var echo = advntx.echo;

        advntx.interpreter.interpret(command, advntx.describeLocationEcho, advntx.initInventory, advntx.echo, advntx.initGame, advntx.load, advntx.save, advntx.listSavegames);
      }, {
          greetings: '',
          name: advntx.messages.name,
          prompt: advntx.config.console.prompt,
          height: advntx.config.console.height,
          anyLinks: true,
          completion: advntx.vocabulary.verbs.concat(advntx.vocabulary.directions).concat(advntx.vocabulary.prepositions).concat(getObjectNameArray(advntx.state.objects))
        });
    }


    $('#inventory_container').css('max-height', advntx.config.console.height + 'px');

    advntx.parser = new Parser(advntx.vocabulary.verbs, advntx.vocabulary.directions, advntx.vocabulary.prepositions,
      advntx.vocabulary.adjectives, advntx.vocabulary.objects, advntx.state.objects);
    advntx.inventoryHandler = new InventoryHandler(advntx.state, advntx.initInventory);
    advntx.interpreter = new Interpreter(advntx);
    advntx.locationHandler = new LocationHandler(advntx.state);
    advntx.eventHandler = new EventHandler(advntx.state, advntx.vocabulary, advntx.initInventory);



    if (advntx.htmlInitialized === undefined) {
      $('textarea.clipboard').attr('autocomplete', 'off');
      $('textarea.clipboard').attr('autocorrect', 'off');
      $('textarea.clipboard').attr('autocapitalize', 'off');
      $('textarea.clipboard').attr('spellcheck', 'off');
      $('#options').toggle();

      // set color scheme for terminal:
      $('#terminal').toggleClass('termcolor');
      $('.cmd').toggleClass('termcolor');
      advntx.htmlInitialized = true;
    }

    var text = advntx.formatHeadline(advntx.messages.greetings.format(advntx.version))+'\n';
    advntx.initInventory();
    if (reset) {
      var startEvent = advntx.state.events['start_event'];
      advntx.eventHandler.executeEvent(startEvent, function(eventText) {
        text += eventText;
      });
      advntx.echo(text);
    }

    setTimeout(function () {
            advntx.describeLocationEcho(advntx.state.location,false,undefined,undefined);
        },1500);
  

    


    removeTargetFromLinks();
    advntx.asyncRefocusTerminal();
  },

  toggleTerminalColors() {
    $('#terminal').toggleClass('termcolor');
    $('.cmd').toggleClass('termcolor');
    $('#terminal').toggleClass('inverted');
    $('.cmd').toggleClass('inverted');
    advntx.asyncRefocusTerminal();
  },

  refocusTerminal() {
    advntx.term.focus();
    removeTargetFromLinks();
  },

  asyncRefocusTerminal() {
    window.setTimeout('advntx.refocusTerminal();', 250);
  },

  inventoryClick(item) {
    advntx.term.insert(' ' + item + ' ');
    advntx.asyncRefocusTerminal();
  },

  initInventory() {
    $('#inventory > .inventory_item').remove();
    if (advntx.state.inventory.length == 0) {
      $('#inventory').append('<p class="inventory_item">' + advntx.messages.info_inventory_empty + '</p>');
    }
    for (var i = 0; i < advntx.state.inventory.length; i++) {
      var item = advntx.state.inventory[i];
      var itemName = getName(advntx.state.objects, item);
      var stateString = ' ' + advntx.inventoryHandler.getStateString(item);
      $('#inventory').append('<p class="inventory_item"><button type="button" onclick="advntx.inventoryClick(\'' + itemName + '\')" class="btn btn-secondary btn-sm inventory_button">' + itemName + stateString + '</button></p>');
    }
  }

};

window.periodicUpdates = function periodicUpdates() {
  advntx.state.seconds++;
  $('#time_element').text(advntx.state.seconds);
}


/** Global Initializations */
$(document).ready(function () {
  $('#btn_help').click(function () {
    advntx.term.exec(advntx.messages.verb_help, false);
    advntx.initInventory();
    advntx.asyncRefocusTerminal();
  });

  $('#btn_load_storage').click(function () {
    advntx.echo(advntx.messages.info_enter_savegame_name);
    advntx.term.insert(advntx.messages.verb_load + ' ');
  });

  $('#btn_list_storage').click(function () {
    advntx.term.exec(advntx.messages.verb_list);
    advntx.asyncRefocusTerminal();
  });

  $('#btn_save_storage').click(function () {
    advntx.echo(advntx.messages.info_enter_savegame_name);
    advntx.term.insert(advntx.messages.verb_save + ' ');
  });

  $('#btn_load_file').click(function () {
    var files = document.getElementById('selectFiles').files;
    if (files===undefined || files.length <= 0) {
      return false;
    }
    
    var fr = new FileReader();

    fr.onload = function(e) { 
      console.log(e);
        var result = JSON.parse(e.target.result);
        advntx.state = result;
        advntx.term.exec('clear');
        advntx.initGame(false);
    }

    fr.readAsText(files.item(0));

  });

  $('#btn_save_file').click(function() {    
    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(advntx.state, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href',     dataStr);
    var date = new Date();
		var df = date.getMonth()+'-'+date.getDate()+'-'+date.getYear()+' '+(date.getHours()+1)+'_'+date.getMinutes();
    downloadAnchorNode.setAttribute('download', 'advntx_' + df + '.json');
    
    document.body.appendChild(downloadAnchorNode);
    
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

  });

  $('#btn_restart').click(function () {
    advntx.initGame(true,advntx.gameId);

  });



  window.setInterval('window.periodicUpdates()', 1000);
  advntx.initGame(true);
});

