
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Monitor, CheckCircle, ArrowLeft } from 'lucide-react';

const OSSelection = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    // Navigate to appropriate page after a short delay to show the selection
    setTimeout(() => {
      if (answer === 'Windows') {
        navigate('/architecture');
      } else if (answer === 'Android') {
        navigate('/android-architecture');
      }
    }, 1500);
  };

  const resetAnswer = () => {
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Minecraft - Operating System Check
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              What operating system are you using?
            </p>
          </div>

          {!selectedAnswer ? (
            <div className="space-y-4">
              <button
                onClick={() => handleAnswerSelect('Android')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg">1. Android</span>
              </button>
              <button
                onClick={() => handleAnswerSelect('Windows')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg">2. Windows</span>
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
                  {selectedAnswer === 'Windows' ? 'Redirecting to architecture check...' : 'Redirecting to device type selection...'}
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

          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game Selection
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Choose your operating system to get the correct version
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSSelection;
