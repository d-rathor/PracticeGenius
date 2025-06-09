import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Extend with any custom attributes/props
    className?: string;
  }
}

declare module 'next/link';
declare module 'next/image';
