import {
  type UniqueIdentifier,
  type CollisionDetection,
  type DragCancelEvent,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  type Items,
  createRange,
  TRASH_ID,
  PLACEHOLDER_ID,
  getfindContainerLabel,
  checkBelowOver,
  getcreateContainerLabel,
} from "../methods";
import React, { createContext, useState, useRef, useCallback } from "react";
import {  unstable_batchedUpdates } from "react-dom";

export interface ContainerArrayContextProps {
  activeId: UniqueIdentifier | null;
  setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>;
  lastOverId: React.MutableRefObject<UniqueIdentifier | null>;
  justMovedInNew: React.MutableRefObject<Boolean>;
  containerDragged: Boolean;
  detectCollisionStrategy: CollisionDetection;
  containerCollection: Items;
  setContainerCollection: React.Dispatch<React.SetStateAction<Items>>;
  containerLabels: UniqueIdentifier[];
  setContainerLabels: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>;
  savedContainerCollection: Items | null;
  setSavedContainerCollection: React.Dispatch<
    React.SetStateAction<Items | null>
  >;
  cancelDrag: (event: DragCancelEvent) => void;
  startDrag: (event: DragStartEvent) => void;
  overDrag: (event: DragOverEvent) => void;
  endDrag: (event: DragEndEvent) => void;
  removeContainer: (containerID: UniqueIdentifier) => void;
  addContainer: () => void;
}

export const ContainerArrayContext = createContext<
  Partial<ContainerArrayContextProps>
>({});

