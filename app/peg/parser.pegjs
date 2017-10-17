{

  // globals:
  const g_verbs = ["go", "walk", "talk", "get", "use", "open", "close", "unlock", "lock", "catch", "switch", "examine"];
  const g_directions = ["north", "east", "south", "west", "up", "down", "left", "right", "forward", "backward"];
  const g_things = ["door", "house", "window", "key", "knife", "wrench", "hammer", "vase", "tapestry", "marble floor"];
  const g_persons = ["man", "woman", "boy", "girl", "sam", "max"];
  const g_prepositions = ["from", "to", "by", "for", "on", "at", "in", "out", "into", "onto", "over", "under", "through"];


  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }


}

wordtypes
 = w:words*
{
  var verbs = [];
  var things = [];
  var directions = [];
  var persons = [];
  var prepositions = [];
  var misc = [];


  for (var i = 0; i < w.length; i++) {
    if (isInArray(w[i], g_verbs)) verbs.push(w[i]);
    else if (isInArray(w[i], g_persons)) persons.push(w[i]);
    else if (isInArray(w[i], g_things)) things.push(w[i]);
    else if (isInArray(w[i], g_directions)) directions.push(w[i]);
    else if (isInArray(w[i], g_prepositions)) prepositions.push(w[i]);
    else (misc.push(w[i]));
  }
  return {verbs:verbs, things:things, persons:persons, prepositions:prepositions,directions:directions, misc:misc};
}

words
 = w:word
 {
 { return w; }
 }

word
 = l:letter+ _? punctuation?
 { return l.join(""); }

number
 = n:numeric+ _?
 { return n.join(""); }

numeric
 = [0-9]

letter
 = [a-zA-Z]

nl "New line"
 = "\n"

ws "Whitespace"
 = [ \t]

 punctuation "One or more punctuations"
 = [\.\?\!\,]+

_ "One or more whitespaces"
 = ws+
 