import React from 'react';

const logoSrc = 'https://static.wixstatic.com/media/d0b81f_b3c60b745cf94cd99e776e19d98d4058~mv2.png';

const LogoIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img 
    src={logoSrc}
    alt="Tylock Games Logo"
    {...props}
  />
);

export default LogoIcon;