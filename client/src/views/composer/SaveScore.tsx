import React, { useEffect, useRef } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { AppDataHelper } from '../../services/appDataHelper';
import { ScoreModel } from '../../model/scoreModel';

export interface SaveScoreProps {
	score: ScoreModel | null;
	goSaveScore: boolean;
	onSaveScoreDone: () => void;
}

export const SaveScore = React.memo(({ score, goSaveScore, onSaveScoreDone }: SaveScoreProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			display: 'none',
		},
	}));
	const classes = useStyles();

	const downloadLinkRef = useRef<any>();

	useEffect(
		function doSaveScore() {
			if (goSaveScore) {
				const downloadLink: HTMLAnchorElement = downloadLinkRef.current;
				downloadLink.setAttribute('href', window.URL.createObjectURL(new Blob([JSON.stringify(score)], { type: 'application/json;charset=utf-8' })));
				downloadLink.setAttribute('download', `${score?.scoreInfo.scoreTitle || 'My Score'}.${AppDataHelper.scoreFileExt}`);
				downloadLink.click();
				onSaveScoreDone();
			}
		},
		[downloadLinkRef, score, goSaveScore, onSaveScoreDone],
	);

	return (
		<Box id="SaveScore" className={classes.root}>
			<a href="/#" ref={downloadLinkRef} style={{ display: 'none' }}>
				save
			</a>
		</Box>
	);
});
