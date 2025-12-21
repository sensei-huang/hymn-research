// Wakelock variable
let wakeLock = null;

// Auto-scroll variables
let scrollPosition, scrollDecimal, scrollID, autoScrollOn = 0;
let scrollSpeed = 0.1;

// Zoom variable
let zoomFactor = 1.0;

// Lyrics scraping variables
let tune, lyrics, lines;
let chorusWritten = -1, chorusAlternate = -1;
let chorusChordsWritten = -1, chorusChordsAlternate = -1;
let stanzaWritten = -1, stanzaAlternate = -1;
let chorusChords = [];
let stanzaChords = [];

// Wake mode functions
async function changeWake(cb){ // Changes wakelock state
	cb.checked ? await lockScreen() : await unlockScreen();
}

async function lockScreen(){ // Turns wakelock on
	try{
		wakeLock = await navigator.wakeLock.request("screen");
		wakeLock.onrelease = function(){ // Wake lock turns off when page is inactive so update checkbox to show
			wakeLock = null;
			document.getElementById('wakebox').checked = false;
		};
	}catch(e){
		console.error("Failed to enable screen lock: "+e.name+", "+e.message);
	}
}

async function unlockScreen(){ // Turns wakelock off
	try{
		if(wakeLock !== null) { // Check whether or not there is wakelock
			await wakeLock.release();
			wakeLock = null;
		}
	}catch(e){
		console.error("Failed to disable screen lock: "+e.name+", "+e.message);
	}
}

function addAutoScrollSpeed(){
	let navbar = document.createElement('div');
	navbar.className = "navbar";
	// To change this html, go to https://github.com/sensei-huang/hymn-research/blob/main/navbar.html
	// Minify using https://codebeautify.org/html-compressor
	// Change ' to \'
	navbar.innerHTML = '<span>Scroll speed:</span><button class="plusminus"onclick=\'scrollSpeed-=.01,document.getElementById("speedDisplay").innerText=(10*scrollSpeed).toFixed(1)\'><svg class="plusminusSVG"height="17px"viewBox="0 0 20 20"width="17px"><path d="M2 9h16v3H2z"></path></svg></button><span id="speedDisplay">1.0</span><button class="plusminus"onclick=\'scrollSpeed+=.01,document.getElementById("speedDisplay").innerText=(10*scrollSpeed).toFixed(1)\'><svg class="plusminusSVG"height="17px"viewBox="0 0 20 20"width="17px"><path d="M9 11v7h3v-7h7V8h-7V1H9v7H2v3z"></path></svg></button><button class="button"onclick="removeAutoScrollSpeed()">Stop</button>';
	document.getElementsByClassName("song-app")[0].append(navbar);
	windowScroll = document.documentElement.scrollHeight-document.documentElement.clientHeight
}

function removeAutoScrollSpeed(){
	document.getElementsByClassName("navbar")[0].remove();
	cancelAnimationFrame(scrollID);
	autoScrollOn = 0;
}

