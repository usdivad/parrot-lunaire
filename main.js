

/**CONTEXT**/
var ctx;

try {
	ctx = new webkitAudioContext();
}
catch (e) {
	try {
		ctx = new AudioContext();
	}
	catch (e) {
		alert("Sorry mate, no Web Audio API in your browser. This relationship isn't going to work.");
	}
}

/**TUNER**/
var userPitches = [];
var tuner = new Tuner(userPitches);
//var canvas = document.getElementById('candide');


/**ENGRAVING**/
//realtime update is done by Tuner()
const NOTEMAX=20;
//stave
var cv = $('.engraving canvas')[0];
var renderer = new Vex.Flow.Renderer(cv, Vex.Flow.Renderer.Backends.CANVAS);
var g_ctx = renderer.getContext();
var stave = new Vex.Flow.Stave(10, 0, 800);
stave.addClef("treble").setContext(g_ctx).draw();

//notes
var notes = [];
/*
var notes = [new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })];
notes.push(new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }));
*/

//voice and engrave
/*
var voice = new Vex.Flow.Voice({
num_beats: 4,
beat_value: 4,
resolution: Vex.Flow.RESOLUTION
});
voice.setStrict(false);


//updating voice
voice.addTickables(notes);

var formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 500);

voice.draw(g_ctx, stave);

//voice.addTickable(new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" }));
*/



//engrave
var DURATION = "q";

function engraveNew(k, c, p) {
	//add new note
	//var new_note = new Vex.Flow.StaveNote();
	var new_note;
	
	if (p.charAt(2) == "") {
		new_note = new Vex.Flow.StaveNote({ keys: [k], duration: "q" });
	}
	else {
		new_note = new Vex.Flow.StaveNote({ keys: [k], duration: "q" }).addAccidental(0, new Vex.Flow.Accidental("#"));
	}
	/*
	new_note.duration = "q";
	new_note.keys = [];
	if (p.charAt(2) != "")
		new_note.addAccidental(1, new Vex.Flow.Accidental("#"));
	new_note.keys.push(k);
	*/
	
	//reset staff (justifying won't work and it'll disappear otherwise)
	if (notes.length > NOTEMAX) {
		var n = notes[NOTEMAX];
		notes = [n];
	}
	//add notes to array
	notes.push(new_note);
	
	//voice creation
	var voice = new Vex.Flow.Voice({
	num_beats: 4,
	beat_value: 4,
	resolution: Vex.Flow.RESOLUTION
	});
	voice.setStrict(false);
	
	//updating voice (& clearing canvas)
	c.clearRect(0, 0, cv.width, cv.height);
	stave.setContext(g_ctx).draw(); //bad oop
	voice.addTickables(notes);
	var formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 800);
	voice.draw(c, stave);
}

function clear(pitches, engraves) {
	pitches = [];
	engraves = [];
	console.log("yes, clear!");
}

/*
document.getElementById("clearButton").onclick = function() {
	console.log("CLEAR!");
	//clear(userPitches, notes);
	userPitches = [];
	notes = [];
	g_ctx.clearRect(0, 0, cv.width, cv.height);
	stave.setContext(g_ctx).draw(); //bad oop
};
*/

/**PEACHNOTE ANALYSIS**/
var app_id = "ceb08b52";
var app_key = "22b75b29fd311f4d57105a192870eb7e";
//var url = "http://www.peachnote.com/rest/api/v0/scoreSearch?site=loc.gov&type=chordAffine&q=62+0+1+2+0+-2+-1&app_id=abe33d61&app_key=b985ac7a9881a67de8a7b069d295b3fe";
var base_url = "http://www.peachnote.com/rest/api/v0/scoreSearch?site=imslp.org&type=singleNoteAffine";
var peach_pinch = [];

var out_str = "";

//formatting url for json request
function submit(original_coll) {
	var NGRAM_LENGTH = 5;
	var req = base_url;
	var coll = absoluteToRelative(original_coll);
	var melody_str = "";
	
	//this takes the ENTIRE melody
	/*
	for (var i=0; i<coll.length; i++) {
		melody_str += coll[i].toString() + "+";
	}
	*/
	//...whereas this only takes NGRAM_LENGTH consecutive notes, spot randomly determined
	if (coll.length > NGRAM_LENGTH) {
		var r = Math.floor(Math.random()*(coll.length-NGRAM_LENGTH));
		for (var i=r; i<NGRAM_LENGTH; i++) {
			melody_str += coll[i].toString() + "+";
		}
	}
	else {
		for (var i=0; i<coll.length; i++) {
		melody_str += coll[i].toString() + "+";
		}
	}
	
	melody_str = melody_str.substring(0, melody_str.length-1);
	//console.log(melody_str);
	
	req += "&q=" + melody_str;
	req += "&app_id=" + app_id;
	req += "&app_key=" + app_key;
	console.log(req);
	$.getJSON(req+"&callback=?", null, function(peachdata) {
		console.log(peach_pinch);
		console.log("pea");
		peach_pinch = peachdata;
	}).done(function() {
		$("#result").html(parse(peach_pinch));
	});
	
}


//e.g. [62, 63, 60] becomes [62, 1, -2]
function absoluteToRelative(coll) {
	var newColl = [];
	var base = coll[0];
	newColl.push(base);
	for (var i=1; i<coll.length; i++) {
		newColl.push(base-coll[i]);
	}
	return newColl;
}

document.getElementById("submitButton").onclick = function() {
	submit(userPitches);
};

//peachdata is what gets received when you execute this callback
/*
$.getJSON(url+"&callback=?", null, function(peachdata) {
	console.log(peachdata[0]);
	console.log("pea");
	peach_pinch = peachdata;
});
*/