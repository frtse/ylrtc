class DeviceEnumerator {
  static async enumerateAllDevices() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices;
  }
  
  static async enumerateCameras() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((e) => {
      return "videoinput" === e.kind;
    });
  }

  static async enumerateMicrophones() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((e) => {
      return "audioinput" === e.kind;
    });
  }

  static async enumerateSpeakers() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((e) => {
      return "audiooutput" === e.kind;
    });
  }
};