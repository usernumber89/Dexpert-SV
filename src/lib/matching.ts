function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function normalizeList(list: string[]): string[] {
  return list.map(normalize).filter(Boolean);
}

function parseProjectSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) return normalizeList(skills);
  return skills
    .split(",")
    .map(normalize)
    .filter(Boolean);
}

function normalizeStudentSkills(skills: string[]): string[] {
  return normalizeList(skills);
}

function partialMatch(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a);
}

export function calcMatch(projectSkills: string | string[], studentSkills: string[]): number {
  const required = parseProjectSkills(projectSkills);
  const student = normalizeStudentSkills(studentSkills);

  if (!required.length || !student.length) return 0;

  const matches = required.filter(r => student.some(s => partialMatch(r, s)));
  return Math.round((matches.length / required.length) * 100);
}

export function isMatchedSkill(skill: string, studentSkills: string[]): boolean {
  if (!studentSkills.length) return false;
  const s = normalize(skill);
  const student = normalizeStudentSkills(studentSkills);
  return student.some(sk => partialMatch(s, sk));
}
