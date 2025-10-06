let json = document.getElementsByClassName("application-container")[0].children[0].getAttribute("data-react-props");
let parsed = JSON.parse(json);
let lyrics = parsed.preloaded_song.lyrics;
let lines = lyrics.split('\n');

const storage = document.createElement('div');
document.body.append(storage);

for(let i = 0; i < lines.length; i++){
  const words = document.createElement('div'); // Element to store the words
  if(lines[i][0] == "#"){
    words.style.fontFamily = "Georgia, serif"; // Font type
    words.style.fontSize = "10pt"; // Font size
    words.style.fontWeight = 'bold'; // Bold
    words.style.color = "#999999"; // Font colour
    words.style.whiteSpace = "pre-wrap"; // To preserve the tab
    words.innerText = "\t"+lines[i].substring(1, lines[i].length);
    storage.append(words);
  }else if(lines[i].substr(0, 2) == "  "){
    words.style.fontFamily = "Georgia, serif"; // Font type
    words.style.fontSize = "10pt"; // Font size
    words.style.color = "#FFFFFF"; // Font colour
    words.style.whiteSpace = "pre-wrap"; // To preserve the tab
    words.innerText = "\t\t"+lines[i].substring(2, lines[i].length);
    storage.append(words);
  }
}

// p { font-family:Georgia, serif; font-size: 10pt;}
// p { font-family: 'Arial Black', Gadget, sans-serif; font-size: 7pt;}

var range = document.createRange();
range.selectNode(storage);
window.getSelection().removeAllRanges(); // clear current selection
window.getSelection().addRange(range); // to select text
document.execCommand("copy");
window.getSelection().removeAllRanges();// to deselect
storage.remove();
