"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.projectConfig = projectConfig;
exports.dependencyConfig = dependencyConfig;
exports.findPodfilePaths = void 0;

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = _interopRequireDefault(require("fs"));

  _fs = function () {
    return data;
  };

  return data;
}

var _findPodfilePath = _interopRequireDefault(require("./findPodfilePath"));

var _findXcodeProject = _interopRequireDefault(require("./findXcodeProject"));

var _findPodspec = _interopRequireDefault(require("./findPodspec"));

var _findAllPodfilePaths = _interopRequireDefault(require("./findAllPodfilePaths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Returns project config by analyzing given folder and applying some user defaults
 * when constructing final object
 */
function projectConfig(folder, userConfig) {
  var _userConfig$sourceDir;

  if (!userConfig) {
    return null;
  }

  const src = _path().default.join(folder, (_userConfig$sourceDir = userConfig.sourceDir) !== null && _userConfig$sourceDir !== void 0 ? _userConfig$sourceDir : '');

  const podfile = (0, _findPodfilePath.default)(src);
  /**
   * In certain repos, the Xcode project can be generated by a tool.
   * The only file that we can assume to exist on disk is `Podfile`.
   */

  if (!podfile) {
    return null;
  }

  const sourceDir = _path().default.dirname(podfile);

  const xcodeProject = (0, _findXcodeProject.default)(_fs().default.readdirSync(sourceDir));
  return {
    sourceDir,
    xcodeProject
  };
}

function dependencyConfig(folder, userConfig = {}) {
  if (userConfig === null) {
    return null;
  }

  const podspecPath = (0, _findPodspec.default)(folder);

  if (!podspecPath) {
    return null;
  }

  return {
    podspecPath,
    configurations: userConfig.configurations || [],
    scriptPhases: userConfig.scriptPhases || []
  };
}

const findPodfilePaths = _findAllPodfilePaths.default;
exports.findPodfilePaths = findPodfilePaths;

//# sourceMappingURL=index.js.map