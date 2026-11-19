import { BookmarkCheck, BookmarkPlus, ExternalLink, Search, Sparkles, Star, Trash, WifiOff } from 'lucide-preact';
import { useState } from 'preact/hooks';
import { forgetTranslation, rememberTranslation, setTranslationSaved, toggleFavorite } from '../../actions';
import { courseById, type Entry, indexOf, itemKey, regionOf, splitKey } from '../../content';
import type { Course, Item } from '../../content/types';
import { online } from '../../platform/env';
import type { Translation } from '../../state/schema';
import { course, languages, pdata, profile } from '../../state/store';
import { deeplLink, hasTranslator, searchCourse, searchHistory, translateOnline } from '../../translate';
import { MAX_TRANSLATE_CHARS, sentenceKey } from '../../translation-api';
import { Phonetic, Say, showToast } from '../kit';
import { FlagDot } from '../Mascot';
import { go } from '../router';

function ItemRow({ courseId, item, lang }: { courseId: string; item: Item; lang: string }) {
  const key = itemKey(courseId, item.id);
  const fav = pdata.value.favorites.includes(key);
  return (
    <li class="phrase">
      <Say text={item.t} lang={lang} small soft />
      <div class="phrase-main">
        <p class="phrase-t" lang={lang}>
          {item.t}
        </p>
        <Phonetic ph={item.ph} />
        <p class="muted">{item.fr}</p>
      </div>
      <button
        type="button"
        class="icon-btn"
        aria-pressed={fav}
        aria-label={fav ? 'Retirer de ma carte' : 'Ajouter à ma carte'}
        onClick={() => toggleFavorite(key)}
      >
        <Star size={22} fill={fav ? 'currentColor' : 'none'} class={fav ? 'fav-on' : undefined} />
      </button>
    </li>
  );
}

function TranslationRow({ t }: { t: Translation }) {
  const lang = courseById(t.course).lang;
  return (
    <li class="phrase">
      <Say text={t.t} lang={lang} small soft />
      <div class="phrase-main">
        <p class="muted">{t.fr}</p>
        <p class="phrase-t" lang={lang}>
          {t.t}
        </p>
        <Phonetic ph={t.ph} />
        {t.note && <p class="phrase-note">{t.note}</p>}
        {t.alternatives.length > 0 && (
          <p class="muted small" lang={lang}>
            Aussi : {t.alternatives.join(' ; ')}
          </p>
        )}
      </div>
      <div class="phrase-tools">
        <button
          type="button"
          class="icon-btn"
          aria-pressed={t.saved}
          aria-label={t.saved ? 'Ne plus réviser' : 'Garder pour réviser'}
          onClick={() => setTranslationSaved(t.id, !t.saved)}
        >
          {t.saved ? <BookmarkCheck size={22} class="fav-on" /> : <BookmarkPlus size={22} />}
        </button>
        <button
          type="button"
          class="icon-btn"
          aria-label="Supprimer de l’historique"
          onClick={() => forgetTranslation(t.id)}
        >
          <Trash size={20} />
        </button>
      </div>
    </li>
  );
}

function Translator({ query, course: c }: { query: string; course: Course }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      rememberTranslation({ course: c.id, fr: query, ...(await translateOnline(query, c)) });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  if (hasTranslator) {
    if (!online.value)
      return (
        <p class="card note-card">
          <WifiOff size={18} aria-hidden="true" /> Hors ligne : la traduction de nouvelles phrases revient avec le
          réseau. Ton historique, lui, reste disponible.
        </p>
      );
    return (
      <div class="translator">
        <button type="button" class="btn btn-primary btn-block" disabled={busy} onClick={() => void run()}>
          <Sparkles size={20} aria-hidden="true" />
          {busy ? 'Traduction…' : `Traduire en ${c.name.toLowerCase()}`}
        </button>
        {error && <p class="error">{error}</p>}
      </div>
    );
  }

  return (
    <div class="translator">
      <a class="btn btn-block" href={deeplLink(query, c)} target="_blank" rel="noopener">
        <ExternalLink size={20} aria-hidden="true" />
        Traduire dans DeepL
      </a>
      <form
        class="manual"
        onSubmit={e => {
          e.preventDefault();
          if (!manual.trim()) return;
          const kept = rememberTranslation({
            course: c.id,
            fr: query,
            t: manual.trim(),
            ph: '',
            note: '',
            alternatives: [],
          });
          setTranslationSaved(kept.id, true);
          setManual('');
          showToast('Phrase gardée : elle reviendra dans tes révisions.');
        }}
      >
        <label class="field">
          <span>Ta traduction, pour la réviser ensuite</span>
          <input
            class="input"
            lang={c.lang}
            value={manual}
            onInput={e => setManual(e.currentTarget.value)}
            placeholder={c.hello}
            autocomplete="off"
          />
        </label>
        <button type="submit" class="btn" disabled={!manual.trim()}>
          Garder
        </button>
      </form>
    </div>
  );
}

