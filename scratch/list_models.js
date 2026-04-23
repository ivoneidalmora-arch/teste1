async function listModels() {
  const key = "AIzaSyB42HiEwXbQOlAV2f9JGT5Ni75hHPyDBH0";
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (res.ok) {
      console.log("MODELOS DISPONÍVEIS:");
      data.models.forEach(m => console.log("- " + m.name));
    } else {
      console.log("ERRO AO LISTAR MODELOS -> " + res.status + ": " + data.error?.message);
    }
  } catch (err) {
    console.log("ERRO FATAL: " + err.message);
  }
}

listModels();
