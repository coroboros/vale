import { Download, ExternalLink } from 'lucide-preact';
import { useState } from 'preact/hooks';
import { BRAND } from '../brand';
import { INSTALL_STEPS, installMethod, promptInstall } from '../platform/install';
import { offlineReady } from '../platform/pwa';
import { Sheet } from './kit';

export function InstallButton({ block, secondary }: { block?: boolean; secondary?: boolean }) {
  const [steps, setSteps] = useState(false);
  const method = installMethod.value;
  if (method === 'installed') return null;
  if (method === 'frame') {
    return (
      <a class={`btn${block ? ' btn-block' : ''}`} href={BRAND.url} target="_blank" rel="noopener">
        <ExternalLink size={20} aria-hidden="true" />
        Ouvrir l’app pour l’installer
      </a>
    );
  }
  const onClick = () => (method === 'prompt' ? void promptInstall() : setSteps(true));
  return (
    <>
      <button
        type="button"
        class={`btn${secondary ? '' : ' btn-primary'}${block ? ' btn-block' : ''}`}
        onClick={onClick}
      >
        <Download size={20} aria-hidden="true" />
        Installer l’app
      </button>
      {steps && method !== 'prompt' && (
        <Sheet title="Installer l’app" onClose={() => setSteps(false)}>
          <ol class="steps">
            {INSTALL_STEPS[method].map(s => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p class="muted">
            Une fois installée, {BRAND.name} s’ouvre comme une app, sans barre d’adresse, et fonctionne sans réseau
            {offlineReady.value ? '.' : ' dès qu’elle a fini de se préparer.'}
          </p>
        </Sheet>
      )}
    </>
  );
}

/**
 * On an iPhone, Safari deletes a site's data after seven days of Safari use without a visit; apps
 * on the home screen keep theirs (WebKit, 2020). Shown once there is progress to lose.
 */
export function KeepProgress() {
  if (installMethod.value !== 'ios') return null;
  return (
    <section class="card keep" aria-labelledby="keep-title">
      <h2 id="keep-title">Garde ta progression</h2>
      <p>
        Sur iPhone, Safari efface les données d’un site resté sans visite pendant sept jours d’utilisation. Installée
        sur l’écran d’accueil, {BRAND.name} garde tout.
      </p>
      <InstallButton block />
    </section>
  );
}
