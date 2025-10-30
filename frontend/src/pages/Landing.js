import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Tic-Tac-Toe
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Challenge yourself against AI or play with a friend!
          </p>
          
          {isAuthenticated ? (
            <div className="space-x-4">
              <Link
                to="/game"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg inline-block transition duration-300"
              >
                Play Now
              </Link>
              <Link
                to="/scoreboard"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg inline-block transition duration-300"
              >
                View Scores
              </Link>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg inline-block transition duration-300"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg inline-block transition duration-300"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg inline-block transition duration-300"
              >
                Login
              </Link>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎮 Game Modes
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Play against AI or challenge a friend on the same device
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                📊 Track Stats
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your wins, losses, and draws over time
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                👑 Leaderboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Compete with other players and climb the rankings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;


