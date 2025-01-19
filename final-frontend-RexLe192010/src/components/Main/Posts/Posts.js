import React, { useState } from 'react';
import './Posts.css';

const Posts = ({ articles, handleUpdate }) => {
    const [newComment, setNewComment] = useState({}); // Holds new comment text for each article
    const [editingText, setEditingText] = useState({}); // Holds editing text for each article
    const [editMode, setEditMode] = useState({}); // Tracks edit mode for each article
    const [editingComment, setEditingComment] = useState({}); // Tracks which comment is being edited
    const [loading, setLoading] = useState(false); // Loading state for async actions
    const [error, setError] = useState(null); // Error state
    const backendUrl = 'https://articlehub-4d0595467f43.herokuapp.com';

    // Helper function to handle API requests
    const apiRequest = async (url, method, body) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(backendUrl + url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to perform action');
            return await response.json();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (articleId) => {
        const text = newComment[articleId];
        if (!text) {
            alert('Comment text cannot be empty.');
            return;
        }

        const data = await apiRequest(`/articles/${articleId}`, 'PUT', {
            text,
            commentId: -1, // Indicate it's a new comment
        });

        if (data) {
            // the data will contain the updated article with the new comment
            const updatedArticle = data.articles.find((article) => article.pid === articleId);
            handleUpdate(updatedArticle); // Update the articles state in Main component
            setNewComment((prev) => ({ ...prev, [articleId]: '' }));
        }
    };

    const handleEditArticle = async (articleId) => {
        const text = editingText[articleId];
        if (!text) {
            alert('Article text cannot be empty.');
            return;
        }

        const data = await apiRequest(`/articles/${articleId}`, 'PUT', { text });

        if (data) {
            // the data will contain the updated article
            const updatedArticle = data.articles.find((article) => article.pid === articleId);
            handleUpdate(updatedArticle); // Update the articles state in Main component
            setEditMode((prev) => ({ ...prev, [articleId]: false }));
        }
    };

    const handleEditComment = async (articleId, commentId) => {
        const text = editingComment[commentId];
        if (!text) {
            alert('Comment text cannot be empty.');
            return;
        }

        const data = await apiRequest(`/articles/${articleId}`, 'PUT', { text, commentId });

        if (data) {
            // the data will contain the updated article with the edited comment
            const updatedArticle = data.articles.find((article) => article.pid === articleId);
            handleUpdate(updatedArticle); // Update the articles state in Main component
            setEditingComment((prev) => ({ ...prev, [commentId]: '' }));
        }
    };

    return (
        <div className="posts-container">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {articles.length > 0 ? (
                articles.map((article) => (
                    <div key={article.pid} className="post">
                        <h3>{article.author}</h3>
                        {editMode[article.pid] ? (
                            <textarea
                                value={editingText[article.pid] || article.text}
                                onChange={(e) =>
                                    setEditingText((prev) => ({
                                        ...prev,
                                        [article.pid]: e.target.value,
                                    }))
                                }
                            />
                        ) : (
                            <p>{article.text}</p>
                        )}

                        <p>Date: {new Date(article.date).toDateString()}</p>

                        <button
                            className="edit-button"
                            onClick={() =>
                                setEditMode((prev) => ({
                                    ...prev,
                                    [article.pid]: !prev[article.pid],
                                }))
                            }
                        >
                            {editMode[article.pid] ? 'Cancel' : 'Edit'}
                        </button>
                        {editMode[article.pid] && (
                            <button
                                className="save-button"
                                onClick={() => handleEditArticle(article.pid)}
                            >
                                Save
                            </button>
                        )}

                        <div className="comments-section">
                            <h4>Comments:</h4>
                            {article.comments && article.comments.length > 0 ? (
                                article.comments.map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <p>
                                            <strong>{comment.author}:</strong>
                                            {editingComment[comment.id] ? (
                                                <textarea
                                                    value={editingComment[comment.id] || comment.text}
                                                    onChange={(e) =>
                                                        setEditingComment((prev) => ({
                                                            ...prev,
                                                            [comment.id]: e.target.value,
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                comment.text
                                            )}
                                        </p>
                                        {editingComment[comment.id] ? (
                                            <button
                                                className="save-comment-button"
                                                onClick={() => handleEditComment(article.pid, comment.id)}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                className="edit-comment-button"
                                                onClick={() =>
                                                    setEditingComment((prev) => ({
                                                        ...prev,
                                                        [comment.id]: comment.text,
                                                    }))
                                                }
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No comments yet.</p>
                            )}
                            <div className="add-comment-container">
                                <textarea
                                    value={newComment[article.pid] || ''}
                                    onChange={(e) =>
                                        setNewComment((prev) => ({
                                            ...prev,
                                            [article.pid]: e.target.value,
                                        }))
                                    }
                                    placeholder="Add a comment"
                                    className="comment-input"
                                />
                                <button
                                    className="add-comment-button"
                                    onClick={() => handleAddComment(article.pid)}
                                >
                                    Add Comment
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>No articles available.</p>
            )}
        </div>
    );
};

export default Posts;









