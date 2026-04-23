const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI("AIzaSyDiXJ9wpfyycpjxw-OeZAJwlKgnqcR6uj0");
  try {
     // O SDK do JS não tem um listModels direto simples no v1, mas podemos testar o pro
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
     const result = await model.generateContent("Oi");
     console.log("PRO FUNCIONOU!");
  } catch (err) {
    console.error("PRO FALHOU:", err.message);
  }
}

listModels();
