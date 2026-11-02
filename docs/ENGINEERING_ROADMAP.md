# Engineering Roadmap

## P0 — Enquiry flow and security

- [ ] Verify contact form server-side validation, spam protection and delivery failure handling.
- [ ] Keep SMTP/API credentials in deployment secrets; never expose them to client bundles.
- [ ] Add privacy notice and consent language appropriate to the enquiry form.
- [ ] Verify all phone, email and WhatsApp links on desktop and mobile.

## P1 — Performance and accessibility

- [ ] Audit image sizes, formats, responsive sources and loading priorities.
- [ ] Lazy-load below-the-fold media and 3D experiences.
- [ ] Respect `prefers-reduced-motion` across GSAP, Motion and Lenis interactions.
- [ ] Verify keyboard navigation, focus visibility, contrast and heading structure.
- [ ] Test Core Web Vitals on representative mobile devices.

## P1 — Reliability

- [ ] Add automated tests for contact form validation and key navigation paths.
- [ ] Add CI for lint and production build.
- [ ] Add error monitoring and redacted server logs.
- [ ] Validate canonical metadata, sitemap, robots rules and Open Graph image availability.

## P2 — Business content

- [ ] Confirm every certification, partner brand, review and installation claim with the business owner.
- [ ] Add case studies only with customer permission.
- [ ] Track qualified enquiries with privacy-aware analytics.

## Acceptance criteria

- Contact enquiries are validated, delivered and failure states are visible.
- Main journeys work by keyboard and on mobile.
- Reduced-motion preference is respected.
- Production build and lint pass in CI.
