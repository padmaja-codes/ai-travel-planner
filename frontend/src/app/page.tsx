import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">
        Trao ✈️
      </h1>
      <p className="text-slate-400 text-lg max-w-xl mb-10">
        Your AI-powered travel companion. Generate personalised day-by-day itineraries,
        smart hotel picks, budget breakdowns, and a weather-aware packing list — in seconds.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold px-6 py-3 rounded-xl"
        >
          Get Started Free
        </Link>
        <Link
          href="/login"
          className="border border-slate-700 hover:border-slate-500 transition text-slate-300 font-semibold px-6 py-3 rounded-xl"
        >
          Sign In
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full text-left">
        {[
          { icon: '🗓️', title: 'Day-by-Day Itineraries', desc: 'AI builds a full trip plan with morning, afternoon & evening activities.' },
          { icon: '💰', title: 'Budget Breakdown', desc: 'Realistic cost estimates for transport, food, hotels and activities.' },
          { icon: '🎒', title: 'Smart Packing List', desc: 'Climate-aware checklist tailored to your destination and activities.' },
        ].map((f) => (
          <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="text-white font-bold mt-3 mb-1">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
