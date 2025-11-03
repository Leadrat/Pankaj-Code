import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const Scoreboard = () => {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/game/scores');
      setScores(response.data);
    } catch (error) {
      toast.error('Failed to load scores');
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            My Scoreboard
          </h2>

          {scores && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500 text-white p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold">{scores.wins}</div>
                  <div className="text-lg mt-2">Wins</div>
                </div>
                
                <div className="bg-red-500 text-white p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold">{scores.losses}</div>
                  <div className="text-lg mt-2">Losses</div>
                </div>
                
                <div className="bg-yellow-500 text-white p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold">{scores.draws}</div>
                  <div className="text-lg mt-2">Draws</div>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                  Total Games: {scores.totalGames}
                </div>
              </div>

              {scores.totalGames > 0 && (
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Win Rate
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                    <div
                      className="bg-green-500 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ width: `${(scores.wins / scores.totalGames) * 100}%` }}
                    >
                      {((scores.wins / scores.totalGames) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;


