var hymnInstances = {};
async function getHymnInstance(num) {
  const url = "https://songbase.life/english_hymnal/"+num;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      hymnInstances[num] = "Not found";
      throw new Error(`Response status: ${response.status}`);
    }
    const html = await response.text();
    const reg = /<div data-react-class="SongApp" data-react-props="(.*?)<\/div>/;
    if(reg.test(html)){
        var txt = document.createElement("textarea");
        txt.innerHTML = html.match(reg)[1];
        const reg2 = /"lyrics":".*?\\n\\n([\s\S]*?)\\n\\n/;
        var div = txt.value;
        if(reg2.test(div)){
            var firststanza = div.match(reg2)[1];
            hymnInstances[num] = "https://hymnary.org/search?qu="+firststanza.replaceAll(/\[.*?\]/g, "").replaceAll("\\n", " ").replaceAll('\\"', "").replaceAll(':', " ").replaceAll(/\d/g, " ")+"in:instance";
        }
    }
  } catch (error) {
    console.error(error.message);
  }
}
for(var i = 1; i < 1349; i++){
    getHymnInstance(i);
}
var i = 1;
function next(){
  window.open(encodeURI(hymnInstances[i])).focus();
  console.log(i);
  console.log(hymnInstances[i]);
  i++;
}
next();
