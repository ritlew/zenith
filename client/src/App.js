import React from 'react';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'

import Dashboard from './components/Dashboard'


const theme = createMuiTheme({
  palette: {
    type: 'dark'
  }
})

class App extends React.Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
  }
}

export default App;
