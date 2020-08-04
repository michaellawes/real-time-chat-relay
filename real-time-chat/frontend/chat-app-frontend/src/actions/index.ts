import axios from '../components/Api/api';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import {
  ACTION,
  UpdateActiveStateAction,
  ChangeServerAction,
  ChangeChannelAction,
  ChangeVoiceAction,
  ChangeViewAction,
  ChangePmUserAction,
  LoadUserDataAction,
  LoadInitialData,
  SignInAction,
  SignInData,
  SignOutAction,
  SendRtcSignalData,
  ReceiveRtcSignalData,
  ReceiveRtcSignalAction,
  SendRtcSignalAction,
  SendLeaveVoiceAction,
  ReceiveLeaveVoiceAction,
  SendLeaveVoiceData,
  ReceiveLeaveVoiceData,
  ClearVoiceConnectionAction,
  RenameChannelData,
  RenameChannelAction,
  RenameServerAction,
  RenameVoiceData,
  RenameVoiceAction,
  SendJoinVoiceData,
  SendJoinVoiceAction,
  ReceiveJoinVoiceData,
  ReceiveJoinVoiceAction,
  SetCurrentMSGAction,
  SetCurrentUserAction,
  RefreshDataAction,
  DeleteServerAction,
  DeleteMessageAction,
  DeletePrivateMessageAction,
  DeleteChannelAction,
  DeleteChannelData,
  DeleteVoiceData,
  DeleteVoiceAction,
  LeaveVoiceAction,
  SetSelectedVCAction,
  SetJustLeftVoiceAction,
  SetSelectedChannelAction
} from './types';
import {
  SendMessageData,
  DeleteMessageData,
  DeletePrivateMessageData,
  ReceiveMessageData,
  SendPrivateMessageData,
  ReceivePrivateMessageData,
  AddChannelData,
  AddServerData,
  AddVoiceData
} from './types';
import {
  SendMessageAction,
  ReceiveMessageAction,
  SendPrivateMessageAction,
  ReceivePrivateMessageAction,
  AddChannelAction,
  AddServerAction,
  AddVoiceAction
} from './types';


// Action to send a message (Handled by socket middleware)
export const sendMessage = (message: SendMessageData): SendMessageAction => ({
  type: ACTION.SEND_SOCKET_MESSAGE,
  payload: message
});

// Action to add message to a channel (Handled by socket middleware)
export const receiveMessage = (message: ReceiveMessageData): ReceiveMessageAction => ({
  type: ACTION.RECEIVE_SOCKET_MESSAGE,
  payload: message
});

// Action to delete server message
export const deleteServerMessage = (message: DeleteMessageData): DeleteMessageAction => ({
  type: ACTION.DELETE_MESSAGE,
  payload: message
});

// Action to send new private message (Handled by socket middleware)
export const sendPrivateMessage = (message: SendPrivateMessageData): SendPrivateMessageAction => ({
  type: ACTION.SEND_SOCKET_PRIVATE_MESSAGE,
  payload: message
});

// Action to send new private message (Handled by socket middleware)
export const receivePrivateMessage = (message: ReceivePrivateMessageData): ReceivePrivateMessageAction => ({
  type: ACTION.RECEIVE_SOCKET_PRIVATE_MESSAGE,
  payload: message
});

// Action to delete private message
export const deletePrivateMessage = (message: DeletePrivateMessageData): DeletePrivateMessageAction => ({
  type: ACTION.DELETE_PRIVATE_MESSAGE,
  payload: message
});

// Action to send a join voice channel message (Handles by socket middleware)
export const sendJoinVoice = (data: SendJoinVoiceData): SendJoinVoiceAction => ({
  type: ACTION.SEND_SOCKET_JOIN_VOICE,
  payload: data
});

// Action to receive join voice channel message (Handles by socket middlware)
export const receiveJoinVoice = (data: ReceiveJoinVoiceData): ReceiveJoinVoiceAction => ({
  type: ACTION.RECEIVE_SOCKET_JOIN_VOICE,
  payload: data
});

