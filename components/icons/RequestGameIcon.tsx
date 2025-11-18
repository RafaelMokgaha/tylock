import React from 'react';

const RequestGameIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25H7.5a1.5 1.5 0 00-1.5 1.5v4.5a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5v-4.5a1.5 1.5 0 00-1.5-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12H4.5m10.5 0H19.5m-7.5-3.75V4.5m0 15v-3.75" />
    </svg>
);

export default RequestGameIcon;