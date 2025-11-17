import React from 'react';

const logoSrc = 'https://static.wixstatic.com/media/d0b81f_b3c60b745cf94cd99e776e19d98d4058~mv2.png';

// FIX: Changed props type from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement>
// to match the returned <img> element.
const LogoIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img 
    src={logoSrc}
    alt="Tylock Games Logo"
    {...props}
  />
);

export default LogoIcon;