import { Check, Download, Maximize2, Pencil, Share, X } from 'lucide-preact';
import { useEffect, useState } from 'preact/hooks';
import { editTrip, markShared } from '../../actions';
import { BRAND } from '../../brand';
import { flagOf, pictureOf, regionOf, splitKey } from '../../content';
import { canShareFile, shareFile } from '../../platform/share';
import { type SurvivalCardData, tripOf } from '../../state/schema';
import { cindex, course, pdata, profile, updateData } from '../../state/store';
import { cardPicture } from '../card-image';
import { Say, Sheet } from '../kit';
import { Mascot } from '../Mascot';
import { Scenery } from '../scenery/Scenery';

interface Line {
  id: string;
  t: string;
  fr: string;
  lang: string;
  hero?: boolean;
}

function useLines(): Line[] {
  const c = course.value;
  const p = profile.value!;
  const data = pdata.value;
  const card = data.card;
  const { hotel, address } = tripOf(p);
  const lines: Line[] = [{ id: 'help', ...c.card.help, lang: c.lang, hero: true }];
  if (hotel)
    lines.push({
      id: 'hotel',
      t: c.say.toHotel(hotel),
      fr: `À l’hôtel ${hotel}, s’il vous plaît.`,
      lang: c.lang,
    });
  if (address) lines.push({ id: 'address', t: address, fr: 'Mon adresse ici', lang: c.lang });
  const allergens = c.card.allergens.filter(a => card.allergens.includes(a.id));
  if (allergens.length) {
    lines.push({
      id: 'allergy',
      t: c.say.allergy(
        allergens.map(a => a.t),
        p.gender,
      ),
      fr: `Je suis allergique : ${allergens.map(a => a.fr).join(', ')}. C’est très important.`,
      lang: c.lang,
    });
  }
  for (const d of c.card.diets.filter(x => card.diets.includes(x.id)))
    lines.push({ id: d.id, t: c.gender(d.t, p.gender), fr: d.fr, lang: c.lang });
  lines.push({ id: 'name', t: c.say.myName(p.name), fr: `Je m’appelle ${p.name}.`, lang: c.lang });
  lines.push({ id: 'sos', ...c.card.sos, lang: c.lang });
  const index = cindex.value;
  for (const key of data.favorites) {
    const [courseId, itemId] = splitKey(key);
    const entry = courseId === c.id ? index.entries.get(itemId) : undefined;
    if (entry) lines.push({ id: key, t: entry.item.t, fr: entry.item.fr, lang: entry.lang });
  }
  return lines;
}

