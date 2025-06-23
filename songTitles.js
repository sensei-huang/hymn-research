var songs = {};
async function getSongTitle(num) {
  const url = "https://songbase.life/blue_songbook/"+num;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      songs[num] = "Not found";
      throw new Error(`Response status: ${response.status}`);
    }
    const rtext = await response.text();
    const reg = /<title>([\s\S]*?)<\/title>/;
    if(reg.test(rtext)){
        var txt = document.createElement("textarea");
        txt.innerHTML = rtext.match(reg)[1];
        songs[num] = txt.value.replaceAll('"', "'");
    }else{

    }
  } catch (error) {
    console.error(error.message);
  }
}
for(var i = 1; i < 707; i++){
    getSongTitle(i);
}
