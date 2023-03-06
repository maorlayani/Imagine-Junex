import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { Button, IconButton, Typography } from '@material-ui/core';
import ArrowDropUpOutlinedIcon from '@material-ui/icons/ArrowDropUpOutlined';
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { MusicalHelper } from '../../services/musicalHelper';
import { SoundHelper } from '../../services/soundHelper';
import { NoteModel, ScoreModel } from '../../model/scoreModel';
import { Music } from '../../model/music';
import { Measure } from '../../model/measure';
import { Part } from '../../model/part';
import { selectionAtom } from '../../atoms/selectionAtom';
import { DraggedItemType } from '../../atoms/draggedItemAtom';
import { DraggablePanel } from '../../components/DraggablePanel';
import { AnalyticsHelper, EventCategory } from '../../services/analyticsHelper';

export interface NotePanelProps {
	score: ScoreModel | null;
	onUpdateScore: () => void;
}

export const NotePanel = ({ score, onUpdateScore }: NotePanelProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'absolute',
			left: 0,
			top: 0,
			width: 493,
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
			gridTemplate: 'auto auto / 1fr',
			gap: '8px 0',
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
			padding: '0 12px 0 4px',
			marginLeft: 16,
			'&:first-of-type': {
				marginLeft: 0,
			},
		},
		panelButtonOnly: {
			padding: '0 4px',
		},
		panelDuration: {
			paddingRight: 4,
			'& .MuiButton-root': {
				minWidth: 55,
			},
		},
		buttonsRow: {
			display: 'flex',
			justifyContent: 'space-between',
		},
		panelText: {
			marginLeft: 4,
			color: '#aaa',
			transition: 'all 0.2s ease-in-out',
			'&.disabled': {
				color: '#666',
				pointerEvents: 'none',
			},
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
		noteDurationButton: {
			borderRadius: 24,
			'&.current': {
				color: '#fa3',
			},
		},
	}));
	const classes = useStyles();

	const selection = useRecoilValue(selectionAtom);
	const [canChangeDuration, setCanChangeDuration] = useState<any>({
		6: false,
		12: false,
		18: false,
		24: false,
		36: false,
		48: false,
		72: false,
		96: false,
	});
	const [canPitchDown, setCanPitchDown] = useState(false);
	const [canPitchUp, setCanPitchUp] = useState(false);
	const [canOctaveDown, setCanOctaveDown] = useState(false);
	const [canOctaveUp, setCanOctaveUp] = useState(false);
	const [canDelete, setCanDelete] = useState(false);
	const [curDuration, setCurDuration] = useState(0);
	const draggablePanelContentRef = useRef(null);

	const [isExpanded, setIsExpanded] = useState(true);
	const handleClickExpand = useCallback(function handleClickExpand() {
		setIsExpanded(true);
	}, []);
	const handleClickCollapse = useCallback(function handleClickCollapse() {
		setIsExpanded(false);
	}, []);

	const noteDurationOptions = useMemo(
		() => [
			{ durationDivs: 6, label: '1/16' },
			{ durationDivs: 12, label: '1/8' },
			{ durationDivs: 18, label: '3/16' },
			{ durationDivs: 24, label: '1/4' },
			{ durationDivs: 36, label: '3/8' },
			{ durationDivs: 48, label: '1/2' },
			{ durationDivs: 72, label: '3/4' },
			{ durationDivs: 96, label: '1' },
		],
		[],
	);

	useEffect(
		function enableNotePanelActions() {
			setCurDuration(0);
			setCanPitchDown(false);
			setCanPitchUp(false);
			setCanOctaveDown(false);
			setCanOctaveUp(false);
			setCanDelete(false);
			if (!score || !selection || selection.length === 0) {
				return;
			}
			let m;
			let n;
			let d;
			if (selection.length === 1 && selection[0].noteId) {
				n = Music.findNote(score.music, selection[0].noteId);
				if (n) {
					setCurDuration(n.durationDivs);
				}
			}
			let noteDurationsOK: any = {};
			noteDurationOptions.forEach((o) => {
				noteDurationsOK[o.durationDivs] = selection.every((item) => {
					m = item.measureId && Music.findMeasure(score.music, item.measureId);
					const isLastMeasure = Music.isLastMeasure(score.music, item.measureId);
					if (!m) return false;
					return Measure.canChangeNoteDuration(m, item.partId, item.noteId, o.durationDivs, isLastMeasure);
				});
			});
			setCanChangeDuration(noteDurationsOK);
			setCanPitchDown(true);
			setCanPitchUp(true);
			setCanOctaveDown(true);
			setCanOctaveUp(true);
			setCanDelete(true);
			selection.forEach((item) => {
				n = item.noteId && Music.findNote(score.music, item.noteId);
				d = n ? MusicalHelper.parseNote(n.fullName) : null;
				if (!n || n.isRest || !d || (d.step === 'C' && !d.alter && d.octave === MusicalHelper.minOctave)) {
					setCanPitchDown(false);
				}
				if (!n || n.isRest || !d || (d.step === 'B' && !d.alter && d.octave === MusicalHelper.maxOctave)) {
					setCanPitchUp(false);
				}
				if (!n || n.isRest || !d || d.octave === MusicalHelper.minOctave) {
					setCanOctaveDown(false);
				}
				if (!n || n.isRest || !d || d.octave === MusicalHelper.maxOctave) {
					setCanOctaveUp(false);
				}
				if (!n || n.isRest) {
					setCanDelete(false);
				}
			});
		},
		[score, selection, noteDurationOptions],
	);

	const getSelectedNotes = useCallback(
		function getSelectedNotes(includeRests: boolean) {
			if (!score || !selection) {
				return [];
			}
			const notes: NoteModel[] = [];
			selection.forEach((item) => {
				const n = Music.findNote(score.music, item.noteId);
				if (n && (!n.isRest || includeRests)) {
					notes.push(n);
				}
			});
			return notes;
		},
		[score, selection],
	);

	const handleClickDelete = useCallback(
		function handleClickDelete() {
			const notes: NoteModel[] = getSelectedNotes(false);
			if (!notes.length) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.NOTE, 'delete note');
			notes.forEach((n) => {
				n.fullName = '';
				n.isRest = true;
			});
			onUpdateScore();
		},
		[getSelectedNotes, onUpdateScore],
	);

	const handleChangePitch = useCallback(
		function handleChangePitch(e) {
			if (!score) {
				return;
			}
			const notes: NoteModel[] = getSelectedNotes(true);
			if (!notes.length) {
				return;
			}
			if (e.currentTarget.dataset.amount === 'octave') {
				AnalyticsHelper.sendEvent(EventCategory.NOTE, 'change note by octave');
			} else {
				AnalyticsHelper.sendEvent(EventCategory.NOTE, 'change note by semitone');
			}
			notes.forEach((n) => {
				const measure = Music.findMeasure(score.music, n.measureId);
				if (!measure) {
					return;
				}
				if (e.currentTarget.dataset.amount === 'octave') {
					const noteDetails = MusicalHelper.parseNote(n.fullName);
					n.fullName = `${noteDetails.step}${noteDetails.alter}${e.currentTarget.dataset.direction === 'up' ? noteDetails.octave + 1 : noteDetails.octave - 1}`;
				} else {
					n.fullName = MusicalHelper.changePitch(n.fullName, measure.useSharps, e.currentTarget.dataset.direction === 'up');
				}
				SoundHelper.playShortNote(n.fullName);
			});
			onUpdateScore();
		},
		[score, getSelectedNotes, onUpdateScore],
	);

	const handleClickNoteDuration = useCallback(
		function handleClickNoteDuration(e) {
			if (!score) {
				return;
			}
			const notes: NoteModel[] = getSelectedNotes(true);
			if (!notes.length) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.NOTE, 'set note duration', e.currentTarget.dataset['durationDivs']);
			notes.forEach((n) => {
				const m = Music.findMeasure(score.music, n.measureId);
				if (!m) {
					return;
				}
				const p = Measure.findPart(m, n.partId);
				if (!p) {
					return;
				}
				const isLastMeasure = Music.isLastMeasure(score.music, n.measureId);
				Part.changeNoteDuration(p, n.id, Number(e.currentTarget.dataset['durationDivs']), m.timeSignature, m.durationDivs, isLastMeasure);
				onUpdateScore();
			});
		},
		[score, getSelectedNotes, onUpdateScore],
	);

	return (
		<div id="NotePanel" ref={draggablePanelContentRef} className={`${classes.root} ${isExpanded ? '' : classes.rootCollapsed}`}>
			<DraggablePanel contentRef={draggablePanelContentRef} title="Note" draggedItemType={DraggedItemType.NOTE_PANEL} />
			{!isExpanded && <ExpandMoreIcon onClick={handleClickExpand} className={classes.expandCollapseButton} />}
			{isExpanded && <ExpandLessIcon onClick={handleClickCollapse} className={classes.expandCollapseButton} />}
			<Box className={`${classes.content} ${isExpanded ? '' : classes.contentCollapsed}`}>
				<Box className={`${classes.panel} ${classes.panelDuration}`}>
					{noteDurationOptions.map((ndo) => (
						<Button
							key={ndo.durationDivs}
							data-duration-divs={ndo.durationDivs}
							onClick={handleClickNoteDuration}
							disabled={!canChangeDuration[ndo.durationDivs]}
							className={`${classes.actionButton} ${classes.noteDurationButton} ${canChangeDuration[ndo.durationDivs] ? '' : 'disabled'} ${
								ndo.durationDivs === curDuration ? 'current' : ''
							}`}
						>
							{ndo.label}
						</Button>
					))}
				</Box>
				<Box className={classes.buttonsRow}>
					<Box>
						<Box className={classes.panel}>
							<IconButton onClick={handleChangePitch} data-direction="down" data-amount="semitone" className={`${classes.actionButton}`} disabled={!canPitchDown}>
								<ArrowDropDownOutlinedIcon titleAccess="Semitone down" />
							</IconButton>
							<IconButton onClick={handleChangePitch} data-direction="up" data-amount="semitone" className={`${classes.actionButton}`} disabled={!canPitchUp}>
								<ArrowDropUpOutlinedIcon titleAccess="Semitone up" />
							</IconButton>
							<Typography variant="body1" className={`${classes.panelText} ${canPitchUp || canPitchDown ? '' : 'disabled'}`}>
								Semitone
							</Typography>
						</Box>
						<Box className={classes.panel}>
							<IconButton onClick={handleChangePitch} data-direction="down" data-amount="octave" className={`${classes.actionButton}`} disabled={!canOctaveDown}>
								<ArrowDropDownOutlinedIcon titleAccess="Octave down" />
							</IconButton>
							<IconButton onClick={handleChangePitch} data-direction="up" data-amount="octave" className={`${classes.actionButton}`} disabled={!canOctaveUp}>
								<ArrowDropUpOutlinedIcon titleAccess="Octave up" />
							</IconButton>
							<Typography variant="body1" className={`${classes.panelText} ${canPitchUp || canPitchDown ? '' : 'disabled'}`}>
								Octave
							</Typography>
						</Box>
					</Box>
					<Box className={`${classes.panel} ${classes.panelButtonOnly}`}>
						<IconButton onClick={handleClickDelete} className={classes.actionButton} disabled={!canDelete}>
							<DeleteForeverIcon titleAccess="Delete note" />
						</IconButton>
					</Box>
				</Box>
			</Box>
		</div>
	);
};
