require('isomorphic-fetch');

const url = path => `https://rexlehw6-83a19fcf7b5d.herokuapp.com${path}`;
let cookie;
let articleId;

describe('Validate articles functionality', () => {
    beforeAll(async () => {
        // Step 1: Register a new user
        const registerRes = await fetch(url('/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testUser3',
                password: 'testPassword3',
                email: 'test3@example.com',
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
                username: 'testUser3',
                password: 'testPassword3',
            }),
        });
        expect(loginRes.status).toBe(200);

        // Store the session cookie for later use
        cookie = loginRes.headers.get('set-cookie');
        expect(cookie).toBeTruthy();
    });

    // Helper function to create an article and return its ID
    const createArticle = async text => {
        const postRes = await fetch(url('/article'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                cookie,
            },
            body: JSON.stringify({ text }),
        });
        expect(postRes.status).toBe(200);
        const postBody = await postRes.json();
        expect(postBody.articles[0].text).toBe(text);
        expect(postBody.articles[0].author).toBe('testUser3');
        return postBody.articles[0].pid;
    };

    beforeEach(async () => {
        // Create a new article before each test
        articleId = await createArticle('Initial text for the article');
        expect(articleId).toBeDefined();
    });

    // Test for updating article text
    it('should update the text of an article', async () => {
        const putRes = await fetch(url(`/articles/${articleId}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                cookie,
            },
            body: JSON.stringify({
                text: 'Updated text for the article',
            }),
        });

        expect(putRes.status).toBe(200);
        const putBody = await putRes.json();
        expect(putBody.articles[0].pid).toBe(articleId);
        expect(putBody.articles[0].author).toBe('testUser3');
        expect(putBody.articles[0].text).toBe('Updated text for the article');
    });

    // Test for adding a comment to the article
    it('should add a comment to the article', async () => {
        const putRes = await fetch(url(`/articles/${articleId}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                cookie,
            },
            body: JSON.stringify({
                commentId: -1,
                text: 'This is a comment',
            }),
        });

        expect(putRes.status).toBe(200);
        const putBody = await putRes.json();
        expect(putBody.articles[0].comments[0].id).toBe(1);
        expect(putBody.articles[0].comments[0].author).toBe('testUser3');
        expect(putBody.articles[0].comments[0].text).toBe('This is a comment');
    });

    // Test that an article can be fetched by ID for logged-in user
    it('should fetch the article by ID', async () => {
        const getRes = await fetch(url(`/articles/${articleId}`), {
            method: 'GET',
            headers: { cookie },
        });

        expect(getRes.status).toBe(200);
        const getBody = await getRes.json();
        expect(getBody.articles[0].author).toBe('testUser3');
        expect(getBody.articles[0].text).toBe('Initial text for the article');
        expect(getBody.articles[0].pid).toBe(articleId);
    });

    // Test that all articles can be fetched for logged-in user
    it('should fetch all articles by the logged-in user', async () => {
        const getRes = await fetch(url(`/articles/testUser3`), {
            method: 'GET',
            headers: { cookie },
        });

        expect(getRes.status).toBe(200);
        const getBody = await getRes.json();
        expect(getBody.articles[0].author).toBe('testUser3');
        expect(getBody.articles[0].text).toBe('Initial text for the article');
    });

    // Test that an invalid article ID returns 404 for logged-in user
    it('should return 404 for a non-existing article', async () => {
        const getRes = await fetch(url('/articles/99999'), {
            method: 'GET',
            headers: { cookie },
        });

        expect(getRes.status).toBe(404);
    });

    // Test that an article cannot be created without text
    it('should not create an article without text', async () => {
        const postRes = await fetch(url('/article'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                cookie,
            },
            body: JSON.stringify({}),
        });

        expect(postRes.status).toBe(400);
    });
});