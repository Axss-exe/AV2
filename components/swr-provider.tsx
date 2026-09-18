'use client';

import { SWRConfig } from 'swr';

const fetcher = (url: string) => fetch(url).then((response) => response.json());

/**
 * App-wide SWR defaults tuned for perceived speed:
 * - `fetcher` so most hooks can omit the boilerplate `useSWR(key, fetcher)` fetcher arg.
 * - `dedupingInterval` collapses duplicate requests fired by multiple mounted
 *   components (e.g. the sidebar and top bar both reading /api/features) into one.
 * - `revalidateOnFocus`/`revalidateOnReconnect` disabled so switching tabs or
 *   briefly losing network doesn't trigger a refetch waterfall across every
 *   mounted hook at once, which was a major source of perceived slowness.
 * - `focusThrottleInterval` guards any component that does opt back into focus
 *   revalidation.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 15000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        focusThrottleInterval: 30000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
