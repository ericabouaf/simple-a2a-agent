"use strict";
// === JSON-RPC Base Structures
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodeUnsupportedOperation = exports.ErrorCodePushNotificationNotSupported = exports.ErrorCodeTaskNotCancelable = exports.ErrorCodeTaskNotFound = exports.ErrorCodeInternalError = exports.ErrorCodeInvalidParams = exports.ErrorCodeMethodNotFound = exports.ErrorCodeInvalidRequest = exports.ErrorCodeParseError = void 0;
// === Error Types (Standard and A2A)
/** Error code for JSON Parse Error (-32700). Invalid JSON was received by the server. */
exports.ErrorCodeParseError = -32700;
/** Error code for Invalid Request (-32600). The JSON sent is not a valid Request object. */
exports.ErrorCodeInvalidRequest = -32600;
/** Error code for Method Not Found (-32601). The method does not exist / is not available. */
exports.ErrorCodeMethodNotFound = -32601;
/** Error code for Invalid Params (-32602). Invalid method parameter(s). */
exports.ErrorCodeInvalidParams = -32602;
/** Error code for Internal Error (-32603). Internal JSON-RPC error. */
exports.ErrorCodeInternalError = -32603;
/** Error code for Task Not Found (-32001). The specified task was not found. */
exports.ErrorCodeTaskNotFound = -32001;
/** Error code for Task Not Cancelable (-32002). The specified task cannot be canceled. */
exports.ErrorCodeTaskNotCancelable = -32002;
/** Error code for Push Notification Not Supported (-32003). Push Notifications are not supported for this operation or agent. */
exports.ErrorCodePushNotificationNotSupported = -32003;
/** Error code for Unsupported Operation (-32004). The requested operation is not supported by the agent. */
exports.ErrorCodeUnsupportedOperation = -32004;
// Subscription responses are typically event streams (TaskUpdateEvent) sent over the transport,
// not direct JSON-RPC responses to the subscribe request itself.
