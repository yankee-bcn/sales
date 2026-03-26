import { useState, useEffect } from 'react';
import { getContacts } from './api';
import CallCard from './components/CallCard';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadContacts(); }, []);

  async function loadContacts() {
    setLoading(true);
    setError(null);
    try {
      const data = await getContacts();
      setContacts(data);
      setIndex(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading contacts…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-red-400 font-semibold text-lg mb-2">Failed to load contacts</p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button onClick={loadContacts} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <p className="text-slate-400">No contacts found in your sheet.</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <CallCard
        key={contacts[index].id}
        contact={contacts[index]}
        currentIndex={index}
        total={contacts.length}
        onNext={index < contacts.length - 1 ? () => setIndex(i => i + 1) : null}
        onPrev={index > 0 ? () => setIndex(i => i - 1) : null}
        onDotClick={setIndex}
      />
    </div>
  );
}
