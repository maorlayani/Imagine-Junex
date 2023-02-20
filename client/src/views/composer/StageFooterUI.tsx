import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import { AppDataHelper } from '../../services/appDataHelper';
import { ScoreInfoModel, ScoreSettingsModel } from '../../model/scoreModel';

export interface StageFooterUIProps {
	scoreInfo: ScoreInfoModel;
	scoreSettings: ScoreSettingsModel;
}

export const StageFooterUI = ({ scoreInfo, scoreSettings }: StageFooterUIProps) => {
	const useStyles = makeStyles(() => ({
		root: {},
		arrangedBy: {
			display: 'flex',
			justifyContent: 'center',
			color: '#999',
			fontSize: '12px',
		},
	}));
	const classes = useStyles();

	return (
		<Box id="StageFooterUI" className={classes.root} style={{ marginTop: scoreSettings.rowGap }}>
			{scoreInfo && scoreInfo.arrangerName && (
				<Typography variant="body2" className={classes.arrangedBy}>{`Arranged by ${scoreInfo.arrangerName} using ${AppDataHelper.appName}`}</Typography>
			)}
			{scoreInfo && !scoreInfo.arrangerName && (
				<Typography variant="body2" className={classes.arrangedBy}>
					{AppDataHelper.appName}
				</Typography>
			)}
		</Box>
	);
};
