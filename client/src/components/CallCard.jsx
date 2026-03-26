import { useState, useEffect } from 'react';
import { generateContent } from '../api';

export default function CallCard({ contact, onNext, onPrev }) {
  const [aiContent, setAiContent] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    fetchAiContent();
  }, [contact.id]);

  async function fetchAiContent() {
    setAiLoading(true);
    setAiError(null);
    setAiContent(null);
    try {
      const content = await generateContent(contact);
      setAiContent(content);
    } catch (err) {
      setAiError(err.response?.data?.error || 'Failed to generate script and objections');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">

      {/* ── Row 1: Identity | Company Info ── */}
      <div className="grid grid-cols-2 gap-px bg-gray-200">
        {/* Left: Name / Position / Company */}
        <div className="bg-white px-8 py-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Contact</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{contact.fullName}</p>
          <p className="text-base text-blue-600 font-medium mt-1">{contact.role}</p>
          <p className="text-base text-gray-600 mt-1">{contact.company.name}</p>
          {contact.company.location && (
            <p className="text-sm text-gray-400 mt-1">{contact.company.location}</p>
          )}
          {contact.phone && (
            <p className="text-sm text-gray-500 mt-3 font-mono">{contact.phone}</p>
          )}
        </div>

        {/* Right: Employees / Use case */}
        <div className="bg-white px-8 py-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Company</p>
          {contact.company.employees && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Employees</p>
              <p className="text-xl font-bold text-gray-900">{contact.company.employees}</p>
            </div>
          )}
          {contact.useCase && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Use Case</p>
              <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg">
                {contact.useCase}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Pain Points ── */}
      <div className="bg-amber-50 border-y border-amber-100 px-8 py-5">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Pain Points</p>
        {contact.painPoints && contact.painPoints.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {contact.painPoints.map((point, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 bg-white border border-amber-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg"
              >
                <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {point}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">No pain points listed for this contact.</p>
        )}
      </div>

      {/* ── Row 3: Script | Objections ── */}
      <div className="grid grid-cols-2 gap-px bg-gray-200 min-h-64">
        {/* Script */}
        <div className="bg-white px-8 py-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Script</p>
          {aiLoading && <AiSkeleton lines={8} />}
          {aiError && <AiError error={aiError} onRetry={fetchAiContent} />}
          {aiContent && (
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {aiContent.script}
            </pre>
          )}
        </div>

        {/* Objections */}
        <div className="bg-gray-50 px-8 py-6 border-l border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Objections</p>
          {aiLoading && <AiSkeleton lines={5} />}
          {aiError && <p className="text-red-400 text-sm">—</p>}
          {aiContent && (
            <ol className="space-y-4">
              {aiContent.objection_handling.map((item, i) => (
                <li key={i} className="text-sm">
                  <p className="font-semibold text-gray-700">
                    {i + 1}. "{item.objection}"
                  </p>
                  <p className="text-gray-500 mt-0.5 leading-relaxed">{item.response}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* ── Footer: Prev / Next ── */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="text-sm text-gray-400 hover:text-gray-700 disabled:opacity-0 transition-colors px-4 py-2"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={!onNext}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition-colors"
        >
          {onNext ? 'Next →' : 'Done'}
        </button>
      </div>
    </div>
  );
}

function AiSkeleton({ lines }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-200 rounded"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}

function AiError({ error, onRetry }) {
  return (
    <div>
      <p className="text-red-400 text-sm mb-2">{error}</p>
      <button onClick={onRetry} className="text-xs text-blue-500 hover:underline">
        Retry
      </button>
    </div>
  );
}
