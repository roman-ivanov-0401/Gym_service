/** На странице host не грузим bootstrap — иначе второй createRoot затирает shell без AuthProvider. */
if (!(globalThis as unknown as { __GYM_MF_HOST__?: boolean }).__GYM_MF_HOST__) {
  void import('./bootstrap');
}
