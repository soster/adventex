{

  // globals:
  const g_verbs = ['go', 'walk', 'talk', 'give', 'take', 'get', 
    'use', 'climb', 'open', 'close', 'push', 'pull', 'unlock', 'lock', 'catch', 'switch', 'examine', 'look', 'fetch', 'pick', 'read', 'run', 'search', 'conjure', 'bribe', 'kindle', 'light'];
  const g_directions = ['north', 'east', 'south', 'west', 'up', 
    'down', 'left', 'right', 'forward', 'backward', 'away'];
  const g_prepositions = ['from', 'to', 'with', 'around', 'by', 'across', 
    'for', 'on', 'off', 'at', 'in', 'out', 'into', 'onto', 'over', 'under', 'through'];


  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }


}

wordtypes
 = w:words*
{
  var verbs = [];
  var directions = [];
  var prepositions = [];
  var misc = [];


  for (var i = 0; i < w.length; i++) {
    if (isInArray(w[i], g_verbs)) verbs.push(w[i]);
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
 