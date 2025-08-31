import React from 'react';

function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword, loading, errors, inputClasses }) {
    return (
        <form onSubmit={onLogin} className="flex-grow flex flex-col gap-4">
            {errors.non_field_errors && <p className="text-red-500 text-center text-sm">{errors.non_field_errors}</p>}
            
            <label className="flex flex-col gap-1 text-sm font-medium">
                Email
                <input className={inputClasses} name="email" type="email" required />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </label>
            
            <label className="flex flex-col gap-1 text-sm font-medium">
                Password
                <input className={inputClasses} name="password" type="password" required />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </label>

            <button type="submit" disabled={loading} className="w-full bg-spotify-green text-black font-bold rounded-full py-3">{loading ? 'Logging in...' : 'Log In'}</button>
            
            <div className="text-center text-sm">
                <button type="button" onClick={onForgotPassword} className="font-bold text-spotify-green hover:underline bg-transparent p-0">Forgot Password?</button>
            </div>
            
            <p className="mt-4 text-center text-sm">
                Don't have an account?
                <button type="button" onClick={onSwitchToRegister} className="font-bold text-spotify-green hover:underline ml-2 bg-transparent p-0">Sign up</button>
            </p>
        </form>
    );
}
export default LoginForm;