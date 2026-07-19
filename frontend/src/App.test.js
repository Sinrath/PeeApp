import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const jsonResponse = (body, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => body,
});

const savedPee = { _id: 'a1b2c3', time: new Date().toISOString() };

beforeEach(() => {
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

test('shows an error message when the server fails to save', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ message: 'Error saving pee time' }, false, 500));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /record pee/i }));

    expect(await screen.findByText(/not saved/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText(/recorded/i)).not.toBeInTheDocument();
});

test('shows an error message when the network request fails', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /record pee/i }));

    expect(await screen.findByText(/not saved/i, {}, { timeout: 3000 })).toBeInTheDocument();
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
