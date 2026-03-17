import React from 'react';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  CheckCheck,
  Circle
} from 'lucide-react';
import { cn } from '@/src/utils/utils';

type Contact = {
  id: number;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
};

type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
};

const STORAGE_KEY = 'ownerMessagesChats';

const Messages = () => {
  const [activeChatId, setActiveChatId] = React.useState<number>(0);
  const [search, setSearch] = React.useState('');
  const [draft, setDraft] = React.useState('');
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [threads, setThreads] = React.useState<Record<number, ChatMessage[]>>({});
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const nowLabel = React.useCallback(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored?.contacts && stored?.threads) {
        setContacts(stored.contacts);
        setThreads(stored.threads);
        const firstId = Array.isArray(stored.contacts) && stored.contacts.length > 0 ? stored.contacts[0].id : 0;
        setActiveChatId(firstId);
        return;
      }
    } catch {
      // ignore
    }

    const seedContacts: Contact[] = [
      { id: 0, name: 'Sopheap Kim', lastMsg: 'Can we adjust the route timing?', time: '10:45 AM', unread: 2, avatar: 'https://i.pravatar.cc/150?u=10', online: true },
      { id: 1, name: 'Vannak Som', lastMsg: 'The vehicle is ready for pickup.', time: '09:30 AM', unread: 0, avatar: 'https://i.pravatar.cc/150?u=11', online: true },
      { id: 2, name: 'Rithy Bun', lastMsg: 'Sent you the monthly report.', time: 'Yesterday', unread: 0, avatar: 'https://i.pravatar.cc/150?u=12', online: false },
      { id: 3, name: 'Phanith Meas', lastMsg: 'New booking confirmed.', time: 'Yesterday', unread: 0, avatar: 'https://i.pravatar.cc/150?u=13', online: false },
    ];

    const seedThreads: Record<number, ChatMessage[]> = {
      0: [
        { id: '0-1', sender: 'them', text: 'Hello Alex, I have a question about the upcoming Siem Reap route.', time: '10:30 AM' },
        { id: '0-2', sender: 'them', text: 'Can we adjust the departure time to 8:30 AM instead of 8:00 AM? Some guests requested a bit more time for breakfast.', time: '10:31 AM' },
        { id: '0-3', sender: 'me', text: 'Hi Sopheap! Let me check the schedule for that day.', time: '10:35 AM' },
        { id: '0-4', sender: 'me', text: 'Yes, that should be fine. I will update the booking details now.', time: '10:36 AM' },
        { id: '0-5', sender: 'them', text: 'Great, thank you so much! They will be very happy.', time: '10:40 AM' },
        { id: '0-6', sender: 'them', text: 'Can we adjust the route timing?', time: '10:45 AM' },
      ],
      1: [{ id: '1-1', sender: 'them', text: 'The vehicle is ready for pickup.', time: '09:30 AM' }],
      2: [{ id: '2-1', sender: 'them', text: 'Sent you the monthly report.', time: 'Yesterday' }],
      3: [{ id: '3-1', sender: 'them', text: 'New booking confirmed.', time: 'Yesterday' }],
    };

    setContacts(seedContacts);
    setThreads(seedThreads);
    setActiveChatId(seedContacts[0].id);
  }, []);

  React.useEffect(() => {
    try {
      if (contacts.length === 0) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ contacts, threads }));
    } catch {
      // ignore
    }
  }, [contacts, threads]);

  const activeContact = React.useMemo(() => {
    return contacts.find((c) => c.id === activeChatId) ?? contacts[0];
  }, [activeChatId, contacts]);

  const activeMessages = React.useMemo(() => {
    return threads[activeChatId] ?? [];
  }, [activeChatId, threads]);

  React.useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [activeChatId, activeMessages.length]);

  const selectChat = (id: number) => {
    setActiveChatId(id);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    if (!activeContact) return;

    const msg: ChatMessage = {
      id: `${activeChatId}-${Date.now()}`,
      sender: 'me',
      text,
      time: nowLabel(),
    };

    setThreads((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), msg],
    }));
    setContacts((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, lastMsg: text, time: msg.time, unread: 0 } : c)),
    );
    setDraft('');

    window.setTimeout(() => {
      const replyText = 'Ok 👍';
      const reply: ChatMessage = {
        id: `${activeChatId}-${Date.now()}-r`,
        sender: 'them',
        text: replyText,
        time: nowLabel(),
      };
      setThreads((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] ?? []), reply],
      }));
      setContacts((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, lastMsg: replyText, time: reply.time } : c)),
      );
    }, 700);
  };

  const filteredContacts = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(q) || c.lastMsg.toLowerCase().includes(q));
  }, [contacts, search]);

  return (
    <div className="h-[calc(100vh-80px)] flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-4">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900"
              placeholder="Search conversations..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => selectChat(contact.id)}
              className={cn(
                "w-full p-4 flex gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left",
                activeChatId === contact.id && "bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-600"
              )}
            >
              <div className="relative flex-shrink-0">
                <img alt={contact.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" src={contact.avatar} />
                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-sm truncate">{contact.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{contact.time}</span>
                </div>
                <p className={cn(
                  "text-xs truncate",
                  contact.unread > 0 ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"
                )}>
                  {contact.lastMsg}
                </p>
              </div>
              {contact.unread > 0 && (
                <div className="flex-shrink-0 flex items-center">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {contact.unread}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
        <div className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {activeContact && (
                <img alt={activeContact.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" src={activeContact.avatar} />
              )}
              {activeContact?.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm leading-none">{activeContact?.name ?? 'Messages'}</h4>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-wider mt-1",
                activeContact?.online ? "text-emerald-500" : "text-slate-400"
              )}>
                {activeContact?.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
              <Phone size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
              <Video size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
              <Info size={20} />
            </button>
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">Today</span>
          </div>
          {activeMessages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[70%]",
              msg.sender === 'me' ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.sender === 'me'
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-800"
              )}>
                {msg.text}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{msg.time}</span>
                {msg.sender === 'me' && <CheckCheck size={12} className="text-blue-600" />}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 relative">
              <input
                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10"
                placeholder="Type your message here..."
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-all">
                <Smile size={20} />
              </button>
            </div>
            <button
              onClick={sendMessage}
              className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
