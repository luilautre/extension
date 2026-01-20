const params = new URLSearchParams(window.location.search);
proc=params.get('PROC')
if (proc="PAGE_ACCUEIL") {
	document.body.les.devoirs=document.body.les.devoirs+fichier.xml.devoirs
} else{if (proc="PAGE_DEVOIRS") {
		document.body.les.devoirs=document.body.les.devoirs+fichier.xml.devoirs
	} else {
		console.log(`devoirs ${fichier.xml.devoirs}`)
	}
}