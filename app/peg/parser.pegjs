Start
 = predicate*
 
predicate
 = w:word
 {
 var type='other';
 if (	w=='go'||
 	 	w=='open'||
        w=='close'
 	) type = 'predicate';
 return {'type':type,'value':w};
 }

list
 = word *

word
 = l:letter+ _?
 { return l.join(""); }

number
 = [0-9]

letter
 = [a-zA-Z]

nl "New line"
 = "\n"

ws "Whitespace"
 = [ \t]

_ "One or more whitespaces"
 = ws+