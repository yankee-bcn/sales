import { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  Zap,
  FileText,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';
import { generateContent, regenerateContent, logCall } from '../api';
import OutcomeLogger from './OutcomeLogger';

const OUTCOME_LABELS = {
  connected_interested: 'Connected — Interested',
  connected_not_interested: 'Connected — Not Interested',
  connected_callback: 'Call Back Later',
  voicemail: 'Left Voicemail',
  no_answer: 'No Answer',
  wrong_number: 'Wrong Number',
  do_not_call: 'Do Not Call',
};

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function CallCard({ contact, callStatus, onCallLogged }) {
  const [aiContent, setAiContent] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(true);
  const [objectionOpen, setObjectionOpen] = useState(false);
  const [activeObjection, setActiveObjection] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchAiContent();
    return () => clearInterval(timerRef.current);
  }, [contact.id]);

  async function fetchAiContent() {
    setAiLoading(true);
    setAiError(null);
    setAiContent(null);
    try {
      const content = await generateContent(contact);
      setAiContent(content);
    } catch (err) {
      setAiError(err.response?.data?.error || 'Failed to generate AI content');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleRegenerate() {
    setAiLoading(true);
    setAiError(null);
    try {
      const content = await regenerateContent(contact);
      setAiContent(content);
    } catch (err) {
      setAiError('Failed to regenerate content');
    } finally {
      setAiLoading(false);
    }
  }

  function startCall() {
    setCallStarted(true);
    setCallSeconds(0);
    timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
  }

  function endCall() {
    clearInterval(timerRef.current);
    setShowOutcome(true);
  }

  async function handleOutcomeSubmit(outcome, notes) {
    await logCall({
      contact_id: contact.id,
      contact_name: contact.fullName,
      company_name: contact.company.name,
      role: contact.role,
      outcome,
      notes,
      duration_seconds: callSeconds,
    });
    setShowOutcome(false);
    onCallLogged(outcome);
  }

  const alreadyCalled = !!callStatus;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* ── Contact Header ── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: identity */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 select-none">
              {(contact.firstName?.[0] || '') + (contact.lastName?.[0] || '')}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-white leading-tight">{contact.fullName}</h2>
              <p className="text-blue-400 font-medium mt-0.5">{contact.role}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Building2 size={13} />
                  {contact.company.name}
                </span>
                {contact.company.industry && (
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                    {contact.company.industry}
                  </span>
                )}
                {contact.company.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={12} />
                    {contact.company.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: call controls */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            {!callStarted && !alreadyCalled && (
              <button
                onClick={startCall}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Phone size={15} />
                Start Call
              </button>
            )}
            {callStarted && !showOutcome && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="font-mono text-white font-semibold text-lg tabular-nums">
                    {formatTime(callSeconds)}
                  </span>
                </div>
                <button
                  onClick={endCall}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  End Call
                </button>
              </div>
            )}
            {alreadyCalled && (
              <span
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${
                  callStatus.outcome === 'connected_interested'
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <CheckCircle size={13} />
                {OUTCOME_LABELS[callStatus.outcome] || callStatus.outcome}
              </span>
            )}
          </div>
        </div>

        {/* Contact details row */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 pt-4 border-t border-gray-800">
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-blue-400 transition-colors"
            >
              <Phone size={13} />
              {contact.phone}
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-blue-400 transition-colors"
            >
              <Mail size={13} />
              {contact.email}
            </a>
          )}
          {contact.company.employees && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users size={13} />
              {Number(contact.company.employees).toLocaleString()} employees
            </span>
          )}
          {contact.company.website && (
            <span className="text-sm text-gray-500">{contact.company.website}</span>
          )}
        </div>
      </div>

      {/* ── AI Content ── */}
      {aiLoading && <AiLoadingCard />}
      {!aiLoading && aiError && <AiErrorCard error={aiError} onRetry={fetchAiContent} />}
      {!aiLoading && aiContent && (
        <>
          {/* Pain Points */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Key Pain Points</h3>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={aiLoading}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={11} />
                Regenerate all
              </button>
            </div>
            <ul className="space-y-3">
              {aiContent.pain_points.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-950 text-amber-400 text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-gray-200 text-sm leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Script */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
              onClick={() => setScriptOpen(!scriptOpen)}
            >
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-blue-400" />
                <h3 className="font-semibold text-white text-sm">Call Script</h3>
              </div>
              {scriptOpen ? (
                <ChevronUp size={15} className="text-gray-500" />
              ) : (
                <ChevronDown size={15} className="text-gray-500" />
              )}
            </button>
            {scriptOpen && (
              <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                <pre className="bg-gray-950 rounded-lg p-4 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-mono border border-gray-800">
                  {aiContent.script}
                </pre>
                <p className="text-xs text-gray-600 mt-2">
                  Tip: Use this as a guide — adapt naturally to the conversation.
                </p>
              </div>
            )}
          </div>

          {/* Objection Handling */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
              onClick={() => setObjectionOpen(!objectionOpen)}
            >
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-purple-400" />
                <h3 className="font-semibold text-white text-sm">Objection Handling</h3>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                  {aiContent.objection_handling.length} responses
                </span>
              </div>
              {objectionOpen ? (
                <ChevronUp size={15} className="text-gray-500" />
              ) : (
                <ChevronDown size={15} className="text-gray-500" />
              )}
            </button>
            {objectionOpen && (
              <div className="px-5 pb-5 border-t border-gray-800 pt-4 space-y-2">
                {aiContent.objection_handling.map((item, i) => (
                  <div key={i} className="rounded-lg border border-gray-800 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                      onClick={() => setActiveObjection(activeObjection === i ? null : i)}
                    >
                      <span className="text-sm text-gray-300">
                        <span className="text-gray-500 mr-1">"</span>
                        {item.objection}
                        <span className="text-gray-500 ml-0.5">"</span>
                      </span>
                      {activeObjection === i ? (
                        <ChevronUp size={13} className="text-gray-500 flex-shrink-0 ml-2" />
                      ) : (
                        <ChevronDown size={13} className="text-gray-500 flex-shrink-0 ml-2" />
                      )}
                    </button>
                    {activeObjection === i && (
                      <div className="px-4 pb-4 bg-gray-800/40 text-sm text-gray-200 leading-relaxed">
                        {item.response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Outcome modal */}
      {showOutcome && (
        <OutcomeLogger
          contact={contact}
          duration={callSeconds}
          onSubmit={handleOutcomeSubmit}
          onCancel={() => setShowOutcome(false)}
        />
      )}
    </div>
  );
}

function AiLoadingCard() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-300 font-medium">Generating personalised content...</p>
      <p className="text-gray-600 text-sm mt-1">Claude is analysing this contact's profile</p>
    </div>
  );
}

function AiErrorCard({ error, onRetry }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-red-900/40 p-6 text-center">
      <p className="text-red-400 font-medium mb-1">Content generation failed</p>
      <p className="text-gray-500 text-sm mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
