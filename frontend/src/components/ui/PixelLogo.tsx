import React from "react";

export const PixelLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    shapeRendering="crispEdges" // This is key for the pixel look
  >
    {/* 'C' */}
    <rect x="2" y="4" width="8" height="2" />
    <rect x="2" y="6" width="2" height="12" />
    <rect x="2" y="18" width="8" height="2" />
    {/* 'F' */}
    <rect x="12" y="4" width="8" height="2" />
    <rect x="12" y="6" width="2" height="6" />
    <rect x="12" y="11" width="6" height="2" />
    <rect x="12" y="13" width="2" height="7" />
  </svg>
);
