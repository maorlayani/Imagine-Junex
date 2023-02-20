import React from 'react';
import Box from '@material-ui/core/Box/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
// import { Typography } from '@material-ui/core';
// import { AppDataHelper } from '../../services/appDataHelper';

export const Footer = React.memo(() => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'absolute',
			right: 8,
			bottom: 4,
			userSelect: 'none',
		},
		footer: {
			//transform: 'rotateZ(90deg)',
			//transformOrigin: 'top right',
			fontSize: 13,
			color: '#999',
			textShadow: '1px 1px #000',
		},
	}));
	const classes = useStyles();

	return (
		<Box id="Footer" className={classes.root}>
			{/*<Typography variant="body1" className={classes.footer}>*/}
			{/*	{`${AppDataHelper.appName}`}*/}
			{/*</Typography>*/}
		</Box>
	);
});
