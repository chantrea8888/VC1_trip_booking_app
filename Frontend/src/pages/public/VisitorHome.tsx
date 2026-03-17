import { Link } from 'react-router-dom';
import { HeroCarousel } from '../../components/common/HeroCarousel';

export default function VisitorHome() {
  return (
    <div>
      <HeroCarousel />
      <div className="px-6 py-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="text-sm text-slate-500">Plan trips, explore destinations, and book services.</p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
