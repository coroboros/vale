import { Maximize2, Pencil, X } from 'lucide-preact';
import { useState } from 'preact/hooks';
import { splitKey } from '../../content';
import type { SurvivalCardData } from '../../state/schema';
import { cindex, course, pdata, profile, updateData } from '../../state/store';
import { Say, Sheet } from '../kit';

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
  const lines: Line[] = [{ id: 'help', ...c.card.help, lang: c.lang, hero: true }];
  if (card.hotel)
    lines.push({
      id: 'hotel',
      t: c.say.toHotel(card.hotel),
      fr: `À l’hôtel ${card.hotel}, s’il vous plaît.`,
      lang: c.lang,
    });
  if (card.address) lines.push({ id: 'address', t: card.address, fr: 'Mon adresse ici', lang: c.lang });
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
  const set = (patch: Partial<SurvivalCardData>) =>
    updateData(d => {
      d.card = { ...d.card, ...patch };
    });
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  return (
    <Sheet title="Ma carte" onClose={onClose}>
      <div class="form">
        <label class="field">
          <span>Mon hôtel</span>
          <input
            class="input"
            value={card.hotel}
            onInput={e => set({ hotel: e.currentTarget.value })}
            placeholder="Hostal Sol"
            autocomplete="off"
          />
        </label>
        <label class="field">
          <span>Mon adresse sur place</span>
          <textarea
            class="input"
            rows={2}
            value={card.address}
            onInput={e => set({ address: e.currentTarget.value })}
            placeholder="Calle Mayor 12, Madrid"
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
  const [shown, setShown] = useState<Line | null>(null);
  return (
    <>
      <header class="page-head">
        <div class="section-head">
          <h1>Ma carte</h1>
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
      {editing && <EditSheet onClose={() => setEditing(false)} />}
      {shown && <Show line={shown} onClose={() => setShown(null)} />}
    </>
  );
}
