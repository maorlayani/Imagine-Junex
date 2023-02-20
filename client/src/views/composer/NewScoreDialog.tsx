import React, { useCallback, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import { Score } from '../../model/score';

interface NewScoreDialogProps {
	onDoneNewScoreDialog: (newScore: Score | null) => void;
}

export const NewScoreDialog = React.forwardRef(({ onDoneNewScoreDialog }: NewScoreDialogProps, _ref) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'fixed',
			left: '50%',
			top: '50%',
			transform: 'translate(-50%, -50%)',
			borderRadius: 8,
			width: 1000,
			display: 'grid',
			gridTemplate: 'auto 1fr auto / auto',
			border: '1px solid #666',
			backgroundColor: '#222',
			padding: 24,
			color: '#fff',
			//opacity: 0.9,
		},
		header: {},
		title: {
			fontSize: 24,
			// fontFamily: 'Aguafina Script',
			userSelect: 'none',
		},
		body: {
			margin: '40px 24px 48px 24px',
		},
		form: {
			display: 'grid',
			gridTemplateColumns: 'repeat(3, 1fr)',
			gap: '40px 40px',
			userSelect: 'none',
			'& label.Mui-focused': {
				color: '#fa3',
			},
			'& .MuiInput-underline:after': {
				borderBottomColor: '#fff',
			},
		},
		formControl: {},
		footer: {
			display: 'flex',
			justifyContent: 'flex-end',
		},
		actionButton: {
			height: 32,
			marginLeft: 16,
			'&.MuiButton-contained.Mui-disabled': {
				backgroundColor: '#333',
			},
		},
	}));
	const classes = useStyles();

	const [isOk, setIsOk] = useState(false);
	const [scoreTitle, setScoreTitle] = useState('');
	const [scoreCredits, setScoreCredits] = useState('');
	const [arrangerName, setArrangerName] = useState('');
	const [timeSignature, setTimeSignature] = useState('4/4');
	const [tempoBpm, setTempoBpm] = useState<string>('120');
	const [scaleRoot, setScaleRoot] = useState<string>('C');
	const [scaleMode, setScaleMode] = useState<string>('Ionian');
	const [pickupMeasure, setPickupMeasure] = useState('no');
	const [numberOfMeasures, setNumberOfMeasures] = useState<string>('16');

	const handleChangeScoreTitle = (e: any) => {
		setScoreTitle(e.target.value);
		setIsOk(!!e.target.value);
	};

	const handleChangeScoreCredits = (e: any) => {
		setScoreCredits(e.target.value);
	};

	const handleChangeArrangerName = (e: any) => {
		setArrangerName(e.target.value);
	};

	const handleChangeTimeSignature = (e: any) => {
		setTimeSignature(e.target.value);
	};

	const handleChangeTempoBpm = (e: any) => {
		setTempoBpm(e.target.value);
	};

	const handleChangeScaleRoot = (e: any) => {
		setScaleRoot(e.target.value);
	};

	const handleChangeScaleMode = (e: any) => {
		setScaleMode(e.target.value);
	};

	const handleChangePickupMeasure = (e: any) => {
		setPickupMeasure(e.target.value);
	};

	const handleChangeNumberOfMeasurements = (e: any) => {
		setNumberOfMeasures(e.target.value);
	};

	const handleClickCancel = useCallback(
		function handleClickCancel() {
			onDoneNewScoreDialog(null);
		},
		[onDoneNewScoreDialog],
	);

	const handleClickOK = useCallback(
		function handleClickOK() {
			const newScore = Score.createNew(
				scoreTitle,
				scoreCredits,
				arrangerName,
				timeSignature,
				Number(tempoBpm) || 120,
				scaleRoot,
				scaleMode,
				pickupMeasure === 'yes',
				Number(numberOfMeasures) || 16,
			);
			onDoneNewScoreDialog(newScore);
		},
		[scoreTitle, scoreCredits, arrangerName, timeSignature, tempoBpm, scaleRoot, scaleMode, pickupMeasure, numberOfMeasures, onDoneNewScoreDialog],
	);

	return (
		<Box id="NewScoreDialog" className={classes.root}>
			<Box className={classes.header}>
				<Box className={classes.title}>New Score</Box>
			</Box>
			<Box className={classes.body}>
				<form className={classes.form} noValidate autoComplete="off">
					<TextField label="Score Title" value={scoreTitle} onChange={handleChangeScoreTitle} placeholder="e.g. Bohemian Rhapsody" autoFocus={true} />

					<TextField label="Score Credits" value={scoreCredits} onChange={handleChangeScoreCredits} placeholder="e.g. Freddie Mercury & Queen" />

					<TextField label="Arranger Name" value={arrangerName} onChange={handleChangeArrangerName} placeholder="Your name" />

					<FormControl className={classes.formControl}>
						<InputLabel id="time-signature-label">Time Signature</InputLabel>
						<Select id="time-signature" value={timeSignature} onChange={handleChangeTimeSignature}>
							<MenuItem value="2/4">2/4</MenuItem>
							<MenuItem value="3/4">3/4</MenuItem>
							<MenuItem value="4/4">4/4</MenuItem>
							<MenuItem value="5/4">5/4</MenuItem>
							<MenuItem value="6/4">6/4</MenuItem>
							<MenuItem value="7/4">7/4</MenuItem>
							<MenuItem value="8/4">8/4</MenuItem>
							<MenuItem value="2/8">2/8</MenuItem>
							<MenuItem value="3/8">3/8</MenuItem>
							<MenuItem value="4/8">4/8</MenuItem>
							<MenuItem value="5/8">5/8</MenuItem>
							<MenuItem value="6/8">6/8</MenuItem>
							<MenuItem value="7/8">7/8</MenuItem>
							<MenuItem value="8/8">8/8</MenuItem>
						</Select>
					</FormControl>

					<FormControl className={classes.formControl}>
						<InputLabel id="pickup-measure-label">Pickup Measure (initial bar)</InputLabel>
						<Select id="pickup-measure" value={pickupMeasure} onChange={handleChangePickupMeasure}>
							<MenuItem value="yes">Yes</MenuItem>
							<MenuItem value="no">No</MenuItem>
						</Select>
					</FormControl>

					<TextField label="Number of Measurements" value={numberOfMeasures} onChange={handleChangeNumberOfMeasurements} placeholder="e.g. 16" />

					<FormControl className={classes.formControl}>
						<InputLabel id="scale-root-label">Scale Root</InputLabel>
						<Select id="scale-root" value={scaleRoot} onChange={handleChangeScaleRoot}>
							<MenuItem value="C">C</MenuItem>
							<MenuItem value="C#">C#</MenuItem>
							<MenuItem value="Db">Db</MenuItem>
							<MenuItem value="D">D</MenuItem>
							<MenuItem value="D#">D#</MenuItem>
							<MenuItem value="Eb">Eb</MenuItem>
							<MenuItem value="E">E</MenuItem>
							<MenuItem value="F">F</MenuItem>
							<MenuItem value="F#">F#</MenuItem>
							<MenuItem value="Gb">Gb</MenuItem>
							<MenuItem value="G">G</MenuItem>
							<MenuItem value="G#">G#</MenuItem>
							<MenuItem value="Ab">Ab</MenuItem>
							<MenuItem value="A">A</MenuItem>
							<MenuItem value="A#">A#</MenuItem>
							<MenuItem value="Bb">Bb</MenuItem>
							<MenuItem value="B">B</MenuItem>
						</Select>
					</FormControl>

					<FormControl className={classes.formControl}>
						<InputLabel id="scale-mode-label">Scale Mode</InputLabel>
						<Select id="scale-mode" value={scaleMode} onChange={handleChangeScaleMode}>
							<MenuItem value="Ionian">Ionian (major)</MenuItem>
							<MenuItem value="Aeolian">Aeolian (minor)</MenuItem>
							<MenuItem value="Dorian">Dorian</MenuItem>
							<MenuItem value="Phrygian">Phrygian </MenuItem>
							<MenuItem value="Lydian">Lydian</MenuItem>
							<MenuItem value="Mixolydian">Mixolydian</MenuItem>
							<MenuItem value="Locrian">Locrian</MenuItem>
						</Select>
					</FormControl>

					<TextField label="Tempo (bpm)" value={tempoBpm} onChange={handleChangeTempoBpm} placeholder="e.g. 120" />
				</form>
			</Box>
			<Box className={classes.footer}>
				<Button disabled={!isOk} onClick={handleClickOK} variant="contained" size="small" className={classes.actionButton}>
					OK
				</Button>
				<Button onClick={handleClickCancel} variant="contained" size="small" className={classes.actionButton}>
					Cancel
				</Button>
			</Box>
		</Box>
	);
});
