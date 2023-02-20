import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Box from '@material-ui/core/Box/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Typography } from '@material-ui/core';
import { AppDataHelper } from '../../services/appDataHelper';

export const Masthead = React.memo(() => {
	const useStyles = makeStyles((/*theme*/) => ({
		root: {
			position: 'relative',
			height: '100%',
			userSelect: 'none',
			'@media print': {
				display: 'none',
			},
		},
		content: {
			height: '100%',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		leftSection: {
			display: 'flex',
			alignItems: 'center',
		},
		navLinks: {},
		list: {
			height: 100,
			display: 'flex',
			alignItems: 'center',
		},
		listItem: {
			flex: '0 0 auto',
			width: 'auto',
			height: '1.5rem',
			'&:nth-of-type(1)': {
				paddingLeft: 0,
			},
			'&:last-of-type': {
				paddingRight: 0,
			},
		},
		link: {
			textDecoration: 'none',
			transition: 'all 0.2s ease-in-out',
			textShadow: '1px 1px #000',
			color: '#aaa',
			'&:hover': {
				color: '#ccc',
			},
		},
		currentPath: {
			textDecoration: 'none',
			color: '#fa3',
			textShadow: '1px 1px #000',
			pointerEvents: 'none',
		},
		centerSection: {
			position: 'absolute',
			left: '50%',
			transform: 'translateX(-50%)',
			display: 'flex',
			alignItems: 'center',
			cursor: 'pointer',
		},
		appTitle: {
			position: 'relative',
			fontFamily: 'Aguafina Script',
			fontSize: '50px',
			color: '#ddd',
			textShadow: '2px 2px #000',
		},
		rightSection: {
			display: 'flex',
			alignItems: 'center',
		},
		actionButton: {
			marginLeft: 16,
			textTransform: 'none',
		},
	}));
	const classes = useStyles();

	const leftLinks: Array<{ text: string; to: string }> = [
		{ text: 'Home', to: '/' },
		{ text: 'Composer', to: '/composer' },
		{ text: 'Play', to: '/play' },
		{ text: 'Help', to: '/help' },
		{ text: 'About', to: '/about' },
	];

	// const rightLinks: Array<{ text: string; to: string }> = [];

	const myLocation = useLocation();

	const isCurrentPathLink = (linkTo: string) => {
		if (linkTo === '/') {
			return myLocation.pathname === '/' || myLocation.pathname === '/home';
		} else {
			return myLocation.pathname.startsWith(linkTo);
		}
	};

	const history = useHistory();

	const handleClickHomeIcon = () => {
		history.push('/');
	};

	return (
		<Box id="Masthead" className={classes.root}>
			<Box className={classes.content}>
				<Box className={classes.leftSection}>
					<Box className={classes.navLinks}>
						<List className={classes.list}>
							{leftLinks.map((link) => (
								<ListItem key={link.to} className={classes.listItem}>
									<Link to={link.to} className={isCurrentPathLink(link.to) ? classes.currentPath : classes.link}>
										<ListItemText primary={link.text} />
									</Link>
								</ListItem>
							))}
						</List>
					</Box>
				</Box>
				<Box onClick={handleClickHomeIcon} className={classes.centerSection}>
					<Typography variant="h4" className={`${classes.appTitle}`}>
						{AppDataHelper.appName}
					</Typography>
				</Box>
				<Box className={classes.rightSection}>
					{/*<Box className={classes.navLinks}>*/}
					{/*	<List className={classes.list}>*/}
					{/*		{rightLinks.map((link, i) => (*/}
					{/*			<ListItem key={link.text} className={classes.listItem}>*/}
					{/*				<Link to={link.to} className={link.to === myLocation.pathname ? classes.currentPath : classes.link}>*/}
					{/*					<ListItemText primary={link.text} />*/}
					{/*				</Link>*/}
					{/*			</ListItem>*/}
					{/*		))}*/}
					{/*	</List>*/}
					{/*</Box>*/}
					{/*<Button disabled={true} onClick={handleClickLogin} variant="contained" size="small" className={classes.actionButton}>*/}
					{/*	Log In*/}
					{/*</Button>*/}
				</Box>
			</Box>
		</Box>
	);
});
