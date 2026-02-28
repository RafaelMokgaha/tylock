
import React from 'react';

const DemoModeBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-center p-3 font-bold shadow-lg z-[101] relative">
      <p className="text-sm sm:text-base">
        <span className="font-extrabold uppercase tracking-wider">Demonstration Mode:</span> All data is saved locally in your browser only.
      </p>
      <p className="text-xs sm:text-sm opacity-90">
        Requests and messages will NOT be seen by the admin or other users on different computers.
      </p>
    </div>
  );
};

export default DemoModeBanner;
