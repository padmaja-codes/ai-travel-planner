'use client';

import { useState } from 'react';
import { Trip, ItineraryDay } from '@/types';
import { updateTrip } from '@/utils/api';

interface Props {
  trip: Trip;
  onUpdate: (updated: Trip) => void;
}

const timeColors: Record<string, string> = {
  Morning: 'bg-amber-900/40 text-amber-300',
  Afternoon: 'bg-blue-900/40 text-blue-300',
  Evening: 'bg-purple-900/40 text-purple-300',
};

export default function ItineraryCard({ trip, onUpdate }: Props) {
  const [newActivityName, setNewActivityName] = useState('');
  const [targetDay, setTargetDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAddActivity = async (dayNumber: number) => {
    if (!newActivityName.trim()) return;
    setSaving(true);

    const updatedItinerary = trip.itinerary.map((day: ItineraryDay) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: [
            ...day.activities,
            {
              title: newActivityName,
              description: 'Added by traveller',
              estimatedCostUSD: 0,
              timeOfDay: 'Afternoon',
            },
          ],
        };
      }
      return day;
    });

    try {
      const updated = await updateTrip(trip._id, { itinerary: updatedItinerary });
      onUpdate(updated);
      setNewActivityName('');
      setTargetDay(null);
    } catch (err) {
      console.error('Failed to add activity', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-slate-800 pb-3">
        Day-by-Day Timeline: {trip.destination}
      </h2>

      <div className="space-y-6">
        {trip.itinerary.map((day) => (
          <div key={day.dayNumber} className="border-l-2 border-indigo-500 pl-6 relative">
            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-indigo-500 rounded-full border-4 border-slate-900" />
            <h3 className="text-lg font-bold text-slate-200 mb-3">Day {day.dayNumber}</h3>

            <div className="space-y-3 mb-4">
              {day.activities.map((act, index) => (
                <div key={index} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-white text-sm">{act.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${timeColors[act.timeOfDay] || 'bg-slate-700 text-slate-300'}`}>
                      {act.timeOfDay}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{act.description}</p>
                  {act.estimatedCostUSD > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">~${act.estimatedCostUSD}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Add Activity inline */}
            <div className="flex items-center gap-2 max-w-sm mt-3">
              <input
                type="text"
                placeholder="Inject new activity item..."
                value={targetDay === day.dayNumber ? newActivityName : ''}
                onChange={(e) => {
                  setTargetDay(day.dayNumber);
                  setNewActivityName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddActivity(day.dayNumber);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full text-white"
              />
              <button
                onClick={() => handleAddActivity(day.dayNumber)}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition shrink-0"
              >
                {saving && targetDay === day.dayNumber ? '...' : 'Add'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
