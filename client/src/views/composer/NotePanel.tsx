import { useCallback, useMemo, useRef, useState } from 'react';
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
import { Note } from '../../model/note';

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
	const draggablePanelContentRef = useRef(null);

	const [isExpanded, setIsExpanded] = useState(true);
	const handleClickExpand = useCallback(function handleClickExpand() {
		setIsExpanded(true);
	}, []);
	const handleClickCollapse = useCallback(function handleClickCollapse() {
		setIsExpanded(false);
	}, []);

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
			if (!score) return;
			const notes: NoteModel[] = getSelectedNotes(false);
			if (!notes.length) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.NOTE, 'delete note');
			notes.forEach((n) => {
				const m = Music.findMeasure(score.music, n.measureId);
				if (!m) {
					return;
				}
				const p = Measure.findPart(m, n.partId);
				if (!p) {
					return;
				}
				if (n.isTiedToNext) {
					const nextNote = Note.getTiedNote(n, score.music, true);
					n.isTiedToNext = false;
					nextNote.fullName = '';
					nextNote.isTiedToPrev = false;
					const nextMeasure = Music.findMeasure(score.music, nextNote.measureId);
					const nextPart = Measure.findPart(nextMeasure!, nextNote.partId);
					const defaultDuration = Math.min(MusicalHelper.parseTimeSignature(nextMeasure!.timeSignature).beatDurationDivs, nextNote.durationDivs);
					// revert duration to the default
					Part.changeNoteDuration(nextPart!, nextNote.id, defaultDuration, nextMeasure!, score.music, false);
				} else if (n.isTiedToPrev) {
					Note.getTiedNote(n, score.music, false).isTiedToNext = false;
					// Note.getTiedNote(n, score, false).isTiedToPrev = false;
					n.isTiedToPrev = false;
				}
				// set the note duration to either the default, or it's current length (in the edge case of last note in part that is shorter than normal)
				const defaultDuration = Math.min(MusicalHelper.parseTimeSignature(m.timeSignature).beatDurationDivs, n.durationDivs);
				Part.changeNoteDuration(p, n.id, defaultDuration, m, score.music, false);
				n.fullName = '';
				n.isRest = true;
			});
			onUpdateScore();
		},
		[getSelectedNotes, onUpdateScore, score],
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
				Part.changeNoteDuration(p, n.id, Number(e.currentTarget.dataset['durationDivs']), m, score.music, isLastMeasure, selection[0]);
				onUpdateScore();
			});
		},
		[score, getSelectedNotes, onUpdateScore, selection],
	);

	const noteOptions = useMemo(() => {
		const durations = [
			{ durationDivs: 6, label: '1/16', canChange: true },
			{ durationDivs: 12, label: '1/8', canChange: true },
			{ durationDivs: 18, label: '3/16', canChange: true },
			{ durationDivs: 24, label: '1/4', canChange: true },
			{ durationDivs: 36, label: '3/8', canChange: true },
			{ durationDivs: 48, label: '1/2', canChange: true },
			{ durationDivs: 72, label: '3/4', canChange: true },
			{ durationDivs: 96, label: '1', canChange: true },
		];
		const note = getSelectedNotes(true)[0];
		if (score && note) {
			const isLastMeasure = Music.isLastMeasure(score.music, note.measureId);
			if (isLastMeasure) {
				const measure = Music.findMeasure(score.music, note.measureId);
				measure &&
					durations.forEach((val) => {
						val.canChange = isLastMeasure && note.startDiv + val.durationDivs <= measure.durationDivs;
					});
			}
		}
		//  each of the following boolean expressions corresponds with a button on the panel, and wheither its disabled or not
		const { octave, step } = MusicalHelper.parseNote(note?.fullName);
		const canDelete = note && !note.isRest;
		const common = canDelete && !note.isBoomwhacker; // just a common boolean check that appears in all options
		const canOctaveUp = common && octave < MusicalHelper.maxOctave;
		const canOctaveDown = common && octave > MusicalHelper.minOctave;
		const canSemiUp = canOctaveUp || step !== 'B';
		const canSemiDown = canOctaveDown || step !== 'C';
		const noteOptions = {
			durations,
			canOctaveUp,
			canOctaveDown,
			canSemiUp,
			canSemiDown,
			canDelete,
		};
		return noteOptions;
	}, [getSelectedNotes, score]);

	return (
		<div id="NotePanel" ref={draggablePanelContentRef} className={`${classes.root} ${isExpanded ? '' : classes.rootCollapsed}`}>
			<DraggablePanel contentRef={draggablePanelContentRef} title="Note" draggedItemType={DraggedItemType.NOTE_PANEL} />
			{!isExpanded && <ExpandMoreIcon onClick={handleClickExpand} className={classes.expandCollapseButton} />}
			{isExpanded && <ExpandLessIcon onClick={handleClickCollapse} className={classes.expandCollapseButton} />}
			<Box className={`${classes.content} ${isExpanded ? '' : classes.contentCollapsed}`}>
				<Box className={`${classes.panel} ${classes.panelDuration}`}>
					{noteOptions.durations.map((ndo) => (
						<Button
							key={ndo.durationDivs}
							data-duration-divs={ndo.durationDivs}
							onClick={handleClickNoteDuration}
							disabled={!ndo.canChange}
							className={`${classes.actionButton} ${classes.noteDurationButton}`}
						>
							{ndo.label}
						</Button>
					))}
				</Box>
				<Box className={classes.buttonsRow}>
					<Box>
						<Box className={classes.panel}>
							<IconButton
								onClick={handleChangePitch}
								data-direction="down"
								data-amount="semitone"
								className={`${classes.actionButton}`}
								disabled={!noteOptions.canSemiDown}
							>
								<ArrowDropDownOutlinedIcon titleAccess="Semitone down" />
							</IconButton>
							<IconButton
								onClick={handleChangePitch}
								data-direction="up"
								data-amount="semitone"
								className={`${classes.actionButton}`}
								disabled={!noteOptions.canSemiUp}
							>
								<ArrowDropUpOutlinedIcon titleAccess="Semitone up" />
							</IconButton>
							<Typography variant="body1" className={`${classes.panelText}`}>
								Semitone
							</Typography>
						</Box>
						<Box className={classes.panel}>
							<IconButton
								onClick={handleChangePitch}
								data-direction="down"
								data-amount="octave"
								className={`${classes.actionButton}`}
								disabled={!noteOptions.canOctaveDown}
							>
								<ArrowDropDownOutlinedIcon titleAccess="Octave down" />
							</IconButton>
							<IconButton
								onClick={handleChangePitch}
								data-direction="up"
								data-amount="octave"
								className={`${classes.actionButton}`}
								disabled={!noteOptions.canOctaveUp}
							>
								<ArrowDropUpOutlinedIcon titleAccess="Octave up" />
							</IconButton>
							<Typography variant="body1" className={`${classes.panelText}`}>
								Octave
							</Typography>
						</Box>
					</Box>
					<Box className={`${classes.panel} ${classes.panelButtonOnly}`}>
						<IconButton onClick={handleClickDelete} className={classes.actionButton} disabled={!noteOptions.canDelete}>
							<DeleteForeverIcon titleAccess="Delete note" />
						</IconButton>
					</Box>
				</Box>
			</Box>
		</div>
	);
};
