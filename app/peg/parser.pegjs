{

  // globals:
  const gverbs = ["go", "walk", "talk", "get", "use", "open", "close", "unlock", "lock"];
  const gdirections = ["north", "east", "south", "west", "up", "down", "left", "right", "forward", "backward"];
  const gnouns = ["door", "house", "window", "key", "knife", "wrench", "hammer"];

  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }


}

wordtypes
 = w:words*
{
  var verbs = [];
  var nouns = [];
  var directions = [];
  var misc = [];

  for (var i = 0; i < w.length; i++) {
    if (isInArray(w[i], gverbs)) verbs.push(w[i]);
    else if (isInArray(w[i], gnouns)) nouns.push(w[i]);
    else if (isInArray(w[i], gdirections)) directions.push(w[i]);
    else (misc.push(w[i]));
  }
  return {verbs:verbs, nouns:nouns, directions:directions, misc:misc};
}
 
words
 = w:word
 {
 { return w; }
 }

word
 = l:letter+ _?
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

_ "One or more whitespaces"
 = ws+
 