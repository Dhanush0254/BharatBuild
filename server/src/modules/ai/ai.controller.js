const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.parseSearchQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured in .env' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an advanced multilingual AI assistant for BharatBuild, an Indian construction marketplace based in Telangana.
Your job is to understand user queries in English, Telugu, Hindi, or Hinglish/Telugish and map their intent to exact system categories.
Even if the user uses synonyms or regional terms (e.g., "bavilu" -> "borewell rig", "samanu" -> "materials", "mistri" -> "Mestri", "kavali" -> need), map it to the closest match.

System Categories: "workers", "machinery", "materials", "repairs".
System Subcategories:
- workers: "Mestri", "Mason", "Carpenter", "Electrician", "Painter", "Welder", "Plumber", "Tile Worker", "POP Worker", "Helper", "AC Technician"
- machinery: "JCB", "Crane", "Dumper", "Tractor", "Concrete Mixer", "Borewell Rig"
- materials: "Sand", "Cement", "Bricks", "Steel", "Gravel", "Tiles"
- repairs: "AC Repair", "Electrical Repair", "Plumbing Repair", "Borewell Repair"

User Query: "${query}"

Return ONLY a valid JSON object with exactly these keys (if not mentioned in the query, return an empty string):
- category (string): MUST be one of the 4 main categories. Infer from context.
- subCategory (string): MUST be an exact match from the System Subcategories list above. If the user asks for a synonym, map it to the standard term.
- locationName (string): Extract location if mentioned (e.g., "Kukatpally", "Miyapur").
- search (string): Any remaining context (e.g., "experienced", "urgently", "2 quantity"). Do NOT put location or category here.

Do not include markdown blocks or any other text. Return raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up markdown formatting if Gemini returns it
    const jsonStr = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const parsedData = JSON.parse(jsonStr);

    res.status(200).json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error('AI Parse Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request with AI' });
  }
};
