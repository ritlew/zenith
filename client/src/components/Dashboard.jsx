import React from 'react';

import { 
  CssBaseline,
  Drawer, 
  Box, 
  AppBar, 
  Toolbar, 
  List, 
  ListItem,
  ListItemIcon,
  ListSubheader,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Badge,
  Container,
  Grid,
  Paper,
  Link
} from '@material-ui/core'
import { LibraryMusic, Menu, ChevronLeft, Notifications } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';

import clsx from 'clsx';

import MusicLibrary from './MusicLibrary'

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flex: 1,
    flexFlow: 'column',
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    display: 'flex',
    flexFlow: 'column',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    flexGrow: 1,
    height: '100%'
  },
  fixedHeight: {
    height: 240,
  },
}));

export default function Dashboard() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
      }}
      open={open}
    >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </div>
        <List>
          <ListItem button>
            <ListItemIcon><LibraryMusic /></ListItemIcon>
            <ListItemText primary="Library" />
          </ListItem>
        </List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <Container maxWidth="lg" className={classes.container}>
            <MusicLibrary />
        </Container>
      </main>
    </div>
  );
}
