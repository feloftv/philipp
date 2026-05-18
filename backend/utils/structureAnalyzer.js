async function analyzeStructure(subtitles, title) {
  try {
    console.log('📊 Analizando estructura...');
    
    const prompt = `Eres un experto analizador de contenido educativo y sermones.

Título: "${title}"

Contenido:
${subtitles.substring(0, 3000)}

Detecta los BLOQUES TEMÁTICOS principales. Para cada bloque:
1. Título descriptivo (máx 50 caracteres)
2. Descripción breve (1-2 líneas)

RESPONDE SOLO EN JSON:
{
  "bloques": [
    {"titulo": "...", "descripcion": "..."}
  ]
}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY no está configurada');
      return {
        success: false,
        error: 'API Key no configurada'
      };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error de Claude:', error);
      return {
        success: false,
        error: error.error?.message || 'Error al analizar estructura'
      };
    }

    const data = await response.json();
    const jsonText = data.content[0].text
      .replace(/\`\`\`json\n?/g, '')
      .replace(/\`\`\`\n?/g, '')
      .trim();

    console.log('✓ Bloques detectados');

    const parsed = JSON.parse(jsonText);

    return {
      success: true,
      bloques: parsed.bloques || []
    };

  } catch (error) {
    console.error('Error analizando estructura:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { analyzeStructure };