/** Opens on the language of the trip in focus; the others stay one tap away, lexicons and translation. */
export function Phrases() {
  const [picked, setPicked] = useState('');
  const others = languages.value;
  const c = others.find(x => x.id === picked) ?? course.value;
  const index = indexOf(c);
  const data = pdata.value;
  // Where the traveller goes in this language comes first: Venice's streets, New York's tips.
  const destinationTips = [
    ...new Set(profile.value!.trips.flatMap(t => (t.course === c.id ? (regionOf(c, t.region).tip ?? []) : []))),
  ];
  const [query, setQuery] = useState('');
  const q = query.trim();
  const history = data.translations.filter(t => t.course === c.id);
  const inCourse = q.length >= 2 ? searchCourse(q, index) : [];
  const exact = q.length >= 2 ? history.find(t => sentenceKey(t.fr) === sentenceKey(q)) : undefined;
  const inHistory =
    q.length >= 2 ? searchHistory(q, history).sort((a, b) => Number(b === exact) - Number(a === exact)) : [];
  const favorites = data.favorites
    .filter(k => splitKey(k)[0] === c.id)
    .map(k => index.entries.get(splitKey(k)[1]))
    .filter((e): e is Entry => !!e);

  return (
    <>
      <header class="page-head">
        <h1>Phrases</h1>
        <p class="muted">Cherche dans tes leçons ou traduis ce que tu veux dire.</p>
      </header>

      {others.length > 1 && (
        <fieldset class="field">
          <legend class="sr-only">Langue</legend>
          <div class="chips">
            {others.map(x => (
              <button
                key={x.id}
                type="button"
                class="chip"
                aria-pressed={x.id === c.id}
                onClick={() => setPicked(x.id)}
              >
                <FlagDot flag={x.flag} size={20} />
                {x.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <search class="search">
        <Search size={22} aria-hidden="true" />
        <label class="sr-only" for="phrase-search">
          Phrase en français
        </label>
        <input
          id="phrase-search"
          class="input"
          type="search"
          value={query}
          onInput={e => setQuery(e.currentTarget.value)}
          placeholder="Je voudrais un late checkout…"
          maxLength={MAX_TRANSLATE_CHARS}
          autocomplete="off"
          enterkeyhint="search"
        />
      </search>

      {q.length >= 2 ? (
        <>
          {inCourse.length > 0 && (
            <section class="section" aria-label="Dans tes leçons">
              <h2>Dans tes leçons</h2>
              <ul class="phrases">
                {inCourse.map(item => (
                  <ItemRow
                    key={item.id}
                    courseId={c.id}
                    item={item}
                    lang={index.entries.get(item.id)?.lang ?? c.lang}
                  />
                ))}
              </ul>
            </section>
          )}
          {inHistory.length > 0 && (
            <section class="section" aria-label="Déjà traduit">
              <h2>Déjà traduit</h2>
              <ul class="phrases">
                {inHistory.map(t => (
                  <TranslationRow key={t.id} t={t} />
                ))}
              </ul>
            </section>
          )}
          {!exact && (
            <section class="section" aria-label="Traduire">
              <h2>Traduire « {q} »</h2>
              <Translator key={`${c.id}:${q}`} query={q} course={c} />
            </section>
          )}
        </>
      ) : (
        <>
          {favorites.length > 0 && (
            <section class="section" aria-label="Mes favoris">
              <h2>Mes favoris</h2>
              <ul class="phrases">
                {favorites.map(e => (
                  <ItemRow key={e.item.id} courseId={c.id} item={e.item} lang={e.lang} />
                ))}
              </ul>
            </section>
          )}
          {history.length > 0 && (
            <section class="section" aria-label="Historique">
              <h2>Historique</h2>
              <ul class="phrases">
                {history.slice(0, 20).map(t => (
                  <TranslationRow key={t.id} t={t} />
                ))}
              </ul>
            </section>
          )}
          <section class="section" aria-label="Lexique">
            <div class="section-head">
              <h2>Lexique</h2>
              <button type="button" class="btn btn-ghost" onClick={() => go({ name: 'sounds' })}>
                Les sons
              </button>
            </div>
            {[...c.lessons, ...c.packs].map(l => (
              <details key={l.id} class="card fold">
                <summary>
                  <span class="row-title">{l.title}</span>
                  <span class="row-sub" lang={'lang' in l ? l.lang : c.lang}>
                    {l.native}, {l.items.length} phrases
                  </span>
                </summary>
                <ul class="phrases">
                  {l.items.map(item => (
                    <ItemRow key={item.id} courseId={c.id} item={item} lang={'lang' in l ? l.lang : c.lang} />
                  ))}
                </ul>
              </details>
            ))}
            {c.extras.map(x => (
              <details key={x.id} class="card fold">
                <summary>
                  <span class="row-title">{x.title}</span>
                  <span class="row-sub">{x.desc}</span>
                </summary>
                <ul class="phrases">
                  {x.items.map(item => (
                    <li key={item.t} class="phrase">
                      <Say text={item.t} lang={c.lang} small soft />
                      <div class="phrase-main">
                        <p class="phrase-t" lang={c.lang}>
                          {item.t}
                        </p>
                        <Phonetic ph={item.ph} />
                        <p class="muted">{item.fr}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </section>
          <section class="section" aria-label="Bon à savoir">
            <h2>Bon à savoir</h2>
            <div class="tips">
              {[...destinationTips, ...c.tips].map(t => (
                <article key={t.title} class="card tip">
                  <h3>{t.title}</h3>
                  <p class="muted">{t.desc}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
