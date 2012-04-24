var g_beginningLetters = 0;
//all times below are in milliseconds
var g_highlightDelay = 300; //the time delay between dehighlighting one set and highlighting the next
var g_highlightDuration = 1000; //duration of the highlight (key only, both are gone at the same time)
var g_highlightInterval = 400; //interval between the key highlight and the cipher highlight
var g_highlightSameInterval = 150;
 
function setup() {
    $("#setKey").click(function() {
        createPlayFairGrid($("#key").val());
        return false;
    });
 
    $("#encrypt").click(function() {
        beginCipher($("#plaintext").val());
        return false;
    });
   
    $("#swap").click(function() {
        uiSwap();
        return false;
    });
   
    $("#reset").click(function() {
        uiReset();
        reset();
        return false;
    });
}
 
function uiSwap() {
    $("#plaintext").val( $("#ciphertext").val() );
    $("#ciphertext").val('');
    $("#encrypt").unbind("click");
   
    if($("#encrypt").val() == "Encrypt") {
        $("#encrypt").val("Decrypt");
        $("#plaintext-label").text("Cipher text: ");
        $("#ciphertext-label").text("Decrypted text: ");
 
        $("#encrypt").click(function() {
            beginDeCipher($("#plaintext").val());
            return false;
        });
    } else {
        $("#encrypt").val("Encrypt");
        $("#plaintext-label").text("Plain text: ");
        $("#ciphertext-label").text("Cipher text: ");
 
        $("#encrypt").click(function() {
            beginCipher($("#plaintext").val());
            return false;
        });
    }
}
 
function uiOutputCipher(cipher) {
    $("#ciphertext").val(cipher);
}
 
function uiHighlightEncryption(pairHighlights, encryption) {
    var c1 = "ui-state-key";
    var c2 = "ui-state-cipher";
   
    if(encryption == false) {
        c1 = "ui-state-cipher";
        c2 = "ui-state-key";
    }
   
    for(var i = 0; i < pairHighlights.length; ++i) {
        var p = pairHighlights[i];
        setTimeout('showEncryption('+p[0]+', '+p[1]+', '+p[2]+', '+p[3]+', "'+c1+'", "'+c2+'");', (g_highlightDuration + g_highlightDelay)*i);
    }
}
 
function showEncryption(k1, k2, c1, c2, keyClass, cipherClass) {
    $("#letter-"+k1).addClass(keyClass);
    setTimeout('$("#letter-'+k2+'").addClass("'+keyClass+'");', g_highlightSameInterval);
 
    setTimeout('$("#letter-'+c1+'").addClass("'+cipherClass+'");', g_highlightInterval);
    setTimeout('$("#letter-'+c2+'").addClass("'+cipherClass+'");', g_highlightInterval + g_highlightSameInterval);
   
    setTimeout('$("#letter-'+k1+'").removeClass("'+keyClass+'"); '+
               '$("#letter-'+k2+'").removeClass("'+keyClass+'"); '+
               '$("#letter-'+c1+'").removeClass("'+cipherClass+'"); '+
               '$("#letter-'+c2+'").removeClass("'+cipherClass+'");', g_highlightDuration);
   
}
 
function uiSetKey(key) {
    var interval = 500;
   
    for(var i = 0; i < key.length; ++i) {
        setTimeout("animateLetter($(\"#letter-"+key[i]+"\"), 400)", interval*i);
    }
}
 
function uiReset() {
    g_beginningLetters = 0;
    $("#key").val('');
    $("#plaintext").val('');
    $("#ciphertext").val('');
   
    var pos = getPositionalInfoList();
   
    for(var i = 0; i < 25; ++i) {
        var y = pos.top + Math.floor(i/5)*52;
        var x = pos.left + (i%5)*52;
        makeAbsolute($("#letter-"+i), y, x);
    }
 
    explode();
    setTimeout('implode('+pos.top+', '+pos.left+');', 500);
    setTimeout('makeAllRelative();', 1000);
}
 
function explode() {
    for(var i = 0; i < 25; ++i) {
        var el = $("#letter-"+i);
       
        var x = el.position().left + Math.floor(Math.random()*401) - 200;
        var y = el.position().top + Math.floor(Math.random()*401) - 200;
        el.animate({'top': y, 'left': x});
    }
}
 
function implode(top, left) {
    for(var i = 0; i < 25; ++i) {
        $("#letter-"+i).animate({'top': top + Math.floor(i/5)*52, 'left': left + (i%5)*52 });
    }
}
 
function makeAbsolute(element, top, left) {
    element.css({ position: "absolute", top: top, left: left });
}
 
 
function makeAllRelative() {
    for(var i = 24; i >= 0; --i) {
        $("#letter-"+i).parent().prepend($("#letter-"+i));
        $("#letter-"+i).css({position: 'relative', top: 0, left: 0});
    }
}
 
function getPositionalInfoList() {
    var topLi;
    var prevAll = $("#letter-0").prevAll();
   
    if(prevAll.length == 0) {
        topLi = $("#letter-0");
    } else {
        topLi = $(prevAll[prevAll.length - 1]);
    }
   
    var top = topLi.attr('offsetTop') - 2; //-2 for the margin
    var left = topLi.attr('offsetLeft') - 2; //-2 for the margin
   
    return {top: top, left: left};
}
 
function animateLetter(clicked, duration) {
    // all the LIs above the clicked one
    var previousAll = clicked.prevAll();
 
    // only proceed if it's not already on top (no previous siblings)
    if(previousAll.length > 0/*g_beginningLetters*/) {
        // top LI
        var top = $(previousAll[previousAll.length - g_beginningLetters - 1]);
 
        var prepend = true;
        var after;
 
        if(g_beginningLetters > 0) {
            after = $(previousAll[previousAll.length - g_beginningLetters]);
            prepend = false;
        }
   
        // immediately previous LI
        var previous = $(previousAll[g_beginningLetters]);
   
        // how far up do we need to move the clicked LI?
        var moveUp = clicked.attr('offsetTop') - top.attr('offsetTop');
        var moveLeft = clicked.attr('offsetLeft') - top.attr('offsetLeft');
   
        // how far down do we need to move the previous siblings?
        //var moveDown = (clicked.offset().top + clicked.outerHeight()) - (previous.offset().top + previous.outerHeight());
       
        // let's move stuff
        clicked.css('position', 'relative');
        previousAll.css('position', 'relative');
        clicked.animate({'top': -moveUp, 'left': -moveLeft}, duration);
        previousAll.animate({'top': 0}, {complete: function() {
            // rearrange the DOM and restore positioning when we're done moving
            if(prepend) {
                clicked.parent().prepend(clicked);
            } else {
                clicked.insertAfter(after);
            }
            clicked.css({position: 'relative', top: 0, left: 0});
            previousAll.css({position: 'relative', top: 0, left: 0});
        }});
    }
   
    ++g_beginningLetters;
}
 
function trace(input) {
    $('#trace').html(input + '<br />' + $('#trace').html());
}
