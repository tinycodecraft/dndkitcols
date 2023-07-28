import React, { useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  type KeyboardCoordinateGetter,
  type CancelDrop,  
  type Modifiers,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  DndContext,
  MeasuringStrategy,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, SortingStrategy, horizontalListSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  type Items,
  coordinateFinder,
  EMPTYFC,
  DragOverlayItemStyle,
  DragOverlayWrapperStyle,
  PLACEHOLDER_ID,
  getfindIndex,
  NOTHING,
  dropAnimation,
} from "../methods";
import ContainerArrayContext, { ContainerArrayContextProps } from "../tx/ContainerArrayContext";
import DrappableCollection, { DroppableCollection } from "./DroppableCollection";
import CollectionDragOverlay from "./DroppableCollectionDragOverlay";
import ItemDragOverlay from "./SortableItemDragOverlay";
import SortableItem from "./SortableItem";

interface SortableCollectorProps {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?: DragOverlayItemStyle;
  wrapperStyle?: DragOverlayWrapperStyle;
  
  items?: Items;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

const SortableCollector = ({
  adjustScale = false,
  
  cancelDrop,
  columns,
  handle = false,
  items: passedItems,
  containerStyle,
  coordinateGetter = coordinateFinder,
  getItemStyles = EMPTYFC,
  wrapperStyle = EMPTYFC,
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: SortableCollectorProps) => {
  const {
    containerCollection,    
    containerLabels,    
    activeId,
    justMovedInNew,
    containerDragged,
    detectCollisionStrategy,
    startDrag,
    overDrag,
    endDrag,
    cancelDrag,
    removeContainer,
    addContainer,
  } = useContext<Partial<ContainerArrayContextProps>>(ContainerArrayContext);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );
  useEffect(() => {
    requestAnimationFrame(() => {
      if (justMovedInNew) justMovedInNew.current = false;
    });
  }, [containerCollection, justMovedInNew]);

  const validDrop = containerCollection && containerLabels && removeContainer;
  const getIndex = getfindIndex(containerCollection!);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={detectCollisionStrategy}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={startDrag}
      onDragOver={overDrag}
      onDragEnd={endDrag}
      cancelDrop={cancelDrop}
      onDragCancel={cancelDrag}
      modifiers={modifiers}
    >
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          padding: 20,
          gridAutoFlow: vertical ? "row" : "column",
        }}
      >
        <SortableContext
          items={[...(containerLabels ?? []), PLACEHOLDER_ID]}
          strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          {validDrop &&
            containerLabels.map((containerId) => (
              <DrappableCollection
                key={containerId}
                id={containerId}
                label={minimal ? undefined : ` Column ${containerId}`}
                columns={columns}
                collection={containerCollection[containerId]}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                onRemove={() => removeContainer(containerId)}
              >
                <SortableContext items={containerCollection[containerId]} strategy={strategy}>
                  {containerCollection[containerId].map((value, index) => {
                    console.log(` key of sortable item render = `, value)
                    console.log(` the container collection is `, containerCollection)
                    return (
                      <SortableItem
                        disabled={containerDragged ? true : false}
                        key={value}
                        id={value}
                        index={index}
                        handle={handle}
                        style={getItemStyles}
                        wrapperStyle={wrapperStyle}
                        renderItem={renderItem}
                        containerId={containerId}
                        getIndex={getIndex}
                      />
                    );
                  })}
                </SortableContext>
              </DrappableCollection>
            ))}
          {minimal ? undefined : (
            <DroppableCollection
              id={PLACEHOLDER_ID}
              disabled={containerDragged ? true : false}
              collection={NOTHING}
              onClick={addContainer}
              placeholder
            >
              + Add column
            </DroppableCollection>
          )}
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {containerCollection && activeId ? (
            containerLabels?.includes(activeId) ? (
              <CollectionDragOverlay
                columns={columns ?? 1}
                overlayLabel={`Column ${activeId}`}
                collectionId={activeId}
                containerCollection={containerCollection}
                renderItem={renderItem}
              />
            ) : (
              <ItemDragOverlay
                id={activeId}
                handle={handle}
                getItemStyles={getItemStyles}
                getWrapperStyle={wrapperStyle}
                containerCollection={containerCollection}
                renderItem={renderItem}
              />
            )
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default SortableCollector;