function addButtons(){
	// Insert toggle switch CSS
	let style = document.createElement('style');
	// To change the CSS, copy code from https://github.com/sensei-huang/hymn-research/blob/main/songBaseExtension.css
	// Minify using https://csscompressor.com/
	style.innerHTML = '.switch{position:relative;width:45px;height:26px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s;border-radius:26px}.slider:before{position:absolute;content:"";height:20px;width:20px;left:3px;bottom:3px;background-color:#fff;transition:.4s;border-radius:50%}input:checked + .slider{background-color:#2196F3}input:checked + .slider:before{transform:translateX(19px)}.interactive-container{display:flex;justify-content:center;align-items:center;user-select:none;color:#aaa}.button{background-color:#ccc;border:none;color:#fff;padding:5px 7px;text-align:center;cursor:pointer;border-radius:9px;display:block}.button:hover{transform:scale(1.05);transition:all .3s cubic-bezier(0.05,0.83,0.43,0.96)}.button:active{background-color:#aaa}.navbar{user-select:none;width:100%;position:fixed;bottom:0;left:0;display:flex;justify-content:center;align-items:center;background-color:#ddd;opacity:95%}.plusminus{margin:4px;position:relative;background-color:#fff;border:2px solid #ccc;width:25px;height:25px;cursor:pointer;border-radius:50%}.plusminusSVG{display:flex;align-items:center;justify-content:center;position:absolute;margin:2px;top:0;left:0;fill:#ccc}';
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
		processSong();
		updateSong();
	};
	div2.append(button);

	// Add autoscroll button
	let button2 = document.createElement("button");
	button2.innerText = "Autoscroll";
	button2.className = "button";
	button2.style = "margin: 3px 50px 2px 0px;";
	button2.onclick = function(){
		if(autoScrollOn == 0){
			autoScrollOn = 1;
			scrollPosition = window.scrollY;
			scrollDecimal = 0;
			scrollID = requestAnimationFrame(autoScroll);
			addAutoScrollSpeed();
		}else{
			removeAutoScrollSpeed();
		}
	};
	div2.append(button2);
	
	// Add zoom-in functions
	let div3 = document.createElement("div");
	div3.className = "interactive-container";
	div3.style = "justify-content: center;";
	// To change this html, go to https://github.com/sensei-huang/hymn-research/blob/main/zoom.html
	// Minify using https://codebeautify.org/html-compressor
	// Change ' to \'
	div3.innerHTML = '<span>Zoom:</span><button class="plusminus"onclick=\'zoomFactor-=.1,document.body.style.zoom=zoomFactor,document.getElementById("zoomDisplay").innerText=zoomFactor.toFixed(1)\'><svg class="plusminusSVG"height="17px"viewBox="0 0 20 20"width="17px"><path d="M2 9h16v3H2z"></path></svg></button><span id="zoomDisplay">1.0</span><button class="plusminus"onclick=\'zoomFactor+=.1,document.body.style.zoom=zoomFactor,document.getElementById("zoomDisplay").innerText=zoomFactor.toFixed(1)\'><svg class="plusminusSVG"height="17px"viewBox="0 0 20 20"width="17px"><path d="M9 11v7h3v-7h7V8h-7V1H9v7H2v3z"></path></svg></button><button class="button"onclick=\'zoomFactor=1,document.body.style.zoom=zoomFactor,document.getElementById("zoomDisplay").innerText=zoomFactor.toFixed(1)\'>Reset</button>';
	songAppEl.insertBefore(div3, div2.nextSibling); // Insert after first container
}

// Auto scroll function
function autoScroll() {
	scrollPosition = window.scrollY+scrollSpeed+scrollDecimal;
	scrollDecimal = scrollPosition-Math.round(scrollPosition); // Get the remaining decimal
	scrollPosition = Math.round(scrollPosition); // Round the position
	window.scrollTo(window.scrollX, scrollPosition);
	 // Assumes the reference world button exists
	if(document.getElementsByClassName("song-reference-toggle")[0].getBoundingClientRect().bottom > window.innerHeight-5){ // Not past the reference button
		scrollID = requestAnimationFrame(autoScroll);
	}else{ // Past the reference button
		removeAutoScrollSpeed();
	}
}

function extractChordLine(i){
	let arr = [];
	let cstr = ""; // Store lyrics of this line
	let chordline = []; // Store chords of this line
	for(let c = 0; c < lines[i].length; c++){ // Go through each character
		if(lines[i][c] === "["){ // Detected chord
			let s = syl(cstr); // Count syllables
			let percent, tempcstr = "";
			let startsyl = -1, endsyl = -1;
			for(let tempc = 0; tempc < lines[i].length; tempc++){
				if(lines[i][tempc] === "["){ // Skip chord for syllable counting
					while(lines[i][tempc] !== "]"){
						tempc++;
					}
				}else{
					if(/[\w\s]/.test(lines[i][tempc])){ // Only allow whitespaces and letters
						tempcstr += lines[i][tempc];
					}
					let temps = syl(tempcstr);
					if(temps == s && startsyl == -1){
						startsyl = tempcstr.length;
					}else if(temps == s+1 && endsyl == -1){
						endsyl = tempcstr.length;
						break;
					}
				}
			}
			if(startsyl == -1){ // Wasn't set because of going over line length
				startsyl = tempcstr.length;
				endsyl = tempcstr.length;
				percent = 0; // Since endsyl-startsyl = 0, divide by 0 would occur
			}else if(endsyl == -1){ // Wasn't set because of going over line length
				endsyl = tempcstr.length;
				percent = (cstr.length-startsyl)/(endsyl-startsyl);
			}else{
				percent = (cstr.length-startsyl)/(endsyl-startsyl);
			}
			c++; // Skip '['
			let chord = "";
			while(lines[i][c] !== "]"){ // Store chord (assumes chord does not reach end of line)
				chord += lines[i][c];
				c++;
			}
			arr.push([chord, s, percent]);
		}else{
			if(/[\w\s]/.test(lines[i][c])){ // Only allow whitespaces and letters
				cstr += lines[i][c];
			}
		}
	}
	return arr;
}

