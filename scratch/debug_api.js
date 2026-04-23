async function debugKey() {
  const key = "AIzaSyDdyNXR6Jw2O1xo7kZUrrZNU9uWHNucvW4";
  const versions = ['v1', 'v1beta'];
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];

  for (const v of versions) {
    for (const m of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "oi" }] }]
          })
        });
        
        if (res.ok) {
          console.log(`SUCESSO TOTAL: Versão ${v}, Modelo ${m}`);
          return;
        } else {
          const data = await res.json();
          console.log(`FALHA: Versão ${v}, Modelo ${m} -> ${res.status}: ${data.error?.message}`);
        }
      } catch (err) {
        console.log(`ERRO FATAL: ${v}/${m} -> ${err.message}`);
      }
    }
  }
}

debugKey();
