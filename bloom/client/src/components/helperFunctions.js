// function for displaying time in a human friendly way
function convertMinsToHrsMins(mins) {
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  let am = false
  if (h === 24) {
    am = true
    h -= 12
  }
  else if (h == 0) {
    am = true
    h += 12
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

export { convertMinsToHrsMins }
