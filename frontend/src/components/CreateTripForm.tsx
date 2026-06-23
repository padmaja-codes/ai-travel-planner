'use client';

import { useState } from 'react';
import { createTrip } from '@/utils/api';
import { Trip } from '@/types';

const INTERESTS = [
  'Culture & History', 'Food & Dining', 'Adventure & Outdoors',
  'Shopping', 'Relaxation & Wellness', 'Nightlife', 'Art & Museums',
  'Nature & Wildlife', 'Photography', 'Local Experiences',
];

interface Props {
  onTripCreated: (trip: Trip) => void;
}

export default function CreateTripForm({ onTripCreated }: Props) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetTier, setBudgetTier] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return setError('Please enter a destination.');
    if (interests.length === 0) return setError('Select at least one interest.');
    setError('');
    setLoading(true);
    try {
      const newTrip = await createTrip({ destination, durationDays, budgetTier, interests });
      onTripCreated(newTrip);
      setDestination('');
      setInterests([]);
    } catch (err: any) {
      setError(err.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-5">Plan a New Trip</h2>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-xs rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destination */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Tokyo, Japan"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Duration: <span className="text-white font-semibold">{durationDays} days</span>
          </label>
          <input
            type="range"
            min={1}
            max={14}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Budget Tier */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">Budget Tier</label>
          <div className="flex gap-2">
            {(['Low', 'Medium', 'High'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setBudgetTier(tier)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  budgetTier === tier
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={`px-2 py-1 rounded-full text-xs border transition ${
                  interests.includes(item)
                    ? 'bg-indigo-700 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-white font-semibold py-2.5 rounded-lg text-sm mt-2"
        >
          {loading ? '✨ AI is generating your trip...' : '✈️ Generate Trip'}
        </button>
      </form>
    </div>
  );
}
