import { ACTION, UserActionTypes } from '../actions/types';

export interface UserStore {
  isSignedIn: boolean;
  username: string;
  isAdmin: boolean;
  isOwner: boolean;
};

const initialState = {
  isSignedIn: false,
  username: '',
  isAdmin: false,
  isOwner: false
};

export const userReducer = (state: UserStore = initialState, action: UserActionTypes): UserStore => {
  switch (action.type) {
    case ACTION.SIGN_IN:
      return { ...state, isSignedIn: true, username: action.payload.username };
    case ACTION.SIGN_OUT:
      return { ...state, isSignedIn: false, username: '' };
    case ACTION.UPDATE_ADMIN:
      return { ...state, isAdmin: action.payload };
    case ACTION.UPDATE_OWNER:
      return { ...state, isOwner: action.payload };
    default:
      return state;
  };
};
