import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app/App';
import { PROFILE } from '../../src/content/profile';

function renderAt(path: string) {
  window.history.replaceState(null, '', path);
  return render(<App />);
}

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('home page', () => {
  it('renders the hero name as a real heading and all sections', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: PROFILE.name })).toBeInTheDocument();
    for (const id of ['about', 'work', 'research', 'achievements', 'stack', 'journey', 'lab', 'contact']) {
      expect(document.getElementById(id), id).not.toBeNull();
    }
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  it('switches TR → EN on the same route and persists the choice', async () => {
    const user = userEvent.setup();
    renderAt('/');
    expect(screen.getByText('Projelerimi Keşfet')).toBeInTheDocument();
    await user.click(screen.getAllByTestId('lang-toggle')[0]!);
    expect(await screen.findByText('Explore my work')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/en/');
    expect(localStorage.getItem('ucy.locale')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('toggles the theme and stores it', async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.theme = 'light';
    renderAt('/');
    await user.click(screen.getAllByTestId('theme-toggle')[0]!);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('ucy.theme')).toBe('dark');
  });

  it('opens the mobile menu as a modal, closes on Escape and restores focus', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const opener = screen.getByTestId('menu-open');
    await user.click(opener);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(document.documentElement).toHaveClass('is-scroll-locked');
    expect(within(dialog).getAllByRole('link').length).toBeGreaterThanOrEqual(9);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(opener).toHaveFocus());
    expect(opener).toHaveAttribute('aria-expanded', 'false');
    expect(document.documentElement).not.toHaveClass('is-scroll-locked');
  });

  it('links a technology to the projects that use it', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByTestId('tech-pytorch'));
    expect(screen.getByTestId('tech-pytorch')).toHaveAttribute('aria-pressed', 'true');
    const list = screen.getByTestId('stack-projects');
    const on = list.querySelectorAll('.stack-row.is-on');
    expect(on.length).toBeGreaterThan(0);
    expect(on[0]!.textContent).toMatch(/Katarakt/);
  });

  it('filters the archive by category', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const all = screen.getByTestId('archive-list').children.length;
    await user.click(screen.getByRole('button', { name: 'Web' }));
    const web = screen.getByTestId('archive-list').children.length;
    expect(web).toBeGreaterThan(0);
    expect(web).toBeLessThan(all);
  });

  it('copies the email and reports success or failure', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderAt('/');
    await user.click(screen.getByTestId('copy-email'));
    expect(await screen.findByText('E-posta adresi kopyalandı')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(PROFILE.email.value);
    await user.click(screen.getByTestId('copy-email'));
    expect(await screen.findByText(new RegExp(`Kopyalanamadı — adres: ${PROFILE.email.value}`))).toBeInTheDocument();
  });

  it('runs the federated-learning demo one phase per step', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const lab = document.getElementById('lab')!;
    await user.click(within(lab).getByTestId('fl-step'));
    expect(within(lab).getByText('Yerel eğitim')).toBeInTheDocument();
    await user.click(within(lab).getByTestId('fl-step'));
    expect(within(lab).getByText('Güncellemeler sunucuya')).toBeInTheDocument();
  });

  it('changes the detection count with the confidence threshold', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const lab = document.getElementById('lab')!;
    await user.click(within(lab).getByTestId('lab-tab-cv'));
    const count = () => Number(within(lab).getByTestId('cv-count').textContent);
    const slider = within(lab).getByTestId('cv-threshold') as HTMLInputElement;
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(slider, { target: { value: '0.1' } });
    const low = count();
    fireEvent.change(slider, { target: { value: '0.9' } });
    expect(count()).toBeLessThan(low);
  });

  it('supports arrow-key navigation between lab tabs', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const first = screen.getByTestId('lab-tab-fl');
    act(() => first.focus());
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('lab-tab-cv')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('lab-tab-cv')).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByTestId('lab-tab-arch')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('routing', () => {
  it('renders a case study for a deep link, then follows "next project"', async () => {
    const user = userEvent.setup();
    renderAt('/work/federated-cataract-detection/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Federe Öğrenme ile Katarakt Tespiti' }),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId('case-next'));
    expect(await screen.findByRole('heading', { level: 1, name: /TEKNOFEST 2023/ })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/work/teknofest-2023-transportation-ai/');
  });

  it('navigates back with the browser history', async () => {
    const user = userEvent.setup();
    renderAt('/work/federated-cataract-detection/');
    await screen.findByRole('heading', { level: 1, name: /Katarakt/ });
    await user.click(screen.getByTestId('case-next'));
    await screen.findByRole('heading', { level: 1, name: /TEKNOFEST 2023/ });
    act(() => {
      window.history.back();
    });
    expect(await screen.findByRole('heading', { level: 1, name: /Katarakt/ })).toBeInTheDocument();
  });

  it('shows a localized 404 for unknown deep links', async () => {
    renderAt('/en/work/does-not-exist/');
    expect(await screen.findByRole('heading', { name: 'This route is not on the map.' })).toBeInTheDocument();
    renderAt('/bilinmeyen/');
  });

  it('opens the gallery dialog and moves between items with the keyboard', async () => {
    const user = userEvent.setup();
    renderAt('/work/maks-enterprise-erp/');
    await screen.findByRole('heading', { level: 1, name: 'MAKS Enterprise ERP' });
    await user.click(screen.getByTestId('gallery-open-0'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByTestId('lightbox-counter')).toHaveTextContent('1 / 3');
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByTestId('lightbox-counter')).toHaveTextContent('2 / 3');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByTestId('gallery-open-0')).toHaveFocus();
  });
});
