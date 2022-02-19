(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Ylsfu"] = factory();
	else
		root["Ylsfu"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client.ts":
/*!***********************!*\
  !*** ./src/client.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var eventDispatcher_1 = __webpack_require__(/*! ./eventDispatcher */ "./src/eventDispatcher.ts");
var signaling_1 = __webpack_require__(/*! ./signaling */ "./src/signaling.ts");
var publisheStream_1 = __webpack_require__(/*! ./publisheStream */ "./src/publisheStream.ts");
var subscribeStream_1 = __webpack_require__(/*! ./subscribeStream */ "./src/subscribeStream.ts");
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(signallingServerIp, signallingServerPort) {
        var _this = _super.call(this) || this;
        _this.signaling_ = new signaling_1["default"]();
        _this.signallingServerIp_ = signallingServerIp;
        _this.signallingServerPort_ = signallingServerPort;
        _this.participantId_ = '';
        _this.joined_ = false;
        _this.mediaStream_ = null;
        return _this;
    }
    Client.prototype.join = function (roomId, participantId) {
        return __awaiter(this, void 0, void 0, function () {
            var signalingUrl, request, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.joined_)
                            throw "Already joined meeting.";
                        signalingUrl = "wss://" + this.signallingServerIp_ + ":" + this.signallingServerPort_;
                        this.signaling_.addEventListener("onsignaling", function (e) {
                            var notification = JSON.parse(e);
                            if (notification.type === "streamAdded" || notification.type === "participantJoined" || notification.type === "participantLeft")
                                _super.prototype.dispatchEvent.call(_this, notification.type, notification.data);
                            if (notification.type === "signalingDisconnected")
                                _this.leave();
                        });
                        return [4 /*yield*/, this.signaling_.open(signalingUrl)];
                    case 1:
                        _a.sent();
                        request = { action: "join", roomId: roomId, participantId: participantId };
                        return [4 /*yield*/, this.signaling_.sendRequest(request)];
                    case 2:
                        res = _a.sent();
                        if (res.error != undefined && res.error)
                            throw "Join room failed.";
                        this.participantId_ = participantId;
                        this.joined_ = true;
                        return [2 /*return*/, res.roomInfo];
                }
            });
        });
    };
    /**
     * Publish stream.
     * @param {*} device Device
     * @param {*} videoRtpEncodingParameters RTCRtpEncodingParameters https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpEncodingParameters
     * @param {*} audioRtpEncodingParameters RTCRtpEncodingParameters https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpEncodingParameters
     */
    Client.prototype.publish = function (device, audioRtpEncodingParameters, videoRtpEncodingParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var mediaStream, pc, init, transceiver, init, transceiver, offer, request, res, answerSdp, streamId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mediaStream = device.mediaStream();
                        pc = new RTCPeerConnection({ bundlePolicy: "max-bundle", rtcpMuxPolicy: "require" });
                        if (mediaStream.getAudioTracks().length >
                            0) {
                            init = null;
                            if (audioRtpEncodingParameters !== null) {
                                init = {
                                    direction: 'sendonly',
                                    sendEncodings: audioRtpEncodingParameters,
                                    streams: [mediaStream]
                                };
                            }
                            else {
                                init = {
                                    direction: 'sendonly',
                                    streams: [mediaStream]
                                };
                            }
                            transceiver = pc.addTransceiver(mediaStream.getAudioTracks()[0], init);
                            /*
                            if (audioRtpEncodingParameters !== null) {
                              let audio_parameters = transceiver.sender.getParameters();
                              audio_parameters.encodings = audioRtpEncodingParameters;
                              transceiver.sender.setParameters(audio_parameters);
                            }
                            */
                        }
                        if (mediaStream.getVideoTracks().length >
                            0) {
                            init = null;
                            if (videoRtpEncodingParameters !== null) {
                                init = {
                                    direction: 'sendonly',
                                    sendEncodings: videoRtpEncodingParameters,
                                    streams: [mediaStream]
                                };
                            }
                            else {
                                init = {
                                    direction: 'sendonly',
                                    streams: [mediaStream]
                                };
                            }
                            transceiver = pc.addTransceiver(mediaStream.getVideoTracks()[0], init);
                            /*
                            if (videoRtpEncodingParameters !== null) {
                              let video_parameters = transceiver.sender.getParameters();
                              video_parameters.encodings = videoRtpEncodingParameters;
                              transceiver.sender.setParameters(video_parameters);
                            }
                            */
                        }
                        return [4 /*yield*/, pc.createOffer()];
                    case 1:
                        offer = _a.sent();
                        return [4 /*yield*/, pc.setLocalDescription(offer)];
                    case 2:
                        _a.sent();
                        request = { action: "publish", offer: offer.sdp };
                        return [4 /*yield*/, this.signaling_.sendRequest(request)];
                    case 3:
                        res = _a.sent();
                        if (res.error)
                            throw "Publish failed.";
                        answerSdp = new RTCSessionDescription({ sdp: res.answer, type: 'answer' });
                        streamId = res.streamId;
                        return [4 /*yield*/, pc.setRemoteDescription(answerSdp)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, new publisheStream_1["default"](mediaStream, streamId, pc, this.signaling_)];
                }
            });
        });
    };
    Client.prototype.subscribe = function (remoteStream) {
        return __awaiter(this, void 0, void 0, function () {
            var pc, offer, request, res, answerSdp, subscribeStreamId, publishStreamId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.mediaStream_ = null;
                        this.mediaStream_ = new MediaStream();
                        pc = new RTCPeerConnection({ bundlePolicy: "max-bundle", rtcpMuxPolicy: "require" });
                        if (remoteStream.hasAudio)
                            pc.addTransceiver("audio", { direction: "recvonly" });
                        if (remoteStream.hasVideo)
                            pc.addTransceiver("video", { direction: "recvonly" });
                        pc.ontrack = this._ontrack.bind(this);
                        return [4 /*yield*/, pc.createOffer()];
                    case 1:
                        offer = _a.sent();
                        return [4 /*yield*/, pc.setLocalDescription(offer)];
                    case 2:
                        _a.sent();
                        request = { action: "subscribe", streamId: remoteStream.publishStreamId, participantId: remoteStream.participantId, offer: offer.sdp };
                        return [4 /*yield*/, this.signaling_.sendRequest(request)];
                    case 3:
                        res = _a.sent();
                        if (res.error)
                            throw "Connect failed.";
                        answerSdp = new RTCSessionDescription({ sdp: res.answer, type: 'answer' });
                        return [4 /*yield*/, pc.setRemoteDescription(answerSdp)];
                    case 4:
                        _a.sent();
                        subscribeStreamId = res.streamId;
                        publishStreamId = remoteStream.publishStreamId;
                        return [2 /*return*/, new subscribeStream_1["default"](this.signaling_, pc, subscribeStreamId, publishStreamId, this.mediaStream_)];
                }
            });
        });
    };
    Client.prototype.leave = function () {
        if (this.joined_) {
            this.joined_ = false;
            this.signaling_.close();
        }
    };
    Client.prototype._ontrack = function (e) {
        this.mediaStream_.addTrack(e.track);
    };
    return Client;
}(eventDispatcher_1["default"]));
exports["default"] = Client;
;


