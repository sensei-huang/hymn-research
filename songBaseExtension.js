// Wake mode functions
let wakeLock = null; // Variable to store wakelock

async function changeWake(cb){ // Changes wakelock state
	cb.checked ? await lockScreen() : await unlockScreen();
}

async function lockScreen(){ // Turns wakelock on
  try {
	wakeLock = await navigator.wakeLock.request("screen");
	wakeLock.onrelease = function(){ // Wake lock turns off when page is inactive so update checkbox to show
		wakeLock = null;
		document.getElementById('wakebox').checked = false;
	};
  } catch (e) {
	console.error(`Failed to enable screen lock: ${e.name}, ${e.message}`);
  }
}
  
async function unlockScreen(){ // Turns wakelock off
  try {
	if(wakeLock !== null) { // Check whether or not there is wakelock
	  await wakeLock.release();
	  wakeLock = null;
	}
  } catch (e) {
	console.error(`Failed to disable screen lock: ${e.name}, ${e.message}`);
  }
}

function addButtons(){
	// Insert toggle switch CSS
	let style = document.createElement('style');
	// To change the CSS, copy code from https://github.com/sensei-huang/hymn-research/blob/main/songBaseExtension.css
	// Minify using https://csscompressor.com/
	style.innerHTML = '.switch{position:relative;width:45px;height:26px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s;border-radius:26px}.slider:before{position:absolute;content:"";height:20px;width:20px;left:3px;bottom:3px;background-color:#fff;transition:.4s;border-radius:50%}input:checked + .slider{background-color:#2196F3}input:checked + .slider:before{transform:translateX(19px)}.interactive-container{display:flex;justify-content:center;align-items:center;user-select:none;color:#aaa}.button{background-color:#ccc;border:none;color:#fff;padding:5px 7px;text-align:center;cursor:pointer;border-radius:9px;display:block}.button:hover{transform:scale(1.05);transition:all .3s cubic-bezier(0.05,0.83,0.43,0.96)}.button:active{background-color:#aaa}';
	document.head.appendChild(style);

	// Add container for toggle switch
	let songAppEl = document.getElementsByClassName("song-app")[0];
	let div = document.createElement("div");
	div.className = "interactive-container";
	songAppEl.insertBefore(div, document.getElementsByClassName("home-title")[0].nextSibling); // Assumes there is a home-title element which is a child of song-container
	
	// Add singing mode toggle switch
	let toggleSwitch = document.createElement("label");
	toggleSwitch.className = "switch";
	toggleSwitch.innerHTML = '<input type="checkbox" onclick="changeWake(this);" id="wakebox"><span class="slider"></span>';
	div.append(toggleSwitch);
	let text = document.createElement("span");
	text.innerText = "Singing mode (keeps screen awake)";
	text.style = "margin-left: 10px;";
	div.append(text);

	// Add container for add chords and auto-play button
	let div2 = document.createElement("div");
	div2.className = "interactive-container";
	div2.style = "justify-content: space-between;";
	songAppEl.insertBefore(div2, div.nextSibling); // Insert after first container
	
	// Add chords button
	let button = document.createElement("button");
	button.innerText = "Add chords";
	button.className = "button";
	button.style = "margin: 3px 0px 2px 50px;";
	button.onclick = function(){
		song.props.lyrics = lines.join('\n');
		song.forceUpdate();
	};
	div2.append(button);
	
	// Add autoplay button
	let button2 = document.createElement("button");
	button2.innerText = "Autoplay";
	button2.className = "button";
	button2.style = "margin: 3px 50px 2px 0px;";
	button2.onclick = function(){
		// TODO - add autoplay
	};
	div2.append(button2);
}

// Lyrics scraping variables
let lyrics = song.props.lyrics;
let lines = lyrics.split("\n");
let chorusChords = [];
let stanzaChords = [];
let lastTune = song.state.selectedTune;

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
		if(lines[i].includes("[")){ // Has chords (assumes first line with chords means entire block with chords)
			let result = extractChords(i);
			i = result[0];
			chorusChords = result[1]; // Assumes only 1 chorus with chords
		}
	}else if(/^([0-9]+)$/.test(lines[i])){ // Stanza number
		i++;
		if(lines[i].includes("[")){ // Has chords (assumes first line with chords means entire block with chords)
			let result = extractChords(i);
			i = result[0];
			stanzaChords = result[1]; // Assumes only 1 stanza with chords
		}
	}
	return i;
}

function placeChordLine(lnum, arr){
	let astr = ""; // Store lyrics of this line
	let c = 0;
	for(let a = 0; a < arr.length; a++){ // Go through each character
		let s = syl(astr);
		while(s != arr[a][1] && c < lines[lnum].length){
			astr += lines[lnum][c];
			s = syl(astr);
			c++;
		}
		if(c == lines[lnum].length){ // End of line
			while(a < arr.length){ // Fill the end of line with remaining chords
				lines[lnum] += "["+arr[a][0]+"]";
				a++;
			}
			break;
		}
		// Insert chord by slicing string
		lines[lnum] = lines[lnum].slice(0, c-1)+"["+arr[a][0]+"]"+lines[lnum].slice(c-1);
		c += arr[a][0].length+2;
	}
}

function placeChords(lnum, arr){
	let initialnum = lnum;
	while(lines[lnum] !== "" && lnum < lines.length){ // Reach end of chorus or stanza block or end of song
		placeChordLine(lnum, arr[lnum-initialnum]);
		lnum++;
	}
	return lnum;
}

function writeTune(i){
	// Writing through lines
	// Assumes the lines have the same amount of syllables in them.
	if(lines[i].substring(0, 2) === "  "){ // Chorus
		if(!lines[i].includes("[")){ // Doesn't have chords (assumes first line without chords means entire block without chords)
			i = placeChords(i, chorusChords);
		}
	}else if(/^([0-9]+)$/.test(lines[i])){ // Stanza number
		i++;
		if(!lines[i].includes("[")){ // Doesn't have chords (assumes first line without chords means entire block without chords)
			i = placeChords(i, stanzaChords);
		}
	}
	return i;
}

function runCode() {
	let urlParams = new URLSearchParams(window.location.search);
	let tune = (song.props.lyrics.includes("###")) ? Number(song.state.selectedTune+"")+1 : 0; // Assumes triple # means multiples tunes
	
	// Reading through lines
	for(let i = 0; i < lines.length; i++){
		if(tune == 0){ // Is currently in correct tune block
			i = readTune(i);
		}
		if(i < lines.length){
			if(lines[i].includes("###")){ // Assumes triple hashtag means tune change
				tune--;
			}
		}
	}

	tune = (song.props.lyrics.includes("###")) ? Number(song.state.selectedTune+"")+1 : 0; // Reset tune counter
	
	// Writing through lines
	for(let i = 0; i < lines.length; i++){
		if(tune == 0){ // Is currently in correct tune block
			i = writeTune(i);
		}
		if(i < lines.length){
			if(lines[i].includes("###")){ // Assumes triple hashtag means tune change
				tune--;
			}
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
runCode();
addButtons();
setInterval(function(){ // Check if tune changed
	if(song.state.selectedTune != lastTune){
		lastTune = song.state.selectedTune;
		runCode();
	}
}, 100);
`;
document.head.appendChild(js);
