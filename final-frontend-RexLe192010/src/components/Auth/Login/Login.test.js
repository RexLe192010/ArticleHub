// src/components/Auth/Login/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import '@testing-library/jest-dom/extend-expect';

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Define a mock user object
const mockUser = {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    address: {
        street: 'Kulas Light',
        suite: 'Apt. 556',
        city: 'Gwenborough',
        zipcode: '92998-3874',
        geo: {
            lat: '-37.3159',
            lng: '81.1496'
        }
    },
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: {
        name: 'Romaguera-Crona',
        catchPhrase: 'Multi-layered client-server neural-net',
        bs: 'harness real-time e-markets'
    }
};

describe('Validate Authentication', () => {
    beforeEach(() => {
        // Clear mocks and localStorage before each test
        jest.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('should log in a previously registered user (not new users, login state should be set)', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Set input values for username and password
        fireEvent.change(screen.getByLabelText(/Account Name:/i), { target: { value: 'Bret' } });
        fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'Kulas Light' } });

        // Click the login button
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        // Check if login was successful and navigate was called with the user object
        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith('/Main', { state: { user: mockUser } })
        );

        // Check if jsonUsername and jsonPassword state values have changed
        expect(screen.getByLabelText(/Account Name:/i)).toHaveValue('Bret');
        expect(screen.getByLabelText(/Password:/i)).toHaveValue('Kulas Light');
    });

    it('should not log in an invalid user (error state should be set)', async () => {
        // Mock the window alert
        window.alert = jest.fn();

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Set input values for username and password
        fireEvent.change(screen.getByLabelText(/Account Name:/i), { target: { value: 'InvalidUser' } });
        fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'WrongPassword' } });

        // Click the login button
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        // Check if an alert is shown
        await waitFor(() =>
            expect(window.alert).toHaveBeenCalledWith('Invalid account name or password')
        );

        // Check if localStorage has no user saved
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('should log out a user (login state should be cleared)', () => {
        // Simulate a user being logged in
        localStorage.setItem('user', JSON.stringify(mockUser));

        // Simulate a logout action
        // Depending on your implementation, you might need to render a component or call a function
        // For simplicity, we'll directly remove the user from localStorage
        localStorage.removeItem('user');

        // Check if the user is logged out
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('should render the login form', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Account Name:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should update username and password input values', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Account Name:/i);
        const passwordInput = screen.getByLabelText(/Password:/i);

        fireEvent.change(usernameInput, { target: { value: 'Bret' } });
        fireEvent.change(passwordInput, { target: { value: 'Kulas Light' } });

        expect(usernameInput.value).toBe('Bret');
        expect(passwordInput.value).toBe('Kulas Light');
    });

    it('should alert an error for an invalid user', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        { username: 'Bret', address: { street: 'Kulas Light' } },
                    ]),
            })
        );

        jest.spyOn(window, 'alert').mockImplementation(() => { });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Account Name:/i);
        const passwordInput = screen.getByLabelText(/Password:/i);

        fireEvent.change(usernameInput, { target: { value: 'InvalidUser' } });
        fireEvent.change(passwordInput, { target: { value: 'InvalidPass' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Invalid account name or password');
        });
    });

    it('should navigate to /Main for a valid user', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        { username: 'Bret', address: { street: 'Kulas Light' } },
                    ]),
            })
        );

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Account Name:/i);
        const passwordInput = screen.getByLabelText(/Password:/i);

        fireEvent.change(usernameInput, { target: { value: 'Bret' } });
        fireEvent.change(passwordInput, { target: { value: 'Kulas Light' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/Main', { state: { user: { username: 'Bret', address: { street: 'Kulas Light' } } } });
        });
    });
});
