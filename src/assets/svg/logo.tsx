import type { SVGAttributes } from 'react';

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="8" width="112" height="112" rx="30" fill="black" className="dark:fill-white" />
      <path
        d="M28 86H48L60 52L72 76L84 40L100 86"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:stroke-black"
      />
      <circle cx="28" cy="86" r="6" fill="white" className="dark:fill-black" />
      <circle cx="60" cy="52" r="6" fill="white" className="dark:fill-black" />
      <circle cx="84" cy="40" r="6" fill="white" className="dark:fill-black" />
      <circle cx="100" cy="86" r="6" fill="white" className="dark:fill-black" />
    </svg>
  );
};

export default Logo;
