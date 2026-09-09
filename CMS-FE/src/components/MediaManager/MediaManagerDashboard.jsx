import React from 'react';
import { Link } from 'react-router-dom';
import { FaImages, FaPlay, FaUsers, FaTrophy } from 'react-icons/fa';
import PageShell from '../PageShell';
import { PageHero } from '../PageHero';

const MediaManagerDashboard = () => {
  const modules = [
    {
      to: '/media-manager/gallery-photos',
      title: 'Gallery',
      subtitle: 'Exhibitions, outings, and festivals',
      icon: FaImages,
    },
    {
      to: '/media-manager/video-uploads',
      title: 'Video uploads',
      subtitle: 'Hosted videos for the public site',
      icon: FaPlay,
    },
    {
      to: '/media-manager/happy-clients',
      title: 'Happy Faces',
      subtitle: 'Client portraits and stories',
      icon: FaUsers,
    },
    {
      to: '/media-manager/awards',
      title: 'Awards',
      subtitle: 'Recognition logos and award images',
      icon: FaTrophy,
    },
  ];

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Media"
          title="Library"
          subtitle="Gallery photos, videos, happy faces, and awards for the public site."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="cms-card p-6 hover:border-[#C5A880] transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#C5A880]/15 text-[#A0725B] flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h2 className="font-display text-2xl text-[#191f26]">{item.title}</h2>
              <p className="text-sm text-[#5B584C] mt-1">{item.subtitle}</p>
              <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-[#A0725B] group-hover:underline">
                Open →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default MediaManagerDashboard;
