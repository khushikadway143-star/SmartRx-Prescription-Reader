/** Platform check and lazy loaders so web builds never import native-only modules. */
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
let nativeTts: any;
let nativeVoice: any;
export const getTts = () => (nativeTts ??= require('react-native-tts').default);
export const getVoice = () => (nativeVoice ??= require('@react-native-voice/voice').default);
