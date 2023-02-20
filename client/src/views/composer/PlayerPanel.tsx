import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { IconButton, TextField, Typography } from '@material-ui/core';
import SkipNextOutlinedIcon from '@material-ui/icons/SkipNextOutlined';
import PlayArrowOutlinedIcon from '@material-ui/icons/PlayArrowOutlined';
import StopIcon from '@material-ui/icons/Stop';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { MusicModel, MeasureModel } from '../../model/scoreModel';
import { selectionAtom } from '../../atoms/selectionAtom';
import { DraggedItemType } from '../../atoms/draggedItemAtom';
import { DraggablePanel } from '../../components/DraggablePanel';
import { Music } from '../../model/music';
import { SoundHelper } from '../../services/soundHelper';
import { AnalyticsHelper, EventCategory } from '../../services/analyticsHelper';

export interface PlayerPanelProps {
	music: MusicModel;
}

export const PlayerPanel = ({ music }: PlayerPanelProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'absolute',
			width: 239,
			backgroundColor: '#222',
			borderRadius: 4,
			padding: 4,
			userSelect: 'none',
		},
		rootCollapsed: {
			width: 160,
			paddingBottom: 0,
		},
		expandCollapseButton: {
			position: 'absolute',
			top: 3,
			right: 6,
			cursor: 'pointer',
			color: '#ccc',
		},
		content: {
			display: 'grid',
			gridTemplate: 'auto / 1fr',
			gap: '12px 0',
			backgroundColor: '#444',
			padding: 8,
		},
		contentCollapsed: {
			height: 0,
			padding: 0,
			overflow: 'hidden',
		},
		panel: {
			display: 'inline-flex',
			alignItems: 'center',
			height: 32,
			borderRadius: 16,
			backgroundColor: '#333',
			padding: '0 4px 0 4px',
		},
		buttonsRow: {
			display: 'flex',
			justifyContent: 'space-between',
		},
		actionButton: {
			width: 24,
			height: 24,
			textAlign: 'center',
			cursor: 'pointer',
			transition: 'all 0.2s ease-in-out',
			color: '#ccc',
			'&:hover': {
				color: '#fff',
			},
			'&.disabled': {
				pointerEvents: 'none',
				color: '#666',
			},
		},
		tempoField: {
			height: 16,
			marginLeft: 8,
			width: 24,
			'& .MuiInputBase-input': {
				fontSize: 14,
				padding: 0,
			},
			'& .MuiInput-underline:after': {
				borderBottomColor: '#fff',
			},
		},
		panelText: {
			marginLeft: 8,
			color: '#aaa',
			marginRight: 8,
			transition: 'all 0.2s ease-in-out',
			'&.disabled': {
				color: '#666',
				pointerEvents: 'none',
			},
		},
	}));
	const classes = useStyles();

	const selection = useRecoilValue(selectionAtom);
	const [isPlaying, setIsPlaying] = useState(false);
	const [canPlay, setCanPlay] = useState(false);
	const [canStop, setCanStop] = useState(false);
	const [tempoBpm, setTempoBpm] = useState<number>(120);
	const draggablePanelContentRef = useRef(null);

	const [isExpanded, setIsExpanded] = useState(true);
	const handleClickExpand = useCallback(function handleClickExpand() {
		setIsExpanded(true);
	}, []);
	const handleClickCollapse = useCallback(function handleClickCollapse() {
		setIsExpanded(false);
	}, []);

	const getSelectedMeasures = useCallback(
		function getSelectedMeasures() {
			if (!selection) {
				return [];
			}
			const measures: MeasureModel[] = [];
			selection.forEach((item) => {
				const m = Music.findMeasure(music, item.measureId);
				if (m) {
					measures.push(m);
				}
			});
			return measures;
		},
		[music, selection],
	);

	useEffect(
		function setTempo() {
			if (music.measures) {
				const exampleMeasure = Music.getExampleMeasure(music);
				setTempoBpm(exampleMeasure.tempoBpm);
			}
		},
		[music],
	);

	useEffect(
		function enableMeasurePanelActions() {
			setCanPlay(!isPlaying);
			setCanStop(isPlaying);
		},
		[isPlaying],
	);

	const handleClickPlay = useCallback(
		function handleClickPlay(e) {
			if (tempoBpm <= 0) {
				return;
			}
			const selectedMeasures: MeasureModel[] = getSelectedMeasures();
			const startMeasureId = selectedMeasures.length > 0 ? selectedMeasures[0].id : '';
			const kind = e.currentTarget.dataset.kind;
			const notesForPlayer: any[] = Music.getNotesForPlayer(music, startMeasureId, kind === 'playOnlyCurrent' ? startMeasureId : null);
			if (notesForPlayer.length === 0) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PLAYER, 'start player');
			setIsPlaying(true);
			const musicDurationSecs = SoundHelper.playMusic(notesForPlayer, tempoBpm);
			setTimeout(() => {
				setIsPlaying(false);
			}, (musicDurationSecs + 0.5) * 1000);
		},
		[music, getSelectedMeasures, tempoBpm],
	);

	const handleClickStop = useCallback(function handleClickPlay() {
		AnalyticsHelper.sendEvent(EventCategory.PLAYER, 'stop player');
		setIsPlaying(false);
		SoundHelper.stopMusic();
	}, []);

	const handleChangeTempoBpm = useCallback(function handleChangeTempoBpm(e: any) {
		AnalyticsHelper.sendEvent(EventCategory.PLAYER, 'set tempo');
		setTempoBpm((curTempo) => {
			return isNaN(e.target.value) ? curTempo : Math.max(0, Math.min(999, Number(e.target.value)));
		});
	}, []);

	return (
		<div id="PlayerPanel" ref={draggablePanelContentRef} className={`${classes.root} ${isExpanded ? '' : classes.rootCollapsed}`}>
			<DraggablePanel title="Player" contentRef={draggablePanelContentRef} draggedItemType={DraggedItemType.MEASURE_PANEL} />
			{!isExpanded && <ExpandMoreIcon onClick={handleClickExpand} className={classes.expandCollapseButton} />}
			{isExpanded && <ExpandLessIcon onClick={handleClickCollapse} className={classes.expandCollapseButton} />}
			<Box className={`${classes.content} ${isExpanded ? '' : classes.contentCollapsed}`}>
				<Box className={classes.buttonsRow}>
					<Box className={classes.panel}>
						<IconButton
							data-kind="playOnlyCurrent"
							onClick={handleClickPlay}
							disabled={!canPlay || getSelectedMeasures().length === 0}
							className={classes.actionButton}
						>
							<PlayArrowOutlinedIcon titleAccess="Play only current measure" />
						</IconButton>
						<IconButton data-kind="playFromCurrent" onClick={handleClickPlay} disabled={!canPlay} className={classes.actionButton} style={{ marginLeft: '8px' }}>
							<SkipNextOutlinedIcon titleAccess="Play on from current measure" />
						</IconButton>
						<IconButton onClick={handleClickStop} disabled={!canStop} className={classes.actionButton} style={{ marginLeft: '4px', display: 'none' }}>
							<StopIcon titleAccess="Stop" />
						</IconButton>
					</Box>
					<Box className={classes.panel}>
						<TextField value={tempoBpm} onChange={handleChangeTempoBpm} disabled={!canPlay} placeholder="120" label="" className={classes.tempoField} />
						<Typography variant="body1" className={`${classes.panelText} ${canPlay ? '' : 'disabled'}`}>
							bpm
						</Typography>
					</Box>
				</Box>
			</Box>
		</div>
	);
};
