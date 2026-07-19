import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface QR {
  id: string;
  title: string;
  type: string;
  url: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  margin: number;
  logo?: string; // base64 or path
  pixelStyle?: string;
  downloads: number;
  favorites: string[]; // List of user IDs who favorited this QR
  userId?: string; // Creator user id
  createdAt: string;
  updatedAt: string;
}

interface DBStructure {
  users: User[];
  qrs: QR[];
}

let dbCache: DBStructure | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function initDB() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      dbCache = JSON.parse(data);
    } catch {
      dbCache = { users: [], qrs: [] };
      await fs.writeFile(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
    dbCache = { users: [], qrs: [] };
  }
}

async function getDB(): Promise<DBStructure> {
  if (!dbCache) {
    await initDB();
  }
  return dbCache!;
}

async function saveDB(): Promise<void> {
  if (!dbCache) return;
  // Queue writes sequentially to prevent file corruption
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      await fs.writeFile(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving database to file:", err);
    }
  });
  return writeQueue;
}

export const DatabaseService = {
  // --- USER OPERATIONS ---
  async findUserByEmail(email: string): Promise<User | null> {
    const db = await getDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async findUserById(id: string): Promise<User | null> {
    const db = await getDB();
    const user = db.users.find((u) => u.id === id);
    return user || null;
  },

  async createUser(name: string, email: string, passwordHash: string): Promise<User> {
    const db = await getDB();
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    await saveDB();
    return newUser;
  },

  // --- QR OPERATIONS ---
  async findQRs(userId?: string, search?: string, filterType?: string): Promise<QR[]> {
    const db = await getDB();
    let qrs = db.qrs;

    // Filter by user if requested
    if (userId) {
      qrs = qrs.filter((q) => q.userId === userId);
    }

    // Filter by search term
    if (search) {
      const lowerSearch = search.toLowerCase();
      qrs = qrs.filter(
        (q) =>
          q.title.toLowerCase().includes(lowerSearch) ||
          q.url.toLowerCase().includes(lowerSearch) ||
          q.type.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by type
    if (filterType && filterType !== "all") {
      qrs = qrs.filter((q) => q.type.toLowerCase() === filterType.toLowerCase());
    }

    // Sort by newest first
    return [...qrs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findQRById(id: string): Promise<QR | null> {
    const db = await getDB();
    const qr = db.qrs.find((q) => q.id === id);
    return qr || null;
  },

  async createQR(data: Omit<QR, "id" | "downloads" | "favorites" | "createdAt" | "updatedAt">): Promise<QR> {
    const db = await getDB();
    const newQR: QR = {
      ...data,
      id: crypto.randomUUID(),
      downloads: 0,
      favorites: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.qrs.push(newQR);
    await saveDB();
    return newQR;
  },

  async updateQR(id: string, updates: Partial<Omit<QR, "id" | "createdAt" | "updatedAt">>): Promise<QR | null> {
    const db = await getDB();
    const qrIndex = db.qrs.findIndex((q) => q.id === id);
    if (qrIndex === -1) return null;

    db.qrs[qrIndex] = {
      ...db.qrs[qrIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveDB();
    return db.qrs[qrIndex];
  },

  async deleteQR(id: string): Promise<boolean> {
    const db = await getDB();
    const initialLength = db.qrs.length;
    db.qrs = db.qrs.filter((q) => q.id !== id);
    if (db.qrs.length !== initialLength) {
      await saveDB();
      return true;
    }
    return false;
  },

  async toggleFavorite(id: string, userId: string): Promise<QR | null> {
    const db = await getDB();
    const qr = db.qrs.find((q) => q.id === id);
    if (!qr) return null;

    const favIndex = qr.favorites.indexOf(userId);
    if (favIndex === -1) {
      qr.favorites.push(userId);
    } else {
      qr.favorites.splice(favIndex, 1);
    }
    qr.updatedAt = new Date().toISOString();
    await saveDB();
    return qr;
  },

  async incrementDownloads(id: string): Promise<QR | null> {
    const db = await getDB();
    const qr = db.qrs.find((q) => q.id === id);
    if (!qr) return null;

    qr.downloads += 1;
    qr.updatedAt = new Date().toISOString();
    await saveDB();
    return qr;
  },
};
