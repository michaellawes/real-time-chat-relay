import React, { useState, KeyboardEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Paper,
  Button,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  CardMedia,
  Slide,
  TextField,
  Grid
} from '@material-ui/core';
import { GroupAdd, AddToQueue } from '@material-ui/icons';
import axios from '../Api/api';
import { addChannel, addServer, addVoice, renameChannel, deleteServer, deleteChannel, renameServer, renameVoice, deleteVoice, deleteServerMessage, deletePrivateMessage, updateOwner, loadUserData, adjustJustLeftVoice, updateUserList, updateUnactiveUserList } from '../../actions';
import { StoreState } from '../../reducers';

interface ActionsModalProps {
  handleSnackMessage: (response: string, pass: boolean) => void;
  modalType: string;
}

const ActionsModal = (props: ActionsModalProps ) => {
  // Get State from Redux Store
  const { username } = useSelector((state: StoreState) => state.user);
  const { activeServer, activeChannel, activeVoice, activePMUser, currentMSG, activeView, selectedUser, selectedVoiceChannel, selectedChannel } = useSelector((state: StoreState) => state.chat);
  const dispatch = useDispatch();

  // Get data from props
  const { handleSnackMessage, modalType } = props;

  // Local state to control Modal Windows + Data fields
  const [mainVisible, setMainVisible] = useState(true);
  const [mainDirection, setMainDirection]: any = useState('left');
  const [createVisible, setCreateVisible] = useState(false);
  const [createDirection, setCreateDirection]: any = useState('left');
  const [joinVisible, setJoinVisible] = useState(false);
  const [joinDirection, setJoinDirection]: any = useState('left');
  const [serverName, setServerName] = useState('');
  const [serverId, setServerId] = useState('');
  const [channelName, setChannelName] = useState('');
  const [voiceName, setVoiceName] = useState('');

  // Handles showing the Join Server window
  const showhandleJoinServer = () => {
    setMainDirection('right');
    setCreateDirection('left');
    setJoinVisible(true);
    setMainVisible(false);
  };

  // Handles showing the Create Server window
  const showhandleCreateServer = () => {
    setMainDirection('right');
    setJoinDirection('left');
    setCreateVisible(true);
    setMainVisible(false);
  };

  // Method to handle creation of servers
  const handleCreateServer = async (serverName: string, username: string) => {
    try {
      const response = await axios.post(`/server/create?serverName=${serverName}&username=${username}`);
      if (response.status === 200) {
        dispatch(addServer(response.data));
        dispatch(loadUserData(username));
        handleSnackMessage(`Community ${serverName} created`, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch (err) {
      handleSnackMessage('Error occurred when trying to create community', false);
    }
  };

  // Method to handle joining of servers
  const handleJoinServer = async (serverId: string, username: string) => {
    try {
      const response = await axios.post(`/server/join?serverId=${serverId}&username=${username}`);
      if (response.status === 200) {
        handleSnackMessage(response.data, true);
        if(activeServer === '') {
          dispatch(loadUserData(username));
        }
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch (err) {
      handleSnackMessage("Error occurred when trying to join community", false);
    }
  };

  // Method to handle renaming of servers
  const handleRenameServer = async (serverName: string) => {
    try {
      const name = activeServer.split('/', 2)[1];
      const response = await axios.post(
        `/server/rename?serverName=${serverName}&serverId=${activeServer.split('/', 2)[0]}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(renameServer(response.data));
        handleSnackMessage(`Community ${name} renamed to ${serverName}`, true);
      } else {
        handleSnackMessage(response.data, false);
      } 
    } catch (err) {
      handleSnackMessage("Error occured when trying to rename community", false);
    }
  };

  // Method to handle deleting servers
  const handleDeleteServer = async () => {
    try {
      const name = activeServer.split('/', 2)[1];
      const response = await axios.delete(`/server/delete?serverId=${activeServer.split('/', 2)[0]}&username=${username}`);
      if (response.status === 200) {
        dispatch(deleteServer(activeServer));
        dispatch(loadUserData(username));
        dispatch(updateUserList(activeServer));
        dispatch(updateUnactiveUserList(activeServer));
        handleSnackMessage(`Server ${name} was deleted`, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch (err) {
      handleSnackMessage("Error occured when trying to delete community", false);
    }
  };

  // Method to handle creation of channels
  const handleCreateChannel = async (channelName: string) => {
    try {
      const response = await axios.post(`/channel/create?channelName=${channelName}&server=${activeServer}&username=${username}`);
      if (response.status === 200) {
        dispatch(addChannel(response.data));
        handleSnackMessage(`Channel ${channelName} created in server ${activeServer.split('/', 2)[1]}`, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch (err) {
      handleSnackMessage("Error occured when trying to create channel", false);
    }
  };
  
  // Method to handle renaming channels
  const handleRenameChannel = async (channelName: string) => {
    try {
      const name = selectedChannel.split('/', 2)[1];
      const response = await axios.post(
        `/channel/rename?channelId=${selectedChannel.split('/', 2)[0]}&server=${activeServer}&channelName=${channelName}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(renameChannel(response.data));
        handleSnackMessage(`Channel ${name} renamed to ${channelName}`, true);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to rename channel", false);
    }
  };

  // Method to handle deleting channels
  const handleDeleteChannel = async () => {
    try {
      const name = selectedChannel.split('/', 2)[1];
      const sname = activeServer.split('/', 2)[1];
      const response = await axios.delete(
        `/channel/delete?channelId=${selectedChannel.split('/', 2)[0]}&serverId=${activeServer.split('/', 2)[0]}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(deleteChannel({ server: activeServer, channel: selectedChannel }))
        handleSnackMessage(`Channel ${name} deleted from server ${sname}`, true);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch (err) {
      handleSnackMessage("Error occured when trying to delete channel", false);
    }
  };

  // Method to create handle creating voices
  const handleCreateVoice = async (voiceName: string) => {
    try {
      const response = await axios.post(`/voice/create?voiceName=${voiceName}&server=${activeServer}&username=${username}`);
      if (response.status === 200) {
        dispatch(addVoice(response.data));
        handleSnackMessage(`Voice channel ${response.data.voice.split('/', 2)[1]} created`, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to create voice channel", false);
    }
  };

  // Method to handle renaming voices
  const handleRenameVoice = async (voiceName: string) => {
    try {
      const name = selectedVoiceChannel.split('/', 2)[1];
      const response = await axios.post(
        `/voice/rename?voiceId=${selectedVoiceChannel.split('/', 2)[0]}&server=${activeServer}&voiceName=${voiceName}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(renameVoice(response.data));
        handleSnackMessage(`Voice channel ${name} renamed to ${voiceName}`, true);
      } else {
        handleSnackMessage(response.data, false);
      } 
    } catch(err) {
      handleSnackMessage("Error occured when trying to rename voice channel", false);
    }
  };

  // Method to handle deleting voices
  const handleDeleteVoice = async () => {
    try {
      const name = selectedVoiceChannel.split('/', 2)[1];
      const sname = activeServer.split('/', 2)[1];
      const response = await axios.delete(
        `/voice/delete?voiceId=${selectedVoiceChannel.split('/', 2)[0]}&serverId=${activeServer.split('/', 2)[0]}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(deleteVoice({ server: activeServer, voice: selectedVoiceChannel }));
        handleSnackMessage(`Voice channel ${name} deleted from server ${sname}`, true);
      } else {
        handleSnackMessage(response.data, true);
      }
    } catch (err) {
      handleSnackMessage("Error occured when trying to delete voice channel", false);
    }
  };

  // Method to handle deleting messages
  const handleDeleteMessage = async (type: string) => {
    try {
      if (type === 'server') {
        const response = await axios.delete(
          `/channel/dltmsg?msgId=${currentMSG}&serverId=${activeServer.split('/', 2)[0]}&channelId=${activeChannel.split('/', 2)[0]}&username=${username}`
        )
        if (response.status === 200) {
          dispatch(deleteServerMessage({ server: activeServer, channel: activeChannel, msgId: currentMSG }));
          handleSnackMessage(`${username} deleted message from ${activeChannel.split('/', 2)[1]}`, true);
        } else {
          handleSnackMessage(response.data, false);
        }
      } else {
        const response = await axios.delete(
          `/user/dltpm?msgId=${currentMSG}&from=${username}&userTo=${activePMUser}`
        )
        if (response.status === 200) {
          dispatch(deletePrivateMessage({ userMessaged: activePMUser, msgId: currentMSG }));
          handleSnackMessage(response.data, true);
        } else {
          handleSnackMessage(response.data, false);
        }
      }
    } catch (err) {
      handleSnackMessage("Error occured when trying to delete message", false);
    }
  };

  // Handles making user an admin
  const handleMakeAdmin = async() => {
    try {
      const response = await axios.post(
        `/server/promote?username=${selectedUser}&serverId=${activeServer.split('/', 2)[0]}`
      );
      if(response.status === 200) {
        handleSnackMessage(response.data, true);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to promote user", false);
    }
  };

  // Handles taking away admin priveleged from user
  const handleRemoveAdmin = async () => {
    try {
      const response = await axios.post(
        `/server/demote?username=${selectedUser}&serverId=${activeServer.split('/', 2)[0]}`
      );
      if (response.status === 200) {
        handleSnackMessage(response.data, true);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to demote user", false);
    }
  };

  // Handles changing owner of server
  const handleChangeOwner = async () => {
    try {
      const response = await axios.post(
        `/server/change?owner=${username}&user=${selectedUser}&serverId=${activeServer.split('/', 2)[0]}`
      );
      if (response.status === 200) {
        dispatch(updateOwner(activeServer.split('/', 2)[0], username));
        handleSnackMessage(response.data, true);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to change ownership of community", false);
    }
  };

  // Handles removing user from server
  const handleRemoveUser = async() => {
    try {
      const response = await axios.post(
        `/server/remove?username=${selectedUser}&serverId=${activeServer.split('/', 2)[0]}`
      );
      if(response.status === 200) {
        handleSnackMessage(response.data, true);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to remove user", false);
    }
  };

  // Handles removing user from server
  const handleLeaveServer = async() => {
    try {
      const response = await axios.delete(
        `/server/leave?username=${username}&serverId=${activeServer.split('/', 2)[0]}`
      );
      if (response.status === 200) {
        dispatch(deleteServer(activeServer));
        dispatch(loadUserData(username));
        dispatch(updateUserList(activeServer));
        dispatch(updateUnactiveUserList(activeServer));
        handleSnackMessage(response.data, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to leave server", false);
    }
  };

  // Handles leaving voice channel in server
  const handleLeaveVoiceChannel = async() => {
    try {
      if(activeVoice !== selectedVoiceChannel) {
        handleSnackMessage(`Cannot leave from a call you are not in`, false);
      } else {
        const name = activeVoice.split('/', 2)[1];
        dispatch(adjustJustLeftVoice(true));
        handleSnackMessage(`${username} has left voice channel ${name}`, true);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to leave voice channel", false);
    }
  };

  // Handles keypress and calls the callback method
  const handleKeyPress = (e: KeyboardEvent, callbackMethod: Function) => {
    if (e.key === 'Enter') {
      callbackMethod();
    }
  };

  // Renders the Main Modal Window with options to Create / Join server
  const renderMainServer = () => {
    return (
      <Slide direction={mainDirection} in={mainVisible} timeout={500} mountOnEnter unmountOnExit>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Develop a community by joining one or by making your own!
            </Typography>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Card className="grid-card">
              <CardActionArea onClick={() => showhandleCreateServer()}>
                <CardContent>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Create
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Start a Thndr community
                  </Typography>
                  <CardMedia>
                    <AddToQueue className="modal-card-icon1" />
                  </CardMedia>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Card className="grid-card">
              <CardActionArea onClick={() => showhandleJoinServer()}>
                <CardContent>
                  <Typography variant="h5" color="secondary" gutterBottom>
                    Join
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Chat with others on Thndr
                  </Typography>
                  <CardMedia>
                    <GroupAdd className="modal-card-icon" />
                  </CardMedia>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders the Server Create Modal Window
  const renderServerCreate = () => {
    return (
      <Slide direction={createDirection} in={createVisible} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Create a community
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a name for your new community!{' '}
            </Typography>
            <TextField
              id="create-server-field"
              label="Server Name"
              value={serverName}
              onChange={e => setServerName(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleCreateServer(serverName, username))}
              margin="dense"
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              onClick={() => handleCreateServer(serverName, username)}
            >
              Create Community
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal with an input to rename server
  const renderServerRename = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={1} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Rename community
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a new name for {activeServer.split('/', 2)[1]}{' '}
            </Typography>
            <TextField
              id="create-channel-field"
              label="Channel Name"
              value={serverName}
              onChange={e => setServerName(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleRenameServer(serverName))}
              margin="dense"
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              onClick={() => handleRenameServer(serverName)}
            >
              Rename community
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal to delete a server
  const renderServerDelete = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Delete Community
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to delete {activeServer.split('/', 2)[1]}?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleDeleteServer()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not deleting community', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders the Server Join Modal Window
  const renderServerJoin = () => {
    return (
      <Slide direction={joinDirection} in={joinVisible} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Join a community!
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter the community id and start chatting now!{' '}
            </Typography>
            <TextField
              id="join-server-field"
              label="Server Id"
              value={serverId}
              onChange={e => setServerId(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleJoinServer(serverId, username))}
              margin="dense"
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              onClick={() => handleJoinServer(serverId, username)}
            >
              Join community
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders the Channel Create Modal Window
  const renderChannelCreate = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Create a channel
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a name for your new channel{' '}
            </Typography>
            <TextField
              id="create-channel-field"
              label="Channel Name"
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleCreateChannel(channelName))}
              margin="dense"
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              onClick={() => handleCreateChannel(channelName)}
            >
              Create Channel
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal to rename a channel
  const renderChannelRename = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Rename Channel
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a new name for {activeChannel.split('/', 2)[1]}{' '}
            </Typography>
            <TextField
              id="create-channel-field"
              label="Channel Name"
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleRenameChannel(channelName))}
              margin="dense"
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              onClick={() => handleRenameChannel(channelName)}
            >
              Rename Channel
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal to delete a channel
  const renderChannelDelete = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Delete Channel
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to delete {activeChannel.split('/', 2)[1]}{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleDeleteChannel()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not deleting channel', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders the Voice Create Modal Window
  const renderVoiceCreate = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Create a voice channel
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a name for your new voice channel{' '}
            </Typography>
            <TextField
              id="create-voice-field"
              label="Voice Name"
              value={voiceName}
              onChange={e => setVoiceName(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleCreateVoice(voiceName))}
              margin="dense"
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              onClick={() => handleCreateVoice(voiceName)}
            >
              Create Voice Channel
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal to rename a channel
  const renderVoiceRename = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Rename Voice Channel
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a new name for {selectedVoiceChannel.split('/', 2)[1]}{' '}
            </Typography>
            <TextField
              id="create-channel-field"
              label="Voice Channel Name"
              value={voiceName}
              onChange={e => setVoiceName(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleRenameVoice(voiceName))}
              margin="dense"
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              onClick={() => handleRenameVoice(voiceName)}
            >
              Rename Voice Channel
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal to delete a voice channel
  const renderVoiceDelete = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Delete Voice Channel
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to delete {selectedVoiceChannel.split('/', 2)[1]}{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleDeleteVoice()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not deleting voice channel', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal to delete a message
  const renderMessageDelete = () => {
    if(activeView === 'servers') {
      return (
        <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
          <Grid container spacing={3} justify="center" alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h5" color="primary" align="center">
                Delete message?
              </Typography>
            </Grid>
            <Grid item xs={12} className="grid-textfield">
              <Typography variant="body1" paragraph>
                {' '}
                Are you sure you want to delete the message?{' '}
              </Typography>
            </Grid>
            <Grid item xs={12} className="grid-button">
              <Button
                className="modal-button"
                variant="contained"
                color="primary"
                style={{ backgroundColor: 'green', marginRight: '8px' }}
                onClick={() => handleDeleteMessage('server')}
              >
                Yes
              </Button>
              <Button
                className="modal-button"
                variant="contained"
                color="primary"
                style={{ backgroundColor: 'red', marginLeft: '8px' }}
                onClick={() => handleSnackMessage('Not deleting message', false)}
              >
                No
              </Button>
            </Grid>
          </Grid>
        </Slide>
      );
    } else {
      return (
        <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
          <Grid container spacing={3} justify="center" alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h5" color="primary" align="center">
                Delete message?
              </Typography>
            </Grid>
            <Grid item xs={12} className="grid-textfield">
              <Typography variant="body1" paragraph>
                {' '}
                Are you sure you want to delete the message?{' '}
              </Typography>
            </Grid>
            <Grid item xs={12} className="grid-button">
              <Button
                className="modal-button"
                variant="contained"
                color="primary"
                style={{ backgroundColor: 'green', marginRight: '8px' }}
                onClick={() => handleDeleteMessage('private')}
              >
                Yes
              </Button>
              <Button
                className="modal-button"
                variant="contained"
                color="primary"
                style={{ backgroundColor: 'red', marginLeft: '8px' }}
                onClick={() => handleSnackMessage('Not deleting message', false)}
              >
                No
              </Button>
            </Grid>
          </Grid>
        </Slide>
      );
    }
  };

  // Render a modal to make user an admin
  const renderMakeAdmin = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Promote user to admin?
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to promote this user?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleMakeAdmin()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not promoting user', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  }

  // Render a modal to remove admin status
  const renderRemoveAdmin = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Demote?
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to demote this user?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleRemoveAdmin()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not demoting user', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  }

  // Render a modal to remove user from server
  const renderRemoveUser = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Remove user from community?
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to make remove this user?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleRemoveUser()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not removing user', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  }

  // Render a modal to change owner of server
  const renderChangeOwner = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Change ownership?
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to make this user the owner?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleChangeOwner()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not changing ownership', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  }

  // Render a modal to leave server
  const renderLeaveServer = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Leave community?
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to leave this community?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleLeaveServer()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not leaving server', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  }

  // Render a modal to allow user to leave VC
  const renderLeaveVoice = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Leave voice channel?
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to leave?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleLeaveVoiceChannel()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not leaving voice channel', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  }

  if (modalType === 'server-create-join')
    return (
      <Paper className="container-prompt">
        {renderMainServer()}
        {renderServerCreate()}
        {renderServerJoin()}
      </Paper>
    );
  else if (modalType === 'channel-create') {
    return <Paper className="container-prompt">{renderChannelCreate()}</Paper>;
  } else if (modalType === 'voice-create') {
    return <Paper className="container-prompt">{renderVoiceCreate()}</Paper>
  } else if (modalType === 'server-rename') {
    return <Paper className="container-prompt">{renderServerRename()}</Paper>;
  } else if (modalType === 'channel-rename') {
    return <Paper className="container-prompt">{renderChannelRename()}</Paper>;
  } else if (modalType === 'voice-rename') {
    return <Paper className="container-prompt">{renderVoiceRename()}</Paper>;
  } else if (modalType === 'channel-delete') {
    return <Paper className="container-prompt">{renderChannelDelete()}</Paper>;
  } else if (modalType === 'server-delete') {
    return <Paper className="container-prompt">{renderServerDelete()}</Paper>;
  } else if (modalType === 'voice-delete') {
    return <Paper className="container-prompt">{renderVoiceDelete()}</Paper>;
  } else if (modalType === 'message-delete') {
    return <Paper className="container-prompt">{renderMessageDelete()}</Paper>
  } else if (modalType === 'make-admin') {
    return <Paper className="container-prompt">{renderMakeAdmin()}</Paper>
  } else if (modalType === 'remove-admin') {
    return <Paper className="container-prompt">{renderRemoveAdmin()}</Paper>
  } else if (modalType === 'remove') {
    return <Paper className="container-prompt">{renderRemoveUser()}</Paper>
  } else if (modalType === 'change-owner') {
    return <Paper className="container-prompt">{renderChangeOwner()}</Paper>
  } else if(modalType === 'leave-server') {
    return <Paper className="container-prompt">{renderLeaveServer()}</Paper>
  } else if(modalType === 'voice-leave') {
    return <Paper className="container-prompt">{renderLeaveVoice()}</Paper>
  } else return null;
}
export default ActionsModal;