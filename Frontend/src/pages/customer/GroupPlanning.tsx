import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { socketService } from '../../services/socketService';
import { 
  Users, 
  Send, 
  Copy, 
  CheckCircle2, 
  MessageSquare, 
  Plus, 
  X, 
  UserPlus,
  MoreVertical,
  Smile,
  Paperclip,
  Image as ImageIcon,
  ChevronLeft,
  Calendar,
  BarChart3,
  MapPin,
  Clock,
  ThumbsUp,
  Mic,
  Phone,
  Search,
  Bell,
  Settings,
  Download,
  Map as MapIcon,
  LayoutDashboard,
  Compass,
  Briefcase,
  ArrowLeft,
  Share2,
  TrendingUp,
  Vote,
  Layout,
  MessageCircle,
  ArrowRight,
  Heart,
  Star
} from 'lucide-react';

interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  text: string;
  created_at: string;
  type?: 'system' | 'user';
}

interface Member {
  user_email: string;
  user_name: string;
  role: 'Leader' | 'Member';
}

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
}

interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  votes: number;
}

interface GroupPlanningProps {
  onBack: () => void;
  tripTitle?: string;
}

export const GroupPlanning: React.FC<GroupPlanningProps> = ({ onBack, tripTitle = "Adventure in Siem Reap" }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'itinerary' | 'polls'>('dashboard');
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auth/Group State
  const [userEmail] = useState('hanchantrea38@gmail.com');
  const [userName] = useState('Vannak');
  const [groupId, setGroupId] = useState<string | null>(localStorage.getItem('activeGroupId'));
  const [accessCode, setAccessCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [groupName, setGroupName] = useState(tripTitle);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroupData = async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}?email=${userEmail}`);
        if (!res.ok) throw new Error('Failed to fetch group');
        const data = await res.json();
        setMembers(data.members);
        setMessages(data.messages);
        setItinerary(data.itinerary);
        setPolls(data.polls);
        setGroupName(data.name);
      } catch (err) {
        setError('Access denied or group not found');
        setGroupId(null);
        localStorage.removeItem('activeGroupId');
      }
    };

    fetchGroupData();

    const socket = socketService.connect();
    socket.emit('join-group', { groupId, email: userEmail });

    socket.on('new-message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('itinerary-updated', (items: ItineraryItem[]) => {
      setItinerary(items);
    });

    socket.on('poll-created', (poll: Poll) => {
      setPolls(prev => [...prev, poll]);
    });

    socket.on('poll-updated', (poll: Poll) => {
      setPolls(prev => prev.map(p => p.id === poll.id ? poll : p));
    });

    return () => {
      socket.off('new-message');
      socket.off('itinerary-updated');
      socket.off('poll-created');
      socket.off('poll-updated');
    };
  }, [groupId, userEmail]);

  const handleCreateGroup = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: tripTitle,
        creatorEmail: userEmail,
        creatorName: userName,
        accessCode: code
      })
    });
    const data = await res.json();
    setGroupId(data.id);
    localStorage.setItem('activeGroupId', data.id);
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: accessCode, // Using code as ID for simplicity in this demo
        accessCode: accessCode,
        userEmail,
        userName
      })
    });
    const data = await res.json();
    if (data.success) {
      setGroupId(data.groupId);
      localStorage.setItem('activeGroupId', data.groupId);
    } else {
      setError(data.error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;
    socketService.getSocket()?.emit('send-message', {
      groupId,
      email: userEmail,
      text: newMessage
    });
    setNewMessage('');
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    socketService.getSocket()?.emit('vote-poll', {
      groupId,
      email: userEmail,
      optionId
    });
  };

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const inviteLink = `${window.location.origin}/join/${groupId}`;

  const handleVoteItinerary = (itemId: string) => {
    // Voting logic for itinerary
  };
  const [newActivity, setNewActivity] = useState({ time: '', activity: '', location: '' });
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });

  const handleAddActivity = () => {
    if (!newActivity.time || !newActivity.activity || !groupId) return;
    socketService.getSocket()?.emit('update-itinerary', {
      groupId,
      email: userEmail,
      item: newActivity
    });
    setIsAddingActivity(false);
    setNewActivity({ time: '', activity: '', location: '' });
  };

  const handleCreatePoll = () => {
    if (!newPoll.question || !groupId) return;
    socketService.getSocket()?.emit('create-poll', {
      groupId,
      email: userEmail,
      question: newPoll.question,
      options: newPoll.options.filter(o => o.trim())
    });
    setIsCreatingPoll(false);
    setNewPoll({ question: '', options: ['', ''] });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-sans selection:bg-blue-500/30 pt-20">
      {!groupId ? (
        <div className="max-w-md mx-auto py-20 px-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-white/5">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Secure Planning</h2>
            
            <div className="space-y-8">
              <button 
                onClick={handleCreateGroup}
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" /> Create New Group
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
                <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
              </div>

              <form onSubmit={handleJoinGroup} className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Access Code</label>
                <input 
                  type="text" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-center font-mono text-xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
                >
                  Join Group
                </button>
              </form>

              {error && (
                <p className="text-center text-red-500 text-xs font-bold">{error}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header Section */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 sticky top-16 z-40 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={onBack}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Group Planning</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{members.length} Members</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{groupName}</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {members.map((m) => (
                    <div 
                      key={m.user_email} 
                      className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500"
                    >
                      {m.user_name.charAt(0)}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Code</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tracking-widest">{groupId}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-6 py-10 flex gap-10">
            {/* Left Navigation Rail */}
            <aside className="w-64 flex-shrink-0 space-y-8">
              <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-4 shadow-sm">
                <div className="space-y-2">
                  {[
                    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
                    { id: 'polls', label: 'Polls', icon: BarChart3 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                        activeTab === tab.id 
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 space-y-10">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    {/* Chat Preview / Recent Activity */}
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col h-[600px]">
                      <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Group Discussion</h3>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Chat</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {messages.map((msg) => {
                          const isMe = msg.sender_email === userEmail;
                          return (
                            <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                              {!msg.type && (
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                                  {msg.sender_name.charAt(0)}
                                </div>
                              )}
                              <div className={`max-w-[80%] ${isMe ? 'text-right' : ''}`}>
                                {msg.type === 'system' ? (
                                  <div className="flex items-center gap-4 py-2">
                                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.text}</span>
                                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
                                  </div>
                                ) : (
                                  <>
                                    <div className={`p-5 rounded-[2rem] text-sm leading-relaxed ${
                                      isMe 
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none shadow-xl' 
                                        : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-white/5'
                                    }`}>
                                      {msg.text}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 mt-2 block uppercase tracking-widest">
                                      {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      <div className="p-8 border-t border-slate-100 dark:border-white/5">
                        <form onSubmit={handleSendMessage} className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-2 flex items-center gap-2 border border-slate-100 dark:border-white/5 focus-within:border-blue-500/50 transition-all">
                          <button type="button" className="p-4 text-slate-400 hover:text-blue-600 transition-colors">
                            <ImageIcon className="w-5 h-5" />
                          </button>
                          <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Share your thoughts..." 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 text-slate-900 dark:text-white"
                          />
                          <button 
                            type="submit"
                            className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:scale-105 transition-transform shadow-lg"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                )}

            {activeTab === 'itinerary' && (
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Itinerary</h3>
                  <button 
                    onClick={() => setIsAddingActivity(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" /> Add Activity
                  </button>
                </div>
                
                <div className="space-y-6">
                  {itinerary.map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-8 group hover:shadow-2xl transition-all"
                    >
                      <div className="w-20 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{item.time.includes(' ') ? item.time.split(' ')[1] : ''}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{item.time.split(' ')[0]}</p>
                      </div>
                      <div className="w-px h-16 bg-slate-100 dark:bg-white/5" />
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.activity}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" /> {item.location}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleVoteItinerary(item.id)}
                        className="flex flex-col items-center gap-2 group/vote"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/vote:bg-blue-600 group-hover/vote:text-white transition-all shadow-sm">
                          <ThumbsUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-400">{item.votes} Votes</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'polls' && (
              <motion.div
                key="polls"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Active Polls</h3>
                  <button 
                    onClick={() => setIsCreatingPoll(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" /> Create Poll
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {polls.map((poll) => {
                    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                    return (
                      <div key={poll.id} className="bg-white dark:bg-slate-900/50 backdrop-blur-md p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm">
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">{poll.question}</h4>
                        <div className="space-y-6">
                          {poll.options.map((opt) => {
                            const pct = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                            return (
                              <div key={opt.id} className="space-y-3">
                                <button 
                                  onClick={() => handleVotePoll(poll.id, opt.id)}
                                  className="w-full flex items-center justify-between p-6 rounded-[2rem] border bg-white dark:bg-slate-800/50 border-slate-100 dark:border-white/10 hover:border-blue-500 hover:shadow-lg transition-all"
                                >
                                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">{opt.text}</span>
                                  <span className="text-sm font-bold text-slate-400">{opt.votes} Votes</span>
                                </button>
                                <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${pct}%` }} 
                                    className="h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{totalVotes} Total Votes Cast</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right Sidebar - Summary */}
        <aside className="w-80 flex-shrink-0 space-y-8">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Trip Summary</h3>
            
            <div className="space-y-8">
              <div className="relative rounded-[2rem] overflow-hidden aspect-video group cursor-pointer">
                <img src="https://picsum.photos/seed/bali-map/400/200" alt="Map" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs font-bold text-white">Siem Reap, KH</p>
                  <p className="text-[9px] text-white/60">Oct 12 - Oct 20, 2026</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Budget</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">$3,500</span>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-blue-600 rounded-full" />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest">60% Allocated</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Next Step</h4>
                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 block">Action Required</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">Confirm Villa Booking for 7 nights</p>
                  <button 
                    onClick={() => setActiveTab('polls')}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-bold hover:scale-105 transition-transform shadow-xl"
                  >
                    Vote Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )}

  {/* Modals */}
  <AnimatePresence>
        {(isAddingActivity || isCreatingPoll) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isAddingActivity ? 'Add Activity' : 'New Poll'}
                </h3>
                <button 
                  onClick={() => { setIsAddingActivity(false); setIsCreatingPoll(false); }}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-colors text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                    {isAddingActivity ? 'Activity Name' : 'Question'}
                  </label>
                  <input 
                    type="text" 
                    value={isAddingActivity ? newActivity.activity : newPoll.question}
                    onChange={(e) => isAddingActivity 
                      ? setNewActivity({...newActivity, activity: e.target.value})
                      : setNewPoll({...newPoll, question: e.target.value})
                    }
                    placeholder={isAddingActivity ? "e.g. Dinner at Pub Street" : "e.g. Where should we eat?"}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                {isAddingActivity ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Time</label>
                      <input 
                        type="time" 
                        value={newActivity.time}
                        onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Location</label>
                      <input 
                        type="text" 
                        value={newActivity.location}
                        onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                        placeholder="Location" 
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Options</label>
                    {newPoll.options.map((opt, idx) => (
                      <input 
                        key={idx}
                        type="text" 
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newPoll.options];
                          opts[idx] = e.target.value;
                          setNewPoll({...newPoll, options: opts});
                        }}
                        placeholder={`Option ${idx + 1}`} 
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      />
                    ))}
                    <button 
                      onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})}
                      className="text-xs font-bold text-blue-600 flex items-center gap-2 mt-4"
                    >
                      <Plus className="w-4 h-4" /> Add Option
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => { setIsAddingActivity(false); setIsCreatingPoll(false); }}
                  className="flex-1 py-5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={isAddingActivity ? handleAddActivity : handleCreatePoll}
                  className="flex-1 py-5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-xl"
                >
                  {isAddingActivity ? 'Add Activity' : 'Create Poll'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
