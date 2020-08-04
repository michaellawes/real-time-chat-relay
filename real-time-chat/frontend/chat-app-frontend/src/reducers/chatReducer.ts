import { ACTION, ChatActionTypes } from '../actions/types';

const deleteServerMessageWithId = (items: Array<MessageInterface>, msgId: string): Array<MessageInterface> => {
  if (items.length > 1) {
    const objIndex = items.findIndex((obj: MessageInterface) => obj.msgId === msgId);
    if(objIndex > -1) {
      items.splice(objIndex, 1);
    };
    return items;
  } else {
    return [];
  };
};

const deletePrivateMessageWithId = (items: Array<PrivateMessageInterface>, msgId: string): Array<PrivateMessageInterface> => {
  if (items.length > 1) {
    const objIndex = items.findIndex((obj: PrivateMessageInterface) => obj.msgId === msgId);
    if(objIndex > -1) {
      items.splice(objIndex, 1);
    };
    return items;
  } else {
    return [];
  };
};

interface MessageInterface {
  from: string;
  msg: string;
  msgId: string;
  timestamp: Date;
};

interface PrivateMessageInterface {
  from: string;
  userTo: string;
  msg: string;
  msgId: string;
  timestamp: Date;
};

export interface ChatStore {
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
    [userPM: string]: { from: string; userTo: string; msg: string; msgId: string; timestamp: Date; }[];
  };
  activeServer: string;
  activeChannel: string;
  activeVoice: string;
  currentMSG: string;
  selectedUser: string;
  selectedChannel: string;
  selectedVoiceChannel: string;
  justLeftVoice: boolean;
  activeUserList: { username: string }[];
  unactiveUserList: { username: string }[]
  activeView: string;
  activePMUser: string;
  voiceClients: { username: string; }[];
  voiceJoinUsername: string;
  voiceLeaveUsername: string;
  rtcSignalData: { username: string; ice?: any; sdp?: any };
};

const initialState = {
  servers: {},
  pms: {},
  activeServer: '',
  activeChannel: '',
  activeVoice: '',
  currentMSG: '',
  selectedUser: '',
  selectedChannel: '',
  selectedVoiceChannel: '',
  justLeftVoice: false,
  activeUserList: [],
  unactiveUserList: [],
  activeView: 'servers',
  activePMUser: '',
  voiceClients: [],
  voiceJoinUsername: '',
  voiceLeaveUsername: '',
  rtcSignalData: { username: '' }
};

