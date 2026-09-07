import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Close as CloseIcon,
  DesktopWindows as DesktopIcon,
  TabletMac as TabletIcon,
  PhoneIphone as PhoneIcon,
} from '@mui/icons-material';
import { getApiBaseUrl } from '../api/bannerApi';

const BannerPreviewModal = ({ banner, onClose }) => {
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const baseUrl = getApiBaseUrl();

  if (!banner) return null;

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return `${baseUrl}${url}`;
  };

  const desktopUrl = getFullUrl(banner.desktopBanner);
  const tabletUrl = getFullUrl(banner.tabletBanner || banner.desktopBanner);
  const mobileUrl = getFullUrl(banner.mobileBanner || banner.tabletBanner || banner.desktopBanner);

  const currentBannerUrl =
    deviceMode === 'desktop' ? desktopUrl : deviceMode === 'tablet' ? tabletUrl : mobileUrl;

  const deviceWidthClass =
    deviceMode === 'desktop'
      ? 'w-full max-w-5xl'
      : deviceMode === 'tablet'
      ? 'w-[768px] max-w-full'
      : 'w-[375px] max-w-full';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-900 text-white gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>Preview:</span>
              <span className="text-red-400">{banner.title}</span>
            </h2>
            <p className="text-xs text-gray-400">
              Placement Key: <span className="font-mono text-gray-200">{banner.placement}</span>
            </p>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center bg-gray-800 p-1 rounded-xl border border-gray-700">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                deviceMode === 'desktop'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <DesktopIcon fontSize="small" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                deviceMode === 'tablet'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TabletIcon fontSize="small" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                deviceMode === 'mobile'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PhoneIcon fontSize="small" />
              <span>Mobile</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Viewport Canvas Area */}
        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto flex items-center justify-center">
          <div
            className={`transition-all duration-300 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300 relative ${deviceWidthClass}`}
          >
            {/* Mock browser bar */}
            <div className="bg-gray-200 px-3 py-2 border-b border-gray-300 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded px-2 py-0.5 text-[10px] text-gray-500 font-mono truncate">
                https://jhamtani.netlify.app/{banner.placement}
              </div>
            </div>

            {/* Banner Image */}
            <div className="relative">
              <img
                src={currentBannerUrl}
                alt={banner.title}
                className="w-full h-auto object-cover max-h-[550px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <div>
            Viewing: <strong className="capitalize text-gray-800">{deviceMode}</strong> Banner Image
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BannerPreviewModal;
