import { memo, useCallback, useRef, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useRecoilValue } from 'recoil';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { draggedItemAtom, DraggedItemType } from '../atoms/draggedItemAtom';
import { DraggablePanel } from './DraggablePanel';
import Box from '@material-ui/core/Box';
import { FigurenotesHelper } from '../services/figurenotesHelper';
import { SoundHelper } from '../services/soundHelper';

export interface BoomWhackerProps {
	onBoomWhackerNote: Function;
}

export const BoomWhacker = memo(({ onBoomWhackerNote }: BoomWhackerProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'absolute',
			left: 0,
			top: 17,
			backgroundColor: '#222',
			userSelect: 'none',
			borderRadius: 4,
			padding: 4,
		},
		rootCollapsed: {
			width: 160,
			paddingBottom: '0 !important',
		},
		expandCollapseButton: {
			position: 'absolute',
			top: 3,
			right: 6,
			cursor: 'pointer',
			color: '#ccc',
		},
		content: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		},
		contentCollapsed: {
			height: 0,
			padding: 0,
			overflow: 'hidden',
		},
		keynotes: {
			display: 'flex',
			alignItems: 'flex-end',
			backgroundColor: '#444',
			padding: 10,
			gap: 8,
		},
		boomWhackerStick: {
			display: 'flex',
			width: 18,
			color: 'black',
			fontWeight: 500,
			borderRadius: '4px',
			justifyContent: 'center',
			alignItems: 'center',
			cursor: 'pointer',
			transition: '0.4s',
			'&:hover': {
				transform: 'scale(1.2)',
			},
		},
	}));
	const classes = useStyles();
	const [isExpanded, setIsExpanded] = useState(true);
	const draggedItem = useRecoilValue(draggedItemAtom);
	const draggablePanelContentRef = useRef(null);
	// Expand handlers
	const handleClickExpand = useCallback(function handleClickExpand() {
		setIsExpanded(true);
	}, []);
	const handleClickCollapse = useCallback(function handleClickCollapse() {
		setIsExpanded(false);
	}, []);
	// Voice effects:
	const startNote = useCallback(
		function startNote(noteName: string) {
			const octaveNumber = noteName.includes('-oct') ? 5 : 4;
			const noteFullName = noteName[0] + octaveNumber;
			SoundHelper.startNote(noteFullName);
			if (onBoomWhackerNote) {
				onBoomWhackerNote(noteFullName);
			}
		},
		[onBoomWhackerNote],
	);

	const stopNote = useCallback(function stopNote(noteName: string) {
		const octaveNumber = noteName.includes('-oct') ? 5 : 4;
		SoundHelper.stopNote(noteName[0] + octaveNumber);
	}, []);

	const handleMouseDown = useCallback(
		function handleMouseDown(e) {
			startNote(e.currentTarget.dataset['noteName']);
		},
		[startNote],
	);

	const handleMouseUp = useCallback(
		function handleMouseUp(e) {
			stopNote(e.currentTarget.dataset['noteName']);
		},
		[stopNote],
	);
	const handleMouseEnter = useCallback(
		function handleMouseEnter(e) {
			const isMouseButtonPressed = 'buttons' in e ? e.buttons === 1 : (e.which || e.button) === 1;
			if (isMouseButtonPressed && draggedItem === DraggedItemType.NA) {
				startNote(e.currentTarget.dataset['noteName']);
			}
		},
		[draggedItem, startNote],
	);

	const handleMouseLeave = useCallback(
		function handleMouseLeave(e) {
			stopNote(e.currentTarget.dataset['noteName']);
		},
		[stopNote],
	);
	return (
		<div id="BoomWhacker" ref={draggablePanelContentRef} className={`${classes.root} ${isExpanded ? '' : classes.rootCollapsed}`}>
			{/* Dragging feature, display for minimized widget and expanded (full content) */}
			<DraggablePanel contentRef={draggablePanelContentRef} title="Boomwhacker" draggedItemType={DraggedItemType.BW_PANEL} />
			{!isExpanded && <ExpandMoreIcon onClick={handleClickExpand} className={classes.expandCollapseButton} />}
			{isExpanded && <ExpandLessIcon onClick={handleClickCollapse} className={classes.expandCollapseButton} />}
			<Box className={`${classes.content} ${isExpanded ? '' : classes.contentCollapsed}`}>
				<Box className={`${classes.keynotes}`}>
					{['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C-oct'].map((note, idx, arr) => {
						return (
							<Box
								key={`boomwhacker-note-${note}`}
								className={classes.boomWhackerStick}
								style={{ height: `${(arr.length - idx) * 14 + 16}px`, backgroundColor: FigurenotesHelper.getNoteColor(note, true) }}
								data-note-name={note}
								onMouseEnter={handleMouseEnter}
								onMouseLeave={handleMouseLeave}
								onMouseDown={handleMouseDown}
								onMouseUp={handleMouseUp}
							>
								{note[0]}
							</Box>
						);
					})}
				</Box>
			</Box>
		</div>
	);
});
