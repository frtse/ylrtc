export default class Device {
  private mediaStream_: MediaStream;
  // constraints : https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
  static async CreateDevice(type: string, constraints: MediaStreamConstraints): Promise<Device> {
   let mediaStream;
   if (type === "camera")
     mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
   else if (type === "screenShare")
     mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);
   else
     throw "Invalid type";
   return new Device(mediaStream);
 }

 constructor(mediaStream) {
   this.mediaStream_ = mediaStream;
 }

 mediaStream(): MediaStream {
   return this.mediaStream_;
 }
};