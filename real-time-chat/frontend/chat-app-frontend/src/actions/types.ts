export enum ACTION {
  RECEIVE_SOCKET_MESSAGE,
  RECEIVE_SOCKET_PRIVATE_MESSAGE,
  RECEIVE_SOCKET_JOIN_VOICE,
  RECEIVE_SOCKET_RTC_SIGNAL,
  RECEIVE_SOCKET_LEAVE_VOICE,
  SEND_SOCKET_MESSAGE,
  SEND_SOCKET_PRIVATE_MESSAGE,
  SEND_SOCKET_JOIN_VOICE,
  SEND_SOCKET_RTC_SIGNAL,
  SEND_SOCKET_LEAVE_VOICE,
  ADD_SERVER,
  ADD_CHANNEL,
  ADD_VOICE,
  ADD_PRIVATE_MESSAGE,
  RENAME_SERVER,
  RENAME_CHANNEL,
  RENAME_VOICE,
  DELETE_SERVER,
  DELETE_CHANNEL,
  DELETE_VOICE,
  DELETE_MESSAGE,
  DELETE_PRIVATE_MESSAGE,
  CHANGE_VOICE,
  CHANGE_CHANNEL,
  CHANGE_SERVER,
  CHANGE_VIEW,
  CHANGE_PM_USER,
  CLEAR_VOICE_CONNECTION,
  UPDATE_ACTIVE_USERS,
  UPDATE_UNACTIVE_USERS,
  UPDATE_ACTIVE_STATE,
  SIGN_IN,
  SIGN_OUT,
  GET_INITIAL_DATA,
  SET_CURRENT_MESSAGE,
  SET_CURRENT_USER,
  REFRESH_DATA,
  UPDATE_ADMIN,
  UPDATE_OWNER,
  LEAVE_VOICE,
  SET_SELECTED_VOICE,
  SET_SELECTED_CHANNEL,
  SET_JUST_LEFT_VOICE
}

export type ChatActionTypes =
  | ReceiveMessageAction
  | ReceivePrivateMessageAction
  | ReceiveJoinVoiceAction
  | ReceiveRtcSignalAction
  | ReceiveLeaveVoiceAction
  | ClearVoiceConnectionAction
  | AddChannelAction
  | AddServerAction
  | AddVoiceAction
  | RenameServerAction
  | RenameChannelAction
  | RenameVoiceAction
  | DeleteServerAction
  | DeleteChannelAction
  | DeleteVoiceAction
  | DeleteMessageAction
  | DeletePrivateMessageAction
  | ChangeServerAction
  | ChangeChannelAction
  | ChangeVoiceAction
  | ChangeViewAction
  | ChangePmUserAction
  | LoadUserDataAction
  | RefreshDataAction
  | UpdateActiveUsersAction
  | UpdateUnactiveUsersAction
  | SetCurrentMSGAction
  | SetCurrentUserAction
  | SetSelectedVCAction
  | SetSelectedChannelAction
  | LeaveVoiceAction
  | SetJustLeftVoiceAction

export type SocketActions =
  | SendMessageAction
  | SendPrivateMessageAction
  | SignInAction
  | LoadUserDataAction
  | AddServerAction
  | UpdateActiveStateAction
  | SendJoinVoiceAction
  | SendRtcSignalAction
  | SendLeaveVoiceAction

export type UserActionTypes = 
  | SignInAction
  | UpdateAdmin
  | UpdateOwner 
  | SignOutAction;

/* Actions Types */
export type SendMessageAction = {
  type: ACTION.SEND_SOCKET_MESSAGE;
  payload: SendMessageData;
};

export type ReceiveMessageAction = {
  type: ACTION.RECEIVE_SOCKET_MESSAGE;
  payload: ReceiveMessageData;
};

export type DeleteMessageAction = {
  type: ACTION.DELETE_MESSAGE;
  payload: DeleteMessageData;
};

