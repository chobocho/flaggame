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
 * Falls back to an in-memory, session-only list when IndexedDB is missing
 * (SSR, unit tests) or fails to open (private browsing, storage denied,
 * blocked by another connection) so the rest of the game keeps working.
 */
export class HighScores {
  private db: IDBDatabase | null = null;
  private memoryFallback: ScoreEntry[] = [];
  private ready: Promise<void> | null = null;

  /** Resolves once the single shared connection is open, or once IndexedDB
   *  is determined unavailable (db stays null → memory fallback). Lazy and
   *  cached so every add()/getTop() call sequences itself for free. */
  private ensureOpen(): Promise<void> {
    if (!this.ready) {
      this.ready =
        typeof indexedDB === 'undefined'
          ? Promise.resolve()
          : openDatabase().then(
              db => {
                this.db = db;
              },
              () => {
                this.db = null;
              },
            );
    }
    return this.ready;
  }

  async add(entry: ScoreEntry): Promise<void> {
    await this.ensureOpen();
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
    await this.ensureOpen();
    if (!this.db) {
      return this.memoryFallback.slice(0, n);
    }
    return new Promise<ScoreEntry[]>((resolve, reject) => {
      const tx = this.db!.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = (req.result as ScoreEntry[]).sort(byScoreDesc);
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
    // Without this a pending versionchange elsewhere would leave the
    // promise unsettled forever; rejecting drops us to the memory fallback.
    req.onblocked = () => reject(new Error('IndexedDB open blocked'));
  });
}
