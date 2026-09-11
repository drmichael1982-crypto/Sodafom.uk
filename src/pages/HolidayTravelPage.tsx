import { Helmet } from '@dr.pogodin/react-helmet';
import { Clock3, Map, ShieldCheck } from 'lucide-react';
import FeaturePageShell from '@/components/FeaturePageShell';

export default function HolidayTravelPage() {
  return (
    <>
      <Helmet><title>Holiday &amp; Travel — Future Sodafom Plan</title></Helmet>
      <FeaturePageShell title="Holiday & Travel" subtitle="A future learning idea — this service is not live yet." emoji="✈️" accent="from-amber-400 via-sky-600 to-blue-950">
        <section className="rounded-[2.5rem] border-4 border-yellow-300 bg-white p-6 text-sky-950 shadow-2xl sm:p-8">
          <div className="flex items-center gap-3"><Clock3 className="text-amber-600" size={34} /><div><p className="text-xs font-black uppercase tracking-widest text-amber-700">Future / planned feature</p><h2 className="text-2xl font-black">Not available to book or buy</h2></div></div>
          <p className="mt-4 font-bold text-slate-700">This page reserves a place for a future child-friendly travel learning section. No holiday, cake, chocolate, card, uniform, shoe or other commercial partnership is shown as live.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-sky-50 p-5"><Map className="text-sky-700" /><h3 className="mt-2 font-black">Learning journeys</h3><p className="mt-1 text-sm font-bold text-slate-600">Future geography, language and culture activities that families could use before a trip.</p></div>
            <div className="rounded-3xl bg-emerald-50 p-5"><ShieldCheck className="text-emerald-700" /><h3 className="mt-2 font-black">Parent controlled</h3><p className="mt-1 text-sm font-bold text-slate-600">Any future release should use clear parent controls, age-appropriate content and transparent partnership labels.</p></div>
          </div>
        </section>
      </FeaturePageShell>
    </>
  );
}
