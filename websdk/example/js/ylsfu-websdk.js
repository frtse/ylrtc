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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VTtBQUNqQyxjQUFjIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vWWxzZnUvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL1lsc2Z1Ly4vc3JjL2NsaWVudC50cyIsIndlYnBhY2s6Ly9ZbHNmdS8uL3NyYy9kZXZpY2UudHMiLCJ3ZWJwYWNrOi8vWWxzZnUvLi9zcmMvZGV2aWNlRW51bWVyYXRvci50cyIsIndlYnBhY2s6Ly9ZbHNmdS8uL3NyYy9ldmVudERpc3BhdGNoZXIudHMiLCJ3ZWJwYWNrOi8vWWxzZnUvLi9zcmMvcHVibGlzaGVTdHJlYW0udHMiLCJ3ZWJwYWNrOi8vWWxzZnUvLi9zcmMvc2lnbmFsaW5nLnRzIiwid2VicGFjazovL1lsc2Z1Ly4vc3JjL3N1YnNjcmliZVN0cmVhbS50cyIsIndlYnBhY2s6Ly9ZbHNmdS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ZbHNmdS8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJZbHNmdVwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJZbHNmdVwiXSA9IGZhY3RvcnkoKTtcbn0pKHNlbGYsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIGV2ZW50RGlzcGF0Y2hlcl8xID0gcmVxdWlyZShcIi4vZXZlbnREaXNwYXRjaGVyXCIpO1xudmFyIHNpZ25hbGluZ18xID0gcmVxdWlyZShcIi4vc2lnbmFsaW5nXCIpO1xudmFyIHB1Ymxpc2hlU3RyZWFtXzEgPSByZXF1aXJlKFwiLi9wdWJsaXNoZVN0cmVhbVwiKTtcbnZhciBzdWJzY3JpYmVTdHJlYW1fMSA9IHJlcXVpcmUoXCIuL3N1YnNjcmliZVN0cmVhbVwiKTtcbnZhciBDbGllbnQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKENsaWVudCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBDbGllbnQoc2lnbmFsbGluZ1NlcnZlcklwLCBzaWduYWxsaW5nU2VydmVyUG9ydCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5zaWduYWxpbmdfID0gbmV3IHNpZ25hbGluZ18xW1wiZGVmYXVsdFwiXSgpO1xuICAgICAgICBfdGhpcy5zaWduYWxsaW5nU2VydmVySXBfID0gc2lnbmFsbGluZ1NlcnZlcklwO1xuICAgICAgICBfdGhpcy5zaWduYWxsaW5nU2VydmVyUG9ydF8gPSBzaWduYWxsaW5nU2VydmVyUG9ydDtcbiAgICAgICAgX3RoaXMucGFydGljaXBhbnRJZF8gPSAnJztcbiAgICAgICAgX3RoaXMuam9pbmVkXyA9IGZhbHNlO1xuICAgICAgICBfdGhpcy5tZWRpYVN0cmVhbV8gPSBudWxsO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIENsaWVudC5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uIChyb29tSWQsIHBhcnRpY2lwYW50SWQpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNpZ25hbGluZ1VybCwgcmVxdWVzdCwgcmVzO1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmpvaW5lZF8pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJBbHJlYWR5IGpvaW5lZCBtZWV0aW5nLlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmFsaW5nVXJsID0gXCJ3c3M6Ly9cIiArIHRoaXMuc2lnbmFsbGluZ1NlcnZlcklwXyArIFwiOlwiICsgdGhpcy5zaWduYWxsaW5nU2VydmVyUG9ydF87XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNpZ25hbGluZ18uYWRkRXZlbnRMaXN0ZW5lcihcIm9uc2lnbmFsaW5nXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IEpTT04ucGFyc2UoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi50eXBlID09PSBcInN0cmVhbUFkZGVkXCIgfHwgbm90aWZpY2F0aW9uLnR5cGUgPT09IFwicGFydGljaXBhbnRKb2luZWRcIiB8fCBub3RpZmljYXRpb24udHlwZSA9PT0gXCJwYXJ0aWNpcGFudExlZnRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50LmNhbGwoX3RoaXMsIG5vdGlmaWNhdGlvbi50eXBlLCBub3RpZmljYXRpb24uZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi50eXBlID09PSBcInNpZ25hbGluZ0Rpc2Nvbm5lY3RlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5sZWF2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnNpZ25hbGluZ18ub3BlbihzaWduYWxpbmdVcmwpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHsgYWN0aW9uOiBcImpvaW5cIiwgcm9vbUlkOiByb29tSWQsIHBhcnRpY2lwYW50SWQ6IHBhcnRpY2lwYW50SWQgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMuc2lnbmFsaW5nXy5zZW5kUmVxdWVzdChyZXF1ZXN0KV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMuZXJyb3IgIT0gdW5kZWZpbmVkICYmIHJlcy5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkpvaW4gcm9vbSBmYWlsZWQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50SWRfID0gcGFydGljaXBhbnRJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuam9pbmVkXyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgcmVzLnJvb21JbmZvXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdWJsaXNoIHN0cmVhbS5cbiAgICAgKiBAcGFyYW0geyp9IGRldmljZSBEZXZpY2VcbiAgICAgKiBAcGFyYW0geyp9IHZpZGVvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzIFJUQ1J0cEVuY29kaW5nUGFyYW1ldGVycyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUlRDUnRwRW5jb2RpbmdQYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIHsqfSBhdWRpb1J0cEVuY29kaW5nUGFyYW1ldGVycyBSVENSdHBFbmNvZGluZ1BhcmFtZXRlcnMgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JUQ1J0cEVuY29kaW5nUGFyYW1ldGVyc1xuICAgICAqL1xuICAgIENsaWVudC5wcm90b3R5cGUucHVibGlzaCA9IGZ1bmN0aW9uIChkZXZpY2UsIGF1ZGlvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzLCB2aWRlb1J0cEVuY29kaW5nUGFyYW1ldGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWVkaWFTdHJlYW0sIHBjLCBhdWRpb1RyYW5zY2VpdmVySW5pdCwgdmlkZW9UcmFuc2NlaXZlckluaXQsIG9mZmVyLCByZXF1ZXN0LCByZXMsIGFuc3dlclNkcCwgc3RyZWFtSWQ7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBtZWRpYVN0cmVhbSA9IGRldmljZS5tZWRpYVN0cmVhbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGMgPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oeyBidW5kbGVQb2xpY3k6IFwibWF4LWJ1bmRsZVwiLCBydGNwTXV4UG9saWN5OiBcInJlcXVpcmVcIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvVHJhbnNjZWl2ZXJJbml0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ3NlbmRvbmx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdzOiBbeyByaWQ6ICdxJywgYWN0aXZlOiB0cnVlLCBtYXhCaXRyYXRlOiA2NDAwMCB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1zOiBbbWVkaWFTdHJlYW1dXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1ZGlvUnRwRW5jb2RpbmdQYXJhbWV0ZXJzICE9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvVHJhbnNjZWl2ZXJJbml0LnNlbmRFbmNvZGluZ3MgPSBhdWRpb1J0cEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvVHJhbnNjZWl2ZXJJbml0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ3NlbmRvbmx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdzOiBbeyByaWQ6ICdxJywgYWN0aXZlOiB0cnVlLCBtYXhCaXRyYXRlOiAyMDAwMDAgfV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtczogW21lZGlhU3RyZWFtXVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2aWRlb1J0cEVuY29kaW5nUGFyYW1ldGVycyAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWRlb1RyYW5zY2VpdmVySW5pdC5zZW5kRW5jb2RpbmdzID0gdmlkZW9SdHBFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVkaWFTdHJlYW0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGggPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYy5hZGRUcmFuc2NlaXZlcihtZWRpYVN0cmVhbS5nZXRBdWRpb1RyYWNrcygpWzBdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ3NlbmRvbmx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZEVuY29kaW5nczogW3sgcmlkOiAncScsIGFjdGl2ZTogdHJ1ZSwgbWF4Qml0cmF0ZTogNjQwMDAgfV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbXM6IFttZWRpYVN0cmVhbV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZWRpYVN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjLmFkZFRyYW5zY2VpdmVyKG1lZGlhU3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAnc2VuZG9ubHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdzOiBbeyByaWQ6ICdxJywgYWN0aXZlOiB0cnVlLCBtYXhCaXRyYXRlOiAyMDAwMDAgfV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbXM6IFttZWRpYVN0cmVhbV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLmNyZWF0ZU9mZmVyKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZlciA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLnNldExvY2FsRGVzY3JpcHRpb24ob2ZmZXIpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHsgYWN0aW9uOiBcInB1Ymxpc2hcIiwgb2ZmZXI6IG9mZmVyLnNkcCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5zaWduYWxpbmdfLnNlbmRSZXF1ZXN0KHJlcXVlc3QpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlB1Ymxpc2ggZmFpbGVkLlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyU2RwID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7IHNkcDogcmVzLmFuc3dlciwgdHlwZTogJ2Fuc3dlcicgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1JZCA9IHJlcy5zdHJlYW1JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHBjLnNldFJlbW90ZURlc2NyaXB0aW9uKGFuc3dlclNkcCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgbmV3IHB1Ymxpc2hlU3RyZWFtXzFbXCJkZWZhdWx0XCJdKG1lZGlhU3RyZWFtLCBzdHJlYW1JZCwgcGMsIHRoaXMuc2lnbmFsaW5nXyldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIENsaWVudC5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKHJlbW90ZVN0cmVhbSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcGMsIG9mZmVyLCByZXF1ZXN0LCByZXMsIGFuc3dlclNkcCwgc3Vic2NyaWJlU3RyZWFtSWQsIHB1Ymxpc2hTdHJlYW1JZDtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYyA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbih7IGJ1bmRsZVBvbGljeTogXCJtYXgtYnVuZGxlXCIsIHJ0Y3BNdXhQb2xpY3k6IFwicmVxdWlyZVwiIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW90ZVN0cmVhbS5oYXNBdWRpbylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYy5hZGRUcmFuc2NlaXZlcihcImF1ZGlvXCIsIHsgZGlyZWN0aW9uOiBcInJlY3Zvbmx5XCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3RlU3RyZWFtLmhhc1ZpZGVvKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjLmFkZFRyYW5zY2VpdmVyKFwidmlkZW9cIiwgeyBkaXJlY3Rpb246IFwicmVjdm9ubHlcIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjLm9udHJhY2sgPSB0aGlzLl9vbnRyYWNrLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBwYy5jcmVhdGVPZmZlcigpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXIgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBwYy5zZXRMb2NhbERlc2NyaXB0aW9uKG9mZmVyKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSB7IGFjdGlvbjogXCJzdWJzY3JpYmVcIiwgc3RyZWFtSWQ6IHJlbW90ZVN0cmVhbS5wdWJsaXNoU3RyZWFtSWQsIHBhcnRpY2lwYW50SWQ6IHJlbW90ZVN0cmVhbS5wYXJ0aWNpcGFudElkLCBvZmZlcjogb2ZmZXIuc2RwIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnNpZ25hbGluZ18uc2VuZFJlcXVlc3QocmVxdWVzdCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ29ubmVjdCBmYWlsZWQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXJTZHAgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHsgc2RwOiByZXMuYW5zd2VyLCB0eXBlOiAnYW5zd2VyJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYW5zd2VyU2RwLnNkcCA9IHJlcy5hbnN3ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2Fuc3dlclNkcC50eXBlID0gJ2Fuc3dlcic7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBwYy5zZXRSZW1vdGVEZXNjcmlwdGlvbihhbnN3ZXJTZHApXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hbnN3ZXJTZHAuc2RwID0gcmVzLmFuc3dlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYW5zd2VyU2RwLnR5cGUgPSAnYW5zd2VyJztcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZVN0cmVhbUlkID0gcmVzLnN0cmVhbUlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGlzaFN0cmVhbUlkID0gcmVtb3RlU3RyZWFtLnB1Ymxpc2hTdHJlYW1JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCBuZXcgc3Vic2NyaWJlU3RyZWFtXzFbXCJkZWZhdWx0XCJdKHRoaXMuc2lnbmFsaW5nXywgcGMsIHN1YnNjcmliZVN0cmVhbUlkLCBwdWJsaXNoU3RyZWFtSWQsIHRoaXMubWVkaWFTdHJlYW1fKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgQ2xpZW50LnByb3RvdHlwZS5sZWF2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuam9pbmVkXykge1xuICAgICAgICAgICAgdGhpcy5qb2luZWRfID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNpZ25hbGluZ18uY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQ2xpZW50LnByb3RvdHlwZS5fb250cmFjayA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmFkZFRyYWNrKGUudHJhY2spO1xuICAgIH07XG4gICAgcmV0dXJuIENsaWVudDtcbn0oZXZlbnREaXNwYXRjaGVyXzFbXCJkZWZhdWx0XCJdKSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IENsaWVudDtcbjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgRGV2aWNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERldmljZShtZWRpYVN0cmVhbSkge1xuICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXyA9IG1lZGlhU3RyZWFtO1xuICAgIH1cbiAgICAvLyBjb25zdHJhaW50cyA6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9NZWRpYVN0cmVhbUNvbnN0cmFpbnRzXG4gICAgRGV2aWNlLkNyZWF0ZURldmljZSA9IGZ1bmN0aW9uICh0eXBlLCBjb25zdHJhaW50cykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWVkaWFTdHJlYW07XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISh0eXBlID09PSBcImNhbWVyYVwiKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgMl07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cyldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBtZWRpYVN0cmVhbSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDVdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISh0eXBlID09PSBcInNjcmVlblNoYXJlXCIpKSByZXR1cm4gWzMgLypicmVhayovLCA0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0RGlzcGxheU1lZGlhKGNvbnN0cmFpbnRzKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lZGlhU3RyZWFtID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogdGhyb3cgXCJJbnZhbGlkIHR5cGVcIjtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA1OiByZXR1cm4gWzIgLypyZXR1cm4qLywgbmV3IERldmljZShtZWRpYVN0cmVhbSldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIERldmljZS5wcm90b3R5cGUubWVkaWFTdHJlYW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lZGlhU3RyZWFtXztcbiAgICB9O1xuICAgIHJldHVybiBEZXZpY2U7XG59KCkpO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBEZXZpY2U7XG47XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIERldmljZUVudW1lcmF0b3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRGV2aWNlRW51bWVyYXRvcigpIHtcbiAgICB9XG4gICAgRGV2aWNlRW51bWVyYXRvci5lbnVtZXJhdGVBbGxEZXZpY2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGV2aWNlcztcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIFs0IC8qeWllbGQqLywgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIGRldmljZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIERldmljZUVudW1lcmF0b3IuZW51bWVyYXRlQ2FtZXJhcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRldmljZXM7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBbNCAvKnlpZWxkKi8sIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcygpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlcyA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCBkZXZpY2VzLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJ2aWRlb2lucHV0XCIgPT09IGUua2luZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgRGV2aWNlRW51bWVyYXRvci5lbnVtZXJhdGVNaWNyb3Bob25lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRldmljZXM7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBbNCAvKnlpZWxkKi8sIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcygpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlcyA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCBkZXZpY2VzLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJhdWRpb2lucHV0XCIgPT09IGUua2luZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgRGV2aWNlRW51bWVyYXRvci5lbnVtZXJhdGVTcGVha2VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRldmljZXM7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBbNCAvKnlpZWxkKi8sIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcygpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlcyA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCBkZXZpY2VzLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJhdWRpb291dHB1dFwiID09PSBlLmtpbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBEZXZpY2VFbnVtZXJhdG9yO1xufSgpKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRGV2aWNlRW51bWVyYXRvcjtcbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBFdmVudERpc3BhdGNoZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRXZlbnREaXNwYXRjaGVyKCkge1xuICAgICAgICB0aGlzLmV2ZW50c18gPSB7fTtcbiAgICB9XG4gICAgRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVGhlIGxpc3RlbmVyIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvbiwgdGhlIGdpdmVuIHR5cGUgaXMgXCIuY29uY2F0KHR5cGVvZiBjYWxsYmFjaykpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c19bZXZlbnRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzX1tldmVudF0gPSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzOiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV2ZW50c19bZXZlbnRdLmxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9O1xuICAgIEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnRzX1tldmVudF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoaXMgZXZlbnQ6IFwiLmNvbmNhdChldmVudCwgXCIgZG9lcyBub3QgZXhpc3RcIikpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXZlbnRzX1tldmVudF0ubGlzdGVuZXJzID0gdGhpcy5ldmVudHNfW2V2ZW50XS5saXN0ZW5lcnMuZmlsdGVyKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIGxpc3RlbmVyLnRvU3RyaW5nKCkgIT09IGNhbGxiYWNrLnRvU3RyaW5nKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50LCBkZXRhaWxzKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c19bZXZlbnRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV2ZW50c19bZXZlbnRdLmxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgbGlzdGVuZXIoZGV0YWlscyk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIEV2ZW50RGlzcGF0Y2hlcjtcbn0oKSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEV2ZW50RGlzcGF0Y2hlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgUHVibGlzaGVTdHJlYW0gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUHVibGlzaGVTdHJlYW0obWVkaWFTdHJlYW0sIHN0cmVhbUlkLCBwYywgc2lnbmFsaW5nKSB7XG4gICAgICAgIHRoaXMubWVkaWFTdHJlYW1fID0gbWVkaWFTdHJlYW07XG4gICAgICAgIHRoaXMuc3RyZWFtSWRfID0gc3RyZWFtSWQ7XG4gICAgICAgIHRoaXMucGNfID0gcGM7XG4gICAgICAgIHRoaXMuc2lnbmFsaW5nXyA9IHNpZ25hbGluZztcbiAgICB9XG4gICAgUHVibGlzaGVTdHJlYW0ucHJvdG90eXBlLklkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdHJlYW1JZF87XG4gICAgfTtcbiAgICBQdWJsaXNoZVN0cmVhbS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBjXykge1xuICAgICAgICAgICAgdGhpcy5wY18uY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMucGNfID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgUHVibGlzaGVTdHJlYW0ucHJvdG90eXBlLm11dGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICBpZiAodHlwZSA9PT0gXCJhdWRpb1wiKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5nZXRBdWRpb1RyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7IGFjdGlvbjogXCJwdWJsaXNoX211dGVPclVubXV0ZVwiLCBzdHJlYW1JZDogdGhpcy5zdHJlYW1JZF8sIG11dGVkOiB0cnVlLCB0eXBlOiBcImF1ZGlvXCIgfTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsaW5nXy5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSBcInZpZGVvXCIpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFTdHJlYW1fLmdldFZpZGVvVHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHsgYWN0aW9uOiBcInB1Ymxpc2hfbXV0ZU9yVW5tdXRlXCIsIHN0cmVhbUlkOiB0aGlzLnN0cmVhbUlkXywgbXV0ZWQ6IHRydWUsIHR5cGU6IFwidmlkZW9cIiB9O1xuICAgICAgICAgICAgdGhpcy5zaWduYWxpbmdfLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IFwiSW52YWxpZCB0eXBlXCI7XG4gICAgfTtcbiAgICBQdWJsaXNoZVN0cmVhbS5wcm90b3R5cGUudW5tdXRlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09IFwiYXVkaW9cIikge1xuICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uZ2V0QXVkaW9UcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7IGFjdGlvbjogXCJwdWJsaXNoX211dGVPclVubXV0ZVwiLCBzdHJlYW1JZDogdGhpcy5zdHJlYW1JZF8sIG11dGVkOiBmYWxzZSwgdHlwZTogXCJhdWRpb1wiIH07XG4gICAgICAgICAgICB0aGlzLnNpZ25hbGluZ18uc2VuZChKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gXCJ2aWRlb1wiKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5nZXRWaWRlb1RyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHsgYWN0aW9uOiBcInB1Ymxpc2hfbXV0ZU9yVW5tdXRlXCIsIHN0cmVhbUlkOiB0aGlzLnN0cmVhbUlkXywgbXV0ZWQ6IGZhbHNlLCB0eXBlOiBcInZpZGVvXCIgfTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsaW5nXy5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBcIkludmFsaWQgdHlwZVwiO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JUQ1BlZXJDb25uZWN0aW9uL2dldFN0YXRzXG4gICAgICovXG4gICAgUHVibGlzaGVTdHJlYW0ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGNfKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCB0aGlzLnBjXy5nZXRTdGF0cygpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiUGVlckNvbm5lY3Rpb24gaXMgbnVsbFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gUHVibGlzaGVTdHJlYW07XG59KCkpO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBQdWJsaXNoZVN0cmVhbTtcbjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgZXZlbnREaXNwYXRjaGVyXzEgPSByZXF1aXJlKFwiLi9ldmVudERpc3BhdGNoZXJcIik7XG52YXIgU2lnbmFsaW5nID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTaWduYWxpbmcsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU2lnbmFsaW5nKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5wcm9taXNlUG9vbF8gPSB7fTtcbiAgICAgICAgX3RoaXMud3NzXyA9IG51bGw7XG4gICAgICAgIF90aGlzLmtlZXBBbGl2ZVRpbWVySWRfID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFNpZ25hbGluZy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGNsYXNzVGhpcyA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBfdGhpcy53c3NfID0gbmV3IFdlYlNvY2tldCh1cmwpO1xuICAgICAgICAgICAgX3RoaXMud3NzXy5vbm9wZW4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICBjbGFzc1RoaXMuX2tlZXBBbGl2ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLndzc18ub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLndzc18ub25jbG9zZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IHsgdHlwZTogXCJzaWduYWxpbmdEaXNjb25uZWN0ZWRcIiB9O1xuICAgICAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudC5jYWxsKF90aGlzLCBcIm9uc2lnbmFsaW5nXCIsIEpTT04uc3RyaW5naWZ5KG5vdGlmaWNhdGlvbikpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLndzc18ub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS50cmFuc2FjdGlvbklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50LmNhbGwoX3RoaXMsIFwib25zaWduYWxpbmdcIiwgZS5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5wcm9taXNlUG9vbF8uaGFzT3duUHJvcGVydHkoZGF0YS50cmFuc2FjdGlvbklkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zYWN0aW9uSWQgPSBkYXRhLnRyYW5zYWN0aW9uSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gX3RoaXMucHJvbWlzZVBvb2xfW2RhdGEudHJhbnNhY3Rpb25JZF07XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS50cmFuc2FjdGlvbklkO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgX3RoaXMucHJvbWlzZVBvb2xfW3RyYW5zYWN0aW9uSWRdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTaWduYWxpbmcucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jYW5jZWxLZWVwQWxpdmUoKTtcbiAgICAgICAgaWYgKHRoaXMud3NzXyAhPSBudWxsKVxuICAgICAgICAgICAgdGhpcy53c3NfLmNsb3NlKCk7XG4gICAgICAgIHRoaXMud3NzXyA9IG51bGw7XG4gICAgfTtcbiAgICBTaWduYWxpbmcucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHRoaXMud3NzXy5zZW5kKG1zZyk7XG4gICAgfTtcbiAgICBTaWduYWxpbmcucHJvdG90eXBlLnNlbmRSZXF1ZXN0ID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgdHJhbnNhY3Rpb25JZCA9ICcnO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgdHJhbnNhY3Rpb25JZCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMDAwMDAwMDAwMDApICsgJyc7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvbWlzZVBvb2xfLmhhc093blByb3BlcnR5KHRyYW5zYWN0aW9uSWQpKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG1zZy50cmFuc2FjdGlvbklkID0gdHJhbnNhY3Rpb25JZDtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIF90aGlzLnByb21pc2VQb29sX1ttc2cudHJhbnNhY3Rpb25JZF0gPSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICByZWplY3Q6IHJlamVjdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLndzc18uc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTaWduYWxpbmcucHJvdG90eXBlLl9rZWVwQWxpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0aW1lb3V0ID0gMTAwMDtcbiAgICAgICAgaWYgKHRoaXMud3NzXy5yZWFkeVN0YXRlID09IHRoaXMud3NzXy5PUEVOKSB7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHsgYWN0aW9uOiBcImtlZXBBbGl2ZVwiIH07XG4gICAgICAgICAgICB0aGlzLndzc18uc2VuZChKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5rZWVwQWxpdmVUaW1lcklkXyA9IHNldFRpbWVvdXQodGhpcy5fa2VlcEFsaXZlLmJpbmQodGhpcyksIHRpbWVvdXQpO1xuICAgIH07XG4gICAgU2lnbmFsaW5nLnByb3RvdHlwZS5fY2FuY2VsS2VlcEFsaXZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5rZWVwQWxpdmVUaW1lcklkXykge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMua2VlcEFsaXZlVGltZXJJZF8pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gU2lnbmFsaW5nO1xufShldmVudERpc3BhdGNoZXJfMVtcImRlZmF1bHRcIl0pKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gU2lnbmFsaW5nO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgZXZlbnREaXNwYXRjaGVyXzEgPSByZXF1aXJlKFwiLi9ldmVudERpc3BhdGNoZXJcIik7XG52YXIgU3Vic2NyaWJlU3RyZWFtID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTdWJzY3JpYmVTdHJlYW0sIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU3Vic2NyaWJlU3RyZWFtKHNpZ25hbGluZywgcGMsIHN1YnNjcmliZVN0cmVhbUlkLCBwdWJsaXNoU3RyZWFtSWQsIG1lZGlhU3RyZWFtKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnNpZ25hbGluZ18gPSBzaWduYWxpbmc7XG4gICAgICAgIF90aGlzLnNpZ25hbGluZ18uYWRkRXZlbnRMaXN0ZW5lcihcIm9uc2lnbmFsaW5nXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gSlNPTi5wYXJzZShlKTtcbiAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24udHlwZSA9PT0gXCJwdWJsaXNoTXV0ZU9yVW5tdXRlXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLmRhdGEucHVibGlzaFN0cmVhbUlkID09PSBfdGhpcy5wdWJsaXNoU3RyZWFtSWRfKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBldmVudFR5cGUgPSBub3RpZmljYXRpb24uZGF0YS5tdXRlZCA/ICdtdXRlJyA6ICd1bm11dGUnO1xuICAgICAgICAgICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQuY2FsbChfdGhpcywgZXZlbnRUeXBlLCBub3RpZmljYXRpb24uZGF0YS50eXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5zaWduYWxpbmdfLmFkZEV2ZW50TGlzdGVuZXIoXCJvbnNpZ25hbGluZ1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IEpTT04ucGFyc2UoZSk7XG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLnR5cGUgPT09IFwic3RyZWFtUmVtb3ZlZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi5kYXRhLnB1Ymxpc2hTdHJlYW1JZCA9PT0gX3RoaXMucHVibGlzaFN0cmVhbUlkXykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQuY2FsbChfdGhpcywgXCJlbmRlZFwiLCBfdGhpcy5zdWJzY3JpYmVTdHJlYW1JZF8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIF90aGlzLnBjXyA9IHBjO1xuICAgICAgICBfdGhpcy5zdWJzY3JpYmVTdHJlYW1JZF8gPSBzdWJzY3JpYmVTdHJlYW1JZDtcbiAgICAgICAgX3RoaXMucHVibGlzaFN0cmVhbUlkXyA9IHB1Ymxpc2hTdHJlYW1JZDtcbiAgICAgICAgX3RoaXMubWVkaWFTdHJlYW1fID0gbWVkaWFTdHJlYW07XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgU3Vic2NyaWJlU3RyZWFtLnByb3RvdHlwZS5pZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlU3RyZWFtSWRfO1xuICAgIH07XG4gICAgU3Vic2NyaWJlU3RyZWFtLnByb3RvdHlwZS5tZWRpYVN0cmVhbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVkaWFTdHJlYW1fO1xuICAgIH07XG4gICAgU3Vic2NyaWJlU3RyZWFtLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGNfKSB7XG4gICAgICAgICAgICB0aGlzLnBjXy5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5wY18gPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVTdHJlYW0ucHJvdG90eXBlLm11dGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICBpZiAodHlwZSA9PT0gXCJhdWRpb1wiKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5nZXRBdWRpb1RyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09IFwidmlkZW9cIikge1xuICAgICAgICAgICAgdGhpcy5tZWRpYVN0cmVhbV8uZ2V0VmlkZW9UcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBcIkludmFsaWQgdHlwZVwiO1xuICAgIH07XG4gICAgU3Vic2NyaWJlU3RyZWFtLnByb3RvdHlwZS51bm11dGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICBpZiAodHlwZSA9PT0gXCJhdWRpb1wiKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5nZXRBdWRpb1RyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gXCJ2aWRlb1wiKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhU3RyZWFtXy5nZXRWaWRlb1RyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgXCJJbnZhbGlkIHR5cGVcIjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SVENQZWVyQ29ubmVjdGlvbi9nZXRTdGF0c1xuICAgICAqL1xuICAgIFN1YnNjcmliZVN0cmVhbS5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wY18pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIHRoaXMucGNfLmdldFN0YXRzKCldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJQZWVyQ29ubmVjdGlvbiBpcyBudWxsXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBTdWJzY3JpYmVTdHJlYW07XG59KGV2ZW50RGlzcGF0Y2hlcl8xW1wiZGVmYXVsdFwiXSkpO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTdWJzY3JpYmVTdHJlYW07XG47XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5DbGllbnQgPSBleHBvcnRzLlN1YnNjcmliZVN0cmVhbSA9IGV4cG9ydHMuUHVibGlzaGVTdHJlYW0gPSBleHBvcnRzLlNpZ25hbGluZyA9IGV4cG9ydHMuRXZlbnREaXNwYXRjaGVyID0gZXhwb3J0cy5EZXZpY2VFbnVtZXJhdG9yID0gZXhwb3J0cy5EZXZpY2UgPSB2b2lkIDA7XG52YXIgZGV2aWNlXzEgPSByZXF1aXJlKFwiLi9kZXZpY2VcIik7XG5leHBvcnRzLkRldmljZSA9IGRldmljZV8xW1wiZGVmYXVsdFwiXTtcbnZhciBkZXZpY2VFbnVtZXJhdG9yXzEgPSByZXF1aXJlKFwiLi9kZXZpY2VFbnVtZXJhdG9yXCIpO1xuZXhwb3J0cy5EZXZpY2VFbnVtZXJhdG9yID0gZGV2aWNlRW51bWVyYXRvcl8xW1wiZGVmYXVsdFwiXTtcbnZhciBldmVudERpc3BhdGNoZXJfMSA9IHJlcXVpcmUoXCIuL2V2ZW50RGlzcGF0Y2hlclwiKTtcbmV4cG9ydHMuRXZlbnREaXNwYXRjaGVyID0gZXZlbnREaXNwYXRjaGVyXzFbXCJkZWZhdWx0XCJdO1xudmFyIHNpZ25hbGluZ18xID0gcmVxdWlyZShcIi4vc2lnbmFsaW5nXCIpO1xuZXhwb3J0cy5TaWduYWxpbmcgPSBzaWduYWxpbmdfMVtcImRlZmF1bHRcIl07XG52YXIgcHVibGlzaGVTdHJlYW1fMSA9IHJlcXVpcmUoXCIuL3B1Ymxpc2hlU3RyZWFtXCIpO1xuZXhwb3J0cy5QdWJsaXNoZVN0cmVhbSA9IHB1Ymxpc2hlU3RyZWFtXzFbXCJkZWZhdWx0XCJdO1xudmFyIHN1YnNjcmliZVN0cmVhbV8xID0gcmVxdWlyZShcIi4vc3Vic2NyaWJlU3RyZWFtXCIpO1xuZXhwb3J0cy5TdWJzY3JpYmVTdHJlYW0gPSBzdWJzY3JpYmVTdHJlYW1fMVtcImRlZmF1bHRcIl07XG52YXIgY2xpZW50XzEgPSByZXF1aXJlKFwiLi9jbGllbnRcIik7XG5leHBvcnRzLkNsaWVudCA9IGNsaWVudF8xW1wiZGVmYXVsdFwiXTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==