#!/bin/bash
set -e

# SmartNest refinement pass: safe CSS-only polish, preserves the existing page logic.
if [ ! -f "package.json" ] || [ ! -f "app/page.tsx" ] || [ ! -f "app/globals.css" ]; then
  echo "Run this from your SmartNest project root (the folder containing package.json and app/)."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
cp app/globals.css "app/globals.css.backup-$STAMP"

if grep -q "SMARTNEST REFINEMENT PASS" app/globals.css; then
  echo "Refinement styles already appear to be installed. No changes made."
  exit 0
fi

cat >> app/globals.css <<'EOF'

/* SMARTNEST REFINEMENT PASS */
:root {
  color-scheme: dark;
  scroll-behavior: smooth;
  scroll-padding-top: 28px;
  --sn-blue: #008cff;
  --sn-ice: #8acbff;
  --sn-green: #29f0c4;
}
html {
  background: #050609;
  scroll-behavior: smooth;
}
body {
  min-width: 320px;
  background: #050609;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
::selection {
  color: #fff;
  background: rgba(0, 140, 255, .45);
}
:focus-visible {
  outline: 2px solid var(--sn-ice);
  outline-offset: 4px;
}
a, button, input {
  -webkit-tap-highlight-color: transparent;
}
button {
  touch-action: manipulation;
}
img {
  max-width: 100%;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
@media (max-width: 767px) {
  section[id] {
    scroll-margin-top: 18px;
  }
}
EOF

echo ""
echo "SmartNest refinement styles installed."
echo "Backup created: app/globals.css.backup-$STAMP"
echo "Now run: npm run build"
echo "If the build passes, run: npm run dev"
