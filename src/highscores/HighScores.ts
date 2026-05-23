/** Single high-score row. `date` is a millisecond timestamp. */
export interface ScoreEntry {
  score: number;
  date: number;
}

const DB_NAME = 'flaggame';
const DB_VERSION = 1;
const STORE = 'highscores';

/**
 * IndexedDB-backed top-N high score list. The store keeps every score the
 * player has ever set; `getTop()` returns the highest N rows. We do not
 * prune the store — IndexedDB compresses cheaply and keeping history makes
 * future "best month" / "stats" features trivial without a migration.
 *
 * Falls back gracefully when IndexedDB is not available (SSR, unit tests,
 * private browsing on some browsers) so the rest of the game keeps working.
 */
export class HighScores {
  private db: IDBDatabase | null = null;
  private memoryFallback: ScoreEntry[] = [];
  private readonly available: boolean;

  constructor() {
    this.available = typeof indexedDB !== 'undefined';
  }

  async open(): Promise<void> {
    if (!this.available) return;
    this.db = await openDatabase();
  }

  async add(entry: ScoreEntry): Promise<void> {
    if (!this.db) {
      this.memoryFallback.push(entry);
      this.memoryFallback.sort(byScoreDesc);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      tx.objectStore(STORE).add(entry);
    });
  }

  async getTop(n: number): Promise<ScoreEntry[]> {
    if (!this.db) {
      return this.memoryFallback.slice(0, n);
    }
    return new Promise<ScoreEntry[]>((resolve, reject) => {
      const tx = this.db!.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = (req.result as ScoreEntry[]).slice().sort(byScoreDesc);
        resolve(all.slice(0, n));
      };
      req.onerror = () => reject(req.error);
    });
  }
}

function byScoreDesc(a: ScoreEntry, b: ScoreEntry): number {
  if (b.score !== a.score) return b.score - a.score;
  return b.date - a.date;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
