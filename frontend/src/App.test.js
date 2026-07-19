import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const jsonResponse = (body, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => body,
});

const savedPee = { _id: 'a1b2c3', time: new Date().toISOString() };

const readQueue = () => JSON.parse(localStorage.getItem('peeQueue') || '[]');

beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.restoreAllMocks();
});

test('shows success message after the server confirms the save', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ message: 'Pee time saved', pee: savedPee }));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /record pee/i }));

    expect(await screen.findByText(/recorded/i, {}, { timeout: 3000 })).toBeInTheDocument();
});

test('queues the entry on the phone when the server fails to save', async () => {
    fetch.mockResolvedValue(jsonResponse({ message: 'Error saving pee time' }, false, 500));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /record pee/i }));

    expect(await screen.findByText(/saved on phone/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText(/recorded/i)).not.toBeInTheDocument();
    expect(readQueue()).toHaveLength(1);
});

test('queues the entry on the phone when the network request fails', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /record pee/i }));

    expect(await screen.findByText(/saved on phone/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(readQueue()).toHaveLength(1);
});

test('syncs queued entries when the connection comes back', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /record pee/i }));
    await screen.findByText(/saved on phone/i, {}, { timeout: 3000 });
    expect(readQueue()).toHaveLength(1);

    fetch.mockResolvedValue(jsonResponse({ message: 'Pee time saved', pee: savedPee }));
    window.dispatchEvent(new Event('online'));

    await waitFor(() => expect(readQueue()).toHaveLength(0), { timeout: 3000 });
});

test('pending entries show in the list until they sync', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /record pee/i }));
    await screen.findByText(/saved on phone/i, {}, { timeout: 3000 });

    fetch.mockResolvedValue(jsonResponse([]));
    await userEvent.click(screen.getByRole('button', { name: /show list/i }));

    expect(await screen.findByText(/pending/i, {}, { timeout: 3000 })).toBeInTheDocument();
});

test('an entry with a custom time can be added from the list', async () => {
    const customIso = new Date('2026-07-19T08:30:00').toISOString();
    fetch.mockResolvedValueOnce(jsonResponse([]));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /show list/i }));
    await userEvent.click(await screen.findByRole('button', { name: /add entry/i }));

    const input = screen.getByLabelText(/time/i);
    fireEvent.change(input, { target: { value: '2026-07-19T08:30' } });

    fetch.mockResolvedValueOnce(jsonResponse({ message: 'Pee time saved', pee: { _id: 'c1', time: customIso } }));
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/recorded/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pee'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ time: customIso }) })
    );
});

test('sends the save request with keepalive so it survives closing the app', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ message: 'Pee time saved', pee: savedPee }));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /record pee/i }));

    await waitFor(() =>
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/pee'),
            expect.objectContaining({ method: 'POST', keepalive: true })
        )
    );
});

test('list shows an error with retry instead of crashing when the fetch fails', async () => {
    fetch.mockResolvedValue(jsonResponse({ message: 'Error fetching peetimes' }, false, 500));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /show list/i }));

    expect(await screen.findByText(/couldn.t load/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});

test('list shows the saved entries after a successful fetch', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([savedPee]));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /show list/i }));

    expect(await screen.findByText(/today/i, {}, { timeout: 3000 })).toBeInTheDocument();
});
