import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  LogOut,
  ChevronRight,
  Camera,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
  Eye,
  Trash2,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FileUpload } from '../../components/common/FileUpload';

interface ProfileProps {
  initialTab?: 'profile' | 'settings' | 'notifications' | 'security' | 'documents';
  notifications: any[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
  initialTab = 'profile',
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const { user, logout, updateUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: user?.phone || '+855 12 345 678',
    location: user?.location || 'Phnom Penh, Cambodia',
    language: (() => {
      try {
        return localStorage.getItem('customer_language') || 'English (US)';
      } catch {
        return 'English (US)';
      }
    })(),
    currency: 'USD ($)'
  });

  const isKhmer = profileData.language === 'Khmer' || profileData.language === 'ខ្មែរ';
  const t = (key: string): string => {
    const km: Record<string, string> = {
      profile: 'ប្រវត្តិរូប',
      documents: 'ឯកសារ',
      notifications: 'ការជូនដំណឹង',
      settings: 'ការកំណត់',
      security: 'សុវត្ថិភាព',
      edit_profile: 'កែប្រែប្រវត្តិរូប',
      save_changes: 'រក្សាទុកការផ្លាស់ប្តូរ',
      contact_information: 'ព័ត៌មានទំនាក់ទំនង',
      travel_preferences: 'ចំណូលចិត្តការធ្វើដំណើរ',
      email_address: 'អាសយដ្ឋានអ៊ីមែល',
      phone_number: 'លេខទូរស័ព្ទ',
      location: 'ទីតាំង',
      language: 'ភាសា',
      currency: 'រូបិយប័ណ្ណ',
      english_us: 'អង់គ្លេស (អាមេរិក)',
      khmer: 'ខ្មែរ',
    };

    const en: Record<string, string> = {
      profile: 'Profile',
      documents: 'Documents',
      notifications: 'Notifications',
      settings: 'Settings',
      security: 'Security',
      edit_profile: 'Edit Profile',
      save_changes: 'Save Changes',
      contact_information: 'Contact Information',
      travel_preferences: 'Travel Preferences',
      email_address: 'Email Address',
      phone_number: 'Phone Number',
      location: 'Location',
      language: 'Language',
      currency: 'Currency',
      english_us: 'English (US)',
      khmer: 'Khmer',
    };

    return (isKhmer ? km : en)[key] ?? key;
  };

  const [settings, setSettings] = useState({
    push: true,
    email: false
  });

  const [securityStatus, setSecurityStatus] = useState({
    passwordChanged: false,
    tfaEnabled: false
  });

  const handleChangePassword = () => {
    // Simulate password change
    setSecurityStatus({ ...securityStatus, passwordChanged: true });
    setTimeout(() => setSecurityStatus(prev => ({ ...prev, passwordChanged: false })), 3000);
  };

  const handleToggleTFA = () => {
    setSecurityStatus({ ...securityStatus, tfaEnabled: !securityStatus.tfaEnabled });
  };

  const handleSaveProfile = () => {
    updateUser({
      phone: profileData.phone,
      location: profileData.location,
      // In a real app, these would be in the user object too
    });
    setIsEditing(false);
  };

  React.useEffect(() => {
    try {
      localStorage.setItem('customer_language', profileData.language);
    } catch {
      // ignore
    }
  }, [profileData.language]);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'documents', label: t('documents'), icon: FileText },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'settings', label: t('settings'), icon: Settings },
    { id: 'security', label: t('security'), icon: Shield },
  ];

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = () => {
    // In a real app, this would call an API
    alert('Account deletion requested. You will be logged out.');
    logout();
  };

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 dark:border-blue-900/30">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff&size=128`} 
              alt={user?.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Explorer Member since 2024</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">Pro Traveler</span>
            <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">Verified Account</span>
          </div>
        </div>
        <button 
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
            isEditing 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
          }`}
        >
          {isEditing ? t('save_changes') : t('edit_profile')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('contact_information')}</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('email_address')}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('phone_number')}</p>
                {isEditing ? (
                  <input 
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.phone || profileData.phone}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('location')}</p>
                {isEditing ? (
                  <input 
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.location || profileData.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('travel_preferences')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('language')}</span>
              </div>
              {isEditing ? (
                <select 
                  value={profileData.language}
                  onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                  className="bg-transparent text-xs font-bold text-blue-600 outline-none cursor-pointer"
                >
                  <option value="English (US)">{t('english_us')}</option>
                  <option value="Khmer">{t('khmer')}</option>
                </select>
              ) : (
                <span className="text-xs font-bold text-blue-600">{profileData.language === 'Khmer' ? t('khmer') : t('english_us')}</span>
              )}
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('currency')}</span>
              </div>
              {isEditing ? (
                <select 
                  value={profileData.currency}
                  onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                  className="bg-transparent text-xs font-bold text-emerald-600 outline-none cursor-pointer"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="KHR (៛)">KHR (៛)</option>
                </select>
              ) : (
                <span className="text-xs font-bold text-emerald-600">{profileData.currency}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
        <button 
          onClick={onMarkAllAsRead}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          Mark all as read
        </button>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`p-6 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
            onClick={() => onMarkAsRead(n.id)}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.type === 'booking' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">App Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</p>
              <p className="text-xs text-slate-500">Receive alerts about your bookings</p>
            </div>
            <button 
              onClick={() => setSettings({ ...settings, push: !settings.push })}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.push ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.push ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Email Marketing</p>
              <p className="text-xs text-slate-500">Get the latest deals and offers</p>
            </div>
            <button 
              onClick={() => setSettings({ ...settings, email: !settings.email })}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.email ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.email ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-slate-500">Switch between light and dark themes</p>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-red-600 mb-6">Danger Zone</h3>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
          <div>
            <p className="text-sm font-bold text-red-600">Delete Account</p>
            <p className="text-xs text-red-500/70">Once you delete your account, there is no going back.</p>
          </div>
          {showDeleteConfirm ? (
            <div className="flex gap-2">
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Security Settings</h3>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Password</p>
              <p className="text-xs text-slate-500">Last changed 3 months ago</p>
            </div>
          </div>
          <button 
            onClick={handleChangePassword}
            className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            {securityStatus.passwordChanged ? 'Password Changed!' : 'Change Password'}
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${securityStatus.tfaEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500">
                {securityStatus.tfaEnabled ? 'Currently enabled' : 'Add an extra layer of security'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleToggleTFA}
            className={`w-full py-3 text-sm font-bold rounded-xl transition-colors ${
              securityStatus.tfaEnabled 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {securityStatus.tfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Travel Documents</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Keep your essential travel documents safe and accessible. Upload copies of your passport, visas, and insurance.
          </p>
        </div>
        <FileUpload 
          label="Upload Passport or Visa"
          description="Drag and drop your document here, or click to browse. Supported formats: JPG, PNG, PDF (Max 5MB)"
        />
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Secure Storage</h3>
          <p className="text-blue-100 text-sm max-w-md leading-relaxed">
            Your documents are encrypted and stored securely. Only you have access to these files during your travel.
          </p>
        </div>
        <Shield className="absolute -right-4 -bottom-4 w-40 h-40 text-blue-500/20 rotate-12" />
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm p-4 sticky top-28">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    {tab.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                      <span className={`ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        activeTab === 'notifications' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                      }`}>
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-4 mx-4" />
              <button 
                onClick={logout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Manage your account details and preferences
                </p>
              </div>

              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'documents' && renderDocuments()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'security' && renderSecurity()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
