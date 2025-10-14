import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, ArrowLeft } from 'lucide-react';

const AndroidArchitecture = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    
    setTimeout(() => {
      navigate(`/android-music?arch=${answer}`);
    }, 1500);
  };

  const resetAnswer = () => {
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Smartphone className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Android - Device Architecture
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Select your phone type to get the correct version
            </p>
          </div>

          {!selectedAnswer ? (
            <div className="space-y-4">
              <button
                onClick={() => handleAnswerSelect('arm-v8a')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-5 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-lg"
              >
                For Newer Phones (ARM-v8a)
              </button>
              <button
                onClick={() => handleAnswerSelect('older')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-5 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-lg"
              >
                For Older Phones
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <p className="text-green-800 font-medium">
                  Selected: {selectedAnswer === 'arm-v8a' ? 'Newer Phones (ARM-v8a)' : 'Older Phones'}
                </p>
              </div>
              <button
                onClick={resetAnswer}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Answer Again
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/os-selection"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to OS Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AndroidArchitecture;
