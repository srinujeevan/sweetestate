import { escapeCell, toCsv } from './csv';

describe('CSV export', () => {
  it('quotes commas, quotes and newlines', () => {
    expect(escapeCell('a,b')).toBe('"a,b"');
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('neutralises spreadsheet formula injection', () => {
    expect(escapeCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(escapeCell('+91 98765')).toBe("'+91 98765");
    expect(escapeCell('@cmd')).toBe("'@cmd");
  });

  it('renders null as empty and joins rows with CRLF', () => {
    expect(toCsv(['a', 'b'], [[1, null]])).toBe('a,b\r\n1,');
  });
});
