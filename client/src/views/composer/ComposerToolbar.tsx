import { AnalyticsHelper, EventCategory } from '../../services/analyticsHelper';
import React, { useCallback, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { IconButton, Modal } from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import PrintIcon from '@material-ui/icons/Print';
import CloseIcon from '@material-ui/icons/Close';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { AppDataHelper } from '../../services/appDataHelper';
import { SoundHelper } from '../../services/soundHelper';
import { ScoreModel } from '../../model/scoreModel';
import { Score } from '../../model/score';
import { NewScoreDialog } from './NewScoreDialog';
import { SaveScore } from './SaveScore';
import { ExampleScore } from '../../services/exampleScore';

export interface ComposerToolbarProps {
	score: ScoreModel | null;
	onChangeScore: (score: Score) => void;
	onSaveScore: () => void;
	onCloseScore: () => void;
}

export const ComposerToolbar = React.memo(({ score, onChangeScore, onSaveScore, onCloseScore }: ComposerToolbarProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			position: 'relative',
			height: '100%',
		},
		panel: {
			display: 'inline-flex',
			alignItems: 'center',
			height: 32,
			border: '1px solid #666',
			borderRadius: 16,
			backgroundColor: '#444',
			padding: '0 4px 0 4px',
			//opacity: 0.9,
			marginLeft: 16,
			'&:first-of-type': {
				marginLeft: 0,
			},
		},
		actionButton: {
			width: 24,
			height: 24,
			textAlign: 'center',
			cursor: 'pointer',
			transition: 'all 0.2s ease-in-out',
			color: '#ccc',
			marginLeft: 12,
			'&:first-of-type': {
				marginLeft: 0,
			},
			'&:hover': {
				color: '#fff',
			},
			'&.disabled': {
				pointerEvents: 'none',
				color: '#666',
			},
		},
	}));
	const classes = useStyles();

	const [newScoreDialogVisible, setNewScoreDialogVisible] = useState(false);
	const [goSaveScore, setGoSaveScore] = useState(false);

	const handleClickNew = useCallback(function handleClickNew() {
		setNewScoreDialogVisible(true);
	}, []);

	const handleCloseNewScoreDialog = useCallback(function handleCloseNewScoreDialog() {
		SoundHelper.start();
		setNewScoreDialogVisible(false);
	}, []);

	const handleDoneNewScoreDialog = useCallback(
		function handleDoneNewScoreDialog(newScore: Score | null) {
			setNewScoreDialogVisible(false);
			if (newScore) {
				AnalyticsHelper.sendEvent(EventCategory.SCORE, 'new score', newScore.scoreInfo.scoreTitle);
				onChangeScore(newScore);
			}
		},
		[onChangeScore],
	);

	const handleChangeOpenFile = useCallback(
		function handleChangeOpenFile() {
			let inputElm = document.getElementById('open-score-input-elm') as HTMLInputElement;
			if (!inputElm || !inputElm.files || inputElm.files.length !== 1) {
				return;
			}
			const fileReader = new FileReader();
			fileReader.onload = () => {
				if (fileReader.result) {
					const openedScore = Score.createFromModel(JSON.parse(fileReader.result.toString()));
					AnalyticsHelper.sendEvent(EventCategory.SCORE, 'open score', openedScore.scoreInfo.scoreTitle);
					onChangeScore(openedScore);
				}
			};
			fileReader.readAsText(inputElm.files[0]);
		},
		[onChangeScore],
	);

	const handleClickOpen = useCallback(
		function handleClickOpen() {
			SoundHelper.start();

			let inputElm = document.getElementById('open-score-input-elm');
			if (inputElm) {
				document.body.removeChild(inputElm);
			}
			inputElm = document.createElement('input');
			inputElm.setAttribute('id', 'open-score-input-elm');
			inputElm.setAttribute('type', 'file');
			inputElm.setAttribute('accept', `.${AppDataHelper.scoreFileExt}`);
			inputElm.style.display = 'none';
			inputElm.addEventListener('change', handleChangeOpenFile);
			document.body.append(inputElm);
			inputElm.click();
		},
		[handleChangeOpenFile],
	);

	const handleClickSave = useCallback(function handleClickSave() {
		setGoSaveScore(true);
	}, []);

	const handleSaveScoreDone = useCallback(
		function handleSaveScoreDone() {
			setGoSaveScore(false);
			if (score) {
				AnalyticsHelper.sendEvent(EventCategory.SCORE, 'save score', score.scoreInfo.scoreTitle);
			}
			onSaveScore();
		},
		[score, onSaveScore],
	);

	const handleClickPrint = useCallback(
		function handleClickPrint() {
			alert('IMPORTANT: Please make sure background graphics are enabled in the browser print settings dialog.');
			window.print();
			if (score) {
				AnalyticsHelper.sendEvent(EventCategory.SCORE, 'print score', score.scoreInfo.scoreTitle);
			}
		},
		[score],
	);

	const handleClickClose = useCallback(
		function handleClickClose() {
			onCloseScore();
		},
		[onCloseScore],
	);

	const handleClickExample = useCallback(
		function handleClickExample() {
			SoundHelper.start();
			const openedScore = Score.createFromModel(ExampleScore.getExampleScore());
			AnalyticsHelper.sendEvent(EventCategory.SCORE, 'example score', openedScore.scoreInfo.scoreTitle);
			onChangeScore(openedScore);
		},
		[onChangeScore],
	);

	return (
		<Box id="ComposerToolbar" className={classes.root}>
			<Box className={classes.panel}>
				<IconButton onClick={handleClickNew} className={classes.actionButton} disabled={!!score}>
					<AddCircleOutlineOutlinedIcon titleAccess="New" />
				</IconButton>
				<Modal open={newScoreDialogVisible} onClose={handleCloseNewScoreDialog}>
					<NewScoreDialog onDoneNewScoreDialog={handleDoneNewScoreDialog} />
				</Modal>
				<IconButton onClick={handleClickOpen} className={classes.actionButton} disabled={!!score}>
					<FolderOpenOutlinedIcon titleAccess="Open" />
				</IconButton>
				<IconButton onClick={handleClickExample} className={classes.actionButton} disabled={!!score}>
					<MenuBookIcon titleAccess="Example" />
				</IconButton>
				<IconButton onClick={handleClickSave} className={classes.actionButton} disabled={!score} id="save-btn">
					<SaveOutlinedIcon titleAccess="Save" />
				</IconButton>
				<SaveScore score={score} goSaveScore={goSaveScore} onSaveScoreDone={handleSaveScoreDone} />
				<IconButton onClick={handleClickPrint} className={classes.actionButton} disabled={!score}>
					<PrintIcon titleAccess="Print" />
				</IconButton>
				<IconButton onClick={handleClickClose} className={classes.actionButton} disabled={!score}>
					<CloseIcon titleAccess="Close" />
				</IconButton>
			</Box>
		</Box>
	);
});
