import React, { useState, useEffect, useCallback } from 'react';
import { Person, MoreVert, Settings, AudiotrackRounded } from '@material-ui/icons';
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Tooltip,
  IconButton,
  Typography,
  ListItemText,
  Menu,
  MenuItem,
  Slide,
  Button
} from '@material-ui/core';
import {
  changeVoice,
  changeChannel,
  signOut,
  sendRtcSignal,
  sendJoinVoice,
  sendLeaveVoice,
  clearVoiceConnection,
  setSelectedVC,
  adjustJustLeftVoice,
  leaveVoice,
  setSelectedChannel,
} from '../../actions';
import { useSelector, useDispatch } from 'react-redux';
import { StoreState } from '../../reducers';
import { useRef } from 'react';
/*
<div class="user-voice-avatar">
  <img src=${imageSrc} alt="user icon" height="38" />
</div>
*/

interface ChannelListProps {
  setDrawerVisible?: (drawerVisible: boolean) => void;
  setModalVisible: (modalVisible: boolean) => void;
  setModalType: (modalType: string) => void;
  handleSnackMessage: (response: string, pass: boolean) => void;
}

// Audio stream vars
let localStream: any;
let connections: any = {};
let peerConnectionConfig = {
  iceServers: [{ urls: 'stun:stun.services.mozilla.com'}, { urls: 'stun:stun.l.google.com:19302' }]
}

