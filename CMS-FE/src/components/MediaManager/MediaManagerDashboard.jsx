import React, { useState } from 'react';
import { FaImages, FaPlay, FaUsers, FaPlus } from 'react-icons/fa';
import GalleryPhotos from './GalleryPhotos';
import VideoUploads from './VideoUploads';
import HappyClients from './HappyClients';

const MediaManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('gallery');
  
  console.log('MediaManagerDashboard rendered with activeTab:', activeTab);

  const tabs = [
    {
      id: 'gallery',
      label: 'Gallery Photos',
      icon: <FaImages className="w-5 h-5" />,
      component: <GalleryPhotos />
    },
    {
      id: 'videos',
      label: 'Video Uploads',
      icon: <FaPlay className="w-5 h-5" />,
      component: <VideoUploads />
    },
    {
      id: 'clients',
      label: 'Happy Clients',
      icon: <FaUsers className="w-5 h-5" />,
      component: <HappyClients />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Manager</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your gallery photos, video uploads, and happy client testimonials
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Media Management
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default MediaManagerDashboard;
