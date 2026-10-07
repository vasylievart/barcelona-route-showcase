export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                    // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')     // remove accent marks
    .replace(/[^a-z0-9\s-]/g, '')       // remove special chars
    .trim()
    .replace(/\s+/g, '-')               // spaces to hyphens
    .replace(/-+/g, '-')                // collapse multiple hyphens
    .slice(0, 80)                        // max 80 chars for SEO
}

// "The Best Pizzerias in Barcelona" → "the-best-pizzerias-in-barcelona"