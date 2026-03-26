import { useState, useEffect } from 'react';
import { getContacts } from './api';
import CallCard from './components/CallCard';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [index, setIndex] = useState(0);
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
      setIndex(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    setIndex((i) => Math.min(i + 1, contacts.length - 1));
  }

  function handlePrev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  if (loading) return <Screen><Spinner text="Loading contacts..." /></Screen>;
  if (error) return <Screen><ErrorMsg error={error} onRetry={loadContacts} /></Screen>;
  if (contacts.length === 0) return <Screen><p className="text-gray-400">No contacts found in your sheet.</p></Screen>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      {/* Progress */}
      <div className="w-full max-w-4xl mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">
          Contact {index + 1} of {contacts.length}
        </span>
        <div className="flex gap-1">
          {contacts.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? 'bg-blue-600' : i < index ? 'bg-blue-300' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <CallCard
        key={contacts[index].id}
        contact={contacts[index]}
        onNext={index < contacts.length - 1 ? handleNext : null}
        onPrev={index > 0 ? handlePrev : null}
      />
    </div>
  );
}

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {children}
    </div>
  );
}

function Spinner({ text }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}

function ErrorMsg({ error, onRetry }) {
  return (
    <div className="text-center max-w-md px-4">
      <p className="text-red-500 font-medium mb-2">Failed to load contacts</p>
      <p className="text-gray-500 text-sm mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm"
      >
        Retry
      </button>
    </div>
  );
}
