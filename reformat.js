const measure = document.createElement('div');
measure.style = "position: absolute; visibility: hidden; height: auto; width: auto; white-space: pre-wrap;";
document.body.append(measure);
function calcWidth(str, chord){
  if(chord){
    measure.style.fontFamily = "'Arial Black', Gadget, sans-serif"; // Font type
    measure.style.fontSize = "7pt"; // Font size
  }else{
    measure.style.fontFamily = "Georgia, serif"; // Font type
    measure.style.fontSize = "10pt"; // Font size
  }
  measure.innerText = str;
  width = measure.clientWidth+1;
  measure.innerText = "";
  return width;
}

let json = document.getElementsByClassName("application-container")[0].children[0].getAttribute("data-react-props");
let parsed = JSON.parse(json);
let lyrics = parsed.preloaded_song.lyrics;
let lines = lyrics.split('\n');

const storage = document.createElement('div');
document.body.append(storage);

for(let i = 0; i < lines.length; i++){
  const words = document.createElement('div'); // Element to store the words
  words.style.whiteSpace = "pre-wrap"; // To preserve the tab
  if(lines[i][0] == "#"){
    words.style.fontFamily = "Georgia, serif"; // Font type
    words.style.fontSize = "10pt"; // Font size
    words.style.fontWeight = 'bold'; // Bold
    words.style.color = "#999999"; // Font colour
    words.innerText = "\t"+lines[i].substring(1, lines[i].length);
    storage.append(words);
  }else{
    if(lines[i].includes("[")){
      const chords = document.createElement('div'); // Element to store the chords
      chords.style.whiteSpace = "pre-wrap"; // To preserve the tab
      chords.style.fontFamily = "'Arial Black', Gadget, sans-serif"; // Font type
      chords.style.fontSize = "7pt"; // Font size
      chords.style.color = "#000000"; // Font colour
      let string;
      for(let j = 0; j < lines[i].length; j++){
        if(j == 0 && lines[i].substr(0, 2) == "  "){
          j = 2;
        }
        if(lines[i][j] == "["){
          j++;
          let chordstring = "";
          for(let k = j; k < lines[i].length; k++){
            if(lines[i][k] == "]"){
              j = k+1;
              break;
            }else{
              chordstring += lines[i][k];
            }
          }
          let widthNeeded = calcWidth(string, false)+calcWidth(chordstring, true)/2-calcWidth(chords.innerText, true);
          let spaceNeeded = Math.ceil(widthNeeded/calcWidth(" ", true));
          chords.innerText += " ".repeat(spaceNeeded)+chordstring;
        }else{
          string += lines[i][j];
        }
      }
      if(lines[i].substr(0, 2) == "  "){
        chords.innerText = "\t\t"+chords.innerText;
      }else{
        chords.innerText = "\t"+chords.innerText;
      }
      storage.append(chords);
    }
    words.style.fontFamily = "Georgia, serif"; // Font type
    words.style.fontSize = "10pt"; // Font size
    words.style.color = "#000000"; // Font colour
    if(lines[i].substr(0, 2) == "  "){
      words.innerText = "\t\t"+lines[i].substring(2, lines[i].length).replaceAll(/\[.*?\]/g, "");
    }else{
      words.innerText = "\t"+lines[i].replaceAll(/\[.*?\]/g, "");
    }
    storage.append(words);
  }
}

var range = document.createRange();
range.selectNode(storage);
window.getSelection().removeAllRanges(); // clear current selection
window.getSelection().addRange(range); // to select text
document.execCommand("copy");
window.getSelection().removeAllRanges();// to deselect
storage.remove();
