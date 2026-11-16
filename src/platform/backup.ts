/** Keeping progress safe: persistent storage request, and a backup file to export or restore. */
import { BRAND } from '../brand';
import { type DB, sanitize } from '../state/schema';

/** Asks the browser not to evict our data under storage pressure. */
export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

/** Shares (iOS) or downloads (desktop) a JSON copy of all progress. */
export async function exportBackup(db: DB, now = new Date()): Promise<void> {
  const name = `${BRAND.name.toLowerCase()}-sauvegarde-${now.toISOString().slice(0, 10)}.json`;
  const file = new File([JSON.stringify(db)], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${BRAND.name} : sauvegarde` });
      return;
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const link = Object.assign(document.createElement('a'), { href: url, download: name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Reads a backup file; throws a readable message when the file is not a backup. */
export async function readBackup(file: File): Promise<DB> {
  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    throw new Error('Ce fichier n’est pas une sauvegarde lisible.');
  }
  const db = sanitize(raw);
  if (!db.profiles.length) throw new Error('Cette sauvegarde ne contient aucun profil.');
  return db;
}
