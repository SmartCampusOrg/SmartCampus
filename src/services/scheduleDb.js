/**
 * scheduleDb.js - Obsługa magazynu IndexedDB dla planu zajęć Smart Campus
 * Zastępuje limitowane 5MB localStorage, eliminując blokowanie głównego wątku
 * i błędy QuotaExceededError przy dużych harmonogramach.
 */

const DB_NAME = 'SmartCampusScheduleDB';
const DB_VERSION = 1;
const STORE_NAME = 'scheduleStore';
const SCHEDULE_RECORD_KEY = 'all_lessons';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB nie jest wspierane w tym środowisku'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Pobiera pełną listę zajęć z bazy IndexedDB
 * @returns {Promise<Array|null>}
 */
export async function getScheduleFromDb() {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(SCHEDULE_RECORD_KEY);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Błąd odczytu z IndexedDB:', err);
    return null;
  }
}

/**
 * Zapisuje zajęcia w IndexedDB przy użyciu natywnego algorytmu Structured Clone
 * @param {Array} lessons 
 * @returns {Promise<boolean>}
 */
export async function saveScheduleToDb(lessons) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(lessons, SCHEDULE_RECORD_KEY);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Błąd zapisu do IndexedDB:', err);
    return false;
  }
}

/**
 * Usuwa zajęcia z IndexedDB
 * @returns {Promise<boolean>}
 */
export async function clearScheduleFromDb() {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(SCHEDULE_RECORD_KEY);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Błąd czyszczenia IndexedDB:', err);
    return false;
  }
}
