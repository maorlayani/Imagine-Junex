import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box/Box';
import { Link } from 'react-router-dom';

export const HomePage = React.memo(() => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'relative',
			height: '100%',
			display: 'grid',
			placeItems: 'center',
			userSelect: 'none',
		},
		link: {
			fontSize: 32,
			color: '#fa3',
			textDecoration: 'none',
			textShadow: '2px 2px #000',
		},
	}));
	const classes = useStyles();

	return (
		<Box id="HomePage" className={classes.root}>
			<Box>
				<Link to="/composer" className={classes.link}>
					Enter Composer
				</Link>
			</Box>
		</Box>
	);
});
