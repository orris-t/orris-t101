'use client';

import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState('');
  const [thinking, setThinking] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateStory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError('Please enter a medical topic');
      return;
    }

    setLoading(true);
    setError('');
    setStory('');
    setThinking('');
    setStatus('Starting...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            switch (data.type) {
              case 'status':
                setStatus(data.message);
                break;
              case 'thinking':
                setThinking(data.content);
                break;
              case 'story':
                setStory(data.content);
                setStatus('');
                break;
              case 'error':
                setError(data.message);
                setStatus('');
                break;
            }
          } catch (e) {
            console.error('Error parsing response:', e);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Orris Stories
            </h1>
            <p className="text-xl text-gray-600">
              Your cognitive copilot for medical residents
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Powered by web search, extended thinking, and Claude Sonnet 4.5
            </p>
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={generateStory}>
              <div className="mb-6">
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter a medical topic
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., DKA, Stroke, Shock, Hypertension"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Story'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Progress Status */}
          {status && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <p className="text-indigo-600 font-medium">{status}</p>
              </div>
            </div>
          )}

          {/* Thinking Process */}
          {thinking && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Extended Thinking
              </h2>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-amber-800 font-sans text-sm leading-relaxed bg-amber-100/50 p-4 rounded-lg">
                  {thinking}
                </pre>
              </div>
            </div>
          )}

          {/* Story Output */}
          {story && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Generated Story
              </h2>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-800 font-sans text-base leading-relaxed">
                  {story}
                </pre>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(story);
                    alert('Story copied to clipboard!');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Copy Story
                </button>
                {thinking && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `THINKING:\n${thinking}\n\nSTORY:\n${story}`
                      );
                      alert('Full content copied to clipboard!');
                    }}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    Copy with Thinking
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 text-sm">
        <p>Powered by Claude Sonnet 4.5 • Azure Anthropic • Tavily Search</p>
      </footer>
    </div>
  );
}
