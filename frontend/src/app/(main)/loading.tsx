/** Suspense-граница сегмента `(main)`: пока грузятся вложенные RSC-страницы. */
export default function MainLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-zinc-100">
      <p className="text-lg font-medium text-teal-700 animate-pulse">Загрузка раздела…</p>
    </div>
  );
}
