import type { ExternalLink, Localized } from '../types/content';

/**
 * Personal data. Every value here was taken from the owner's own CVs (2026-11) and approved for publication.
 * Set `enabled: false` to hide a link everywhere — disabled links are never rendered.
 */
export const PROFILE = {
  name: 'Umut Can Yıldız',
  nameLines: ['UMUT CAN', 'YILDIZ'] as const,
  monogram: 'UCY',
  headline: 'AI Engineer | Computer Vision & Machine Learning | Software Engineer',
  role: { tr: 'Yapay Zekâ Mühendisi', en: 'AI Engineer' } satisfies Localized,
  location: { tr: 'Bursa, Türkiye', en: 'Bursa, Türkiye' } satisfies Localized,
  /** Shown in the hero instrument bar. Kept static so server and client render identically. */
  year: '2026',
  siteUrl: 'https://umutcnn.github.io',
  email: {
    href: 'mailto:yildizumutcan21@gmail.com',
    value: 'yildizumutcan21@gmail.com',
    enabled: true,
    needsVerification: false,
  } satisfies ExternalLink & { value: string },
  // Removed at the owner's request (2026-11-16): the number is not shipped anywhere on the site.
  phone: {
    href: '',
    value: '',
    enabled: false,
    needsVerification: false,
  } satisfies ExternalLink & { value: string },
  github: {
    href: 'https://github.com/umutcnn',
    value: 'github.com/umutcnn',
    enabled: true,
    needsVerification: false,
  } satisfies ExternalLink & { value: string },
  linkedin: {
    href: 'https://www.linkedin.com/in/umut-can-yildiz-2ab509231/',
    value: 'in/umut-can-yildiz',
    enabled: true,
    needsVerification: false,
  } satisfies ExternalLink & { value: string },
  cv: {
    href: 'cv/Umut-Can-Yildiz-CV.pdf',
    value: 'PDF · TR',
    enabled: true,
    needsVerification: false,
  } satisfies ExternalLink & { value: string },
  photo: {
    enabled: true,
    base: 'profile/umut-can-yildiz',
    sizes: [320, 640] as const,
  },
  education: {
    university: 'Sakarya Uygulamalı Bilimler Üniversitesi',
    universityEn: 'Sakarya University of Applied Sciences',
    department: { tr: 'Bilgisayar Mühendisliği', en: 'Computer Engineering' } satisfies Localized,
    bachelor: { tr: 'Lisans · 2021 — Haz 2025', en: 'BSc · 2021 — Jun 2025' } satisfies Localized,
    master: { tr: 'Yüksek Lisans · Eyl 2025 — devam ediyor', en: 'MSc · Sep 2025 — ongoing' } satisfies Localized,
  },
  focus: [
    { tr: 'Yapay Zekâ Mühendisliği', en: 'AI Engineering' },
    { tr: 'Bilgisayarlı Görü', en: 'Computer Vision' },
    { tr: 'Federe Öğrenme', en: 'Federated Learning' },
    { tr: 'NLP & LLM Uygulamaları', en: 'NLP & LLM Applications' },
    { tr: 'Ajan Tabanlı Yapay Zekâ', en: 'Agentic AI Systems' },
    { tr: 'Kurumsal Yazılım', en: 'Enterprise Software' },
    { tr: 'CAD Otomasyonu', en: 'CAD Automation' },
  ] satisfies Localized[],
} as const;

/** Real, countable facts used by the animated counters. Each one maps to verifiable content on the page. */
export const FACTS: { value: number; suffix?: string; label: Localized }[] = [
  { value: 2, suffix: '.', label: { tr: 'TEKNOFEST 2023 · Türkiye derecesi', en: 'TEKNOFEST 2023 · national rank' } },
  { value: 3, label: { tr: 'TEKNOFEST 2024 finalist kategorisi', en: 'TEKNOFEST 2024 finalist categories' } },
  { value: 1, label: { tr: 'TÜBİTAK 2209-A araştırma projesi', en: 'TÜBİTAK 2209-A research project' } },
  { value: 5, label: { tr: 'Mühendislik rolü ve staj', en: 'Engineering roles & internships' } },
];
