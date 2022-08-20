/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */
'use strict';

function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) ||
    _iterableToArrayLimit(arr, i) ||
    _unsupportedIterableToArray(arr, i) ||
    _nonIterableRest()
  );
}

function _nonIterableRest() {
  throw new TypeError(
    'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
  );
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}

function _iterableToArrayLimit(arr, i) {
  var _i =
    arr == null
      ? null
      : (typeof Symbol !== 'undefined' && arr[Symbol.iterator]) ||
        arr['@@iterator'];
  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i['return'] != null) _i['return']();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

const _require = require('./Utils'),
  createAliasResolver = _require.createAliasResolver,
  getModules = _require.getModules;

const _require2 = require('../../parsers/flow/modules/utils'),
  unwrapNullable = _require2.unwrapNullable;

const HostFunctionTemplate = ({hasteModuleName, methodName, isVoid, args}) => {
  const methodCallArgs = ['rt', ...args].join(', ');
  const methodCall = `static_cast<${hasteModuleName}CxxSpecJSI *>(&turboModule)->${methodName}(${methodCallArgs});`;
  return `static jsi::Value __hostFunction_${hasteModuleName}CxxSpecJSI_${methodName}(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {${
    isVoid ? `\n  ${methodCall}` : ''
  }
  return ${isVoid ? 'jsi::Value::undefined();' : methodCall}
}`;
};

const ModuleTemplate = ({
  hasteModuleName,
  hostFunctions,
  moduleName,
  methods,
}) => {
  return `${hostFunctions.join('\n')}

${hasteModuleName}CxxSpecJSI::${hasteModuleName}CxxSpecJSI(std::shared_ptr<CallInvoker> jsInvoker)
  : TurboModule("${moduleName}", jsInvoker) {
${methods
  .map(({methodName, paramCount}) => {
    return `  methodMap_["${methodName}"] = MethodMetadata {${paramCount}, __hostFunction_${hasteModuleName}CxxSpecJSI_${methodName}};`;
  })
  .join('\n')}
}`;
};

const FileTemplate = ({libraryName, modules}) => {
  return `/**
 * This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
 *
 * Do not edit this file as changes may cause incorrect behavior and will be lost
 * once the code is regenerated.
 *
 * ${'@'}generated by codegen project: GenerateModuleH.js
 */

#include "${libraryName}JSI.h"

namespace facebook {
namespace react {

${modules}


} // namespace react
} // namespace facebook
`;
};

function serializeArg(arg, index, resolveAlias) {
  const nullableTypeAnnotation = arg.typeAnnotation;

  const _unwrapNullable = unwrapNullable(nullableTypeAnnotation),
    _unwrapNullable2 = _slicedToArray(_unwrapNullable, 2),
    typeAnnotation = _unwrapNullable2[0],
    nullable = _unwrapNullable2[1];

  let realTypeAnnotation = typeAnnotation;

  if (realTypeAnnotation.type === 'TypeAliasTypeAnnotation') {
    realTypeAnnotation = resolveAlias(realTypeAnnotation.name);
  }

  function wrap(suffix) {
    const val = `args[${index}]`;
    const expression = `${val}${suffix}`;

    if (nullable) {
      return `${val}.isNull() || ${val}.isUndefined() ? std::nullopt : std::make_optional(${expression})`;
    }

    return expression;
  }

  switch (realTypeAnnotation.type) {
    case 'ReservedTypeAnnotation':
      switch (realTypeAnnotation.name) {
        case 'RootTag':
          return wrap('.getNumber()');

        default:
          realTypeAnnotation.name;
          throw new Error(
            `Unknown prop type for "${arg.name}, found: ${realTypeAnnotation.name}"`,
          );
      }

    case 'StringTypeAnnotation':
      return wrap('.asString(rt)');

    case 'BooleanTypeAnnotation':
      return wrap('.asBool()');

    case 'NumberTypeAnnotation':
      return wrap('.asNumber()');

    case 'FloatTypeAnnotation':
      return wrap('.asNumber()');

    case 'DoubleTypeAnnotation':
      return wrap('.asNumber()');

    case 'Int32TypeAnnotation':
      return wrap('.asNumber()');

    case 'ArrayTypeAnnotation':
      return wrap('.asObject(rt).asArray(rt)');

    case 'FunctionTypeAnnotation':
      return wrap('.asObject(rt).asFunction(rt)');

    case 'GenericObjectTypeAnnotation':
      return wrap('.asObject(rt)');

    case 'ObjectTypeAnnotation':
      return wrap('.asObject(rt)');

    default:
      realTypeAnnotation.type;
      throw new Error(
        `Unknown prop type for "${arg.name}, found: ${realTypeAnnotation.type}"`,
      );
  }
}

function serializePropertyIntoHostFunction(
  hasteModuleName,
  property,
  resolveAlias,
) {
  const _unwrapNullable3 = unwrapNullable(property.typeAnnotation),
    _unwrapNullable4 = _slicedToArray(_unwrapNullable3, 1),
    propertyTypeAnnotation = _unwrapNullable4[0];

  const isVoid =
    propertyTypeAnnotation.returnTypeAnnotation.type === 'VoidTypeAnnotation';
  return HostFunctionTemplate({
    hasteModuleName,
    methodName: property.name,
    isVoid,
    args: propertyTypeAnnotation.params.map((p, i) =>
      serializeArg(p, i, resolveAlias),
    ),
  });
}

module.exports = {
  generate(libraryName, schema, packageName, assumeNonnull = false) {
    const nativeModules = getModules(schema);
    const modules = Object.keys(nativeModules)
      .map(hasteModuleName => {
        const nativeModule = nativeModules[hasteModuleName];
        const aliases = nativeModule.aliases,
          properties = nativeModule.spec.properties,
          moduleNames = nativeModule.moduleNames;
        const resolveAlias = createAliasResolver(aliases);
        const hostFunctions = properties.map(property =>
          serializePropertyIntoHostFunction(
            hasteModuleName,
            property,
            resolveAlias,
          ),
        );
        return ModuleTemplate({
          hasteModuleName,
          hostFunctions,
          // TODO: What happens when there are more than one NativeModule requires?
          moduleName: moduleNames[0],
          methods: properties.map(
            ({name: propertyName, typeAnnotation: nullableTypeAnnotation}) => {
              const _unwrapNullable5 = unwrapNullable(nullableTypeAnnotation),
                _unwrapNullable6 = _slicedToArray(_unwrapNullable5, 1),
                params = _unwrapNullable6[0].params;

              return {
                methodName: propertyName,
                paramCount: params.length,
              };
            },
          ),
        });
      })
      .join('\n');
    const fileName = `${libraryName}JSI-generated.cpp`;
    const replacedTemplate = FileTemplate({
      modules,
      libraryName,
    });
    return new Map([[fileName, replacedTemplate]]);
  },
};
