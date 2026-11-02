# SmartNest — Smart Home Automation Website

A Next.js website experience for SmartNest, presenting smart-home automation services for homes and villas in the Hosur and Bengaluru markets. The site combines service storytelling, product/technology education, motion-led sections and an enquiry journey.

## Experience highlights

- Service presentation for KNX wired automation and connected home systems.
- Dedicated sections for spaces, process, reviews and contact.
- Motion components for reveal, parallax, marquees, counters and scroll progress.
- Three.js / React Three Fiber dependencies for 3D web experiences.
- Contact form component and clear enquiry calls to action.
- Search-friendly metadata, canonical URL and Open Graph metadata.

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Three.js and React Three Fiber / Drei
- GSAP, Motion and Lenis
- Lucide icons

## Local development

Requirements: Node.js version supported by the installed Next.js release.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```bash
npm run lint
npm run build
npm start
```

## Configuration and deployment

Review environment variables, contact-form delivery configuration, image assets, canonical URLs and deployment settings before publishing. Do not commit private API keys, SMTP credentials or customer enquiry data.

## Engineering notes

The homepage contains client-facing interactive sections and animation components. Keep server-rendered content where possible, isolate browser-only/3D code behind client components, and verify reduced-motion behaviour, keyboard navigation, mobile performance and form validation.

See [Engineering roadmap](docs/ENGINEERING_ROADMAP.md) for the next implementation priorities.
