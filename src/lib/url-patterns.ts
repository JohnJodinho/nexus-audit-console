export function commitPattern(input: string, value: string[]) {
  const pattern = input.trim();
  return pattern && !value.includes(pattern) ? [...value, pattern] : value;
}

export function splitPatternInput(input: string, value: string[]) {
  const parts = input.split(',');
  if (parts.length === 1) return { value, remainder: input };
  return {
    value: parts.slice(0, -1).reduce((patterns, part) => commitPattern(part, patterns), value),
    remainder: parts[parts.length - 1]?.trim() ?? '',
  };
}
