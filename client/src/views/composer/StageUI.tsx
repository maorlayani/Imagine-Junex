import React, { useCallback, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { Modal } from '@material-ui/core';
import { ScoreModel } from '../../model/scoreModel';
import { TunePageDialog } from './TunePageDialog';
import { StageHeaderUI } from './StageHeaderUI';
import { MusicUI } from './MusicUI';
import { StageFooterUI } from './StageFooterUI';
import { AnalyticsHelper, EventCategory } from '../../services/analyticsHelper';
import ScoreOptions from './ScoreOptions';

export interface StageUIProps {
	score: ScoreModel;
	onRedoUndo: (val: number) => void;
	onUpdateScore: () => void;
}

export const StageUI = ({ score, onUpdateScore, onRedoUndo }: StageUIProps) => {
	const pageWidth = 776;
	const stageWidth = 718;
	const useStyles = makeStyles(() => ({
		root: {
			position: 'relative',
			height: '100%',
			textAlign: 'center',
			borderRadius: 4,
			//backgroundColor: '#eee',
			backgroundColor: '#fff',
			//backgroundImage: 'linear-gradient(135deg, #fff 47.06%, #ccc 47.06%, #ccc 50%, #fff 50%, #fff 97.06%, #ccc 97.06%, #ccc 100%)',
			//backgroundSize: '24px 24px',
			padding: '2.54cm 1.32cm 3.67cm 1.9cm',
			overflow: 'auto',
			'@media print': {
				padding: '0 !important',
				opacity: 1,
				overflow: 'visible',
			},
			'@media print and (orientation: landscape)': {
				marginTop: 16,
				marginLeft: '15%',
			},
		},
		content: {
			display: 'grid',
			justifyItems: 'center',
			backgroundColor: '#fff',
			color: '#000',
		},
		history: {
			color: '#ccc',
			backgroundColor: '#444',
			padding: 4,
		},
		undoBtn: {
			borderRadius: 0,
			borderTopLeftRadius: 4,
			borderBottomLeftRadius: 4,
			'&.disabled': {
				borderInlineEnd: '6px solid black',
			},
			'& svg': {
				fontSize: 21,
				color: 'white',
				transform: 'rotate(34deg)',
			},
		},
		redoBtn: {
			borderRadius: 0,
			borderTopRightRadius: 4,
			borderBottomRightRadius: 4,
			'&.disabled': {
				borderInlineStart: '6px solid black',
			},
			'& svg': {
				fontSize: 21,
				color: 'white',
				transform: 'rotate(-34deg)',
			},
		},
		tuneBtn: {
			flex: 1,
			display: 'flex',
			justifyContent: 'start',
			// marginInlineEnd: '674px',
		},
	}));
	const classes = useStyles();

	const [tuneStageDialogVisible, setTuneStageDialogVisible] = useState(false);

	const handleClickTune = useCallback(
		function handleClickTune() {
			AnalyticsHelper.sendEvent(EventCategory.SCORE, 'print score', score.scoreInfo.scoreTitle);
			setTuneStageDialogVisible(true);
		},
		[score.scoreInfo.scoreTitle],
	);

	const handleScoreUpdated = useCallback(
		function handleScoreUpdated() {
			onUpdateScore();
		},
		[onUpdateScore],
	);
	const handleCloseTuneStageDialog = useCallback(function handleCloseTuneStageDialog() {
		setTuneStageDialogVisible(false);
	}, []);

	const handleDoneTuneStageDialog = useCallback(function handleDoneTuneStageDialog() {
		setTuneStageDialogVisible(false);
	}, []);

	return (
		<>
			{score && (
				<Box id="StageUI" className={`${classes.root} no-scrollbar`} style={{ width: `${pageWidth}px`, padding: `${(pageWidth - stageWidth) / 2}px` }}>
					<Box className={classes.content} style={{ width: `${stageWidth}px` }}>
						<ScoreOptions onClickTune={handleClickTune} onRedoUndo={onRedoUndo} pageWidth={pageWidth} stageWidth={stageWidth} />
						<Modal open={tuneStageDialogVisible} onClose={handleCloseTuneStageDialog}>
							<TunePageDialog score={score} onUpdateScore={handleScoreUpdated} onDoneTuneStageDialog={handleDoneTuneStageDialog} />
						</Modal>
						<StageHeaderUI scoreInfo={score.scoreInfo} onUpdateScore={handleScoreUpdated} />
						<MusicUI music={score.music} scoreSettings={score.scoreSettings} />
						<StageFooterUI scoreInfo={score.scoreInfo} scoreSettings={score.scoreSettings} />
					</Box>
				</Box>
			)}
		</>
	);
};
