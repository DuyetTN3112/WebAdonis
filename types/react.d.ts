import { ReactNode } from 'react';

declare module '@/components/ui/*' {
  export interface BaseProps {
    className?: string;
    children?: ReactNode;
  }

  export interface ButtonProps extends BaseProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }

  export interface InputProps extends BaseProps {
    type?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  }

  export interface CardProps extends BaseProps {
    title?: string;
  }

  export interface AvatarProps extends BaseProps {
    src?: string;
    alt?: string;
  }

  export interface DialogProps extends BaseProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
} 