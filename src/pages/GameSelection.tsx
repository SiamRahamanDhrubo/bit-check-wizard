
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, CheckCircle } from 'lucide-react';

const GameSelection = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    // Navigate to appropriate page after a short delay to show the selection
    setTimeout(() => {
      if (answer === 'Minecraft') {
        navigate('/os-selection');
      } else if (answer === 'Geometry Dash') {
        navigate('/geometry-dash-os');
      }
    }, 1500);
  };

  const resetAnswer = () => {
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <Gamepad2 className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Game Selection
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              What game would you like to download?
            </p>
          </div>

          {!selectedAnswer ? (
            <div className="space-y-4">
              <button
                onClick={() => handleAnswerSelect('Minecraft')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg">1. Minecraft</span>
              </button>
              <button
                onClick={() => handleAnswerSelect('Geometry Dash')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg">2. Geometry Dash</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Answer Recorded
                </h2>
                <p className="text-lg text-gray-700">
                  You selected: <span className="font-semibold text-green-700">{selectedAnswer}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedAnswer === 'Minecraft' ? 'Redirecting to OS selection...' : 'Redirecting to Geometry Dash OS selection...'}
                </p>
              </div>
              <button
                onClick={resetAnswer}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Answer Again
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Choose your game to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;
