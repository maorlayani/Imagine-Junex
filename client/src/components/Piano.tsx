import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { MusicalHelper } from '../services/musicalHelper';
import { SoundHelper } from '../services/soundHelper';
import { FigurenotesHelper } from '../services/figurenotesHelper';
import { draggedItemAtom, DraggedItemType } from '../atoms/draggedItemAtom';
import { DraggablePanel } from './DraggablePanel';
import { AnalyticsHelper, EventCategory } from '../services/analyticsHelper';

export interface PianoProps {
	smallPiano: boolean;
	onPianoNote?: (noteFullName: string) => void;
}

export const Piano = React.memo(({ smallPiano, onPianoNote }: PianoProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'absolute',
			left: 0,
			top: 0,
			backgroundColor: '#222',
			userSelect: 'none',
			borderRadius: 8,
			padding: 20,
			'&.small-piano': {
				borderRadius: 4,
				padding: 4,
			},
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
		content: {},
		contentCollapsed: {
			height: 0,
			padding: 0,
			overflow: 'hidden',
		},
		controls: {
			display: 'flex',
			alignItems: 'center',
			height: 24,
			padding: '0 6px',
			borderTopLeftRadius: 4,
			borderTopRightRadius: 4,
			backgroundColor: '#444',
			margin: '8px 8px 6px 8px',
			'&.small-piano': {
				borderTopLeftRadius: 0,
				borderTopRightRadius: 0,
				margin: '0 4px 4px 4px',
			},
		},
		powerSwitch: {
			display: 'flex',
			alignItems: 'center',
		},
		powerSwitchText: {
			margin: '0 4px',
			color: '#ccc',
			fontSize: 12,
		},
		fnSymbolsSwitch: {
			display: 'flex',
			alignItems: 'center',
			marginLeft: 32,
			'&.small-piano': {
				marginLeft: 16,
			},
		},
		fnSymbolsSwitchText: {
			margin: '0 4px',
			color: '#ccc',
			fontSize: 12,
		},
		octaveSwitches: {
			display: 'flex',
			alignItems: 'center',
			height: '100%',
			marginLeft: 32,
			'&.small-piano': {
				marginLeft: 16,
			},
		},
		octaveSwitchesText: {
			margin: '0 4px',
			color: '#ccc',
			fontSize: 12,
		},
		octaveSwitchLed: {
			margin: '0 2px',
		},
		keyboard: {
			position: 'relative',
			display: 'flex',
			padding: '0 8px 8px 8px',
			'&.small-piano': {
				padding: '0 4px 4px 4px',
			},
		},
		octave: {
			position: 'relative',
			backgroundRepeat: 'no-repeat',
			'&:nth-of-type(1)': {
				borderRadius: '4px 0 0 4px',
			},
			'&:nth-of-type(5)': {
				borderRadius: '0 4px 4px 0',
			},
			width: 318,
			height: 200,
			backgroundImage: 'url("/img/piano-octave.jpg")',
			backgroundPosition: '0 -64px',
			'.small-piano &': {
				width: 159,
				height: 100,
				backgroundSize: '159px 132px',
				backgroundPosition: '0 -32px',
			},
		},
		hideContent: {
			width: '0 !important',
			overflow: 'hidden',
		},
		octaveKey: {
			position: 'absolute',
			color: '#333',
			bottom: 0,
			cursor: 'pointer',
		},
		whiteKey: {
			top: 0,
			bottom: 0,
			backgroundColor: '#000',
			opacity: 0,
			width: 318 / 7,
			'.small-piano &': {
				width: 159 / 7,
			},
			'&:hover': {
				opacity: 0.25,
			},
		},
		blackKey: {
			top: 0,
			backgroundColor: '#fff',
			opacity: 0,
			width: 318 / 10,
			height: 108,
			'.small-piano &': {
				width: 159 / 10,
				height: 54,
			},
			'&:hover': {
				opacity: 0.25,
			},
		},
		figureNoteSymbol: {
			position: 'absolute',
			pointerEvents: 'none',
			bottom: 7,
			'.small-piano &': {
				bottom: 3,
			},
		},
		keyboardCover: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			backgroundColor: '#000',
			opacity: 0.5,
			transition: 'all 1s ease',
			height: 200,
			'.small-piano &': {
				height: 100,
			},
		},
		keyboardCoverOff: {
			height: '0 !important',
		},
	}));
	const classes = useStyles();

	const [powerOn, setPowerOn] = useState(true);
	const [fnSymbolsOn, setFnSymbolsOn] = useState(true);
	const [octaves, setOctaves] = useState<boolean[]>([false, true, true, true, false]);

	const draggedItem = useRecoilValue(draggedItemAtom);
	const draggablePanelContentRef = useRef(null);

	const [isExpanded, setIsExpanded] = useState(true);
	useEffect(() => {
		document.addEventListener("keydown", handleKeyboardDownEvent)
		return () => document.removeEventListener("keydown", handleKeyboardDownEvent)
	}, [])
	useEffect(() => {
		document.addEventListener("keyup", handleKeyboardUpEvent)
		return () => document.removeEventListener("keyup", handleKeyboardUpEvent)
	}, [])
	const handleClickExpand = useCallback(function handleClickExpand() {
		setIsExpanded(true);
	}, []);
	const handleClickCollapse = useCallback(function handleClickCollapse() {
		setIsExpanded(false);
	}, []);

	const whiteKeys = MusicalHelper.getWhiteIndices().map((i, index) => {
		return {
			noteName: MusicalHelper.getNoteNameByIndex(i),
			left: smallPiano ? (index * 159) / 7 : (index * 318) / 7,
		};
	});
	const blackKeys = MusicalHelper.getBlackIndices().map((i, index) => {
		return {
			noteName: MusicalHelper.getNoteNameByIndex(i),
			left: smallPiano ? [12, 40, 80, 105, 130][index] : [24, 80, 160, 210, 260][index],
		};
	});

	const togglePower = useCallback(function togglePower() {
		AnalyticsHelper.sendEvent(EventCategory.PIANO, 'toggle piano power');
		setPowerOn((status) => !status);
	}, []);

	const toggleFnSymbols = useCallback(function toggleFnSymbols() {
		AnalyticsHelper.sendEvent(EventCategory.PIANO, 'toggle piano symbols');
		setFnSymbolsOn((status) => !status);
	}, []);

	const toggleOctave = useCallback(
		function toggleOctave(e) {
			if (!powerOn) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PIANO, 'toggle piano octave');
			const newOctaves = [...octaves];
			const index = e.currentTarget.dataset['octaveIndex'];
			newOctaves[index] = !newOctaves[index];
			setOctaves(newOctaves);
		},
		[powerOn, octaves],
	);

	const startNote = useCallback(
		function startNote(noteName: string, octaveNumber: number) {
			const noteFullName = noteName + octaveNumber;

			console.log('noteName', noteName);
			console.log('octaveNumber', octaveNumber);

			SoundHelper.startNote(noteFullName);
			if (onPianoNote) {
				onPianoNote(noteFullName);
			}
		},
		[onPianoNote],
	);

	const stopNote = useCallback(function stopNote(noteName: string, octaveNumber: number) {
		SoundHelper.stopNote(noteName + octaveNumber);
	}, []);

	const handleMouseDown = useCallback(
		function handleMouseDown(e) {
			console.log('down');
			startNote(e.currentTarget.dataset['noteName'], e.currentTarget.dataset['octaveNumber']);
		},
		[startNote],
	);

	const handleMouseUp = useCallback(
		function handleMouseUp(e) {
			stopNote(e.currentTarget.dataset['noteName'], e.currentTarget.dataset['octaveNumber']);
		},
		[stopNote],
	);

	const handleMouseEnter = useCallback(
		function handleMouseEnter(e) {
			const isMouseButtonPressed = 'buttons' in e ? e.buttons === 1 : (e.which || e.button) === 1;
			if (isMouseButtonPressed && draggedItem === DraggedItemType.NA) {
				startNote(e.currentTarget.dataset['noteName'], e.currentTarget.dataset['octaveNumber']);
			}
		},
		[draggedItem, startNote],
	);

	const handleMouseLeave = useCallback(
		function handleMouseLeave(e) {
			stopNote(e.currentTarget.dataset['noteName'], e.currentTarget.dataset['octaveNumber']);
		},
		[stopNote],
	);
	const handleKeyboardDownEvent = (e: KeyboardEvent) => {
		switch (e.code) {
			case 'KeyC':
				startNote('C', 3)
				break;
			case 'KeyD':
				startNote('D', 3)
				break;
			case 'KeyE':
				startNote('E', 3)
				break;
			case 'KeyF':
				startNote('F', 3)
				break;
			case 'KeyG':
				startNote('G', 3)
				break;
			case 'KeyA':
				startNote('A', 3)
				break;
			case 'KeyB':
				startNote('B', 3)
				break;
			default:
				break;
		}
	}
	const handleKeyboardUpEvent = (e: KeyboardEvent) => {
		switch (e.code) {
			case 'KeyC':
				stopNote('C', 3)
				break;
			case 'KeyD':
				stopNote('D', 3)
				break;
			case 'KeyE':
				stopNote('E', 3)
				break;
			case 'KeyF':
				stopNote('F', 3)
				break;
			case 'KeyG':
				stopNote('G', 3)
				break;
			case 'KeyA':
				stopNote('A', 3)
				break;
			case 'KeyB':
				stopNote('B', 3)
				break;
			default:
				break;
		}
	}
	return (
		<div id="Piano" ref={draggablePanelContentRef} className={`${classes.root} ${isExpanded ? '' : classes.rootCollapsed} ${smallPiano ? 'small-piano' : ''}`}>
			{smallPiano && smallPiano && <DraggablePanel contentRef={draggablePanelContentRef} title="Piano" draggedItemType={DraggedItemType.PIANO_PANEL} />}
			{!isExpanded && smallPiano && <ExpandMoreIcon onClick={handleClickExpand} className={classes.expandCollapseButton} />}
			{isExpanded && smallPiano && <ExpandLessIcon onClick={handleClickCollapse} className={classes.expandCollapseButton} />}
			<Box className={`${classes.content} ${isExpanded ? '' : classes.contentCollapsed}`}>
				<Box className={`${classes.controls} ${smallPiano ? 'small-piano' : ''}`}>
					<Box className={classes.powerSwitch}>
						<Box onClick={togglePower} className={`led ${powerOn ? 'led--on' : 'led--off'}`} />
						<Typography className={classes.powerSwitchText}>Power</Typography>
					</Box>
					<Box className={`${classes.fnSymbolsSwitch} ${smallPiano ? 'small-piano' : ''}`}>
						<Box
							onClick={toggleFnSymbols}
							className={`led ${powerOn && fnSymbolsOn ? 'led--on' : ''} ${powerOn && !fnSymbolsOn ? 'led--off' : ''} ${powerOn ? '' : 'pointer-events-none'}`}
						/>
						<Typography className={classes.fnSymbolsSwitchText}>Figurenotes</Typography>
					</Box>
					<Box className={`${classes.octaveSwitches} ${smallPiano ? 'small-piano' : ''}`}>
						{octaves.map((oct, octIndex) => (
							<Box
								key={octIndex}
								onClick={toggleOctave}
								data-octave-index={octIndex}
								className={`${classes.octaveSwitchLed} led ${powerOn && oct ? 'led--on' : ''} ${powerOn && !oct ? 'led--off' : ''} ${powerOn ? '' : 'pointer-events-none'
									}`}
							/>
						))}
						<Typography className={classes.octaveSwitchesText}>Octaves</Typography>
					</Box>
				</Box>
				<Box className={`${classes.keyboard} ${smallPiano ? 'small-piano' : ''}`}>
					{octaves.map((oct, octIndex) => (
						<Box key={octIndex} className={`${classes.octave} ${oct ? '' : classes.hideContent}`}>
							{whiteKeys.map((wk) => (
								<Box key={wk.noteName}>
									<Box
										className={`${classes.figureNoteSymbol} ${oct && fnSymbolsOn ? '' : 'display-none'}`}
										style={{
											...FigurenotesHelper.getSymbolStyle(`${wk.noteName}${octIndex + MusicalHelper.minOctave}`, smallPiano ? 16 : 32, 'px', {
												isMini: true,
											}),
											left: wk.left + (smallPiano ? 3 : 7),
										}}
									/>
									<Box
										onMouseDown={handleMouseDown}
										onMouseUp={handleMouseUp}
										onMouseEnter={handleMouseEnter}
										onMouseLeave={handleMouseLeave}
										data-note-name={wk.noteName}
										data-octave-number={octIndex + MusicalHelper.minOctave}
										className={`${classes.octaveKey} ${classes.whiteKey}`}
										style={{ left: wk.left }}
									/>
								</Box>
							))}
							{blackKeys.map((bk) => (
								<Box
									key={bk.noteName}
									onMouseDown={handleMouseDown}
									onMouseUp={handleMouseUp}
									onMouseEnter={handleMouseEnter}
									onMouseLeave={handleMouseLeave}
									data-note-name={bk.noteName}
									data-octave-number={octIndex + MusicalHelper.minOctave}
									className={`${classes.octaveKey} ${classes.blackKey}`}
									style={{ left: bk.left }}
								/>
							))}
						</Box>
					))}
					<Box className={`${classes.keyboardCover} ${powerOn ? classes.keyboardCoverOff : ''}`} />
				</Box>
			</Box>
		</div>
	);
});