function placeChordLine(i, arr){
	let astr = ""; // Store lyrics of this line
	let c = 0;
	for(let a = 0; a < arr.length; a++){ // Go through each character
		let s = syl(astr);
		while(s < arr[a][1] && c < lines[i].length){ // Stop when hit end of line or syllable reached
			if(/[\w\s]/.test(lines[i][c])){ // Only allow whitespaces and letters
				astr += lines[i][c];
			}
			s = syl(astr);
			c++;
		}
		// Measure syllable length(supposed syllable length as hyphenation will occur at different places e.g. syllable: prec|i|ous vs hyphenation: pre|cious)
		let tempastr = astr;
		let tempc = c;
		while(s < arr[a][1]+1 && tempc < lines[i].length){ // Go to start of next syllable
			if(/[\w\s]/.test(lines[i][tempc])){ // Only allow whitespaces and letters
				tempastr += lines[i][tempc];
			}
			s = syl(tempastr);
			tempc++;
		}
		let newc = c+Math.round((tempastr.length-astr.length)*arr[a][2]); // Add percentage of syllable length
		while(c < newc){ // Update new c(that has had percentage of syllable length factored in)
			if(/[\w\s]/.test(lines[i][c])){ // Only allow whitespaces and letters
				astr += lines[i][c];
			}
			c++;
		}
		
		if(c >= lines[i].length){ // End of line
			while(a < arr.length){ // Fill the end of line with remaining chords
				lines[i] += "["+arr[a][0]+"]";
				a++;
			}
			break;
		}else if(c == 0){ // Start of line
			lines[i] = "["+arr[a][0]+"]"+lines[i];
		}else{ // Middle of line
			lines[i] = lines[i].slice(0, c)+"["+arr[a][0]+"]"+lines[i].slice(c);
		}
		c += arr[a][0].length+2;
	}
}

