export const describeImage = async (imageBase64: string, prompt: string): Promise<string> => {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
            messages: [{
            role: 'user',
            content: [
                {
                type: 'image_url',
                image_url: { url: `data:image/png;base64,${imageBase64}` }
                },
                {
                type: 'text',
                text: `${prompt}. Describe everything within 3 lines. Be specific about shapes, objects, composition and resemblance. Be friendly and humanlike.`
                }
            ]
            }],
        }),
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? 'Wtf did you draw??';
    } catch (err) {
        console.log('Enhance error:', err);
        return 'Could not describe the sketch.';
    }
};