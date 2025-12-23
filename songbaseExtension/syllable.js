import {syllable} from 'https://cdn.jsdelivr.net/npm/syllable@5/+esm';
import syllables from 'https://cdn.jsdelivr.net/npm/syllables@2.2.1/+esm'; 
window.syl = function(word){
	// Double \ to stop string from tampering
	if(/(^|\\s)[^\\s]{1,3}$/.test(word)){ // Eliminate words from becoming pronounced as separate letters in CMU dictionary
		return syllables(word.replace(/[^\\s]{1,3}$/, ""), { fallbackSyllablesFunction: syllable })+syllable(word.match(/[^\\s]{1,4}$/)[0]);
	}else if(/(^|\\s)[wW]$/.test(word)){ // Eliminate w from being three syllables
		return syllables(word, { fallbackSyllablesFunction: syllable })-2;
	}else{
		return syllables(word, { fallbackSyllablesFunction: syllable });
	}
}
addButtons();