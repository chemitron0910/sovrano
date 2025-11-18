"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuth = exports.getFirestore = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
Object.defineProperty(exports, "getFirestore", { enumerable: true, get: function () { return firestore_1.getFirestore; } });
const auth_1 = require("firebase-admin/auth");
Object.defineProperty(exports, "getAuth", { enumerable: true, get: function () { return auth_1.getAuth; } });
(0, app_1.initializeApp)();
//# sourceMappingURL=firebase.js.map