require('isomorphic-fetch');

const url = path => `https://rexlehw6-83a19fcf7b5d.herokuapp.com${path}`;
let cookie;

describe('Validate headline functionality', () => {
    beforeAll(async () => {
        // Step 1: Register a new user
        const registerRes = await fetch(url('/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testUser1',
                password: 'testPassword1',
                email: 'test1@example.com',
                dob: '2000-01-01',
                phone: '123-456-7890',
                zipcode: '12345',
            }),
        });
        expect(registerRes.status).toBe(201);

        // Step 2: Login with the registered user
        const loginRes = await fetch(url('/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testUser1',
                password: 'testPassword1',
            }),
        });
        expect(loginRes.status).toBe(200);

        // Store the session cookie for later use
        cookie = loginRes.headers.get('set-cookie');
        expect(cookie).toBeTruthy();
    });

    it('should update the headline of the logged-in user', async () => {
        const newHeadline = 'This is my new headline!';

        // Step 4: Update the headline
        const updateRes = await fetch(url('/headline'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                cookie,
            },
            body: JSON.stringify({ headline: newHeadline }),
        });

        expect(updateRes.status).toBe(200);
        const updateBody = await updateRes.json();

        expect(updateBody.username).toBe('testUser1');
        expect(updateBody.headline).toBe(newHeadline);

        // Verify the updated headline with a GET request
        const getRes = await fetch(url('/headline/testUser1'), {
            method: 'GET',
            headers: { cookie },
        });

        expect(getRes.status).toBe(200);
        const getBody = await getRes.json();

        expect(getBody.username).toBe('testUser1');
        expect(getBody.headline).toBe(newHeadline);
    });
});
