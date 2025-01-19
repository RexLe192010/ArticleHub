// src/components/Auth/Registration/RegistrationService.js
export const registerUser = async (userData) => {
    console.log('RegistrationService.registerUser: ', userData);
    // the local backend url is http://localhost:5000
    const response = await fetch('https://articlehub-4d0595467f43.herokuapp.com/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
    });
    // the backend will return the user data if registration is successful
    // convert the response to json and send it back to the registration component
    return response.json();
};

