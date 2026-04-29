/** Синхронно: remotes на этой вкладке не должны запускать свой bootstrap (см. client/admin index.ts). */
(globalThis as unknown as { __GYM_MF_HOST__?: boolean }).__GYM_MF_HOST__ = true;

void import('./bootstrap');
