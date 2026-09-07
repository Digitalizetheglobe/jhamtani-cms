import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaPenFancy,
  FaInbox,
  FaQuoteRight,
  FaImage,
  FaWpforms,
  FaArrowRight,
} from "react-icons/fa";
import { getProjects } from "../api/projectApi";
import PageShell from "../components/PageShell";

const MODULES = [
  {
    to: "/project-management",
    title: "Projects",
    subtitle: "ACE homes, XO Series, studios & commercial",
    icon: FaBuilding,
  },
  {
    to: "/blog-management/list",
    title: "Perspectives",
    subtitle: "Blogs that build tomorrow",
    icon: FaPenFancy,
  },
  {
    to: "/leads-management",
    title: "Quick Enquiry",
    subtitle: "Website lead forms & submissions",
    icon: FaInbox,
  },
  {
    to: "/testimonialmanagement",
    title: "Customer Stories",
    subtitle: "Their stories. Our legacy.",
    icon: FaQuoteRight,
  },
  {
    to: "/banner-management",
    title: "Homepage Banners",
    subtitle: "Hero and campaign media",
    icon: FaImage,
  },
  {
    to: "/form-management",
    title: "Form Builder",
    subtitle: "Contact and enquiry forms",
    icon: FaWpforms,
  },
];

export const Home = () => {
  const { admin } = useAdminAuth();
  const name = admin?.name || "Admin";
  const [projectCount, setProjectCount] = useState(null);
  const [activeCount, setActiveCount] = useState(null);

  useEffect(() => {
    getProjects()
      .then((res) => {
        const list = res?.data || [];
        setProjectCount(list.length);
        setActiveCount(list.filter((p) => p.isActive).length);
      })
      .catch(() => {
        setProjectCount(null);
        setActiveCount(null);
      });
  }, []);

  return (
    <PageShell>
      <div className="space-y-8 lg:space-y-10">
        <section className="relative overflow-hidden rounded-2xl bg-[#191f26] text-white px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#C5A880]/20 to-transparent pointer-events-none" />
          <p className="text-[#C5A880] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
            The Name Is A Promise
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-2 tracking-tight">
            Welcome back, {name}
          </h1>
          <p className="mt-3 text-white/70 max-w-xl text-sm sm:text-base">
            Manage listings, stories, and enquiries for{" "}
            <a
              href="https://jhamtani.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="text-[#C5A880] hover:underline"
            >
              jhamtani.netlify.app
            </a>
            .
          </p>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Projects" value={projectCount ?? "—"} hint="Live listings" />
          <StatCard label="Active" value={activeCount ?? "—"} hint="Visible on site" />
          <StatCard label="Ongoing" value="8" hint="Current developments" />
          <StatCard label="Legacy" value="40+" hint="Years of trust" />
        </section>

        <section>
          <div className="flex items-end justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-[#191f26]">Workspace</h2>
              <p className="text-sm text-[#5B584C] mt-1">Everything you need to run the public site</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {MODULES.map((mod) => (
              <Link key={mod.to} to={mod.to} className="group">
                <article className="cms-card h-full p-5 sm:p-6 transition duration-300 group-hover:border-[#C5A880] group-hover:shadow-md">
                  <div className="w-11 h-11 rounded-xl bg-[#C5A880]/15 text-[#A0725B] flex items-center justify-center mb-4">
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#191f26]">{mod.title}</h3>
                  <p className="mt-1 text-sm text-[#5B584C] leading-relaxed">{mod.subtitle}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#A0725B] group-hover:gap-3 transition-all">
                    Open <FaArrowRight className="w-3 h-3" />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
};

const StatCard = ({ label, value, hint }) => (
  <div className="cms-card p-4 sm:p-5">
    <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#5B584C] font-semibold">{label}</p>
    <p className="font-display text-3xl sm:text-4xl text-[#191f26] mt-1 leading-none">{value}</p>
    <p className="text-xs text-gray-500 mt-2 hidden sm:block">{hint}</p>
  </div>
);

export default Home;
