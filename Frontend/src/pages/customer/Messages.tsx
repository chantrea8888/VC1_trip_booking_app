import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock3, Mail, Search, Send, Phone, Video, MoreVertical, Info, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type AppUser = {
  id: number | string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
  phone?: string | null;
};

type UserLite = AppUser;

type MessageItem = {
  id: number | string;
  sender_id: number | string;
  receiver_id: number | string;
  message: string;
  created_at: string;
  sender?: UserLite | null;
  receiver?: UserLite | null;
};

type PendingThread = {
  ownerId?: number | string;
  ownerEmail?: string;
  ownerName?: string;
  ownerAvatar?: string;
};

type OwnerThread = {
  owner: AppUser;
  lastMessage: MessageItem;
  unreadCount?: number;
};

const API_BASE = ((import.meta as any).env.VITE_API_URL || '').replace(/\/$/, '');

const authToken = () => {
  const stores = [localStorage, sessionStorage];
  const keys = [
    'token',
    'access_token',
    'authToken',
    'auth_token',
    'api_token',
    'bearerToken',
    'bearer_token',
    'laravel_token',
  ];

  for (const store of stores) {
    for (const key of keys) {
      const value = store.getItem(key);
      if (value) return value;
    }
  }

  return '';
};

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  const token = authToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const candidates = API_BASE
    ? [`${API_BASE}${path}`, `${API_BASE}/api${path}`]
    : [`/api${path}`];

  let lastError: Error | null = null;

  for (const url of candidates) {
    const response = await fetch(url, { ...init, headers });
    if (response.ok) return response.json();
    const text = await response.text();
    lastError = new Error(text || `Request failed with status ${response.status}`);
    if (response.status !== 404) throw lastError;
  }

  throw lastError || new Error('Request failed');
}

function normalizeMessages(payload: unknown): MessageItem[] {
  if (Array.isArray(payload)) return payload as MessageItem[];
  if (payload && typeof payload === 'object') {
    const obj = payload as {
      messages?: MessageItem[];
      data?: MessageItem[];
      conversation?: MessageItem[];
    };
    if (Array.isArray(obj.messages)) return obj.messages;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.conversation)) return obj.conversation;
  }
  return [];
}

function displayName(user: UserLite | null | undefined) {
  if (!user) return 'Owner';
  return user.full_name?.trim() || user.name?.trim() || user.email?.split('@')[0] || 'Owner';
}

function formatClock(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDayLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date).toUpperCase();
}

function ownerFromMessage(message: MessageItem, currentUserId?: string) {
  if (String(message.sender_id) !== String(currentUserId)) return message.sender || null;
  return message.receiver || null;
}

function collectConversationOwners(messages: MessageItem[], currentUserId?: string) {
  const unique = new Map<string, AppUser>();

  messages.forEach((message) => {
    const owner = ownerFromMessage(message, currentUserId);
    if (!owner?.id) return;
    unique.set(String(owner.id), owner);
  });

  return [...unique.values()];
}

function collectConversationThreads(messages: MessageItem[], currentUserId?: string) {
  const threadMap = new Map<string, OwnerThread>();

  messages.forEach((message) => {
    const owner = ownerFromMessage(message, currentUserId);
    if (!owner?.id) return;

    const key = String(owner.id);
    const existing = threadMap.get(key);

    if (!existing || new Date(message.created_at).getTime() > new Date(existing.lastMessage.created_at).getTime()) {
      threadMap.set(key, {
        owner,
        lastMessage: message,
        unreadCount: threadMap.has(key)
          ? (threadMap.get(key)?.unreadCount ?? 0)
          : 0,
      });
    }

    const current = threadMap.get(key);
    if (current && String(message.receiver_id) === String(currentUserId) && !message.read_at) {
      current.unreadCount = (current.unreadCount ?? 0) + 1;
      threadMap.set(key, current);
    }
  });

  return [...threadMap.values()];
}

