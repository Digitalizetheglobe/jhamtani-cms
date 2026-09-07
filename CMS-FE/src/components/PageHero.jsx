import React from 'react';

export const PageHero = ({ kicker, title, subtitle, children }) => (
  <section className="relative overflow-hidden rounded-2xl bg-[#191f26] text-white px-5 py-7 sm:px-8 sm:py-9">
    <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#C5A880]/20 to-transparent pointer-events-none" />
    <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
      <div>
        <p className="text-[#C5A880] text-xs font-semibold tracking-[0.2em] uppercase">{kicker}</p>
        <h1 className="font-display text-3xl sm:text-4xl mt-2 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-white/65 text-sm max-w-xl">{subtitle}</p>}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  </section>
);

export const StatCards = ({ items }) => (
  <section className={`grid grid-cols-2 ${items.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 sm:gap-4`}>
    {items.map((stat) => (
      <div key={stat.label} className="cms-card p-4 sm:p-5">
        <p className="text-[11px] uppercase tracking-wider text-[#5B584C] font-semibold">{stat.label}</p>
        <p className="font-display text-3xl sm:text-4xl text-[#191f26] mt-1 leading-none">{stat.value}</p>
        {stat.hint && <p className="text-xs text-gray-500 mt-2 hidden sm:block">{stat.hint}</p>}
      </div>
    ))}
  </section>
);

export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="cms-card border-dashed p-10 sm:p-14 text-center">
    {Icon && (
      <div className="w-16 h-16 bg-[#C5A880]/15 rounded-full flex items-center justify-center mx-auto mb-4 text-[#A0725B]">
        <Icon className="w-8 h-8" />
      </div>
    )}
    <h3 className="font-display text-2xl text-[#191f26]">{title}</h3>
    {message && <p className="text-[#5B584C] text-sm max-w-md mx-auto mt-2 mb-6">{message}</p>}
    {action}
  </div>
);

export default PageHero;
