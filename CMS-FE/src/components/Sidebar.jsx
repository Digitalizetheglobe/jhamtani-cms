import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaClipboardList, 
  FaTrophy, 
  FaChartBar, 
  FaCalendarAlt,
  FaBed,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaSignOutAlt,
  FaYoutubeSquare,
  FaHackerNewsSquare,
  FaPlus,
  FaList,
  FaUserFriends,
  FaPlay,
  FaImage,
  FaBuilding
} from 'react-icons/fa';
import logo from '../assets/DTG.png'
import logo2 from '../assets/rising-logo.png'

const Sidebar = () => {
  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-scroll {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: #4B5563 #111827;
      }
      .sidebar-scroll::-webkit-scrollbar {
        width: 5px;
      }
      .sidebar-scroll::-webkit-scrollbar-track {
        background: #111827;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb {
        background: #4B5563;
        border-radius: 4px;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background: #6B7280;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [galleryCategories, setGalleryCategories] = useState([]);

  // Fetch admin data from context or localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);
        setAdminData({
          name: admin.name || 'Admin',
          email: admin.email || '',
          role: 'Administrator'
        });
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
  }, []);

  // Set gallery categories with desired order
  useEffect(() => {
    const categoryOrder = ['exhibitions', 'happy clients', 'outings', 'festivals'];
    setGalleryCategories(categoryOrder);
  }, []);

  // Handle window resize without resetting on mobile address bar scroll
  useEffect(() => {
    let prevIsMobile = window.innerWidth < 768;
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== prevIsMobile) {
        prevIsMobile = mobile;
        setIsMobile(mobile);
        setIsOpen(!mobile);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobile, isOpen]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, location.search, isMobile]);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarRoutes = [
    { 
      path: '/', 
      icon: <FaHome className="text-white" />, 
      label: 'Dashboard',
      color: 'from-red-600 to-red-600'
    },
    { 
      path: '/leads-management', 
      icon: <FaUsers className="text-white" />, 
      label: 'Lead Management',
      color: 'from-red-600 to-red-600'
    },
    { 
      path: '/teammanagement', 
      icon: <FaUserFriends className="text-white" />, 
      label: 'Team Management',
      color: 'from-red-600 to-red-600'
    },
    { 
      path: '/blog-management', 
      icon: <FaClipboardList className="text-white" />, 
      label: 'Blog Management',
      color: 'from-red-600 to-red-600',
      hasSubmenu: true,
      submenu: [
        {
          path: '/blog-management/list',
          icon: <FaList className="text-white" />,
          label: 'All Blogs'
        },
        {
          path: '/blog-management/create',
          icon: <FaPlus className="text-white" />,
          label: 'Create Blog'
        }
      ]
    },
    { 
      path: '/testimonialmanagement', 
      icon: <FaTrophy className="text-white" />, 
      label: 'Testimonials',
      color: 'from-red-600 to-red-600'
    },
    { 
      path: '/youtube-management', 
      icon: <FaPlay className="text-white" />, 
      label: 'YouTube Videos',
      color: 'from-red-600 to-red-600'
    },
    { 
      path: '/form-management', 
      icon: <FaChartBar className="text-white" />, 
      label: 'Form Management',
      color: 'from-red-600 to-red-600'
    },
    { 
      path: '/banner-management', 
      icon: <FaImage className="text-white" />, 
      label: 'Banner Management',
      color: 'from-red-600 to-red-600'
    },
    { 
      path: '/project-management', 
      icon: <FaBuilding className="text-white" />, 
      label: 'Project Management',
      color: 'from-red-600 to-red-600'
    },
    { 
      path: '/media-manager', 
      icon: <FaYoutubeSquare className="text-white" />, 
      label: 'Media Manager',
      color: 'from-red-600 to-red-600',
      hasSubmenu: true,
      submenu: [
        {
          path: '/media-manager/gallery-photos',
          icon: <FaClipboardList className="text-white" />,
          label: 'Gallery Photos'
        },
        {
          path: '/media-manager/video-uploads',
          icon: <FaPlay className="text-white" />,
          label: 'Video Uploads'
        },
        {
          path: '/media-manager/happy-clients',
          icon: <FaUsers className="text-white" />,
          label: 'Happy Clients'
        }
      ]
    },
    { 
      path: '/announcement/list', 
      icon: <FaHackerNewsSquare className="text-white" />, 
      label: 'Announcement',
      color: 'from-red-600 to-red-600'
    }
  ];

  // Mobile toggle button
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/login';
  };

  // Toggle submenu expansion
  const toggleSubmenu = (menuPath) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuPath]: !prev[menuPath]
    }));
  };

  // Check if a route is active (including submenu items)
  const isRouteActive = (route) => {
    if (route.hasSubmenu) {
      return route.submenu.some(subItem => location.pathname === subItem.path);
    }
    return location.pathname === route.path;
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      <button 
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
        className={`md:hidden fixed top-3 left-3 z-40 p-2.5 rounded-xl bg-gray-900/90 text-white shadow-xl border border-gray-700 backdrop-blur-md transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100 hover:bg-gray-800'}`}
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 h-screen h-[100dvh] w-64 max-w-[80vw] bg-black text-white shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}
      >
        {/* Header (Logo + Mobile Close Button) */}
        <div className="relative p-4 md:p-6 pb-3 md:pb-4 border-b border-gray-800 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center justify-center w-full">
            <img src={logo2} alt="Logo" className="w-[150px] h-auto max-h-[60px] object-contain" />
          </div>

          {/* Close button for mobile */}
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 md:px-4 py-3 sidebar-scroll overscroll-contain">
          {sidebarRoutes.map((route) => (
            <div key={route.path}>
              {route.hasSubmenu ? (
                // Menu item with submenu
                <div>
                  <button
                    onClick={() => toggleSubmenu(route.path)}
                    className={`
                      w-full relative flex items-center p-3 my-1 md:my-1.5 rounded-lg transition-all duration-200
                      ${isRouteActive(route) ? 
                        `bg-gradient-to-r ${route.color} shadow-md` : 
                        'hover:bg-gray-800 text-gray-200'}
                    `}
                    onMouseEnter={() => setHoveredItem(route.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className={`mr-2 md:mr-3 text-base md:text-lg transition-transform duration-200 ${hoveredItem === route.path ? 'scale-110' : ''}`}>
                      {route.icon}
                    </span>
                    <span className="font-medium text-white text-sm md:text-base text-left flex-1">{route.label}</span>
                    
                    {/* Expandable chevron */}
                    <FaChevronRight 
                      className={`ml-auto text-xs transition-transform duration-300 ${expandedMenus[route.path] ? 'rotate-90' : ''}`} 
                    />
                    
                    {/* Active indicator */}
                    {isRouteActive(route) && (
                      <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 md:h-8 rounded-l-full bg-white"></span>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {expandedMenus[route.path] && (
                    <div className="ml-4 space-y-1 my-1">
                      {route.submenu.map((subItem) => (
                        <div key={subItem.path}>
                          <Link
                            to={subItem.path}
                            onClick={handleLinkClick}
                            className={`
                              flex items-center p-2 rounded-lg transition-all duration-200 text-sm
                              ${location.pathname === subItem.path ? 
                                'bg-gray-800 text-white font-medium' : 
                                'text-gray-300 hover:bg-gray-800 hover:text-white'}
                            `}
                          >
                            <span className="mr-2 text-sm">{subItem.icon}</span>
                            <span className='text-white'>{subItem.label}</span>
                            {location.pathname === subItem.path && (
                              <span className="ml-auto w-1 h-4 rounded-l-full bg-white"></span>
                            )}
                          </Link>

                          {/* Nested submenu for Gallery Photos: show categories */}
                          {subItem.path === '/media-manager/gallery-photos' && galleryCategories.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1">
                              {galleryCategories.map((cat) => {
                                const catPath = `${subItem.path}?category=${encodeURIComponent(cat)}`;
                                const isActive = location.pathname === subItem.path && new URLSearchParams(location.search).get('category') === cat;
                                return (
                                  <Link
                                    key={cat}
                                    to={catPath}
                                    onClick={handleLinkClick}
                                    className={`
                                      flex items-center p-2 rounded-lg transition-all duration-200 text-xs capitalize
                                      ${isActive ? 'bg-gray-700 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                                    `}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                                    {cat}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link 
                  to={route.path} 
                  onClick={handleLinkClick}
                  className={`
                    relative flex items-center p-3 my-1 md:my-1.5 rounded-lg transition-all duration-200
                    ${location.pathname === route.path ? 
                      `bg-gradient-to-r ${route.color} shadow-md` : 
                      'hover:bg-gray-800 text-gray-200'}
                  `}
                  onMouseEnter={() => setHoveredItem(route.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className={`mr-2 md:mr-3 text-base md:text-lg transition-transform duration-200 ${hoveredItem === route.path ? 'scale-110' : ''}`}>
                    {route.icon}
                  </span>
                  <span className="font-medium text-white text-sm md:text-base flex-1">{route.label}</span>
                  
                  {/* Animated chevron */}
                  <FaChevronRight 
                    className={`ml-auto text-xs transition-all duration-300 ${hoveredItem === route.path || location.pathname === route.path ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} 
                  />
                  
                  {/* Active indicator */}
                  {location.pathname === route.path && (
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 md:h-8 rounded-l-full bg-white"></span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer (flex-shrink-0 so it stays docked at bottom without covering scrollable items) */}
        <div className="flex-shrink-0 p-3 md:p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm z-10">
          <div 
            className="flex items-center cursor-pointer p-1.5 rounded-lg hover:bg-gray-800/80 transition-colors"
            onClick={() => setShowPremiumModal(true)}
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="font-bold text-white text-sm md:text-base">
                {adminData?.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="ml-2 md:ml-3 min-w-0 flex-1">
              <p className="text-xs md:text-sm font-semibold text-white truncate">
                Admin Panel
              </p>
              <p className="text-xs text-gray-400 truncate">
                {adminData?.role ? adminData.role.charAt(0).toUpperCase() + adminData.role.slice(1) : 'Administrator'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Premium / Admin Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Admin Profile</h2>
              <button 
                onClick={() => setShowPremiumModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              {adminData ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {adminData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{adminData.name}</h3>
                      <p className="text-sm text-gray-400">{adminData.role}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-red-400 font-medium">Email</p>
                        <p className="text-sm text-white truncate">{adminData.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-red-400 font-medium">Role</p>
                        <p className="text-sm text-white">{adminData.role}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center py-4 text-gray-400">Loading admin data...</p>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-lg"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;