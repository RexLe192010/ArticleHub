import React, { useState } from 'react';
import { registerUser } from './RegistrationService';
import './Registration.css';

const Registration = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setAccountName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [zipcode, setZipcode] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation logic
        if (!isValidAccountName(username)) {
            alert("Invalid account name. Account name can only contain letters and numbers, and must start with a letter.");
            return;
        }

        if (!isValidPhoneNumber(phone)) {
            alert("Invalid phone number. Phone number must be in the format XXX-XXX-XXXX.");
            return;
        }

        if (!isValidEmail(email)) {
            alert("Invalid email address.");
            return;
        }

        if (!isOver18YearsOld(dob)) {
            alert("You must be 18 years or older to register.");
            return;
        }

        if (!isValidZipcode(zipcode)) {
            alert("Invalid zipcode. Zipcode must be 5 digits.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Create user data object
        const userData = {
            username,
            email,
            phone,
            dob,
            zipcode,
            password: newPassword,
        };

        try {
            // Call the registration service (make the request to your backend)
            const registrationResponse = await registerUser(userData);
            console.log('Registration response:', registrationResponse);

            // registrationService will return a JSON form of the response, check the result
            if (registrationResponse.result === 'success') {
                // // User registration was successful, pass the user object to the Main component
                // const newUser = registrationResponse.username;
                // // Navigate to Main and pass the user object
                // navigate('/Main', { state: { username: newUser } });

                // do not navigate to Main, just show an alert, and remind the user to login
                alert('Registration successful! You can now log in with you username and password.');
            } else {
                // Registration failed
                alert('Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Registration failed due to an unexpected error.');
        }
    };

    const handleReset = () => {
        setAccountName('');
        setEmail('');
        setPhone('');
        setDob('');
        setZipcode('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // Validation functions
    const isValidAccountName = (name) => /^[A-Za-z][A-Za-z0-9]*$/.test(name);
    const isValidPhoneNumber = (phone) => /^\d{3}-\d{3}-\d{4}$/.test(phone);
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isOver18YearsOld = (dob) => {
        const currentDate = new Date();
        const birthDate = new Date(dob);
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = currentDate.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    };
    const isValidZipcode = (zipcode) => /^\d{5}$/.test(zipcode);

    return (
        <div className="registration-container">
            <form onSubmit={handleRegister}>
                <h2>Register</h2>
                <label htmlFor="accountName">Account Name:</label>
                <input
                    type="text"
                    id="accountName"
                    value={username}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                />
                <br />

                <label htmlFor="email">Email Address:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <br />

                <label htmlFor="phone">Phone Number:</label>
                <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="XXX-XXX-XXXX"
                    required
                />
                <br />

                <label htmlFor="dateOfBirth">Date of Birth:</label>
                <input
                    type="date"
                    id="dateOfBirth"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                />
                <br />

                <label htmlFor="zipcode">Zipcode:</label>
                <input
                    type="text"
                    id="zipcode"
                    value={zipcode}
                    placeholder='XXXXX'
                    onChange={(e) => setZipcode(e.target.value)}
                    required
                />
                <br />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <br />

                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <br />

                <button type="submit">Submit</button>
                <button type="reset" onClick={handleReset}>Clear</button>
            </form>
        </div>
    );
};

export default Registration;