export type SendPrivateMessageAction = {
  type: ACTION.SEND_SOCKET_PRIVATE_MESSAGE;
  payload: SendPrivateMessageData;
};

export type ReceivePrivateMessageAction = {
  type: ACTION.RECEIVE_SOCKET_PRIVATE_MESSAGE;
  payload: ReceivePrivateMessageData;
};

export type DeletePrivateMessageAction = {
  type: ACTION.DELETE_PRIVATE_MESSAGE;
  payload: DeletePrivateMessageData;
};

export type SendJoinVoiceAction = {
  type: ACTION.SEND_SOCKET_JOIN_VOICE;
  payload: SendJoinVoiceData;
};

export type ReceiveJoinVoiceAction = {
  type: ACTION.RECEIVE_SOCKET_JOIN_VOICE;
  payload: ReceiveJoinVoiceData;
};

export type SendLeaveVoiceAction = {
  type: ACTION.SEND_SOCKET_LEAVE_VOICE;
  payload: SendLeaveVoiceData;
};

export type ReceiveLeaveVoiceAction = {
  type: ACTION.RECEIVE_SOCKET_LEAVE_VOICE;
  payload: ReceiveLeaveVoiceData;
};

export type SendRtcSignalAction = {
  type: ACTION.SEND_SOCKET_RTC_SIGNAL;
  payload: SendRtcSignalData;
};

export type ReceiveRtcSignalAction = {
  type: ACTION.RECEIVE_SOCKET_RTC_SIGNAL;
  payload: ReceiveRtcSignalData;
};
 
export type ClearVoiceConnectionAction = {
   type: ACTION.CLEAR_VOICE_CONNECTION;
   payload: null;
};

export type LeaveVoiceAction = {
  type: ACTION.LEAVE_VOICE;
  payload: null;
};

export type SetJustLeftVoiceAction = {
  type: ACTION.SET_JUST_LEFT_VOICE;
  payload: boolean
};

export type AddServerAction = {
  type: ACTION.ADD_SERVER;
  payload: AddServerData;
};

export type RenameServerAction = {
  type: ACTION.RENAME_SERVER;
  payload: string;
};

export type DeleteServerAction = {
  type: ACTION.DELETE_SERVER;
  payload: string;
};

export type AddChannelAction = {
  type: ACTION.ADD_CHANNEL;
  payload: AddChannelData;
};

export type RenameChannelAction = {
  type: ACTION.RENAME_CHANNEL;
  payload: RenameChannelData;
};

export type DeleteChannelAction = {
  type: ACTION.DELETE_CHANNEL;
  payload: DeleteChannelData;
};

export type AddVoiceAction = {
  type: ACTION.ADD_VOICE;
  payload: AddVoiceData;
};

export type RenameVoiceAction = {
  type: ACTION.RENAME_VOICE;
  payload: RenameVoiceData;
};

export type DeleteVoiceAction = {
  type: ACTION.DELETE_VOICE;
  payload: DeleteVoiceData;
};

export type UpdateAdmin = {
  type: ACTION.UPDATE_ADMIN;
  payload: boolean;
};

export type UpdateOwner = {
  type: ACTION.UPDATE_OWNER;
  payload: boolean
};

export type UpdateActiveUsersAction = {
  type: ACTION.UPDATE_ACTIVE_USERS;
  payload: { username: string; }[];
};

export type UpdateUnactiveUsersAction = {
  type: ACTION.UPDATE_UNACTIVE_USERS;
  payload: { username: string; }[];
}

export type UpdateActiveStateAction = {
  type: ACTION.UPDATE_ACTIVE_STATE;
  payload: null;
};

export type ChangeViewAction = {
  type: ACTION.CHANGE_VIEW;
  payload: string;
};

export type ChangeServerAction = {
  type: ACTION.CHANGE_SERVER;
  payload: string;
};

export type ChangeChannelAction = {
  type: ACTION.CHANGE_CHANNEL;
  payload: string;
};

