
import React, { useMemo } from 'react';

interface TranscriptionDisplayProps {
  transcription: string;
}

interface TranscriptionTurn {
  speaker: string;
  text: string;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ transcription }) => {
  const parsedTranscription = useMemo<TranscriptionTurn[]>(() => {
    if (!transcription) return [];
    
    // Split text into turns based on "Speaker X:" pattern
    const turns: TranscriptionTurn[] = [];
    const lines = transcription.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        const match = line.match(/^(Speaker \d+):(.*)/i);
        if (match) {
            turns.push({ speaker: match[1].trim(), text: match[2].trim() });
        } else if (turns.length > 0) {
            // Append to the previous turn if it's a continuation line
            turns[turns.length - 1].text += `\n${line.trim()}`;
        } else {
            // If the first line doesn't match, treat it as general text without a speaker
            turns.push({ speaker: 'Transcription', text: line.trim() });
        }
    });

    return turns;
  }, [transcription]);

  return (
    <div className="w-full bg-slate-900/50 rounded-lg p-6 border border-slate-700 max-h-[50vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Transcription Result</h2>
      <div className="space-y-4 text-slate-300 whitespace-pre-wrap">
        {parsedTranscription.length > 0 ? (
          parsedTranscription.map((turn, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2">
              <span className="font-bold text-indigo-400 w-28 flex-shrink-0">{turn.speaker}:</span>
              <p className="flex-1">{turn.text}</p>
            </div>
          ))
        ) : (
          <p>Could not parse the transcription. Displaying raw text:</p>
        )}
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