/***/ }),

/***/ "./src/device.ts":
/*!***********************!*\
  !*** ./src/device.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Device = /** @class */ (function () {
    function Device(mediaStream) {
        this.mediaStream_ = mediaStream;
    }
    // constraints : https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
    Device.CreateDevice = function (type, constraints) {
        return __awaiter(this, void 0, void 0, function () {
            var mediaStream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(type === "camera")) return [3 /*break*/, 2];
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
                    case 1:
                        mediaStream = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(type === "screenShare")) return [3 /*break*/, 4];
                        return [4 /*yield*/, navigator.mediaDevices.getDisplayMedia(constraints)];
                    case 3:
                        mediaStream = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw "Invalid type";
                    case 5: return [2 /*return*/, new Device(mediaStream)];
                }
            });
        });
    };
    Device.prototype.mediaStream = function () {
        return this.mediaStream_;
    };
    return Device;
}());
exports["default"] = Device;
;


/***/ }),

/***/ "./src/deviceEnumerator.ts":
/*!*********************************!*\
  !*** ./src/deviceEnumerator.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var DeviceEnumerator = /** @class */ (function () {
    function DeviceEnumerator() {
    }
    DeviceEnumerator.enumerateAllDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        return [2 /*return*/, devices];
                }
            });
        });
    };
    DeviceEnumerator.enumerateCameras = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        return [2 /*return*/, devices.filter(function (e) {
                                return "videoinput" === e.kind;
                            })];
                }
            });
        });
    };
    DeviceEnumerator.enumerateMicrophones = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        return [2 /*return*/, devices.filter(function (e) {
                                return "audioinput" === e.kind;
                            })];
                }
            });
        });
    };
    DeviceEnumerator.enumerateSpeakers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        return [2 /*return*/, devices.filter(function (e) {
                                return "audiooutput" === e.kind;
                            })];
                }
            });
        });
    };
    return DeviceEnumerator;
}());
exports["default"] = DeviceEnumerator;
;


/***/ }),

/***/ "./src/eventDispatcher.ts":
/*!********************************!*\
  !*** ./src/eventDispatcher.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
var EventDispatcher = /** @class */ (function () {
    function EventDispatcher() {
        this.events_ = {};
    }
    EventDispatcher.prototype.addEventListener = function (event, callback) {
        if (typeof callback !== 'function') {
            console.error("The listener callback must be a function, the given type is ".concat(typeof callback));
            return false;
        }
        if (this.events_[event] === undefined) {
            this.events_[event] = {
                listeners: []
            };
        }
        this.events_[event].listeners.push(callback);
    };
    EventDispatcher.prototype.removeEventListener = function (event, callback) {
        if (this.events_[event] === undefined) {
            console.error("This event: ".concat(event, " does not exist"));
            return false;
        }
        this.events_[event].listeners = this.events_[event].listeners.filter(function (listener) {
            return listener.toString() !== callback.toString();
        });
    };
    EventDispatcher.prototype.dispatchEvent = function (event, details) {
        if (this.events_[event] === undefined) {
            return false;
        }
        this.events_[event].listeners.forEach(function (listener) {
            listener(details);
        });
    };
    return EventDispatcher;
}());
exports["default"] = EventDispatcher;


/***/ }),

/***/ "./src/publisheStream.ts":
/*!*******************************!*\
  !*** ./src/publisheStream.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var PublisheStream = /** @class */ (function () {
    function PublisheStream(mediaStream, streamId, pc, signaling) {
        this.mediaStream_ = mediaStream;
        this.streamId_ = streamId;
        this.pc_ = pc;
        this.signaling_ = signaling;
    }
    PublisheStream.prototype.Id = function () {
        return this.streamId_;
    };
    PublisheStream.prototype.close = function () {
        if (this.pc_) {
            this.pc_.close();
            this.pc_ = null;
        }
    };
    PublisheStream.prototype.mute = function (type) {
        if (type === "audio") {
            this.mediaStream_.getAudioTracks().forEach(function (e) {
                e.enabled = false;
            });
            var request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted: true, type: "audio" };
            this.signaling_.send(JSON.stringify(request));
        }
        else if (type === "video") {
            this.mediaStream_.getVideoTracks().forEach(function (e) {
                e.enabled = false;
            });
            var request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted: true, type: "video" };
            this.signaling_.send(JSON.stringify(request));
        }
        else
            throw "Invalid type";
    };
    PublisheStream.prototype.unmute = function (type) {
        if (type === "audio") {
            this.mediaStream_.getAudioTracks().forEach(function (e) {
                e.enabled = true;
            });
            var request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted: false, type: "audio" };
            this.signaling_.send(JSON.stringify(request));
        }
        else if (type === "video") {
            this.mediaStream_.getVideoTracks().forEach(function (e) {
                e.enabled = true;
            });
            var request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted: false, type: "video" };
            this.signaling_.send(JSON.stringify(request));
        }
        else
            throw "Invalid type";
    };
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
     */
    PublisheStream.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.pc_) {
                    return [2 /*return*/, this.pc_.getStats()];
                }
                else {
                    throw "PeerConnection is null";
                }
                return [2 /*return*/];
            });
        });
    };
    return PublisheStream;
}());
exports["default"] = PublisheStream;
;


/***/ }),

/***/ "./src/signaling.ts":
/*!**************************!*\
  !*** ./src/signaling.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var eventDispatcher_1 = __webpack_require__(/*! ./eventDispatcher */ "./src/eventDispatcher.ts");
