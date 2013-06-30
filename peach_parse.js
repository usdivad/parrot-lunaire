var compliments = ["Nice playing!", "Good stuff!", "Sweet work!", "Sounds great!", "Marvelous!", "Tell it!", "Mmmmm!"];
var DATABASE_THRESHOLD = 10;
var spotifyURI = "spotify:trackset:PlaylistName:";
var spotifyData;

function parse(database) { //database = what was just played cross-refed with the database
	var out = "<b>";
	//var spotifyURI_tracks = "";
	
	out += compliments[Math.floor(Math.random()*compliments.length)];
	out += " Check out these existing musical passages that match the melodic content of what you just played:</b><p>";
	
	//displaying aforementioned content
	var max;
	var newData = fisherYates(database);
	
	if (database.length == 0) {
		out += "No existing passages found! A regular musical idiosyncrat, you are.<br>";
	}
	else if (database.length < DATABASE_THRESHOLD) {
		max = database.length;
	}
	else {
		max = DATABASE_THRESHOLD;
	}
	
	for (var i=0; i<max; i++) {
		
		//displaying data in out stream
		out += "<i>" + newData[i]["title"] + "</i> by " + newData[i]["composer"] + " (" + newData[i]["year"] + "), " + "<a href='" + pageLink(newData[i]) + "' target='_blank'>page(s) " + newData[i]["pages"] + "</a><br>";
		
		//generating spotify playlist
		var trackID;
		//search url construction
		var searchURL = "http://ws.spotify.com/search/1/track.json?q=" + newData[i]["title"] + " " + newData[i]["composer"] + "&page=1";
		searchURL = searchURL.replace(/ /g, "%20");
		searchURL = searchURL.replace(/\,/g, "");
		
		console.log(searchURL);
		
		if (i == max-1) {
			$.getJSON(searchURL, null, function(data) {
				//console.log(data);
				spotifyData = data;
			}).done(function() {
				trackID = spotifyData["tracks"][Math.floor(Math.random()*spotifyData["tracks"].length)]["href"];
				trackID = trackID.replace("spotify:track:", "");
				console.log(trackID);
				spotifyURI += trackID + ",";
				console.log(spotifyURI);
				
				out += "<p><b>Below is a Spotify playlist based on your improvisational vocabulary; you might find some further inspiration, direction, and stimulation in these recordings. Happy listening, and keep making music!</b><p>";
	
				console.log(i + " URI: " + spotifyURI);
				out += '<iframe src="https://embed.spotify.com/?uri=' + spotifyURI + '" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>';
				
				$("#result").html(out);
			});
		}
		
		else {
			$.getJSON(searchURL, null, function(data) {
				//console.log(data);
				spotifyData = data;
			}).done(function() {
				trackID = spotifyData["tracks"][Math.floor(Math.random()*spotifyData["tracks"].length)]["href"];
				trackID = trackID.replace("spotify:track:", "");
				console.log(trackID);
				spotifyURI += trackID + ",";
				console.log(i + ": " + spotifyURI);
				
			});
		}

	}

	//displaying spotify playlist
	//format: <iframe src="https://embed.spotify.com/?uri=spotify:trackset:PlaylistName:3Z7u3vmPG8pJhynCvHlPt5,0579b3RdMpVdwMHWsyrwTE" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>	
	
	
	
	return out;
}

//Fisher-Yates shuffle algorithm (adapted from http://sedition.com/perl/javascript-fy.html)
function fisherYates ( oldArray ) {
  var myArray = oldArray;
  var i = myArray.length;
  if ( i == 0 ) return false;
  while ( --i ) {
     var j = Math.floor( Math.random() * ( i + 1 ) );
     var tempi = myArray[i];
     var tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
  return myArray;
}

//generates a link to peachnote score viewer for specific page
function pageLink(piece) {
	var id = piece["id"];
	var pages = piece["pages"];
	var url = "http://www.peachnote.com/viewer?sid="+id+"&page="+pages; //does "&page=64" give different result from "&page=64,65"?
	return url;
}