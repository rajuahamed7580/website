'use client';

import React from 'react';

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <a href="/" className="flex items-center space-x-2 shrink-0">
        <span className="text-xl font-bold italic tracking-tight text-blue-600">
          PrivateDelights
        </span>
      </a>
      <nav
        aria-label="Primary navigation"
        className="flex items-center space-x-4 sm:space-x-6 text-xs text-gray-600 font-medium shrink-0"
      >
        <a
          href="#"
          aria-label="Locations"
          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
        >
          <span aria-hidden="true" className="text-base sm:text-xs leading-none">
            📍
          </span>
          <span className="hidden sm:inline">Locations</span>
        </a>
        <a
          href="#"
          aria-label="Search"
          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
        >
          <span aria-hidden="true" className="text-base sm:text-xs leading-none">
            🔍
          </span>
          <span className="hidden sm:inline">Search</span>
        </a>
        <a
          href="#"
          aria-label="Login"
          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 sm:w-3.5 sm:h-3.5"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="hidden sm:inline">Login</span>
        </a>
      </nav>
    </header>
  );
}
