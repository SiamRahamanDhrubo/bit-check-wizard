
import { Link } from 'react-router-dom';
import { Download, ArrowLeft, Smartphone } from 'lucide-react';

const UpGraderlyDownload = () => {
  const handleDownload = () => {
    // Placeholder for UpGraderly download link - you can update this later
    window.open('#', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              UpGraderly Download
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Ready to download UpGraderly for Android
            </p>
            <div className="inline-flex items-center bg-purple-50 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium">
              <Smartphone className="w-4 h-4 mr-2" />
              Android Only
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Download Information
              </h2>
              <p className="text-gray-700 mb-4">
                UpGraderly is currently available for Android devices only.
              </p>
              <p className="text-sm text-gray-600">
                Make sure you have enabled "Install from unknown sources" in your Android settings.
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-3" />
              <span className="text-lg">Download UpGraderly APK</span>
            </button>

            <p className="text-xs text-gray-500">
              Coming soon - download link will be available shortly
            </p>
          </div>

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
              UpGraderly - Android gaming application
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpGraderlyDownload;
