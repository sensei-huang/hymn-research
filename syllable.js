import {syllable} from 'https://esm.sh/syllable@5?bundle';
import syllables from 'https://esm.sh/syllables@2.2.1?bundle'; 
window.syl = function(word){
	// Double \ to stop string from tampering
	if(/(^|\\s)[wW]$/.test(word)){ // Eliminate w from being three syllables
		return syllables(word, { fallbackSyllablesFunction: syllable })-2;
	}else{
		return syllables(word, { fallbackSyllablesFunction: syllable });
	}
}
processSong();
addButtons();
setInterval(function(){ // Check if tune or song changed
	if(song.state.selectedTune != lastTune || lyrics != lastSong){
		lyrics = song.props.lyrics;
		// Double \ to stop string from tampering
		lines = lyrics.split("\\n");
		processSong();
		lastTune = song.state.selectedTune;
	}
}, 100);
