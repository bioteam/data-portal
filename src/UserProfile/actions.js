import { fetchWrapper, fetchOAuthURL, updatePopup } from '../actions';
import { submissionapi_oauth_path, credential_cdis_path } from '../localconf';
import moment from 'moment';
import {fetchProjects} from "../queryactions";

export const loginUserProfile = () => {
  // Fetch projects, if unauthorized, login
  return (dispatch, getState) => {
    return dispatch(fetchAccess()).then(()=>{
      let keypair = getState().user_profile.access_key_pair;
      if (keypair){
        // user already logged in
        return Promise.reject("already logged in");
      }
      else {
        return Promise.resolve()
      }
    }).then(()=>dispatch(fetchOAuthURL(submissionapi_oauth_path))).then(()=>{
      let url = getState().user.oauth_url;
      return dispatch(fetchWrapper({
        path:url,
        handler:receiveUserAPILogin
      }))}).then(()=>dispatch(fetchAccess())).then(()=>dispatch(fetchProjects()))
      .catch((error) => console.log(error));
  }
};

export const receiveUserAPILogin = ({status, data}) => {
  switch (status) {
    case 200:
      return {
        type: 'RECEIVE_USERAPI_LOGIN',
        result: true
      };
    default: {
      return {
        type: "RECEIVE_USERAPI_LOGIN",
        result: false,
        error: data
      }
    }
  }
};

export const fetchAccess = () => {
  return fetchWrapper({
    path: credential_cdis_path,
    handler: receiveCloudAccess
  })
};

const convertTime = (value) => {
  value['create_date'] = moment(value['create_date']).format('YYYY-MM-DD HH:mm:ss');
  return value
};

export const receiveCloudAccess = ({status, data}) => {
  switch (status) {
    case 200:
      return {
        type: 'RECEIVE_USER_PROFILE',
        access_keys: data.access_keys,
      };
    default:
      return {
        type: 'USER_PROFILE_ERROR',
        error: data['error']
      }
  }
};

export const requestDeleteKey = (access_key) => {
  return {
    type: 'REQUEST_DELETE_KEY',
    access_key: access_key
  }
};

export const deleteKey = (access_key, keypairs_api) => {
  let receiveDeleteKey = ({status, data}) => {
    return receiveDeleteKeyResponse({status, data, access_key})
  };
  return fetchWrapper({
    path: keypairs_api + access_key,
    method: 'DELETE',
    handler: receiveDeleteKey
  })
};

export const receiveDeleteKeyResponse = ({status, data, access_key}) => {
  return (dispatch) => {
    switch (status) {
      case 201:
        dispatch({
          type: 'DELETE_KEY_SUCCEED',
        });
        dispatch(clearDeleteSession());
        dispatch(updatePopup({key_delete_popup: false}));
        return dispatch(fetchAccess());
      default:
        return dispatch({
          type: 'DELETE_KEY_FAIL',
          access_key: access_key,
          error: data
        });
    }
  }
};

export const clearDeleteSession = () => {
  return {
    type: 'CLEAR_DELETE_KEY_SESSION'
  }
};

export const createKey = (keypairs_api) => {
  let receiveCreatedKey = ({status, data}) => {
    return receiveCreatedKeyResponse({status, data})
  };
  return fetchWrapper({
    path: keypairs_api,
    method: 'POST',
    handler: receiveCreatedKey
  })
};

export const parseKeyToString = (content) => {
  return 'access_key\tsecrect_key\n' + content['access_key'] + '\t' + content['secret_key'];
};

export const receiveCreatedKeyResponse = ({status, data}) => {
  return (dispatch) => {
    switch (status) {
      case 200:
        dispatch({
          type: 'CREATE_SUCCEED',
          access_key_pair: data,
          str_access_key_pair: parseKeyToString(data)
        });
        dispatch(updatePopup({save_key_popup: true}));
        return dispatch(fetchAccess());
      default:
        dispatch({
          type: 'CREATE_FAIL',
          error: data['error']
        });
        return dispatch(updatePopup({save_key_popup: true}));
    }
  }
};

export const clearCreationSession = () => {
  return {
    type: 'CLEAR_CREATION_SESSION'
  }
};