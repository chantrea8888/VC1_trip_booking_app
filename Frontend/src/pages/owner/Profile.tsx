import React from 'react';
import { Mail, Phone, MapPin, Briefcase, Building2, PencilLine, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/utils';

type OwnerProfileData = {
  name: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  location: string;
  avatar: string;
};

const DEFAULT_PROFILE: OwnerProfileData = {
  name: 'Owner',
  email: 'owner@example.com',
  phone: '+855 12 345 678',
  role: 'Owner',
  company: 'Komroung Travel Co.',
  location: 'Phnom Penh, Cambodia',
  avatar: 'https://i.pravatar.cc/150?u=owner',
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<OwnerProfileData>(DEFAULT_PROFILE);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const raw = localStorage.getItem('ownerInfo');
    const storedAvatar = localStorage.getItem('ownerProfileAvatar');
    let next = { ...DEFAULT_PROFILE };

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<OwnerProfileData>;
        next = { ...next, ...parsed };
      } catch {
        // ignore storage parsing errors
      }
    }

    if (storedAvatar) {
      next.avatar = storedAvatar;
    }

    next.name = user?.name || next.name;
    next.email = user?.email || next.email;
    next.role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : next.role;

    setProfile(next);
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      setProfile((prev) => ({ ...prev, avatar: result }));
      localStorage.setItem('ownerProfileAvatar', result);

      const raw = localStorage.getItem('ownerInfo');
      try {
        const parsed = raw ? (JSON.parse(raw) as Partial<OwnerProfileData>) : {};
        const next = { ...parsed, avatar: result };
        localStorage.setItem('ownerInfo', JSON.stringify(next));
      } catch {
        localStorage.setItem('ownerInfo', JSON.stringify({ avatar: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const infoItems = [
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: Phone, label: 'Phone', value: profile.phone },
    { icon: MapPin, label: 'Location', value: profile.location },
    { icon: Briefcase, label: 'Role', value: profile.role },
    { icon: Building2, label: 'Company', value: profile.company },
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-[0.2em] text-blue-600">Owner Profile</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {profile.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your profile and keep your business details up to date.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
        >
          <PencilLine size={16} />
          Edit in Settings
        </button>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-blue-100 dark:border-blue-900/40 shadow-md">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors"
                title="Change photo"
              >
                <Camera size={16} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
            <span className="mt-3 inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {profile.role}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <item.icon size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Total Listings', value: '18', subtitle: 'Hotels, transports, rentals' },
            { title: 'Upcoming Bookings', value: '42', subtitle: 'Next 30 days' },
            { title: 'Avg. Guest Rating', value: '4.8', subtitle: 'Based on 1,240 reviews' },
            { title: 'Monthly Revenue', value: '$12,845', subtitle: 'Updated today' },
          ].map((stat) => (
            <div
              key={stat.title}
              className={cn(
                "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
              )}
            >
              <p className="text-[11px] uppercase font-bold tracking-[0.15em] text-slate-400">{stat.title}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{stat.subtitle}</p>
            </div>
          ))}

          <div className="md:col-span-2 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-900/10 dark:via-slate-900 dark:to-slate-950 border border-blue-100/80 dark:border-blue-900/40 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile checklist</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Complete these steps to boost trust with customers and earn more bookings.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {[
                'Add a professional business logo and cover photo.',
                'Verify phone number for faster guest confirmations.',
                'Describe your transport services and amenities.',
                'Enable two-factor authentication for account security.',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
