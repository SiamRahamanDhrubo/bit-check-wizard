
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle } from 'lucide-react';

const DownloadPage = () => {
  const location = useLocation();
  const [os, setOs] = useState<string>('');
  const [architecture, setArchitecture] = useState<string>('');
  const [music, setMusic] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const osParam = params.get('os');
    const archParam = params.get('arch');
    const musicParam = params.get('music');
    if (osParam) {
      setOs(osParam);
    }
    if (archParam) {
      setArchitecture(archParam);
    }
    if (musicParam) {
      setMusic(musicParam);
    }
  }, [location]);

  const handleDownload = () => {
    setIsDownloading(true);
    
    const downloadUrl = getDownloadUrl();
    window.open(downloadUrl, '_blank');
    
    // Reset downloading state
    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  };

  const getDownloadUrl = () => {
    if (os === 'android') {
      if (music === 'without') {
        return 'https://mega.nz/file/zR1B2TxA#hVWrQTD6YR4QC8384ytm0iwMRJuGrnwkBH9ogMkh6FE';
      } else if (music === 'with') {
        return 'https://mega.nz/file/CV02lQDS#QAKRMj-1DX0581meZrmcZYE16wbF7P1oxNA26eK8yX8';
      }
    } else if (os === 'windows') {
      return architecture === '32-bit' 
        ? 'https://mega.nz/file/XYdkhKQD#5FExUMIAoweOuSJvkngtEC3zYn5zdlDhZfjzuQ0ErP8'
        : 'https://mega.nz/file/iV1zwSZJ#_Oo5mZiiOpB-vuzaR9pvIIbyp4ycWufA6OQwYTGfUyU';
    }
    return '';
  };

  const getDisplayText = () => {
    if (os === 'android') {
      return `Android ${music === 'with' ? '(With Music)' : '(Without Music)'}`;
    } else if (os === 'windows') {
      return `Windows ${architecture}`;
    }
    return '';
  };

  const getBackLink = () => {
    if (os === 'android') {
      return '/android-music';
    } else if (os === 'windows') {
      return '/architecture';
    }
    return '/os-selection';
  };

  const getBackText = () => {
    if (os === 'android') {
      return 'Back to Music Options';
    } else if (os === 'windows') {
      return 'Back to Architecture Check';
    }
    return 'Back to OS Selection';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Download Ready
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-2">
              Based on your selection: <span className="font-semibold text-green-700">{getDisplayText()}</span>
            </p>
            <p className="text-gray-600">
              Download the Minecraft client editor for your system
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Ready to download for {getDisplayText()}</span>
            </div>
            <button
              onClick={handleDownload}
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
          </div>

          <Link
            to={getBackLink()}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {getBackText()}
          </Link>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Download will open in a new tab via Mega.nz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
