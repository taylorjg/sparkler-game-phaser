import "audioworklet-polyfill";
import log from "loglevel";

export type MicrophoneModuleConfig = {
  NOISE_LEVEL_THRESHOLD: number;
  onNoiseLevelAboveThreshold: (maxValue: number) => void;
};

export interface MicrophoneModule {
  microphoneOn: () => Promise<void>;
  microphoneOff: () => void;
}

const max = (xs: ArrayLike<number>): number => {
  let result = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    const value = xs[i];
    if (value > result) {
      result = value;
    }
  }
  return result;
};

const configureMicrophoneModule = (
  config: MicrophoneModuleConfig
): MicrophoneModule => {
  const audioState: {
    pending: boolean;
    audioContext: AudioContext | undefined;
    mediaStream: MediaStream | undefined;
    microphoneOn: boolean;
  } = {
    pending: false,
    audioContext: undefined,
    mediaStream: undefined,
    microphoneOn: false,
  };

  class StreamWorklet extends AudioWorkletNode {
    constructor(audioContext: AudioContext, name: string) {
      log.info(
        `[StreamWorklet#constructor] name: ${name}; sampleRate: ${audioContext.sampleRate}`
      );
      super(audioContext, name);
      this.port.onmessage = (message: MessageEvent<Float32Array>) => {
        log.info("[StreamWorklet#onMessage]");
        if (!audioState.microphoneOn) return;
        const maxValue = max(message.data);
        if (maxValue >= config.NOISE_LEVEL_THRESHOLD) {
          config.onNoiseLevelAboveThreshold(maxValue);
        }
      };
    }
  }

  const microphoneOn = async (): Promise<void> => {
    try {
      log.info("[microphoneOn]");
      audioState.pending = true;
      if (navigator?.mediaDevices?.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(mediaStream);
        await audioContext.audioWorklet.addModule(
          `${import.meta.env.BASE_URL}stream-processor.js`
        );
        const streamWorklet = new StreamWorklet(
          audioContext,
          "stream-processor"
        );
        source.connect(streamWorklet);
        streamWorklet.connect(audioContext.destination);
        audioState.audioContext = audioContext;
        audioState.mediaStream = mediaStream;
        audioState.microphoneOn = true;
      } else {
        throw new Error("navigator.mediaDevices.getUserMedia not found");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`[microphoneOn] ${message}`);
      throw error;
    } finally {
      audioState.pending = false;
    }
  };

  const microphoneOff = (): void => {
    try {
      log.info("[microphoneOff]");
      if (
        audioState.microphoneOn &&
        audioState.mediaStream &&
        audioState.audioContext
      ) {
        audioState.mediaStream.getTracks().forEach((track) => track.stop());
        audioState.audioContext.close();
        audioState.audioContext = undefined;
        audioState.mediaStream = undefined;
        audioState.microphoneOn = false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`[microphoneOff] ${message}`);
    }
  };

  return {
    microphoneOn,
    microphoneOff,
  };
};

export default configureMicrophoneModule;
