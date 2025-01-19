// Auth.js
import React from 'react';
import './Auth.css';
import Registration from './Registration/Registration';
import Login from './Login/Login';

function Auth() {

    return (
        <div className="auth-container">
            <Registration />
            <Login />
        </div>
    );
}

export default Auth;
