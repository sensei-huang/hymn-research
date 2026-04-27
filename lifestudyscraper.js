const puppeteer = require('puppeteer');
const latex = require('node-latex');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const readline = require('readline');

// Create an interface for input and output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function createPDF(masterLatex, scale, outputn){
	return new Promise((resolve, reject) => {
		var latexScaled = masterLatex.replace(/~`~/g, scale); //`
		const outputpdf = fs.createWriteStream(outputn);
		const pdf = latex(latexScaled);
		pdf.pipe(outputpdf);
		pdf.on('error', err => {
			console.error("LATEX ERROR:\n", err);
		});
		outputpdf.on('close', async () => {
			try {
				resolve(outputpdf);
			} catch (err) {
				reject(err);
			}
		});
	});	
}

async function latexPage(masterLatex, scale, num){
	await createPDF(masterLatex, scale, num+'.pdf');
	const pdfBytes = fs.readFileSync(num+'.pdf');
	const pdfDoc = await PDFDocument.load(pdfBytes);
	const pageCount = pdfDoc.getPageCount();
	return pageCount;
}

async function compile(masterLatex, i){ 
	let scale = 0.75;
	let pages = await latexPage(masterLatex, scale, i);
	if(pages <= 2){
		while(pages <= 2){
			scale += 0.05;
			scale = Math.round(scale*100)/100;
			pages = await latexPage(masterLatex, scale, i);
		}
		while(pages > 2){
			scale -= 0.01;
			scale = Math.round(scale*100)/100;
			pages = await latexPage(masterLatex, scale, i);
		}
		scale -= 0.01;
		scale = Math.round(scale*100)/100;
		await createPDF(masterLatex, scale, i+".pdf");
	}else{
		while(pages > 2){
			scale -= 0.01;
			scale = Math.round(scale*100)/100;
			pages = await latexPage(masterLatex, scale, i);
		}
	}
	return scale;
}

(async () => {
	const browser = await puppeteer.launch();

	const page = await browser.newPage();

	const book = await askQuestion('Book (https://bibleread.online/life-study-of-the-bible/life-study-of-BOOK/): ');

	const url = 'https://bibleread.online/life-study-of-the-bible/life-study-of-'+book+'/';

	const num = Number(await askQuestion('No. of life studies: '));
	let compnum = 0;

	rl.close();

	for(let i = 1; i < num+1; i++){
		await page.goto(url+i+'/');

		const masterLatex = await page.evaluate(() => {
			let para = document.getElementsByClassName("body")[0].children[0].children;
			let latexArr = ["\\documentclass[10pt]{article}\n\\usepackage[a4paper, margin=1cm]{geometry}\n\\usepackage{relsize}\n\\usepackage{xfp}\n\\usepackage{adjustbox}\n\n\\begin{document}\n\\centering\n"];
			let scaleFactor = "~`~";
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
			latexArr.push("\\end{document}");
			return latexArr.join("").replace(/[\u0400-\u04FF]/g, "~?");
		});

		compile(masterLatex, i).then(async (result) => {
			console.log("Done compiling "+i+".pdf with scale of "+result+".");
			compnum++;
		});
	}
	while(compnum < num){
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	const mergedPdf = await PDFDocument.create();
	for(let i = 1; i < num+1; i++){
		const pdfBytes = fs.readFileSync(i+'.pdf');
    const pdf = await PDFDocument.load(pdfBytes);

    // Copy all pages from the source document
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
		copiedPages.forEach((page) => mergedPdf.addPage(page));
	}
	const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync(book+'.pdf', mergedPdfBytes);
  console.log(`Merged PDF saved to: ${book+'.pdf'}`);
	process.exit();
})();
