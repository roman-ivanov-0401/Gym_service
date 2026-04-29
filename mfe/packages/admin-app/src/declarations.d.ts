declare module 'host/stores' {
  export { useStore, rootStore, RootStore } from '../../host/src/stores/RootStore';
}
declare module 'host/AuthContext' {
  export { AuthProvider } from '../../host/src/context/AuthContext';
}
declare module 'host/RemoteSessionOutlet' {
  export { RemoteSessionOutlet } from '../../host/src/components/RemoteSessionOutlet';
}
declare module 'host/api/gym' {
  export * from '../../host/src/api/gym';
}
