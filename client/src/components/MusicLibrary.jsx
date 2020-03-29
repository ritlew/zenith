import React from 'react'

import { LinearProgress, IconButton, Typography, Paper, Grid, withStyles } from '@material-ui/core'
import { PlayArrow, SkipPrevious, SkipNext } from '@material-ui/icons'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css'

import clsx from 'clsx'

import cover from './cover.png'

const useStyles = theme => ({
  grid: {
    height: '100%',
    flex: 1
  },
  bar: {
    maxHeight: 75,
    height: 75,
  },
  albumArt: {
    display: 'block',
    maxHeight: 75
  },
  playbackBar: {
    width: '80%',
    margin: 'auto 1rem',
    cursor: 'pointer'
  }
})

export default withStyles(useStyles)(
  class extends React.Component {
    constructor(props){
      super(props)

      this.columnDefs = [
        { field: 'number', headerName: '#' },
        { field: 'title', headerName: 'Title' },
        { field: 'artist', headerName: 'Artist' },
        { field: 'album', headerName: 'Album' },
        { field: 'duration', headerName: 'Duration' },
      ]

      this.state = {
        selectedSong: {},
        rowData: [
          { number: 1, title: 'Malice', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '0:48'},
          { number: 2, title: 'Malefricarvm', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '5:54'},
          { number: 3, title: 'Curses', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '4:55'},
          { number: 4, title: 'Queen Ov Midnight', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '4:03'},
          { number: 5, title: 'Starless', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '3:14'},
          { number: 6 , title: 'Under A Desert Moon', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '4:49'},
          { number: 7 , title: 'Three Kings', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '2:23'},
          { number: 8 , title: 'Idle Hands (Instrumental)', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '2:33'},
          { number: 9 , title: 'Frality', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '3:55'},
          { number: 10, title: 'Diablos, Pt.1', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '4:19'},
          { number: 11, title: 'Diablos, Pt.2', artist: 'Plaguebringer', album: 'Diablos pt. 2', duration: '3:24'},
        ]
      }
    }

    handleGridReady = params => {
      this.gridApi = params.api
      this.columnApi = params.columnApi

      this.columnApi.autoSizeColumns(this.columnApi.getAllColumns())
    }

    handleRowSelection = () => {
      const selectedRows = this.gridApi.getSelectedRows();
      this.setState({ selectedSong: selectedRows.length ? selectedRows[0] : {} })
    }


    render() {
      const classes = this.props.classes

      return (
        <React.Fragment>
          <Grid container component={Paper} elevation={2} className={classes.bar} style={{ marginBottom: '1rem' }}>
            <Grid item xs={1}>
              <img src={cover} className={classes.albumArt} />
            </Grid>
            <Grid item container xs={3} alignContent="center">
              <Grid item xs={12}>
                <Typography variant="h5">{this.state.selectedSong.title}</Typography>
                <Typography variant="h6">{this.state.selectedSong.artist} - {this.state.selectedSong.album}</Typography>
              </Grid>
            </Grid>
            <Grid item container xs={8}>
              <Grid item container xs={12} justify="center" alignContent="flex-end">
                <IconButton>
                  <SkipPrevious />
                </IconButton>
                <IconButton>
                  <PlayArrow />
                </IconButton>
                <IconButton>
                  <SkipNext />
                </IconButton>
              </Grid>
              <Grid item container xs={12} justify="center" alignContent="center">
                <Typography variant="caption">1:50 / {this.state.selectedSong.duration}</Typography>
                <LinearProgress variant="determinate" value={44.5} className={classes.playbackBar}/>
              </Grid>
            </Grid>
          </Grid>
          <Paper elevation={2} className={clsx("ag-theme-balham-dark", classes.grid)}>
            <AgGridReact
              suppressCellSelection
              rowSelection="single"
              columnDefs={this.columnDefs}
              rowData={this.state.rowData}
              onGridReady={this.handleGridReady}
              onSelectionChanged={this.handleRowSelection}
            />
          </Paper>
          </React.Fragment>
      )
    }
  }
)
