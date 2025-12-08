import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type RoomId = 'archive' | 'well' | 'network';

export interface KeyFragments {
  archive: boolean;
  well: boolean;
  network: boolean;
}

export interface StorylineCompletion {
  archive: boolean;
  well: boolean;
  network: boolean;
}

export interface GameProgress {
  keys: KeyFragments;
  completion: StorylineCompletion;
}
