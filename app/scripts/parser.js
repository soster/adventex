'use strict';

var advntx = (function (my) {
    var l_verbs;
    var l_directions;
    var l_prepositions;
    var l_adjectives;
    var l_objects;
    var l_simple_objects = [];
    var l_simple_object_map = [];

    my.parser = {
        set: function(verbs, directions, prepositions, adjectives, objects) {
            l_verbs = verbs;
            l_directions = directions;
            l_prepositions = prepositions;
            l_adjectives = adjectives;
            l_objects = objects;
            for (var i=0;i<objects.length;i++) {
                var words = objects[i].split(/[ ,]+/).filter(Boolean);
                if (words.length>1) {
                    var obj = l_simple_objects[words[words.length-1]];
                    if (obj == undefined) {
                        l_simple_objects.push(words[words.length-1]);
                        l_simple_object_map[words[words.length-1]] = [];
                    } 
                    l_simple_object_map[words[words.length-1]].push(objects[i]);
                }
            }
        
        },

        parse: function (command) {
            var words = command.split(/[ ,]+/).filter(Boolean);
            var verbs = [];
            var directions = [];
            var prepositions = [];
            var adjectives = [];
            var misc = [];
            var objects = [];
            for (var i = 0; i < words.length; i++) {
                var word_consumed = false;
                if (this.isInArray(words[i], l_verbs)) {
                    verbs.push(words[i]);
                    word_consumed = true;
                } else {

                    if (this.isInArray(words[i], l_directions)) {
                        directions.push(words[i]);
                        word_consumed = true;
                    }
                    if (this.isInArray(words[i], l_prepositions)) {
                        prepositions.push(words[i]);
                        word_consumed = true;
                    }
                    if (this.isInArray(words[i], l_adjectives)) {
                        adjectives.push(words[i]);
                        word_consumed = true;
                    }
                    if (this.isInArray(words[i], l_objects)) {
                        objects.push(words[i]);
                        word_consumed = true;
                    } else if (words.length>i+1 && this.isInArray(words[i]+' '+words[i+1],l_objects)) {
                        //special case: 2 word objects.
                        objects.push(words[i]+' '+words[i+1]);
                        i++;
                        word_consumed = true;
                    }
                    if (! word_consumed && this.isInArray(words[i],l_simple_objects)) {
                        var object_array = l_simple_object_map[words[i]];
                        for (var i2=0;i2<object_array.length;i2++) {
                            objects.push(object_array[i2]);
                        }
                        
                        word_consumed = true;
                    }

                }
                if (!word_consumed) {
                    misc.push(words[i])
                }
              }
              return {verbs:verbs, prepositions:prepositions, directions:directions, adjectives:adjectives, objects:objects, misc:misc};
            
        },

        isInArray: function(value, array) {
            return array.indexOf(value) > -1;
          }


    } 

    return my;
}(advntx||{}));