async function loadMessageThread(targetId?: string) {
  const paths = targetId
    ? [`/customer/messages/${targetId}`, `/messages/${targetId}`]
    : ['/customer/messages', '/messages'];

  let lastPayload: unknown = [];

  for (const path of paths) {
    try {
      const payload = await apiRequest<unknown>(path);
      const normalized = normalizeMessages(payload);
      lastPayload = payload;
      if (normalized.length > 0) {
        return normalized;
      }
    } catch {
      // Try the next compatible endpoint.
    }
  }

  return normalizeMessages(lastPayload);
}

export default function CustomerMessagesPage() {
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState<MessageItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [ownerThreads, setOwnerThreads] = useState<OwnerThread[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thread, setThread] = useState<PendingThread | null>(null);
  const [search, setSearch] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const currentUserId = String(user?.id ?? '');

  const owner = useMemo(() => {
    const explicitOwnerId = thread?.ownerId ? String(thread.ownerId) : '';
    if (explicitOwnerId) {
      const fromThread = messages.find(
        (message) =>
          (String(message.sender_id) === explicitOwnerId && message.sender) ||
          (String(message.receiver_id) === explicitOwnerId && message.receiver),
      );
      const explicit = fromThread ? ownerFromMessage(fromThread, currentUserId) : null;
      if (explicit) return explicit;

      return {
        id: explicitOwnerId,
        email: thread?.ownerEmail,
        name: thread?.ownerName,
        full_name: thread?.ownerName,
        avatar: thread?.ownerAvatar,
        role: 'owner',
      };
    }

    const latestOwnerMessage = [...messages]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .find((message) => String(message.sender_id) !== currentUserId);

    return latestOwnerMessage ? ownerFromMessage(latestOwnerMessage, currentUserId) : null;
  }, [messages, thread, currentUserId]);

  const conversationMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [messages, owner, thread]);

  const groupedMessages = useMemo(() => {
    const groups: Array<{ key: string; label: string; items: MessageItem[] }> = [];
    let currentLabel = '';

    conversationMessages.forEach((item) => {
      const label = formatDayLabel(item.created_at);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ key: `${item.id}-${label}`, label, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    });

    return groups;
  }, [conversationMessages]);

  const recentOwners = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = ownerThreads
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())
      .map((thread) => ({ ...thread.owner, lastMessage: thread.lastMessage, unreadCount: thread.unreadCount }));

    return q
      ? list.filter((item) =>
          displayName(item).toLowerCase().includes(q) || (item.email || '').toLowerCase().includes(q) ||
          String(item.lastMessage?.message || '').toLowerCase().includes(q)
        )
      : list;
  }, [ownerThreads, search]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  useEffect(() => {
    if (loading || messages.length === 0) return;
    if (thread?.ownerId) return;

    const latestOwnerMessage = [...messages]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .find((message) => String(message.sender_id) !== currentUserId);

    if (latestOwnerMessage) {
      const derivedOwner = ownerFromMessage(latestOwnerMessage, currentUserId);
      if (derivedOwner) {
        setThread({
          ownerId: derivedOwner.id,
          ownerEmail: derivedOwner.email || '',
          ownerName: displayName(derivedOwner),
          ownerAvatar: derivedOwner.avatar || '',
        });
      }
    }
  }, [loading, messages, thread?.ownerId, currentUserId]);

  async function loadConversation() {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const stored = sessionStorage.getItem('pending_message_thread');
      const parsed = stored ? (JSON.parse(stored) as PendingThread) : null;
      setThread(parsed);

      // Load full customer inbox and extract owner threads
      const allPayload = await loadMessageThread();
      setAllMessages(allPayload);
      const threads = collectConversationThreads(allPayload, currentUserId);
      setOwnerThreads(threads);

      const targetOwnerId = parsed?.ownerId ? String(parsed.ownerId) : threads[0]?.owner?.id ? String(threads[0].owner.id) : '';
      if (targetOwnerId) {
        await loadOwnerConversation(targetOwnerId);
      } else {
        setMessages(allPayload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  async function loadOwnerConversation(ownerId: string) {
    try {
      setLoading(true);
      const conv = await loadMessageThread(ownerId);
      setMessages(conv);

      const ownerInfoFromThread = ownerThreads.find((t) => String(t.owner.id) === String(ownerId))?.owner;
      const previousThread = thread;

      setThread({
        ownerId,
        ownerName: ownerInfoFromThread?.name || ownerInfoFromThread?.full_name || previousThread?.ownerName || '',
        ownerEmail: ownerInfoFromThread?.email || previousThread?.ownerEmail || '',
        ownerAvatar: ownerInfoFromThread?.avatar || previousThread?.ownerAvatar || '',
      });
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || sending) return;

    const ownerId = thread?.ownerId ? String(thread.ownerId) : owner?.id ? String(owner.id) : '';
    if (!ownerId) {
      setError('Please select a contact from the sidebar to start a conversation.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await apiRequest('/customer/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: ownerId,
          message: draft.trim(),
        }),
      });

      const now = new Date().toISOString();
      const optimisticMessage: MessageItem = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        sender_id: currentUserId,
        receiver_id: ownerId,
        message: draft.trim(),
        created_at: now,
      };

      setDraft('');
      setMessages((current) => [...current, optimisticMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadConversation();
  }, [user?.id]);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <div className="flex h-full">
        <aside className="hidden w-[360px] flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="border-b border-slate-200 px-6 py-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Chats</h1>
            
            <label className="relative mt-6 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">All Agents</p>
            </div>

            {recentOwners.length === 0 ? (
              <div className="px-6 py-8 text-sm font-medium text-slate-400">
                No conversations yet.
              </div>
            ) : (
              recentOwners.map((item) => (
                <button
                  key={String(item.id)}
                  type="button"
                  onClick={async () => {
                    setThread({
                      ownerId: item.id,
                      ownerEmail: item.email || '',
                      ownerName: displayName(item),
                      ownerAvatar: item.avatar || '',
                    });
                    await loadOwnerConversation(String(item.id));
                  }}
                  className={`flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50 ${
                    String(thread?.ownerId || '') === String(item.id) ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    {item.avatar ? (
                      <img src={item.avatar} alt={displayName(item)} className="h-14 w-14 rounded-full object-cover shadow-sm border-2 border-white" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 shadow-inner border-2 border-white">
                        {(displayName(item)[0] || 'O').toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-bold text-slate-900 leading-tight">{displayName(item)}</p>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{formatClock(item.lastMessage?.created_at || '')}</span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-2 truncate text-xs font-medium text-slate-500">
                      <span className="truncate">{item.lastMessage?.message || 'No messages yet'}</span>
                      {item.unreadCount > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{item.unreadCount}</span>
                      )}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-slate-50 relative overflow-hidden">
          {/* Sticky Premium Header */}
          <div className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-md shadow-sm">
            <Link
              to="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative shrink-0">
                {owner?.avatar ? (
                  <img src={owner.avatar} alt={displayName(owner)} className="h-11 w-11 rounded-full object-cover shadow-sm border-2 border-white" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 shadow-sm border-2 border-white">
                    {(displayName(owner)[0] || 'O').toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-slate-900 leading-tight">{displayName(owner)}</h1>
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full text-blue-600 transition hover:bg-blue-50" title="Video Call">
                <Video size={20} />
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full text-blue-600 transition hover:bg-blue-50" title="Voice Call">
                <Phone size={18} />
              </button>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${showProfile ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Agent Info"
              >
                <Info size={20} />
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 overflow-hidden">
            <div 
              className="flex-1 overflow-y-auto px-4 py-8 lg:px-8"
              style={{
                backgroundColor: '#e5ddd5',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 86c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm66 3c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-40-39c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm14-26c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-8 48c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-10-10c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm20-20c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm4-4c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-12 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-4-4c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM42 70c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-8-2c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-4-4c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm12 12c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm4 4c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-12-12c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-4-4c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }}
            >
              <div className="flex min-h-full flex-col justify-start">
                {error && (
                  <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm animate-in fade-in zoom-in duration-300">
                    {error}
                  </div>
                )}

                <div className="flex-1">
                  {loading ? (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400 animate-pulse">
                      SECURE CONNECTION ESTABLISHED...
                    </div>
                  ) : (
                    <div className="flex min-h-full flex-col justify-start">
                      {groupedMessages.length > 0 ? (
                        <div className="space-y-8">
                          {groupedMessages.map((group) => (
                            <div key={group.key} className="space-y-4">
                              <div className="flex justify-center sticky top-4 z-10">
                                <span className="rounded-full border border-slate-200/50 bg-white/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
                                  {group.label}
                                </span>
                              </div>

                              <div className="space-y-4">
                                {group.items.map((message) => {
                                  const incoming = String(message.sender_id) !== currentUserId;

                                  return (
                                    <div
                                      key={String(message.id)}
                                      className={`flex ${incoming ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                    >
                                      <div
                                        className={`relative max-w-[85%] rounded-[1.5rem] px-5 py-3 shadow-sm ${
                                          incoming
                                            ? 'rounded-tl-none border border-slate-200 bg-white text-slate-800'
                                            : 'rounded-tr-none bg-blue-600 text-white shadow-blue-100'
                                        }`}
                                      >
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                                        <div
                                          className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] font-medium ${
                                            incoming ? 'text-slate-400' : 'text-blue-100/80'
                                          }`}
                                        >
                                          <span>{formatClock(message.created_at)}</span>
                                          {!incoming && <div className="flex items-center gap-0.5"><div className="h-1 w-1 rounded-full bg-blue-100" /><div className="h-1 w-1 rounded-full bg-blue-100" /></div>}
                                        </div>

                                        {/* Bubble Tails */}
                                        <div className={`absolute top-0 h-4 w-4 ${
                                          incoming 
                                            ? '-left-2 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)] border-l border-t border-slate-200' 
                                            : '-right-2 bg-blue-600 [clip-path:polygon(0_0,100%_0,0_100%)]'
                                        }`} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center py-10">
                          <div className="max-w-md rounded-[2.5rem] border border-dashed border-slate-300 bg-white/60 backdrop-blur-sm px-8 py-10 text-center shadow-lg">
                            <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-6 shadow-inner">
                              <MessageCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Start Conversation</h3>
                            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
                              Your messages are end-to-end encrypted.<br/>
                              Send a message to start chatting with {displayName(owner)}.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div ref={bottomRef} />
            </div>

            {/* Profile Sidebar (Right Column) */}
            {showProfile && (
              <div className="w-[320px] border-l border-slate-200 bg-white p-8 transition-all overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="text-center">
                  {owner?.avatar ? (
                    <img
                      src={owner.avatar}
                      alt={displayName(owner)}
                      className="mx-auto h-32 w-32 rounded-full border-4 border-slate-50 object-cover shadow-xl"
                    />
                  ) : (
                    <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-blue-50 text-4xl font-black text-blue-600 shadow-inner border-4 border-slate-50">
                      {(displayName(owner)[0] || 'O').toUpperCase()}
                    </div>
                  )}
                  <h3 className="mt-6 text-xl font-bold text-slate-900 leading-tight">{displayName(owner)}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{owner?.email || 'Trip Agent'}</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm border border-emerald-100">Verified Agent</span>
                  </div>
                </div>

                <div className="mt-12 space-y-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Business Details</p>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-4 group">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <Mail size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Email</p>
                          <p className="text-sm font-semibold text-slate-700 truncate">{owner?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Support</p>
                    <div className="mt-4 space-y-2">
                      <button className="w-full rounded-2xl py-3.5 px-4 text-center text-sm font-bold text-blue-600 bg-blue-50 transition hover:bg-blue-600 hover:text-white group">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="flex items-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 lg:px-6 backdrop-blur-md z-20"
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your message here..."
              rows={1}
              className="min-h-[56px] flex-1 resize-none rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:shadow-sm"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
