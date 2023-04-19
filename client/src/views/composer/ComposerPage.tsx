import React, { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { ScoreModel } from '../../model/scoreModel';
import { Score } from '../../model/score';
import { selectionAtom } from '../../atoms/selectionAtom';
import { copiedMeasureIdAtom } from '../../atoms/copiedMeasureIdAtom';
import { ComposerToolbar } from './ComposerToolbar';
import { StageUI } from './StageUI';
import { Piano } from '../../components/Piano';
import { NotePanel } from './NotePanel';
import { MeasurePanel } from './MeasurePanel';
import { PartsPanel } from './PartsPanel';
import { MusicalHelper } from '../../services/musicalHelper';
import { PlayerPanel } from './PlayerPanel';
import { diskSaveTimeAtom } from '../../atoms/diskSaveTimeAtom';
import { BoomWhacker } from '../../components/BoomWhacker';
import { Note } from '../../model/note';

export const ComposerPage = () => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'relative',
			height: '100%',
			userSelect: 'none',
		},
		toolbarContainer: {
			position: 'fixed',
			top: 84,
			left: 32,
			'@media print': {
				display: 'none',
			},
		},
		stageContainer: {
			position: 'relative',
			height: '100%',
			transform: 'translate(0, 0)',
		},
		pianoAnchor: {
			position: 'absolute',
			left: 800,
			top: 0,
			'@media print': {
				display: 'none',
			},
		},
		notePanelAnchor: {
			position: 'absolute',
			left: 800,
			top: 181,
			'@media print': {
				display: 'none',
			},
		},
		measurePanelAnchor: {
			position: 'absolute',
			left: 800,
			top: 319,
			'@media print': {
				display: 'none',
			},
		},
		playerPanelAnchor: {
			position: 'absolute',
			left: 1054,
			top: 319,
			'@media print': {
				display: 'none',
			},
		},
		partsPanelAnchor: {
			position: 'absolute',
			left: 800,
			top: 416,
			'@media print': {
				display: 'none',
			},
		},
		boomWhackerPanelAnchor: {
			position: 'absolute',
			left: 800,
			top: 515,
			'@media print': {
				display: 'none',
			},
		},
	}));
	const classes = useStyles();

	const [score, setScore] = useState<ScoreModel | null>(null);
	const selection = useRecoilValue(selectionAtom);
	const resetSelection = useResetRecoilState(selectionAtom);
	const resetCopiedMeasureId = useResetRecoilState(copiedMeasureIdAtom);
	const [diskSaveTime, setDiskSaveTime] = useRecoilState(diskSaveTimeAtom);

	const setSaveNotification = useCallback(function setSaveNotification(isActive: boolean) {
		const flashAnimationClassName = 'animate-flash';
		const saveBtnElm = document.getElementById('save-btn');
		if (saveBtnElm) {
			if (isActive) {
				setTimeout(() => {
					saveBtnElm.classList.add(flashAnimationClassName);
				}, 0);
			} else if (!isActive) {
				setTimeout(() => {
					saveBtnElm.classList.remove(flashAnimationClassName);
				}, 0);
			}
		}
	}, []);

	const handleScoreChanged = useCallback(
		function handleScoreChanged(changedScore: Score) {
			resetSelection();
			resetCopiedMeasureId();
			setScore(changedScore);
			setDiskSaveTime(new Date().getTime());
			setSaveNotification(false);
		},
		[resetSelection, resetCopiedMeasureId, setDiskSaveTime, setSaveNotification],
	);

	const handleScoreUpdated = useCallback(
		function handleScoreUpdated() {
			setScore((s) => {
				return { ...s } as ScoreModel;
			});
			const nowTime = new Date().getTime();
			const delayMilliseconds = 1000 * 60 * 5;
			if (nowTime > diskSaveTime + delayMilliseconds) {
				setSaveNotification(true);
			}
		},
		[diskSaveTime, setSaveNotification],
	);

	const handleScoreSaved = useCallback(
		function handleScoreSaved() {
			setDiskSaveTime(new Date().getTime());
			setSaveNotification(false);
		},
		[setDiskSaveTime, setSaveNotification],
	);

	const handleScoreClosed = useCallback(
		function handleScoreClosed() {
			resetSelection();
			resetCopiedMeasureId();
			setScore(null);
			setDiskSaveTime(0);
			setSaveNotification(false);
		},
		[resetSelection, resetCopiedMeasureId, setDiskSaveTime, setSaveNotification],
	);

	const handleNote = useCallback(
		function handleNote(noteFullName: string, isBoomwhacker?: boolean) {
			if (!score || selection.length !== 1) {
				return;
			}
			const note = Score.findNote(score, selection[0].noteId);
			if (!note) {
				return;
			}
			note.isRest = false;
			note.fullName = noteFullName;
			if (isBoomwhacker) note.isBoomwhacker = true;
			else {
				note.isBoomwhacker = false;
				const measure = Score.findMeasure(score, note.measureId);
				if (MusicalHelper.parseNote(noteFullName).alter === '#') {
					if (measure && !measure.useSharps) {
						note.fullName = MusicalHelper.toggleSharpAndFlat(note.fullName);
					}
				}
				// if note is tied  in front: change the tied note too
				if (note.isTiedToNext) Note.getTiedNote(note, score, true).fullName = noteFullName;
				// if note is tied from behind: sever the tie between them
				if (note.isTiedToPrev) {
					note.isTiedToPrev = false;
					Note.getTiedNote(note, score, false).isTiedToNext = false;
				}
			}
			handleScoreUpdated();
		},
		[score, selection, handleScoreUpdated],
	);

	// const handleBoomWhackerNote = useCallback(
	// 	function handleBoomWhackerNote(noteFullName: string) {
	// 		if (!score || selection.length !== 1) {
	// 			return;
	// 		}
	// 		const note = Score.findNote(score, selection[0].noteId);
	// 		if (!note) {
	// 			return;
	// 		}
	// 		note.isRest = false;
	// 		note.fullName = noteFullName;
	// 		note.isBoomwhacker = true;
	// 		handleScoreUpdated();
	// 	},
	// 	[score, selection, handleScoreUpdated],
	// );

	return (
		<Box id="ComposerPage" className={classes.root}>
			<Box className={classes.toolbarContainer}>
				<ComposerToolbar score={score} onChangeScore={handleScoreChanged} onSaveScore={handleScoreSaved} onCloseScore={handleScoreClosed} />
			</Box>
			{score && (
				<>
					<Box className={classes.stageContainer}>
						<StageUI score={score} onUpdateScore={handleScoreUpdated} />
					</Box>
					<Box className={classes.pianoAnchor}>
						<Piano smallPiano={true} onPianoNote={handleNote} />
					</Box>
					<Box className={classes.notePanelAnchor}>
						<NotePanel score={score} onUpdateScore={handleScoreUpdated} />
					</Box>
					<Box className={classes.measurePanelAnchor}>
						<MeasurePanel score={score} onUpdateScore={handleScoreUpdated} />
					</Box>
					<Box className={classes.playerPanelAnchor}>
						<PlayerPanel music={score.music} />
					</Box>
					<Box className={classes.partsPanelAnchor}>
						<PartsPanel music={score.music} onUpdateScore={handleScoreUpdated} />
					</Box>
					<Box className={classes.boomWhackerPanelAnchor}>
						<BoomWhacker onBoomWhackerNote={handleNote} />
					</Box>
				</>
			)}
		</Box>
	);
};
