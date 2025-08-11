const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.aiSearch = async (req, res) => {
  try {
    const { query, products } = req.body;

    if (!query || !products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "Request must include 'query' (string) and 'products' (array)",
      });
    }

    // Build prompt for OpenAI
    const prompt = `
You are an intelligent search assistant for an e-commerce store.

Your task:
Given a user query and a product catalog, select the products that best match the intent of the query.
Only consider the product's title, description, category, and price when deciding relevance.

Instructions:
1. Only return a JSON array of product IDs, nothing else — no text before or after.
2. If no products match, return an empty array: []
3. Rank matches by relevance to the query, not just by keyword matching.
4. Include products even if synonyms or related concepts match (e.g., "laptop bag" can match "notebook case").
5. Be strict — do not include unrelated products.

Example:
User query: "leather bag"
Catalog: [{"id":1,"title":"Brown Leather Handbag","description":"Premium leather","category":"bags"}, {"id":2,"title":"Cotton T-Shirt","description":"Casual wear","category":"men's clothing"}]
Expected output: [1]

User query: "${query}"
Catalog (JSON array) between triple backticks:
\`\`\`
${JSON.stringify(products)}
\`\`\`
Return the JSON array now:
`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // good balance of speed and cost
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    // Try parsing the AI response
    let ids;
    try {
      ids = JSON.parse(completion.choices[0].message.content);
    } catch {
      return res
        .status(500)
        .json({ success: false, message: "Invalid AI response format" });
    }

    res.json({ success: true, ids });
  } catch (error) {
    console.error("AI Search Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