function extractChords(i){
	let arr = [];
	while(lines[i] !== "" && !(/^#.*/.test(lines[i])) && i < lines.length){ // Reach end of chorus or stanza block or end of song
		arr.push(extractChordLine(i));
		i++;
	}
	return [i, arr];
}

function placeChords(i, arr){
	let initiali = i;
	while(lines[i] !== "" && !(/^#.*/.test(lines[i])) && i < lines.length){ // Reach end of chorus or stanza block or end of song or end of chords
		if(i-initiali < arr.length){ // Chords exist up to this line
			placeChordLine(i, arr[i-initiali]);
		}
		i++;
	}
	return i;
}

function processBlock(i){
	if(lines[i].substring(0, 2) === "  "){ // Chorus
		if(lines[i].includes("[")){ // Has chords (assumes first line with chords means entire block with chords)
			let chorusStart = i;
			let result = extractChords(i);
			i = result[0];
			chorusChords.push([result[1], chorusStart, i]); // Add line numbers for reference when needing to insert choruses
			if(chorusChordsAlternate != -1){ // Assume that a new tune will replace an alternating one since there was a chorus that was written
				chorusChordsAlternate = -1;
			}
		}else{ // Doesn't have chords
			if(chorusChords.length > 0){ // Previous chords for chorus exist
				if(chorusChordsWritten == -1){
					chorusChordsWritten = 1;
					if(chorusChords.length > 1){ // Multiple chorus with chords in a row without writing
						chorusChordsAlternate  = 0; // Start from first tune
					}
				}
				let chorusStart = i;
				if(chorusChordsAlternate == -1){ // No alternating chorus tune so pick last available tune
					i = placeChords(i, chorusChords[chorusChords.length-1][0]);
					chorusChords.push([chorusChords[chorusChords.length-1][0], chorusStart, i]);
				}else{ // Has alternating chords
					i = placeChords(i, chorusChords[chorusChordsAlternate][0]);
					chorusChords.push([chorusChords[chorusChordsAlternate][0], chorusStart, i]);
					chorusChordsAlternate = (chorusChordsAlternate+1)%(chorusChords.length); // Alternate/cycle between choruses
				}
			}else{ // No chords for chorus
				while(lines[i] !== "" && !(/^#.*/.test(lines[i])) && i < lines.length){ // Skip chorus block
					i++;
				}
			}
		}
	}else if(/^([0-9]+)$/.test(lines[i])){ // Stanza number
		i++; // Skip stanza number
		if(lines[i].includes("[")){ // Has chords (assumes first line with chords means entire block with chords)
			let result = extractChords(i);
			i = result[0];
			stanzaChords.push(result[1]);
		}else{ // Doesn't have chords
			if(stanzaChords.length > 0){ // Previous chords for stanza exist
				if(stanzaWritten == -1){
					stanzaWritten = 1;
					if(stanzaChords.length > 1){ // Multiple stanzas with chords in a row without writing
						stanzaAlternate  = 0; // Start from first tune
					}
				}
				if(stanzaAlternate == -1){ // No alternating stanza tune so pick last available tune
					i = placeChords(i, stanzaChords[stanzaChords.length-1]);
				}else{ // Has alternating chords
					i = placeChords(i, stanzaChords[stanzaAlternate]);
					stanzaAlternate = (stanzaAlternate+1)%(stanzaChords.length); // Alternate chorus
				}
			}else{
				while(lines[i] !== "" && !(/^#.*/.test(lines[i])) && i < lines.length){ // Skip stanza block
					i++;
				}
			}
		}
		while((lines[i] == "" || /^#.*/.test(lines[i])) && i < lines.length){ // Skip till next block or song ended
			i++;
		}
		if(chorusChords.length > 0 && (i == lines.length || lines[i].substring(0, 2) !== "  ")){ // Has chorus chords and either next block is not chorus or song has finished
			if(chorusWritten == -1){
				chorusWritten = 1;
				if(chorusChords.length > 1){ // Multiple choruses in a row without writing
					chorusAlternate  = 0; // Start from first chorus
				}
			}
			let chorusStart, chorusEnd;
			if(chorusAlternate == -1){ // No alternating chorus tune so pick last available tune
				chorusStart = chorusChords[chorusChords.length-1][1];
				chorusEnd = chorusChords[chorusChords.length-1][2];
			}else{ // Has alternating chords
				chorusStart = chorusChords[chorusAlternate][1];
				chorusEnd = chorusChords[chorusAlternate][2];
				chorusAlternate = (chorusAlternate+1)%(chorusChords.length); // Alternate/cycle between choruses
			}
			if(i == lines.length){ // Hit end of song
				if(lines[lines.length-1] != ""){ // No gap at end of song
					lines.splice(i, 0, ""); // Insert new line for spacing
					i++;
				}
			}
			if(i == lines.length || lines[i].substring(0, 2) !== "  "){ // Not a chorus after stanza or end of song
				// Insert chorus in reverse order to make inserting easier due to splice pushing other items forward
				for(j = chorusEnd-1; j >= chorusStart; j--){
					lines.splice(i, 0, lines[j]);
				}
				i += chorusEnd-chorusStart;
				lines.splice(i, 0, ""); // Insert new line for spacing
			}
		}else{
			i--; // Go back to empty line as while loop will increment
		}
	}
	return i;
}

function processSong(){
	// Reset variables
	tune = Number(song.state.selectedTune);
	lyrics = song.lyricArray()[tune];
	lines = lyrics.split("\n");
	chorusWritten = -1;
	chorusAlternate = -1;
	chorusChordsWritten = -1;
	chorusChordsAlternate = -1;
	stanzaWritten = -1;
	stanzaAlternate = -1;
	chorusChords = [];
	stanzaChords = [];
	let i = 0;
	while(i < lines.length){
		i = processBlock(i);
		i++;
	}
}

function updateSong(){
	let lyrArr = song.lyricArray();
	let combSong = "";
	for(let i = 0; i < lyrArr.length; i++){
		if(i == tune){ // Current tune
			combSong += lines.join("\n");
		}else{ // Other alternate tunes
			combSong += lyrArr[i];
		}
	}
	song.props.lyrics = combSong;
	song.forceUpdate();
}

// Syllable counting code (using js injection)
let js = document.createElement("script");
js.type = "module";
// To change this script, go to https://github.com/sensei-huang/hymn-research/blob/main/syllable.js
// Minify using https://jscompress.com/
js.innerHTML = 'import{syllable}from"https://esm.sh/syllable@5?bundle";import syllables from"https://esm.sh/syllables@2.2.1?bundle";window.syl=function(a){return /(^|\\s)[^\\s]{1,2}$/.test(a)?syllables(a.replace(/[^\\s]{1,2}$/,""),{fallbackSyllablesFunction:syllable})+1:/(^|\\s)[wW]$/.test(a)?syllables(a,{fallbackSyllablesFunction:syllable})-2:syllables(a,{fallbackSyllablesFunction:syllable})},addButtons();';
document.head.appendChild(js);

window.addEventListener('scroll', (e) => {
	if($app.state.page != "index"){ // Assumes $app variable still exists
		e.stopImmediatePropagation(); // Stops scrolling listener on document element if the page is not the index (to stop rerendering).
	}
}, true);
