import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box/Box';
import { Typography } from '@material-ui/core';

export const UnderConstruction = React.memo(() => {
	const useStyles = makeStyles((/*theme*/) => ({
		root: {
			height: '100%',
			backgroundImage: 'linear-gradient(135deg, #fa3 25%, #333 25%, #333 50%, #fa3 50%, #fa3 75%, #333 75%, #333 100%)',
			backgroundSize: '56px 56px',
			userSelect: 'none',
		},
		grid: {
			height: '100%',
			display: 'grid',
			justifyContent: 'center',
			alignContent: 'center',
		},
		text: {
			color: '#fff',
			fontFamily: 'Share Tech Mono',
			textShadow: '3px 3px #000',
		},
	}));
	const classes = useStyles();

	return (
		<Box id="UnderConstruction" className={classes.root}>
			<Box className={classes.grid}>
				<Typography variant="h2" className={classes.text}>
					Under Construction...
				</Typography>
			</Box>
		</Box>
	);
});
