async function superDebug() {
  const key = "AIzaSyBprvxTiWQQp8Yjcq5Au4WMVA8IReeiWCc";
  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-flash-latest'
  ];

  console.log("INICIANDO SUPER DIAGNÓSTICO...");

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
        console.log(`>>> SUCESSO NO MODELO: ${m}`);
        return;
      } else {
        console.log(`FALHA NO ${m} -> ${res.status}: ${data.error?.message}`);
      }
    } catch (err) {
      console.log(`ERRO NO ${m} -> ${err.message}`);
    }
  }
  console.log("NENHUM MODELO FUNCIONOU.");
}

superDebug();
