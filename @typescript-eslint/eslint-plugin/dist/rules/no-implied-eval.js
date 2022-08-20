"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const tsutils = __importStar(require("tsutils"));
const util = __importStar(require("../util"));
const FUNCTION_CONSTRUCTOR = 'Function';
const GLOBAL_CANDIDATES = new Set(['global', 'window', 'globalThis']);
const EVAL_LIKE_METHODS = new Set([
    'setImmediate',
    'setInterval',
    'setTimeout',
    'execScript',
]);
exports.default = util.createRule({
    name: 'no-implied-eval',
    meta: {
        docs: {
            description: 'Disallow the use of `eval()`-like methods',
            category: 'Best Practices',
            recommended: 'error',
            requiresTypeChecking: true,
        },
        messages: {
            noImpliedEvalError: 'Implied eval. Consider passing a function.',
            noFunctionConstructor: 'Implied eval. Do not use the Function constructor to create functions.',
        },
        schema: [],
        type: 'suggestion',
    },
    defaultOptions: [],
    create(context) {
        const parserServices = util.getParserServices(context);
        const program = parserServices.program;
        const checker = parserServices.program.getTypeChecker();
        function getCalleeName(node) {
            if (node.type === experimental_utils_1.AST_NODE_TYPES.Identifier) {
                return node.name;
            }
            if (node.type === experimental_utils_1.AST_NODE_TYPES.MemberExpression &&
                node.object.type === experimental_utils_1.AST_NODE_TYPES.Identifier &&
                GLOBAL_CANDIDATES.has(node.object.name)) {
                if (node.property.type === experimental_utils_1.AST_NODE_TYPES.Identifier) {
                    return node.property.name;
                }
                if (node.property.type === experimental_utils_1.AST_NODE_TYPES.Literal &&
                    typeof node.property.value === 'string') {
                    return node.property.value;
                }
            }
            return null;
        }
        function isFunctionType(node) {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
            const type = checker.getTypeAtLocation(tsNode);
            const symbol = type.getSymbol();
            if (symbol &&
                tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Function | ts.SymbolFlags.Method)) {
                return true;
            }
            const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
            return signatures.length > 0;
        }
        function isFunction(node) {
            switch (node.type) {
                case experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression:
                case experimental_utils_1.AST_NODE_TYPES.FunctionDeclaration:
                case experimental_utils_1.AST_NODE_TYPES.FunctionExpression:
                    return true;
                case experimental_utils_1.AST_NODE_TYPES.MemberExpression:
                case experimental_utils_1.AST_NODE_TYPES.Identifier:
                    return isFunctionType(node);
                case experimental_utils_1.AST_NODE_TYPES.CallExpression:
                    return ((node.callee.type === experimental_utils_1.AST_NODE_TYPES.Identifier &&
                        node.callee.name === 'bind') ||
                        isFunctionType(node));
                default:
                    return false;
            }
        }
        function checkImpliedEval(node) {
            var _a;
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.callee);
            const type = checker.getTypeAtLocation(tsNode);
            const calleeName = getCalleeName(node.callee);
            if (calleeName === null) {
                return;
            }
            if (calleeName === FUNCTION_CONSTRUCTOR) {
                const symbol = type.getSymbol();
                if (symbol) {
                    const declarations = (_a = symbol.getDeclarations()) !== null && _a !== void 0 ? _a : [];
                    for (const declaration of declarations) {
                        const sourceFile = declaration.getSourceFile();
                        if (program.isSourceFileDefaultLibrary(sourceFile)) {
                            context.report({ node, messageId: 'noFunctionConstructor' });
                            return;
                        }
                    }
                }
                else {
                    context.report({ node, messageId: 'noFunctionConstructor' });
                    return;
                }
            }
            if (node.arguments.length === 0) {
                return;
            }
            const [handler] = node.arguments;
            if (EVAL_LIKE_METHODS.has(calleeName) && !isFunction(handler)) {
                context.report({ node: handler, messageId: 'noImpliedEvalError' });
            }
        }
        return {
            NewExpression: checkImpliedEval,
            CallExpression: checkImpliedEval,
        };
    },
});
//# sourceMappingURL=no-implied-eval.js.map