import React, { useState } from 'react';

export default function LoginPage({ onLogin, onSignUpClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // --- Temporary Bypass Logic ---
    // For now, any login attempt will succeed instantly.
    console.log("Login attempt (backend call commented out):", { email, password });







    
    // Delete following after add login api

    
    // Simulate a successful login without making an API call
    setTimeout(() => {
        onLogin();
    }, 500); // Add a small delay to simulate a network request





    // Delete following after add login Api
    

    // const handleSubmit = async (e) => { // Change to async function
    //     e.preventDefault();
    //     setError('');

    //     try {
    //         const response = await fetch('YOUR_BACKEND_API_URL/login', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ email, password }),
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             // Store the JWT token for future authenticated requests
    //             localStorage.setItem('token', data.token); 
    //             onLogin(data.name);
    //         } else {
    //             const data = await response.json();
    //             setError(data.message || 'Login failed. Please check your credentials.');
    //         }
    //     } catch (err) {
    //         setError('An error occurred. Please try again later.');
    //     }
    // };




    
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="flex bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full">
        {/* Left Side: Visuals */}
        <div className="hidden md:flex flex-1 items-center justify-center p-8 bg-blue-500">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-lg">We're glad to see you again.</p>
            {/* 

[Image of a data illustration]
 */}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Login
            </button>
          </form>
          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <button onClick={onSignUpClick} className="text-blue-600 font-semibold hover:underline transition-all">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}