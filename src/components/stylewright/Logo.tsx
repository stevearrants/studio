import { BookMarked } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <BookMarked className="h-7 w-7 sm:h-8 sm:w-8" />
      <h1 className="text-2xl sm:text-3xl font-bold">StyleWright</h1>
    </div>
  );
}
