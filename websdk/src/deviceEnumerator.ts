export default class DeviceEnumerator {
  static async enumerateAllDevices(): Promise<Array<MediaDeviceInfo>> {
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices;
  }
  
  static async enumerateCameras(): Promise<Array<MediaDeviceInfo>> {
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((e) => {
      return "videoinput" === e.kind;
    });
  }

  static async enumerateMicrophones(): Promise<Array<MediaDeviceInfo>> {
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((e) => {
      return "audioinput" === e.kind;
    });
  }

  static async enumerateSpeakers(): Promise<Array<MediaDeviceInfo>> {
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((e) => {
      return "audiooutput" === e.kind;
    });
  }
};