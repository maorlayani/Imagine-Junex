import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { AppDataHelper } from '../../services/appDataHelper';

export const AboutPage = React.memo(() => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'relative',
			height: '100%',
			display: 'grid',
			placeItems: 'center',
			userSelect: 'none',
		},
		container: {
			border: '1px solid #666',
			borderRadius: 8,
			padding: 24,
			backgroundColor: '#222',
			opacity: 0.75,
			fontSize: 24,
		},
		text: {
			color: '#fff',
			textShadow: '2px 2px #000',
		},
		link: {
			color: '#fa3',
			textDecoration: 'none',
			textShadow: '2px 2px #000',
		},
	}));
	const classes = useStyles();

	return (
		<Box id="AboutPage" className={classes.root}>
			<Box className={classes.container}>
				<Box className={classes.text}>
					{AppDataHelper.appName} {AppDataHelper.appVersion}
				</Box>
				<Box className={classes.text}>
					Developed by Uri Kalish for{' '}
					<a href="https://www.imagine.org.il/" target="_blank" rel="noreferrer" className={classes.link}>
						imagine.org.il
					</a>
				</Box>
				<Box>
					<a href="mailto:uri.kalish@gmail.com" className={classes.link}>
						uri.kalish@gmail.com
					</a>
				</Box>
			</Box>
		</Box>
	);
});