export type ChangeVoiceAction = {
  type: ACTION.CHANGE_VOICE;
  payload: string;
};

export type ChangePmUserAction = {
  type: ACTION.CHANGE_PM_USER;
  payload: string;
};

export type SetCurrentUserAction = {
  type: ACTION.SET_CURRENT_USER;
  payload: string;
};

export type SetSelectedChannelAction = {
  type: ACTION.SET_SELECTED_CHANNEL;
  payload: string;
};

export type SetSelectedVCAction = {
  type: ACTION.SET_SELECTED_VOICE;
  payload: string;
};

export type SetCurrentMSGAction = {
  type: ACTION.SET_CURRENT_MESSAGE;
  payload: string;
};

export type LoadUserDataAction = {
  type: ACTION.GET_INITIAL_DATA;
  payload: LoadInitialData;
};

export type RefreshDataAction = {
  type: ACTION.REFRESH_DATA;
  payload: RefreshData;
};

export type SignInAction = {
  type: ACTION.SIGN_IN;
  payload: SignInData;
};

export type SignOutAction = {
  type: ACTION.SIGN_OUT;
  payload: null;
};

/* Interfaces for Data coming into Action Creators */

export interface SendMessageData {
  type: 'channelMessage';
  server: string;
  channel: string;
  from: string;
  msg: string;
  timestamp: Date;
};

export interface SendPrivateMessageData {
  type: 'privateMessage'
  from: string;
  userTo: string;
  user: string;
  msg: string;
  timestamp: Date;
};

export interface ReceiveMessageData {
  server: string;
  channel: string;
  from: string;
  msgId: string;
  msg: string;
  timestamp: Date;
};

export interface ReceivePrivateMessageData {
  from: string;
  userTo: string;
  user: string;
  msgId: string;
  msg: string;
  timestamp: Date;
};

export interface SendJoinVoiceData {
  username: string;
  voice: string;
};

export interface ReceiveJoinVoiceData {
  username: string;
  voice: string;
  clients: { username: string }[];
};

export interface SendLeaveVoiceData {
  username: string;
  voice: string;
};

export interface ReceiveLeaveVoiceData {
  username: string;
  clients: { username: string; }[];
};

export interface SendRtcSignalData {
  username: string;
  ice?: any;
  sdp?: any;
};

export interface ReceiveRtcSignalData {
  username: string;
};

export interface AddServerData {
  server: string;
  channel: string;
  voice: string;
};

export interface AddChannelData {
  server: string;
  channel: string;
};

export interface RenameChannelData {
  server: string;
  channel: string;
};

export interface DeleteChannelData {
  server: string;
  channel: string;
};

export interface AddVoiceData {
  server: string;
  voice: string;
};

export interface RenameVoiceData {
  server: string;
  voice: string;
};

export interface DeleteVoiceData {
  server: string;
  voice: string;
};

export interface DeleteMessageData {
  server: string;
  channel: string;
  msgId: string;
};

export interface DeletePrivateMessageData {
  userMessaged: string;
  msgId: string;
};

export interface LoadInitialData {
  servers: {
    [serverConjoined: string]: {
      channels: {
        [channelConjoined: string]: { from: string; msgId: string; msg: string; timestamp: Date }[]; 
      };
      voiceChannels: {
        [voiceConjoined: string]: {};
      };
    };
  };
  pms: {
    [userPM: string]: { from: string; userTo: string; msg: string; msgId: string; timestamp: Date; }[]
  };
};

export interface RefreshData {
  servers: {
    [serverConjoined: string]: {
      channels: {
        [channelConjoined: string]: { from: string; msgId: string; msg: string; timestamp: Date }[];
      };
      voiceChannels: {
        [voiceConjoined: string]: {};
      };
    };
  };
  pms: {
    [userPM: string]: { from: string; userTo: string; msg: string; msgId: string; timestamp: Date; }[]
  };
  activeServer: string;
  activeChannel: string;
};

export interface SignInData {
  username: string;
};