var Signaling = /** @class */ (function (_super) {
    __extends(Signaling, _super);
    function Signaling() {
        var _this = _super.call(this) || this;
        _this.promisePool_ = {};
        _this.wss_ = null;
        _this.keepAliveTimerId_ = undefined;
        return _this;
    }
    Signaling.prototype.open = function (url) {
        var _this = this;
        var classThis = this;
        return new Promise(function (resolve, reject) {
            _this.wss_ = new WebSocket(url);
            _this.wss_.onopen = function (e) {
                resolve();
                classThis._keepAlive();
            };
            _this.wss_.onerror = function (e) {
                reject(e);
            };
            _this.wss_.onclose = function (e) {
                var notification = { type: "signalingDisconnected" };
                _super.prototype.dispatchEvent.call(_this, "onsignaling", JSON.stringify(notification));
            };
            _this.wss_.onmessage = function (e) {
                var data = JSON.parse(e.data);
                if (data.transactionId === undefined) {
                    _super.prototype.dispatchEvent.call(_this, "onsignaling", e.data);
                }
                else {
                    if (_this.promisePool_.hasOwnProperty(data.transactionId)) {
                        var transactionId = data.transactionId;
                        var req = _this.promisePool_[data.transactionId];
                        delete data.transactionId;
                        req.resolve(data);
                        delete _this.promisePool_[transactionId];
                    }
                }
            };
        });
    };
    Signaling.prototype.close = function () {
        this._cancelKeepAlive();
        if (this.wss_ != null)
            this.wss_.close();
        this.wss_ = null;
    };
    Signaling.prototype.send = function (msg) {
        this.wss_.send(msg);
    };
    Signaling.prototype.sendRequest = function (msg) {
        var _this = this;
        var transactionId = '';
        while (true) {
            transactionId = Math.round(Math.random() * 1000000000000000000) + '';
            if (!this.promisePool_.hasOwnProperty(transactionId))
                break;
        }
        msg.transactionId = transactionId;
        return new Promise(function (resolve, reject) {
            _this.promisePool_[msg.transactionId] = {
                resolve: resolve,
                reject: reject
            };
            _this.wss_.send(JSON.stringify(msg));
        });
    };
    Signaling.prototype._keepAlive = function () {
        var timeout = 1000;
        if (this.wss_.readyState == this.wss_.OPEN) {
            var request = { action: "keepAlive" };
            this.wss_.send(JSON.stringify(request));
        }
        this.keepAliveTimerId_ = setTimeout(this._keepAlive.bind(this), timeout);
    };
    Signaling.prototype._cancelKeepAlive = function () {
        if (this.keepAliveTimerId_) {
            clearTimeout(this.keepAliveTimerId_);
        }
    };
    return Signaling;
}(eventDispatcher_1["default"]));
exports["default"] = Signaling;


/***/ }),

/***/ "./src/subscribeStream.ts":
/*!********************************!*\
  !*** ./src/subscribeStream.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var eventDispatcher_1 = __webpack_require__(/*! ./eventDispatcher */ "./src/eventDispatcher.ts");
var SubscribeStream = /** @class */ (function (_super) {
    __extends(SubscribeStream, _super);
    function SubscribeStream(signaling, pc, subscribeStreamId, publishStreamId, mediaStream) {
        var _this = _super.call(this) || this;
        _this.signaling_ = signaling;
        _this.signaling_.addEventListener("onsignaling", function (e) {
            var notification = JSON.parse(e);
            if (notification.type === "publishMuteOrUnmute") {
                if (notification.data.publishStreamId === _this.publishStreamId_) {
                    var eventType = notification.data.muted ? 'mute' : 'unmute';
                    _super.prototype.dispatchEvent.call(_this, eventType, notification.data.type);
                }
            }
        });
        _this.signaling_.addEventListener("onsignaling", function (e) {
            var notification = JSON.parse(e);
            if (notification.type === "streamRemoved") {
                if (notification.data.publishStreamId === _this.publishStreamId_) {
                    _this.close();
                    _super.prototype.dispatchEvent.call(_this, "ended", _this.subscribeStreamId_);
                }
            }
        });
        _this.pc_ = pc;
        _this.subscribeStreamId_ = subscribeStreamId;
        _this.publishStreamId_ = publishStreamId;
        _this.mediaStream_ = mediaStream;
        return _this;
    }
    SubscribeStream.prototype.id = function () {
        return this.subscribeStreamId_;
    };
    SubscribeStream.prototype.mediaStream = function () {
        return this.mediaStream_;
    };
    SubscribeStream.prototype.close = function () {
        if (this.pc_) {
            this.pc_.close();
            this.pc_ = null;
        }
    };
    SubscribeStream.prototype.mute = function (type) {
        if (type === "audio") {
            this.mediaStream_.getAudioTracks().forEach(function (e) {
                e.enabled = false;
            });
        }
        else if (type === "video") {
            this.mediaStream_.getVideoTracks().forEach(function (e) {
                e.enabled = false;
            });
        }
        else
            throw "Invalid type";
    };
    SubscribeStream.prototype.unmute = function (type) {
        if (type === "audio") {
            this.mediaStream_.getAudioTracks().forEach(function (e) {
                e.enabled = true;
            });
        }
        else if (type === "video") {
            this.mediaStream_.getVideoTracks().forEach(function (e) {
                e.enabled = true;
            });
        }
        else
            throw "Invalid type";
    };
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
     */
    SubscribeStream.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.pc_) {
                    return [2 /*return*/, this.pc_.getStats()];
                }
                else {
                    throw "PeerConnection is null";
                }
                return [2 /*return*/];
            });
        });
    };
    return SubscribeStream;
}(eventDispatcher_1["default"]));
exports["default"] = SubscribeStream;
;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

