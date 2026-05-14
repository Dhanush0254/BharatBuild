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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI assistant for BharatBuild, an Indian construction marketplace based in Telangana.
Extract search filters from the following user query. 

The categories are: "workers", "machinery", "materials", "repairs".
The subcategories for workers: "mason", "mestri", "carpenter", "electrician", "painter", "welder", "helper", "tiles worker", "plumbing worker".
The subcategories for machinery: "jcb", "crane", "tractor", "borewell rig", "concrete mixer", "lorry", "excavator".
The subcategories for materials: "sand", "bricks", "cement", "steel", "tiles", "pipes", "aggregates".

User Query: "${query}"

Return ONLY a valid JSON object with these exact keys (if not mentioned in the query, return an empty string for that key):
- category (string, must be one of the 4 main categories, infer if possible)
- subCategory (string, match as closely as possible to the known subcategories)
- locationName (string, e.g., "Kukatpally", "Miyapur")
- search (string, any other keywords like "experienced", "cheap", or specific requests)

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
