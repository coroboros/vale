/**
 * Chromium browsers fire `beforeinstallprompt` and show their own dialog; Safari and Firefox need
 * a short set of steps instead.
 */
import { signal } from '@preact/signals';
import { inFrame, isFirefox, isIOS, isMacSafari, isStandalone } from './env';

export type InstallMethod = 'installed' | 'prompt' | 'ios' | 'mac-safari' | 'firefox' | 'unsupported' | 'frame';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;

function detect(): InstallMethod {
  if (inFrame) return 'frame';
  if (isStandalone()) return 'installed';
  if (isIOS) return 'ios';
  if (isMacSafari) return 'mac-safari';
  if (isFirefox) return 'firefox';
  return 'unsupported';
}

export const installMethod = signal<InstallMethod>('unsupported');

export function initInstall(): void {
  installMethod.value = detect();
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    installMethod.value = 'prompt';
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installMethod.value = 'installed';
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  if (outcome === 'accepted') installMethod.value = 'installed';
  return outcome === 'accepted';
}

export const INSTALL_STEPS: Record<'ios' | 'mac-safari' | 'firefox' | 'unsupported', string[]> = {
  ios: ['Touche le bouton Partager de Safari.', 'Choisis « Sur l’écran d’accueil ».', 'Touche « Ajouter ».'],
  'mac-safari': ['Dans Safari, ouvre le menu Fichier.', 'Choisis « Ajouter au Dock ».', 'Clique sur « Ajouter ».'],
  firefox: [
    'Sous Windows, clique sur l’icône « Ajouter à la barre des tâches » dans la barre d’adresse (Firefox Labs).',
    'Sinon, ouvre cette page dans Chrome, Edge ou Safari pour l’installer.',
  ],
  unsupported: ['Ouvre cette page dans Chrome, Edge ou Safari.', 'Choisis « Installer l’application » dans le menu.'],
};
