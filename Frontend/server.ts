import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database("planning.db");

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    creator_email TEXT NOT NULL,
    access_code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    group_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT DEFAULT 'Member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_email),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    text TEXT,
    type TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS itinerary (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    time TEXT NOT NULL,
    activity TEXT NOT NULL,
    location TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    question TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS poll_options (
    id TEXT PRIMARY KEY,
    poll_id TEXT NOT NULL,
    text TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const PORT = 3000;

  app.use(express.json());

  // Helper: Check if user is member of group
  const isMember = (groupId: string, email: string) => {
    const member = db.prepare("SELECT 1 FROM members WHERE group_id = ? AND user_email = ?").get(groupId, email);
    return !!member;
  };

  // API Routes
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Create a new group
  app.post("/api/groups", (req, res) => {
    const { name, creatorEmail, creatorName, accessCode } = req.body;
    const groupId = Math.random().toString(36).substring(2, 9);
    
    try {
      db.transaction(() => {
        db.prepare("INSERT INTO groups (id, name, creator_email, access_code) VALUES (?, ?, ?, ?)").run(groupId, name, creatorEmail, accessCode);
        db.prepare("INSERT INTO members (group_id, user_email, user_name, role) VALUES (?, ?, ?, ?)").run(groupId, creatorEmail, creatorName, 'Leader');
      })();
      
      const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(groupId);
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  // Join a group with access code
  app.post("/api/groups/join", (req, res) => {
    const { groupId, accessCode, userEmail, userName } = req.body;
    
    const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(groupId) as any;
    if (!group) return res.status(404).json({ error: "Group not found" });
    
    if (group.access_code !== accessCode) {
      return res.status(403).json({ error: "Invalid access code" });
    }

    try {
      db.prepare("INSERT OR IGNORE INTO members (group_id, user_email, user_name) VALUES (?, ?, ?)").run(groupId, userEmail, userName);
      res.json({ success: true, groupId });
    } catch (error) {
      res.status(500).json({ error: "Failed to join group" });
    }
  });

  // Get group details
  app.get("/api/groups/:id", (req, res) => {
    const { email } = req.query;
    const groupId = req.params.id;

    if (!email || !isMember(groupId, email as string)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(groupId) as any;
    const members = db.prepare("SELECT * FROM members WHERE group_id = ?").all(groupId);
    const messages = db.prepare("SELECT * FROM messages WHERE group_id = ? ORDER BY created_at ASC").all(groupId);
    const itinerary = db.prepare("SELECT * FROM itinerary WHERE group_id = ?").all(groupId);
    const polls = db.prepare("SELECT * FROM polls WHERE group_id = ?").all(groupId).map((poll: any) => ({
      ...poll,
      options: db.prepare("SELECT * FROM poll_options WHERE poll_id = ?").all(poll.id)
    }));

    res.json({ ...group, members, messages, itinerary, polls });
  });

  // Socket.io logic with security checks
  io.on("connection", (socket) => {
    socket.on("join-group", ({ groupId, email }) => {
      if (isMember(groupId, email)) {
        socket.join(groupId);
        const user = db.prepare("SELECT user_name FROM members WHERE group_id = ? AND user_email = ?").get(groupId, email) as any;
        socket.to(groupId).emit("user-joined", { name: user.user_name, email });
      }
    });

    socket.on("send-message", ({ groupId, email, text }) => {
      if (isMember(groupId, email)) {
        const user = db.prepare("SELECT user_name FROM members WHERE group_id = ? AND user_email = ?").get(groupId, email) as any;
        const messageId = Math.random().toString(36).substring(2, 11);
        db.prepare("INSERT INTO messages (id, group_id, sender_email, sender_name, text) VALUES (?, ?, ?, ?, ?)").run(messageId, groupId, email, user.user_name, text);
        
        const message = db.prepare("SELECT * FROM messages WHERE id = ?").get(messageId);
        io.to(groupId).emit("new-message", message);
      }
    });

    socket.on("update-itinerary", ({ groupId, email, item }) => {
      if (isMember(groupId, email)) {
        const id = item.id || Math.random().toString(36).substring(2, 11);
        db.prepare(`
          INSERT INTO itinerary (id, group_id, time, activity, location) 
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET time=excluded.time, activity=excluded.activity, location=excluded.location
        `).run(id, groupId, item.time, item.activity, item.location);
        
        const updatedItinerary = db.prepare("SELECT * FROM itinerary WHERE group_id = ?").all(groupId);
        io.to(groupId).emit("itinerary-updated", updatedItinerary);
      }
    });

    socket.on("create-poll", ({ groupId, email, question, options }) => {
      if (isMember(groupId, email)) {
        const pollId = Math.random().toString(36).substring(2, 11);
        db.transaction(() => {
          db.prepare("INSERT INTO polls (id, group_id, question) VALUES (?, ?, ?)").run(pollId, groupId, question);
          options.forEach((opt: string) => {
            db.prepare("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)").run(Math.random().toString(36).substring(2, 11), pollId, opt);
          });
        })();
        
        const newPoll = {
          ...db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId) as any,
          options: db.prepare("SELECT * FROM poll_options WHERE poll_id = ?").all(pollId)
        };
        io.to(groupId).emit("poll-created", newPoll);
      }
    });

    socket.on("vote-poll", ({ groupId, email, optionId }) => {
      if (isMember(groupId, email)) {
        db.prepare("UPDATE poll_options SET votes = votes + 1 WHERE id = ?").run(optionId);
        const pollId = (db.prepare("SELECT poll_id FROM poll_options WHERE id = ?").get(optionId) as any).poll_id;
        const updatedPoll = {
          ...db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId) as any,
          options: db.prepare("SELECT * FROM poll_options WHERE poll_id = ?").all(pollId)
        };
        io.to(groupId).emit("poll-updated", updatedPoll);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
