// Fonts of text
const chordFont = "7pt 'Arial Black', Gadget, sans-serif";
const textFont = "10pt Georgia, serif";
const commentFont = "10pt Arial, Helvetica, sans-serif";
const commentType = "h3";
const commentColor = "#434343";
const defaultColor = "#000000";

const canvas = document.createElement("canvas"); // Create canvas
const context = canvas.getContext("2d");

function calcWidth(str, chord){ // Calculate width of text
  if(chord){
    context.font = chordFont;
  }else{
    context.font = textFont;
  }
  return context.measureText(str).width;
}

let lyrics = song.props.lyrics;
let lines = lyrics.split("\n");

const storage = document.createElement('div');
document.body.append(storage);

for(let i = 0; i < lines.length; i++){
  const words = document.createElement('div'); // Element to store the words
  words.style.whiteSpace = "pre-wrap"; // To preserve the tab
  words.style.color = defaultColor; // Font colour
  words.innerText = "";

  let stanzaNumberRegex = /^([0-9]+)$/gm;
  if(stanzaNumberRegex.test(lines[i])){
    words.innerText = lines[i]+"\n";
    i++;
  }
  if(lines[i][0] == "#"){ // Comment
    const comment = document.createElement(commentType); // Comment type
    comment.style.font = commentFont; // Font
    comment.style.color = commentColor; // Font colour
    comment.innerText = "\t"+lines[i].substring(1, lines[i].length);
    storage.append(comment); // Append comment
  }else{ // Stanza/Chorus
    if(lines[i].includes("[")){ // Contains chord
      const chords = document.createElement('div'); // Element to store the chords
      chords.style.whiteSpace = "pre-wrap"; // To preserve the tab
      chords.style.font = chordFont; // Font type
      chords.style.color = defaultColor; // Font colour
      
      let string = ""; // Temporary variable to store lyrics
      for(let j = 0; j < lines[i].length; j++){ // Iterate through line
        if(j == 0 && lines[i].substr(0, 2) == "  "){ // Chorus
          j = 2; // Skip spaces
        }
        if(lines[i][j] == "["){ // Chord found
          j++; // Skip '['
          let chordstring = ""; // Temporary character to store the chord
          for(let k = j; k < lines[i].length; k++){ // Iterate until chord is finished
            if(lines[i][k] == "]"){ // Chord ended
              j = k;
              break;
            }else{
              chordstring += lines[i][k]; // Add character to chord
            }
          }
          let widthNeeded = calcWidth(string, false)-calcWidth(chords.innerText, true); // Width of lyrics minus width of chords lines
          let spaceNeeded = Math.round(widthNeeded/calcWidth(" ", true)); // Calculate spaces needed based on space width
          chords.innerText += " ".repeat(spaceNeeded)+chordstring;
        }else{
          string += lines[i][j]; // Add character to string
        }
      }
      if(lines[i].substr(0, 2) == "  "){ // Chorus
        chords.innerText = "\t\t"+chords.innerText; // Double tab
      }else{
        chords.innerText = "\t"+chords.innerText; // Single tab
      }
      storage.append(chords);
    }
    words.style.font = textFont; // Font
    if(lines[i].substr(0, 2) == "  "){ // Chorus
      words.innerText += "\t\t"+lines[i].substring(2, lines[i].length).replaceAll(/\[.*?\]/g, ""); // Remove chords and double space at start
    }else{
      words.innerText += "\t"+lines[i].replaceAll(/\[.*?\]/g, ""); // Remove chords
    }
    storage.append(words);
  }
}

// Copy text to clipboard
var range = document.createRange();
range.selectNode(storage);
window.getSelection().removeAllRanges(); // clear current selection
window.getSelection().addRange(range); // to select text
document.execCommand("copy");
window.getSelection().removeAllRanges();// to deselect
storage.remove();
alert("Copied song!");
