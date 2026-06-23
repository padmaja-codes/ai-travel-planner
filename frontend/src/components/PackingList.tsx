'use client';

import { useState } from 'react';
import { Trip, PackingItem } from '@/types';
import { updateTrip } from '@/utils/api';

interface Props {
  trip: Trip;
  onUpdate: (updated: Trip) => void;
}

const categoryColors: Record<string, string> = {
  Documents: 'bg-blue-900/40 text-blue-300',
  Clothing: 'bg-pink-900/40 text-pink-300',
  Gear: 'bg-amber-900/40 text-amber-300',
  Other: 'bg-slate-700 text-slate-300',
};

export default function PackingList({ trip, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);

  const toggleItem = async (itemId: string) => {
    setSaving(true);
    const updatedPacking = trip.packingList.map((item: PackingItem) =>
      item._id === itemId ? { ...item, isPacked: !item.isPacked } : item
    );
    try {
      const updated = await updateTrip(trip._id, { packingList: updatedPacking });
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to update packing item', err);
    } finally {
      setSaving(false);
    }
  };

  const packed = trip.packingList.filter((i) => i.isPacked).length;
  const total = trip.packingList.length;

  const grouped = trip.packingList.reduce((acc: Record<string, PackingItem[]>, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-xl font-bold text-white">⛈️ AI Weather-Aware Packing Assistant</h3>
        <span className="text-xs text-slate-400 shrink-0 mt-1">{packed}/{total} packed</span>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        Based on your active planned locations and local forecasted climate, pack these items:
      </p>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
        <div
          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: total > 0 ? `${(packed / total) * 100}%` : '0%' }}
        />
      </div>

      {total === 0 ? (
        <p className="text-xs text-slate-500">Generating weather checklists...</p>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => item._id && toggleItem(item._id)}
                    className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-750 transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.isPacked}
                      readOnly
                      className="h-4 w-4 rounded bg-slate-950 border-slate-800 accent-emerald-500 cursor-pointer"
                    />
                    <span className={`text-sm flex-1 ${item.isPacked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {item.item}
                    </span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-mono shrink-0 ${categoryColors[item.category] || categoryColors['Other']}`}>
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
