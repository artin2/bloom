export const ADD_STORE = 'ADD_STORE'

export function addStore(store) {
  return {
    type: ADD_STORE,
    store: store,
  }
}
