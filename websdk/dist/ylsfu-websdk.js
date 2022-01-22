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
            var mediaStream, pc, audioTransceiverInit, videoTransceiverInit, offer, request, res, answerSdp, streamId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mediaStream = device.mediaStream();
                        pc = new RTCPeerConnection({ bundlePolicy: "max-bundle", rtcpMuxPolicy: "require" });
                        audioTransceiverInit = {
                            direction: 'sendonly',
                            sendEncodings: [{ rid: 'q', active: true, maxBitrate: 64000 }],
                            streams: [mediaStream]
                        };
                        if (audioRtpEncodingParameters !== null)
                            audioTransceiverInit.sendEncodings = audioRtpEncodingParameters;
                        videoTransceiverInit = {
                            direction: 'sendonly',
                            sendEncodings: [{ rid: 'q', active: true, maxBitrate: 200000 }],
                            streams: [mediaStream]
                        };
                        if (videoRtpEncodingParameters !== null)
                            videoTransceiverInit.sendEncodings = videoRtpEncodingParameters;
                        if (mediaStream.getAudioTracks().length >
                            0) {
                            pc.addTransceiver(mediaStream.getAudioTracks()[0], {
                                direction: 'sendonly',
                                sendEncodings: [{ rid: 'q', active: true, maxBitrate: 64000 }],
                                streams: [mediaStream]
                            });
                        }
                        if (mediaStream.getVideoTracks().length >
                            0) {
                            pc.addTransceiver(mediaStream.getVideoTracks()[0], {
                                direction: 'sendonly',
                                sendEncodings: [{ rid: 'q', active: true, maxBitrate: 200000 }],
                                streams: [mediaStream]
                            });
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
                        //answerSdp.sdp = res.answer;
                        //answerSdp.type = 'answer';
                        return [4 /*yield*/, pc.setRemoteDescription(answerSdp)];
                    case 4:
                        //answerSdp.sdp = res.answer;
                        //answerSdp.type = 'answer';
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
        this.events = {};
    }
    EventDispatcher.prototype.addEventListener = function (event, callback) {
        if (typeof callback !== 'function') {
            console.error("The listener callback must be a function, the given type is ".concat(typeof callback));
            return false;
        }
        if (typeof event !== 'string') {
            console.error("The event name must be a string, the given type is ".concat(typeof event));
            return false;
        }
        if (this.events[event] === undefined) {
            this.events[event] = {
                listeners: []
            };
        }
        this.events[event].listeners.push(callback);
    };
    EventDispatcher.prototype.removeEventListener = function (event, callback) {
        if (this.events[event] === undefined) {
            console.error("This event: ".concat(event, " does not exist"));
            return false;
        }
        this.events[event].listeners = this.events[event].listeners.filter(function (listener) {
            return listener.toString() !== callback.toString();
        });
    };
    EventDispatcher.prototype.dispatchEvent = function (event, details) {
        if (this.events[event] === undefined) {
            return false;
        }
        this.events[event].listeners.forEach(function (listener) {
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
        _this.promisePool = {};
        _this.wss = null;
        _this.keepAliveTimerId = undefined;
        return _this;
    }
    Signaling.prototype.open = function (url) {
        var _this = this;
        var classThis = this;
        return new Promise(function (resolve, reject) {
            _this.wss = new WebSocket(url);
            _this.wss.onopen = function (e) {
                resolve();
                classThis._keepAlive();
            };
            _this.wss.onerror = function (e) {
                reject(e);
            };
            _this.wss.onclose = function (e) {
                var notification = { type: "signalingDisconnected" };
                _super.prototype.dispatchEvent.call(_this, "onsignaling", JSON.stringify(notification));
            };
            _this.wss.onmessage = function (e) {
                var data = JSON.parse(e.data);
                if (data.transactionId === undefined) {
                    _super.prototype.dispatchEvent.call(_this, "onsignaling", e.data);
                }
                else {
                    if (_this.promisePool.hasOwnProperty(data.transactionId)) {
                        var transactionId = data.transactionId;
                        var req = _this.promisePool[data.transactionId];
                        delete data.transactionId;
                        req.resolve(data);
                        delete _this.promisePool[transactionId];
                    }
                }
            };
        });
    };
    Signaling.prototype.close = function () {
        this._cancelKeepAlive();
        if (this.wss != null)
            this.wss.close();
        this.wss = null;
    };
    Signaling.prototype.send = function (msg) {
        this.wss.send(msg);
    };
    Signaling.prototype.sendRequest = function (msg) {
        var _this = this;
        var transactionId = '';
        while (true) {
            transactionId = Math.round(Math.random() * 1000000000000000000) + '';
            if (!this.promisePool.hasOwnProperty(transactionId))
                break;
        }
        msg.transactionId = transactionId;
        return new Promise(function (resolve, reject) {
            _this.promisePool[msg.transactionId] = {
                resolve: resolve,
                reject: reject
            };
            _this.wss.send(JSON.stringify(msg));
        });
    };
    Signaling.prototype._keepAlive = function () {
        var timeout = 1000;
        if (this.wss.readyState == this.wss.OPEN) {
            var request = { action: "keepAlive" };
            this.wss.send(JSON.stringify(request));
        }
        this.keepAliveTimerId = setTimeout(this._keepAlive.bind(this), timeout);
    };
    Signaling.prototype._cancelKeepAlive = function () {
        if (this.keepAliveTimerId) {
            clearTimeout(this.keepAliveTimerId);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ZUFBZSxtQkFBTyxDQUFDLGlDQUFVO0FBQ2pDLGNBQWMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ZbHNmdS93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vWWxzZnUvLi9zcmMvY2xpZW50LnRzIiwid2VicGFjazovL1lsc2Z1Ly4vc3JjL2RldmljZS50cyIsIndlYnBhY2s6Ly9ZbHNmdS8uL3NyYy9kZXZpY2VFbnVtZXJhdG9yLnRzIiwid2VicGFjazovL1lsc2Z1Ly4vc3JjL2V2ZW50RGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly9ZbHNmdS8uL3NyYy9wdWJsaXNoZVN0cmVhbS50cyIsIndlYnBhY2s6Ly9ZbHNmdS8uL3NyYy9zaWduYWxpbmcudHMiLCJ3ZWJwYWNrOi8vWWxzZnUvLi9zcmMvc3Vic2NyaWJlU3RyZWFtLnRzIiwid2VicGFjazovL1lsc2Z1L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1lsc2Z1Ly4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIllsc2Z1XCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIllsc2Z1XCJdID0gZmFjdG9yeSgpO1xufSkoc2VsZiwgZnVuY3Rpb24oKSB7XG5yZXR1cm4gIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgZXZlbnREaXNwYXRjaGVyXzEgPSByZXF1aXJlKFwiLi9ldmVudERpc3BhdGNoZXJcIik7XG52YXIgc2lnbmFsaW5nXzEgPSByZXF1aXJlKFwiLi9zaWduYWxpbmdcIik7XG52YXIgcHVibGlzaGVTdHJlYW1fMSA9IHJlcXVpcmUoXCIuL3B1Ymxpc2hlU3RyZWFtXCIpO1xudmFyIHN1YnNjcmliZVN0cmVhbV8xID0gcmVxdWlyZShcIi4vc3Vic2NyaWJlU3RyZWFtXCIpO1xudmFyIENsaWVudCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoQ2xpZW50LCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIENsaWVudChzaWduYWxsaW5nU2VydmVySXAsIHNpZ25hbGxpbmdTZXJ2ZXJQb3J0KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnNpZ25hbGluZ18gPSBuZXcgc2lnbmFsaW5nXzFbXCJkZWZhdWx0XCJdKCk7XG4gICAgICAgIF90aGlzLnNpZ25hbGxpbmdTZXJ2ZXJJcF8gPSBzaWduYWxsaW5nU2VydmVySXA7XG4gICAgICAgIF90aGlzLnNpZ25hbGxpbmdTZXJ2ZXJQb3J0XyA9IHNpZ25hbGxpbmdTZXJ2ZXJQb3J0O1xuICAgICAgICBfdGhpcy5wYXJ0aWNpcGFudElkXyA9ICcnO1xuICAgICAgICBfdGhpcy5qb2luZWRfID0gZmFsc2U7XG4gICAgICAgIF90aGlzLm1lZGlhU3RyZWFtXyA9IG51bGw7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgQ2xpZW50LnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gKHJvb21JZCwgcGFydGljaXBhbnRJZCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2lnbmFsaW5nVXJsLCByZXF1ZXN0LCByZXM7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuam9pbmVkXylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkFscmVhZHkgam9pbmVkIG1lZXRpbmcuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduYWxpbmdVcmwgPSBcIndzczovL1wiICsgdGhpcy5zaWduYWxsaW5nU2VydmVySXBfICsgXCI6XCIgKyB0aGlzLnNpZ25hbGxpbmdTZXJ2ZXJQb3J0XztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2lnbmFsaW5nXy5hZGRFdmVudExpc3RlbmVyKFwib25zaWduYWxpbmdcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gSlNPTi5wYXJzZShlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLnR5cGUgPT09IFwic3RyZWFtQWRkZWRcIiB8fCBub3RpZmljYXRpb24udHlwZSA9PT0gXCJwYXJ0aWNpcGFudEpvaW5lZFwiIHx8IG5vdGlmaWNhdGlvbi50eXBlID09PSBcInBhcnRpY2lwYW50TGVmdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQuY2FsbChfdGhpcywgbm90aWZpY2F0aW9uLnR5cGUsIG5vdGlmaWNhdGlvbi5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLnR5cGUgPT09IFwic2lnbmFsaW5nRGlzY29ubmVjdGVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmxlYXZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMuc2lnbmFsaW5nXy5vcGVuKHNpZ25hbGluZ1VybCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0geyBhY3Rpb246IFwiam9pblwiLCByb29tSWQ6IHJvb21JZCwgcGFydGljaXBhbnRJZDogcGFydGljaXBhbnRJZCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5zaWduYWxpbmdfLnNlbmRSZXF1ZXN0KHJlcXVlc3QpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5lcnJvciAhPSB1bmRlZmluZWQgJiYgcmVzLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiSm9pbiByb29tIGZhaWxlZC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRJZF8gPSBwYXJ0aWNpcGFudElkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5qb2luZWRfID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCByZXMucm9vbUluZm9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1Ymxpc2ggc3RyZWFtLlxuICAgICAqIEBwYXJhbSB7Kn0gZGV2aWNlIERldmljZVxuICAgICAqIEBwYXJhbSB7Kn0gdmlkZW9SdHBFbmNvZGluZ1BhcmFtZXRlcnMgUlRDUnRwRW5jb2RpbmdQYXJhbWV0ZXJzIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SVENSdHBFbmNvZGluZ1BhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0geyp9IGF1ZGlvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzIFJUQ1J0cEVuY29kaW5nUGFyYW1ldGVycyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUlRDUnRwRW5jb2RpbmdQYXJhbWV0ZXJzXG4gICAgICovXG4gICAgQ2xpZW50LnByb3RvdHlwZS5wdWJsaXNoID0gZnVuY3Rpb24gKGRldmljZSwgYXVkaW9SdHBFbmNvZGluZ1BhcmFtZXRlcnMsIHZpZGVvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtZWRpYVN0cmVhbSwgcGMsIGF1ZGlvVHJhbnNjZWl2ZXJJbml0LCB2aWRlb1RyYW5zY2VpdmVySW5pdCwgb2ZmZXIsIHJlcXVlc3QsIHJlcywgYW5zd2VyU2RwLCBzdHJlYW1JZDtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lZGlhU3RyZWFtID0gZGV2aWNlLm1lZGlhU3RyZWFtKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYyA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbih7IGJ1bmRsZVBvbGljeTogXCJtYXgtYnVuZGxlXCIsIHJ0Y3BNdXhQb2xpY3k6IFwicmVxdWlyZVwiIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFuc2NlaXZlckluaXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAnc2VuZG9ubHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRFbmNvZGluZ3M6IFt7IHJpZDogJ3EnLCBhY3RpdmU6IHRydWUsIG1heEJpdHJhdGU6IDY0MDAwIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbXM6IFttZWRpYVN0cmVhbV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXVkaW9SdHBFbmNvZGluZ1BhcmFtZXRlcnMgIT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFuc2NlaXZlckluaXQuc2VuZEVuY29kaW5ncyA9IGF1ZGlvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFuc2NlaXZlckluaXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAnc2VuZG9ubHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRFbmNvZGluZ3M6IFt7IHJpZDogJ3EnLCBhY3RpdmU6IHRydWUsIG1heEJpdHJhdGU6IDIwMDAwMCB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1zOiBbbWVkaWFTdHJlYW1dXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZpZGVvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzICE9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvVHJhbnNjZWl2ZXJJbml0LnNlbmRFbmNvZGluZ3MgPSB2aWRlb1J0cEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZWRpYVN0cmVhbS5nZXRBdWRpb1RyYWNrcygpLmxlbmd0aCA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjLmFkZFRyYW5zY2VpdmVyKG1lZGlhU3RyZWFtLmdldEF1ZGlvVHJhY2tzKClbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAnc2VuZG9ubHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdzOiBbeyByaWQ6ICdxJywgYWN0aXZlOiB0cnVlLCBtYXhCaXRyYXRlOiA2NDAwMCB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtczogW21lZGlhU3RyZWFtXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lZGlhU3RyZWFtLmdldFZpZGVvVHJhY2tzKCkubGVuZ3RoID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGMuYWRkVHJhbnNjZWl2ZXIobWVkaWFTdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICdzZW5kb25seScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRFbmNvZGluZ3M6IFt7IHJpZDogJ3EnLCBhY3RpdmU6IHRydWUsIG1heEJpdHJhdGU6IDIwMDAwMCB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtczogW21lZGlhU3RyZWFtXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgcGMuY3JlYXRlT2ZmZXIoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgcGMuc2V0TG9jYWxEZXNjcmlwdGlvbihvZmZlcildO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0geyBhY3Rpb246IFwicHVibGlzaFwiLCBvZmZlcjogb2ZmZXIuc2RwIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnNpZ25hbGluZ18uc2VuZFJlcXVlc3QocmVxdWVzdCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiUHVibGlzaCBmYWlsZWQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXJTZHAgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHsgc2RwOiByZXMuYW5zd2VyLCB0eXBlOiAnYW5zd2VyJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbUlkID0gcmVzLnN0cmVhbUlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgcGMuc2V0UmVtb3RlRGVzY3JpcHRpb24oYW5zd2VyU2RwKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCBuZXcgcHVibGlzaGVTdHJlYW1fMVtcImRlZmF1bHRcIl0obWVkaWFTdHJlYW0sIHN0cmVhbUlkLCBwYywgdGhpcy5zaWduYWxpbmdfKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgQ2xpZW50LnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiAocmVtb3RlU3RyZWFtKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBwYywgb2ZmZXIsIHJlcXVlc3QsIHJlcywgYW5zd2VyU2RwLCBzdWJzY3JpYmVTdHJlYW1JZCwgcHVibGlzaFN0cmVhbUlkO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKHsgYnVuZGxlUG9saWN5OiBcIm1heC1idW5kbGVcIiwgcnRjcE11eFBvbGljeTogXCJyZXF1aXJlXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3RlU3RyZWFtLmhhc0F1ZGlvKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjLmFkZFRyYW5zY2VpdmVyKFwiYXVkaW9cIiwgeyBkaXJlY3Rpb246IFwicmVjdm9ubHlcIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdGVTdHJlYW0uaGFzVmlkZW8pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGMuYWRkVHJhbnNjZWl2ZXIoXCJ2aWRlb1wiLCB7IGRpcmVjdGlvbjogXCJyZWN2b25seVwiIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGMub250cmFjayA9IHRoaXMuX29udHJhY2suYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLmNyZWF0ZU9mZmVyKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlciA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLnNldExvY2FsRGVzY3JpcHRpb24ob2ZmZXIpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHsgYWN0aW9uOiBcInN1YnNjcmliZVwiLCBzdHJlYW1JZDogcmVtb3RlU3RyZWFtLnB1Ymxpc2hTdHJlYW1JZCwgcGFydGljaXBhbnRJZDogcmVtb3RlU3RyZWFtLnBhcnRpY2lwYW50SWQsIG9mZmVyOiBvZmZlci5zZHAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMuc2lnbmFsaW5nXy5zZW5kUmVxdWVzdChyZXF1ZXN0KV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMuZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDb25uZWN0IGZhaWxlZC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlclNkcCA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oeyBzZHA6IHJlcy5hbnN3ZXIsIHR5cGU6ICdhbnN3ZXInIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9hbnN3ZXJTZHAuc2RwID0gcmVzLmFuc3dlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYW5zd2VyU2RwLnR5cGUgPSAnYW5zd2VyJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLnNldFJlbW90ZURlc2NyaXB0aW9uKGFuc3dlclNkcCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2Fuc3dlclNkcC5zZHAgPSByZXMuYW5zd2VyO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9hbnN3ZXJTZHAudHlwZSA9ICdhbnN3ZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlU3RyZWFtSWQgPSByZXMuc3RyZWFtSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoU3RyZWFtSWQgPSByZW1vdGVTdHJlYW0ucHVibGlzaFN0cmVhbUlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIG5ldyBzdWJzY3JpYmVTdHJlYW1fMVtcImRlZmF1bHRcIl0odGhpcy5zaWduYWxpbmdfLCBwYywgc3Vic2NyaWJlU3RyZWFtSWQsIHB1Ymxpc2hTdHJlYW1JZCwgdGhpcy5tZWRpYVN0cmVhbV8pXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBDbGllbnQucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5qb2luZWRfKSB7XG4gICAgICAgICAgICB0aGlzLmpvaW5lZF8gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsaW5nXy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBDbGllbnQucHJvdG90eXBlLl9vbnRyYWNrID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uYWRkVHJhY2soZS50cmFjayk7XG4gICAgfTtcbiAgICByZXR1cm4gQ2xpZW50O1xufShldmVudERpc3BhdGNoZXJfMVtcImRlZmF1bHRcIl0pKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gQ2xpZW50O1xuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBEZXZpY2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRGV2aWNlKG1lZGlhU3RyZWFtKSB7XG4gICAgICAgIHRoaXMubWVkaWFTdHJlYW1fID0gbWVkaWFTdHJlYW07XG4gICAgfVxuICAgIC8vIGNvbnN0cmFpbnRzIDogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL01lZGlhU3RyZWFtQ29uc3RyYWludHNcbiAgICBEZXZpY2UuQ3JlYXRlRGV2aWNlID0gZnVuY3Rpb24gKHR5cGUsIGNvbnN0cmFpbnRzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtZWRpYVN0cmVhbTtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKHR5cGUgPT09IFwiY2FtZXJhXCIpKSByZXR1cm4gWzMgLypicmVhayovLCAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lZGlhU3RyZWFtID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKHR5cGUgPT09IFwic2NyZWVuU2hhcmVcIikpIHJldHVybiBbMyAvKmJyZWFrKi8sIDRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXREaXNwbGF5TWVkaWEoY29uc3RyYWludHMpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgbWVkaWFTdHJlYW0gPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA1XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OiB0aHJvdyBcIkludmFsaWQgdHlwZVwiO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDU6IHJldHVybiBbMiAvKnJldHVybiovLCBuZXcgRGV2aWNlKG1lZGlhU3RyZWFtKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgRGV2aWNlLnByb3RvdHlwZS5tZWRpYVN0cmVhbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVkaWFTdHJlYW1fO1xuICAgIH07XG4gICAgcmV0dXJuIERldmljZTtcbn0oKSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IERldmljZTtcbjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgRGV2aWNlRW51bWVyYXRvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZXZpY2VFbnVtZXJhdG9yKCkge1xuICAgIH1cbiAgICBEZXZpY2VFbnVtZXJhdG9yLmVudW1lcmF0ZUFsbERldmljZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZXZpY2VzO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gWzQgLyp5aWVsZCovLCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZXMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgZGV2aWNlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgRGV2aWNlRW51bWVyYXRvci5lbnVtZXJhdGVDYW1lcmFzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGV2aWNlcztcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIFs0IC8qeWllbGQqLywgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcInZpZGVvaW5wdXRcIiA9PT0gZS5raW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBEZXZpY2VFbnVtZXJhdG9yLmVudW1lcmF0ZU1pY3JvcGhvbmVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGV2aWNlcztcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIFs0IC8qeWllbGQqLywgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcImF1ZGlvaW5wdXRcIiA9PT0gZS5raW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBEZXZpY2VFbnVtZXJhdG9yLmVudW1lcmF0ZVNwZWFrZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGV2aWNlcztcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIFs0IC8qeWllbGQqLywgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcImF1ZGlvb3V0cHV0XCIgPT09IGUua2luZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIERldmljZUVudW1lcmF0b3I7XG59KCkpO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBEZXZpY2VFbnVtZXJhdG9yO1xuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIEV2ZW50RGlzcGF0Y2hlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFdmVudERpc3BhdGNoZXIoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XG4gICAgfVxuICAgIEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBsaXN0ZW5lciBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24sIHRoZSBnaXZlbiB0eXBlIGlzIFwiLmNvbmNhdCh0eXBlb2YgY2FsbGJhY2spKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGV2ZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBldmVudCBuYW1lIG11c3QgYmUgYSBzdHJpbmcsIHRoZSBnaXZlbiB0eXBlIGlzIFwiLmNvbmNhdCh0eXBlb2YgZXZlbnQpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ldmVudHNbZXZlbnRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnM6IFtdXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XS5saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgfTtcbiAgICBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c1tldmVudF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoaXMgZXZlbnQ6IFwiLmNvbmNhdChldmVudCwgXCIgZG9lcyBub3QgZXhpc3RcIikpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XS5saXN0ZW5lcnMgPSB0aGlzLmV2ZW50c1tldmVudF0ubGlzdGVuZXJzLmZpbHRlcihmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBsaXN0ZW5lci50b1N0cmluZygpICE9PSBjYWxsYmFjay50b1N0cmluZygpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIChldmVudCwgZGV0YWlscykge1xuICAgICAgICBpZiAodGhpcy5ldmVudHNbZXZlbnRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0ubGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcihkZXRhaWxzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gRXZlbnREaXNwYXRjaGVyO1xufSgpKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRXZlbnREaXNwYXRjaGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBQdWJsaXNoZVN0cmVhbSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQdWJsaXNoZVN0cmVhbShtZWRpYVN0cmVhbSwgc3RyZWFtSWQsIHBjLCBzaWduYWxpbmcpIHtcbiAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8gPSBtZWRpYVN0cmVhbTtcbiAgICAgICAgdGhpcy5zdHJlYW1JZF8gPSBzdHJlYW1JZDtcbiAgICAgICAgdGhpcy5wY18gPSBwYztcbiAgICAgICAgdGhpcy5zaWduYWxpbmdfID0gc2lnbmFsaW5nO1xuICAgIH1cbiAgICBQdWJsaXNoZVN0cmVhbS5wcm90b3R5cGUuSWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0cmVhbUlkXztcbiAgICB9O1xuICAgIFB1Ymxpc2hlU3RyZWFtLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGNfKSB7XG4gICAgICAgICAgICB0aGlzLnBjXy5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5wY18gPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBQdWJsaXNoZVN0cmVhbS5wcm90b3R5cGUubXV0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIGlmICh0eXBlID09PSBcImF1ZGlvXCIpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHsgYWN0aW9uOiBcInB1Ymxpc2hfbXV0ZU9yVW5tdXRlXCIsIHN0cmVhbUlkOiB0aGlzLnN0cmVhbUlkXywgbXV0ZWQ6IHRydWUsIHR5cGU6IFwiYXVkaW9cIiB9O1xuICAgICAgICAgICAgdGhpcy5zaWduYWxpbmdfLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09IFwidmlkZW9cIikge1xuICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uZ2V0VmlkZW9UcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0geyBhY3Rpb246IFwicHVibGlzaF9tdXRlT3JVbm11dGVcIiwgc3RyZWFtSWQ6IHRoaXMuc3RyZWFtSWRfLCBtdXRlZDogdHJ1ZSwgdHlwZTogXCJ2aWRlb1wiIH07XG4gICAgICAgICAgICB0aGlzLnNpZ25hbGluZ18uc2VuZChKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgXCJJbnZhbGlkIHR5cGVcIjtcbiAgICB9O1xuICAgIFB1Ymxpc2hlU3RyZWFtLnByb3RvdHlwZS51bm11dGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICBpZiAodHlwZSA9PT0gXCJhdWRpb1wiKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5nZXRBdWRpb1RyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHsgYWN0aW9uOiBcInB1Ymxpc2hfbXV0ZU9yVW5tdXRlXCIsIHN0cmVhbUlkOiB0aGlzLnN0cmVhbUlkXywgbXV0ZWQ6IGZhbHNlLCB0eXBlOiBcImF1ZGlvXCIgfTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsaW5nXy5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSBcInZpZGVvXCIpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmdldFZpZGVvVHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0geyBhY3Rpb246IFwicHVibGlzaF9tdXRlT3JVbm11dGVcIiwgc3RyZWFtSWQ6IHRoaXMuc3RyZWFtSWRfLCBtdXRlZDogZmFsc2UsIHR5cGU6IFwidmlkZW9cIiB9O1xuICAgICAgICAgICAgdGhpcy5zaWduYWxpbmdfLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IFwiSW52YWxpZCB0eXBlXCI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUlRDUGVlckNvbm5lY3Rpb24vZ2V0U3RhdHNcbiAgICAgKi9cbiAgICBQdWJsaXNoZVN0cmVhbS5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wY18pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIHRoaXMucGNfLmdldFN0YXRzKCldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJQZWVyQ29ubmVjdGlvbiBpcyBudWxsXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBQdWJsaXNoZVN0cmVhbTtcbn0oKSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFB1Ymxpc2hlU3RyZWFtO1xuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBldmVudERpc3BhdGNoZXJfMSA9IHJlcXVpcmUoXCIuL2V2ZW50RGlzcGF0Y2hlclwiKTtcbnZhciBTaWduYWxpbmcgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFNpZ25hbGluZywgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTaWduYWxpbmcoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnByb21pc2VQb29sID0ge307XG4gICAgICAgIF90aGlzLndzcyA9IG51bGw7XG4gICAgICAgIF90aGlzLmtlZXBBbGl2ZVRpbWVySWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgU2lnbmFsaW5nLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgY2xhc3NUaGlzID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIF90aGlzLndzcyA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIF90aGlzLndzcy5vbm9wZW4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICBjbGFzc1RoaXMuX2tlZXBBbGl2ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLndzcy5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXMud3NzLm9uY2xvc2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSB7IHR5cGU6IFwic2lnbmFsaW5nRGlzY29ubmVjdGVkXCIgfTtcbiAgICAgICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQuY2FsbChfdGhpcywgXCJvbnNpZ25hbGluZ1wiLCBKU09OLnN0cmluZ2lmeShub3RpZmljYXRpb24pKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy53c3Mub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS50cmFuc2FjdGlvbklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50LmNhbGwoX3RoaXMsIFwib25zaWduYWxpbmdcIiwgZS5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5wcm9taXNlUG9vbC5oYXNPd25Qcm9wZXJ0eShkYXRhLnRyYW5zYWN0aW9uSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNhY3Rpb25JZCA9IGRhdGEudHJhbnNhY3Rpb25JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBfdGhpcy5wcm9taXNlUG9vbFtkYXRhLnRyYW5zYWN0aW9uSWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEudHJhbnNhY3Rpb25JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIF90aGlzLnByb21pc2VQb29sW3RyYW5zYWN0aW9uSWRdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTaWduYWxpbmcucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jYW5jZWxLZWVwQWxpdmUoKTtcbiAgICAgICAgaWYgKHRoaXMud3NzICE9IG51bGwpXG4gICAgICAgICAgICB0aGlzLndzcy5jbG9zZSgpO1xuICAgICAgICB0aGlzLndzcyA9IG51bGw7XG4gICAgfTtcbiAgICBTaWduYWxpbmcucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHRoaXMud3NzLnNlbmQobXNnKTtcbiAgICB9O1xuICAgIFNpZ25hbGluZy5wcm90b3R5cGUuc2VuZFJlcXVlc3QgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciB0cmFuc2FjdGlvbklkID0gJyc7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cmFuc2FjdGlvbklkID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwMDAwMDAwMDAwMCkgKyAnJztcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9taXNlUG9vbC5oYXNPd25Qcm9wZXJ0eSh0cmFuc2FjdGlvbklkKSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBtc2cudHJhbnNhY3Rpb25JZCA9IHRyYW5zYWN0aW9uSWQ7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBfdGhpcy5wcm9taXNlUG9vbFttc2cudHJhbnNhY3Rpb25JZF0gPSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICByZWplY3Q6IHJlamVjdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLndzcy5zZW5kKEpTT04uc3RyaW5naWZ5KG1zZykpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFNpZ25hbGluZy5wcm90b3R5cGUuX2tlZXBBbGl2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRpbWVvdXQgPSAxMDAwO1xuICAgICAgICBpZiAodGhpcy53c3MucmVhZHlTdGF0ZSA9PSB0aGlzLndzcy5PUEVOKSB7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHsgYWN0aW9uOiBcImtlZXBBbGl2ZVwiIH07XG4gICAgICAgICAgICB0aGlzLndzcy5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmtlZXBBbGl2ZVRpbWVySWQgPSBzZXRUaW1lb3V0KHRoaXMuX2tlZXBBbGl2ZS5iaW5kKHRoaXMpLCB0aW1lb3V0KTtcbiAgICB9O1xuICAgIFNpZ25hbGluZy5wcm90b3R5cGUuX2NhbmNlbEtlZXBBbGl2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMua2VlcEFsaXZlVGltZXJJZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMua2VlcEFsaXZlVGltZXJJZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBTaWduYWxpbmc7XG59KGV2ZW50RGlzcGF0Y2hlcl8xW1wiZGVmYXVsdFwiXSkpO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTaWduYWxpbmc7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBldmVudERpc3BhdGNoZXJfMSA9IHJlcXVpcmUoXCIuL2V2ZW50RGlzcGF0Y2hlclwiKTtcbnZhciBTdWJzY3JpYmVTdHJlYW0gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFN1YnNjcmliZVN0cmVhbSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTdWJzY3JpYmVTdHJlYW0oc2lnbmFsaW5nLCBwYywgc3Vic2NyaWJlU3RyZWFtSWQsIHB1Ymxpc2hTdHJlYW1JZCwgbWVkaWFTdHJlYW0pIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuc2lnbmFsaW5nXyA9IHNpZ25hbGluZztcbiAgICAgICAgX3RoaXMuc2lnbmFsaW5nXy5hZGRFdmVudExpc3RlbmVyKFwib25zaWduYWxpbmdcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBub3RpZmljYXRpb24gPSBKU09OLnBhcnNlKGUpO1xuICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi50eXBlID09PSBcInB1Ymxpc2hNdXRlT3JVbm11dGVcIikge1xuICAgICAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24uZGF0YS5wdWJsaXNoU3RyZWFtSWQgPT09IF90aGlzLnB1Ymxpc2hTdHJlYW1JZF8pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50VHlwZSA9IG5vdGlmaWNhdGlvbi5kYXRhLm11dGVkID8gJ211dGUnIDogJ3VubXV0ZSc7XG4gICAgICAgICAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudC5jYWxsKF90aGlzLCBldmVudFR5cGUsIG5vdGlmaWNhdGlvbi5kYXRhLnR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIF90aGlzLnNpZ25hbGluZ18uYWRkRXZlbnRMaXN0ZW5lcihcIm9uc2lnbmFsaW5nXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gSlNPTi5wYXJzZShlKTtcbiAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24udHlwZSA9PT0gXCJzdHJlYW1SZW1vdmVkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLmRhdGEucHVibGlzaFN0cmVhbUlkID09PSBfdGhpcy5wdWJsaXNoU3RyZWFtSWRfKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudC5jYWxsKF90aGlzLCBcImVuZGVkXCIsIF90aGlzLnN1YnNjcmliZVN0cmVhbUlkXyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgX3RoaXMucGNfID0gcGM7XG4gICAgICAgIF90aGlzLnN1YnNjcmliZVN0cmVhbUlkXyA9IHN1YnNjcmliZVN0cmVhbUlkO1xuICAgICAgICBfdGhpcy5wdWJsaXNoU3RyZWFtSWRfID0gcHVibGlzaFN0cmVhbUlkO1xuICAgICAgICBfdGhpcy5tZWRpYVN0cmVhbV8gPSBtZWRpYVN0cmVhbTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBTdWJzY3JpYmVTdHJlYW0ucHJvdG90eXBlLmlkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmVTdHJlYW1JZF87XG4gICAgfTtcbiAgICBTdWJzY3JpYmVTdHJlYW0ucHJvdG90eXBlLm1lZGlhU3RyZWFtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZWRpYVN0cmVhbV87XG4gICAgfTtcbiAgICBTdWJzY3JpYmVTdHJlYW0ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wY18pIHtcbiAgICAgICAgICAgIHRoaXMucGNfLmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLnBjXyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN1YnNjcmliZVN0cmVhbS5wcm90b3R5cGUubXV0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIGlmICh0eXBlID09PSBcImF1ZGlvXCIpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gXCJ2aWRlb1wiKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5nZXRWaWRlb1RyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IFwiSW52YWxpZCB0eXBlXCI7XG4gICAgfTtcbiAgICBTdWJzY3JpYmVTdHJlYW0ucHJvdG90eXBlLnVubXV0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIGlmICh0eXBlID09PSBcImF1ZGlvXCIpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSBcInZpZGVvXCIpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmdldFZpZGVvVHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBcIkludmFsaWQgdHlwZVwiO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JUQ1BlZXJDb25uZWN0aW9uL2dldFN0YXRzXG4gICAgICovXG4gICAgU3Vic2NyaWJlU3RyZWFtLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBjXykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgdGhpcy5wY18uZ2V0U3RhdHMoKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlBlZXJDb25uZWN0aW9uIGlzIG51bGxcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIFN1YnNjcmliZVN0cmVhbTtcbn0oZXZlbnREaXNwYXRjaGVyXzFbXCJkZWZhdWx0XCJdKSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFN1YnNjcmliZVN0cmVhbTtcbjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLkNsaWVudCA9IGV4cG9ydHMuU3Vic2NyaWJlU3RyZWFtID0gZXhwb3J0cy5QdWJsaXNoZVN0cmVhbSA9IGV4cG9ydHMuU2lnbmFsaW5nID0gZXhwb3J0cy5FdmVudERpc3BhdGNoZXIgPSBleHBvcnRzLkRldmljZUVudW1lcmF0b3IgPSBleHBvcnRzLkRldmljZSA9IHZvaWQgMDtcbnZhciBkZXZpY2VfMSA9IHJlcXVpcmUoXCIuL2RldmljZVwiKTtcbmV4cG9ydHMuRGV2aWNlID0gZGV2aWNlXzFbXCJkZWZhdWx0XCJdO1xudmFyIGRldmljZUVudW1lcmF0b3JfMSA9IHJlcXVpcmUoXCIuL2RldmljZUVudW1lcmF0b3JcIik7XG5leHBvcnRzLkRldmljZUVudW1lcmF0b3IgPSBkZXZpY2VFbnVtZXJhdG9yXzFbXCJkZWZhdWx0XCJdO1xudmFyIGV2ZW50RGlzcGF0Y2hlcl8xID0gcmVxdWlyZShcIi4vZXZlbnREaXNwYXRjaGVyXCIpO1xuZXhwb3J0cy5FdmVudERpc3BhdGNoZXIgPSBldmVudERpc3BhdGNoZXJfMVtcImRlZmF1bHRcIl07XG52YXIgc2lnbmFsaW5nXzEgPSByZXF1aXJlKFwiLi9zaWduYWxpbmdcIik7XG5leHBvcnRzLlNpZ25hbGluZyA9IHNpZ25hbGluZ18xW1wiZGVmYXVsdFwiXTtcbnZhciBwdWJsaXNoZVN0cmVhbV8xID0gcmVxdWlyZShcIi4vcHVibGlzaGVTdHJlYW1cIik7XG5leHBvcnRzLlB1Ymxpc2hlU3RyZWFtID0gcHVibGlzaGVTdHJlYW1fMVtcImRlZmF1bHRcIl07XG52YXIgc3Vic2NyaWJlU3RyZWFtXzEgPSByZXF1aXJlKFwiLi9zdWJzY3JpYmVTdHJlYW1cIik7XG5leHBvcnRzLlN1YnNjcmliZVN0cmVhbSA9IHN1YnNjcmliZVN0cmVhbV8xW1wiZGVmYXVsdFwiXTtcbnZhciBjbGllbnRfMSA9IHJlcXVpcmUoXCIuL2NsaWVudFwiKTtcbmV4cG9ydHMuQ2xpZW50ID0gY2xpZW50XzFbXCJkZWZhdWx0XCJdO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9