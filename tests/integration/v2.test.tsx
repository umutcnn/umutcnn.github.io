import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('V2 interactions', () => {
  it('constellation: selecting a domain lights its projects in the shared panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('domain-federated'));
    expect(screen.getByTestId('domain-federated')).toHaveAttribute('aria-pressed', 'true');
    const lit = [...screen.getByTestId('stack-projects').querySelectorAll('.stack-row.is-on')].map(r => r.textContent);
    expect(lit.join(' ')).toMatch(/Katarakt/);
    expect(screen.getByText('Federe Öğrenme alanındaki projeler')).toBeInTheDocument();
    // a technology node narrows the selection
    await user.click(screen.getByTestId('node-occt'));
    const lit2 = [...screen.getByTestId('stack-projects').querySelectorAll('.stack-row.is-on')].map(r => r.textContent);
    expect(lit2.join(' ')).toMatch(/MAKS CAD/);
    expect(lit2.join(' ')).not.toMatch(/Katarakt/);
  });

  it('achievements: tabs switch chapters with arrow keys', async () => {
    const user = userEvent.setup();
    render(<App />);
    const first = screen.getByTestId('story-tab-teknofest-2023');
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('story-panel')).toHaveTextContent('Türkiye 2.si');
    act(() => first.focus());
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('story-tab-tubitak-2209a')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('story-tab-tubitak-2209a')).toHaveFocus();
    expect(screen.getByTestId('story-panel')).toHaveTextContent('Proje yürütücüsü');
    await user.keyboard('{End}');
    expect(screen.getByTestId('story-panel')).toHaveTextContent('Mezuniyet');
  });

  it('federated simulator: client inspection and phase explanation', async () => {
    const user = userEvent.setup();
    render(<App />);
    const lab = document.getElementById('lab')!;
    expect(within(lab).getByTestId('fl-client-card')).toHaveTextContent('%49');
    await user.click(within(lab).getByTestId('fl-client-2'));
    expect(within(lab).getByTestId('fl-client-card')).toHaveTextContent('%18');
    await user.click(within(lab).getByTestId('fl-step'));
    expect(within(lab).getByTestId('fl-explain')).toHaveTextContent('kendi verisiyle');
    await user.click(within(lab).getByLabelText('FedAvg'));
    expect(within(lab).getByText('w ← Σₖ (nₖ / n) · wₖ')).toBeInTheDocument();
  });

  it('detection playground: class filter and confidence summary', async () => {
    const user = userEvent.setup();
    render(<App />);
    const lab = document.getElementById('lab')!;
    await user.click(within(lab).getByTestId('lab-tab-cv'));
    fireEvent.change(within(lab).getByTestId('cv-threshold'), { target: { value: '0.1' } });
    const all = Number(within(lab).getByTestId('cv-count').textContent);
    await user.click(within(lab).getByTestId('cv-class-partial'));
    expect(Number(within(lab).getByTestId('cv-count').textContent)).toBeLessThan(all);
    expect(within(lab).getByText('Örnek Tespit Görselleştirmesi')).toBeInTheDocument();
    expect(Number(within(lab).getByTestId('cv-avg').textContent)).toBeGreaterThan(0);
  });

  it('architecture explorer: zoom, fit and keyboard control', async () => {
    const user = userEvent.setup();
    render(<App />);
    const lab = document.getElementById('lab')!;
    await user.click(within(lab).getByTestId('lab-tab-arch'));
    const zoom = within(lab).getByTestId('arch-zoom');
    expect(zoom).toHaveTextContent('100%');
    await user.click(within(lab).getByTestId('arch-zoom-in'));
    expect(zoom).toHaveTextContent('120%');
    await user.click(within(lab).getByTestId('arch-fit'));
    expect(zoom).toHaveTextContent('100%');
    const stage = within(lab).getByTestId('arch-stage');
    act(() => stage.focus());
    await user.keyboard('+');
    expect(zoom).toHaveTextContent('120%');
    await user.keyboard('0');
    expect(zoom).toHaveTextContent('100%');
  });
});
