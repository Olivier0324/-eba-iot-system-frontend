import { Eye } from 'lucide-react';
import React from 'react'

function Logo({ fn }) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={fn}
    >
      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-eco-500 to-ocean-500 flex items-center justify-center">
        <Eye className="w-4 h-4 text-white" />
      </div>
      <span className="text-lg font-bold text-gray-900">EBA</span>
      <span className="text-lg font-bold bg-linear-to-r from-eco-600 to-ocean-600 bg-clip-text text-transparent">
        OBSERVA
      </span>
    </div>
  );
}

export default Logo