// Sends data needed to leave voice
export const sendLeaveVoice = (data: SendLeaveVoiceData): SendLeaveVoiceAction => ({
  type: ACTION.SEND_SOCKET_LEAVE_VOICE,
  payload: data
});

// Receives leave voice information and updates store
export const receiveLeaveVoice = (data: ReceiveLeaveVoiceData): ReceiveLeaveVoiceAction => ({
  type: ACTION.RECEIVE_SOCKET_LEAVE_VOICE,
  payload: data
});

// Sends RTC signal to store
export const sendRtcSignal = (data: SendRtcSignalData): SendRtcSignalAction => ({
  type: ACTION.SEND_SOCKET_RTC_SIGNAL,
  payload: data
});

// Receiving RTC signal
export const receiveRtcSignal = (data: ReceiveRtcSignalData): ReceiveRtcSignalAction => ({
  type: ACTION.RECEIVE_SOCKET_RTC_SIGNAL,
  payload: data
});

// Clears current voice connection
export const clearVoiceConnection = (): ClearVoiceConnectionAction => ({
  type: ACTION.CLEAR_VOICE_CONNECTION,
  payload: null
});

// Leaves current voice
export const leaveVoice = (): LeaveVoiceAction => ({
  type: ACTION.LEAVE_VOICE,
  payload: null
});

// Changes whether just left voice or not
export const adjustJustLeftVoice = (bool: boolean): SetJustLeftVoiceAction => ({
  type: ACTION.SET_JUST_LEFT_VOICE,
  payload: bool
});

// Action to add Server to list
export const addServer = (server: AddServerData): AddServerAction => ({
  type: ACTION.ADD_SERVER,
  payload: server
});

// Action to rename server
export const renameServer = (server: string): RenameServerAction => ({
  type: ACTION.RENAME_SERVER,
  payload: server
});

// Action to delete server
export const deleteServer = (server: string): DeleteServerAction => ({
  type: ACTION.DELETE_SERVER,
  payload: server
});

// Action to add Channel to a Server
export const addChannel = (channel: AddChannelData): AddChannelAction => ({
  type: ACTION.ADD_CHANNEL,
  payload: channel
});

// Action to rename channel
export const renameChannel = (channel: RenameChannelData): RenameChannelAction => ({
  type: ACTION.RENAME_CHANNEL,
  payload: channel
});

// Action to delete channel
export const deleteChannel = (channel: DeleteChannelData): DeleteChannelAction => ({
  type: ACTION.DELETE_CHANNEL,
  payload: channel
});

// Action to add VoiceChannel to Server
export const addVoice = (voice: AddVoiceData): AddVoiceAction => ({
  type: ACTION.ADD_VOICE,
  payload: voice
});

// Action to rename voice
export const renameVoice = (voice: RenameVoiceData): RenameVoiceAction => ({
  type: ACTION.RENAME_VOICE,
  payload: voice
});

// Action to delete voice
export const deleteVoice = (voice: DeleteVoiceData): DeleteVoiceAction => ({
  type: ACTION.DELETE_VOICE,
  payload: voice
});

// Update admin
export const updateAdmin = (serverId: string, username: string) => async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
  const response = await axios.get(`/server/admin?username=${username}&serverId=${serverId}`);
  dispatch({ type: ACTION.UPDATE_ADMIN, payload: response.data });
};

// Update owner
export const updateOwner = (serverId: string, username: string) => async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
  const response = await axios.get(`/server/owner?username=${username}&serverId=${serverId}`);
  dispatch({ type: ACTION.UPDATE_OWNER, payload: response.data });
};

// Update priveleges for the current server
export const updateAccess = (serverId: string, username: string) => async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
  dispatch(updateOwner(serverId, username));
  dispatch(updateAdmin(serverId, username));
}

// Get active user list in given server
export const updateActiveUserList = (serverId: string) => async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
  const response = await axios.get(`/server/activeusers?serverId=${serverId}`);
  dispatch({ type: ACTION.UPDATE_ACTIVE_USERS, payload: response.data });
};

