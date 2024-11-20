import React, { useEffect } from 'react';

interface AlertProps {
  show: boolean;
  message: string;
  closeAlert: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, show, closeAlert,}) => {
  return (
    <div id="alert" className={`w-full fixed h-screen z-[1000] top-0 left-0 flex justify-center items-center overflow-hidden
    bg-[rgba(0, 0, 0, 0.4)] backdrop-blur-[15px] cursor-pointer ${show? "": "hidden"} `} onClick={closeAlert}>
        <div id="alert-content" className="py-8 px-6 flex flex-col gap-6 bg-white rounded-lg ">
            <h1 className="text-xl md:text-4xl font-bold text-gray-600">{message}</h1>
            <button className="w-full px-2 py-3 rounded text-white bg-purple-500" onClick={closeAlert}>Login again!</button>
        </div>
    </div>
  );
};

export default Alert;
