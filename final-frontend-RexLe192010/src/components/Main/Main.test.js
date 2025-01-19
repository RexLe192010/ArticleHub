// src/components/__tests__/Main.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Main from './Main';
import '@testing-library/jest-dom/extend-expect';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

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
        geo: { lat: '-37.3159', lng: '81.1496' }
    },
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net', bs: 'harness real-time e-markets' }
};

const mockArticles = [
    { id: 101, username: 1, title: 'Article 1', body: 'Content of Article 1' },
    { id: 102, username: 2, title: 'Article 2', body: 'Content of Article 2' },
    { id: 103, username: 3, title: 'Article 3', body: 'Content of Article 3' },
    { id: 104, username: 1, title: 'Article 4', body: 'Content of Article 4' }
];

const mockUsers = [
    mockUser,
    {
        id: 2,
        name: 'Ervin Howell',
        username: 'Antonette',
        email: 'Shanna@melissa.tv',
        address: { street: 'Victor Plains', suite: 'Suite 879', city: 'Wisokyburgh', zipcode: '90566-7771', geo: { lat: '-43.9509', lng: '-34.4618' } },
        phone: '010-692-6593 x09125',
        website: 'anastasia.net',
        company: { name: 'Deckow-Crist', catchPhrase: 'Proactive didactic contingency', bs: 'synergize scalable supply-chains' }
    }
];

const renderWithRouter = (ui, { route = '/Main', state = { user: mockUser } } = {}) => {
    window.history.pushState(state, 'Test page', route);

    return render(
        <MemoryRouter initialEntries={[route]}>
            {ui}
        </MemoryRouter>
    );
};

describe('Main Component Tests', () => {
    beforeEach(() => {
        global.fetch = jest.fn((url) => {
            if (url.includes('users')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockUsers),
                });
            }
            if (url.includes('posts')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockArticles),
                });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch subset of articles for current logged-in user given search keyword (posts state is filtered)', async () => {
        renderWithRouter(<Main />);


        // Simulate search operation
        const searchInput = screen.getByPlaceholderText('Search articles...');
        fireEvent.change(searchInput, { target: { value: 'Article 2' } });

        // Wait for filtered results to appear
        await waitFor(() => {
            // Ensure unrelated articles are filtered out
            expect(screen.queryByText('Article 1')).not.toBeInTheDocument();
            expect(screen.queryByText('Article 3')).not.toBeInTheDocument();
            expect(screen.queryByText('Article 4')).not.toBeInTheDocument();
        });
    });

    test('should add a new article at the top of the list', async () => {
        renderWithRouter(<Main />);

        const newArticleTitle = 'New Article Title';
        const newArticleContent = 'New Article Content';

        const titleInput = screen.getByPlaceholderText('Article Title');
        const contentInput = screen.getByPlaceholderText('Article Body');
        const addButton = screen.getByText('Add Article');

        fireEvent.change(titleInput, { target: { value: newArticleTitle } });
        fireEvent.change(contentInput, { target: { value: newArticleContent } });
        fireEvent.click(addButton);

        await waitFor(() => {
            const newArticle = screen.getByText(newArticleTitle);
            expect(newArticle).toBeInTheDocument();
            // Check the content of the newly added article
            const newArticleContainer = newArticle.closest('.post');
            expect(newArticleContainer).toHaveTextContent(newArticleContent);
        });
    });
});
