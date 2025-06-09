import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'next/link';
declare module 'next/image';
declare module 'react';
declare module 'react-dom';
