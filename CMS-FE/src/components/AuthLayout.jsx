import React from 'react';
import logo from '../assets/jhamtani-logo.webp';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] grid lg:grid-cols-2 bg-[#f5f3ef]">
      <aside className="hidden lg:flex flex-col justify-between bg-[#191f26] text-white p-10 xl:p-14">
        <img src={logo} alt="Jhamtani" className="h-10 w-auto object-contain self-start" />
        <div>
          <p className="text-[#C5A880] text-sm font-semibold tracking-[0.22em] uppercase">
            The Name Is A Promise
          </p>
          <h1 className="font-display text-5xl xl:text-6xl mt-4 leading-tight">
            Content for homes that are remembered.
          </h1>
          <p className="mt-6 text-white/65 max-w-md text-base leading-relaxed">
            Manage projects, perspectives, and enquiries for Pune’s fastest-growing real estate brand.
          </p>
        </div>
        <p className="text-sm text-white/40">Jhamtani CMS · jhamtani.netlify.app</p>
      </aside>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#191f26]/8 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
