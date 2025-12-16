import {syllable} from 'https://esm.sh/syllable@5?bundle';
import syllables from 'https://esm.sh/syllables@2.2.1?bundle'; 
window.syl = function(word){
	if(word.length == 0){
		return 0;
	}else if(word.length <= 2){ // To eliminate words like 'W' from becoming 3 syllables
		return 1;
	}else{
		return syllables(word, { fallbackSyllablesFunction: syllable });
	}
}
runCode();
addButtons();
setInterval(function(){ // Check if tune changed
	if(song.state.selectedTune != lastTune){
		lastTune = song.state.selectedTune;
		runCode();
	}
}, 100);
