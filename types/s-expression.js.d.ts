export = SExpr;
/**
 * Class of S-Expression resolver that includes parser, serializer, tree
 * constructors, and tree walker utilities.
 *
 * Creates an instance of SExpr. Optional `options` input for configuring
 * default behavior, such as how to recognize null, boolean values as it's up to
 * the programmer to decide the syntax. Nevertheless, here is the default that
 * you can override.
 * ```javascript
 * {
 *  truthy: ['true', '#t'],
 *  falsy: ['false', '#f'],
 *  nully: ['null', '#nil']
 * }
 * ```
 */
declare class SExpr {
    /**
     *
     * @param {*} [options={}]
     */
    constructor(options?: any);
    logVerbose: any;
    logTrace: any;
    Type: {
        Atom: any;
    };
    truthy: any;
    falsy: any;
    nully: any;
    ATOM: string;
    BOOLEAN: string;
    NUMBER: string;
    STRING: string;
    EMPTY: string;
    FUNCTION: string;
    NULL: string;
    ROOT: string;
    defaults: {
        [x: string]: {
            evaluate: (data: any, context: any, state: any, entity: any) => Promise<any>;
        };
    };
    findContext(context: any, name: any, base: any): {};
    /**
     * interpret a parsed expression tree (AST) into data structures in according
     * to a notation type, currently just "functional" notation which is similar
     * to LISP dialects such as CLIPS, Clojure, Scheme, Racket, etc.
     *
     * @param {*} E
     * @return {*}
     */
    interpret(expression: any, context?: {}, state?: {
        scoped: any[];
        globals: {};
    }, entity?: string): any;
    /**
     * strip comments from S-expression string
     * @param {string} str code which might have comments
     * @returns {string} code without comments
     */
    stripComments(str: string): string;
    /**
     * Parse a S-expression string into a JSON object representing an expression
     * tree
     *
     * @param  {string} str S-expression string
     * @param {*} [opts = { includedRootParentheses: true }] deserializing options
     * @returns {json} an expression tree in form of list that can include nested
     * lists similar to the structure of the input S-expression
     * @ref improved on: https://rosettacode.org/wiki/S-expressions#JavaScript
     */
    parse(str: string, opts?: any): json;
    /**
     * Serialize an expression tree into an S-expression string
     *
     * @param {*} ast parsed expression (abstract syntax tree)
     * @param {*} [opts = { includingRootParentheses: true }] serializing options
     * @return {*}
     */
    serialize(ast: any, opts?: any, level?: number): any;
    /**
     * Create an identifier symbol
     * @example
     * const S = new SExpr()
     * const node = S.expression(S.identifier('a'))
     * // ['a']
     * @param {string} id
     * @return {string} symbol
     */
    identifier(id: string): string;
    /**
     * Check if a node is an identifier, optionally compare to a given name
     * @example
     * const S = new SExpr()
     * const node = S.expression(S.identifier('a'))
     * console.log(S.isAtom(S.first(node)))
     * // true
     * console.log(S.isAtom(S.first(node, 'a')))
     * // true
     * @param {any} e a node to check
     * @param {string} [id=undefined] optional id name to compare to
     * @return {boolean} true if it is an identifier
     */
    isAtom(e: any, id?: string): boolean;
    /**
     * Compare whether 2 nodes are identical
     *
     * @param {any} a a node
     * @param {any} b another node to compare to
     * @return {boolean} true if they are the same
     */
    isEqual(a: any, b: any): boolean;
    /**
     * Create an expression node
     *
     * @param {rest} exps optional initialization list of elements
     * @return {json} a tree node
     */
    expression(...exps: rest): json;
    /**
     * Check if a node is an expression, and optionally compare to a given
     * expression
     *
     * @param {any} e a node to check whether it's an expression
     * @param {json} [s=undefined] optional expression to compare to
     * @return {boolean} true if it's an expression (and equals the compared
     * expression if provided)
     */
    isExpression(e: any, s?: json): boolean;
    /**
     * Create a boolean node with given state
     *
     * @param {boolean} v boolean value
     * @return {string} a node with name corresponding to a boolean value
     */
    boolean(v: boolean): string;
    /**
     * Check if a node is a boolean value, optionally compare to a given state
     *
     * @param {any} e a node to check whether it's a boolean
     * @param {boolean} [b=undefined] optional state to compare to
     * @return {boolean} true if it's a boolean (and equals the given state if
     * provided)
     */
    isBoolean(e: any, b?: boolean): boolean;
    /**
     * Check if a node is considered truthy. Anything but an explicit false value
     * is truthy.
     *
     * @param {any} e a node to check if it's truthy
     * @return {boolean} true if it's truthy
     */
    isTruthy(e: any): boolean;
    /**
     * Check if a node doesn't exist, a.k.a undefined
     * @param {any} e a node to check if it doesn't exist
     * @returns  {boolean} true if it doesn't exist (undefined)
     */
    isMissing(e: any): boolean;
    /**
     * Create a null node.
     *
     * @return {string} a node with name representing null value
     */
    null(): string;
    /**
     * Check if a node is null.
     *
     * @param {any} e a node to check if it's null
     * @return {boolean}  true if it's null
     */
    isNull(e: any): boolean;
    /**
     * Create a number node
     *
     * @param {number} n value of the new node
     * @return {number} a node with number value
     */
    number(n: number): number;
    /**
     * Check if a node is a number
     *
     * @param {any} e a node to check if it's a number, optionally compare to a given value
     * @param {number} [n=undefined]  an optional value to compare to
     * @return {boolean} true if it's a number (and equals the given value if provided)
     */
    isNumber(e: any, n?: number): boolean;
    /**
     * Create a string node.
     *
     * @param {string} str string value of the node
     * @return {string} a node with string value
     */
    string(str: string): string;
    /**
     * Check if a node is a string, optionally compare to a given string.
     *
     * @param {any} e a node to check if it's a string
     * @param {string} [s=undefined] optional string to compare to
     * @return {*} true if it's a string (and equals the given string if provided)
     */
    isString(e: any, s?: string): any;
    /**
     * Get a value content of a symbol (not expression).
     *
     * @param {any} e a node to extract value
     * @return {any} value
     */
    valueOf(e: any): any;
    /**
     * Get the 1st child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    first(e: any): any;
    /**
     * Get the 2nd child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    second(e: any): any;
    /**
     * Get the 3rd child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    third(e: any): any;
    /**
     * Get the 4th child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    fourth(e: any): any;
    /**
     * Get the 5th child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    fifth(e: any): any;
    /**
     * Get the 6th child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    sixth(e: any): any;
    /**
     * Get the 7th child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    seventh(e: any): any;
    /**
     * Get the 8th child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    eighth(e: any): any;
    /**
     * Get the 9th child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    ninth(e: any): any;
    /**
     * Get the 10th child of a node.
     *
     * @param {any} e a node to get its child
     * @return {any} a child node if exists
     */
    tenth(e: any): any;
    /**
     * Get the n-th child of a node. Similar to the shorthand `first`, `second`, `third`, `fourth`, `fifth` ... `tenth`, but at any position provided.
     *
     * @param {any} e a node to get its child
     * @param {number} n position of the child node, starting from 1
     * @return {any} a child node if exists
     */
    nth(e: any, n: number): any;
    /**
     * Skip the first child node and get the rest
     *
     * @param {any} e a node to get its child
     * @return {any} the rest of the nodes or undefined if the input node is not an expression
     */
    rest(e: any): any;
}