function EditSheet({ onClose }: { onClose: () => void }) {
  const c = course.value;
  const card = pdata.value.card;
  const trip = tripOf(profile.value!);
  const { at } = regionOf(c, trip.region);
  const set = (patch: Partial<SurvivalCardData>) =>
    updateData(d => {
      d.card = { ...d.card, ...patch };
    });
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  return (
    <Sheet title="Ma carte" onClose={onClose}>
      <div class="form">
        <label class="field">
          <span>Mon hôtel {at}</span>
          <input
            class="input"
            value={trip.hotel}
            onInput={e => editTrip({ hotel: e.currentTarget.value })}
            placeholder={c.card.example.hotel}
            autocomplete="off"
          />
        </label>
        <label class="field">
          <span>Mon adresse {at}</span>
          <textarea
            class="input"
            rows={2}
            value={trip.address}
            onInput={e => editTrip({ address: e.currentTarget.value })}
            placeholder={c.card.example.address}
          />
        </label>
        <fieldset class="field">
          <legend>Allergies</legend>
          <div class="chips">
            {c.card.allergens.map(a => (
              <button
                key={a.id}
                type="button"
                class="chip"
                aria-pressed={card.allergens.includes(a.id)}
                onClick={() => set({ allergens: toggle(card.allergens, a.id) })}
              >
                {a.fr}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset class="field">
          <legend>Régime</legend>
          <div class="chips">
            {c.card.diets.map(d => (
              <button
                key={d.id}
                type="button"
                class="chip"
                aria-pressed={card.diets.includes(d.id)}
                onClick={() => set({ diets: toggle(card.diets, d.id) })}
              >
                {d.fr}
              </button>
            ))}
          </div>
        </fieldset>
        <p class="muted small">
          Les phrases s’accordent avec ton profil. Ajoute d’autres phrases avec l’étoile, dans Phrases.
        </p>
      </div>
    </Sheet>
  );
}

function ShareSheet({ lines, onClose }: { lines: Line[]; onClose: () => void }) {
  const c = course.value;
  const { region } = tripOf(profile.value!);
  const place = regionOf(c, region);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<'' | 'sent' | 'saved'>('');
  useEffect(() => {
    let link = '';
    cardPicture({
      view: <Scenery place={pictureOf(c, region)} />,
      bernard: <Mascot flag={flagOf(c, region)} followPointer={false} blinks={false} decorative />,
      title: place.native,
      phrases: lines,
    }).then(
      picture => {
        link = URL.createObjectURL(picture);
        setFile(picture);
        setUrl(link);
      },
      () => setFailed(true),
    );
    return () => URL.revokeObjectURL(link);
  }, []);
  const text = `Ma carte de survie pour voyager ${place.at}, faite avec ${BRAND.name} : ${BRAND.url}?utm_source=carte`;
  return (
    <Sheet title="Partager ma carte" onClose={onClose}>
      <div class="share-card">
        {file ? (
          <img
            class="share-preview"
            src={url}
            alt={`Ta carte de survie pour voyager ${place.at} : le dessin, Bernard et tes phrases`}
          />
        ) : (
          <p class="share-wait muted" role="status">
            {failed ? 'L’image n’a pas pu être préparée.' : 'Préparation de l’image…'}
          </p>
        )}
        <p class={done ? 'share-done' : 'muted small'} role="status">
          {done && <Check size={20} aria-hidden="true" />}
          {done === 'sent'
            ? 'Carte envoyée.'
            : done === 'saved'
              ? 'Image enregistrée : joins-la à un message.'
              : 'Elle reprend tout ce qui est sur ta carte.'}
        </p>
        {file &&
          (canShareFile(file) ? (
            <button
              type="button"
              class="btn btn-primary btn-block"
              onClick={async () => {
                if (!(await shareFile(file, text))) return;
                markShared();
                setDone('sent');
              }}
            >
              <Share size={18} aria-hidden="true" /> Partager
            </button>
          ) : (
            <a
              class="btn btn-primary btn-block"
              href={url}
              download={file.name}
              onClick={() => {
                markShared();
                setDone('saved');
              }}
            >
              <Download size={18} aria-hidden="true" /> Enregistrer l’image
            </a>
          ))}
      </div>
    </Sheet>
  );
}

function Show({ line, onClose }: { line: Line; onClose: () => void }) {
  return (
    <div class="show" role="dialog" aria-modal="true" aria-label="Phrase en grand">
      <button type="button" class="icon-btn show-close" aria-label="Fermer" onClick={onClose} autofocus>
        <X size={28} />
      </button>
      <p class="show-t" lang={line.lang}>
        {line.t}
      </p>
      <p class="show-fr">{line.fr}</p>
      <Say text={line.t} lang={line.lang} />
    </div>
  );
}

export function CardScreen() {
  const lines = useLines();
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shown, setShown] = useState<Line | null>(null);
  return (
    <>
      <header class="page-head">
        <div class="section-head">
          <h1>Ma carte de survie</h1>
          <button type="button" class="btn" onClick={() => setEditing(true)}>
            <Pencil size={18} aria-hidden="true" /> Modifier
          </button>
        </div>
        <p class="muted">À montrer quand les mots ne viennent pas.</p>
      </header>
      <ul class="card-lines">
        {lines.map(line => (
          <li key={line.id} class={`card-line${line.hero ? ' hero' : ''}`}>
            <p class="card-t" lang={line.lang}>
              {line.t}
            </p>
            <p class="muted">{line.fr}</p>
            <div class="card-tools">
              <Say text={line.t} lang={line.lang} small soft />
              <button type="button" class="btn" onClick={() => setShown(line)}>
                <Maximize2 size={18} aria-hidden="true" /> Montrer
              </button>
            </div>
          </li>
        ))}
      </ul>
      <section class="card-share" aria-labelledby="card-share">
        <h2 id="card-share">Pour qui voyage avec toi</h2>
        <p class="muted">Ta carte en image, à envoyer par message.</p>
        <button type="button" class="btn btn-block" onClick={() => setSharing(true)}>
          <Share size={18} aria-hidden="true" /> Partager ma carte
        </button>
      </section>
      {editing && <EditSheet onClose={() => setEditing(false)} />}
      {sharing && <ShareSheet lines={lines} onClose={() => setSharing(false)} />}
      {shown && <Show line={shown} onClose={() => setShown(null)} />}
    </>
  );
}
