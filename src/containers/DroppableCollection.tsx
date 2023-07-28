import React from "react";
import { type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from "@dnd-kit/sortable";
import { type ContainerProps, Container } from "../components";
import { animateLayoutChanges } from "../methods";

export const DroppableCollection = ({
  children,
  columns = 1,
  disabled,
  id,
  collection,
  style,
  ...props
}: ContainerProps & { disabled?: boolean; id: UniqueIdentifier; collection: UniqueIdentifier[]; style?: React.CSSProperties }) => {
  const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform } = useSortable({
    id,
    data: { type: "container", children: collection },
    animateLayoutChanges,
  });

  // the type is passed through useSortable by data properties
  // data.current is from setNodeRef
  const isOverContainer = over ? (id === over.id && active?.data.current?.type !== "container") || collection.includes(over.id) : false;

  // check only item over container to give hover background color

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
};

export default DroppableCollection;
