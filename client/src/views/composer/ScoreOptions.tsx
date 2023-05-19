import { Box, IconButton, Typography, makeStyles } from '@material-ui/core';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import TuneIcon from '@material-ui/icons/Tune';
import { useRecoilValue } from 'recoil';
import { musicHistoryIdxAtom } from '../../atoms/musicHistoryIdxAtom';
import { musicHistoryAtom } from '../../atoms/musicHistoryAtom';

export type ScoreOptionsProps = {
	onRedoUndo: (val: number) => void;
	onClickTune: () => void;
	pageWidth: number;
	stageWidth: number;
};
// this component includes the undo/redo panel, and the button on the left for tuning on the modal
function ScoreOptions({ onRedoUndo, onClickTune, pageWidth, stageWidth }: ScoreOptionsProps) {
	const useStyles = makeStyles(() => ({
		scoreOptions: {
			position: 'absolute',
			display: 'flex',
			width: pageWidth - 16 - (pageWidth - stageWidth) / 2,
			left: 16,
			top: 16,
		},
		scoreOptionButton: {
			width: '24px !important',
			height: '32px !important',
			textAlign: 'center',
			cursor: 'pointer',
			transition: 'all 0.4s ease-in-out',
			color: '#333',
			'&:disabled': {
				pointerEvents: 'none',
				backgroundColor: '#444',
			},
			'@media print': {
				display: 'none',
			},
		},
		undoRedoPanel: {
			display: 'flex',
			alignItems: 'center',
			backgroundColor: '#222',
			padding: 4,
			borderRadius: 4,
			boxShadow: '3px 3px 2px rgba(0, 0, 0, 0.2)',
			transition: '0.4s',
			'&.hidden': {
				opacity: 0,
			},
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
			'&:disabled': {
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
			'&:disabled': {
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
		},
	}));
	const classes = useStyles();
	const musicHistoryIdx = useRecoilValue(musicHistoryIdxAtom);
	const musicHistoryLength = useRecoilValue(musicHistoryAtom).length;
	return (
		<Box className={classes.scoreOptions}>
			<IconButton onClick={onClickTune} className={`${classes.scoreOptionButton} ${classes.tuneBtn}`}>
				<TuneIcon titleAccess="Tune Page" />
			</IconButton>
			<Box className={`${classes.undoRedoPanel} ${musicHistoryLength <= 1 ? 'hidden' : ''}`}>
				<IconButton onClick={() => onRedoUndo(-1)} className={`${classes.scoreOptionButton} ${classes.undoBtn}`} disabled={musicHistoryIdx <= 0}>
					<UndoIcon titleAccess="Undo" />
				</IconButton>
				<Typography className={`${classes.history}`}>
					{musicHistoryIdx + 1}/{musicHistoryLength}
				</Typography>
				<IconButton onClick={() => onRedoUndo(1)} className={`${classes.scoreOptionButton} ${classes.redoBtn}`} disabled={musicHistoryIdx + 1 >= musicHistoryLength}>
					<RedoIcon titleAccess="Redo" />
				</IconButton>
			</Box>
		</Box>
	);
}

export default ScoreOptions;
