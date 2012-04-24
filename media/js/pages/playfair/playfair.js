var g_alphaArray = []; //0 -> a, in order, complete
var g_alphaHash = []; //a -> 0, in order, i and j both to 8, z -> 24
var g_alphaHashRev = []; //0 -> a, in order, 8 goes to i, 24 -> z
var g_keyHash = [];
var g_keyStack = [];
var g_keySet = false;
 
function init() {
    var count = 0;
       
    for(var i = 65; i < 91; i++) {
        var letter = String.fromCharCode(i);
       
        g_alphaArray.push(letter);
       
        if(letter != 'J') {
            g_alphaHashRev[count] = letter;
            g_alphaHash[letter] = count++;
        }
        else {
            g_alphaHash[letter] = --count;
            count++;
        }
    }
}
 
function createPlayFairGrid(input) {
    if(g_keySet) {
        return;
    }
    var i = 0;
    var locale = -1;
    var offset = 0;
    var keyStack = [];
   
    input = input.toUpperCase();
    input = input.replace("J", "I");
   
    for(var c = 0; c < input.length; ++c) {
        locale = g_alphaArray.indexOf(input[c]);
       
        if(locale >= 0) {
            g_alphaArray.splice(locale, 1);
           
            if(input[c] == 'J') {
                var iLocale = g_keyHash['I']
 
                if(iLocale) {
                    g_keyHash[input[c]] = iLocale;
                    continue;
                }
            }
            else if(input[c] == 'I') {
                var jLocale = g_keyHash['J'];
               
                if(jLocale) {
                    g_keyHash[input[c]] = jLocale;
                    continue;
                }
            }
            g_keyHash[input[c]] = i++;
            g_keyStack.push(g_alphaHash[input[c]]);
        }
    }
   
    uiSetKey(g_keyStack);
   
    for(var c = 0; c < g_alphaArray.length; ++c) {
        if(g_alphaArray[c] != "J") {
            g_keyHash[g_alphaArray[c]] = i++;
            g_keyStack.push(g_alphaHash[g_alphaArray[c]]);
        }      
    }
   
    g_keySet = true;
   
    trace(g_keyStack);
}
 
function beginCipher(input) {
    if(!g_keySet) {
        createPlayFairGrid("");
    }  
   
    input = input.toUpperCase();
    trace(input);
   
    var locale = 0;
    var column = 0;
    var row = 0;
    var counter = 0;
    var cipher = '';
   
    var locations = [];
    var pLetters = [];
    var uiPairHighlights = [];
   
    var newString = "";
   
    for(var i = 0; i < input.length; ++i) {
        if(input[i] >= "A" && input[i] <= "Z"){
            if(input[i] != "J") {
                newString += input[i];
            }
            else {
                newString += "I";
            }
        }
    }
   
    newString = fixDigraphs(newString);
   
    for(var i = 0; i < newString.length; ++i) {
        var c = newString.charAt(i);
       
        locale = g_keyHash[c];
       
        trace(c + " - " + g_keyHash[c]);
        pLetters.push(g_alphaHash[c]);
       
        row = Math.floor(locale / 5);
        column = locale % 5;
       
        locations.push(row);
        locations.push(column);
        counter++;
 
       
        if(counter == 2) {
            trace("locale: " + locale + ", " + "locations[0]: " + locations[0] + ", locations[1]" + locations[1] + ", locations[2]" + locations[2] + ", locations[3]" + locations[3]);
            var cLetter1 = 0;
            var cLetter2 = 0;
           
           
            if(locations[0] != locations[2] && locations[1] != locations[3]) {
                cLetter1 = (locations[0] * 5) + locations[3];
                cLetter2 = (locations[2] * 5) + locations[1];
                /*trace("cLetter1: " + cLetter1 + "," + g_keyStack[cLetter1]);
                trace("cLetter2: " + cLetter2 + "," + g_keyStack[cLetter2]);*/
            }
            else if(locations[0] == locations[2]) {
                if(locations[1] != 4) {
                    cLetter1 = (locations[0] * 5) + locations[1] + 1;
                }
                else {
                    cLetter1 = (locations[0] * 5);
                }
               
                if(locations[3] != 4){
                    cLetter2 = (locations[2] * 5) + locations[3] + 1;
                }
                else {
                    cLetter2 = (locations[2] * 5);
                }
            }
            else if(locations[1] == locations[3]) {
                if(locations[0] != 4) {
                    cLetter1 = ((locations[0]+1) * 5) + locations[1];
                }
                else {
                    cLetter1 = locations[1];
                }
               
                if(locations[2] != 4) {
                    cLetter2 = (locations[2] + 1) * 5 + locations[3];
                }
                else {
                    cLetter2 = locations[3];
                }
            }
               
               
            uiPairHighlights.push([pLetters[0], pLetters[1], g_keyStack[cLetter1], g_keyStack[cLetter2]]);
            cipher += g_alphaHashRev[ g_keyStack[cLetter1] ] + g_alphaHashRev[ g_keyStack[cLetter2] ];
 
            locations = [];
            pLetters = [];
            counter = 0;
        }
       
        row = column = locale = -1;
    }
   
    uiHighlightEncryption(uiPairHighlights, true);
    uiOutputCipher(cipher);
}
 
