import React, { useState } from 'react';
import * as api from '../services/api';
import Header from '../components/Header';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import PasswordResetForm from './PasswordResetForm';
import { inputClasses } from '../style';

function AuthView({ onLoginSuccess, setView }) {
    const [authSubView, setAuthSubView] = useState('login');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const viewMap = { login: "Login", register: "Register", reset: "Reset Password" };

    const handleApiCall = async (apiFunction, formData, successMessage) => {
        setErrors({});
        setMessage('');
        setLoading(true);
        try {
            await apiFunction(formData);
            setMessage(successMessage);
            return true;
        } catch (err) {
            try {
                const parsedError = JSON.parse(err.message);
                setErrors(parsedError);
            } catch (e) {
                setErrors({ non_field_errors: [err.message] });
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        const success = await handleApiCall(api.login, formData, 'Login successful!');
        if (success) onLoginSuccess();
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        if (formData.password !== formData.password2) {
            setErrors({ password2: ["Passwords do not match."] });
            return;
        }
        const success = await handleApiCall(api.register, formData, 'Registration successful! Please check your email to verify your account.');
        if (success) setAuthSubView('login');
    };

    const handleResetRequest = async (e) => {
        e.preventDefault();
        const { email } = Object.fromEntries(new FormData(e.target));
        await handleApiCall(() => api.passwordReset(email), null, 'Password reset email sent! Check your terminal for the link.');
    };

    const renderForm = () => {
        switch (authSubView) {
            case 'register':
                return <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setAuthSubView('login')} loading={loading} errors={errors} inputClasses={inputClasses} />;
            case 'reset':
                return <PasswordResetForm onResetRequest={handleResetRequest} onBackToLogin={() => setAuthSubView('login')} loading={loading} errors={errors} inputClasses={inputClasses} />;
            case 'login':
            default:
                return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setAuthSubView('register')} onForgotPassword={() => setAuthSubView('reset')} loading={loading} errors={errors} inputClasses={inputClasses} />;
        }
    };

    return (
        <div className="p-3 pb-0 bg-custom-dark h-full max-h-[600px]">
            <Header title={viewMap[authSubView]} onBack={() => setView('guest')} />
            {message && <p className="text-green-500 text-center">{message}</p>}
            {renderForm()}
        </div>
    );
}
export default AuthView;