{

  // globals:
  const g_verbs = advntx.vocabulary.verbs;
  const g_directions = advntx.vocabulary.directions;
  const g_prepositions = advntx.vocabulary.prepositions;
  const g_adjectives = advntx.vocabulary.adjectives;




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
  var adjectives = [];
  var misc = [];


  for (var i = 0; i < w.length; i++) {
    if (isInArray(w[i], g_verbs)) verbs.push(w[i]);
    else if (isInArray(w[i], g_directions)) directions.push(w[i]);
    else if (isInArray(w[i], g_prepositions)) prepositions.push(w[i]);
    else if (isInArray(w[i], g_adjectives)) adjectives.push(w[i]);
    else (misc.push(w[i]));
  }
  return {verbs:verbs, prepositions:prepositions, directions:directions, adjectives:adjectives, misc:misc};
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
 