exports.__esModule = true;
exports.Client = exports.SubscribeStream = exports.PublisheStream = exports.Signaling = exports.EventDispatcher = exports.DeviceEnumerator = exports.Device = void 0;
var device_1 = __webpack_require__(/*! ./device */ "./src/device.ts");
exports.Device = device_1["default"];
var deviceEnumerator_1 = __webpack_require__(/*! ./deviceEnumerator */ "./src/deviceEnumerator.ts");
exports.DeviceEnumerator = deviceEnumerator_1["default"];
var eventDispatcher_1 = __webpack_require__(/*! ./eventDispatcher */ "./src/eventDispatcher.ts");
exports.EventDispatcher = eventDispatcher_1["default"];
var signaling_1 = __webpack_require__(/*! ./signaling */ "./src/signaling.ts");
exports.Signaling = signaling_1["default"];
var publisheStream_1 = __webpack_require__(/*! ./publisheStream */ "./src/publisheStream.ts");
exports.PublisheStream = publisheStream_1["default"];
var subscribeStream_1 = __webpack_require__(/*! ./subscribeStream */ "./src/subscribeStream.ts");
exports.SubscribeStream = subscribeStream_1["default"];
var client_1 = __webpack_require__(/*! ./client */ "./src/client.ts");
exports.Client = client_1["default"];

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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aUNBQVU7QUFDakMsY0FBYyIsInNvdXJjZXMiOlsid2VicGFjazovL1lsc2Z1L3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9ZbHNmdS8uL3NyYy9jbGllbnQudHMiLCJ3ZWJwYWNrOi8vWWxzZnUvLi9zcmMvZGV2aWNlLnRzIiwid2VicGFjazovL1lsc2Z1Ly4vc3JjL2RldmljZUVudW1lcmF0b3IudHMiLCJ3ZWJwYWNrOi8vWWxzZnUvLi9zcmMvZXZlbnREaXNwYXRjaGVyLnRzIiwid2VicGFjazovL1lsc2Z1Ly4vc3JjL3B1Ymxpc2hlU3RyZWFtLnRzIiwid2VicGFjazovL1lsc2Z1Ly4vc3JjL3NpZ25hbGluZy50cyIsIndlYnBhY2s6Ly9ZbHNmdS8uL3NyYy9zdWJzY3JpYmVTdHJlYW0udHMiLCJ3ZWJwYWNrOi8vWWxzZnUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vWWxzZnUvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiWWxzZnVcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiWWxzZnVcIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBldmVudERpc3BhdGNoZXJfMSA9IHJlcXVpcmUoXCIuL2V2ZW50RGlzcGF0Y2hlclwiKTtcbnZhciBzaWduYWxpbmdfMSA9IHJlcXVpcmUoXCIuL3NpZ25hbGluZ1wiKTtcbnZhciBwdWJsaXNoZVN0cmVhbV8xID0gcmVxdWlyZShcIi4vcHVibGlzaGVTdHJlYW1cIik7XG52YXIgc3Vic2NyaWJlU3RyZWFtXzEgPSByZXF1aXJlKFwiLi9zdWJzY3JpYmVTdHJlYW1cIik7XG52YXIgQ2xpZW50ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhDbGllbnQsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQ2xpZW50KHNpZ25hbGxpbmdTZXJ2ZXJJcCwgc2lnbmFsbGluZ1NlcnZlclBvcnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuc2lnbmFsaW5nXyA9IG5ldyBzaWduYWxpbmdfMVtcImRlZmF1bHRcIl0oKTtcbiAgICAgICAgX3RoaXMuc2lnbmFsbGluZ1NlcnZlcklwXyA9IHNpZ25hbGxpbmdTZXJ2ZXJJcDtcbiAgICAgICAgX3RoaXMuc2lnbmFsbGluZ1NlcnZlclBvcnRfID0gc2lnbmFsbGluZ1NlcnZlclBvcnQ7XG4gICAgICAgIF90aGlzLnBhcnRpY2lwYW50SWRfID0gJyc7XG4gICAgICAgIF90aGlzLmpvaW5lZF8gPSBmYWxzZTtcbiAgICAgICAgX3RoaXMubWVkaWFTdHJlYW1fID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBDbGllbnQucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbiAocm9vbUlkLCBwYXJ0aWNpcGFudElkKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzaWduYWxpbmdVcmwsIHJlcXVlc3QsIHJlcztcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5qb2luZWRfKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQWxyZWFkeSBqb2luZWQgbWVldGluZy5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbGluZ1VybCA9IFwid3NzOi8vXCIgKyB0aGlzLnNpZ25hbGxpbmdTZXJ2ZXJJcF8gKyBcIjpcIiArIHRoaXMuc2lnbmFsbGluZ1NlcnZlclBvcnRfO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaWduYWxpbmdfLmFkZEV2ZW50TGlzdGVuZXIoXCJvbnNpZ25hbGluZ1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSBKU09OLnBhcnNlKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24udHlwZSA9PT0gXCJzdHJlYW1BZGRlZFwiIHx8IG5vdGlmaWNhdGlvbi50eXBlID09PSBcInBhcnRpY2lwYW50Sm9pbmVkXCIgfHwgbm90aWZpY2F0aW9uLnR5cGUgPT09IFwicGFydGljaXBhbnRMZWZ0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudC5jYWxsKF90aGlzLCBub3RpZmljYXRpb24udHlwZSwgbm90aWZpY2F0aW9uLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24udHlwZSA9PT0gXCJzaWduYWxpbmdEaXNjb25uZWN0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubGVhdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5zaWduYWxpbmdfLm9wZW4oc2lnbmFsaW5nVXJsKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSB7IGFjdGlvbjogXCJqb2luXCIsIHJvb21JZDogcm9vbUlkLCBwYXJ0aWNpcGFudElkOiBwYXJ0aWNpcGFudElkIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnNpZ25hbGluZ18uc2VuZFJlcXVlc3QocmVxdWVzdCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmVycm9yICE9IHVuZGVmaW5lZCAmJiByZXMuZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJKb2luIHJvb20gZmFpbGVkLlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudElkXyA9IHBhcnRpY2lwYW50SWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmpvaW5lZF8gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIHJlcy5yb29tSW5mb107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVibGlzaCBzdHJlYW0uXG4gICAgICogQHBhcmFtIHsqfSBkZXZpY2UgRGV2aWNlXG4gICAgICogQHBhcmFtIHsqfSB2aWRlb1J0cEVuY29kaW5nUGFyYW1ldGVycyBSVENSdHBFbmNvZGluZ1BhcmFtZXRlcnMgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JUQ1J0cEVuY29kaW5nUGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSB7Kn0gYXVkaW9SdHBFbmNvZGluZ1BhcmFtZXRlcnMgUlRDUnRwRW5jb2RpbmdQYXJhbWV0ZXJzIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SVENSdHBFbmNvZGluZ1BhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBDbGllbnQucHJvdG90eXBlLnB1Ymxpc2ggPSBmdW5jdGlvbiAoZGV2aWNlLCBhdWRpb1J0cEVuY29kaW5nUGFyYW1ldGVycywgdmlkZW9SdHBFbmNvZGluZ1BhcmFtZXRlcnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1lZGlhU3RyZWFtLCBwYywgaW5pdCwgdHJhbnNjZWl2ZXIsIGluaXQsIHRyYW5zY2VpdmVyLCBvZmZlciwgcmVxdWVzdCwgcmVzLCBhbnN3ZXJTZHAsIHN0cmVhbUlkO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgbWVkaWFTdHJlYW0gPSBkZXZpY2UubWVkaWFTdHJlYW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKHsgYnVuZGxlUG9saWN5OiBcIm1heC1idW5kbGVcIiwgcnRjcE11eFBvbGljeTogXCJyZXF1aXJlXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVkaWFTdHJlYW0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGggPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXVkaW9SdHBFbmNvZGluZ1BhcmFtZXRlcnMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ3NlbmRvbmx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRFbmNvZGluZ3M6IGF1ZGlvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtczogW21lZGlhU3RyZWFtXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ3NlbmRvbmx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbXM6IFttZWRpYVN0cmVhbV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIgPSBwYy5hZGRUcmFuc2NlaXZlcihtZWRpYVN0cmVhbS5nZXRBdWRpb1RyYWNrcygpWzBdLCBpbml0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdWRpb1J0cEVuY29kaW5nUGFyYW1ldGVycyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGF1ZGlvX3BhcmFtZXRlcnMgPSB0cmFuc2NlaXZlci5zZW5kZXIuZ2V0UGFyYW1ldGVycygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9fcGFyYW1ldGVycy5lbmNvZGluZ3MgPSBhdWRpb1J0cEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zY2VpdmVyLnNlbmRlci5zZXRQYXJhbWV0ZXJzKGF1ZGlvX3BhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lZGlhU3RyZWFtLmdldFZpZGVvVHJhY2tzKCkubGVuZ3RoID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZpZGVvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICdzZW5kb25seScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdzOiB2aWRlb1J0cEVuY29kaW5nUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbXM6IFttZWRpYVN0cmVhbV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICdzZW5kb25seScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1zOiBbbWVkaWFTdHJlYW1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zY2VpdmVyID0gcGMuYWRkVHJhbnNjZWl2ZXIobWVkaWFTdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSwgaW5pdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmlkZW9SdHBFbmNvZGluZ1BhcmFtZXRlcnMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2aWRlb19wYXJhbWV0ZXJzID0gdHJhbnNjZWl2ZXIuc2VuZGVyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvX3BhcmFtZXRlcnMuZW5jb2RpbmdzID0gdmlkZW9SdHBFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kZXIuc2V0UGFyYW1ldGVycyh2aWRlb19wYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLmNyZWF0ZU9mZmVyKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlciA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLnNldExvY2FsRGVzY3JpcHRpb24ob2ZmZXIpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHsgYWN0aW9uOiBcInB1Ymxpc2hcIiwgb2ZmZXI6IG9mZmVyLnNkcCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5zaWduYWxpbmdfLnNlbmRSZXF1ZXN0KHJlcXVlc3QpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlB1Ymxpc2ggZmFpbGVkLlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyU2RwID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7IHNkcDogcmVzLmFuc3dlciwgdHlwZTogJ2Fuc3dlcicgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1JZCA9IHJlcy5zdHJlYW1JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLnNldFJlbW90ZURlc2NyaXB0aW9uKGFuc3dlclNkcCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgbmV3IHB1Ymxpc2hlU3RyZWFtXzFbXCJkZWZhdWx0XCJdKG1lZGlhU3RyZWFtLCBzdHJlYW1JZCwgcGMsIHRoaXMuc2lnbmFsaW5nXyldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIENsaWVudC5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKHJlbW90ZVN0cmVhbSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcGMsIG9mZmVyLCByZXF1ZXN0LCByZXMsIGFuc3dlclNkcCwgc3Vic2NyaWJlU3RyZWFtSWQsIHB1Ymxpc2hTdHJlYW1JZDtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYyA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbih7IGJ1bmRsZVBvbGljeTogXCJtYXgtYnVuZGxlXCIsIHJ0Y3BNdXhQb2xpY3k6IFwicmVxdWlyZVwiIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW90ZVN0cmVhbS5oYXNBdWRpbylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYy5hZGRUcmFuc2NlaXZlcihcImF1ZGlvXCIsIHsgZGlyZWN0aW9uOiBcInJlY3Zvbmx5XCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3RlU3RyZWFtLmhhc1ZpZGVvKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjLmFkZFRyYW5zY2VpdmVyKFwidmlkZW9cIiwgeyBkaXJlY3Rpb246IFwicmVjdm9ubHlcIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjLm9udHJhY2sgPSB0aGlzLl9vbnRyYWNrLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBwYy5jcmVhdGVPZmZlcigpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXIgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBwYy5zZXRMb2NhbERlc2NyaXB0aW9uKG9mZmVyKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSB7IGFjdGlvbjogXCJzdWJzY3JpYmVcIiwgc3RyZWFtSWQ6IHJlbW90ZVN0cmVhbS5wdWJsaXNoU3RyZWFtSWQsIHBhcnRpY2lwYW50SWQ6IHJlbW90ZVN0cmVhbS5wYXJ0aWNpcGFudElkLCBvZmZlcjogb2ZmZXIuc2RwIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnNpZ25hbGluZ18uc2VuZFJlcXVlc3QocmVxdWVzdCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ29ubmVjdCBmYWlsZWQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXJTZHAgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHsgc2RwOiByZXMuYW5zd2VyLCB0eXBlOiAnYW5zd2VyJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLnNldFJlbW90ZURlc2NyaXB0aW9uKGFuc3dlclNkcCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVTdHJlYW1JZCA9IHJlcy5zdHJlYW1JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2hTdHJlYW1JZCA9IHJlbW90ZVN0cmVhbS5wdWJsaXNoU3RyZWFtSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgbmV3IHN1YnNjcmliZVN0cmVhbV8xW1wiZGVmYXVsdFwiXSh0aGlzLnNpZ25hbGluZ18sIHBjLCBzdWJzY3JpYmVTdHJlYW1JZCwgcHVibGlzaFN0cmVhbUlkLCB0aGlzLm1lZGlhU3RyZWFtXyldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIENsaWVudC5wcm90b3R5cGUubGVhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmpvaW5lZF8pIHtcbiAgICAgICAgICAgIHRoaXMuam9pbmVkXyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxpbmdfLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIENsaWVudC5wcm90b3R5cGUuX29udHJhY2sgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5hZGRUcmFjayhlLnRyYWNrKTtcbiAgICB9O1xuICAgIHJldHVybiBDbGllbnQ7XG59KGV2ZW50RGlzcGF0Y2hlcl8xW1wiZGVmYXVsdFwiXSkpO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBDbGllbnQ7XG47XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIERldmljZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZXZpY2UobWVkaWFTdHJlYW0pIHtcbiAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8gPSBtZWRpYVN0cmVhbTtcbiAgICB9XG4gICAgLy8gY29uc3RyYWludHMgOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTWVkaWFTdHJlYW1Db25zdHJhaW50c1xuICAgIERldmljZS5DcmVhdGVEZXZpY2UgPSBmdW5jdGlvbiAodHlwZSwgY29uc3RyYWludHMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1lZGlhU3RyZWFtO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEodHlwZSA9PT0gXCJjYW1lcmFcIikpIHJldHVybiBbMyAvKmJyZWFrKi8sIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgbWVkaWFTdHJlYW0gPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA1XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEodHlwZSA9PT0gXCJzY3JlZW5TaGFyZVwiKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldERpc3BsYXlNZWRpYShjb25zdHJhaW50cyldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICBtZWRpYVN0cmVhbSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDVdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6IHRocm93IFwiSW52YWxpZCB0eXBlXCI7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNTogcmV0dXJuIFsyIC8qcmV0dXJuKi8sIG5ldyBEZXZpY2UobWVkaWFTdHJlYW0pXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBEZXZpY2UucHJvdG90eXBlLm1lZGlhU3RyZWFtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZWRpYVN0cmVhbV87XG4gICAgfTtcbiAgICByZXR1cm4gRGV2aWNlO1xufSgpKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRGV2aWNlO1xuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBEZXZpY2VFbnVtZXJhdG9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERldmljZUVudW1lcmF0b3IoKSB7XG4gICAgfVxuICAgIERldmljZUVudW1lcmF0b3IuZW51bWVyYXRlQWxsRGV2aWNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRldmljZXM7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBbNCAvKnlpZWxkKi8sIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcygpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlcyA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCBkZXZpY2VzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBEZXZpY2VFbnVtZXJhdG9yLmVudW1lcmF0ZUNhbWVyYXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZXZpY2VzO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gWzQgLyp5aWVsZCovLCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZXMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgZGV2aWNlcy5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidmlkZW9pbnB1dFwiID09PSBlLmtpbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIERldmljZUVudW1lcmF0b3IuZW51bWVyYXRlTWljcm9waG9uZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZXZpY2VzO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gWzQgLyp5aWVsZCovLCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZXMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgZGV2aWNlcy5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYXVkaW9pbnB1dFwiID09PSBlLmtpbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIERldmljZUVudW1lcmF0b3IuZW51bWVyYXRlU3BlYWtlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZXZpY2VzO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gWzQgLyp5aWVsZCovLCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZXMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgZGV2aWNlcy5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYXVkaW9vdXRwdXRcIiA9PT0gZS5raW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gRGV2aWNlRW51bWVyYXRvcjtcbn0oKSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IERldmljZUVudW1lcmF0b3I7XG47XG4iLCJcInVzZSBzdHJpY3RcIjtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgRXZlbnREaXNwYXRjaGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEV2ZW50RGlzcGF0Y2hlcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHNfID0ge307XG4gICAgfVxuICAgIEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBsaXN0ZW5lciBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24sIHRoZSBnaXZlbiB0eXBlIGlzIFwiLmNvbmNhdCh0eXBlb2YgY2FsbGJhY2spKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ldmVudHNfW2V2ZW50XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c19bZXZlbnRdID0ge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyczogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ldmVudHNfW2V2ZW50XS5saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgfTtcbiAgICBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c19bZXZlbnRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaGlzIGV2ZW50OiBcIi5jb25jYXQoZXZlbnQsIFwiIGRvZXMgbm90IGV4aXN0XCIpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV2ZW50c19bZXZlbnRdLmxpc3RlbmVycyA9IHRoaXMuZXZlbnRzX1tldmVudF0ubGlzdGVuZXJzLmZpbHRlcihmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBsaXN0ZW5lci50b1N0cmluZygpICE9PSBjYWxsYmFjay50b1N0cmluZygpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIChldmVudCwgZGV0YWlscykge1xuICAgICAgICBpZiAodGhpcy5ldmVudHNfW2V2ZW50XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ldmVudHNfW2V2ZW50XS5saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyKGRldGFpbHMpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBFdmVudERpc3BhdGNoZXI7XG59KCkpO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBFdmVudERpc3BhdGNoZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIFB1Ymxpc2hlU3RyZWFtID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFB1Ymxpc2hlU3RyZWFtKG1lZGlhU3RyZWFtLCBzdHJlYW1JZCwgcGMsIHNpZ25hbGluZykge1xuICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXyA9IG1lZGlhU3RyZWFtO1xuICAgICAgICB0aGlzLnN0cmVhbUlkXyA9IHN0cmVhbUlkO1xuICAgICAgICB0aGlzLnBjXyA9IHBjO1xuICAgICAgICB0aGlzLnNpZ25hbGluZ18gPSBzaWduYWxpbmc7XG4gICAgfVxuICAgIFB1Ymxpc2hlU3RyZWFtLnByb3RvdHlwZS5JZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtSWRfO1xuICAgIH07XG4gICAgUHVibGlzaGVTdHJlYW0ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wY18pIHtcbiAgICAgICAgICAgIHRoaXMucGNfLmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLnBjXyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFB1Ymxpc2hlU3RyZWFtLnByb3RvdHlwZS5tdXRlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09IFwiYXVkaW9cIikge1xuICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uZ2V0QXVkaW9UcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0geyBhY3Rpb246IFwicHVibGlzaF9tdXRlT3JVbm11dGVcIiwgc3RyZWFtSWQ6IHRoaXMuc3RyZWFtSWRfLCBtdXRlZDogdHJ1ZSwgdHlwZTogXCJhdWRpb1wiIH07XG4gICAgICAgICAgICB0aGlzLnNpZ25hbGluZ18uc2VuZChKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gXCJ2aWRlb1wiKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5nZXRWaWRlb1RyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7IGFjdGlvbjogXCJwdWJsaXNoX211dGVPclVubXV0ZVwiLCBzdHJlYW1JZDogdGhpcy5zdHJlYW1JZF8sIG11dGVkOiB0cnVlLCB0eXBlOiBcInZpZGVvXCIgfTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsaW5nXy5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBcIkludmFsaWQgdHlwZVwiO1xuICAgIH07XG4gICAgUHVibGlzaGVTdHJlYW0ucHJvdG90eXBlLnVubXV0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIGlmICh0eXBlID09PSBcImF1ZGlvXCIpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0geyBhY3Rpb246IFwicHVibGlzaF9tdXRlT3JVbm11dGVcIiwgc3RyZWFtSWQ6IHRoaXMuc3RyZWFtSWRfLCBtdXRlZDogZmFsc2UsIHR5cGU6IFwiYXVkaW9cIiB9O1xuICAgICAgICAgICAgdGhpcy5zaWduYWxpbmdfLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09IFwidmlkZW9cIikge1xuICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uZ2V0VmlkZW9UcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7IGFjdGlvbjogXCJwdWJsaXNoX211dGVPclVubXV0ZVwiLCBzdHJlYW1JZDogdGhpcy5zdHJlYW1JZF8sIG11dGVkOiBmYWxzZSwgdHlwZTogXCJ2aWRlb1wiIH07XG4gICAgICAgICAgICB0aGlzLnNpZ25hbGluZ18uc2VuZChKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgXCJJbnZhbGlkIHR5cGVcIjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SVENQZWVyQ29ubmVjdGlvbi9nZXRTdGF0c1xuICAgICAqL1xuICAgIFB1Ymxpc2hlU3RyZWFtLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBjXykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgdGhpcy5wY18uZ2V0U3RhdHMoKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlBlZXJDb25uZWN0aW9uIGlzIG51bGxcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIFB1Ymxpc2hlU3RyZWFtO1xufSgpKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gUHVibGlzaGVTdHJlYW07XG47XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIGV2ZW50RGlzcGF0Y2hlcl8xID0gcmVxdWlyZShcIi4vZXZlbnREaXNwYXRjaGVyXCIpO1xudmFyIFNpZ25hbGluZyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU2lnbmFsaW5nLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFNpZ25hbGluZygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMucHJvbWlzZVBvb2xfID0ge307XG4gICAgICAgIF90aGlzLndzc18gPSBudWxsO1xuICAgICAgICBfdGhpcy5rZWVwQWxpdmVUaW1lcklkXyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBTaWduYWxpbmcucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBjbGFzc1RoaXMgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgX3RoaXMud3NzXyA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIF90aGlzLndzc18ub25vcGVuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgY2xhc3NUaGlzLl9rZWVwQWxpdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy53c3NfLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy53c3NfLm9uY2xvc2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSB7IHR5cGU6IFwic2lnbmFsaW5nRGlzY29ubmVjdGVkXCIgfTtcbiAgICAgICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQuY2FsbChfdGhpcywgXCJvbnNpZ25hbGluZ1wiLCBKU09OLnN0cmluZ2lmeShub3RpZmljYXRpb24pKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy53c3NfLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEudHJhbnNhY3Rpb25JZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudC5jYWxsKF90aGlzLCBcIm9uc2lnbmFsaW5nXCIsIGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMucHJvbWlzZVBvb2xfLmhhc093blByb3BlcnR5KGRhdGEudHJhbnNhY3Rpb25JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2FjdGlvbklkID0gZGF0YS50cmFuc2FjdGlvbklkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IF90aGlzLnByb21pc2VQb29sX1tkYXRhLnRyYW5zYWN0aW9uSWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEudHJhbnNhY3Rpb25JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIF90aGlzLnByb21pc2VQb29sX1t0cmFuc2FjdGlvbklkXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgU2lnbmFsaW5nLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY2FuY2VsS2VlcEFsaXZlKCk7XG4gICAgICAgIGlmICh0aGlzLndzc18gIT0gbnVsbClcbiAgICAgICAgICAgIHRoaXMud3NzXy5jbG9zZSgpO1xuICAgICAgICB0aGlzLndzc18gPSBudWxsO1xuICAgIH07XG4gICAgU2lnbmFsaW5nLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgICB0aGlzLndzc18uc2VuZChtc2cpO1xuICAgIH07XG4gICAgU2lnbmFsaW5nLnByb3RvdHlwZS5zZW5kUmVxdWVzdCA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHRyYW5zYWN0aW9uSWQgPSAnJztcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwMDAwMDAwMDAwKSArICcnO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnByb21pc2VQb29sXy5oYXNPd25Qcm9wZXJ0eSh0cmFuc2FjdGlvbklkKSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBtc2cudHJhbnNhY3Rpb25JZCA9IHRyYW5zYWN0aW9uSWQ7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBfdGhpcy5wcm9taXNlUG9vbF9bbXNnLnRyYW5zYWN0aW9uSWRdID0ge1xuICAgICAgICAgICAgICAgIHJlc29sdmU6IHJlc29sdmUsXG4gICAgICAgICAgICAgICAgcmVqZWN0OiByZWplY3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy53c3NfLnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgU2lnbmFsaW5nLnByb3RvdHlwZS5fa2VlcEFsaXZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdGltZW91dCA9IDEwMDA7XG4gICAgICAgIGlmICh0aGlzLndzc18ucmVhZHlTdGF0ZSA9PSB0aGlzLndzc18uT1BFTikge1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7IGFjdGlvbjogXCJrZWVwQWxpdmVcIiB9O1xuICAgICAgICAgICAgdGhpcy53c3NfLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMua2VlcEFsaXZlVGltZXJJZF8gPSBzZXRUaW1lb3V0KHRoaXMuX2tlZXBBbGl2ZS5iaW5kKHRoaXMpLCB0aW1lb3V0KTtcbiAgICB9O1xuICAgIFNpZ25hbGluZy5wcm90b3R5cGUuX2NhbmNlbEtlZXBBbGl2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMua2VlcEFsaXZlVGltZXJJZF8pIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmtlZXBBbGl2ZVRpbWVySWRfKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIFNpZ25hbGluZztcbn0oZXZlbnREaXNwYXRjaGVyXzFbXCJkZWZhdWx0XCJdKSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFNpZ25hbGluZztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIGV2ZW50RGlzcGF0Y2hlcl8xID0gcmVxdWlyZShcIi4vZXZlbnREaXNwYXRjaGVyXCIpO1xudmFyIFN1YnNjcmliZVN0cmVhbSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU3Vic2NyaWJlU3RyZWFtLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFN1YnNjcmliZVN0cmVhbShzaWduYWxpbmcsIHBjLCBzdWJzY3JpYmVTdHJlYW1JZCwgcHVibGlzaFN0cmVhbUlkLCBtZWRpYVN0cmVhbSkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5zaWduYWxpbmdfID0gc2lnbmFsaW5nO1xuICAgICAgICBfdGhpcy5zaWduYWxpbmdfLmFkZEV2ZW50TGlzdGVuZXIoXCJvbnNpZ25hbGluZ1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IEpTT04ucGFyc2UoZSk7XG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLnR5cGUgPT09IFwicHVibGlzaE11dGVPclVubXV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi5kYXRhLnB1Ymxpc2hTdHJlYW1JZCA9PT0gX3RoaXMucHVibGlzaFN0cmVhbUlkXykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnRUeXBlID0gbm90aWZpY2F0aW9uLmRhdGEubXV0ZWQgPyAnbXV0ZScgOiAndW5tdXRlJztcbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50LmNhbGwoX3RoaXMsIGV2ZW50VHlwZSwgbm90aWZpY2F0aW9uLmRhdGEudHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgX3RoaXMuc2lnbmFsaW5nXy5hZGRFdmVudExpc3RlbmVyKFwib25zaWduYWxpbmdcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSBKU09OLnBhcnNlKGUpO1xuICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi50eXBlID09PSBcInN0cmVhbVJlbW92ZWRcIikge1xuICAgICAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24uZGF0YS5wdWJsaXNoU3RyZWFtSWQgPT09IF90aGlzLnB1Ymxpc2hTdHJlYW1JZF8pIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50LmNhbGwoX3RoaXMsIFwiZW5kZWRcIiwgX3RoaXMuc3Vic2NyaWJlU3RyZWFtSWRfKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5wY18gPSBwYztcbiAgICAgICAgX3RoaXMuc3Vic2NyaWJlU3RyZWFtSWRfID0gc3Vic2NyaWJlU3RyZWFtSWQ7XG4gICAgICAgIF90aGlzLnB1Ymxpc2hTdHJlYW1JZF8gPSBwdWJsaXNoU3RyZWFtSWQ7XG4gICAgICAgIF90aGlzLm1lZGlhU3RyZWFtXyA9IG1lZGlhU3RyZWFtO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFN1YnNjcmliZVN0cmVhbS5wcm90b3R5cGUuaWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZVN0cmVhbUlkXztcbiAgICB9O1xuICAgIFN1YnNjcmliZVN0cmVhbS5wcm90b3R5cGUubWVkaWFTdHJlYW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lZGlhU3RyZWFtXztcbiAgICB9O1xuICAgIFN1YnNjcmliZVN0cmVhbS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBjXykge1xuICAgICAgICAgICAgdGhpcy5wY18uY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMucGNfID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaWJlU3RyZWFtLnByb3RvdHlwZS5tdXRlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09IFwiYXVkaW9cIikge1xuICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uZ2V0QXVkaW9UcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSBcInZpZGVvXCIpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmdldFZpZGVvVHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgXCJJbnZhbGlkIHR5cGVcIjtcbiAgICB9O1xuICAgIFN1YnNjcmliZVN0cmVhbS5wcm90b3R5cGUudW5tdXRlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09IFwiYXVkaW9cIikge1xuICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uZ2V0QXVkaW9UcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09IFwidmlkZW9cIikge1xuICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uZ2V0VmlkZW9UcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IFwiSW52YWxpZCB0eXBlXCI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUlRDUGVlckNvbm5lY3Rpb24vZ2V0U3RhdHNcbiAgICAgKi9cbiAgICBTdWJzY3JpYmVTdHJlYW0ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGNfKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCB0aGlzLnBjXy5nZXRTdGF0cygpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiUGVlckNvbm5lY3Rpb24gaXMgbnVsbFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gU3Vic2NyaWJlU3RyZWFtO1xufShldmVudERpc3BhdGNoZXJfMVtcImRlZmF1bHRcIl0pKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gU3Vic2NyaWJlU3RyZWFtO1xuO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuQ2xpZW50ID0gZXhwb3J0cy5TdWJzY3JpYmVTdHJlYW0gPSBleHBvcnRzLlB1Ymxpc2hlU3RyZWFtID0gZXhwb3J0cy5TaWduYWxpbmcgPSBleHBvcnRzLkV2ZW50RGlzcGF0Y2hlciA9IGV4cG9ydHMuRGV2aWNlRW51bWVyYXRvciA9IGV4cG9ydHMuRGV2aWNlID0gdm9pZCAwO1xudmFyIGRldmljZV8xID0gcmVxdWlyZShcIi4vZGV2aWNlXCIpO1xuZXhwb3J0cy5EZXZpY2UgPSBkZXZpY2VfMVtcImRlZmF1bHRcIl07XG52YXIgZGV2aWNlRW51bWVyYXRvcl8xID0gcmVxdWlyZShcIi4vZGV2aWNlRW51bWVyYXRvclwiKTtcbmV4cG9ydHMuRGV2aWNlRW51bWVyYXRvciA9IGRldmljZUVudW1lcmF0b3JfMVtcImRlZmF1bHRcIl07XG52YXIgZXZlbnREaXNwYXRjaGVyXzEgPSByZXF1aXJlKFwiLi9ldmVudERpc3BhdGNoZXJcIik7XG5leHBvcnRzLkV2ZW50RGlzcGF0Y2hlciA9IGV2ZW50RGlzcGF0Y2hlcl8xW1wiZGVmYXVsdFwiXTtcbnZhciBzaWduYWxpbmdfMSA9IHJlcXVpcmUoXCIuL3NpZ25hbGluZ1wiKTtcbmV4cG9ydHMuU2lnbmFsaW5nID0gc2lnbmFsaW5nXzFbXCJkZWZhdWx0XCJdO1xudmFyIHB1Ymxpc2hlU3RyZWFtXzEgPSByZXF1aXJlKFwiLi9wdWJsaXNoZVN0cmVhbVwiKTtcbmV4cG9ydHMuUHVibGlzaGVTdHJlYW0gPSBwdWJsaXNoZVN0cmVhbV8xW1wiZGVmYXVsdFwiXTtcbnZhciBzdWJzY3JpYmVTdHJlYW1fMSA9IHJlcXVpcmUoXCIuL3N1YnNjcmliZVN0cmVhbVwiKTtcbmV4cG9ydHMuU3Vic2NyaWJlU3RyZWFtID0gc3Vic2NyaWJlU3RyZWFtXzFbXCJkZWZhdWx0XCJdO1xudmFyIGNsaWVudF8xID0gcmVxdWlyZShcIi4vY2xpZW50XCIpO1xuZXhwb3J0cy5DbGllbnQgPSBjbGllbnRfMVtcImRlZmF1bHRcIl07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=