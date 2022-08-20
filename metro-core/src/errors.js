/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */
"use strict";

const AmbiguousModuleResolutionError = require("./errors/AmbiguousModuleResolutionError");

const PackageResolutionError = require("./errors/PackageResolutionError");

module.exports = {
  AmbiguousModuleResolutionError,
  PackageResolutionError,
};
