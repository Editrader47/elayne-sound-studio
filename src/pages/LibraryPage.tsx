import { LibraryGrid } from '@/components/library/LibraryGrid';

const LibraryPage = () => {
  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Library
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All your generated tracks in one place
        </p>
      </div>

      <LibraryGrid />
    </div>
  );
};

export default LibraryPage;
