class Device {
  // constraints : https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
  static async CreateDevice(type, constraints) {
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

 mediaStream() {
   return this.mediaStream_;
 }
};