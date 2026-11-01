import { X } from 'lucide-react';
import { useState } from 'react';
import { commitPattern, splitPatternInput } from '../../lib/url-patterns';

type PatternEditorProps = {
  label: string;
  value: string[];
  onChange: (patterns: string[]) => void;
  invalidPattern?: string;
};

export function PatternEditor({ label, value, onChange, invalidPattern }: PatternEditorProps) {
  const [input, setInput] = useState('');
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const next = commitPattern(input, value);
      if (next !== value) onChange(next);
      setInput('');
    } else if (event.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }
  function onChangeInput(next: string) {
    const result = splitPatternInput(next, value);
    onChange(result.value);
    setInput(result.remainder);
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
