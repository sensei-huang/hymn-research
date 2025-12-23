# Updating code instructions
Note: Use online VS code (press .) to edit songBaseExtension.js and songBaseExtension.min.js

HTML:
 - navbar.html
   - Minify using https://codebeautify.org/html-compressor
   - Find and replace the string occuring after 'navbar.innerHTML = '
 - zoom.html
   - Minify using https://codebeautify.org/html-compressor
   - Find and replace the string occuring after 'div3.innerHTML = '

CSS:
 - songBaseExtension.css
   - Minify using https://csscompressor.com/
   - Find and replace the string occuring after 'style.innerHTML = '

JS:
 - syllable.js
   - Bundle it using https://bundlejs.com/
   - Replace '\\' with '\\\\'
   - Find and replace the string occuring after 'js.innerHTML = '
 - songBaseExtension.js
   - Minify it using https://minify-js.com/
   - Configure settings to top-level on and EMCA 5
   - Replace songBaseExtension.min.js
 - songBaseExtension.min.js
   - Purge the cache from jsdelivr using https://www.jsdelivr.com/tools/purge
