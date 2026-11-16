import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFocusTrap } from '../../src/hooks/useFocusTrap';

function Dialog() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, () => {});
  return (
    <div ref={ref} role="dialog">
      <button type="button">close</button>
      <fieldset>
        <legend>strategy</legend>
        <label>
          <input type="radio" name="alg" value="a" defaultChecked /> A
        </label>
        <label>
          <input type="radio" name="alg" value="b" /> B
        </label>
      </fieldset>
    </div>
  );
}

describe('useFocusTrap', () => {
  // jsdom has no layout: report every element as rendered so the trap's visibility filter keeps it.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
      () => [new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList,
    );
  });

  it('wraps focus when the last tab stop is a radio group (unchecked radios are not tab stops)', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <button type="button">outside</button>
        <Dialog />
      </>,
    );
    const close = getByRole('button', { name: 'close' });
    expect(document.activeElement).toBe(close);
    await user.tab();
    expect(document.activeElement).toBe(getByRole('radio', { name: 'A' }));
    await user.tab(); // from the checked radio — the group's only tab stop — back to the first element
    expect(document.activeElement).toBe(close);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(getByRole('radio', { name: 'A' }));
  });
});
