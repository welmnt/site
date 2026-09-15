import type { Program } from "@/integrations/supabase/types";

/**
 * Local mirror of supabase/migrations/0003_seed.sql.
 *
 * Two jobs: it keeps the marketing pages alive before the Supabase project exists,
 * and it is the copy deck. Titles and blurbs are PLACEHOLDERS — the engine is the
 * real thing here. Rename in the admin once the curriculum is written.
 */
export const FALLBACK_PROGRAMS: Program[] = [
  {
    id: "seed-5-9",
    slug: "ages-5-9",
    title: "Little Minds",
    title_ar: "براعم",
    age_min: 5,
    age_max: 9,
    price_egp: 3000,
    sessions_count: 8,
    duration_weeks: 8,
    summary:
      "Eight live sessions over two months for children aged 5–9 — feelings, friendship and self-regulation, taught in play.",
    summary_ar: null,
    outcomes: [
      "Name what they feel instead of acting it out",
      "Calm down with a method, not a scolding",
      "Handle a falling-out with a friend",
      "Ask an adult for help without shame",
    ],
    accent: "k2",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "seed-10-13",
    slug: "ages-10-13",
    title: "Growing Minds",
    title_ar: "ناشئة",
    age_min: 10,
    age_max: 13,
    price_egp: 3000,
    sessions_count: 8,
    duration_weeks: 8,
    summary:
      "Eight live sessions over two months for children aged 10–13 — confidence, handling pressure, and a healthy relationship with screens.",
    summary_ar: null,
    outcomes: [
      "Sit with a hard feeling without needing a screen",
      "Say no to a friend and keep the friendship",
      "Recognise comparison for what it is",
      "Recover from a bad grade or a bad day",
    ],
    accent: "k1",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "seed-14-17",
    slug: "ages-14-17",
    title: "Rising Minds",
    title_ar: "شباب",
    age_min: 14,
    age_max: 17,
    price_egp: 3000,
    sessions_count: 8,
    duration_weeks: 8,
    summary:
      "Eight live sessions over two months for teens aged 14–17 — identity, anxiety, cyberbullying and decisions that stick.",
    summary_ar: null,
    outcomes: [
      "Tell anxiety apart from danger",
      "Handle being targeted online",
      "Make a decision they can defend to themselves",
      "Know when something is bigger than they are",
    ],
    accent: "k5",
    sort_order: 3,
    is_active: true,
  },
];

export const PROGRAM_FACTS = {
  sessions: 8,
  weeks: 8,
  priceEgp: 3000,
  mode: "Live online, small groups",
  instructor: "Dr. Walaa Elgammal",
} as const;
