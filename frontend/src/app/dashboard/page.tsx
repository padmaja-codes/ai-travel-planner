'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTrips, deleteTrip } from '@/utils/api';
import { Trip } from '@/types';
import CreateTripForm from '@/components/CreateTripForm';
import ItineraryCard from '@/components/ItineraryCard';
import PackingList from '@/components/PackingList';

export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadTrips();
  }, [router]);

  const loadTrips = async () => {
    try {
      const data = await fetchTrips();
      setTrips(data);
      if (data.length > 0) setSelectedTrip(data[0]);
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleTripCreated = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    setSelectedTrip(newTrip);
    setShowForm(false);
  };

  const handleTripUpdate = (updated: Trip) => {
    setTrips((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    setSelectedTrip(updated);
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('Delete this trip?')) return;
    try {
      await deleteTrip(tripId);
      const remaining = trips.filter((t) => t._id !== tripId);
      setTrips(remaining);
      setSelectedTrip(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950 text-white">
        <p className="text-xl animate-pulse">Loading your travel vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center border-b border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            ✈️ Trao Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">AI Travel Planner — User Data Enclave Connected</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-indigo-600 hover:bg-indigo-500 transition text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            {showForm ? '✕ Cancel' : '+ New Trip'}
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Trip List + Budget + Hotels */}
        <div className="space-y-6">

          {/* Create Trip Form (toggled) */}
          {showForm && <CreateTripForm onTripCreated={handleTripCreated} />}

          {/* Your Active Trips */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-white">Your Active Trips</h2>
            {trips.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">No itineraries found. Create one to begin!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-indigo-400 text-sm hover:text-indigo-300"
                >
                  Create your first trip →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {trips.map((trip) => (
                  <div key={trip._id} className="group relative">
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className={`w-full text-left p-4 rounded-xl transition ${
                        selectedTrip?._id === trip._id
                          ? 'bg-blue-600 border border-blue-500 text-white'
                          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <p className="font-bold text-sm">{trip.destination}</p>
                      <p className="text-xs opacity-80 mt-0.5">
                        {trip.durationDays} Days · {trip.budgetTier} Budget
                      </p>
                    </button>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Cost Ledger */}
          {selectedTrip && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 text-white">Financial Cost Ledger</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Lodging &amp; Accommodations:</span>
                  <span className="font-semibold">${selectedTrip.estimatedBudget.accommodation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Culinary &amp; Dining:</span>
                  <span className="font-semibold">${selectedTrip.estimatedBudget.food}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Activities &amp; Sightseeing:</span>
                  <span className="font-semibold">${selectedTrip.estimatedBudget.activities}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Transport:</span>
                  <span className="font-semibold">${selectedTrip.estimatedBudget.transport}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-800 pt-3 text-white font-bold">
                  <span>Grand Total Estimated Budget:</span>
                  <span className="text-emerald-400">${selectedTrip.estimatedBudget.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Suggestions */}
          {selectedTrip && selectedTrip.hotels?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 text-white">Suggested Hotels</h2>
              <div className="space-y-3">
                {selectedTrip.hotels.map((hotel, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                    <p className="font-semibold text-white text-sm">{hotel.name}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-400">{hotel.tier} · {hotel.rating}</span>
                      <span className="text-xs text-emerald-400">${hotel.estimatedCostNightUSD}/night</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Itinerary Board + Packing */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTrip ? (
            <>
              <ItineraryCard trip={selectedTrip} onUpdate={handleTripUpdate} />
              <PackingList trip={selectedTrip} onUpdate={handleTripUpdate} />
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-6xl mb-4">✈️</span>
              <p className="text-slate-400 text-sm">
                Select an existing itinerary or create a new trip to begin exploring.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
