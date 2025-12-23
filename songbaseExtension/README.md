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
   - Replace '\\' with '\\\\\\\\'
   - Replace '\\\\\\\\s' with '\\\\s' for non-capital s's
   - Find and replace the string occuring after 'js.innerHTML = '
 - songBaseExtension.js
   - Minify it using https://happyformatter.com/javascript/online/
   - Replace songBaseExtension.min.js
 - songBaseExtension.min.js
   - Purge the cache from jsdelivr using https://www.jsdelivr.com/tools/purge and entering https://cdn.jsdelivr.net/gh/sensei-huang/hymn-research@latest/songbaseExtension/songBaseExtension.min.js
 - bookmarklet.js
   - Minify it using https://minify-js.com/
   - Find and replace the string occuring after 'const js = `(() => {' in https://github.com/sensei-huang/sensei-huang.github.io/edit/main/songbase-extension.html
