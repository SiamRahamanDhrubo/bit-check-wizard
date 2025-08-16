
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle, Smartphone } from 'lucide-react';

const UpGraderlyDownload = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleDownload = (downloadUrl: string) => {
    setIsDownloading(true);
    
    window.open(downloadUrl, '_blank');
    
    // Reset downloading state
    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  };

  const resetSelection = () => {
    setSelectedOption(null);
  };

  const getDownloadUrl = (option: string) => {
    switch (option) {
      case 'minecraft-with-music':
        return 'https://mega.nz/file/XcdkzRRQ#9LZe6jbvVBg5-PdbKNf63SEM9oaub3F2XcSyuIBUsuM';
      case 'minecraft-without-music':
        return 'https://mega.nz/file/XcdkzRRQ#9LZe6jbvVBg5-PdbKNf63SEM9oaub3F2XcSyuIBUsuM';
      case 'upgraderly':
        return '#'; // Placeholder for UpGraderly download
      default:
        return '#';
    }
  };

  const getOptionDisplayName = (option: string) => {
    switch (option) {
      case 'minecraft-with-music':
        return 'Minecraft Android - With Music';
      case 'minecraft-without-music':
        return 'Minecraft Android - Without Music';
      case 'upgraderly':
        return 'UpGraderly';
      default:
        return option;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Android Downloads
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Choose what you'd like to download for Android
            </p>
          </div>

          {!selectedOption ? (
            <div className="space-y-4">
              <button
                onClick={() => handleOptionSelect('minecraft-with-music')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg">1. Minecraft Android - With Music</span>
              </button>
              <button
                onClick={() => handleOptionSelect('minecraft-without-music')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg">2. Minecraft Android - Without Music</span>
              </button>
              <button
                onClick={() => handleOptionSelect('upgraderly')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="text-lg">3. UpGraderly</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Download
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  You selected: <span className="font-semibold text-green-700">{getOptionDisplayName(selectedOption)}</span>
                </p>
                
                {selectedOption === 'upgraderly' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 font-medium">Coming Soon!</p>
                    <p className="text-yellow-700 text-sm">UpGraderly is currently in development.</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownload(getDownloadUrl(selectedOption))}
                    disabled={isDownloading}
                    className={`w-full text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                      isDownloading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isDownloading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Opening Download...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Download className="w-5 h-5 mr-2" />
                        Download from Mega.nz
                      </span>
                    )}
                  </button>
                )}
              </div>
              
              <button
                onClick={resetSelection}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Choose Again
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
              All downloads are for Android devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpGraderlyDownload;
