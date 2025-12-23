const DBname = "extensionCode";
const storeName = "codeStore";
const keyName = "code";

function getCodeIDB(){ // Get code from IDB
	let db;
	const request = indexedDB.open(DBname);
	request.onerror = (event) => { // Couldn't load DB
		console.error(event.target.error);
		alert("Couldn't load extension!");
	};
	request.onupgradeneeded = (event) => { // No DB
		throw new Error("DB didn't exist beforehand"); // Stop creating a DB as there is no internet connection
	};
	request.onsuccess = (event) => { // Could load DB
		try{
			db = event.target.result;
			let tx = db.transaction(storeName, 'readonly');
			let st = tx.objectStore(storeName);
			let gRequest = st.get(keyName);
			gRequest.onsuccess = function() { // Successfully read key
				let extensionCode = gRequest.result;
				if(extensionCode !== undefined){ // There is a entry of code in IDB
					let extensionScript = document.createElement("script");
					extensionScript.type = "text/javascript";
					extensionScript.innerHTML = extensionCode; // Use the IDB code
					document.head.appendChild(extensionScript);
				}else{ // No entry of code in IDB
					alert("Couldn't load extension!");
				}
			}
			gRequest.onerror = function() {
				console.error(gRequest.error);
				alert("Couldn't load extension!");
			}
		}catch(e){ // Most likely object store not created
			console.error(e);
			alert("Couldn't load extension!");
		}
		db.close();
	};
}

function setCodeIDB(code){ // Set code to IDB and also inject script
	let extensionScript = document.createElement("script");
	extensionScript.type = "text/javascript";
	extensionScript.innerHTML = code;
	document.head.appendChild(extensionScript);
	
	let db;
	const request = indexedDB.open(DBname);
	request.onerror = (event) => { // Couldn't load DB
		console.error(event.target.error);
		console.error("Couldn't store script");
	};
	request.onupgradeneeded = (event) => { // No DB beforehand so create new objectstore
		db = event.target.result;
		if(!db.objectStoreNames.contains(storeName)){ // No object store
		  db.createObjectStore(storeName);
		}
	};
	request.onsuccess = (event) => {
		try{
			db = event.target.result;
			let tx = db.transaction(storeName, 'readwrite');
			let st = tx.objectStore(storeName);
			let gRequest = st.put(code, keyName); // Store new version of extension
			gRequest.onerror = function(){
				console.error(gRequest.error);
				console.error("Couldn't store script");
			}
		}catch(e){ // Most likely object store not created
			console.error(e);
			console.error("Couldn't store script");
		}
		db.close();
	};
}

async function injectScript(){
	try{
		const response = await fetch('https://cdn.jsdelivr.net/gh/sensei-huang/hymn-research@latest/songbaseExtension/songBaseExtension.min.js');
		if(!response.ok){ // No internet
			getCodeIDB();
		}else{ // Internet
			const result = await response.text();
			setCodeIDB(result);
		}
	}catch(error){
		getCodeIDB();
		console.error(error.message);
	}
}
injectScript();
