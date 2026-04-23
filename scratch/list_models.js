async function listModels() {
  const key = "AIzaSyBprvxTiWQQp8Yjcq5Au4WMVA8IReeiWCc";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (res.ok) {
      console.log("SUCESSO! Modelos liberados para você:");
      data.models.forEach(m => console.log("- " + m.name));
    } else {
      console.log("ERRO AO LISTAR -> " + res.status + ": " + data.error?.message);
    }
  } catch (err) {
    console.log("ERRO FATAL: " + err.message);
  }
}

listModels();
