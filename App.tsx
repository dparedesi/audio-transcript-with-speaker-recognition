
import React, { useState, useCallback } from 'react';
import { transcribeAudio } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import FileUpload from './components/FileUpload';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setAudioFile(file);
      setTranscription('');
      setError(null);
    }
  };

  const handleTranscribe = useCallback(async () => {
    if (!audioFile) {
      setError('Please select an audio file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscription('');

    try {
      const base64Audio = await fileToBase64(audioFile);
      const result = await transcribeAudio(base64Audio, audioFile.type);
      setTranscription(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to transcribe audio: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [audioFile]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-600">
            Audio Transcription
          </h1>
          <p className="mt-2 text-slate-400">
            Upload an M4A audio file to transcribe and identify speakers.
          </p>
        </header>

        <main className="bg-slate-800/50 rounded-xl shadow-2xl p-6 sm:p-8 border border-slate-700 backdrop-blur-sm">
          <div className="space-y-6">
            <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />
            <div className="flex justify-center">
              <button
                onClick={handleTranscribe}
                disabled={!audioFile || isLoading}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Transcribing...
                  </>
                ) : (
                  'Transcribe Audio'
                )}
              </button>
            </div>
          </div>

          <div className="mt-8">
            {error && <ErrorMessage message={error} />}
            {transcription && !isLoading && <TranscriptionDisplay transcription={transcription} />}
            {!isLoading && !transcription && !error && (
                 <div className="text-center p-8 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
                    <p className="text-slate-400">Your transcription will appear here.</p>
                </div>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
