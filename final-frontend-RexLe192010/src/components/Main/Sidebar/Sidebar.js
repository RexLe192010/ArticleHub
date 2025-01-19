import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { fetchUserAvatar, fetchUserHeadline } from '../Main';

const Sidebar = ({ currentUser }) => {
    const [following, setFollowing] = useState([]);
    const [followUsername, setFollowUsername] = useState('');
    const [error, setError] = useState('');
    // maintain an object to store the user's avatar and headline
    const [userDetails, setUserDetails] = useState({});
    const backendUrl = 'https://articlehub-4d0595467f43.herokuapp.com';

    useEffect(() => {
        // fetch the following list for the current logged in user
        const fetchFollowing = async () => {
            try {
                const response = await fetch(`${backendUrl}/following/${currentUser}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                const data = await response.json();
                if (response.ok) {
                    console.log('fetchFollowing success:', data.following);
                    setFollowing(data.following);
                    fetchUserDetails(data.following);
                } else {
                    console.error('Failed to fetch following:', data.error);
                    setError(data.error);
                }
            } catch (error) {
                console.error('Error fetching following:', error);
                setError('Error fetching following list.');
            }
        };

        if (currentUser) {
            fetchFollowing();
        }
    }, [currentUser]);

    const fetchUserDetails = async (users) => {
        const details = {};
        for (const user of users) {
            const avatar = await fetchUserAvatar(user);
            const headline = await fetchUserHeadline(user);
            details[user] = { avatar: avatar, headline: headline };
        }
        setUserDetails(details);
    };

    const handleFollow = async (e) => {
        e.preventDefault();
        const username = followUsername.trim();
        if (!username) {
            setError('Please enter a username.');
            return;
        }

        if (username === currentUser) {
            setError('You cannot follow yourself.');
            return;
        }

        if (following.includes(username)) {
            setError('You are already following this user.');
            return;
        }

        console.log('try to Follow:', username);

        // Clear previous error message
        setError('');

        // call backend API to follow the user
        try {
            const response = await fetch(`${backendUrl}/following/${username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                console.log('follow data:', data.following);
                setFollowing(data.following);
            } else {
                setError(error);
            }
        } catch (error) {
            console.error('Error following user:', error);
            setError('Failed to follow user. Please try again.');
        }
        setFollowUsername('');
    };

    const handleUnfollow = async (username) => {
        // Clear previous error message
        setError('');

        try {
            const response = await fetch(`${backendUrl}/following/${username}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setFollowing(data.following);
            } else {
                console.error('Failed to unfollow user:', data.error);
                setError(data.error);
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
            setError('Failed to unfollow user. Please try again.');
        }
    };

    return (
        <div className="sidebar">
            <h3>Following</h3>
            <form className="follow-form" onSubmit={handleFollow}>
                <input
                    placeholder="Enter Username..."
                    value={followUsername}
                    onChange={(e) => setFollowUsername(e.target.value)}
                    className="follow-input"
                />
                <button type="submit" className="follow-button">Follow</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {following.map(user => (
                <div key={user} className="sidebar-user">
                    <img
                        src={userDetails[user]?.avatar}
                        alt={user.name}
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <p className="username">{user}</p>
                        <p className="user-headline">{userDetails[user]?.headline || '66666666666666666666666666'}</p>
                    </div>
                    <button className="unfollow-button" onClick={() => handleUnfollow(user)}>Unfollow</button>
                </div>
            ))}
        </div>
    );
};

export default Sidebar;