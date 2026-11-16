import { ArrowUpRight, Copy, FileText, Mail, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { Magnetic } from '../../components/motion/Magnetic';
import { Reveal, SplitWords } from '../../components/motion/Reveal';
import { GithubIcon, LinkedinIcon } from '../../components/ui/BrandIcons';
import { PROFILE } from '../../content/profile';
import './Contact.css';

/** Copies text; resolves false instead of throwing (permissions, insecure context, old browsers). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  // Older browsers and non-secure contexts (no Clipboard API): copy through a temporary off-screen textarea.
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    const active = document.activeElement as HTMLElement | null;
    document.body.appendChild(area);
    area.select();
    const ok = typeof document.execCommand === 'function' && document.execCommand('copy');
    area.remove();
    active?.focus({ preventScroll: true });
    return ok;
  } catch {
    return false;
  }
}

function Row({
  icon,
  label,
  value,
  href,
  external,
  download,
  lang,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  download?: boolean;
  lang?: string;
}) {
  const { t } = useLocale();
  return (
    <li className="contact-row">
      <a
        href={href}
        className="contact-row__link"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(download ? { download: '' } : {})}
      >
        <span className="contact-row__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="label contact-row__label" lang={lang}>
          {label}
        </span>
        <span className="contact-row__value">{value}</span>
        <ArrowUpRight className="contact-row__arrow" size={18} aria-hidden="true" />
        {external && <span className="sr-only">{t.a11y.newTab}</span>}
      </a>
    </li>
  );
}

export function Contact() {
  const { t } = useLocale();
  const toast = useToast();
  const c = t.contact;
  const base = import.meta.env.BASE_URL;

  const onCopy = async () => {
    const ok = await copyText(PROFILE.email.value);
    if (ok) toast.show(c.copied);
    else toast.show(c.copyFailed(PROFILE.email.value), 'error');
  };

  return (
    <section
      id="contact"
      className="section contact tone-paper"
      data-nav-tone="paper"
      aria-labelledby="contact-title"
      tabIndex={-1}
    >
      <div className="container-x">
        <Reveal as="p" className="label section-index">
          <span>[09] / 09</span>
          <span aria-hidden="true">—</span>
          <span>{c.label}</span>
        </Reveal>
        <SplitWords as="h2" id="contact-title" className="contact__title" text={c.title} />
        <Reveal as="p" className="lead contact__intro">
          {c.intro}
        </Reveal>

        {PROFILE.email.enabled && (
          <Reveal className="contact__primary">
            <a className="contact__email" href={PROFILE.email.href} data-testid="contact-email">
              {PROFILE.email.value}
            </a>
            <div className="contact__actions">
              <Magnetic>
                <a className="btn btn--signal" href={PROFILE.email.href}>
                  <Mail size={16} aria-hidden="true" /> {c.write}
                </a>
              </Magnetic>
              <button type="button" className="btn btn--ghost" onClick={onCopy} data-testid="copy-email">
                <Copy size={16} aria-hidden="true" /> {c.copy}
              </button>
            </div>
          </Reveal>
        )}

        <Reveal as="ul" className="contact__rows" index={1}>
          {PROFILE.phone.enabled && (
            <Row icon={<Phone size={16} />} label={c.phone} value={PROFILE.phone.value} href={PROFILE.phone.href} />
          )}
          {PROFILE.github.enabled && (
            <Row
              icon={<GithubIcon />}
              label={c.github}
              value={PROFILE.github.value}
              href={PROFILE.github.href}
              external
              lang="en"
            />
          )}
          {PROFILE.linkedin.enabled && (
            <Row
              icon={<LinkedinIcon />}
              label={c.linkedin}
              value={PROFILE.linkedin.value}
              href={PROFILE.linkedin.href}
              external
              lang="en"
            />
          )}
          {PROFILE.cv.enabled && (
            <Row
              icon={<FileText size={16} />}
              label={c.cv}
              value={`${c.download} · ${PROFILE.cv.value}`}
              href={`${base}${PROFILE.cv.href}`}
              download
            />
          )}
        </Reveal>
      </div>

      <div className="contact__monogram" aria-hidden="true">
        <span>{PROFILE.monogram}</span>
        <i>.</i>
      </div>
    </section>
  );
}
