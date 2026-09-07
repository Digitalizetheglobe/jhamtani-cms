import { useState, useEffect } from 'react';
import axios from 'axios';
import AnnouncementForm from './AnnouncementForm';
import { format } from 'date-fns';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CampaignIcon from '@mui/icons-material/Campaign';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const itemsPerPage = 8;

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, searchTerm]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/announcements', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        }
      });

      // Handle both response structures:
      // 1. Direct array response: response.data is the array
      // 2. Object with data and pagination: response.data.announcements
      const announcementsData = Array.isArray(response.data)
        ? response.data
        : response.data?.announcements || [];

      setAnnouncements(announcementsData);

      // Set total pages if available, otherwise calculate it
      if (response.data?.totalPages) {
        setTotalPages(response.data.totalPages);
      } else {
        setTotalPages(Math.ceil(announcementsData.length / itemsPerPage) || 1);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.response?.data?.message || 'Failed to fetch announcements');
      setAnnouncements([]); // Ensure announcements is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (newAnnouncement) => {
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setShowForm(false);
  };

  const handleUpdateSuccess = (updatedAnnouncement) => {
    setAnnouncements(prev =>
      prev.map(ann =>
        ann._id === updatedAnnouncement._id ? updatedAnnouncement : ann
      )
    );
    setEditingAnnouncement(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`http://localhost:5000/api/announcements/${id}`);
        setAnnouncements(prev => prev.filter(ann => ann._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete announcement');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const stats = [
    { label: 'Announcements', value: announcements.length, hint: 'This page' },
    { label: 'Published', value: announcements.filter((a) => a.isPublished).length, hint: 'Live' },
    { label: 'Drafts', value: announcements.filter((a) => !a.isPublished).length, hint: 'Unpublished' },
    { label: 'Frontend', value: announcements.filter((a) => a.showOnFrontend).length, hint: 'On public site' },
  ];

  return (
    <PageShell>
    <div className="space-y-5 sm:space-y-6">
      <PageHero
        kicker="Updates"
        title="Announcements"
        subtitle="Internal and public-facing notices."
      >
        <button
          type="button"
          onClick={() => {
            setEditingAnnouncement(null);
            setShowForm(true);
          }}
          className="cms-btn-primary"
        >
          + Create announcement
        </button>
      </PageHero>

      <StatCards items={stats} />

      {error && (
        <div className="cms-card p-4 text-sm text-red-700 bg-red-50">
          {error}
        </div>
      )}

      <div className="cms-card p-4 sm:p-5">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="cms-input pl-10"
          />
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSuccess={editingAnnouncement ? handleUpdateSuccess : handleCreateSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingAnnouncement(null);
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={CampaignIcon}
          title="No announcements yet"
          message={
            searchTerm
              ? 'Nothing matches this search. Clear it and try again.'
              : 'Create the first announcement.'
          }
          action={
            !searchTerm ? (
              <button type="button" onClick={() => setShowForm(true)} className="cms-btn-primary">
                + Create announcement
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="space-y-3">
              {announcements.map((announcement) => (
                <article key={announcement._id} className="cms-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {announcement.imageUrl ? (
                      <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-[#C5A880]/15 text-[#A0725B] flex items-center justify-center flex-shrink-0">
                        <CampaignIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#191f26] truncate">{announcement.title}</h3>
                      <p className="mt-1 text-sm text-[#5B584C] line-clamp-2">{announcement.content}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full ${
                            announcement.isPublished
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {announcement.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {announcement.showOnFrontend && (
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#f5f3ef] text-[#5B584C] border border-[#C5A880]/25">
                            Frontend
                          </span>
                        )}
                        <span className="text-[11px] text-gray-500">
                          {format(new Date(announcement.createdAt), 'MMM dd, yyyy')}
                          {announcement.departments?.length ? ` · ${announcement.departments.join(', ')}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAnnouncement(announcement);
                        setShowForm(true);
                      }}
                      className="cms-btn-primary !px-4"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(announcement._id)}
                      className="cms-btn-outline !px-4"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
          </div>

          {totalPages > 1 && (
            <div className="cms-card p-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#5B584C]">
                Page <span className="font-semibold text-[#191f26]">{currentPage}</span> of{' '}
                <span className="font-semibold text-[#191f26]">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="cms-btn-outline disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="cms-btn-outline disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </PageShell>
  );
};

export default AnnouncementList;
