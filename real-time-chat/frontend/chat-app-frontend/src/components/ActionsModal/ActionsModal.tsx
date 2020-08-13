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
import { addChannel, addRoom, addVoice, renameChannel, deleteRoom, deleteChannel, renameRoom, renameVoice, deleteVoice, deleteChatMessage, deletePrivateMessage, updateOwner, loadUserData, adjustJustLeftVoice, updateUserList, updateUnactiveUserList } from '../../actions';
import { StoreState } from '../../reducers';

interface ActionsModalProps {
  handleSnackMessage: (response: string, pass: boolean) => void;
  modalType: string;
}

const ActionsModal = (props: ActionsModalProps ) => {
  // Get State from Redux Store
  const { username } = useSelector((state: StoreState) => state.user);
  const { activeRoom, activeChannel, activeVoice, activePMUser, currentMSG, activeView, selectedUser, selectedVoiceChannel, selectedChannel } = useSelector((state: StoreState) => state.chat);
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
  const [name, setName] = useState('');
  const [roomID, setroomID] = useState('');
  const [channelName, setChannelName] = useState('');
  const [voiceName, setVoiceName] = useState('');

  // Handles showing the Join Room window
  const showhandleJoinRoom = () => {
    setMainDirection('right');
    setCreateDirection('left');
    setJoinVisible(true);
    setMainVisible(false);
  };

  // Handles showing the Create Room window
  const showhandleCreateRoom = () => {
    setMainDirection('right');
    setJoinDirection('left');
    setCreateVisible(true);
    setMainVisible(false);
  };

  // Method to handle creation of rooms
  const handleCreateRoom = async (name: string, username: string) => {
    try {
      const response = await axios.post(`/room/create?name=${name}&username=${username}`);
      if (response.status === 200) {
        dispatch(addRoom(response.data));
        dispatch(loadUserData(username));
        handleSnackMessage(`Chat room ${name} created`, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch (err) {
      handleSnackMessage('Error occurred when trying to create chat room', false);
    }
  };

  // Method to handle joining of rooms
  const handleJoinRoom = async (roomID: string, username: string) => {
    try {
      const response = await axios.post(`/room/join?roomID=${roomID}&username=${username}`);
      if (response.status === 200) {
        handleSnackMessage(response.data, true);
        if(activeRoom === '') {
          dispatch(loadUserData(username));
        }
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch (err) {
      handleSnackMessage("Error occurred when trying to join chat room", false);
    }
  };

  // Method to handle renaming of rooms
  const handleRenameRoom = async (name: string) => {
    try {
      const name = activeRoom.split('/', 2)[1];
      const response = await axios.post(
        `/room/rename?name=${name}&roomID=${activeRoom.split('/', 2)[0]}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(renameRoom(response.data));
        handleSnackMessage(`Chat room ${name} renamed to ${name}`, true);
      } else {
        handleSnackMessage(response.data, false);
      } 
    } catch (err) {
      handleSnackMessage("Error occured when trying to rename chat room", false);
    }
  };

  // Method to handle deleting rooms
  const handleDeleteRoom = async () => {
    try {
      const name = activeRoom.split('/', 2)[1];
      const response = await axios.delete(`/room/delete?roomID=${activeRoom.split('/', 2)[0]}&username=${username}`);
      if (response.status === 200) {
        dispatch(deleteRoom(activeRoom));
        dispatch(loadUserData(username));
        dispatch(updateUserList(activeRoom));
        dispatch(updateUnactiveUserList(activeRoom));
        handleSnackMessage(`Room ${name} was deleted`, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch (err) {
      handleSnackMessage("Error occured when trying to delete chat room", false);
    }
  };

  // Method to handle creation of channels
  const handleCreateChannel = async (channelName: string) => {
    try {
      const response = await axios.post(`/channel/create?name=${channelName}&room=${activeRoom}&username=${username}`);
      if (response.status === 200) {
        dispatch(addChannel(response.data));
        handleSnackMessage(`Channel ${channelName} created in room ${activeRoom.split('/', 2)[1]}`, false);
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
        `/channel/rename?channelID=${selectedChannel.split('/', 2)[0]}&room=${activeRoom}&name=${channelName}&username=${username}`
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
      const sname = activeRoom.split('/', 2)[1];
      const response = await axios.delete(
        `/channel/delete?channelID=${selectedChannel.split('/', 2)[0]}&roomID=${activeRoom.split('/', 2)[0]}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(deleteChannel({ room: activeRoom, channel: selectedChannel }))
        handleSnackMessage(`Channel ${name} deleted from room ${sname}`, true);
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
      const response = await axios.post(`/voice/create?voiceName=${voiceName}&room=${activeRoom}&username=${username}`);
      if (response.status === 200) {
        dispatch(addVoice(response.data));
        handleSnackMessage(`Voice call ${response.data.voice.split('/', 2)[1]} created`, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to create voice call", false);
    }
  };

  // Method to handle renaming voices
  const handleRenameVoice = async (voiceName: string) => {
    try {
      const name = selectedVoiceChannel.split('/', 2)[1];
      const response = await axios.post(
        `/voice/rename?voiceID=${selectedVoiceChannel.split('/', 2)[0]}&room=${activeRoom}&voiceName=${voiceName}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(renameVoice(response.data));
        handleSnackMessage(`Voice call ${name} renamed to ${voiceName}`, true);
      } else {
        handleSnackMessage(response.data, false);
      } 
    } catch(err) {
      handleSnackMessage("Error occured when trying to rename voice call", false);
    }
  };

  // Method to handle deleting voices
  const handleDeleteVoice = async () => {
    try {
      const name = selectedVoiceChannel.split('/', 2)[1];
      const sname = activeRoom.split('/', 2)[1];
      const response = await axios.delete(
        `/voice/delete?voiceID=${selectedVoiceChannel.split('/', 2)[0]}&roomID=${activeRoom.split('/', 2)[0]}&username=${username}`
      );
      if (response.status === 200) {
        dispatch(deleteVoice({ room: activeRoom, voice: selectedVoiceChannel }));
        handleSnackMessage(`Voice call ${name} deleted from room ${sname}`, true);
      } else {
        handleSnackMessage(response.data, true);
      }
    } catch (err) {
      handleSnackMessage("Error occured when trying to delete voice call", false);
    }
  };

  // Method to handle deleting messages
  const handleDeleteMessage = async (type: string) => {
    try {
      if (type === 'room') {
        const response = await axios.delete(
          `/channel/dltmsg?msgId=${currentMSG}&roomID=${activeRoom.split('/', 2)[0]}&channelID=${activeChannel.split('/', 2)[0]}&username=${username}`
        )
        if (response.status === 200) {
          dispatch(deleteChatMessage({ room: activeRoom, channel: activeChannel, msgId: currentMSG }));
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
        `/room/promote?username=${selectedUser}&roomID=${activeRoom.split('/', 2)[0]}`
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
        `/room/demote?username=${selectedUser}&roomID=${activeRoom.split('/', 2)[0]}`
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

  // Handles changing owner of room
  const handleChangeOwner = async () => {
    try {
      const response = await axios.post(
        `/room/change?owner=${username}&user=${selectedUser}&roomID=${activeRoom.split('/', 2)[0]}`
      );
      if (response.status === 200) {
        dispatch(updateOwner(activeRoom.split('/', 2)[0], username));
        handleSnackMessage(response.data, true);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to change ownership of chat room", false);
    }
  };

  // Handles removing user from room
  const handleRemoveUser = async() => {
    try {
      const response = await axios.post(
        `/room/remove?username=${selectedUser}&roomID=${activeRoom.split('/', 2)[0]}`
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

  // Handles removing user from room
  const handleLeaveRoom = async() => {
    try {
      const response = await axios.delete(
        `/room/leave?username=${username}&roomID=${activeRoom.split('/', 2)[0]}`
      );
      if (response.status === 200) {
        dispatch(deleteRoom(activeRoom));
        dispatch(loadUserData(username));
        dispatch(updateUserList(activeRoom));
        dispatch(updateUnactiveUserList(activeRoom));
        handleSnackMessage(response.data, false);
      } else {
        handleSnackMessage(response.data, false);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to leave room", false);
    }
  };

  // Handles leaving voice call in room
  const handleLeaveVoiceChannel = () => {
    try {
      if(activeVoice !== selectedVoiceChannel) {
        handleSnackMessage(`Cannot leave from a call you are not in`, false);
      } else {
        const name = activeVoice.split('/', 2)[1];
        dispatch(adjustJustLeftVoice(true));
        handleSnackMessage(`${username} has left voice call ${name}`, true);
      }
    } catch(err) {
      handleSnackMessage("Error occured when trying to leave voice call", false);
    }
  };

  // Handles keypress and calls the callback method
  const handleKeyPress = (e: KeyboardEvent, callbackMethod: Function) => {
    if (e.key === 'Enter') {
      callbackMethod();
    }
  };

  // Renders the Main Modal Window with options to Create / Join room
  const renderMainRoom = () => {
    return (
      <Slide direction={mainDirection} in={mainVisible} timeout={500} mountOnEnter unmountOnExit>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Create a chat room by joining one or by making your own!
            </Typography>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Card className="grid-card">
              <CardActionArea onClick={() => showhandleCreateRoom()}>
                <CardContent>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Create
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Start a chat room
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
              <CardActionArea onClick={() => showhandleJoinRoom()}>
                <CardContent>
                  <Typography variant="h5" color="secondary" gutterBottom>
                    Join
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Chat with others!
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

  // Renders the Room Create Modal Window
  const renderRoomCreate = () => {
    return (
      <Slide direction={createDirection} in={createVisible} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Create a chat room
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a name for your new chat room!{' '}
            </Typography>
            <TextField
              id="create-room-field"
              label="Room Name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleCreateRoom(name, username))}
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
              onClick={() => handleCreateRoom(name, username)}
            >
              Create chat room
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal with an input to rename room
  const renderRoomRename = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={1} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Rename chat room
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a new name for {activeRoom.split('/', 2)[1]}{' '}
            </Typography>
            <TextField
              id="create-channel-field"
              label="Channel Name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleRenameRoom(name))}
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
              onClick={() => handleRenameRoom(name)}
            >
              Rename chat room
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal to delete a room
  const renderRoomDelete = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Delete chat room
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to delete {activeRoom.split('/', 2)[1]}?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleDeleteRoom()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not deleting chat room', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders the Room Join Modal Window
  const renderRoomJoin = () => {
    return (
      <Slide direction={joinDirection} in={joinVisible} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Join a chat room!
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter the chat room ID and start chatting now!{' '}
            </Typography>
            <TextField
              id="join-room-field"
              label="Room ID"
              value={roomID}
              onChange={e => setroomID(e.target.value)}
              onKeyPress={e => handleKeyPress(e, () => handleJoinRoom(roomID, username))}
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
              onClick={() => handleJoinRoom(roomID, username)}
            >
              Join chat room
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
              Create a voice call
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a name for your new voice call{' '}
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
              Create voice call
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
              Rename voice call
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Enter a new name for {selectedVoiceChannel.split('/', 2)[1]}{' '}
            </Typography>
            <TextField
              id="create-channel-field"
              label="Voice Call Name"
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
              Rename voice call
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  };

  // Renders a modal to delete a voice call
  const renderVoiceDelete = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Delete voice call
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
              onClick={() => handleSnackMessage('Not deleting voice call', false)}
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
    if(activeView === 'rooms') {
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
                onClick={() => handleDeleteMessage('rooms')}
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

  // Render a modal to remove user from room
  const renderRemoveUser = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Remove user from room?
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

  // Render a modal to change owner of room
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

  // Render a modal to leave room
  const renderLeaveRoom = () => {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={500}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" color="primary" align="center">
              Leave chat room?
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-textfield">
            <Typography variant="body1" paragraph>
              {' '}
              Are you sure you want to leave this chat room?{' '}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-button">
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'green', marginRight: '8px' }}
              onClick={() => handleLeaveRoom()}
            >
              Yes
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              color="primary"
              style={{ backgroundColor: 'red', marginLeft: '8px' }}
              onClick={() => handleSnackMessage('Not leaving room', false)}
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
              Leave voice call?
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
              onClick={() => handleSnackMessage('Not leaving voice call', false)}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Slide>
    );
  }

  if (modalType === 'room-create-join')
    return (
      <Paper className="container-prompt">
        {renderMainRoom()}
        {renderRoomCreate()}
        {renderRoomJoin()}
      </Paper>
    );
  else if (modalType === 'channel-create') {
    return <Paper className="container-prompt">{renderChannelCreate()}</Paper>;
  } else if (modalType === 'voice-create') {
    return <Paper className="container-prompt">{renderVoiceCreate()}</Paper>
  } else if (modalType === 'room-rename') {
    return <Paper className="container-prompt">{renderRoomRename()}</Paper>;
  } else if (modalType === 'channel-rename') {
    return <Paper className="container-prompt">{renderChannelRename()}</Paper>;
  } else if (modalType === 'voice-rename') {
    return <Paper className="container-prompt">{renderVoiceRename()}</Paper>;
  } else if (modalType === 'channel-delete') {
    return <Paper className="container-prompt">{renderChannelDelete()}</Paper>;
  } else if (modalType === 'room-delete') {
    return <Paper className="container-prompt">{renderRoomDelete()}</Paper>;
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
  } else if(modalType === 'leave-room') {
    return <Paper className="container-prompt">{renderLeaveRoom()}</Paper>
  } else if(modalType === 'voice-leave') {
    return <Paper className="container-prompt">{renderLeaveVoice()}</Paper>
  } else return null;
}
export default ActionsModal;