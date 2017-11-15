


export default class Parser {
    constructor(verbs, directions, prepositions, adjectives, objectNames, objects) {
        this.l_verbs = verbs;
        this.l_directions = directions;
        this.l_prepositions = prepositions;
        this.l_adjectives = adjectives;
        this.l_objectNames = objectNames;
        this.l_objects = objects;
        this.l_simple_objects = [];
        this.l_simple_object_map = [];
        for (var i = 0; i < objectNames.length; i++) {
            var words = objectNames[i].split(/[ ,]+/).filter(Boolean);
            if (words.length > 1) {
                var obj = this.l_simple_objects[words[words.length - 1]];
                if (obj == undefined) {
                    this.l_simple_objects.push(words[words.length - 1]);
                    this.l_simple_object_map[words[words.length - 1]] = [];
                }
                this.l_simple_object_map[words[words.length - 1]].push(objectNames[i]);
            }
        }
    }

    parse(command) {
        var words = command.split(/[ ,]+/).filter(Boolean);
        var verbs = [];
        var directions = [];
        var prepositions = [];
        var adjectives = [];
        var misc = [];
        var objects = [];
        
        for (var i = 0; i < words.length; i++) {
            var word_consumed = false;
            if (this.isInArray(words[i], this.l_verbs)) {
                verbs.push(words[i]);
                word_consumed = true;
            } else {

                if (this.isInArray(words[i], this.l_directions)) {
                    directions.push(words[i]);
                    word_consumed = true;
                }
                if (this.isInArray(words[i], this.l_prepositions)) {
                    prepositions.push(words[i]);
                    word_consumed = true;
                }
                if (this.isInArray(words[i], this.l_adjectives)) {
                    adjectives.push(words[i]);
                    word_consumed = true;
                }
                if (this.isInArray(words[i], this.l_objectNames)) {
                    objects.push(words[i]);
                    word_consumed = true;
                } else if (words.length > i + 1 && this.isInArray(words[i] + ' ' + words[i + 1], this.l_objectNames)) {
                    //special case: 2 word objects.
                    objects.push(words[i] + ' ' + words[i + 1]);
                    i++;
                    word_consumed = true;
                } else {
                    for (var property in this.l_objects) {
                        var obj = this.l_objects[property];
                        if (obj.synonyms != undefined) {
                            if (this.isInArray(words[i],obj.synonyms)) {
                                objects.push(obj.name);
                                word_consumed = true;
                            }
                        }
                    }
                }

                if (!word_consumed && this.isInArray(words[i], this.l_simple_objects)) {
                    var object_array = this.l_simple_object_map[words[i]];
                    for (var i2 = 0; i2 < object_array.length; i2++) {
                        objects.push(object_array[i2]);
                    }

                    word_consumed = true;
                }

            }
            if (!word_consumed) {
                misc.push(words[i])
            }
        }
        return { verbs: verbs, prepositions: prepositions, directions: directions, adjectives: adjectives, objects: objects, misc: misc };

    }

    isInArray(value, array) {
        return array.indexOf(value) > -1;
    }


} 
