/**
 * The first lines index.html runs, inline before anything is painted: the installed app, a traveller
 * who has already set off and a link into the app skip the welcome page, so none of them sees it
 * flash (docs/UX.md, « The welcome page »). Inline so that it blocks painting without a request;
 * build/csp.ts allows it by its hash.
 */
import { createHash } from 'node:crypto';
import { STORAGE_KEY } from '../src/state/schema.ts';

export const BOOT_SCRIPT = [
  '(function(){try{',
  "var installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;",
  `var saved=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||'{}');`,
  "if(installed||saved.onboarded===true||location.hash.indexOf('#/')===0)document.documentElement.dataset.view='app';",
  '}catch(e){}})();',
].join('');

export const BOOT_HASH = `'sha256-${createHash('sha256').update(BOOT_SCRIPT).digest('base64')}'`;
