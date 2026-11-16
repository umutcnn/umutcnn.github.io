import { describe, expect, it } from 'vitest';
import { ARCHITECTURES } from '../../src/content/architectures';
import { AWARDS } from '../../src/content/awards';
import { FACTS, PROFILE } from '../../src/content/profile';
import { ARCHIVE_PROJECTS, CASE_STUDIES, FEATURED_PROJECTS, PROJECTS } from '../../src/content/projects';
import { SKILL_CLUSTERS, TECHS } from '../../src/content/skills';
import { CERTIFICATES, TIMELINE } from '../../src/content/timeline';
import { LOCALES, type Localized } from '../../src/types/content';

function expectLocalized(value: Localized<unknown> | undefined, where: string) {
  if (!value) return;
  for (const l of LOCALES) {
    const v = value[l];
    expect(v, `${where} [${l}]`).toBeTruthy();
    if (Array.isArray(v)) {
      expect(v.length, `${where} [${l}] length`).toBe((value.tr as unknown[]).length);
      v.forEach((item, i) => expect(String(item).trim(), `${where}[${i}] [${l}]`).not.toBe(''));
    }
  }
}

describe('project content', () => {
  it('has unique ids and slugs with URL-safe slugs', () => {
    expect(new Set(PROJECTS.map(p => p.id)).size).toBe(PROJECTS.length);
    expect(new Set(PROJECTS.map(p => p.slug)).size).toBe(PROJECTS.length);
    PROJECTS.forEach(p => expect(p.slug).toMatch(/^[a-z0-9-]+$/));
  });

  it('features exactly six projects, each with a case study and a visual', () => {
    expect(FEATURED_PROJECTS).toHaveLength(6);
    FEATURED_PROJECTS.forEach(p => {
      expect(p.hasCaseStudy).toBe(true);
      expect(p.visual).not.toBe('none');
    });
    expect(ARCHIVE_PROJECTS.length + FEATURED_PROJECTS.length).toBe(PROJECTS.length);
    expect(CASE_STUDIES.length).toBeGreaterThanOrEqual(6);
  });

  it('references only existing related projects and technologies', () => {
    const slugs = new Set(PROJECTS.map(p => p.slug));
    for (const p of PROJECTS) {
      p.relatedProjects.forEach(r => expect(slugs.has(r), `${p.slug} → ${r}`).toBe(true));
      expect(p.relatedProjects).not.toContain(p.slug);
      p.technologies.forEach(t => expect(TECHS[t], `${p.slug} uses ${t}`).toBeDefined());
    }
  });

  it('is complete in every language', () => {
    for (const p of PROJECTS) {
      (['title', 'subtitle', 'role', 'overview'] as const).forEach(k => expectLocalized(p[k], `${p.slug}.${k}`));
      (
        [
          'problem',
          'approach',
          'techRationale',
          'architecture',
          'implementation',
          'challenges',
          'results',
          'learnings',
          'limitations',
        ] as const
      ).forEach(k => expectLocalized(p[k], `${p.slug}.${k}`));
      p.metrics.forEach((m, i) => {
        expectLocalized(m.label, `${p.slug}.metrics[${i}].label`);
        expectLocalized(m.context, `${p.slug}.metrics[${i}].context`);
      });
      p.gallery.forEach((g, i) => expectLocalized(g.caption, `${p.slug}.gallery[${i}]`));
    }
  });

  it('never shows a metric without its context and limits', () => {
    for (const p of PROJECTS) for (const m of p.metrics) expect(m.context.tr.length).toBeGreaterThan(5);
    const fl = PROJECTS.find(p => p.id === 'federated-cataract')!;
    expect(fl.limitations?.tr.join(' ')).toMatch(/klinik/);
    expect(fl.limitations?.en.join(' ')).toMatch(/clinical/);
  });

  it('only enables https repository links', () => {
    for (const p of PROJECTS) {
      if (p.repositoryUrl?.enabled) expect(p.repositoryUrl.href).toMatch(/^https:\/\/github\.com\//);
    }
  });

  it('keeps confidential projects free of public links', () => {
    for (const p of PROJECTS.filter(x => x.visibility === 'confidential')) {
      expect(p.repositoryUrl?.enabled ?? false).toBe(false);
      expect(p.demoUrl?.enabled ?? false).toBe(false);
      expect(p.gallery.every(g => g.kind !== 'image')).toBe(true);
    }
  });
});

describe('skills', () => {
  it('lists every technology in exactly one cluster', () => {
    const listed = SKILL_CLUSTERS.flatMap(c => c.techs);
    expect(new Set(listed).size).toBe(listed.length);
    expect(new Set(listed)).toEqual(new Set(Object.keys(TECHS)));
  });
});

describe('profile, awards, timeline', () => {
  it('uses verified contact links only', () => {
    expect(PROFILE.email.href).toBe(`mailto:${PROFILE.email.value}`);
    expect(PROFILE.github.href).toBe('https://github.com/umutcnn');
    expect(PROFILE.linkedin.href).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
  });

  it('has localized awards with the TEKNOFEST 2023 result highlighted', () => {
    AWARDS.forEach(a => {
      expectLocalized(a.title, a.id);
      expectLocalized(a.rank, a.id);
      expectLocalized(a.details, a.id);
    });
    expect(AWARDS.find(a => a.highlight)?.id).toBe('teknofest-2023');
  });

  it('has valid, ordered timeline dates', () => {
    for (const e of TIMELINE) {
      expect(e.start).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      if (e.end) {
        expect(e.end).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
        expect(e.end >= e.start, e.id).toBe(true);
      }
      expectLocalized(e.points, e.id);
    }
    CERTIFICATES.forEach((c, i) => expectLocalized(c.title, `cert ${i}`));
  });

  it('backs every counter with a positive real number', () => {
    FACTS.forEach(f => expect(f.value).toBeGreaterThan(0));
    expect(FACTS.find(f => /TÜBİTAK/.test(f.label.tr))?.value).toBe(1);
  });
});

describe('architecture diagrams', () => {
  it('only connects existing nodes and keeps nodes inside the 100×60 grid', () => {
    for (const a of Object.values(ARCHITECTURES)) {
      const ids = new Set(a.nodes.map(n => n.id));
      expect(ids.size).toBe(a.nodes.length);
      a.edges.forEach(e => {
        expect(ids.has(e.from), `${a.id} ${e.from}`).toBe(true);
        expect(ids.has(e.to), `${a.id} ${e.to}`).toBe(true);
      });
      a.nodes.forEach(n => {
        expect(n.x).toBeGreaterThanOrEqual(0);
        expect(n.x).toBeLessThanOrEqual(100);
        expect(n.y).toBeGreaterThanOrEqual(0);
        expect(n.y).toBeLessThanOrEqual(60);
      });
    }
  });
});
