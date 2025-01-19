import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const backendUrl = 'https://articlehub-4d0595467f43.herokuapp.com';
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // call backend API to login
            const response = await fetch(backendUrl + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                // login success, redirect to /Main with username in state
                navigate('/Main', { state: { username: data.username } });
            } else {
                // login failed, show error message
                console.error('Login failed:', data.error);
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        }
    };

    // handle sign in with google
    const handleGoogle = () => {
        window.location.href = 'https://articlehub-4d0595467f43.herokuapp.com/auth/google';
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin}>
                <h2>Login</h2>
                <label htmlFor="username">Account Name:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <br />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <br />

                <button type="submit">Login</button>
            </form>
            <button onClick={handleGoogle}>Sign in with Google</button>
        </div>
    );
};

export default Login;

