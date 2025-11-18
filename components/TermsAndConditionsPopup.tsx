
import React from 'react';
import NeonButton from './common/NeonButton';

interface TermsAndConditionsPopupProps {
  onAccept: () => void;
}

const TermsAndConditionsPopup: React.FC<TermsAndConditionsPopupProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="relative bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_20px_theme(colors.cyan.500/50%)] w-full max-w-2xl transform transition-all duration-300 animate-slide-up"
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-cyan-400 mb-4 tracking-wider">Terms & Conditions</h2>
          <p className="text-center text-gray-400 mb-6">Please read and accept the following terms before using our service.</p>
          
          <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-4 text-gray-300 text-sm sm:text-base">
            <p>By creating an account and using our services, you agree to the following terms:</p>
            <div>
              <h3 className="font-bold text-purple-300 text-lg mb-1">1. Hardware Responsibility</h3>
              <p>We are not responsible for any damage, performance issues, or malfunctions of your PC hardware. It is your sole responsibility to ensure your computer meets the minimum system requirements for any game you download and run. We do not provide support for hardware-related issues.</p>
            </div>
            <div>
              <h3 className="font-bold text-purple-300 text-lg mb-1">2. Software Disclaimer</h3>
              <p>All game files, online fixes, and bypasses are provided 'as-is' without any warranties. While we strive to ensure the integrity of our files, we are not liable for any software conflicts, data loss, or other issues that may arise from their use.</p>
            </div>
            <div>
              <h3 className="font-bold text-purple-300 text-lg mb-1">3. Reporting Issues</h3>
              <p>If you encounter any issues specifically with our website (e.g., broken links, login problems, incorrect information), please report them immediately using the 'Message Admin' feature. This helps us maintain a high-quality service for the community.</p>
            </div>
            <p className="font-semibold text-white pt-4">By clicking 'I Agree', you acknowledge that you have read, understood, and accepted these terms and conditions.</p>
          </div>

          <div className="mt-8 text-center">
            <NeonButton color="cyan" onClick={onAccept} size="md">
              I Agree
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPopup;
