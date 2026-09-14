export type LandingService = {
  title: string;
  desc: string;
  /** key into SERVICE_ICONS */
  icon: keyof typeof SERVICE_ICONS;
};

export type LandingTestimonial = {
  name: string;
  role: string;
  flag: string;
  quote: string;
};

/**
 * Copy and icons carried over verbatim from the v7 preview document so the port
 * renders the same content as the design file. `desc` uses plain apostrophes; the
 * source wrote `it's` inside a double-quoted string, which React escapes for us.
 */
export const SERVICES: LandingService[] = [
  {
    title: "Software Development",
    desc: "Web and mobile products engineered end-to-end, from first sketch to launch.",
    icon: "layers",
  },
  {
    title: "Product Engineering",
    desc: "Robust, scalable products built with modern stacks and solid engineering practice.",
    icon: "cpu",
  },
  {
    title: "Startup Services",
    desc: "From idea to launch, we help startups build, grow, and scale with expert support.",
    icon: "rocket",
  },
  {
    title: "Technology Consulting",
    desc: "Strategic guidance to help you make the right technical calls and stay ahead.",
    icon: "compass",
  },
];

export const TESTIMONIALS: LandingTestimonial[] = [
  {
    name: "Emeka Obi",
    role: "CEO, NovaTech (Nigeria)",
    flag: "🇳🇬",
    quote: "TechRepubliQ transformed our launch — professional, creative, and incredible to work with.",
  },
  {
    name: "Lukas Weber",
    role: "Founder, Finovo (Germany)",
    flag: "🇩🇪",
    quote: "Their expertise in product development helped us launch faster than we imagined.",
  },
  {
    name: "Sophie Laurent",
    role: "CTO, PixelFlow (France)",
    flag: "🇫🇷",
    quote:
      "Working with TechRepubliQ was a game-changer. They delivered a scalable product that exceeded what we asked for.",
  },
  {
    name: "Daniel Brooks",
    role: "Product Lead, Zenith (Sweden)",
    flag: "🇸🇪",
    quote:
      "Professional, innovative, and reliable — they helped us build a platform that handles our growth perfectly.",
  },
  {
    name: "James Wilson",
    role: "Founder, CloudNest (UK)",
    flag: "🇬🇧",
    quote: "A fantastic team with great communication and technical skill. They turned our vision into a powerful product.",
  },
  {
    name: "Marta Kowalska",
    role: "CEO, BrightApp (Netherlands)",
    flag: "🇳🇱",
    quote:
      "TechRepubliQ's dedication to quality and innovation is unmatched. A genuinely valuable partner in our journey.",
  },
];

/**
 * Raw path markup (not JSX) so these strings stay a direct copy of ICON_PATHS in
 * the source document. Rendered with dangerouslySetInnerHTML on an <svg>, which is
 * equivalent to the `card.innerHTML = ...` the source used to build each card.
 */
export const SERVICE_ICONS = {
  layers:
    '<polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />',
  cpu: '<rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" />',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  compass:
    '<circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />',
} as const;
