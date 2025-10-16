import React, { useState } from 'react';

export default function SignUpPage({ onSignInClick }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Temporary Bypass Logic
    console.log("Sign-up attempt (backend call commented out):", { name, email, password });








    // Delete following after add signUP Api
    
    setTimeout(() => {
        setSuccess('Account created successfully! You can now log in.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }, 500);







    // Uncomment following after add signup api


    // const handleSubmit = async (e) => { // Change to async function
    //     e.preventDefault();
    //     setError('');
    //     setSuccess('');

    //     if (password !== confirmPassword) {
    //         setError('Passwords do not match.');
    //         return;
    //     }

    //     try {
    //         const response = await fetch('YOUR_BACKEND_API_URL/signup', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ name, email, password }),
    //         });

    //         if (response.ok) {
    //             setSuccess('Account created successfully! You can now log in.');
    //             setName('');
    //             setEmail('');
    //             setPassword('');
    //             setConfirmPassword('');
    //         } else {
    //             const data = await response.json();
    //             setError(data.message || 'Sign up failed. Please try again.');
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
        <div className="hidden md:flex flex-1 items-center justify-center p-8 bg-green-500">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-2">Join With Us</h2>
            <p className="text-lg">Get Started in Minutes.</p>
            {/* 

[Image of a person analyzing data]
 */}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm font-semibold">{success}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <button onClick={onSignInClick} className="text-blue-600 font-semibold hover:underline transition-all">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}