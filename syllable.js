import {syllable} from 'https://cdn.jsdelivr.net/npm/syllable@5/+esm';
import syllables from 'https://cdn.jsdelivr.net/npm/syllables@2.2.1/+esm'; 
window.syl = function(word){
	// Double \ to stop string from tampering
	if(/(^|\\s)[^\\s]{1,2}$/.test(word)){ // Eliminate small words like "th" from being two syllables
		return syllables(word.replace(/[^\\s]{1,2}$/, ""), { fallbackSyllablesFunction: syllable })+1;
	}else if(/(^|\\s)[wW]$/.test(word)){ // Eliminate w from being three syllables
		return syllables(word, { fallbackSyllablesFunction: syllable })-2;
	}else{
		return syllables(word, { fallbackSyllablesFunction: syllable });
	}
}
addButtons();
