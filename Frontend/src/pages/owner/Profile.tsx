import React from 'react';
import { Mail, Phone, MapPin, Briefcase, Building2, PencilLine, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { ownerProfileService } from '@/services/ownerProfileService';
import { imageService } from '@/services/imageService';

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
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const seed: OwnerProfileData = {
      ...DEFAULT_PROFILE,
      name: user?.name || DEFAULT_PROFILE.name,
      email: user?.email || DEFAULT_PROFILE.email,
      role: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : DEFAULT_PROFILE.role,
    };

    setProfile(seed);

    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const resp = await ownerProfileService.getOwnerProfile();
        const apiUser = resp?.user;
        const apiProfile = resp?.profile;

        const next: OwnerProfileData = {
          ...seed,
          name: apiUser?.name || seed.name,
          email: apiUser?.email || seed.email,
          phone: apiUser?.phone_number || seed.phone,
          role: apiUser?.role ? String(apiUser.role).charAt(0).toUpperCase() + String(apiUser.role).slice(1) : seed.role,
          company: apiProfile?.business_name || seed.company,
          location: apiProfile?.business_address || seed.location,
          avatar: apiProfile?.avatar || seed.avatar,
        };

        if (!cancelled) {
          setProfile(next);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.data?.message || e?.message || 'Failed to load owner profile');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    setAvatarUploading(true);
    setError(null);

    try {
      const uploadResp = await imageService.uploadImage(file, 'avatars');
      const avatarUrl = uploadResp?.url || uploadResp?.path;

      if (!avatarUrl) {
        throw new Error('Image upload did not return a URL.');
      }

      await ownerProfileService.updateOwnerProfile({ avatar: avatarUrl });
      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
    } catch (e: any) {
      setError(e?.data?.message || e?.message || 'Failed to update avatar');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
          {error && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
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
                disabled={avatarUploading || loading}
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