export const chatReducer = (state: ChatStore = initialState, action: ChatActionTypes) => {
  switch (action.type) {
    case ACTION.RECEIVE_SOCKET_MESSAGE:
      return {
        ...state,
        servers: {
          ...state.servers,
          [action.payload.server]: {
            ...state.servers[action.payload.server],
            channels: {
              ...state.servers[action.payload.server].channels,
              [action.payload.channel]: [...state.servers[action.payload.server].channels[action.payload.channel], { from: action.payload.from, msgId: action.payload.msgId, msg: action.payload.msg, timestamp: action.payload.timestamp }]
            }
          }
        }
      };
    case ACTION.RECEIVE_SOCKET_PRIVATE_MESSAGE:
      if(state.pms !== undefined) {
        if(state.pms[action.payload.user]) {
          return {
            ...state,
            pms: {
              ...state.pms,
              [action.payload.user]: [...state.pms[action.payload.user], { from: action.payload.from, userTo: action.payload.userTo, msg: action.payload.msg, msgId: action.payload.msgId, timestamp: action.payload.timestamp }]
            }
          }
        } else {
          return {
            ...state,
            pms: {
              ...state.pms,
              [action.payload.user]: [{ from: action.payload.from, userTo: action.payload.userTo, msg: action.payload.msg, msgId: action.payload.msgId, timestamp: action.payload.timestamp }]
            }
          }
        };
      } else {
        return {
          ...state,
          pms: {
            [action.payload.user]: [{ from: action.payload.from, userTo: action.payload.userTo, msg: action.payload.msg, msgId: action.payload.msgId, timestamp: action.payload.timestamp }]
          }
        }
      };
    case ACTION.RECEIVE_SOCKET_JOIN_VOICE:
      return {
        ...state,
        voiceClients: action.payload.clients,
        voiceJoinUsername: action.payload.username,
        voiceLeaveUsername: ''
      };
    case ACTION.RECEIVE_SOCKET_RTC_SIGNAL:
      return { ...state, rtcSignalData: action.payload };
    case ACTION.RECEIVE_SOCKET_LEAVE_VOICE:
      return { ...state, voiceLeaveUsername: action.payload.username, voiceClients: action.payload.clients };
    case ACTION.CLEAR_VOICE_CONNECTION:
      return { ...state, voiceClients: [], voiceLeaveUsername: '', voiceJoinUsername: '' };
    case ACTION.ADD_CHANNEL:
      return {
        ...state,
        servers: {
          ...state.servers,
          [action.payload.server]: {
            ...state.servers[action.payload.server],
            channels: {
              ...state.servers[action.payload.server].channels,
              [action.payload.channel]: []
            },
          }
        }
      };
    case ACTION.ADD_SERVER:
      return {
        ...state,
        servers: {
          ...state.servers,
          [action.payload.server]: {
            channels: {
              [action.payload.channel]:  []
            },
            voiceChannels: {
              [action.payload.voice]: {}
            }
          }
        }
      };
    case ACTION.ADD_VOICE:
      return {
        ...state,
        servers: {
          ...state.servers,
          [action.payload.server]: {
            ...state.servers[action.payload.server],
            voiceChannels: {
              ...state.servers[action.payload.server].voiceChannels,
              [action.payload.voice]: {}
            }
          }
        }
      };
    case ACTION.GET_INITIAL_DATA:
      return {
        ...state,
        servers: action.payload.servers,
        pms: action.payload.pms,
        activeServer: Object.keys(action.payload.servers)[0],
        activeChannel: Object.keys(action.payload.servers[Object.keys(action.payload.servers)[0]].channels)[0]
      };
    case ACTION.REFRESH_DATA:
      return {
        ...state,
        servers: action.payload.servers,
        pms: action.payload.pms,
      };
    case ACTION.CHANGE_SERVER:
      return {
        ...state,
        activeServer: action.payload,
        activeChannel: Object.keys(state.servers[action.payload].channels)[0],
      };
    case ACTION.CHANGE_CHANNEL:
      return { ...state, activeChannel: action.payload };
    case ACTION.CHANGE_VOICE:
      return { ...state, activeVoice: action.payload };
    case ACTION.CHANGE_VIEW:
      if(action.payload === 'servers') {
        return { ...state, activeView: action.payload };
      } else {
        if(state.pms === undefined) {
          return { ...state, activeView: action.payload, activePMUser: state.activePMUser };
        } else {
          if(Object.keys(state.pms)[0] !== undefined) {
            return { ...state, activeView: action.payload, activePMUser: Object.keys(state.pms)[0] };
          } else {
            return { ...state, activeView: action.payload, activePMUser: state.activePMUser };
          }
        };
      };
    case ACTION.RENAME_SERVER:
      let prev = state.servers[state.activeServer];
      delete state.servers[state.activeServer];
      return { 
        ...state,
        servers: {
          [action.payload]: prev
        },
        activeServer: action.payload
       };
    case ACTION.RENAME_CHANNEL:
      let prev1 = state.servers[action.payload.server].channels[action.payload.channel];
      delete state.servers[action.payload.server].channels[action.payload.channel];
      return { 
        ...state,
        servers: {
          ...state.servers,
          [action.payload.server]: {
            ...state.servers[action.payload.server],
            channels: {
              ...state.servers[action.payload.server].channels,
              [action.payload.channel]: prev1
            }
          }
        },
        activeChannel: action.payload.channel 
      };
    case ACTION.RENAME_VOICE:
      let prev2 = state.servers[action.payload.server].voiceChannels[action.payload.voice];
      delete state.servers[action.payload.server].voiceChannels[action.payload.voice];
      return { 
        ...state,
        servers: {
          ...state.servers,
          [action.payload.server]: {
            ...state.servers[action.payload.server],
            voiceChannels: {
              ...state.servers[action.payload.server].voiceChannels,
              [action.payload.voice]: prev2
            }
          }
        }
      };
    case ACTION.LEAVE_VOICE:
      return { ...state, activeVoice: '' };
    case ACTION.DELETE_SERVER:
      if(Object.keys(state.servers).length === 1) {
        return { 
          ...state,
          servers: {},
          activeServer: '',
          activeChannel: '',
          activeVoice: '',
        }
      } else {
        delete state.servers[action.payload];
        return { 
          ...state,
          activeServer: Object.keys(state.servers)[0],
          activeChannel: Object.keys(state.servers[Object.keys(state.servers)[0]].channels)[0], 
          activeVoice: '' 
        };
      }
    case ACTION.DELETE_CHANNEL:
      delete state.servers[action.payload.server].channels[action.payload.channel];
      return { ...state };
    case ACTION.DELETE_VOICE:
      delete state.servers[action.payload.server].voiceChannels[action.payload.voice];
      return { ...state };
    case ACTION.DELETE_MESSAGE:
      const adjustedServerArray = deleteServerMessageWithId(state.servers[action.payload.server].channels[action.payload.channel], action.payload.msgId);
      return {
        ...state,
        servers: {
          ...state.servers,
          [action.payload.server]: {
            ...state.servers[action.payload.server],
            channels: {
              ...state.servers[action.payload.server].channels,
              [action.payload.channel]: adjustedServerArray
            }
          }
        }
      };
    case ACTION.DELETE_PRIVATE_MESSAGE:
      const adjustedDMArray = deletePrivateMessageWithId(state.pms[action.payload.userMessaged], action.payload.msgId);
      return { 
        ...state,
        pms: {
          ...state.pms,
          [action.payload.userMessaged]: adjustedDMArray
        } 
      };
    case ACTION.CHANGE_PM_USER:
      return { ...state, activePMUser: action.payload };
    case ACTION.UPDATE_ACTIVE_USERS:
      return { ...state, activeUserList: action.payload };
    case ACTION.UPDATE_UNACTIVE_USERS:
      return { ...state, unactiveUserList: action.payload };
    case ACTION.SET_CURRENT_MESSAGE:
      return { ...state, currentMSG: action.payload };
    case ACTION.SET_CURRENT_USER:
      return { ...state, selectedUser: action.payload };
    case ACTION.SET_SELECTED_CHANNEL:
      return { ...state, selectedChannel: action.payload };
    case ACTION.SET_SELECTED_VOICE:
      return { ...state, selectedVoiceChannel: action.payload };
    case ACTION.SET_JUST_LEFT_VOICE:
      return { ...state, justLeftVoice: action.payload };
    default:
      return { ...state };
  }
}