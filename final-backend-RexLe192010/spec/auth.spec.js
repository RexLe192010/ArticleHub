require('isomorphic-fetch');

const url = path => `https://rexlehw6-83a19fcf7b5d.herokuapp.com${path}`;
let cookie;

describe('Validate auth functionality', () => {
    it('should register, login, and logout the user sequentially', async () => {
        // Register a new user
        const registerRes = await fetch(url('/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'joey',
                password: 'pass',
                email: 'joey@test.com',
                dob: '2000-01-01',
                phone: '123-456-7890',
                zipcode: '12345',
            }),
        });

        expect(registerRes.status).toBe(201);
        const registerBody = await registerRes.json();
        expect(registerBody.result).toBe('success');
        expect(registerBody.username).toBe('joey');

        // Step 2: Login with the registered user
        const loginRes = await fetch(url('/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'joey',
                password: 'pass',
            }),
        });

        expect(loginRes.status).toBe(200);
        const loginBody = await loginRes.json();
        expect(loginBody.result).toBe('success');
        expect(loginBody.username).toBe('joey');

        cookie = loginRes.headers.get('set-cookie');
        expect(cookie).toBeTruthy();

        // Step 3: Logout the logged-in user
        const logoutRes = await fetch(url('/logout'), {
            method: 'PUT',
            headers: { cookie },
        });

        expect(logoutRes.status).toBe(200);
        const logoutBody = await logoutRes.json();
        expect(logoutBody.result).toBe('Logged out');
    });
});

