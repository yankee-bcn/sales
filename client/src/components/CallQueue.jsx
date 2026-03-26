import { Check } from 'lucide-react';

const OUTCOME_SHORT = {
  connected_interested: { label: 'Interested', color: 'text-green-400' },
  connected_not_interested: { label: 'Not interested', color: 'text-orange-400' },
  connected_callback: { label: 'Callback', color: 'text-blue-400' },
  voicemail: { label: 'Voicemail', color: 'text-gray-500' },
  no_answer: { label: 'No answer', color: 'text-gray-500' },
  wrong_number: { label: 'Wrong #', color: 'text-red-400' },
  do_not_call: { label: 'DNC', color: 'text-red-500' },
};

export default function CallQueue({ contacts, activeIndex, callStatuses, onSelect }) {
  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300">Call Queue</h2>
        <p className="text-xs text-gray-600 mt-0.5">{contacts.length} contacts</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact, index) => {
          const status = callStatuses[contact.id];
          const isActive = index === activeIndex;
          const isDone = !!status;
          const outcomeInfo = status ? OUTCOME_SHORT[status.outcome] : null;

          return (
            <button
              key={contact.id}
              onClick={() => onSelect(index)}
              className={`w-full text-left px-4 py-3 border-b border-gray-800/50 transition-colors hover:bg-gray-800 ${
                isActive ? 'bg-gray-800 border-l-2 border-l-blue-500 pl-3.5' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Number / Done indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-gray-700 text-gray-500'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {isDone ? <Check size={12} /> : index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {contact.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{contact.company.name}</p>
                  <p className="text-xs text-gray-600 truncate">{contact.role}</p>
                  {outcomeInfo && (
                    <p className={`text-xs mt-1 ${outcomeInfo.color}`}>{outcomeInfo.label}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
