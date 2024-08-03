import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { items } = req.body;
        console.log(items);
        const command_with_items = `Give me some recipes with the following ingredients: ${items}`;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: command_with_items,
                    },
                ],
                model: "llama3-70b-8192",
            });

            const recipes = completion.choices[0]?.message?.content.split('\n') || [];
            res.status(200).json({ recipes });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching recipes' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
