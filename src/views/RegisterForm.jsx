import React from 'react';

function RegisterForm({ onRegister, onSwitchToLogin, loading, errors, inputClasses }) {
    return (
        <form onSubmit={onRegister} className="flex-grow flex flex-col gap-4">
            {errors.non_field_errors && <p className="text-stateerror text-center text-sm">{errors.non_field_errors}</p>}

            <label className="flex flex-col gap-1 text-sm font-medium">
                Email
                <input className={inputClasses} name="email" type="email" required />
                {errors.email && <p className="text-stateerror text-xs mt-1">{errors.email}</p>}
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
                Username
                <input className={inputClasses} name="username" type="text" required />
                {errors.username && <p className="text-stateerror text-xs mt-1">{errors.username}</p>}
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
                Password
                <input className={inputClasses} name="password1" type="password" required />
                {errors.password1 && <p className="text-stateerror text-xs mt-1">{errors.password1}</p>}
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
                Confirm Password
                <input className={inputClasses} name="password2" type="password" required />
                {errors.password2 && <p className="text-stateerror text-xs mt-1">{errors.password2}</p>}
            </label>

            <button type="submit" disabled={loading} className="w-full bg-spotify-green text-black font-bold rounded-full py-3">Sign Up</button>
            
            <p className="mt-4 text-center text-sm">
                Already have an account?
                <button type="button" onClick={onSwitchToLogin} className="font-bold text-spotify-green hover:underline ml-2 bg-transparent p-0">Log in</button>
            </p>
        </form>
    );
}
export default RegisterForm;