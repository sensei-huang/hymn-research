var hymns = [];
async function getHymnTitle(num) {
  const url = "https://songbase.life/english_hymnal/"+num;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const rtext = await response.text();
    const reg = /<title>([\s\S]*?)<\/title>/;
    if(reg.test(rtext)){
        var txt = document.createElement("textarea");
        txt.innerHTML = rtext.match(reg)[1];
        hymns.push(txt.value);
    }
  } catch (error) {
    console.error(error.message);
  }
}
for(var i = 1; i < 1349; i++){
    getHymnTitle(i);
}
