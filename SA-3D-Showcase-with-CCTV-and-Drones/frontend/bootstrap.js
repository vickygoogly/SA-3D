try {
 const responses=await Promise.all([fetch('/api/state'),fetch('/api/config')]);
 if(responses.some(r=>!r.ok))throw new Error('Backend request failed');
 [window.SA_INITIAL,window.SA_CONFIG]=await Promise.all(responses.map(r=>r.json()));
 await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./app.js';script.onload=resolve;script.onerror=reject;document.body.append(script);});
 await import('./twin.js');
} catch(error) {
 console.error(error);
 const node=document.getElementById('twin-loading');
 if(node)node.textContent='Unable to start. Run npm start from the project folder and open http://localhost:8080. Check the terminal for details.';
}
