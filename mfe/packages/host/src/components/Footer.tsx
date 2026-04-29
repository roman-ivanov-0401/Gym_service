import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-zinc-500">
        <span>GymApp — система управления залом</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
