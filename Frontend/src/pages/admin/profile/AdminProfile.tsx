import React from 'react';
import { AlertTriangle, Bell, Camera, CheckCircle2, Globe, Info, Lock, ShieldCheck, User, X } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { useAuth } from '../../../context/AuthContext';
import { getAuthToken } from '../../../services/authService';
import { apiRequest } from '../../../services/api';

interface AdminProfileProps {
  onDirtyChange: (isDirty: boolean) => void;
}

interface ProfileForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
}

interface ProfileAlert {
  type: 'success' | 'warning' | 'info';
  message: string;
}

interface ApiUser {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
}

const INITIAL_PROFILE: ProfileForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  bio: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const formatMemberSince = (isoDate?: string) => {
  if (!isoDate) return 'Member since -';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Member since -';
  return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
};

export const AdminProfile: React.FC<AdminProfileProps> = ({ onDirtyChange }) => {
  const { updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [savedProfile, setSavedProfile] = React.useState<ProfileForm>(INITIAL_PROFILE);
  const [profileForm, setProfileForm] = React.useState<ProfileForm>(INITIAL_PROFILE);
  const [alert, setAlert] = React.useState<ProfileAlert | null>(null);
  const [showDiscardEditPrompt, setShowDiscardEditPrompt] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState('');
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [userId, setUserId] = React.useState<number | string | null>(null);
  const [userRole, setUserRole] = React.useState('admin');
  const [memberSinceLabel, setMemberSinceLabel] = React.useState('Member since -');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadedImageRef = React.useRef<string | null>(null);

  const isDirty = isEditingProfile && (
    profileForm.fullName !== savedProfile.fullName ||
    profileForm.email !== savedProfile.email ||
    profileForm.phoneNumber !== savedProfile.phoneNumber ||
    profileForm.bio !== savedProfile.bio
  );

  const emailError = React.useMemo(() => {
    if (!isEditingProfile) {
      return '';
    }

    const email = profileForm.email.trim();
    if (email === '') {
      return 'Email address is required.';
    }

    if (!EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address.';
    }

    return '';
  }, [isEditingProfile, profileForm.email]);

  React.useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  React.useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      onDirtyChange(false);
    };
  }, [isDirty, onDirtyChange]);

  React.useEffect(() => {
    if (!alert) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAlert(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [alert]);

  React.useEffect(() => {
    return () => {
      if (uploadedImageRef.current) {
        URL.revokeObjectURL(uploadedImageRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const loadAdminProfile = async () => {
      setIsLoadingProfile(true);
      const token = getAuthToken();
      if (!token) {
        setAlert({ type: 'warning', message: 'Authentication token is missing. Please login again.' });
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await apiRequest('/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }) as { user?: ApiUser };
        const user = response?.user;

        const nextProfile: ProfileForm = {
          fullName: user?.name ?? '',
          email: user?.email ?? '',
          phoneNumber: '',
          bio: '',
        };

        setUserId(user?.id ?? null);
        setUserRole(user?.role ?? 'admin');
        setMemberSinceLabel(formatMemberSince(user?.created_at));
        setSavedProfile(nextProfile);
        setProfileForm(nextProfile);
        setProfileImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'Admin')}&background=0D8ABC&color=fff&size=256`);
      } catch (error: any) {
        setAlert({ type: 'warning', message: error?.data?.message ?? 'Failed to load admin profile.' });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadAdminProfile();
  }, []);

  const handleToggleEdit = () => {
    if (isEditingProfile) {
      if (isDirty) {
        setShowDiscardEditPrompt(true);
        return;
      }

      setProfileForm(savedProfile);
      setIsEditingProfile(false);
      setAlert({ type: 'info', message: 'Edit mode canceled.' });
      return;
    }

    setIsEditingProfile(true);
    setAlert({ type: 'info', message: 'Edit mode enabled. Update your profile and save.' });
  };

  const handleSaveProfile = async () => {
    if (!isEditingProfile) {
      setAlert({ type: 'warning', message: 'Click "Edit Profile" before making changes.' });
      return;
    }

    if (!isDirty) {
      setAlert({ type: 'info', message: 'No changes to save.' });
      return;
    }

    if (emailError) {
      setAlert({ type: 'warning', message: emailError });
      return;
    }

    if (!userId) {
      setAlert({ type: 'warning', message: 'Cannot update profile: user id is missing.' });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setAlert({ type: 'warning', message: 'Authentication token is missing. Please login again.' });
      return;
    }

    const normalizedProfile = {
      ...profileForm,
      fullName: profileForm.fullName.trim(),
      email: profileForm.email.trim(),
    };

    setIsSavingProfile(true);
    try {
      const response = await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: normalizedProfile.fullName,
          email: normalizedProfile.email,
        }),
      }) as { data?: ApiUser };

      const updatedUser = response?.data;
      const nextProfile: ProfileForm = {
        fullName: updatedUser?.name ?? normalizedProfile.fullName,
        email: updatedUser?.email ?? normalizedProfile.email,
        phoneNumber: normalizedProfile.phoneNumber,
        bio: normalizedProfile.bio,
      };

      setSavedProfile(nextProfile);
      setProfileForm(nextProfile);
      setIsEditingProfile(false);
      setAlert({ type: 'success', message: 'Profile saved successfully.' });
      updateUser({ name: nextProfile.fullName, email: nextProfile.email });
      setProfileImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(nextProfile.fullName || 'Admin')}&background=0D8ABC&color=fff&size=256`);
    } catch (error: any) {
      const fieldErrors = error?.data?.errors;
      if (fieldErrors) {
        const firstError = Object.values(fieldErrors)[0] as string[] | string | undefined;
        setAlert({
          type: 'warning',
          message: Array.isArray(firstError) ? firstError[0] : 'Profile update failed.',
        });
      } else {
        setAlert({ type: 'warning', message: error?.data?.message ?? 'Profile update failed.' });
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const confirmDiscardProfileEdit = () => {
    setProfileForm(savedProfile);
    setIsEditingProfile(false);
    setShowDiscardEditPrompt(false);
    setAlert({ type: 'warning', message: 'Unsaved changes were discarded.' });
  };

  const dismissDiscardProfileEdit = () => {
    setShowDiscardEditPrompt(false);
  };

  const renderAlertIcon = () => {
    if (!alert) {
      return null;
    }

    if (alert.type === 'success') {
      return <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />;
    }

    if (alert.type === 'warning') {
      return <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />;
    }

    return <Info size={18} className="text-blue-600 dark:text-blue-400" />;
  };

  const alertStyles = alert?.type === 'success'
    ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/70 dark:bg-emerald-900/20'
    : alert?.type === 'warning'
      ? 'border-amber-200 bg-amber-50/90 dark:border-amber-900/70 dark:bg-amber-900/20'
      : 'border-blue-200 bg-blue-50/90 dark:border-blue-900/70 dark:bg-blue-900/20';

  const handleCancelAction = () => {
    if (!isEditingProfile) {
      setAlert({ type: 'info', message: 'No edit session is active.' });
      return;
    }

    handleToggleEdit();
  };

  const openPhotoPicker = () => {
    if (!isEditingProfile) {
      setAlert({ type: 'warning', message: 'Click "Edit Profile" first to change photo.' });
      return;
    }

    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (uploadedImageRef.current) {
      URL.revokeObjectURL(uploadedImageRef.current);
    }

    const nextImage = URL.createObjectURL(file);
    uploadedImageRef.current = nextImage;
    setProfileImage(nextImage);
    setAlert({ type: 'success', message: 'Profile photo updated. Remember to save your profile.' });
    event.target.value = '';
  };

  const enableEditModeForEmail = () => {
    if (isEditingProfile) {
      return;
    }

    setIsEditingProfile(true);
    setAlert({ type: 'info', message: 'Edit mode enabled. You can now update your email.' });
  };

  if (isLoadingProfile) {
    return (
      <div className="max-w-6xl w-full mx-auto px-6 md:px-8 py-8">
        <div className="card p-6">
          <p className="text-sm text-slate-500">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-6 md:px-8 py-8 space-y-6">
      {alert && (
        <div className={`card border ${alertStyles} p-4 flex items-start justify-between gap-3`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{renderAlertIcon()}</div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{alert.message}</p>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Admin Profile</h2>
          <p className="text-[#526d92] dark:text-slate-400 text-base">Manage your personal information, preferences, and account security.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleToggleEdit}
            className="h-12 px-6 rounded-2xl border border-slate-300/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1 sm:flex-none"
          >
            {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="h-12 px-6 rounded-2xl bg-primary text-white text-base font-semibold hover:bg-primary/90 shadow-sm transition-colors flex-1 sm:flex-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSavingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <section className="rounded-[28px] p-7 md:p-8 border border-slate-300/60 bg-white/80 dark:bg-slate-800/60 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative w-36 h-36 md:w-40 md:h-40">
            <div className="w-full h-full rounded-full border-[6px] border-white overflow-hidden bg-slate-100 shadow-lg">
              <img
                src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.fullName || 'Admin')}&background=0D8ABC&color=fff&size=256`}
                alt="Admin profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <button
              type="button"
              onClick={openPhotoPicker}
              className={cn(
                "absolute -right-2 -bottom-2 w-12 h-12 rounded-full flex items-center justify-center shadow-md border-4 border-white transition-all bg-slate-200 z-10",
                isEditingProfile
                  ? "text-black hover:bg-slate-300 cursor-pointer"
                  : "text-slate-500 cursor-not-allowed",
              )}
              title="Edit photo"
              aria-label="Edit profile photo"
            >
              <Camera size={22} />
            </button>
          </div>
          <div className="space-y-1.5 min-w-0">
            <h2 className="text-2xl font-bold tracking-tight">{profileForm.fullName || 'Admin'}</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl mt-1">{toTitleCase(userRole)} - {memberSinceLabel}</p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">Active Status</span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">Verified</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Click the camera icon to edit photo.</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </section>

      <section className="card p-6 md:p-7 rounded-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <User size={20} />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</label>
            <input
              className="input-base h-12 disabled:opacity-60 disabled:cursor-not-allowed"
              type="text"
              value={profileForm.fullName}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
              disabled={!isEditingProfile}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email Address</label>
            <input
              className={cn(
                'input-base h-12 disabled:opacity-60 disabled:cursor-not-allowed',
                emailError && 'border-red-400 focus:border-red-400 focus:ring-red-400/30',
              )}
              type="email"
              value={profileForm.email}
              onFocus={enableEditModeForEmail}
              onChange={(event) => {
                enableEditModeForEmail();
                setProfileForm((prev) => ({ ...prev, email: event.target.value }));
              }}
            />
            {emailError && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{emailError}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Phone Number</label>
            <input
              className="input-base h-12 disabled:opacity-60 disabled:cursor-not-allowed"
              type="tel"
              value={profileForm.phoneNumber}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              disabled={!isEditingProfile}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bio</label>
            <textarea
              className="input-base min-h-28 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              value={profileForm.bio}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))}
              disabled={!isEditingProfile}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 md:p-7 rounded-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <Globe size={20} />
            </div>
            <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Preferences</h4>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Language preference</label>
              <select className="select-base w-full h-12 disabled:opacity-60 disabled:cursor-not-allowed" defaultValue="en-US" disabled={!isEditingProfile}>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="km-KH">Khmer (Cambodia)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Timezone</label>
              <select className="select-base w-full h-12 disabled:opacity-60 disabled:cursor-not-allowed" defaultValue="utc-8" disabled={!isEditingProfile}>
                <option value="utc-8">(GMT-08:00) Pacific Time</option>
                <option value="utc+7">(GMT+07:00) Bangkok</option>
                <option value="utc+0">(GMT+00:00) UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6 md:p-7 rounded-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <Bell size={20} />
            </div>
            <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Notifications</h4>
          </div>
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Email Notifications</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Weekly reports and security alerts</p>
              </div>
              <label className={cn("relative inline-flex items-center cursor-pointer", !isEditingProfile && "cursor-not-allowed opacity-60")}>
                <input type="checkbox" className="sr-only peer" defaultChecked disabled={!isEditingProfile} />
                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">System Notifications</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Real-time booking and user alerts</p>
              </div>
              <label className={cn("relative inline-flex items-center cursor-pointer", !isEditingProfile && "cursor-not-allowed opacity-60")}>
                <input type="checkbox" className="sr-only peer" disabled={!isEditingProfile} />
                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-7 rounded-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <Lock size={20} />
          </div>
          <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Security</h4>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Current Password</label>
              <input className="input-base h-12 disabled:opacity-60 disabled:cursor-not-allowed" type="password" placeholder="********" disabled={!isEditingProfile} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">New Password</label>
              <input className="input-base h-12 disabled:opacity-60 disabled:cursor-not-allowed" type="password" placeholder="Enter new password" disabled={!isEditingProfile} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm New Password</label>
              <input className="input-base h-12 disabled:opacity-60 disabled:cursor-not-allowed" type="password" placeholder="Confirm new password" disabled={!isEditingProfile} />
            </div>
          </div>
          <div className="rounded-xl bg-slate-100/60 dark:bg-slate-800/50 p-6 border border-slate-200/70 dark:border-slate-700/70 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-primary mb-3">
              <ShieldCheck size={22} />
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication</p>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-5">Add an extra layer of security to your account.</p>
            <button className="w-full h-11 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed" disabled={!isEditingProfile}>
              Enable 2FA
            </button>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 pb-2">
        <button type="button" onClick={handleCancelAction} className="h-11 px-6 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isSavingProfile}
          className="h-11 px-8 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSavingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {showDiscardEditPrompt && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-40" onClick={dismissDiscardProfileEdit} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Discard Changes?</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                You have unsaved profile changes. Do you want to discard them and exit edit mode?
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={dismissDiscardProfileEdit}
                  className="h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDiscardProfileEdit}
                  className="h-10 px-4 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
