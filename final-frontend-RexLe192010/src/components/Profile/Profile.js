// src/components/Profile/Profile.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { username } = location.state || { username: '' }; // Get username from location state

    // Initialize state hooks unconditionally with optional chaining
    const [loggedInUser, setUsername] = useState(username);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dob, setDob] = useState(''); // Date of Birth
    const defaultAvatar = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
    const [avatar, setAvatar] = useState(defaultAvatar);
    const backendUrl = 'https://articlehub-4d0595467f43.herokuapp.com';

    // Fetch user profile information when the component mounts
    useEffect(() => {
        const fetchProfile = async (detail, username) => {
            try {
                const response = await fetch(`${backendUrl}/${detail}/${username}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                const data = await response.json();
                if (response.ok) {
                    return data[detail];
                } else {
                    console.error('Failed to fetch profile:', data.error);
                    return null;
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
        };

        const fetchAllProfileDetails = async () => {
            if (username) {
                const email = await fetchProfile('email', username);
                const phone = await fetchProfile('phone', username);
                const zipcode = await fetchProfile('zipcode', username);
                const dobMilliseconds = await fetchProfile('dob', username);
                const avatar = await fetchProfile('avatar', username);

                setEmail(email || '');
                setPhone(phone || '');
                setZipcode(zipcode || '');
                if (dobMilliseconds) {
                    const dobDate = new Date(dobMilliseconds);
                    setDob(dobDate.toISOString().split('T')[0]);
                }
                setAvatar(avatar || defaultAvatar);
            }
        };

        if (loggedInUser) {
            fetchAllProfileDetails();
        } else {
            navigate('/');
        }
    }, [loggedInUser, navigate, username]);

    const updateProfile = async (detail, value) => {
        try {
            const response = await fetch(`${backendUrl}/${detail}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [detail]: value }),
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                return data[detail];
            } else {
                console.error('Failed to update profile:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            return null;
        }
    };

    const updatePassword = async (password) => {
        try {
            const response = await fetch(`${backendUrl}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                return data.result;
            } else {
                console.error('Failed to update password:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error updating password:', error);
            return null;
        }
    };

    // Handle avatar image upload
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        console.log("file: ", file);
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                const response = await fetch(`${backendUrl}/avatar`, {
                    method: 'PUT',
                    body: formData,
                    credentials: 'include',
                });
                const data = await response.json();
                console.log("data: ", data);
                if (response.ok) {
                    setAvatar(data.avatar);
                } else {
                    console.error('Failed to upload avatar:', data.error);
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
            }
        }
    };

    // Handle general profile update
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!isValidEmail(email)) {
            alert('Invalid email address.');
            return;
        }

        const updateEmail = await updateProfile('email', email);
        console.log("updated email: ", updateEmail);
        if (!updateEmail) {
            alert('Something went wrong. Failed to update email.');
            return;
        }

        if (!isValidPhoneNumber(phone)) {
            alert('Invalid phone number. Must be XXX-XXX-XXXX.');
            return;
        }

        const updatePhone = await updateProfile('phone', phone);
        console.log("updated phone: ", updatePhone);
        if (!updatePhone) {
            alert('Something went wrong. Failed to update phone number.');
            return;
        }

        if (!isValidZipcode(zipcode)) {
            alert('Invalid zipcode. Must be 5 digits.');
            return;
        }

        const updateZipcode = await updateProfile('zipcode', zipcode);
        console.log("updated zipcode: ", updateZipcode);
        if (!updateZipcode) {
            alert('Something went wrong. Failed to update zipcode.');
            return;
        }

        if (password && password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (password) {
            const updatePasswordResult = await updatePassword(password);
            console.log("updated password: ", updatePasswordResult);
            if (!updatePasswordResult) {
                alert('Something went wrong. Failed to update password.');
                return;
            }
        }

        alert('Profile updated successfully!');
    };

    const handleReset = () => {
        setUsername(loggedInUser);
        setEmail(email);
        setPhone(phone);
        setZipcode(zipcode);
        setPassword('');
        setConfirmPassword('');
        setAvatar(avatar);
    };

    const handleGoBack = () => {
        navigate('/Main', { state: { username: username } });
    };

    const isValidPhoneNumber = (phone) => /^\d{3}-\d{3}-\d{4}$/.test(phone);
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidZipcode = (zipcode) => /^\d{5}$/.test(zipcode);

    return (
        <div className="profile-container">
            <h2>User Profile</h2>
            <img src={avatar} alt="Profile" className="profile-picture" />
            <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="profile-picture-upload"
                aria-label="Upload Profile Picture"
            />

            <form onSubmit={handleUpdate}>
                <label htmlFor="username">Username:</label>
                <input
                    id="username"
                    type="text"
                    value={loggedInUser}
                    readOnly
                    aria-readonly="true"
                />

                <label htmlFor='dob'>Date Of Birth:</label>
                <input
                    id='dob'
                    type='date'
                    value={dob}
                    readOnly
                    aria-readonly="true"
                />

                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-required="true"
                />

                <label htmlFor="phone">Phone Number:</label>
                <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="XXX-XXX-XXXX"
                    aria-required="true"
                />

                <label htmlFor="zipcode">Zipcode:</label>
                <input
                    id="zipcode"
                    type="text"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    required
                    placeholder="12345"
                    aria-required="true"
                />

                <label htmlFor="password">New Password:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="New Password"
                />

                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-label="Confirm Password"
                />

                <button type="submit" aria-label="Submit Profile Update">Submit</button>
                <button type="reset" onClick={handleReset} aria-label="Clear Profile Form">Reset</button>
            </form>

            <button onClick={handleGoBack} className="back-button" aria-label="Back to Main">Back to Main</button>
        </div>
    );
};

export default Profile;

