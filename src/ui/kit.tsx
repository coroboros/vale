/** Small shared building blocks. */
import { signal } from '@preact/signals';
import { Snail, Volume2, X } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { say } from '../platform/speech';
import { settings } from '../state/store';

export function Bar({ value, label, tone }: { value: number; label: string; tone?: 'ok' }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      class={`bar${tone ? ` ${tone}` : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({
  value,
  size = 64,
  color = 'var(--accent)',
  children,
  label,
}: {
  value: number;
  size?: number;
  color?: string;
  children?: ComponentChildren;
  label: string;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, value));
  return (
    <div style={{ position: 'relative', width: size, height: size }} role="img" aria-label={label}>
      <svg class="ring" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} stroke="var(--sunk)" />
        <circle cx="32" cy="32" r={r} stroke={color} stroke-dasharray={`${c * v} ${c}`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      class="toggle"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    />
  );
}

/** Modal sheet on a native <dialog>: focus is trapped, Escape and the backdrop close it. */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ComponentChildren;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the backdrop click mirrors Escape, which <dialog> handles natively
    <dialog
      ref={ref}
      class="sheet-dialog"
      aria-label={title}
      onClose={onClose}
      onClick={e => e.target === ref.current && ref.current?.close()}
    >
      <div class="sheet">
        <div class="sheet-grip" aria-hidden="true" />
        <div class="sheet-head">
          <h2>{title}</h2>
          <button type="button" class="icon-btn" aria-label="Fermer" onClick={() => ref.current?.close()}>
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

interface Toast {
  text: string;
  action?: { label: string; run: () => void };
}

export const toast = signal<Toast | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function showToast(text: string, action?: Toast['action'], ms = 4500): void {
  toast.value = { text, action };
  clearTimeout(toastTimer);
  if (!action) toastTimer = setTimeout(() => (toast.value = null), ms);
}

export function ToastHost() {
  const t = toast.value;
  if (!t) return null;
  return (
    <div class="toast" role="status">
      <span>{t.text}</span>
      {t.action && (
        <button
          type="button"
          class="btn btn-primary"
          onClick={() => {
            toast.value = null;
            t.action?.run();
          }}
        >
          {t.action.label}
        </button>
      )}
    </div>
  );
}

/** Speaks a phrase with the device voice; the snail variant speaks slowly. */
export function Say({
  text,
  lang,
  slow,
  small,
  soft,
  variant,
}: {
  text: string;
  lang: string;
  slow?: boolean;
  small?: boolean;
  soft?: boolean;
  variant?: number;
}) {
  const Icon = slow ? Snail : Volume2;
  return (
    <button
      type="button"
      class={`play${small ? ' small' : ''}${soft ? ' soft' : ''}`}
      aria-label={slow ? 'Écouter lentement' : 'Écouter'}
      onClick={() => void say(text, { lang, slow: slow || settings.value.slow, variant })}
    >
      <Icon size={small ? 20 : 26} />
    </button>
  );
}

/** French-readable pronunciation, hidden when the learner turned hints off. */
export function Phonetic({ ph }: { ph: string }) {
  if (!ph || !settings.value.phonetics) return null;
  return <p class="ph">{ph}</p>;
}

export interface ChoiceOption<T> {
  value: T;
  title: ComponentChildren;
  sub?: ComponentChildren;
  lang?: string;
}

/** Single-choice list on native radio buttons: arrow keys, labels and states come for free. */
export function ChoiceGroup<T extends string | number>({
  name,
  label,
  options,
  value,
  onChange,
  numbered,
}: {
  name: string;
  label: string;
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  numbered?: boolean;
}) {
  return (
    <fieldset class="choices">
      <legend class="sr-only">{label}</legend>
      {options.map((o, i) => (
        <label key={String(o.value)} class="choice" lang={o.lang}>
          <input
            type="radio"
            class="sr-only"
            name={name}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {numbered && <kbd>{i + 1}</kbd>}
          <span>
            <strong>{o.title}</strong>
            {o.sub && <small>{o.sub}</small>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
