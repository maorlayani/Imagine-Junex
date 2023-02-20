import React, { useState, useRef, useEffect, useCallback, MutableRefObject } from 'react';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Typography } from '@material-ui/core';
import { DraggedItemType, draggedItemAtom } from '../atoms/draggedItemAtom';
import { draggedItemZIndexAtom } from '../atoms/draggedItemZIndexAtom';

export interface DraggablePanelProps {
	contentRef: MutableRefObject<HTMLDivElement | null>;
	title: string;
	draggedItemType: DraggedItemType;
}

export const DraggablePanel = React.memo(({ contentRef, title, draggedItemType }: DraggablePanelProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			backgroundColor: '#222',
			padding: '0 4px 4px 4px',
			userSelect: 'none',
			cursor: 'move',
		},
		title: {
			color: '#eee',
			fontSize: 14,
		},
	}));
	const classes = useStyles();

	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [contentPosition, setContentPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const setDraggedItem = useSetRecoilState(draggedItemAtom);
	const resetDraggedItem = useResetRecoilState(draggedItemAtom);
	const [draggedItemZIndex, setDraggedItemZIndex] = useRecoilState(draggedItemZIndexAtom);

	const handleMouseDown = useCallback(
		function handleMouseDown(e) {
			if (e.button !== 0) {
				return;
			}
			setMousePosition({ x: e.clientX, y: e.clientY });
			setIsDragging(true);
			setDraggedItem(draggedItemType);
			e.stopPropagation();
			e.preventDefault();
			if (contentRef.current) {
				contentRef.current.style.zIndex = '1000000';
			}
		},
		[setDraggedItem, draggedItemType, contentRef],
	);

	const handleMouseMove = useCallback(
		function handleMouseMove(e) {
			if (!isDragging) {
				return;
			}
			const deltaX = e.clientX - mousePosition.x;
			const deltaY = e.clientY - mousePosition.y;
			if (deltaX === 0 && deltaY === 0) {
				return;
			}
			setMousePosition({ x: e.clientX, y: e.clientY });
			setContentPosition((p) => ({ x: p.x + deltaX, y: p.y + deltaY }));
			if (contentRef.current) {
				contentRef.current.style.left = `${contentPosition.x + deltaX}px`;
				contentRef.current.style.top = `${contentPosition.y + deltaY}px`;
			}
		},
		[isDragging, mousePosition, contentPosition, contentRef],
	);

	const handleMouseUp = useCallback(
		function handleMouseUp(e) {
			if (!isDragging) {
				return;
			}
			setIsDragging(false);
			resetDraggedItem();
			e.stopPropagation();
			e.preventDefault();
			if (contentRef.current) {
				contentRef.current.style.zIndex = draggedItemZIndex.toString();
				setDraggedItemZIndex(draggedItemZIndex + 10);
			}
		},
		[isDragging, resetDraggedItem, contentRef, draggedItemZIndex, setDraggedItemZIndex],
	);

	useEffect(
		function setUpDragMouseEvents() {
			const panel = panelRef.current;
			if (!panel) {
				return;
			}
			panel.addEventListener('mousedown', handleMouseDown);
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			return () => {
				panel.removeEventListener('mousedown', handleMouseDown);
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};
		},
		[handleMouseDown, handleMouseMove, handleMouseUp],
	);

	return (
		<div id="DraggablePanel" ref={panelRef} className={classes.root}>
			<Typography className={classes.title}>{title}</Typography>
		</div>
	);
});
