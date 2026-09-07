import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Close as CloseIcon, ContentCopy as ContentCopyIcon, Check as CheckIcon } from '@mui/icons-material';
import { getApiBaseUrl } from '../api/bannerApi';

const BannerApiGuide = ({ bannerData, onClose }) => {
  const [copiedSection, setCopiedSection] = useState('');
  const baseUrl = getApiBaseUrl();

  const bannerId = bannerData?._id || '67c3f91b402a1b001a4e589f';
  const apiEndpoint = `${baseUrl}/api/banners/${bannerId}`;

  const exampleResponse = JSON.stringify(
    {
      success: true,
      data: {
        _id: bannerId,
        title: bannerData?.title || 'Ongoing Projects Banner',
        desktopBanner: bannerData?.desktopBanner ? `${baseUrl}${bannerData.desktopBanner}` : 'http://localhost:5000/uploads/banners/desktop.webp',
        tabletBanner: bannerData?.tabletBanner ? `${baseUrl}${bannerData.tabletBanner}` : 'http://localhost:5000/uploads/banners/tablet.webp',
        mobileBanner: bannerData?.mobileBanner ? `${baseUrl}${bannerData.mobileBanner}` : 'http://localhost:5000/uploads/banners/mobile.webp',
        isActive: true
      }
    },
    null,
    2
  );

  const nextJsReactCode = `'use client';

import React, { useEffect, useState } from 'react';

export default function LandingBanner({ bannerId = '${bannerId}', className = '' }) {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch(\`http://localhost:5000/api/banners/\${bannerId}\`);
        const json = await res.json();
        if (json.success && json.data) {
          setBanner(json.data);
        }
      } catch (err) {
        console.error('Error loading banner:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanner();
  }, [bannerId]);

  if (loading) {
    return <div className="w-full h-48 sm:h-64 md:h-96 bg-gray-100 animate-pulse rounded-lg" />;
  }

  if (!banner || !banner.isActive) return null;

  const baseUrl = 'http://localhost:5000';
  const desktopSrc = banner.desktopBanner?.startsWith('http') 
    ? banner.desktopBanner 
    : \`\${baseUrl}\${banner.desktopBanner}\`;
  const tabletSrc = banner.tabletBanner 
    ? (banner.tabletBanner.startsWith('http') ? banner.tabletBanner : \`\${baseUrl}\${banner.tabletBanner}\`) 
    : desktopSrc;
  const mobileSrc = banner.mobileBanner 
    ? (banner.mobileBanner.startsWith('http') ? banner.mobileBanner : \`\${baseUrl}\${banner.mobileBanner}\`) 
    : tabletSrc;

  return (
    <div className={\`w-full overflow-hidden \${className}\`}>
      <picture>
        {/* Mobile View: screen width <= 640px */}
        <source media="(max-width: 640px)" srcSet={mobileSrc} />
        {/* Tablet View: screen width <= 1024px */}
        <source media="(max-width: 1024px)" srcSet={tabletSrc} />
        {/* Desktop View: screen width > 1024px */}
        <img
          src={desktopSrc}
          alt={banner.title || 'Banner'}
          className="w-full h-auto object-cover"
          loading="eager"
        />
      </picture>
    </div>
  );
}`;

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div>
            <h2 className="text-xl font-bold">Banner API Guide</h2>
            <p className="text-xs text-red-100 mt-1">
              Banner ID: <span className="font-mono bg-red-800 px-2 py-0.5 rounded">{bannerId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-800 p-1.5 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-800 text-sm">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-900">
            <p className="font-medium text-xs">
              ✅ <strong>Direct ID Integration:</strong> Just like Form Management, copy the Banner ID or snippet below and use it in any of your Landing Page projects. Whenever you edit the banner in CMS, it updates on the live landing page automatically!
            </p>
          </div>

          {/* Section 1: Endpoint */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-gray-700 flex items-center gap-2">
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded font-mono">GET</span>
                API Endpoint (Direct Banner ID)
              </label>
              <button
                onClick={() => copyToClipboard(apiEndpoint, 'endpoint')}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                {copiedSection === 'endpoint' ? <CheckIcon className="text-xs" /> : <ContentCopyIcon className="text-xs" />}
                {copiedSection === 'endpoint' ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
            <div className="p-3 bg-gray-900 text-green-400 font-mono text-xs rounded-lg overflow-x-auto select-all">
              {apiEndpoint}
            </div>
          </div>

          {/* Section 2: JSON Response */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-gray-700">JSON Response</label>
              <button
                onClick={() => copyToClipboard(exampleResponse, 'json')}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                {copiedSection === 'json' ? <CheckIcon className="text-xs" /> : <ContentCopyIcon className="text-xs" />}
                {copiedSection === 'json' ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="p-4 bg-gray-900 text-gray-200 font-mono text-xs rounded-lg overflow-x-auto max-h-40">
              {exampleResponse}
            </pre>
          </div>

          {/* Section 3: React / Next.js Component */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-gray-700">
                Next.js / React Component Code
              </label>
              <button
                onClick={() => copyToClipboard(nextJsReactCode, 'code')}
                className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-medium cursor-pointer shadow transition"
              >
                {copiedSection === 'code' ? <CheckIcon className="text-xs" /> : <ContentCopyIcon className="text-xs" />}
                {copiedSection === 'code' ? 'Copied!' : 'Copy Component Code'}
              </button>
            </div>
            <pre className="p-4 bg-gray-950 text-gray-200 font-mono text-xs rounded-lg overflow-x-auto max-h-60 border border-gray-800">
              {nextJsReactCode}
            </pre>
          </div>

          {/* Section 4: Usage Example */}
          <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-1 text-xs">Usage in any Landing Page:</h4>
            <div className="bg-white p-2.5 rounded border font-mono text-xs text-gray-800">
              <code>{`<LandingBanner bannerId="${bannerId}" />`}</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BannerApiGuide;
