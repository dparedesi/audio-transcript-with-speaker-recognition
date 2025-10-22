import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    
    const prompt = "Your task is to perform high-accuracy speaker diarization and transcription on the provided audio file. Analyze the distinct vocal characteristics of each individual, such as pitch, tone, and speaking rhythm, as well as the silences and pauses between speech, to precisely identify and separate every speaker. Label the speakers sequentially as 'Speaker 1', 'Speaker 2', and so on. The output should be a verbatim, turn-by-turn transcript in a clear, script-like format. Each line must start with the speaker's assigned label, followed by a colon and their transcribed words. Do not add any commentary or summary outside of the transcription itself.";

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