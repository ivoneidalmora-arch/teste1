const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
  const genAI = new GoogleGenerativeAI("AIzaSyDiXJ9wpfyycpjxw-OeZAJwlKgnqcR6uj0");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Diga 'Olá Mundo'");
    console.log("Resposta da IA:", result.response.text());
    console.log("CHAVE VÁLIDA!");
  } catch (err) {
    console.error("ERRO NA CHAVE:", err.message);
  }
}

testKey();
