// Lyrics scraping variables
let lyrics = song.props.lyrics;
let lines = lyrics.split("\n");
let chorusChords = [];
let stanzaChords = [];

function extractChordLine(lnum){
	let arr = [];
	let cstr = ""; // Store lyrics of this line
	let chordline = []; // Store chords of this line
	for(let c = 0; c < lines[lnum].length; c++){ // Go through each character
		if(lines[lnum][c] === "["){ // Detected chord
			//console.log(cstr);
			c++; // Skip '['
			let chord = "";
			while(lines[lnum][c] !== "]"){ // Store chord (assumes chord does not reach end of line)
				chord += lines[lnum][c];
				c++;
			}
			let s = syl(cstr); // Count syllables
			//console.log(s);
			arr.push([chord, s]);
		}else{
			cstr += lines[lnum][c];
		}
	}
	return arr;
}

function extractChords(lnum){
		let arr = [];
		while(lines[lnum] !== "" && lnum < lines.length){ // Reach end of chorus or stanza block or end of song
			arr.push(extractChordLine(lnum));
			lnum++;
		}
		return [lnum, arr];
}

function readTune(i){
	// Reading through lines
    if(lines[i].substring(0, 2) === "  "){ // Chorus
        if(lines[i].includes("[")){ // Has chords
            let result = extractChords(i);
            i = result[0];
            chorusChords = result[1]; // Assumes only 1 chorus with chords
        }
    }else if(/^([0-9]+)$/.test(lines[i])){ // Stanza number
		i++;
		if(lines[i].includes("[")){ // Has chords
			let result = extractChords(i);
			i = result[0];
			stanzaChords = result[1]; // Assumes only 1 stanza with chords
		}
	}
    return i;
}

function writeTune(i){
	// Writing through lines
	// Assumes the lines have the same amount of syllables in them.
	if(lines[i].substring(0, 2) === "  "){ // Chorus
        if(lines[i].includes("[")){ // Has chords
            let result = extractChords(i);
            i = result[0];
            chorusChords = result[1]; // Assumes only 1 chorus with chords
        }
    }else if(/^([0-9]+)$/.test(lines[i])){ // Stanza number
		i++;
		if(lines[i].includes("[")){ // Has chords
			let result = extractChords(i);
			i = result[0];
			stanzaChords = result[1]; // Assumes only 1 stanza with chords
		}
    return i;
}

function placeChords() {
	let urlParams = new URLSearchParams(window.location.search);
	let tune = urlParams.has('tune') ? Number(urlParams.get('tune'))+1 : 0; // Assumes url param query is upto-date which it usually is
	
	// Reading through lines
	for(let i = 0; i < lines.length; i++){
		if(tune == 0){ // Is currently in correct tune block
			i = readTune(i);
		}
		if(lines[i].includes("###")){ // Assumes triple hashtag means tune change
			tune--;
		}
	}

	tune = urlParams.has('tune') ? Number(urlParams.get('tune'))+1 : 0; // Reset tune counter
	
	// Writing through lines
	for(let i = 0; i < lines.length; i++){
		if(tune == 0){ // Is currently in correct tune block
			i = writeTune(i);
		}
		if(lines[i].includes("###")){ // Assumes triple hashtag means tune change
			tune--;
		}
	}
}

// Syllable counting code (using js injection)
let js = document.createElement("script");
js.type = "module";
js.innerHTML = `
import {syllable} from 'https://esm.sh/syllable@5?bundle';
import syllables from 'https://esm.sh/syllables@2.2.1?bundle'; 
window.syl = function(word){
	return syllables(word, { fallbackSyllablesFunction: syllable });
}
`;
document.getElementsByTagName('head')[0].appendChild(js);

// Place chords but wait until the 
let tid = setInterval(function(){
	if(typeof(syl) === 'function'){
		placeChords();
		clearInterval(tid);
	}
}, 100);
