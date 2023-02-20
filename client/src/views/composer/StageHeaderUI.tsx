import React, { useCallback, useRef } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { TextField, Typography } from '@material-ui/core';
import { ScoreInfoModel } from '../../model/scoreModel';

export interface StageHeaderUIProps {
	scoreInfo: ScoreInfoModel;
	onUpdateScore: () => void;
}

export const StageHeaderUI = ({ scoreInfo, onUpdateScore }: StageHeaderUIProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			marginBottom: 32,
		},
		scoreTitle: {
			display: 'flex',
			justifyContent: 'center',
			color: '#000',
			cursor: 'pointer',
		},
		scoreTitleInput: {
			top: -6,
			'& .MuiInput-input': {
				color: '#000',
				fontSize: 34,
				width: 650,
			},
		},
		scoreCredits: {
			display: 'flex',
			justifyContent: 'center',
			color: '#666',
			cursor: 'pointer',
		},
		scoreCreditsInput: {
			top: -4,
			'& .MuiInput-input': {
				color: '#000',
				fontSize: 20,
				width: 650,
			},
		},
	}));
	const classes = useStyles();

	const scoreTitleTextRef = useRef<HTMLHeadingElement | null>(null);
	const scoreTitleInputRef = useRef<HTMLInputElement | null>(null);
	const scoreCreditsTextRef = useRef<HTMLHeadingElement | null>(null);
	const scoreCreditsInputRef = useRef<HTMLInputElement | null>(null);

	const handleClickScoreTitle = useCallback(
		function handleClickScoreTitle() {
			const scoreTitleText = scoreTitleTextRef.current;
			const scoreTitleInput = scoreTitleInputRef.current;
			if (!scoreTitleText || !scoreTitleInput) {
				return;
			}
			scoreTitleText.style.display = 'none';
			scoreTitleInput.style.display = 'inline-flex';
			(scoreTitleInput.children[0].children[0] as HTMLInputElement).focus();
		},
		[scoreTitleTextRef, scoreTitleInputRef],
	);

	const handleBlurScoreTitle = useCallback(
		function handleBlurScoreTitle() {
			if (!scoreInfo) {
				return;
			}
			const scoreTitleText = scoreTitleTextRef.current;
			const scoreTitleInput = scoreTitleInputRef.current;
			if (!scoreTitleText || !scoreTitleInput) {
				return;
			}
			scoreTitleText.style.display = 'flex';
			scoreTitleInput.style.display = 'none';
			scoreInfo.scoreTitle = (scoreTitleInput.children[0].children[0] as HTMLInputElement).value || `<SCORE TITLE>`;
			onUpdateScore();
		},
		[scoreTitleTextRef, scoreTitleInputRef, scoreInfo, onUpdateScore],
	);

	const handleClickScoreCredits = useCallback(
		function handleClickScoreCredits() {
			const scoreCreditsText = scoreCreditsTextRef.current;
			const scoreCreditsInput = scoreCreditsInputRef.current;
			if (!scoreCreditsText || !scoreCreditsInput) {
				return;
			}
			scoreCreditsText.style.display = 'none';
			scoreCreditsInput.style.display = 'inline-flex';
			(scoreCreditsInput.children[0].children[0] as HTMLInputElement).focus();
		},
		[scoreCreditsTextRef, scoreCreditsInputRef],
	);

	const handleBlurScoreCredits = useCallback(
		function handleBlurScoreCredits() {
			if (!scoreInfo) {
				return;
			}
			const scoreCreditsText = scoreCreditsTextRef.current;
			const scoreCreditsInput = scoreCreditsInputRef.current;
			if (!scoreCreditsText || !scoreCreditsInput) {
				return;
			}
			scoreCreditsText.style.display = 'flex';
			scoreCreditsInput.style.display = 'none';
			scoreInfo.scoreCredits = (scoreCreditsInput.children[0].children[0] as HTMLInputElement).value || `<SCORE CREDITS>`;
			onUpdateScore();
		},
		[scoreCreditsTextRef, scoreCreditsInputRef, scoreInfo, onUpdateScore],
	);

	return (
		<>
			{scoreInfo && (
				<Box id="StageHeaderUI" className={classes.root}>
					<Typography ref={scoreTitleTextRef} onClick={handleClickScoreTitle} variant="h4" className={classes.scoreTitle}>
						{scoreInfo.scoreTitle}
					</Typography>
					<TextField
						ref={scoreTitleInputRef}
						defaultValue={scoreInfo.scoreTitle}
						onBlur={handleBlurScoreTitle}
						className={classes.scoreTitleInput}
						style={{ display: 'none' }}
						label=""
					/>
					<Typography ref={scoreCreditsTextRef} onClick={handleClickScoreCredits} variant="h6" className={classes.scoreCredits}>
						{scoreInfo.scoreCredits}
					</Typography>
					<TextField
						ref={scoreCreditsInputRef}
						defaultValue={scoreInfo.scoreCredits}
						onBlur={handleBlurScoreCredits}
						className={classes.scoreCreditsInput}
						style={{ display: 'none' }}
						label=""
					/>
				</Box>
			)}
		</>
	);
};
