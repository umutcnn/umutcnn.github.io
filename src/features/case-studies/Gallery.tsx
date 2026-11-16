import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { LazyMount } from '../../components/motion/LazyMount';
import { ArchitectureGraph } from '../../components/visualizations/ArchitectureGraph';
import { ProjectVisual } from '../../components/visualizations/ProjectVisual';
import { EASE } from '../../lib/motion-tokens';
import { lockScroll } from '../../lib/scroll';
import type { MediaItem } from '../../types/content';

/** Elements that use ←/→ themselves. */
const ARROW_KEY_CONTROLS =
  'input, select, textarea, [contenteditable="true"], [role="slider"], [role="radio"], [role="tab"], [role="application"], [data-arrow-keys]';

function MediaView({ item, large }: { item: MediaItem; large?: boolean }) {
  const { l } = useLocale();
  if (item.kind === 'visual') return <ProjectVisual kind={item.visual} compact={!large} />;
  if (item.kind === 'architecture') return <ArchitectureGraph id={item.architecture} compact={!large} />;
  return (
    <img src={item.src} width={item.width} height={item.height} alt={l(item.alt)} loading="lazy" decoding="async" />
  );
}

/** Keyboard-operable gallery: thumbnails open a modal viewer (←/→, Esc, focus trap, focus restore). */
export function Gallery({ items }: { items: MediaItem[] }) {
  const { t, l } = useLocale();
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const returnRef = useRef<HTMLButtonElement | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: number) => setIndex(i => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useFocusTrap(dialogRef, open, close, { initialFocus: closeRef, returnFocus: returnRef });

  useEffect(() => {
    if (!open) return;
    const release = lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      // The media inside is interactive (simulator radios/sliders, the zoomable diagram): arrows used by a control
      // belong to that control, not to the gallery.
      if (e.defaultPrevented || (e.target instanceof Element && e.target.closest(ARROW_KEY_CONTROLS))) return;
      step(e.key === 'ArrowRight' ? 1 : -1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      release();
      document.removeEventListener('keydown', onKey);
    };
  }, [open, step]);

  const current = index !== null ? items[index] : undefined;

  return (
    <>
      <ul className="gallery" data-testid="gallery">
        {items.map((item, i) => (
          <li key={i} className="gallery__item">
            <figure>
              <div className="gallery__media" aria-hidden="true">
                <LazyMount ratio={item.kind === 'architecture' ? 100 / 60 : 640 / 380}>
                  <MediaView item={item} />
                </LazyMount>
              </div>
              <figcaption>
                <span>{l(item.caption)}</span>
                <button
                  ref={el => {
                    triggers.current[i] = el;
                  }}
                  type="button"
                  className="icon-btn"
                  aria-label={`${t.caseStudy.openGallery(i + 1)} — ${l(item.caption)}`}
                  onClick={() => {
                    returnRef.current = triggers.current[i] ?? null;
                    setIndex(i);
                  }}
                  data-testid={`gallery-open-${i}`}
                >
                  <Maximize2 aria-hidden="true" />
                </button>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open && current && (
          <m.div
            ref={dialogRef}
            className="lightbox tone-night"
            role="dialog"
            aria-modal="true"
            aria-label={t.caseStudy.galleryDialog}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE.out }}
            data-testid="lightbox"
          >
            <div className="lightbox__bar container-x">
              <p className="label" aria-live="polite" data-testid="lightbox-counter">
                {t.caseStudy.counter(index! + 1, items.length)}
              </p>
              <button ref={closeRef} type="button" className="icon-btn" onClick={close} aria-label={t.caseStudy.close}>
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="lightbox__stage container-x">
              {items.length > 1 && (
                <button
                  type="button"
                  className="icon-btn lightbox__nav"
                  onClick={() => step(-1)}
                  aria-label={t.caseStudy.prev}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
              )}
              <m.figure
                key={index}
                className="lightbox__figure"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE.out }}
              >
                <MediaView item={current} large />
                <figcaption className="label">{l(current.caption)}</figcaption>
              </m.figure>
              {items.length > 1 && (
                <button
                  type="button"
                  className="icon-btn lightbox__nav"
                  onClick={() => step(1)}
                  aria-label={t.caseStudy.nextItem}
                  data-testid="lightbox-next"
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
