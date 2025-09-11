import { ReactNode, useState, useEffect } from "react";
import { Fragment } from "react/jsx-runtime";
import { concatClasses } from "../functions/functions";
import Button from "./input/button";

export function InfiniteElementList(props: {
  itemsPerLoad: number;
  loadItems: (
    startIndex: number,
    itemCount: number
  ) => Promise<Array<ReactNode>>;
  emptyMessage?: ReactNode
}) {
  const [items, setItems] = useState<Array<ReactNode>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreItems, setIsMoreItems] = useState(true);

  const loadMore = async () => {
    if (!isLoading) {
      setIsLoading(true);
      const newItems = await props.loadItems(items.length, props.itemsPerLoad);
      if (newItems.length < props.itemsPerLoad) setIsMoreItems(false);
      setItems(items.concat(newItems))
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <>
      {items.map((post, i) => (
        <Fragment key={i}>{post}</Fragment>
      ))}
      {isMoreItems && (
        <Button key={-1}
          onClick={loadMore}
          className={concatClasses(isLoading && "no-access")}
        >
          {isLoading ? <l-dot-pulse color="white" /> : "More Posts"}
        </Button>
      )}
      {
        !isMoreItems && items.length === 0 && props.emptyMessage
      }
    </>
  );
}
