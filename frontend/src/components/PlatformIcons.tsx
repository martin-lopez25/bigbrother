/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 1. Internet / Web News Logo (Globo terráqueo con paralelos y meridianos de internet)
export const InternetLogo: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Logo de Internet y Prensa Web"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// 2. YouTube Logo (Icono oficial de YouTube con botón de reproducción)
export const YouTubeLogo: React.FC<IconProps & { filled?: boolean }> = ({
  className = 'w-4 h-4',
  size = 16,
  filled = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#FF0000' : 'currentColor'}
    className={className}
    aria-label="Logo de YouTube"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// 3. Instagram Logo (Glifo oficial de cámara y lente de Instagram)
export const InstagramLogo: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Logo de Instagram"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
  </svg>
);

// 4. Meta Logo (Emblema de bucle infinito de Meta)
export const MetaLogo: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-label="Logo de Meta"
  >
    <path d="M16.993 4.25c-2.316 0-4.321 1.258-5.003 3.036-.683-1.778-2.688-3.036-5.004-3.036C3.12 4.25 0 7.37 0 11.237c0 4.394 3.738 8.513 6.986 8.513 2.316 0 4.321-1.258 5.004-3.036.682 1.778 2.687 3.036 5.003 3.036 3.248 0 6.986-4.119 6.986-8.513 0-3.867-3.12-6.987-6.986-6.987zm-10.007 13.06c-1.895 0-4.55-2.909-4.55-6.073 0-2.52 1.954-4.547 4.55-4.547 1.83 0 3.395 1.137 4.14 2.871l-1.353 1.353a2.71 2.71 0 0 0-.74-1.328 2.213 2.213 0 0 0-1.587-.656c-1.29 0-2.34 1.05-2.34 2.34 0 1.29 1.05 2.34 2.34 2.34.61 0 1.17-.23 1.587-.656l1.353 1.353c-.745 1.734-2.31 2.871-4.14 2.871zm10.007 0c-1.83 0-3.395-1.137-4.14-2.871l1.353-1.353c.417.426.977.656 1.587.656 1.29 0 2.34-1.05 2.34-2.34 0-1.29-1.05-2.34-2.34-2.34a2.213 2.213 0 0 0-1.587.656l-1.353-1.353c.745-1.734 2.31-2.871 4.14-2.871 2.596 0 4.55 2.027 4.55 4.547 0 3.164-2.655 6.073-4.55 6.073z" />
  </svg>
);

// 5. X Logo (Anteriormente Twitter)
export const XLogo: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-label="Logo de X"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
