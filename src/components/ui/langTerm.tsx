import type { ReactNode } from 'react';

/**
 * Marks the first occurrence of `term` inside `text` with its own language. Labels are upper-cased in CSS and
 * text-transform follows `lang`: an English tech name on a Turkish page would otherwise read "OBJECT DETECTİON",
 * and a Turkish name on an English page "EKIN EKINCI" instead of "EKİN EKİNCİ".
 */
export function langTerm(text: string, term: string, lang: string): ReactNode {
  const at = text.indexOf(term);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span lang={lang}>{term}</span>
      {text.slice(at + term.length)}
    </>
  );
}
