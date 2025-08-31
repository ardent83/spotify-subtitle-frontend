import React from 'react';

function PasswordResetForm({ onResetRequest, onBackToLogin, loading, errors, inputClasses }) {
    return (
        <form onSubmit={onResetRequest} className="flex-grow flex flex-col gap-4">
            {errors.non_field_errors && <p className="text-red-500 text-center text-sm">{errors.non_field_errors}</p>}
            
            <label className="flex flex-col gap-1 text-sm font-medium">
                Email
                <input className={inputClasses} name="email" type="email" placeholder="Enter your email" required />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </label>

            <p className="text-xs text-center text-zinc-400">We'll send a password reset link to your email.</p>
            <button type="submit" disabled={loading} className="w-full bg-spotify-green text-black font-bold rounded-full py-3">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            
            <div className="text-center">
                <button type="button" onClick={onBackToLogin} className="font-bold text-spotify-green hover:underline bg-transparent p-0">← Back to Login</button>
            </div>
        </form>
    );
}
export default PasswordResetForm;