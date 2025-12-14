// Lyrics scraping variables
let lyrics = song.props.lyrics;
let lines = lyrics.split("\n");
let chorusChords = {};

async function extractChords(l, lnum){ // Lines, line number, array to store chords
		let arr = [];
		while(l[lnum] !== "" && lnum != l.length){ // Reach end of chorus or stanza block or end of song
			let cstr = ""; // Store
			for(let c = 0; c < l[lnum]; c++){ // Go through each character
				if(l[lnum][c] === "["){ // Detected chord
					c++; // Skip '['
					let chord = "";
					while(l[lnum][c] !== "]"){ // 
						chord += l[lnum][c];
						c++;
					}
					let syl = await syllable(cstr);
					arr.append([chord, syl]);
				}else{
					cstr += l[lnum][c];
				}
			}
		}	
		return [lnum, arr];
}

var callback = async function() {
	// Reading through lines
	for(let i = 0; i < lines.length; i++){
		if(lines[i].substring(0, 2) === "  "){ // Chorus
			if(lines[i].includes("[")){ // Has chords
				let result = await extractChords(lines, i);
				i = result[0];
				chorusChords = result[1];
			}else{ // Inject chords into 

			}
		}
	}
	
	// Writing through lines
	for(let i = 0; i < lines.length; i++){
		if(lines){
		}
	}
}

// Syllable counting code (using js injection)
var js = document.createElement("script");
js.type = "module";
js.innerHTML = `
import * as mod from 'https://esm.sh/cmu-syllable-counter@1.1.2'; 
async function syllable(word){
		let res = await mod.getSyllableCount(word);
		return res.totalSyllableCount;
}
window.syllable = syllable;
`;
js.onreadystatechange = callback();
js.onload = callback();
document.head.appendChild(js);