const ChannelList = (props: ChannelListProps) => {
  // Get State from Redux Store
  const chatStore = useSelector((state: StoreState) => state.chat);
  const { activeServer, activeVoice, rtcSignalData, voiceJoinUsername, voiceLeaveUsername, voiceClients, justLeftVoice } = chatStore;
  const user = useSelector((state: StoreState) => state.user);
  const dispatch = useDispatch();

  // Handles if channels or voice channels end up being null
  let channels: any = [];
  if (chatStore.servers[activeServer] !== undefined) {
    channels = Object.keys(chatStore.servers[activeServer]['channels']);
  };
  let voiceChannels: any = []
  if (chatStore.servers[activeServer] !== undefined) {
    voiceChannels = Object.keys(chatStore.servers[activeServer]['voiceChannels']);
  };

  // eslint-disable-next-line
  let prevActiveVoice = useRef('');

  // Get props from parent
  const { setDrawerVisible, setModalVisible, setModalType, handleSnackMessage } = props;

  // Local state
  const [ownerServerAnchorEl, setOwnerServerAnchorEl] = useState(null);
  const [adminServerAnchorEl, setAdminServerAnchorEl] = useState(null);
  const [memberServerAnchorEl, setMemberServerAnchorEl] = useState(null);
  const [channelAnchorEl, setChannelAnchorEl] = useState(null);
  const [modVoiceAnchorEl, setModVoiceAnchorEl] = useState(null);
  const [voiceAnchorEl, setVoiceAnchorEl] = useState(null);

  // Disconnects our voice session on change channel
  const disconnectPreviousVoice = () => {
    let audios = document.getElementById('audiosContainer');
    if (audios) {
      audios.outerHTML = '';
    };

    // Close all rtc peer connections and empty array
    if (connections) {
      const users = Object.keys(connections);
      users.forEach((connection: string) => {
        connections[connection].close();
        let name = document.getElementById(connection);
        if(name !== null) {
          let nameContainer: any = name.parentElement;
          nameContainer.removeChild(name);
        };
      });
      connections = {};
    };
    connections = {};
  };


  // Just left wrapper for disconnect previous voice
  const justLeftVoiceWrapper = useCallback(() => {
    // Disconnects our voice session on change channel
    const disconnectPreviousVoice = () => {
      let audios = document.getElementById('audiosContainer');
      if (audios) {
        audios.outerHTML = '';
      };

      // Close all rtc peer connections and empty array
      if (connections) {
        const users = Object.keys(connections);
        users.forEach((connection: string) => {
          connections[connection].close();
          let name = document.getElementById(connection);
          if(name !== null) {
            let nameContainer: any = name.parentElement;
            nameContainer.removeChild(name);
          };
        });
        connections = {};
      };
    };
    disconnectPreviousVoice();
    dispatch(adjustJustLeftVoice(false));
    dispatch(leaveVoice());
  }, [dispatch])

  // Disconnect voice wrapper
  const disconnectVoiceWrapper = useCallback(() => {
    // Disconnects our voice session on change channel
    const disconnectPreviousVoice = () => {
      let audios = document.getElementById('audiosContainer');
      if (audios) {
        audios.outerHTML = '';
      };
      // Close all rtc peer connections and empty array
      if (connections) {
        const users = Object.keys(connections);
        users.forEach((connection: string) => {
          connections[connection].close();
          let name = document.getElementById(connection);
          if(name !== null) {
            let nameContainer: any = name.parentElement;
            nameContainer.removeChild(name);
          };
        });
        connections = {};
      };
      connections = {};
    };
    disconnectPreviousVoice();
  }, []);

  // Attach voice channel wrapper
  const attachVoiceWrapper = useCallback(() => {
    // When user accepts, add their stream to page
    const attachVoiceChannel = () => {
      let audios = document.createElement('div');
      audios.id = 'audiosContainter';
      let div = document.createElement('div');
      div.setAttribute('id', user.username);
      // let imageSrc = process.env.PUBLIC_URL + '/user.png';
      div.innerHTML = `
      <div class="user-voice-item">
        <div class="user-voice-name">
          ${user.username}
        </div>
      </div>
      `;

      let audio = document.createElement('audio');
      // Set data properties of new audio element
      audio.srcObject = localStream;
      audio.autoplay = false;
      audio.muted = false;
      audio.controls = false;
      audio.volume = 0.05;

      div.appendChild(audio);
      audios.appendChild(div);
      let audiosParent = document.getElementById(activeVoice.split('/', 2)[0]);
      if (audiosParent) {
        if (audiosParent.parentNode) {
          audiosParent.parentNode.insertBefore(audios, audiosParent.nextSibling);
        };
      };
    };
    attachVoiceChannel();
  }, [activeVoice, user.username]);
  

  // On user leave wrapper
  const onUserLeaveWrapper = useCallback(() => {
    // On user leave
    const onUserLeave = (username: string) => {

      // Close RTC peer connection
      connections[username].close();
      connections[username] = null;

      // Remove the audio element from page
      let audio = document.querySelector('[data-socket="' + username + '"]') as HTMLElement;
      let parentDiv = audio.parentElement as HTMLElement;
      let parentContainer = parentDiv.parentElement as HTMLElement;
      let name = document.getElementById(username);
      if(name !== null) {
        let nameContainer: any = name.parentElement;
        nameContainer.removeChild(name);
      };
      parentContainer.removeChild(parentDiv);
    };
    onUserLeave(voiceLeaveUsername);
  }, [voiceLeaveUsername]);

  // Determine which options to display
  const serverOptions = (): string => {
    if(user.isOwner && !user.isAdmin) {
      return 'server-owner';
    } else if(user.isAdmin && !user.isOwner) {
      return 'server-admin';
    } else {
      return 'member';
    };
  };

  // Handle channel change, and closes drawer if on mobile view
  const handleChannelChange = (channel: string) => {
    dispatch(changeChannel(channel));
    if (typeof setDrawerVisible !== 'undefined') {
      setDrawerVisible(false);
    };
  };

  // Handle voice channel selection
  const handleVoiceSelect = (voice: string, callBack: Function) => {
    dispatch(setSelectedVC(voice));
    callBack();
  };

  // Handle channel selection
  const handleChannelSelect = (channel: string, callBack: Function) => {
    dispatch(setSelectedChannel(channel));
    callBack();
  };

  // Handle voice change
  const handleVoiceChange = (voice: string) => {
    if (prevActiveVoice.current === '' && activeVoice === '') {
      prevActiveVoice.current = activeVoice;
      dispatch(changeVoice(voice));
    } else if (prevActiveVoice.current === '' && activeVoice !== '' && voice !== activeVoice) {
      prevActiveVoice.current = activeVoice;
      dispatch(sendLeaveVoice({ username: user.username, voice: activeVoice }));
      dispatch(clearVoiceConnection());
      disconnectVoiceWrapper();
      dispatch(changeVoice(voice));
    } else if (prevActiveVoice.current !== '' && activeVoice !== '' && voice !== activeVoice) {
      dispatch(sendLeaveVoice({ username: user.username, voice: prevActiveVoice.current }));
      dispatch(clearVoiceConnection());
      disconnectVoiceWrapper();
      prevActiveVoice.current = activeVoice;
      dispatch(sendLeaveVoice({ username: user.username, voice: activeVoice }));
      dispatch(clearVoiceConnection());
      disconnectVoiceWrapper();
      dispatch(changeVoice(voice));
    } 
    if (typeof setDrawerVisible !== 'undefined') {
      setDrawerVisible(false);
    };
  };

  // Checks if only 1 channel, if so does not call callback to delete channel
  const handleChannelDelete = (callBack: Function) => {
    if (channels.length === 1) {
      handleSnackMessage('Please delete the community if only 1 channel.', false);
    } else {
      callBack();
    };
  };

  // Checks if only 1 voice, if so does not call callback to delete voice
  const handleVoiceDelete = (callBack: Function) => {
    if(voiceChannels.length === 1) {
      handleSnackMessage('Please delete the community if only 1 voice channel.', false);
    } else {
      if(prevActiveVoice.current === '' && activeVoice !== '') {
        dispatch(sendLeaveVoice({ username: user.username, voice: activeVoice }));
        dispatch(clearVoiceConnection());
        dispatch(disconnectPreviousVoice());
      } else if (prevActiveVoice.current !== '' && activeVoice !== '') {
        dispatch(sendLeaveVoice({ username: user.username, voice: prevActiveVoice.current }));
        dispatch(clearVoiceConnection());
        dispatch(disconnectPreviousVoice());
        dispatch(sendLeaveVoice({ username: user.username, voice: activeVoice }));
        dispatch(clearVoiceConnection());
        disconnectVoiceWrapper();
      };
      callBack();
    };
  };

  // Handles to show modal and its type
  const handleModalShow = (modalType: string) => {
    setModalType(modalType);
    setModalVisible(true);
  };

  // Handles showing of Settings Menu
  const handleSettingsClick = (e: any, type: string) => {
    if (type === 'server-owner') {
      setOwnerServerAnchorEl(e.currentTarget);
    } else if(type === 'server-admin') {
      setAdminServerAnchorEl(e.currentTarget)
    } else if(type === 'member') {
      setMemberServerAnchorEl(e.currentTarget);
    } else if (type === 'channel') {
      setChannelAnchorEl(e.currentTarget);
    } else if (type === 'mod-voice') {
      setModVoiceAnchorEl(e.currentTarget);
    } else if (type === 'voice') {
      setVoiceAnchorEl(e.currentTarget);
    };
  };

  // Determines if user is owner or admin
  const canModify = (): Boolean => {
    if(user.isAdmin || user.isOwner) {
      return true;
    } else {
      return false;
    };
  };

  // Handles closing settings menu
  const handleClose = () => {
    setOwnerServerAnchorEl(null);
    setAdminServerAnchorEl(null)
    setMemberServerAnchorEl(null);
    setChannelAnchorEl(null);
    setModVoiceAnchorEl(null);
    setVoiceAnchorEl(null);
  };

  // Signs the user out
  const handleSignOut = () => {
    localStorage.clear();
    if(activeVoice !== '') {
      dispatch(sendLeaveVoice({ username: user.username, voice: activeVoice }));
      dispatch(clearVoiceConnection());
      disconnectPreviousVoice();
    };
    dispatch(signOut());
  };

  // Handles saving serverId to clipboard
  const handleSaveClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    handleSnackMessage(`Community ID ${text} saved to clipboard`, false);
  };

  // Listens for changes on user signed in
  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia && user.isSignedIn) {
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false }).then(stream => {
        localStream = stream;
      });
    };
  }, [user.isSignedIn]);


  // Listens for changes on new voice clients
  useEffect(() => {
    if (voiceJoinUsername && voiceClients && localStream) {
      // On userjoin update client list
      const onUserJoin = (newUsername: string, clients: { username: string; }[]) => {
        // Iterate over client list
        clients.forEach(user => {
          // If new client isnt in our list
          if (connections[user.username] === undefined) {
            // Add this new users Peer connection to our connections array ( use stun servers )
            connections[user.username] = new RTCPeerConnection(peerConnectionConfig);

            // Wait for peer to generate ice candidate
            connections[user.username].onicecandidate = (event: any) => {
              if (event.candidate !== null) {
                dispatch(sendRtcSignal({ username: user.username, ice: event.candidate }));
              };
            };

            // Event handler for peer adding their stream
            connections[user.username].onaddstream = (event: any) => {

              // If we get a new remote stream, add it to page
              const gotRemoteStream = (event: any, userSocketId: string) => {
                // Create our wrapper div
                let div = document.createElement('div');
                div.setAttribute('id', userSocketId);
                // let imageSrc = process.env.PUBLIC_URL + '/user.png';
                div.innerHTML = `
                <div class="user-voice-item">
                  <div class="user-voice-name">
                    ${user.username}
                  </div>
                </div>
                `;

                // Set data properties of new audio element
                let audio = document.createElement('audio');
                audio.setAttribute('data-socket', userSocketId);
                audio.srcObject = event.stream;
                audio.muted = false;
                audio.volume = 0.1;
                audio.autoplay = true;

                // Get our audios container
                let audios = document.getElementById('audiosContainer') as HTMLElement;

                // Put element into the page
                div.appendChild(audio);
                audios.appendChild(div);
              };              
              gotRemoteStream(event, user.username);
            };

            // Adds our local video stream to Peer
            connections[user.username].addStream(localStream);
          };
        });

        // Create offer to new client joining if it is not ourselves, dont create offer to ourselves on first join
        if (newUsername !== user.username) {
          connections[newUsername].createOffer().then((description: RTCSessionDescription) => {
            connections[newUsername]
              .setLocalDescription(description)
              .then(() => {
                dispatch(sendRtcSignal({ username: newUsername, sdp: connections[newUsername].localDescription }));
              })
              .catch((e: any) => console.log(e));
          });
        };
      };
      onUserJoin(voiceJoinUsername, voiceClients);
    };
  }, [voiceJoinUsername, voiceClients, dispatch, user.username]);


  // Listens for changes on our signaling data
  useEffect(() => {
    if (voiceJoinUsername !== '') {
      // New message from server, configure RTC sdp session objects
      const gotMessageFromServer = (fromUsername: string, signal: any) => {
        //Make sure it's not coming from yourself
        if (fromUsername !== user.username) {
          if (signal.sdp) {
            connections[fromUsername]
              .setRemoteDescription(new RTCSessionDescription(signal.sdp))
              .then(() => {
                if (signal.sdp.type === 'offer') {
                  connections[fromUsername]
                    .createAnswer()
                    .then((description: any) => {
                      connections[fromUsername]
                        .setLocalDescription(description)
                        .then(() => {
                          dispatch(sendRtcSignal({ username: fromUsername, sdp: connections[fromUsername].localDescription }));
                        })
                        .catch((e: any) => console.log(e));
                    })
                    .catch((e: any) => console.log(e));
                };
              })
              .catch((e: any) => console.log(e));
          };

          if (signal.ice) {
            connections[fromUsername].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e: any) => console.log(e));
          };
        };
      };
      gotMessageFromServer(rtcSignalData.username, rtcSignalData);
    };
  }, [voiceJoinUsername, rtcSignalData, dispatch, user.username]);

  // Listens for changes on users leaving voice channel
  useEffect(() => {
    if (voiceLeaveUsername !== '') {
      onUserLeaveWrapper();
    };
  }, [voiceLeaveUsername, onUserLeaveWrapper]);

  useEffect(() => {
    if (justLeftVoice) {
      dispatch(sendLeaveVoice({ username: user.username, voice: activeVoice }));
      dispatch(clearVoiceConnection());
      prevActiveVoice.current = '';
      justLeftVoiceWrapper();
    } else {
      if (activeVoice !== '' && prevActiveVoice.current === '') {
        attachVoiceWrapper();
        dispatch(sendJoinVoice({ username: user.username, voice: activeVoice }));
      } else if (prevActiveVoice.current !== '' && activeVoice !== '') {
        attachVoiceWrapper();
        dispatch(sendJoinVoice({ username: user.username, voice: activeVoice }));
      };
    };
  }, [activeVoice, justLeftVoice, justLeftVoiceWrapper, dispatch, attachVoiceWrapper, user.username, onUserLeaveWrapper]);

  return (
    <div className="channels-container">
      <List className="channel-list">
        <ListItem className="title-container">
          {activeServer.split('/', 2)[1]}
          {activeServer !== '' ?
          <React.Fragment>
            <Tooltip title="Community Settings" key="server-settings" placement="right" className="tooltip">
              <IconButton onClick={e => handleSettingsClick(e, serverOptions())}>
                {' '}
                <MoreVert className="more-vert"/>{' '}
              </IconButton>
            </Tooltip>
          </React.Fragment> 
          : null}
        </ListItem>
        {channels.map((channel: string, i: number) => (
          <Slide direction="right" in={true} timeout={200 * (i + 1)} key={activeServer + channel}>
            <ListItem
              className="channel-item"
              id={`${channel.split('/', 2)[0]}`}
            >
              <Typography variant="body1">
                <AudiotrackRounded className="channel-hashtag"/>
              </Typography>
              <ListItemText
                primary={
                  <div className="message-user" onClick={e => handleChannelChange(channel)}>
                    {channel.split('/', 2)[1]}
                  </div>
                }
                className="channel-item"
              />
              {canModify() ? (
                <Tooltip title="Channel Settings" key="server-settings" placement="right" className="tooltip">
                  <IconButton onClick={e => handleChannelSelect(channel, () => handleSettingsClick(e, 'channel'))}>
                    {' '}
                    <Settings className="channel-settings" />{' '}
                  </IconButton>
                </Tooltip>
              ) : null}
            </ListItem>
          </Slide>
        ))}
        {chatStore.servers[activeServer] !== undefined ?
          <ListItem className="title-container">
            Voice Channels
          </ListItem> : null
        }
        {voiceChannels.map((voice: any, i: number) => (
          <Slide direction="right" in={true} timeout={200 * (i + 1)} key={activeServer + voice}>
            <ListItem
              className="channel-item"
              id={`${voice.split('/', 2)[0]}`}
              >
                <Typography variant="body1">
                  <AudiotrackRounded className="channel-hashtag"/>
                </Typography>
                <ListItemText
                  primary={
                    <div className="message-user" onClick={e => handleVoiceChange(voice)}>
                      {voice.split('/', 2)[1]}
                    </div>
                  }
                  className="channel-item"
                />
                {canModify() ? (
                  <Tooltip title="Voice Settings" key="server-settings" placement="right" className="tooltip">
                    <IconButton onClick={e => handleVoiceSelect(voice, () => handleSettingsClick(e, 'mod-voice'))}>
                      {' '}
                      <Settings className="channel-settings" />{' '}
                    </IconButton>
                  </Tooltip>
                ) : 
                  <Tooltip title="Voice Settings" key="server-settings" placement="right" className="tooltip">
                    <IconButton onClick={e => handleVoiceSelect(voice, () => handleSettingsClick(e, 'voice'))}>
                      {' '}
                      <Settings className="channel-settings" />{' '}
                    </IconButton>
                  </Tooltip>
                }
            </ListItem>
          </Slide>
        ))}
      </List>

      <div className="user-options">
        <ListItem className="user-info">
          <ListItemAvatar>
            <Avatar>
              <Person />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={user.username} />
          <Button onClick={handleSignOut}>Sign out</Button>
        </ListItem>
      </div>

      <Menu
        id="owner-server-settings-menu"
        anchorEl={ownerServerAnchorEl}
        open={Boolean(ownerServerAnchorEl)}
        onClick={handleClose}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleSaveClipboard(activeServer.split('/', 2)[0])}>
          {' '}
          Copy to Clipboard
        </MenuItem>
        <MenuItem onClick={() => handleModalShow('server-rename')}>{`Rename ${activeServer.split('/', 2)[1]}`}</MenuItem>
        <MenuItem onClick={() => handleModalShow('server-delete')}>{`Delete ${activeServer.split('/', 2)[1]}`}</MenuItem>
        <MenuItem onClick={() => handleModalShow('channel-create')}> Add Channel </MenuItem>
        <MenuItem onClick={() => handleModalShow('voice-create')}> Add Voice Channel </MenuItem>
      </Menu>

      <Menu
        id="admin-server-settings-menu"
        anchorEl={adminServerAnchorEl}
        open={Boolean(adminServerAnchorEl)}
        onClick={handleClose}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleSaveClipboard(activeServer.split('/', 2)[0])}>
          {' '}
          Copy to Clipboard
        </MenuItem>
        <MenuItem onClick={() => handleModalShow('channel-create')}> Add Channel </MenuItem>
        <MenuItem onClick={() => handleModalShow('voice-create')}> Add Voice Channel </MenuItem>
        <MenuItem onClick={() => handleModalShow('leave-server')}>{`Leave ${activeServer.split('/', 2)[1]}`}</MenuItem>
      </Menu>

      <Menu
        id="member-server-settings-menu"
        anchorEl={memberServerAnchorEl}
        open={Boolean(memberServerAnchorEl)}
        onClick={handleClose}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleSaveClipboard(activeServer.split('/', 2)[0])}>
          {' '}
          Copy to Clipboard
        </MenuItem>
        <MenuItem onClick={() => handleModalShow('leave-server')}>{`Leave ${activeServer.split('/', 2)[1]}`}</MenuItem>
      </Menu>

      <Menu
        id="channel-settings-menu"
        anchorEl={channelAnchorEl}
        open={Boolean(channelAnchorEl)}
        onClick={handleClose}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleModalShow('channel-rename')}> Rename Channel </MenuItem>
        <MenuItem onClick={() => handleChannelDelete(() => handleModalShow('channel-delete'))}>
          {' '}
          Delete Channel{' '}
        </MenuItem>
      </Menu>

      <Menu
        id="mod-voice-settings-menu"
        anchorEl={modVoiceAnchorEl}
        open={Boolean(modVoiceAnchorEl)}
        onClick={handleClose}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleModalShow('voice-leave')}>Leave Call</MenuItem>
        <MenuItem onClick={() => handleModalShow('voice-rename')}> Rename Voice Channel </MenuItem>
        <MenuItem onClick={() => handleVoiceDelete(() => handleModalShow('voice-delete'))}>
          {' '}
          Delete Voice Channel{' '}
        </MenuItem>
      </Menu>

      <Menu
        id="voice-settings-menu"
        anchorEl={voiceAnchorEl}
        open={Boolean(voiceAnchorEl)}
        onClick={handleClose}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleModalShow('voice-leave')}>Leave Call</MenuItem>
      </Menu>
    </div>
  )
};

export default ChannelList;