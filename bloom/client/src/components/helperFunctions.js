import store from '../redux/store';
import Cookies from 'js-cookie';
import { userLogout } from '../redux/actions/user'
// function for displaying time in a human friendly way
export function convertMinsToHrsMins(mins) {
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  let am = false
  if (h === 24) {
    am = true
    h -= 12
  }
  else if (h < 12) {
    am = true
  } else if (h !== 12) {
    h -= 12
  }
  h = h < 10 ? '0' + h : h;
  if (h === 0) {
    h = '12'
  }
  m = m < 10 ? '0' + m : m;
  if (am) {
    return `${h}:${m}am`;
  } else {
    return `${h}:${m}pm`;
  }
}

export function pluralize (val, word, plural = word + 's') {
  const _pluralize = (num, word, plural = word + 's') =>
    [1, -1].includes(Number(num)) ? word : plural;
  if (typeof val === 'object') return (num, word) => _pluralize(num, word, val[word]);
  return _pluralize(val, word, plural);
};

export function handleLogout(tokenFlag = true, redirectFlag = true) {
  if(tokenFlag){
    Cookies.remove("token");
    Cookies.remove("user");
  }
  
  store.dispatch(userLogout())

  if(redirectFlag){
    window.location.href='/'
  }
};