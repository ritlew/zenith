import React from 'react'

import { TextField, LinearProgress, IconButton, Typography, Paper, Grid, withStyles } from '@material-ui/core'
import { VolumeUp, VolumeOff, PlayArrow, Pause, SkipPrevious, SkipNext } from '@material-ui/icons'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css'

import clsx from 'clsx'
import ReactPlayer from 'react-player'

import cover from './cover.png'

const useStyles = theme => ({
  grid: {
    height: '100%',
    flex: 1
  },
  bar: {
  },
  albumArt: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    maxHeight: 75
  },
  playbackBar: {
    height: 8,
    width: '65%',
    margin: 'auto 1rem',
    cursor: 'pointer'
  },
  volumeBar: {
    height: 8,
    width: '10%',
    margin: 'auto 0.5rem',
    cursor: 'pointer'

  },
  textTruncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  clickThrough: {
    pointerEvents: 'none',
    transition: 'none'//'transform .1s linear'
  },
  bottomMargin: {
    marginBottom: '1rem'
  }
})

const sec2time = data => {
  const timeInSeconds = data.value
  var pad = function(num, size) { return ('000' + num).slice(size * -1); },
    time = parseFloat(timeInSeconds).toFixed(3),
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60)

  let str = ''
  if (hours){
    str += pad(hours, 2)
  }
  if (minutes || seconds){
    return str + pad(minutes, 2) + ':' + pad(seconds, 2)
  } else {
    return '00:00'
  }
}

