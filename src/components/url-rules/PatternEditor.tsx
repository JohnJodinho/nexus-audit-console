import { X } from 'lucide-react';
import { useState } from 'react';

type PatternEditorProps = {
  label: string;
  value: string[];
  onChange: (patterns: string[]) => void;
  invalidPattern?: string;
};

function commitPattern(input: string, value: string[], onChange: (patterns: string[]) => void) {
  const pattern = input.trim();
  if (!pattern || value.includes(pattern)) return '';
  onChange([...value, pattern]);
  return '';
}

export function PatternEditor({ label, value, onChange, invalidPattern }: PatternEditorProps) {
  const [input, setInput] = useState('');
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      setInput(commitPattern(input, value, onChange));
    } else if (event.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }
  function onChangeInput(next: string) {
    const parts = next.split(',');
    if (parts.length === 1) {
      setInput(next);
      return;
    }
    let remaining = parts.pop() ?? '';
    parts.forEach((part) => {
      const committed = commitPattern(part, value, onChange);
      if (committed === '') remaining = remaining.trim();
    });
    setInput(remaining);
  }
  return (
    <div className="pattern-editor">
      <span className="form-label">{label}</span>
      <div className="pattern-chip-box">
        {value.map((pattern) => (
          <span className={invalidPattern === pattern ? 'pattern-chip pattern-chip-invalid' : 'pattern-chip'} key={pattern}>
            <span>{pattern}</span>
            <button type="button" aria-label={`Remove ${pattern}`} onClick={() => onChange(value.filter((item) => item !== pattern))}><X size={13} /></button>
          </span>
        ))}
        <input aria-label={label} value={input} onChange={(event) => onChangeInput(event.target.value)} onKeyDown={onKeyDown} placeholder={value.length ? 'Add pattern' : 'Enter a pattern'} />
      </div>
      <small className="field-hint">Press Enter or comma to commit. Backspace removes the last pattern.</small>
    </div>
  );
}
