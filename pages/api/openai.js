import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    try {
        const { ingredients } = req.body;
        const ingredientsList = ingredients.join(", ");

      const prompt = `I have the following ingredients: ${ingredientsList}. 
      Create a recipe using only these ingredients. Include steps and measurements.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
        stream: true,
      });

      let recipe = "";
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || "";
        recipe += content;
      }

      res.status(200).json({ recipe });
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ error: "Error generating recipe" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
