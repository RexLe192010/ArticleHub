import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Posts from './Posts/Posts';
import './Main.css';

const backendUrl = 'https://articlehub-4d0595467f43.herokuapp.com';
// a helper function to fetch the user's headline
export const fetchUserHeadline = async (username) => {
    try {
        // console.log('fetchUserHeadline', username);
        const response = await fetch(`${backendUrl}/headline/${username || ''}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
            // console.log('fetchUserHeadline success:', data.headline);
            return data.headline;
        } else {
            console.error('Failed to fetch headline:', data.error);
            return ''; // handle error by returning an empty string
        }
    } catch (error) {
        console.error('Error fetching headline:', error);
    }
};

// a helper function to fetch the user's avatar
export const fetchUserAvatar = async (username) => {
    try {
        // console.log('fetchUserAvatar', username);
        const response = await fetch(`${backendUrl}/avatar/${username}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
            // console.log('fetchUserAvatar success:', data.avatar);
            return data.avatar;
        } else {
            console.error('Failed to fetch avatar:', data.error);
            // handle error by returning a default avatar
            return 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
        }
    } catch (error) {
        console.error('Error fetching avatar:', error);
    }
};

const Main = () => {
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [headline, setHeadline] = useState('');
    const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user info
    const [isEditingHeadline, setIsEditingHeadline] = useState(false);
    const [tempHeadline, setTempHeadline] = useState('');
    const [newArticleBody, setNewArticleBody] = useState('');
    const [isNewArticle, setIsNewArticle] = useState(false);
    const [avatar, setAvatar] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { username } = location.state || { username: '' }; // Get username from location state
    const usernameFromURL = new URLSearchParams(location.search).get('username');

    // Redirect if user data is missing
    useEffect(() => {
        if (!username) {
            if (usernameFromURL) {
                navigate('/Main', { state: { username: usernameFromURL } });
            } else {
                navigate('/');
            }
        } else {
            setLoggedInUser(username);
        }
    }, [username, usernameFromURL, navigate]);

    // Fetch user-related data
    useEffect(() => {
        if (loggedInUser) {
            fetchUserHeadline(loggedInUser).then((data) => {
                setHeadline(data);
            });
            fetchArticles();
            fetchUserAvatar(loggedInUser).then((data) => {
                setAvatar(data);
            });
        }
    }, [loggedInUser, isNewArticle, articles]);

    // Fetch Articles
    const fetchArticles = async () => {
        try {
            const response = await fetch(`${backendUrl}/articles/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setArticles(data.articles);
            } else {
                console.error('Failed to fetch articles:', data.error);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    // Edit Headline Handlers
    const handleHeadlineEdit = () => {
        setTempHeadline(headline);
        setIsEditingHeadline(true);
    };

    const handleHeadlineSave = async () => {
        if (tempHeadline.trim() === '') {
            alert('Headline cannot be empty.');
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/headline`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ headline: tempHeadline.trim() }),
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setHeadline(tempHeadline.trim());
                setIsEditingHeadline(false);
            } else {
                console.error('Failed to save headline:', data.error);
            }
        } catch (error) {
            console.error('Error saving headline:', error);
        }
    };

    const handleHeadlineCancel = () => {
        setIsEditingHeadline(false);
    };

    // Add New Article
    const handleAddArticle = async () => {
        if (newArticleBody.trim() === '') {
            alert('Article body cannot be empty.');
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/article`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newArticleBody.trim() }),
                credentials: 'include',
            });
            if (response.ok) {
                setNewArticleBody('');
                setIsNewArticle(true);
            } else {
                console.error('Failed to add article.');
            }
        } catch (error) {
            console.error('Error adding article:', error);
        } finally {
            setIsNewArticle(false);
        }
    };

    // Filter Articles by Search Term
    const filteredArticles = useMemo(() => {
        return articles.filter(article =>
            article.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [articles, searchTerm]);

    // Logout
    const handleLogout = async () => {
        // call backend API to logout
        try {
            const response = await fetch(`${backendUrl}/logout`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (response.ok) {
                // logout success
                setLoggedInUser(null);
                navigate('/');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('An error occurred. Please try again.');
        }
    };

    // the handler to handle updates from Posts
    const handleArticleUpdate = (updatedArticle) => {
        setArticles((prevArticles) =>
            prevArticles.map((article) =>
                article.pid === updatedArticle.pid ? updatedArticle : article
            )
        );
    };

    return (
        <div className="main-view">
            <div className="header">
                <button className="profile-button" onClick={() => navigate('/Profile', { state: { username: loggedInUser } })}>
                    Profile
                </button>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <div className="content-area">
                {loggedInUser ? (
                    <>
                        <div className="user-info">
                            <img src={avatar} alt="User Avatar" className="user-avatar" />
                            <h1>{loggedInUser}</h1>
                            <div className="headline-section">
                                {isEditingHeadline ? (
                                    <>
                                        <input
                                            type="text"
                                            value={tempHeadline}
                                            onChange={(e) => setTempHeadline(e.target.value)}
                                        />
                                        <button onClick={handleHeadlineSave} className='save-headline-button'>Save</button>
                                        <button onClick={handleHeadlineCancel} className='cancel-headline-button'>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <h2>{headline}</h2>
                                        <button onClick={handleHeadlineEdit} className='edit-headline-button'>Edit</button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="articles-container">
                            <div className="add-article-section">
                                <textarea
                                    placeholder="Article Body"
                                    value={newArticleBody}
                                    onChange={(e) => setNewArticleBody(e.target.value)}
                                />
                                <button onClick={handleAddArticle} className='add-article-button'>Add Article</button>
                            </div>
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Posts articles={filteredArticles} handleUpdate={handleArticleUpdate} />
                        </div>
                    </>
                ) : (
                    <div>Loading user data...</div>
                )}
                <Sidebar currentUser={loggedInUser} />
            </div>
        </div>
    );
};

export default Main;

