var Interpreter = {
    interpret : function(command) {
      var original = command;
      command = command.toLowerCase();
      if (command=='help') {
        return MESSAGE.console.help;
      } else if (command.startsWith('my name is ')) {
        var name = original.substr(11);
        return 'Your name is '+name;
      } else {
        var words = parser.parse(command);
        var retVal = "Nouns: "+words["nouns"];
        retVal +="\nVerbs: "+words["verbs"];
        retVal +="\nDirections: "+words["directions"];
        retVal +="\nMisc: "+words["misc"];

        return retVal;
      }
      
      return MESSAGE.console.error.format(original);
  }
}