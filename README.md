# Umut Can Yıldız

### Engineering Intelligence — AI Engineering & Software Development

**AI Engineer · Computer Vision · Machine Learning · Intelligent Systems**

[![Live site](https://img.shields.io/badge/live-umutcnn.github.io-0a0a0a?style=for-the-badge)](https://umutcnn.github.io/)
[![Deploy to GitHub Pages](https://github.com/umutcnn/umutcnn.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/umutcnn/umutcnn.github.io/actions/workflows/deploy.yml)

🌐 **Live:** [https://umutcnn.github.io/](https://umutcnn.github.io/) · 🇬🇧 [English](https://umutcnn.github.io/en/)

A modern, bilingual (TR/EN), performance-oriented personal portfolio showcasing the engineering work, research, and technical projects of **Umut Can Yıldız**, a Computer Engineering graduate focused on building intelligent systems that solve real-world problems.

The portfolio brings together artificial intelligence research, computer vision, autonomous systems, industrial automation, and enterprise software development through interactive storytelling, immersive case studies, and carefully engineered motion design.

**Engineering Intelligence. From Research to Real-World Systems.**

---

## Overview

This project is more than a traditional résumé or static developer portfolio.

It is a digital engineering showcase designed to communicate both technical depth and practical implementation experience — from researching machine learning algorithms to developing production-oriented software systems.

The website combines a modern frontend architecture with interactive technical visualizations, multilingual content, sophisticated animations, and static pre-rendering.

### Core Principles

- **Engineering First** — Technical substance, documented projects, and measurable outcomes.
- **Research Driven** — Exploring machine learning techniques through experimentation and evaluation.
- **Human-Centered Design** — Making complex technologies understandable through visual storytelling.
- **Performance by Design** — Balancing advanced animations with responsiveness and accessibility.
- **Maintainable Architecture** — Reusable components, structured content, and a scalable codebase.

## Featured Engineering Work

The portfolio highlights selected projects spanning artificial intelligence, scientific research, autonomous systems, and enterprise engineering.

| Project | Focus | Technologies |
|---|---|---|
| Federated Learning for Cataract Detection | Privacy-conscious medical image classification research | Python, PyTorch, Flower, FedProx, FedAvg |
| TEKNOFEST 2023 Transportation AI | Award-winning computer vision project — 2nd place in Türkiye | Deep Learning, Computer Vision |
| Autonomous Robotaxi | Environmental perception, localization, and autonomous navigation | ROS, YOLO, LiDAR, IMU, ZED2 |
| MAKS CAD Intelligence | CAD processing, geometry analysis, and engineering automation | C++17, Qt, OpenCascade |
| MAKS Enterprise ERP | Enterprise workflows, quotation management, and access control | React, NestJS, Prisma, SQL Server |
| Industrial Computer Vision | Object detection and industrial vision applications | YOLO, OpenCV, Kotlin, TensorFlow Lite |

Detailed project narratives and case-study content are maintained in `src/content/projects.ts`.

## Key Features

### Interactive Portfolio Experience

- Motion-driven landing page and animated typography.
- Interactive transitions and scroll-based storytelling.
- Project showcases and detailed engineering case studies.
- Technical architecture visualizations.
- Responsive layouts across desktop, tablet, and mobile.
- Modern visual design built around a centralized design system.

### Research & Engineering Content

- Artificial intelligence and computer vision projects.
- Federated learning research.
- Technical architecture diagrams and system explanations.
- Academic achievements and competition milestones.
- Organized technical skills and engineering experience.

### Multilingual Experience

The portfolio supports two languages:

- **Turkish (TR)**
- **English (EN)**

Localized content is maintained through typed translation modules, providing a consistent content structure across languages.

### Performance & Accessibility

The architecture incorporates:

- Static pre-rendering.
- Production asset optimization.
- Type-safe React components.
- Responsive design.
- Automated accessibility testing.
- End-to-end browser testing.
- Performance auditing.
- Motion and interaction quality controls.

These capabilities are supported by the project's development and testing toolchain. Performance and accessibility scores must be established through actual measurement rather than assumed from the technology stack.

---

## Technology Stack

The application is developed using modern frontend technologies with a focus on maintainability, performance, and user experience.

| Category | Technology | Purpose |
|---|---|---|
| Frontend | React 19 | Component-based user interface |
| Language | TypeScript | Static typing and maintainability |
| Build Tool | Vite 8 | Development and production builds |
| Styling | Tailwind CSS 4 | Utility-based styling |
| Design System | CSS Custom Properties | Centralized design tokens |
| Scroll Animation | GSAP / ScrollTrigger | Scroll-driven animations |
| Smooth Scrolling | Lenis | Controlled scrolling experience |
| UI Animation | Motion | Component transitions and interactions |
| Unit Testing | Vitest | Unit and integration testing |
| E2E Testing | Playwright | Browser automation and functional testing |
| Accessibility | axe-core | Automated accessibility checks |
| Performance | Lighthouse | Performance and quality audits |

The technology stack is intentionally separated by responsibility to avoid unnecessary complexity and overlapping animation behavior.

## Getting Started

### Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js 20.19+ or 22.12+**
- npm with lockfile support
- Git
- A modern web browser

The project has been tested with **Node.js 20.20.2**, according to the documented development environment.

Python is required only for the font-subsetting utility.

### Installation

Clone the repository:

```bash
git clone https://github.com/umutcnn/umutcnn.github.io.git

cd umutcnn.github.io
```

Install dependencies:

```bash
npm ci
```

### Development

Start the development server:

```bash
npm run dev
```

By default, the application is available at:

`http://localhost:5173`

### Production Build

Generate the production-ready static website:

```bash
npm run build
```

The build pipeline performs:

1. TypeScript validation.
2. Vite production compilation.
3. Static pre-rendering of supported routes.
4. Generation of deployable assets in `dist/`.

### Preview

Run the production preview locally:

```bash
npm run preview
```

Default preview URL:

`http://localhost:4173`

The preview environment is useful for validating production assets, generated routes, and deployment-related behavior before publication.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Type-check, compile, and pre-render the production website |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Execute type-checking, linting, unit tests, and the production build |
| `npm test` | Run Vitest unit and integration tests |
| `npm run test:e2e` | Run Playwright end-to-end, accessibility, and responsive tests |
| `npm run lighthouse` | Run Lighthouse audits against the active preview server |
| `npm run fonts` | Rebuild Turkish font subsets |
| `npm run assets` | Regenerate profile image variants and the Open Graph image |

**Important development notes:**

- Run the production build before executing tests that require generated static assets.
- The Lighthouse command requires the expected preview server to be running.
- Font subsets can also be generated using `python -I scripts/subset-fonts.py`.
- Asset regeneration may update generated images; review the changes before committing.

## Project Architecture

The application uses a component-oriented frontend architecture with a clear separation between presentation, content, animations, and localization.

### Core Responsibilities

**Application Layer**

Responsible for application initialization, route handling, and global providers.

**Presentation Layer**

Contains reusable interface components and page sections.

**Content Layer**

Defines structured personal information, projects, awards, career events, and technical skills.

**Motion Layer**

Centralizes animation behavior, timing, easing, and interaction principles.

**Localization Layer**

Maintains Turkish and English translations with consistent types.

**Testing Layer**

Validates functionality, responsive behavior, accessibility, and integration flows.

This separation allows portfolio content to evolve without requiring substantial changes to component logic.

### Content Structure

The primary content configuration is organized into dedicated modules:

```text
src/
├── content/
│   ├── profile.ts
│   ├── projects.ts
│   ├── awards.ts
│   ├── timeline.ts
│   ├── skills.ts
│   └── architectures.ts
│
├── locales/
│   ├── tr.ts
│   └── en.ts
│
├── styles/
│   └── tokens.css
│
└── lib/
    └── motion-tokens.ts
```

For additional information about the implementation and system responsibilities, refer to the [Architecture Documentation](docs/architecture.md).

---

## Content Management

The portfolio is designed to make personal information, projects, and translations easy to maintain.

| Content | Configuration File |
|---|---|
| Identity, contact links, profile photo, CV, and focus areas | `src/content/profile.ts` |
| Projects and engineering case studies | `src/content/projects.ts` |
| Awards and achievements | `src/content/awards.ts` |
| Career history, education, and certificates | `src/content/timeline.ts` |
| Skills and knowledge-map categories | `src/content/skills.ts` |
| Technical architecture diagrams | `src/content/architectures.ts` |
| Turkish translations | `src/locales/tr.ts` |
| English translations | `src/locales/en.ts` |
| Colors, typography, and spacing | `src/styles/tokens.css` |
| Motion durations and animation tokens | `src/lib/motion-tokens.ts` |

### Updating Personal Information

Edit:

`src/content/profile.ts`

This module is the central configuration for personal identity, professional information, and contact details.

### Adding or Updating Projects

Edit:

`src/content/projects.ts`

Keep project titles, descriptions, technology lists, results, and supporting media accurate and consistent.

Avoid presenting conceptual demonstrations as production systems or experimental measurements as independently validated results.

### Managing External Links

Contact links and external resources can be disabled using:

```typescript
enabled: false
```

Disabled links are hidden through the existing content configuration.

Incomplete or unverified items are documented in:

[Content Verification](docs/content-verification.md)

### Updating Translations

Edit both language modules:

- `src/locales/tr.ts`
- `src/locales/en.ts`

The English translation structure must remain compatible with the Turkish source structure.

TypeScript validation is used to identify incompatible translation shapes.

---

## Design & Motion System

The website combines editorial typography, technical visualization, and intentional motion design.

Rather than treating animations as decoration, the motion system aims to reinforce navigation, visual hierarchy, and engineering storytelling.

### Design Foundations

- Consistent typography and spacing.
- High-contrast visual compositions.
- Responsive layouts.
- Context-aware animation.
- Reusable visual components.
- Technical illustrations and diagrams.
- Clear interaction states.

Design values are maintained in:

`src/styles/tokens.css`

Animation timings and shared motion settings are managed in:

`src/lib/motion-tokens.ts`

See the [Design System Documentation](docs/design-system.md) for additional implementation details.

---

## Testing & Quality Assurance

Quality assurance covers source-code consistency, functional behavior, browser interactions, accessibility, and production builds.

### Full Project Validation

```bash
npm run check
```

This command executes the documented validation pipeline:

- Type checking
- Linting
- Unit testing
- Production building

### Unit & Integration Testing

```bash
npm test
```

Tests are implemented using Vitest.

### End-to-End Testing

First, create a production build:

```bash
npm run build
```

Then execute the browser tests:

```bash
npm run test:e2e
```

Playwright is used to validate browser interactions and responsive behavior. Automated accessibility checks use axe-core.

### Lighthouse Auditing

Generate the production build and start the preview server:

```bash
npm run build
npm run preview
```

In another terminal:

```bash
npm run lighthouse
```

The Lighthouse workflow evaluates the running preview environment on mobile and desktop configurations.

Audit results depend on the hardware, browser environment, configuration, and application version. No specific score is guaranteed.

For recorded results and limitations, see:

[Test Report](docs/test-report.md)

---

## Deployment

The application generates a statically deployable build and is suitable for hosting platforms that support static websites.

### GitHub Pages

The site is published at **[https://umutcnn.github.io/](https://umutcnn.github.io/)** from the
`umutcnn/umutcnn.github.io` repository (a GitHub Pages *user site*, served from the root path `/`).

1. Repository name: **`umutcnn.github.io`** (public). Any other name is served under `/<name>/` instead.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) type-checks, lints, runs the
   unit, integration, E2E and accessibility tests, builds with the base path derived from the repository name
   (`/` for `umutcnn.github.io`), verifies the output and deploys.

Every route is pre-rendered to its own `index.html`, so deep links such as `/en/` or `/work/<slug>/` work on
refresh; unknown paths fall back to `404.html`.

### Other Static Hosting Providers

The generated `dist/` directory can also be deployed to compatible static hosting services, including Vercel and Netlify.

Platform-specific routing and caching settings may be required.

For detailed deployment instructions, see:

[Deployment Guide](docs/deployment.md)

---

## Security & Privacy

This repository is intended to contain publicly shareable portfolio content.

Before publishing or committing changes:

- Do not commit API keys, credentials, or secrets.
- Do not expose private client information.
- Do not publish proprietary source code without permission.
- Verify that project images and documents are authorized for public distribution.
- Keep local environment files and generated sensitive data outside version control.
- Review externally hosted assets and third-party dependencies.

Technical demonstrations must be clearly distinguished from verified production implementations.

---

## Documentation

Detailed project documentation is available in the `docs/` directory.

| Document | Description |
|---|---|
| [Reference Analysis](docs/reference-analysis.md) | Design references, research, and implementation considerations |
| [Architecture](docs/architecture.md) | Application architecture and technical organization |
| [Design System](docs/design-system.md) | Typography, colors, spacing, components, and visual guidelines |
| [Content Verification](docs/content-verification.md) | Content accuracy and incomplete information tracking |
| [Test Report](docs/test-report.md) | Testing activities, validation results, and known limitations |
| [Deployment Guide](docs/deployment.md) | Production builds and publication instructions |

---

## About the Developer

### Umut Can Yıldız

**Computer Engineer | AI Engineer | Computer Vision & Machine Learning**

Computer Engineering graduate from Sakarya University of Applied Sciences, based in Bursa, Türkiye.

My engineering interests focus on the intersection of artificial intelligence research and practical software development.

My work spans machine learning, computer vision, federated learning, autonomous systems, CAD automation, and enterprise software engineering.

I approach technical problems through a combination of experimentation, system design, and implementation — with an emphasis on building solutions that are useful beyond the prototype stage.

**Research. Engineer. Build. Improve.**

Professional links, contact information, and résumé resources are maintained in `src/content/profile.ts`.

---

## Licensing & Attribution

**Project source code and original content**

Copyright © Umut Can Yıldız.

All rights reserved unless a separate license explicitly grants additional permissions.

**Third-party resources**

- **Space Grotesk** — SIL Open Font License 1.1
- **Inter** — SIL Open Font License 1.1
- **JetBrains Mono** — SIL Open Font License 1.1
- **Lucide Icons** — ISC License

Font resources are provided through Fontsource.

Additional third-party dependencies remain subject to their respective licenses.

**Design Reference**

The creative direction was informed in part by publicly accessible portfolio design references, including the Sueda Kurnaz portfolio.

The project's original implementation does not incorporate copied source code or proprietary assets from that reference website.

---

<div align="center">

**UMUT CAN YILDIZ**

*Engineering Intelligence — From Research to Real-World Systems*

Built with React, TypeScript, and a commitment to thoughtful engineering.

Copyright © Umut Can Yıldız.

</div>