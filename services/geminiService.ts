import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    
    const prompt = "Transcribe the following audio conversation. Identify each speaker and label them as 'Speaker 1', 'Speaker 2', etc. Provide the transcription in a clear, sequential format where each line starts with the speaker's label followed by a colon.";

    const audioPart = {
        inlineData: {
            data: base64Audio,
            mimeType: mimeType,
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [audioPart, {text: prompt}] },
        });

        return response.text;
    } catch (error) {
        console.error("Error during transcription:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API call failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during transcription.");
    }
};
