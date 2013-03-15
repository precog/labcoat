package precog.labcoat.editor;

import precog.labcoat.editor.codemirror.Externs;
import precog.labcoat.editor.Macros.jsRegExp;

class QuirrelMode {
    static var punctuation = jsRegExp(~/([([{]|[)}\]]|,)/);
    static var keywords = jsRegExp(~/(difference|else|solve|if|import|intersect|new|then|union|where|with)\b/);
    static var constants = jsRegExp(~/(true|false|undefined|null)\b/);
    static var functions = jsRegExp(~/(count|distinct|load|max|mean|geometricMean|sumSq|variance|median|min|mode|stdDev|sum)\b/);
    static var operators = jsRegExp(~/(~|:=|\+|\/|\-|\*|&|\||<|>|<=|=>|!=|<>|=|!|neg|union\b)/);
    static var lineComment = jsRegExp(~/--.*$/);
    static var commentStart = jsRegExp(~/\(-/);
    static var commentEnd = jsRegExp(~/.*?-\)/);
    static var numeric = jsRegExp(~/[0-9]+(?:\\.[0-9]+)?(?:[eE][0-9]+)?/);
    static var path = jsRegExp(~/\/(?:\/[a-zA-Z_0-9-]+)+\b/);
    static var variable = jsRegExp(~/['][A-Za-z][A-Za-z_0-9]*/);
    static var string = jsRegExp(~/"(?:\\"|[^"])*"/);
    static var identifier = jsRegExp(~/[A-Za-z_][A-Za-z0-9_']*/);

    public static function init() {
        CodeMirror.defineMode("quirrel", mode);
    }

    static function mode(config: Config, parserConfig: ParserConfig) {
        return {startState: startState, token: token};
    }

    static function startState() {
        return {inComment: false};
    }

    static function token(stream: StringStream, state: Dynamic) {
        if(state.inComment) {
            if(stream.match(commentEnd) != null) {
                state.inComment = false;
                return "comment";
            }
            stream.skipToEnd();
            return "comment";
        } else if(stream.match(commentStart) != null) {
            state.inComment = true;
            return "comment";
        }

        stream.eatSpace();
        if(stream.sol() && stream.match(lineComment) != null) {
            return "comment";
        } else if(stream.match(string) != null) {
            return "string";
        } else if(stream.match(path) != null) {
            return "string";
        } else if(stream.match(keywords) != null) {
            return "keyword";
        } else if(stream.match(operators) != null) {
            return "operator";
        } else if(stream.match(constants) != null || stream.match(functions) != null) {
            return "builtin";
        } else if(stream.match(numeric) != null) {
            return "number";
        } else if(stream.match(variable) != null) {
            return "string";
        } else if(stream.match(identifier) != null) {
            return "identifier";
        } else if(stream.match(punctuation) != null) {
            return null;
        }
        stream.skipToEnd();
        return null;
    }
}