// Get unactive user list in given server
export const updateUnactiveUserList = (serverId: string) => async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
  const response = await axios.get(`/server/unactiveusers?serverId=${serverId}`);
  dispatch({ type: ACTION.UPDATE_UNACTIVE_USERS, payload: response.data });
}

// Update users list entirely
export const updateUserList = (serverId: string) => (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
  dispatch(updateActiveUserList(serverId));
  dispatch(updateUnactiveUserList(serverId));
}

// Action creator to update active state (socket middleware)
export const updateActiveState = (): UpdateActiveStateAction => ({
  type: ACTION.UPDATE_ACTIVE_STATE,
  payload: null
});

// Action to change the current active view
export const changeView = (view: string): ChangeViewAction => ({
  type: ACTION.CHANGE_VIEW,
  payload: view
});

// Action to change the current Active Server
export const changeServer = (server: string, username: string) => (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
  dispatch(updateUserList(server.split('/', 2)[0]));
  dispatch<ChangeServerAction>({ type: ACTION.CHANGE_SERVER, payload: server });
  dispatch(updateAccess(server.split('/', 2)[0], username));
};

// Action to change the current Active Channel
export const changeChannel = (channel: string): ChangeChannelAction => ({
  type: ACTION.CHANGE_CHANNEL,
  payload: channel
});

//Action to change the current Active Voice
export const changeVoice = (voice: string): ChangeVoiceAction => ({
  type: ACTION.CHANGE_VOICE,
  payload: voice
});

// Action to change active user we have private message open with
export const changePMUser = (user: string): ChangePmUserAction => ({
  type: ACTION.CHANGE_PM_USER,
  payload: user
});

// Gets username for currently selected user
export const setCurrentUser = (username: string): SetCurrentUserAction => ({
  type: ACTION.SET_CURRENT_USER,
  payload: username
});

// Gets channel for currently selected channel
export const setSelectedChannel = (channel: string): SetSelectedChannelAction => ({
  type: ACTION.SET_SELECTED_CHANNEL,
  payload: channel
});

// Gets voice for currently selected voice channel
export const setSelectedVC = (voice: string): SetSelectedVCAction => ({
  type: ACTION.SET_SELECTED_VOICE,
  payload: voice
});

// Gets msgId for currently selected message
export const setCurrentMSG = (msgId: string): SetCurrentMSGAction => ({
  type: ACTION.SET_CURRENT_MESSAGE,
  payload: msgId
});

// Loads user Data. Gets all Servers + Channel History
export const loadUserData = (username: string) => async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
  if (username !== '') {
    let url = `/user/data?username=${username}`;
    const res = await axios.get<LoadInitialData>(url);
    if(res.data.servers !== null && res.data.servers !== undefined) {
      dispatch(updateAccess(Object.keys(res.data.servers)[0].split('/', 2)[0], username));
      dispatch(updateUserList(Object.keys(res.data.servers)[0].split('/', 2)[0]));
      dispatch<LoadUserDataAction>({ type: ACTION.GET_INITIAL_DATA, payload: res.data });
    }
  }
};

// Refreshes data 
export const refreshData = (
  username: string,
  activeServer: string
  ) => async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    if (username !== '' && activeServer !== '') {
      let url = `/user/data?username=${username}`;
      const res: any = await axios.get<LoadInitialData>(url);
      if(res.data.servers !== undefined) {
        dispatch(updateAccess(activeServer.split('/', 2)[0], username));
        dispatch(updateUserList(activeServer.split('/', 2)[0]));
        dispatch<RefreshDataAction>({ type: ACTION.REFRESH_DATA, payload: res.data });
      }
    }
};

// On sign in
export const signIn = (user: SignInData): SignInAction => ({
  type: ACTION.SIGN_IN,
  payload: user
});

// On sign out
export const signOut = (): SignOutAction => ({
  type: ACTION.SIGN_OUT,
  payload: null
});
