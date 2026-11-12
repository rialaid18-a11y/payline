export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key set nahi hai Vercel mein.' });
    }

    const systemPrompt = `You are an expert web game developer. Create a complete, single-file HTML game based on this idea: "${prompt}". 
    Return ONLY the raw HTML code (with <style> and <script> tags inside). Do not include markdown formatting like \`\`\`html. Just the raw code. Make it fun and playable.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let gameCode = data.candidates[0].content.parts[0].text;
            gameCode = gameCode.replace(/```html/g, '').replace(/```/g, ''); 
            res.status(200).json({ code: gameCode });
        } else {
            res.status(500).json({ error: 'AI se sahi jawab nahi mila.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
}
