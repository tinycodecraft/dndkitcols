import { type UniqueIdentifier, KeyboardCode } from "@dnd-kit/core";

export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

export const EMPTYFC = () => ({});

export const keydirections: string[] = [KeyboardCode.Down, KeyboardCode.Right, KeyboardCode.Up, KeyboardCode.Left];

export type DragOverlayItemStyle = (args: {
  value: UniqueIdentifier;
  index: number;
  overIndex: number;
  isDragging: boolean;
  containerId: UniqueIdentifier;
  isSorting: boolean;
  isDragOverlay: boolean;
}) => React.CSSProperties;

export type DragOverlayWrapperStyle = (args: { index:number })=> React.CSSProperties;

export const getfindContainerLabel = (collection: Items) => (id: UniqueIdentifier) => {
  if (id in collection) {
    return id;
  }

  return Object.keys(collection).find((key) => collection[key].includes(id));
};

// try to get the index under container
export const getfindIndex = (collection: Items) => (id: UniqueIdentifier) => {
  const findContainer = getfindContainerLabel(collection);

  const container = findContainer(id);

  if (!container) {
    return -1;
  }

  const index = collection[container].indexOf(id);

  return index;
};

export const getcreateContainerLabel = (collection: Items) => () => {
  const containerIds = Object.keys(collection);
  const lastContainerId = containerIds[containerIds.length - 1];

  return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
};

export const getColor = (id: UniqueIdentifier) => {
  switch (String(id)[0]) {
    case "A":
      return "#7193f1";
    case "B":
      return "#ffda6c";
    case "C":
      return "#00bcd4";
    case "D":
      return "#ef769f";
  }

  return undefined;
};
export const TRASH_ID = "void";
export const PLACEHOLDER_ID = "placeholder";
export const NOTHING: UniqueIdentifier[] = [];
