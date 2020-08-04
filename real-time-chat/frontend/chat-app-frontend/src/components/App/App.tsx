import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import './App.css';
import Dashboard from '../Dashboard/Dashboard';
import Auth from '../Auth/Auth';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Route path="/dashboard" exact component={Dashboard} />
        <Route path="/" exact component={Auth} />
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;

const theme = createMuiTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '14px',
        backgroundColor: '#FAFAFA',
        color: '#6E4AB1',
        border: '1px',
        borderColor: '#d9dadb'
      }
    },
    MuiSnackbarContent: {
      root: {
        backgroundColor: '#FAFAFA',
        color: '#6E4AB1'
      }
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: '#FAFAFA',
        color: '#6E4AB1',
        position: 'absolute'
      }
    }
  },
  palette: {
    type: 'light',
    primary: {
      main: '#6E4AB1'
    },
    secondary: {
      main: '#00FFFF'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600
  }
})