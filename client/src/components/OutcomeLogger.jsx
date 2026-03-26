import { useState } from 'react';
import { X, Clock } from 'lucide-react';

const OUTCOMES = [
  { id: 'connected_interested', label: 'Connected — Interested' },
  { id: 'connected_not_interested', label: 'Connected — Not Interested' },
  { id: 'connected_callback', label: 'Connected — Call Back Later' },
  { id: 'voicemail', label: 'Left Voicemail' },
  { id: 'no_answer', label: 'No Answer' },
  { id: 'wrong_number', label: 'Wrong Number' },
  { id: 'do_not_call', label: 'Do Not Call' },
];

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function OutcomeLogger({ contact, duration, onSubmit, onCancel }) {
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onSubmit(selected, notes.trim() || null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="font-bold text-white text-lg leading-tight">Log Call Outcome</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {contact.fullName} &middot; {contact.company.name}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {duration > 0 && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={13} />
                {formatDuration(duration)}
              </span>
            )}
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Outcome selection */}
        <div className="p-5 space-y-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">How did the call go?</p>
          {OUTCOMES.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                selected === o.id
                  ? 'border-blue-500 bg-blue-900/30 text-white'
                  : 'border-gray-800 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
              }`}
            >
              {o.label}
            </button>
          ))}

          <div className="pt-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {submitting ? 'Saving...' : 'Log Outcome'}
          </button>
        </div>
      </div>
    </div>
  );
}