function beginDeCipher(input) {
    if(!g_keySet) {
        createPlayFairGrid("");
    }
   
   
    input = input.toUpperCase();
    trace(input);
   
    var locale = 0;
    var column = 0;
    var row = 0;
    var counter = 0;
    var decipher = '';
   
    var locations = [];
    var cLetters = [];
    var uiPairHighlights = [];
   
    var newString = "";
   
    for(var i = 0; i < input.length; ++i) {
        if(input[i] >= "A" && input[i] <= "Z"){
            if(input[i] != "J") {
                newString += input[i];
            }
            else {
                newString += "I";
            }
        }
    }
   
    for(var i = 0; i < newString.length; ++i) {
        var c = newString.charAt(i);
       
        locale = g_keyHash[c];
       
        trace(c + " - " + g_keyHash[c]);
        cLetters.push(g_alphaHash[c]);
       
        row = Math.floor(locale / 5);
        column = locale % 5;
       
        locations.push(row);
        locations.push(column);
        counter++;
 
       
        if(counter == 2) {
            trace("locale: " + locale + ", " + "locations[0]: " + locations[0] + ", locations[1]" + locations[1] + ", locations[2]" + locations[2] + ", locations[3]" + locations[3]);
            var pLetter1 = 0;
            var pLetter1 = 0;
           
           
            if(locations[0] != locations[2] && locations[1] != locations[3]) {
                pLetter1 = (locations[0] * 5) + locations[3];
                pLetter2 = (locations[2] * 5) + locations[1];
            }
            else if(locations[0] == locations[2]) {
                if(locations[1] != 0) {
                    pLetter1 = (locations[0] * 5) + locations[1] - 1;
                }
                else {
                    pLetter1 = (locations[0] * 5) + 4;
                }
               
                if(locations[3] != 0){
                    pLetter2 = (locations[2] * 5) + locations[3] - 1;
                }
                else {
                    pLetter2 = (locations[2] * 5) + 4;
                }
            }
            else if(locations[1] == locations[3]) {
                if(locations[0] != 0) {
                    pLetter1 = ((locations[0] - 1) * 5) + locations[1];
                }
                else {
                    pLetter1 = 20 + locations[1];
                }
               
                if(locations[2] != 0) {
                    pLetter2 = (locations[2] - 1) * 5 + locations[3];
                }
                else {
                    pLetter2 = 20 + locations[3];
                }
            }
               
               
            uiPairHighlights.push([cLetters[0], cLetters[1], g_keyStack[pLetter1], g_keyStack[pLetter2]]);
            decipher += g_alphaHashRev[ g_keyStack[pLetter1] ] + g_alphaHashRev[ g_keyStack[pLetter2] ];
 
            locations = [];
            cLetters = [];
            counter = 0;
        }
       
        row = column = locale = -1;
    }
   
    uiHighlightEncryption(uiPairHighlights, true);
    uiOutputCipher(decipher);
}
 
function reset() {
    g_alphaArray = []; //0 -> a, in order, complete
    g_alphaHash = []; //a -> 0, in order, i and j both to 8, z -> 24
    g_alphaHashRev = []; //0 -> a, in order, 8 goes to i, 24 -> z
    g_keyHash = [];
    g_keyStack = [];
    g_keySet = false;
 
    init();
}
 
function fixDigraphs(input) {  
    for(var i = 0; i < input.length; i++) {
        if(input[i] == input[i+1]) {
            input = input.substring(0,i+1) + "X" + input.substring(i+1);
        }
        i++;
    }
   
    if(input.length % 2 != 0) {
        input += "X";
    }
   
    return input;
}