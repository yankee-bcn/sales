import { useState, useEffect } from 'react';
import { generateContent } from '../api';

const PILL_COLORS = [
  'bg-rose-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-orange-500',
];

export default function CallCard({ contact, currentIndex, total, onNext, onPrev, onDotClick }) {
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
      setAiError(err.response?.data?.error || 'Generation failed');
    } finally {
      setAiLoading(false);
    }
  }

  const initials = [contact.firstName?.[0], contact.lastName?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-white">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 px-10 py-7 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg shadow-violet-900/50">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-[30px] font-bold leading-tight tracking-tight">
              {contact.fullName}
            </h1>
            <p className="text-indigo-300 text-base font-medium mt-0.5">
              {contact.role}
              {contact.company.name && (
                <span className="text-slate-400 font-normal"> · {contact.company.name}</span>
              )}
            </p>
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-slate-300 text-sm font-mono hover:text-white transition-colors"
                >
                  {contact.phone}
                </a>
              )}
              {contact.useCase && (
                <span className="bg-violet-400/20 text-violet-200 border border-violet-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                  {contact.useCase}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Pain Points ── */}
      {contact.painPoints?.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-3.5 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {contact.painPoints.map((point, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-2 ${PILL_COLORS[i % PILL_COLORS.length]} text-white text-sm px-4 py-1.5 rounded-full font-medium shadow-sm`}
              >
                <span className="font-bold opacity-75 text-xs">{i + 1}.</span>
                {point}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Body: Script (65%) + Objections (35%) ── */}
      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '65% 35%' }}>

        {/* Script */}
        <div className="bg-white overflow-y-auto px-12 py-8 border-r border-slate-100">
          {aiLoading && <Skeleton lines={12} />}
          {aiError && (
            <div>
              <p className="text-red-400 text-sm mb-3">{aiError}</p>
              <button onClick={fetchAiContent} className="text-xs text-indigo-500 hover:underline">
                Retry
              </button>
            </div>
          )}
          {aiContent && (
            <p className="text-slate-700 text-[15px] leading-[1.85] whitespace-pre-wrap">
              {aiContent.script}
            </p>
          )}
        </div>

        {/* Objections — dark panel */}
        <div className="bg-slate-900 overflow-y-auto px-8 py-8">
          {aiLoading && <Skeleton lines={7} dark />}
          {aiContent && (
            <ol className="space-y-5 divide-y divide-slate-800">
              {aiContent.objection_handling.map((item, i) => (
                <li key={i} className={i > 0 ? 'pt-5' : ''}>
                  <p className="text-white text-[13px] font-semibold leading-snug">
                    "{item.objection}"
                  </p>
                  <p className="text-slate-400 text-[13px] leading-relaxed mt-1.5">
                    {item.response}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-white border-t border-slate-100 px-10 py-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="text-sm text-slate-400 hover:text-slate-700 disabled:opacity-0 transition-colors px-3 py-1.5 font-medium"
        >
          ← Previous
        </button>

        <div className="flex gap-1.5 items-center">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onDotClick(i)}
              className={`rounded-full transition-all ${
                i === currentIndex
                  ? 'w-5 h-2 bg-violet-500'
                  : i < currentIndex
                  ? 'w-2 h-2 bg-violet-300'
                  : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!onNext}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold px-8 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          {onNext ? 'Next →' : 'Done'}
        </button>
      </div>
    </div>
  );
}

function Skeleton({ lines, dark }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}
          style={{ width: `${55 + (i % 4) * 12}%` }}
        />
      ))}
    </div>
  );
}
