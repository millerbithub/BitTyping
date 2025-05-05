"use client";

import { JSX } from "react";
import React from "react";
interface ProfileStats {
  latestWPM: number;
  bestWPM: number;
  totalTests: number;
}

export default function ProfilePage({
  stats,
}: {
  stats: ProfileStats;
}): JSX.Element {
  const { latestWPM, bestWPM, totalTests } = stats;
  const isNewRecord = latestWPM > bestWPM;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <header className="flex items-center space-x-4 mb-12">

        <h1 className="text-3xl font-bold">Your Typing Profile</h1>
      </header>

      {/* Latest WPM */}
      <section className="relative bg-white rounded-2xl p-8 shadow-md w-full max-w-md text-center">
        <div className="text-gray-500">Latest WPM</div>
        <div className="mt-2 text-6xl font-extrabold">
          {latestWPM}
        </div>
        {isNewRecord && (
          <span className="absolute top-4 right-4 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full animate-pulse">
            🥳 New Record!
          </span>
        )}
      </section>

      {/* Secondary Stats */}
      <section className="mt-8 grid grid-cols-2 gap-6 w-full max-w-md">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="text-gray-500">Best WPM</div>
          <div className="mt-1 text-3xl font-semibold">
            {Math.max(latestWPM, bestWPM)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="text-gray-500">Total Tests</div>
          <div className="mt-1 text-3xl font-semibold">
            {totalTests}
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="mt-12 space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          Retake Test
        </button>
        <button
          onClick={() => alert("Share your new record!")}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Share
        </button>
      </section>
    </main>
  );
}
