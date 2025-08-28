import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
    <path
      d="M8 22V10H10.5L18.5 18V10H21V22H18.5L10.5 14V22H8Z"
      fill="hsl(var(--primary-foreground))"
    />
  </svg>
);
