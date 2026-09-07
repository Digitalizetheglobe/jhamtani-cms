import React, { useState, useEffect } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/blogs/');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter blogs based on search term and status
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && blog.isPublished) ||
      (filterStatus === 'draft' && !blog.isPublished);

    return matchesSearch && matchesStatus;
  });

  // Handle blog deletion
  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setBlogs(blogs.filter(blog => blog._id !== blogId));
          alert('Blog deleted successfully!');
        } else {
          throw new Error('Failed to delete blog');
        }
      } catch (err) {
        console.error('Error deleting blog:', err);
        alert('Failed to delete blog');
      }
    }
  };

  // Handle blog edit
  const handleEdit = (blogId) => {
    navigate(`/blog-management/edit/${blogId}`);
  };

  // Handle blog view
  const handleView = (blogId) => {
    navigate(`/blog-management/view/${blogId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Parse tags and categories from string arrays
  const parseArrayField = (field) => {
    try {
      if (Array.isArray(field)) {
        return field.map(item => {
          try {
            return JSON.parse(item);
          } catch {
            return item;
          }
        }).flat().filter(item => item && item !== '[]');
      }
      return [];
    } catch {
      return [];
    }
  };

  const stats = [
    { label: 'Blogs', value: blogs.length, hint: 'All stories' },
    { label: 'Published', value: blogs.filter((b) => b.isPublished).length, hint: 'Live on site' },
    { label: 'Drafts', value: blogs.filter((b) => !b.isPublished).length, hint: 'Unpublished' },
    { label: 'Showing', value: filteredBlogs.length, hint: 'Current filters' },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading blogs...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Jhamtani Perspectives"
          title="Blog"
          subtitle="Stories that inspire ideas that build tomorrow."
        >
          <button type="button" onClick={fetchBlogs} className="cms-btn-outline">
            Refresh
          </button>
          <button type="button" onClick={() => navigate('/blog-management/create')} className="cms-btn-primary">
            + New post
          </button>
        </PageHero>

        <StatCards items={stats} />

        {error && (
          <div className="cms-card p-4 text-sm text-red-700 bg-red-50 border border-red-100">
            Error: {error}
          </div>
        )}

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs..."
                className="cms-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="cms-input cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <EmptyState
            icon={FiSearch}
            title="No blogs yet"
            message={
              searchTerm || filterStatus !== 'all'
                ? 'Nothing matches these filters. Clear search and try again.'
                : 'Write the first perspective for the public site.'
            }
            action={
              <button type="button" onClick={() => navigate('/blog-management/create')} className="cms-btn-primary">
                + New post
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredBlogs.map((blog) => {
              const tags = parseArrayField(blog.tags);
              const categories = parseArrayField(blog.categories);

              return (
                <article
                  key={blog._id}
                  className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-20 h-14 rounded-xl overflow-hidden bg-[#f5f3ef] flex-shrink-0">
                      {blog.coverImage || blog.uploadImage ? (
                        <img
                          src={blog.coverImage || blog.uploadImage}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C5A880]">
                          <FiEye className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#191f26] truncate">{blog.title}</h3>
                      <p className="text-sm text-[#5B584C] line-clamp-2 mt-0.5">{blog.excerpt}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full ${
                            blog.isPublished
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {formatDate(blog.createdAt)}
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {blog.readTime || 0} min
                        </span>
                        {tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-[#f5f3ef] text-[#5B584C] border border-[#C5A880]/25"
                          >
                            {tag}
                          </span>
                        ))}
                        {categories.slice(0, 1).map((category, index) => (
                          <span
                            key={`cat-${index}`}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#A0725B]"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleView(blog._id)} className="cms-btn-outline !px-4">
                      <FiEye className="w-4 h-4" />
                      View
                    </button>
                    <button type="button" onClick={() => handleEdit(blog._id)} className="cms-btn-primary !px-4">
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(blog._id)} className="cms-btn-outline !px-4">
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default BlogList;
