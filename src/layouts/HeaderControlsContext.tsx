import { createContext, useContext, useEffect } from 'react';

export type HeaderOptions = {
  showBack: boolean;
  backHref?: string;
};

type HeaderControlsContextValue = {
  setHeaderOptions: (options: HeaderOptions) => void;
};

export const HeaderControlsContext = createContext<HeaderControlsContextValue | null>(null);

const DEFAULT_HEADER_OPTIONS: HeaderOptions = {
  showBack: false,
  backHref: '/post',
};

export const useHeaderOptions = (options: HeaderOptions) => {
  const context = useContext(HeaderControlsContext);

  useEffect(() => {
    if (!context) {
      return;
    }

    context.setHeaderOptions(options);

    return () => {
      context.setHeaderOptions(DEFAULT_HEADER_OPTIONS);
    };
  }, [context, options]);
};

