import React, { useMemo, useState, useEffect, useCallback } from 'react';

interface TranscriptionDisplayProps {
  transcription: string;
}

interface TranscriptionTurn {
  speaker: string;
  text: string;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ transcription }) => {
  const [speakerNames, setSpeakerNames] = useState<{ [key: string]: string }>({});

  const { parsedTranscription, uniqueSpeakers } = useMemo(() => {
    if (!transcription) return { parsedTranscription: [], uniqueSpeakers: [] };
    
    const turns: TranscriptionTurn[] = [];
    const speakerSet = new Set<string>();
    const lines = transcription.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        const match = line.match(/^(Speaker \d+):(.*)/i);
        if (match) {
            const speaker = match[1].trim();
            turns.push({ speaker, text: match[2].trim() });
            speakerSet.add(speaker);
        } else if (turns.length > 0) {
            turns[turns.length - 1].text += `\n${line.trim()}`;
        } else {
            turns.push({ speaker: 'Transcription', text: line.trim() });
        }
    });
    
    const uniqueSpeakers = Array.from(speakerSet).sort((a, b) => {
        const numA = parseInt(a.split(' ')[1]);
        const numB = parseInt(b.split(' ')[1]);
        return numA - numB;
    });
    return { parsedTranscription: turns, uniqueSpeakers };
  }, [transcription]);

  useEffect(() => {
    const initialNames: { [key: string]: string } = {};
    uniqueSpeakers.forEach(speaker => {
      initialNames[speaker] = speaker;
    });
    setSpeakerNames(initialNames);
  }, [uniqueSpeakers]);

  const handleNameChange = (originalName: string, newName: string) => {
    setSpeakerNames(prev => ({ ...prev, [originalName]: newName }));
  };

  const generateDownloadContent = useCallback((format: 'txt' | 'md'): string => {
    return parsedTranscription.map(turn => {
        const speakerName = speakerNames[turn.speaker] || turn.speaker;
        if (format === 'md') {
            return `**${speakerName}:** ${turn.text}`;
        }
        return `${speakerName}: ${turn.text}`;
    }).join('\n\n');
  }, [parsedTranscription, speakerNames]);

  const handleDownload = (format: 'txt' | 'md') => {
    const content = generateDownloadContent(format);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcription.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const content = generateDownloadContent('md');
    const file = new File([content], "transcription.md", { type: "text/markdown" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Transcription',
          files: [file],
          text: 'Here is the transcription.',
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing file:', error);
        }
      }
    } else {
      try {
        await navigator.share({
          title: 'Transcription',
          text: content,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing text:', error);
        }
      }
    }
  };

  return (
    <div className="w-full bg-slate-900/50 rounded-lg p-6 border border-slate-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-cyan-400">Transcription Result</h2>
        {parsedTranscription.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleDownload('txt')} className="px-3 py-1.5 text-sm font-semibold bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors">Download .txt</button>
                <button onClick={() => handleDownload('md')} className="px-3 py-1.5 text-sm font-semibold bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors">Download .md</button>
                {typeof navigator.share === 'function' && (
                  <button onClick={handleShare} className="px-3 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">Share</button>
                )}
            </div>
        )}
      </div>
      
      {uniqueSpeakers.length > 0 && (
        <div className="mb-6 p-4 bg-slate-800/60 rounded-lg border border-slate-700">
            <h3 className="font-semibold mb-3 text-slate-300">Edit Speaker Names</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {uniqueSpeakers.map(speaker => (
                    <div key={speaker} className="flex items-center gap-2">
                        <label htmlFor={`speaker-${speaker}`} className="font-medium text-slate-400 w-24 flex-shrink-0">{speaker}:</label>
                        <input
                            id={`speaker-${speaker}`}
                            type="text"
                            value={speakerNames[speaker] || ''}
                            onChange={(e) => handleNameChange(speaker, e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="space-y-4 text-slate-300 whitespace-pre-wrap max-h-[40vh] overflow-y-auto pr-2">
        {parsedTranscription.length > 0 ? (
          parsedTranscription.map((turn, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2">
              <span className="font-bold text-indigo-400 w-28 flex-shrink-0">
                {(speakerNames[turn.speaker] || turn.speaker)}:
              </span>
              <p className="flex-1">{turn.text}</p>
            </div>
          ))
        ) : (
          <p className="text-slate-500">Could not parse the transcription. Displaying raw text:</p>
        )}
      </div>
    </div>
  );
};

export default TranscriptionDisplay;