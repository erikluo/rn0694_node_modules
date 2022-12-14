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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const no_unused_vars_1 = __importDefault(require("eslint/lib/rules/no-unused-vars"));
const util = __importStar(require("../util"));
exports.default = util.createRule({
    name: 'no-unused-vars',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow unused variables',
            category: 'Variables',
            recommended: 'warn',
            extendsBaseRule: true,
        },
        schema: no_unused_vars_1.default.meta.schema,
        messages: no_unused_vars_1.default.meta.messages,
    },
    defaultOptions: [],
    create(context) {
        const rules = no_unused_vars_1.default.create(context);
        /**
         * Mark heritage clause as used
         * @param node The node currently being traversed
         */
        function markHeritageAsUsed(node) {
            switch (node.type) {
                case experimental_utils_1.AST_NODE_TYPES.Identifier:
                    context.markVariableAsUsed(node.name);
                    break;
                case experimental_utils_1.AST_NODE_TYPES.MemberExpression:
                    markHeritageAsUsed(node.object);
                    break;
                case experimental_utils_1.AST_NODE_TYPES.CallExpression:
                    markHeritageAsUsed(node.callee);
                    break;
            }
        }
        return Object.assign({}, rules, {
            'TSTypeReference Identifier'(node) {
                context.markVariableAsUsed(node.name);
            },
            TSInterfaceHeritage(node) {
                if (node.expression) {
                    markHeritageAsUsed(node.expression);
                }
            },
            TSClassImplements(node) {
                if (node.expression) {
                    markHeritageAsUsed(node.expression);
                }
            },
            'TSParameterProperty Identifier'(node) {
                // just assume parameter properties are used
                context.markVariableAsUsed(node.name);
            },
            'TSEnumMember Identifier'(node) {
                context.markVariableAsUsed(node.name);
            },
            '*[declare=true] Identifier'(node) {
                context.markVariableAsUsed(node.name);
                const scope = context.getScope();
                const { variableScope } = scope;
                if (variableScope !== scope) {
                    const superVar = variableScope.set.get(node.name);
                    if (superVar) {
                        superVar.eslintUsed = true;
                    }
                }
            },
        });
    },
});
//# sourceMappingURL=no-unused-vars.js.map