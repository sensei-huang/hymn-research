let para = document.getElementsByClassName("body")[0].children[0].children;
let latexArr = ["\\documentclass[10pt]{article}\n\\usepackage[a4paper, margin=1cm]{geometry}\n\\usepackage{relsize}\n\\usepackage{fp}\n\\usepackage{adjustbox}\n\n\\begin{document}\n\\begin{center}"];
let scaleFactor = "0.65";
let portions = 3;
let wordTotal = 0;
for(let i = 0; i < para.length; i++){
    if(para[i].tagName == "P" && para[i].innerText != ""){
        wordTotal += para[i].innerText.split(' ').length;
    }
}
let wordCount = 0;
let portionCount = 1;
for(let i = 0; i < para.length; i++){
    let latex = "";
    if(para[i].tagName == "P" && para[i].innerText != ""){
        latex += "\\scalebox{"+scaleFactor+"}{\n\\parbox{\\fpeval{\\textwidth/"+scaleFactor+"}pt}{\n";
        latex += para[i].innerText;
        latex += "\n}\n}\n\\vspace{1pt}\n";
        latexArr.push(latex);
        wordCount += para[i].innerText.split(' ').length;
        if(wordCount >= wordTotal/portions*portionCount && portionCount != portions){
            portionCount++;
            latexArr.push("\\noindent\\rule{\\textwidth}{1pt}\n");
        }
    }
    if(para[i].tagName == "H1" || para[i].tagName == "H2" && para[i].innerText != ""){
        latex += "\\scalebox{"+scaleFactor+"}{\n\\parbox{\\fpeval{\\textwidth/"+scaleFactor+"}pt}{\n\\textbf{";
        latex += para[i].innerText;
        latex += "}\n}\n}\n\\vspace{1pt}\n";
        latexArr.push(latex);
        wordCount += para[i].innerText.split(' ').length;
        if(wordCount >= wordTotal/portions*portionCount && portionCount != portions){
            portionCount++;
            latexArr.push("\\noindent\\rule{\\textwidth}{1pt}\n");
        }
    }
}
latexArr.push("\\end{center}\n\\end{document}");

// Copy text to clipboard
const storage = document.createElement('div');
document.body.append(storage);
storage.innerText = latexArr.join("");
var range = document.createRange();
range.selectNode(storage);
window.getSelection().removeAllRanges(); // clear current selection
window.getSelection().addRange(range); // to select text
document.execCommand("copy");
window.getSelection().removeAllRanges();// to deselect
storage.remove();
/*
When document.execCommand doesn't work, switch to the next approach:
const clipboardItem = new ClipboardItem({ 
  'text/html': new Blob([html], { type: 'text/html' }),
  'text/plain': new Blob([html], { type: 'text/plain' })
});

navigator.clipboard.write([clipboardItem])
  .then(() => console.log("clipboard.write() Ok"))
  .catch(error => alert(error))
*/
alert("Copied latex!");
