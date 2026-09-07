import React from 'react';

const PageShell = ({ children, wide = true, className = '' }) => {
  return (
    <div className={`cms-page ${className}`.trim()}>
      <div className={wide ? 'cms-container' : 'cms-container cms-container--narrow'}>
        {children}
      </div>
    </div>
  );
};

export default PageShell;