export const ContainerArrayProvider = ({
  children,
  bags,
  itemCount,
}: { children: React.ReactNode } & { bags: Items; itemCount: number }) => {
  const [collection, setCollection] = useState<Items>(
    bags ?? { A: createRange(itemCount, (index) => `A${index+1}`) }
  );
  const [containerLabels, setContainerLabels] = useState<UniqueIdentifier[]>(
    Object.keys(collection) as UniqueIdentifier[]
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const justMovedInNew = useRef(false);
  const containerDragged =
    (activeId
      ? containerLabels && containerLabels.includes(activeId)
      : false) ?? false;
  const [savedContainerCollection, setSavedContainerCollection] =
    useState<Items | null>(null);

  const detectCollisionStrategy: CollisionDetection = useCallback(
    (args) => {
      // here is to locate the outer container (i.e. column A, B, ...)
      // if yes, the key of items will be matched, that dragged item is outer container

      if (activeId && activeId in collection) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (drappableitem) => drappableitem.id in collection
          ),
        });
      }

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);

      // the first collision is outer container
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

        if (overId in collection) {
          // here if overlapped outer container is found

          const containerItems = collection[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id)
              ),
            })[0]?.id;

            //rework the actual overlapped item within the outer container located before
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (justMovedInNew.current) {
        console.log(` when new container is true ?? `, justMovedInNew.current)
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];      

    },
    [activeId, collection]
  );

  const cancelDrag = () => {
    if (savedContainerCollection) {
      setCollection(savedContainerCollection);
    }
    setActiveId(null);
    setSavedContainerCollection(null);
  };
  const startDrag = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setSavedContainerCollection(collection);
  };



  const findContainer = getfindContainerLabel(collection);
  const createCollectionLabel = getcreateContainerLabel(collection);

  const removeCollection=(removeLabel: UniqueIdentifier)=>{
    setContainerLabels((containerList)=> containerList.filter((id)=> id!== removeLabel))
    
  }  
  const newCollection = ()=>{
    const newcontainerLabel = createCollectionLabel();
    unstable_batchedUpdates(()=>{
      setContainerLabels((containerList)=> [...containerList, newcontainerLabel]);
      setCollection((collectionlist)=>({
        ...collectionlist,
        [newcontainerLabel]: [],
      }))
    })
  }


  const endDrag = ({ active, over }: DragEndEvent) => {
    const activeId = active.id;
    const overId = over?.id;
    if (overId && activeId in collection) {
      // case deal with container being dragged
      setContainerLabels((containerlist) => {
        const activePos = containerlist.indexOf(activeId);
        const overPos = containerlist.indexOf(overId);

        return arrayMove(containerlist, activePos, overPos);
      });
    }

    const activeCollectionLabel = findContainer(activeId);

    if (!activeCollectionLabel) {
      // it seems impossible if dragged item from no container
      console.log(` can active id with no container ?? `, active);
      setActiveId(null);
      return;
    }
    if (overId == null) {
      console.log(` can over id empty ?? `, over);
      setActiveId(null);
      return;
    }
    // case move item to trash
    if (overId === TRASH_ID) {
      setCollection((collectionlist) => ({
        ...collectionlist,
        [activeCollectionLabel]: collectionlist[activeCollectionLabel].filter(
          (id) => id !== activeId
        ),
      }));
      setActiveId(null);
      return;
    }
    // case move item to new collection
    if (overId === PLACEHOLDER_ID) {
      const newCollectionLabel = createCollectionLabel();

      unstable_batchedUpdates(() => {
        setContainerLabels((containerlist) => [
          ...containerlist,
          newCollectionLabel,
        ]);
        setCollection((collectionlist) => ({
          ...collectionlist,
          [activeCollectionLabel]: collectionlist[activeCollectionLabel].filter(
            (id) => id !== activeId
          ),
          [newCollectionLabel]: [activeId],
        }));
        setActiveId(null);
      });
      return;
    }

    // case item dragged within container

    const overCollectionLabel = findContainer(overId);

    console.log(` active label `, activeCollectionLabel, ` over collection label `, overCollectionLabel )

    if (overCollectionLabel) {
      const activePos = collection[activeCollectionLabel].indexOf(activeId);
      const overPos = collection[overCollectionLabel].indexOf(overId);
      if (activePos !== overPos) {
        console.log(` try create new ele within collection `)
        setCollection((collectionlist) => ({
          ...collectionlist,
          [overCollectionLabel]: arrayMove(
            collectionlist[overCollectionLabel],
            activePos,
            overPos
          ),
        }));
      }
    }

    setActiveId(null);
  };

  const overDrag = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;
    const activeId = active.id;
    if (overId == null || overId === TRASH_ID || active.id in collection) {
      return;
    }
    // active item in particular collection will be processed here
    const overCollectionLabel = findContainer(overId);
    const activeCollectionLabel = findContainer(activeId);

    if (!overCollectionLabel || !activeCollectionLabel) {
      // only over placeholder collection will not be processed here
      return;
    }

    // move item from one collection to another
    if (activeCollectionLabel !== overCollectionLabel) {
      setCollection((collectionlist) => {
        const activelist = collectionlist[activeCollectionLabel];
        const overlist = collectionlist[overCollectionLabel];
        const overPos = overlist.indexOf(overId);
        const activePos = activelist.indexOf(activeId);

        let newPos: number = -1;
        if (overId in collectionlist) {
          // when overid is container, implies that no item in that container
          console.log(` empty collection with active `,collectionlist[activeCollectionLabel][activePos])

          newPos = overlist.length + 1;
        } else {
          // happen when active item enter into region of another collection with first over item
          // no considering if active item further moving around inside the over collection
          const modifier = checkBelowOver(over, active) ? 1 : 0;

          // no over item id (means it just over container id) => item count +1
          newPos = overPos > 0 ? overPos + modifier : overlist.length + 1;
        }
        justMovedInNew.current = true;

        // please remove following dummy if ready
        return {
          ...collectionlist,
          [activeCollectionLabel]: collectionlist[activeCollectionLabel].filter(
            (ele) => ele !== activeId
          ),
          [overCollectionLabel]: [
            ...collectionlist[overCollectionLabel].slice(0, newPos),
            collectionlist[activeCollectionLabel][activePos],
            ...collectionlist[overCollectionLabel].slice(
              newPos,
              collectionlist[overCollectionLabel].length
            ),
          ],
        };
      });
    }
  };

  return (
    <ContainerArrayContext.Provider
      value={{
        containerCollection: collection,
        setContainerCollection: setCollection,
        containerLabels,
        setContainerLabels,
        activeId,
        setActiveId,
        lastOverId,
        justMovedInNew,
        containerDragged,
        savedContainerCollection,
        setSavedContainerCollection,
        cancelDrag,
        startDrag,
        overDrag,
        endDrag,
        detectCollisionStrategy,
        addContainer: newCollection,
        removeContainer: removeCollection
      }}
    >
      {children}
    </ContainerArrayContext.Provider>
  );
};

export default ContainerArrayContext;
