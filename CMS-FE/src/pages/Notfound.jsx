import React from "react";
import { Link } from "react-router-dom";

function Notfound() {
  return (
    <div className="cms-page min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <p className="text-[#C5A880] text-sm font-semibold tracking-[0.2em] uppercase">404</p>
        <h1 className="font-display text-4xl text-[#191f26] mt-2">Page not found</h1>
        <p className="text-[#5B584C] mt-3">The page you requested is not available in Jhamtani CMS.</p>
        <Link to="/" className="cms-btn-primary mt-6 inline-flex">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default Notfound;
