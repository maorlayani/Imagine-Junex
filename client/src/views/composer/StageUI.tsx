import React, { useCallback, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { IconButton, Modal } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import { ScoreModel } from '../../model/scoreModel';
import { TunePageDialog } from './TunePageDialog';
import { StageHeaderUI } from './StageHeaderUI';
import { MusicUI } from './MusicUI';
import { StageFooterUI } from './StageFooterUI';
import { AnalyticsHelper, EventCategory } from '../../services/analyticsHelper';

export interface StageUIProps {
	score: ScoreModel;
	onRedoUndo: (val: number) => void;
	onUpdateScore: () => void;
}

export const StageUI = ({ score, onUpdateScore, onRedoUndo }: StageUIProps) => {
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
		scoreOptions: {
			position: 'fixed',
			left: 16,
			top: 16,
		},
		scoreOptionButton: {
			width: '24px !important',
			height: '24px !important',
			textAlign: 'center',
			cursor: 'pointer',
			transition: 'all 0.2s ease-in-out',
			color: '#333',
			'&:hover': {
				color: '#000',
			},
			'&.disabled': {
				pointerEvents: 'none',
				color: '#999',
			},
			'@media print': {
				display: 'none',
			},
		},
		tuneButton: {
			marginInlineEnd: '674px',
		},
	}));
	const classes = useStyles();

	const pageWidth = 776;
	const stageWidth = 718;

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
						<Box className={classes.scoreOptions}>
							<IconButton onClick={handleClickTune} className={`${classes.scoreOptionButton} ${classes.tuneButton}`} disabled={!score}>
								<TuneIcon titleAccess="Tune Page" />
							</IconButton>
							<IconButton onClick={()=> onRedoUndo(-1)} className={`${classes.scoreOptionButton}`} disabled={!score}>
								<UndoIcon titleAccess="Undo" />
							</IconButton>
							<IconButton onClick={()=> onRedoUndo(1)} className={`${classes.scoreOptionButton}`} disabled={!score}>
								<RedoIcon titleAccess="Redo" />
							</IconButton>
						</Box>
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
