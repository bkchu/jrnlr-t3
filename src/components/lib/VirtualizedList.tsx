import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ReactNode, useEffect } from "react";

type VirtualizedListProps<T> = {
  data: T[];
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage(): void;
  children(item: T): ReactNode;
  estimateSize(index: number): number;
};

export const VirtualizedList = <T,>({
  children,
  data,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  estimateSize,
}: VirtualizedListProps<T>) => {
  const rowVirtualizer = useWindowVirtualizer({
    count: hasNextPage ? data.length + 1 : data.length,
    estimateSize,
    overscan: 50,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= data.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasNextPage,
    fetchNextPage,
    data.length,
    isFetchingNextPage,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <div className="relative w-full">
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const isLoaderRow = virtualRow.index > data.length - 1;
        const item = data[virtualRow.index];

        return (
          <div
            key={virtualRow.index}
            ref={virtualRow.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{
              minHeight: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {isLoaderRow
              ? hasNextPage
                ? "Loading more..."
                : "Nothing more to load"
              : children(item as T)}
          </div>
        );
      })}
    </div>
  );
};
