// Lyrics scraping variables
let lyrics = song.props.lyrics;
let lines = lyrics.split("\n");
let chorusChords = [];

function extractChords(lnum){
		let arr = [];
		while(lines[lnum] !== "" && lnum < lines.length){ // Reach end of chorus or stanza block or end of song
			let cstr = ""; // Store lyrics of this line
			let chordline = []; // Store chords of this line
			for(let c = 0; c < lines[lnum].length; c++){ // Go through each character
				if(lines[lnum][c] === "["){ // Detected chord
					c++; // Skip '['
					let chord = "";
					while(lines[lnum][c] !== "]"){ // Store chord (assumes chord does not reach end of line)
						chord += lines[lnum][c];
						c++;
					}
					c++; // Skip ']'
					let syl = syllable(cstr);
					arr.push([chord, syl]);
				}else{
					cstr += lines[lnum][c];
				}
			}
			lnum++;
		}	
		return [lnum, arr];
}

function readTune(){
	// Reading through lines
	for(let i = 0; i < lines.length; i++){
		if(lines[i].substring(0, 2) === "  "){ // Chorus
			if(lines[i].includes("[")){ // Has chords
				let result = extractChords(i);
				i = result[0];
				chorusChords = result[1];
			}else{ // Inject chords into 
				
			}
		}
	}
}

function writeTune(){
	// Writing through lines
	for(let i = 0; i < lines.length; i++){
		if(lines){
		}
	}
}

function placeChords() {
	let urlParams = new URLSearchParams(window.location.search);
	let tune = urlParams.has('tune') ? Number(urlParams.get('tune'))+1 : 0; // Assumes url param query is upto-date which it usually is
	
	// Reading through lines
	for(let i = 0; i < lines.length; i++){
		if(tune == 0){ // Is currently in correct tune block
			readTune();
		}
		if(lines[i].includes("###")){ // Assumes triple hashtag means tune change
			tune--;
		}
	}

	tune = urlParams.has('tune') ? Number(urlParams.get('tune'))+1 : 0; // Reset tune counter
	
	// Writing through lines
	for(let i = 0; i < lines.length; i++){
		if(tune == 0){ // Is currently in correct tune block
			writeTune();
		}
		if(lines[i].includes("###")){ // Assumes triple hashtag means tune change
			tune--;
		}
	}
}

// Syllable counting code (using js injection)
var js = document.createElement("script");
js.type = "module";
js.innerHTML = `
import {syllable} from 'https://esm.sh/syllable@5?bundle';
import syllables from 'https://esm.sh/syllables@2.2.1?bundle'; 
function syl(word){
		return syllables(word, { fallbackSyllablesFunction: syllable });
}
window.syllable = syl;
`;
js.onreadystatechange = placeChords();
js.onload = placeChords();
document.head.appendChild(js);
