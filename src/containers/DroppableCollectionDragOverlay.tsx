import React from "react";
import { DragOverlayItemStyle, DragOverlayWrapperStyle, Items, getColor, getfindIndex } from "../methods";
import { Container, Item } from "../components";
import { UniqueIdentifier } from "@dnd-kit/core";

interface CollectionDragOverlayProps {
  columns: number;
  overlayLabel: string;
  collectionId: UniqueIdentifier;
  containerCollection: Items;
  handle?: boolean;
  renderItem?: any;
  getItemStyles?: DragOverlayItemStyle;
  getWrapperStyle?: DragOverlayWrapperStyle;
}

const DroppableCollectionDragOverlay = ({
columns,
overlayLabel,
collectionId,
containerCollection,
handle,
renderItem,
getItemStyles,
getWrapperStyle
}: CollectionDragOverlayProps

) => {
  // only invoke with container dragged.

  const getIndex = getfindIndex(containerCollection);

  return (
    <Container
      label={overlayLabel}
      columns={columns}
      style={{
        height: "100%",
      }}
      shadow
      unstyled={false}
    >
      {containerCollection[collectionId].map((item, index) => (
        <Item
          key={item}
          value={item}
          handle={handle}
          style={
            getItemStyles
              ? getItemStyles({
                  containerId: collectionId,
                  overIndex: -1,
                  index: getIndex(item),
                  value: item,
                  isDragging: false,
                  isSorting: false,
                  isDragOverlay: false,
                })
              : {}
          }
          color={getColor(item)}
          wrapperStyle={getWrapperStyle ? getWrapperStyle({ index }) : {}}
          renderItem={renderItem}
        />
      ))}
    </Container>
  );
};

export default DroppableCollectionDragOverlay;