export default withStyles(useStyles)(
  class extends React.Component {
    constructor(props){
      super(props)

      this.playerRef = React.createRef()

      this.defaultColDef = { 
        sortable: true,
        filter: true
      }
      this.columnDefs = [
        { field: 'number', headerName: '#' },
        { field: 'title', headerName: 'Title' },
        { field: 'artist', headerName: 'Artist' },
        { field: 'album', headerName: 'Album' },
        { field: 'duration', headerName: 'Duration', valueFormatter: sec2time },
      ]

      this.songs = []

      this.state = {
        selectedSong: {},
        nextSongNode: {},
        progress: 0,
        muted: false,
        volume: 0.5,
        playing: false,
        rowData: [],
        filterText: ''
      }
    }

    getSongs = () => {
      fetch('http://localhost:3000/api/song/meta/')
        .then(response => response.json()).then(data => {
          this.songs = data
          this.setState({rowData: this.filterSongs(data)}, () => {
            this.columnApi.autoSizeColumns(this.columnApi.getAllColumns())
            this.gridApi.setSortModel([
              {colId: 'artist', sort: 'asc'},
              {colId: 'album', sort: 'asc'}, 
              {colId: 'number', sort: 'asc'} 
            ])
          })
        })
        .catch(error => console.log(error))
    }

    filterSongs = songs => {
      return songs.filter(song => {
        return [song.title, song.album, song.artist].some(val => {
          return val.toLowerCase().includes(this.state.filterText.toLowerCase())
        })
      })
    }

    handleGridReady = params => {
      this.gridApi = params.api
      this.columnApi = params.columnApi

      this.columnApi.autoSizeColumns(this.columnApi.getAllColumns())
      this.getSongs()
    }

    handleRowSelection = event => {
      const selectedRows = this.gridApi.getSelectedRows();
      this.setState({ playing: true, progress: 0, selectedSong: selectedRows.length ? selectedRows[0] : {} })
    }

    handleProgress = data => {
      if (data.played > .90){
        this.setState({ nextSongNode: this.getNextSong() })
      }
      this.setState(prevState => ({ progress: data.playedSeconds }))
    }

    togglePlaying = () => {
      this.setState(prevState => ({ playing: Boolean(!prevState.playing && prevState.selectedSong.title) }))
    }

    handleProgressClick = e => {
      const loc = e.nativeEvent.offsetX / e.nativeEvent.target.offsetWidth
      this.playerRef.seekTo(loc)
    }

    handleVolumeClick = e => {
      const loc = e.nativeEvent.offsetX / e.nativeEvent.target.offsetWidth
      this.setState({ volume: Math.pow(Math.min(loc, 1), 3) })
    }

    getPreviousSong = () => {
      let previous = {}
      let songNode = {}
      this.gridApi.forEachNodeAfterFilterAndSort((node, index) => {
        if (node.data === this.state.selectedSong && index < this.state.rowData.length && previous.data){
          songNode = previous
        }
        previous = node
      })

      return songNode
    }

    getNextSong = () => {
      let next
      let songNode = {}
      this.gridApi.forEachNodeAfterFilterAndSort((node, index) => {
        if (next) {
          songNode = node
          next = false
        }
        next = node.data === this.state.selectedSong && index < this.state.rowData.length
      })
      return songNode
    }

    handlePlaybackEnd = () => {
      let node = {}
      if (this.state.nextSongNode){
        node = this.state.nextSongNode
      } else {
        node = this.getNextSongNode()
      }
      if (node.data) {
        node.setSelected(true, true)
        this.setState(prevState => ({ selectedSong: node.data, nextSongNode: {} }))
      }
    }

    handleFilterText = event => {
      this.setState({ [event.target.name]: event.target.value }, () => {
        this.setState({ rowData: this.filterSongs(this.songs) })
      })
    }

    toggleMute = () => {
      this.setState(prevState => ({ muted: !prevState.muted }))
    }

    playPrevious = () => {
      const node = this.getPreviousSong()
      if (node.data) {
        node.setSelected(true, true)
        this.setState({ selectedSong: node.data, nextSongNode: {}})
      }
    }

    playNext = () => {
      const node = this.getNextSong()
      if (node.data) {
        node.setSelected(true, true)
        this.setState({ selectedSong: node.data, nextSongNode: {}})
      }
    } 


    ref = player => {
      this.playerRef = player
    }

    render() {
      const classes = this.props.classes

      return (
        <React.Fragment>
          <Grid 
          container 
          spacing={1}
          elevation={2} 
          component={Paper} 
          className={clsx(classes.bar, classes.marginBottom)} 
          style={{ marginBottom: '1rem' }}>
          <Grid item xs={1}>
            <img 
            src={
              Boolean(this.state.selectedSong.album_art) 
                ? this.state.selectedSong.album_art 
                : '/album.png'
            } 
            className={classes.albumArt} 
            alt="Album art" />
          </Grid>
          <Grid item container lg={3} xs={5} alignContent="center">
            <Grid item xs={12}>
              <Typography variant="h5" className={classes.textTruncate}>
                {this.state.selectedSong.title}
              </Typography>
              <Typography variant="h6" className={classes.textTruncate}>
                {this.state.selectedSong.artist} - {this.state.selectedSong.album}
              </Typography>
            </Grid>
          </Grid>
          <Grid item container xs alignContent="flex-end">
            <Grid item container xs={12} justify="center" alignContent="center">
              <IconButton size="small" onClick={this.playPrevious}>
                <SkipPrevious />
              </IconButton>
              <IconButton onClick={this.togglePlaying} size="small">
                {this.state.playing ? <Pause /> : <PlayArrow /> }
              </IconButton>
              <IconButton size="small" onClick={this.playNext}>
                <SkipNext />
              </IconButton>
            </Grid>
            <Grid item container xs={12} justify="center" alignContent="center">
              <Typography variant="caption" style={{ margin: 'auto 12px' }}>
                {sec2time({value: this.state.progress})} / {sec2time({value: this.state.selectedSong.duration})}
              </Typography>
              <LinearProgress 
              variant="determinate" 
              value={Math.min(this.state.progress / this.state.selectedSong.duration * 100, 100)} 
              className={classes.playbackBar}
              classes={{ bar1Determinate: classes.clickThrough }}
              onClick={this.handleProgressClick}
            />
              <IconButton size="small" onClick={this.toggleMute}>
                {this.state.muted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <LinearProgress 
                variant="determinate"
                value={Math.pow(this.state.volume, 1/3) * 100} 
                className={classes.volumeBar}
                classes={{ bar1Determinate: classes.clickThrough }}
                onClick={this.handleVolumeClick}
            />
                {this.state.selectedSong && (
                  <ReactPlayer 
                  ref={this.ref}
                  playing={this.state.playing}
                  muted={this.state.muted}
                  volume={this.state.volume}
                  style={{display: 'none'}}
                  progressInterval={500}
                  url={this.state.selectedSong.url}
                  onProgress={this.handleProgress}
                  onEnded={this.handlePlaybackEnd}
                />
                )}
                {this.state.nextSongNode.data && (
                  <audio src={this.state.nextSongNode.data.url} preload="auto" />
                )}
                </Grid>
              </Grid>
            </Grid>
            <Paper elevation={2} className={classes.bottomMargin} style={{ padding: 4 }}>
              <TextField 
              fullWidth 
              name="filterText" 
              placeholder="Filter by title, artist, or album" 
              value={this.state.filterText}
              onChange={this.handleFilterText}
            />
            </Paper>
            <Paper elevation={2} className={clsx("ag-theme-balham-dark", classes.grid)}>
              <AgGridReact
              suppressCellSelection
              floatingFilter
              multiSortKey='ctrl'
              rowSelection="single"
              columnDefs={this.columnDefs}
              defaultColDef={this.defaultColDef}
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
