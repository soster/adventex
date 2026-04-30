


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
        for (let i = 0; i < objectNames.length; i++) {
            const words = objectNames[i].split(/[ ,]+/).filter(Boolean);
            if (words.length > 1) {
                const obj = this.l_simple_objects[words[words.length - 1]];
                if (obj == undefined) {
                    this.l_simple_objects.push(words[words.length - 1]);
                    this.l_simple_object_map[words[words.length - 1]] = [];
                }
                this.l_simple_object_map[words[words.length - 1]].push(objectNames[i]);
            }
        }
    }

    parse(command) {
        const words = command.split(/[ ,]+/).filter(Boolean);
        const verbs = [];
        const directions = [];
        const prepositions = [];
        const adjectives = [];
        const objects = [];
        const misc = [];
        
        for (let i = 0; i < words.length; i++) {
            let word_consumed = false;
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
                    for (const property in this.l_objects) {
                        const obj = this.l_objects[property];
                        if (obj.synonyms != undefined) {
                            if (this.isInArray(words[i],obj.synonyms)) {
                                objects.push(obj.name);
                                word_consumed = true;
                            }
                        }
                    }
                }

                if (!word_consumed && this.isInArray(words[i], this.l_simple_objects)) {
                    const object_array = this.l_simple_object_map[words[i]];
                    for (let i2 = 0; i2 < object_array.length; i2++) {
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
        for (let i=0;i<array.length;i++) {
            if (stringEquals(array[i],value)) {
                return true;
            }
        }
        return false;
    }


} 
