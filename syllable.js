import {syllable} from 'https://esm.sh/syllable@5?bundle';
import syllables from 'https://esm.sh/syllables@2.2.1?bundle'; 
window.syl = function(word){
	// Double \ to stop string from tampering
	if(/(^|\\s)[^\\s]{1,2}$/.test(word)){ // Eliminate small words like "th" from being two syllables
		return syllables(word.replace(/(.*(?:^|\\s))[^\\s]{1,2}$/, ""), { fallbackSyllablesFunction: syllable })+1;
	}else if(/(^|\\s)[wW]$/.test(word)){ // Eliminate w from being three syllables
		return syllables(word, { fallbackSyllablesFunction: syllable })-2;
	}else{
		return syllables(word, { fallbackSyllablesFunction: syllable });
	}
}
addButtons();
