const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

async function moderatePhoto(imageUrl, reportReason) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch image and convert to base64 for Gemini
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    const result = await model.generateContent([
      {
        inlineData: { data: base64Image, mimeType },
      },
      `A user reported this photo for: "${reportReason}". Does this photo violate community guidelines (nudity, violence, harassment, hate speech)? Reply with only valid JSON: { "flagged": true or false, "reason": "brief explanation" }`,
    ]);

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { flagged: false, reason: "Could not parse response" };
  } catch (err) {
    console.error("Gemini moderation error:", err.message);
    return { flagged: false, reason: "Moderation service unavailable" };
  }
}

module.exports = { moderatePhoto };
