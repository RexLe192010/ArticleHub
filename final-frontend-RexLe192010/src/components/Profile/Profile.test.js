// src/components/Profile/Profile.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Profile from './Profile';
import '@testing-library/jest-dom/extend-expect';

describe('Profile Component', () => {
    // Define a mock user object to provide necessary context
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

    beforeEach(() => {
        // Mock window.alert to prevent JSDOM errors
        window.alert = jest.fn();
    });

    afterEach(() => {
        // Clear alert mocks after each test
        window.alert.mockClear();
    });

    it('should display the updated profile data after clicking submit', async () => {
        // Render Profile component with user context using MemoryRouter
        render(
            <MemoryRouter initialEntries={[{ pathname: '/profile', state: { user: mockUser } }]}>
                <Routes>
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        // Ensure form fields are present
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Zipcode/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();

        // Simulate form data update
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '987-654-3210' } });
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: '1234567' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '1234567' } });

        // Click the submit button to trigger update and alert
        fireEvent.click(screen.getByText(/Submit/i));

        // Wait for the update to reflect and validate if the email, phone, and zipcode are updated
        await waitFor(() => {
            expect(screen.getByLabelText(/Email/i)).toHaveValue('new@example.com');
            expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('987-654-3210');
            expect(screen.getByLabelText(/Zipcode/i)).toHaveValue('12345');

            // Validate that the password fields retain their input values
            const passwordInput = screen.getByLabelText(/New Password/i);
            const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
            expect(passwordInput).toHaveValue('1234567');
            expect(confirmPasswordInput).toHaveValue('1234567');
        });

        // Verify that alert was called with the correct message
        expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
    });
});



