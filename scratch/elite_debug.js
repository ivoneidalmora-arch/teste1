async function eliteDebug() {
  const key = "AIzaSyBprvxTiWQQp8Yjcq5Au4WMVA8IReeiWCc";
  const models = [
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash-001'
  ];

  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "oi" }] }]
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        console.log(`>>> SUCESSO ABSOLUTO NO MODELO: ${m}`);
        return;
      } else {
        console.log(`FALHA NO ${m} -> ${res.status}: ${data.error?.message}`);
      }
    } catch (err) {
      console.log(`ERRO NO ${m} -> ${err.message}`);
    }
  }
  console.log("NENHUM MODELO DE ELITE FUNCIONOU.");
}

eliteDebug();
