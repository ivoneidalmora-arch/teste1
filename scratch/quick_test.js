async function debugKey() {
  const key = "AIzaSyBprvxTiWQQp8Yjcq5Au4WMVA8IReeiWCc";
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "oi" }] }]
      })
    });
    
    if (res.ok) {
      console.log("SUCESSO ABSOLUTO NA V1! A chave é válida.");
    } else {
      const data = await res.json();
      console.log("FALHA NA V1 -> " + res.status + ": " + data.error?.message);
    }
  } catch (err) {
    console.log("ERRO FATAL: " + err.message);
  }
}

debugKey();
