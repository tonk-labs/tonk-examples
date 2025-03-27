
import { httpBatchLink } from '@trpc/client';
import { createTonkRPC } from '@tonk/react';
import type { AppRouter } from "../services/src/routers";
import { configureSyncEngine } from "@tonk/keepsync";

//Initialize the Tonk RPC client
const tonkRPC = createTonkRPC<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4080/api',
    }),
  ]
});
export const TonkProvider = tonkRPC.TonkProvider;
export const useTonk = tonkRPC.useTonk;
export const client = tonkRPC.client;

//Initialize the sync engine
export const configSync = () => {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${window.location.host}/sync`;

  configureSyncEngine({
    url: wsUrl,
    onSync: (docId) => console.log(`Document ${docId} synced`),
    onError: (error) => console.error("Sync error:", error),
  });
}
