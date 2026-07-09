const SPANISH_BAD_WORDS = [
  'puta', 'puto', 'pendejo', 'pendeja', 'carajo', 'mierda', 'coño', 'coña',
  'joder', 'jodido', 'jodida', 'cabron', 'cabrona', 'cabrones', 'gilipollas',
  'hijo de puta', 'hija de puta', 'hijos de puta', 'ctm', 'conchesumare',
  'concha tu madre', 'conchetumare', 'soplapollas', 'maricon', 'maricona',
  'maricones', 'huevon', 'huevona', 'huevones', 'webon', 'webona',
  'verga', 'vergas', 'vrg', 'pito', 'pene', 'vagina', 'culo', 'culos',
  'chupame', 'chupamela', 'chupamelo', 'mamame', 'mamada', 'mamar',
  'desgraciado', 'desgraciada', 'tarado', 'tarada', 'estupido', 'estupida',
  'imbecil', 'idiota', 'mongol', 'mongola', 'subnormal',
  'follar', 'follame', 'folla', 'coger', 'cojer',
  'nazi', 'negrata', 'puta madre',
  'sexo', 'sexual', 'pornografia', 'porno',
  'prostituta', 'prostituto', 'puteria', 'putero',
];

const ENGLISH_BAD_WORDS = [
  'fuck', 'fucking', 'fuck you', 'motherfucker', 'motherfucking',
  'shit', 'bullshit', 'holy shit', 'piece of shit',
  'ass', 'asshole', 'bitch', 'son of a bitch', 'bastard',
  'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut',
  'nigger', 'nigga', 'faggot', 'fag', 'retard',
  'porn', 'pornography', 'sex',
  'damn', 'goddamn',
];

const FLAGGED_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /@[a-z0-9_-]+/gi,
  /\b(compr[aeo]|vendo|vende|gana dinero|haz clic|click here|free money|suscripci[oó]n)\b/gi,
];

const COMBINED_WORDS = [...new Set([...SPANISH_BAD_WORDS, ...ENGLISH_BAD_WORDS])];

export function containsProfanity(text: string): string | null {
  if (!text) return null;

  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const word of COMBINED_WORDS) {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower)) {
      return word;
    }
  }

  return null;
}

export function containsSpamPatterns(text: string): boolean {
  if (!text) return false;
  return FLAGGED_PATTERNS.some((pattern) => pattern.test(text));
}

export function moderateContent(title: string, description?: string): {
  flagged: boolean;
  reason: string | null;
} {
  const titleCheck = containsProfanity(title);
  if (titleCheck) {
    return { flagged: true, reason: `Lenguaje inapropiado en el título: "${titleCheck}"` };
  }

  if (description) {
    const descCheck = containsProfanity(description);
    if (descCheck) {
      return { flagged: true, reason: `Lenguaje inapropiado en la descripción: "${descCheck}"` };
    }
  }

  const combined = `${title} ${description || ''}`;
  if (containsSpamPatterns(combined)) {
    return { flagged: true, reason: 'Contenido sospechoso detectado' };
  }

  return { flagged: false, reason: null };
}
