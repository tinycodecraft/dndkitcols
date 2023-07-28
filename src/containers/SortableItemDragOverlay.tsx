import { UniqueIdentifier } from "@dnd-kit/core";
import React from "react";
import { Item } from "../components";
import { Items, getfindContainerLabel, getfindIndex, getColor, DragOverlayItemStyle, DragOverlayWrapperStyle } from "../methods";

interface ItemDragOverlay {
  id: UniqueIdentifier;
  containerCollection: Items;
  renderItem?: any;
  getItemStyles?: DragOverlayItemStyle;
  getWrapperStyle?: DragOverlayWrapperStyle;
  handle?: boolean;
}

 const SortableItemDragOverlay = (
{ id,containerCollection, renderItem,getItemStyles,getWrapperStyle,handle }: ItemDragOverlay
) => {
  const findContainer = getfindContainerLabel(containerCollection);
  const getIndex = getfindIndex(containerCollection);
  const itemStyle = getItemStyles
    ? getItemStyles({
        containerId: findContainer(id) as UniqueIdentifier,
        overIndex: -1,
        index: getIndex(id),
        value: id,
        isSorting: true,
        isDragging: true,
        isDragOverlay: true,
      })
    : {};
  const wrapStyle = getWrapperStyle ? getWrapperStyle({ index: 0 }) : {};
  return <Item value={id} handle={handle} style={itemStyle} color={getColor(id)} wrapperStyle={wrapStyle} renderItem={renderItem} dragOverlay />;
};


export default SortableItemDragOverlay;