import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { ServiceDescription } from '../../apps/web/src/components/services/ServiceDescription';
const requireWeb = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const React = requireWeb('react');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
describe('service-authored text presentation', () => {
  it('keeps HTML and scripts as escaped text', () => {
    const html = renderToStaticMarkup(React.createElement(ServiceDescription, { text: '<script>alert(1)</script>\n<img src=x onerror=alert(1)>' }));
    expect(html).not.toContain('<script>'); expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;'); expect(html).toContain('&lt;img');
  });
  it('presents service scope with semantic headings, lists and emphasis', () => {
    const html = renderToStaticMarkup(React.createElement(ServiceDescription, { text: '### Scope\n- **Design** review\n- Implementation\n\n1. First\n2. Second\n\nPlain text\nwith line breaks' }));
    expect(html).toContain('<h3'); expect(html).toContain('<ul'); expect(html).toContain('<ol');
    expect(html).toContain('>Design</strong>'); expect(html).toContain('Plain text\nwith line breaks');
  });
});
