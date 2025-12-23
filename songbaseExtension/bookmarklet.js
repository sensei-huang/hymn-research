async function getCode(){
	try{
		const response = await fetch('https://cdn.jsdelivr.net/gh/sensei-huang/hymn-research@latest/songbaseExtension/songBaseExtension.min.js');
		if(!response.ok){ // No internet
			let extensionCode = localStorage.getItem("extensionCode");
			if(extensionCode !== null){ // There is localstorage version
				let extensionScript = document.createElement("script");
				extensionScript.type = "text/javascript";
				extensionScript.innerHTML = extensionCode; // Use the localstorage version
				document.head.appendChild(extensionScript);
			}else{ // No localstorage version
				alert("Couldn't load extension!");
			}
		}else{ // Internet
			const result = await response.text();
			localStorage.setItem("extensionCode", result); // Store new version of extension
			let extensionScript = document.createElement("script");
			extensionScript.type = "text/javascript";
			extensionScript.innerHTML = result;
			document.head.appendChild(extensionScript);
		}
	}catch(error){
		let extensionCode = localStorage.getItem("extensionCode");
		if(extensionCode !== null){ // There is localstorage version
			let extensionScript = document.createElement("script");
			extensionScript.type = "text/javascript";
			extensionScript.innerHTML = extensionCode; // Use the localstorage version
			document.head.appendChild(extensionScript);
		}else{ // No localstorage version
			alert("Couldn't load extension!");
		}
		console.error(error.message);
	}
}
getCode();
