import { useState, useEffect } from 'react';
import { Phone, RefreshCw, AlertCircle, Inbox } from 'lucide-react';
import { getContacts } from './api';
import CallQueue from './components/CallQueue';
import CallCard from './components/CallCard';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [callStatuses, setCallStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    setLoading(true);
    setError(null);
    try {
      const data = await getContacts();
      setContacts(data);
      setActiveIndex(0);
      setCallStatuses({});
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load contacts from CRM');
    } finally {
      setLoading(false);
    }
  }

  function handleCallLogged(contactId, outcome) {
    setCallStatuses((prev) => ({ ...prev, [contactId]: { outcome, timestamp: new Date() } }));
    // Auto-advance to next uncalled contact
    const nextIndex = contacts.findIndex((c, i) => i > activeIndex && !callStatuses[c.id]);
    if (nextIndex !== -1) setActiveIndex(nextIndex);
  }

  const activeContact = contacts[activeIndex] || null;
  const total = contacts.length;
  const done = Object.keys(callStatuses).length;
  const interested = Object.values(callStatuses).filter((s) => s.outcome === 'connected_interested').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Phone size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-none">SDR Call Tool</h1>
            <p className="text-gray-500 text-xs mt-0.5">Powered by Claude AI</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {total > 0 && (
            <>
              <Stat label="In Queue" value={total - done} />
              <Stat label="Called" value={done} />
              <Stat label="Interested" value={interested} accent />
            </>
          )}
          <button
            onClick={loadContacts}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <ErrorScreen error={error} onRetry={loadContacts} />
        ) : contacts.length === 0 ? (
          <EmptyScreen />
        ) : (
          <>
            <CallQueue
              contacts={contacts}
              activeIndex={activeIndex}
              callStatuses={callStatuses}
              onSelect={setActiveIndex}
            />
            <main className="flex-1 overflow-y-auto p-6 bg-gray-950">
              {activeContact ? (
                <CallCard
                  key={activeContact.id}
                  contact={activeContact}
                  callStatus={callStatuses[activeContact.id]}
                  onCallLogged={(outcome) => handleCallLogged(activeContact.id, outcome)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">All calls completed for this session.</p>
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold leading-none ${accent ? 'text-green-400' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400">Loading contacts from CRM...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <h2 className="text-white font-semibold mb-2">Failed to load contacts</h2>
        <p className="text-gray-400 text-sm mb-5">{error}</p>
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function EmptyScreen() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <Inbox size={40} className="text-gray-600 mx-auto mb-3" />
        <h2 className="text-white font-semibold mb-2">No contacts in queue</h2>
        <p className="text-gray-500 text-sm">Your CRM returned no contacts to call.</p>
      </div>
    </div>
  );
}
