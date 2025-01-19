// src/components/__tests__/Posts.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Posts from './Posts';
import '@testing-library/jest-dom/extend-expect';

// Mock articles list
const mockArticles = [
    { id: 101, userId: 1, title: 'Article 1', body: 'Content of Article 1' },
    { id: 102, userId: 2, title: 'Article 2', body: 'Content of Article 2' },
    { id: 103, userId: 3, title: 'Article 3', body: 'Content of Article 3' },
    { id: 104, userId: 1, title: 'Article 4', body: 'Content of Article 4' }, // mockUser's article
];

// Mock users list including mockUser
const mockUsers = [
    {
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
    },
    {
        id: 2,
        name: 'Ervin Howell',
        username: 'Antonette',
        email: 'Shanna@melissa.tv',
        address: {
            street: 'Victor Plains',
            suite: 'Suite 879',
            city: 'Wisokyburgh',
            zipcode: '90566-7771',
            geo: {
                lat: '-43.9509',
                lng: '-34.4618'
            }
        },
        phone: '010-692-6593 x09125',
        website: 'anastasia.net',
        company: {
            name: 'Deckow-Crist',
            catchPhrase: 'Proactive didactic contingency',
            bs: 'synergize scalable supply-chains'
        }
    }
];

// Mock comments list
const mockComments = [
    { postId: 101, id: 1, name: 'Commenter 1', body: 'Comment 1' },
    { postId: 101, id: 2, name: 'Commenter 2', body: 'Comment 2' },
    { postId: 102, id: 3, name: 'Commenter 3', body: 'Comment 3' },
];

describe('Posts Component Tests', () => {

    beforeEach(() => {
        // Mock fetch API response for comments
        global.fetch = jest.fn((url) => {
            if (url.includes('comments')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockComments.filter(comment => comment.postId === parseInt(url.split('=')[1]))),
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            });
        });

        // Clear mocks before each test
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch all articles for current logged in user (posts state is set)', async () => {
        render(<Posts articles={mockArticles} users={mockUsers} />);

        // Wait for all articles to render
        await waitFor(() => {
            mockArticles.forEach(article => {
                expect(screen.getByText(article.title)).toBeInTheDocument();
            });
        });

        // Print the current virtual DOM to the console for debugging
        screen.debug();
    });

    test('should add articles when adding a follower (posts state is larger)', async () => {
        const newArticle = { id: 105, userId: 3, title: 'Article 5', body: 'Content of Article 5' };
        const updatedArticles = [...mockArticles, newArticle];

        render(<Posts articles={updatedArticles} users={mockUsers} />);

        // Wait for all articles to render
        await waitFor(() => {
            updatedArticles.forEach(article => {
                expect(screen.getByText(article.title)).toBeInTheDocument();
            });
        });

        // Print the current virtual DOM to the console for debugging
        screen.debug();
    });

    test('should remove articles when removing a follower (posts state is smaller)', async () => {
        const updatedArticles = mockArticles.filter(article => article.userId !== 2);

        render(<Posts articles={updatedArticles} users={mockUsers} />);

        // Wait for all articles to render
        await waitFor(() => {
            updatedArticles.forEach(article => {
                expect(screen.getByText(article.title)).toBeInTheDocument();
            });
        });

        // Verify the removed article is not displayed
        await waitFor(() => {
            expect(screen.queryByText('Article 2')).not.toBeInTheDocument();
        });

        // Print the current virtual DOM to the console for debugging
        screen.debug();
    });
});