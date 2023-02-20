import { createMuiTheme } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

export const createMyTheme: () => Theme = () => {
	return createMuiTheme({
		palette: {
			type: 'dark',
			background: {
				default: '#222',
				paper: '#333',
			},
			text: {
				primary: '#fff',
				secondary: '#fa3',
			},
			secondary: {
				main: '#d45',
				dark: '#c45',
				contrastText: '#fff',
			},
		},
		typography: {
			fontFamily: [
				'Play',
				'-apple-system',
				'BlinkMacSystemFont',
				'"Segoe UI"',
				'Roboto',
				'"Helvetica Neue"',
				'Arial',
				'sans-serif',
				'"Apple Color Emoji"',
				'"Segoe UI Emoji"',
				'"Segoe UI Symbol"',
			].join(','),
		},
	});
};
