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

const traverse = require("@babel/traverse").default;

const nullthrows = require("nullthrows");

function normalizePseudoglobals(ast, options) {
  var _options$reservedName;

  const reservedNames = new Set(
    (_options$reservedName =
      options === null || options === void 0
        ? void 0
        : options.reservedNames) !== null && _options$reservedName !== void 0
      ? _options$reservedName
      : []
  );
  const renamedParamNames = [];
  traverse(ast, {
    Program(path) {
      const params = path.get("body.0.expression.arguments.0.params");
      const body = path.get("body.0.expression.arguments.0.body");

      if (!body || Array.isArray(body) || !Array.isArray(params)) {
        path.stop();
        return;
      }

      const pseudoglobals = params // $FlowFixMe Flow error uncovered by typing Babel more strictly
        .map((path) => path.node.name)
        .filter((name) => !reservedNames.has(name));
      const usedShortNames = new Set();
      const namePairs = pseudoglobals.map((fullName) => [
        fullName,
        getShortName(fullName, usedShortNames),
      ]);

      for (const [fullName, shortName] of namePairs) {
        if (reservedNames.has(shortName)) {
          throw new ReferenceError(
            "Could not reserve the identifier " +
              shortName +
              " because it is the short name for " +
              fullName
          );
        }

        renamedParamNames.push(rename(fullName, shortName, body.scope));
      }

      path.stop();
    },
  });
  return renamedParamNames;
}

function getShortName(fullName, usedNames) {
  // Try finding letters that are semantically relatable to the name
  // of the variable given. For instance, in XMLHttpRequest, it will
  // first match "X", then "H", then "R".
  const regexp = /^[^A-Za-z]*([A-Za-z])|([A-Z])[a-z]|([A-Z])[A-Z]+$/g;
  let match;

  while ((match = regexp.exec(fullName))) {
    const name = (match[1] || match[2] || match[3] || "").toLowerCase();

    if (!name) {
      throw new ReferenceError(
        "Could not identify any valid name for " + fullName
      );
    }

    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }

  throw new ReferenceError(
    `Unable to determine short name for ${fullName}. The variables are not unique: ${Array.from(
      usedNames
    ).join(", ")}`
  );
}

function rename(fullName, shortName, scope) {
  let unusedName = shortName; // `generateUid` generates a name of the form name_ even if there was no conflict which we don't want.
  // Check if the desired name was never used and in that case proceed and only use `generateUid` if there's a
  // name clash.

  if (
    scope.hasLabel(shortName) ||
    scope.hasBinding(shortName) ||
    scope.hasGlobal(shortName) ||
    scope.hasReference(shortName)
  ) {
    unusedName = scope.generateUid(shortName);
    const programScope = scope.getProgramParent();
    nullthrows(programScope.references)[shortName] = true;
    nullthrows(programScope.uids)[shortName] = true;
  }

  scope.rename(fullName, unusedName);
  return unusedName;
}

module.exports = normalizePseudoglobals;
