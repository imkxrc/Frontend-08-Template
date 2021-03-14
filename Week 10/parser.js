const { match } = require("assert");
const css = require("css");
const EOF = Symbol("EOF");
const layout = require("./layout.js");

let currentToken = null;
let currentAttribute = null;

let stack = [{type: "document", children: []}];

// 加入新的函数，addCSSRules, 把css的规则存到数组里
let rules = [];
function addCSSRules(text){
    var ast = css.parse(text);
    console.log(JSON.stringify(ast, null, "    "));
    rules.push(...ast.stylesheet.rules);
};

function computeCSS(element){
    let elements = stack.slice().reverse();
    if(!element.computedStyle) element.computedStyle = {};
    
    for(let rule of rules){
        let selectorParts = rule.selectors[0].split(" ").reverse();
        if(!match(element, selectorParts[0])) continue;

        let matched = false;
        let j = 1;
        for(let i = 0; i < elements.length; i++){
            if(match(elements[i]), selectorParts[j]){
                j++;
            };
        };
        if(j>=selectorParts.length) matched = true;
        if(matched){
            let sp = specificity(rule.selectorParts[0]);
            let computedStyle = element.computedStyle;
            for(let declaration of rule.declaration){
                if(!computedStyle[declaration.propery]) computedStyle[declaration.propery] = {};
                
                if(!computedStyle[declaration.propery].specificity){
                    computedStyle[declaration.propery].value =  declaration.value;
                    computedStyle[declaration.propery].specificity = sp;
                } else if (compare (computedStyle[declaration.propery].specificity, sp)<0) {
                    computedStyle[declaration.propery].value =  declaration.value;
                    computedStyle[declaration.propery].specificity = sp;
                };
                
            };
            console.log(element.computedStyle);
        };
    };
};

function specificity(selector){
    let p = [0, 0, 0, 0];
    let selectorParts = selector.split(" ");
    for(let part of selectorParts){
        if (part.charAt(0) == "#"){
            p[1] += 1;
        } else if (part.charAt(0) == ".") {
            p[2] += 1;
        } else {
            p[3] += 1;
        };
    };
    return p;
};

function compare (sp1, sp2) {
    if(sp1[0] - sp2[0]) return sp1[0] - sp2[0];
    if(sp1[1] - sp2[1]) return sp1[1] - sp2[1];
    if(sp1[2] - sp2[2]) return sp1[2] - sp2[2];
    return sp1[3] - sp2[3];
};

function match(element, selector){
    if(!selector || !element.attributes) return ;
    if(selector.charAt(0) == "#"){
        let attr = element.attributes.filter(attr => attr.name == "id")[0];
        if(attr && attr.value == selector.replace("#", '')) return ;
    } else if (selector.charAt(0) == "."){
        let attr = element.attributes.filter(attr => attr.name == "class")[0];
        if(attr && attr.value == selector.replace(".", '')) return ;
    } else {
        if(element.tagName == selector) return true;
    };
    return false;
};

function emit(token){
    if(token.type == "text"){
        return ;
    };
    let top = stack[stack.length - 1];

    if(token.type == "startTag"){
        let element = {
            type: "element",
            children: [],
            attributes: []
        };

        element.tagName = token.tagName;
        for(let p in token){
            if(p != "type" && p != "tagName"){
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
            };
            
        };
        computeCSS(element);
        top.children.push(element);
        element.parent = top;
        
        if(!token.isSelfClosing) stack.push(element);
            currentTextNode = null;
    } else if (token.type == "endTag"){
        if(top.tagName != token.tagName){
            throw new Error(" Tag start end doesn't match");
        } else {
            if(top.tagName == "style"){
                addCSSRules(top.children[0].content);
            };
            layout(top);
            stack.pop();
        };
        currentTextNode = null;
    } else if (token.type == "text"){
        if (currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: ""
            };
            top.children.push(currentTextNode);
        };
        currentTextNode.content += token.content;
    };


};

const EOF = Symbol("EOF");

function data(c){
    if(c == "<"){
        return tagOpen;
    } else if(c == EOF){
        return ;
    } else {
        return data;
    };
};

function tagOpen(c){
    if(c == "/") {
        return endTagOpen;
    } else if(c.match(/^[a-zA-Z]$/)){
        return tagName(c);
    } else {

    };
};

function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)){
        return tagName(c);
    } else if (c == ">") {

    } else if (c == EOF) {

    } else {

    };
};

function tagName (c) {
    if(c.match(/^[\t\n\f]$/)){
        return beforeAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == ">") {
        return data;
    } else {
        return tagName;
    };
};

function beforeAttributeName (c) {
    if(c.match(/^[\t\n\f]$/)){
        return beforeAttributeName;
    } else if (c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    } else if (c == "=") {
        return beforeAttributeName;
    } else {
        currentAttribute = {
            name: "",
            value: ""
        };
        return attriButeName(c);
    };
};
function attriButeName(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    } else if(c == "=") {
        return beforeAttributeValue;
    } else if(c == "\U000") {

    } else if(c == "\"" || c == ">" || c == "'") {

    } else {

    } ;
};
function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue;
    } else if(c == "\"") {
        return doubleQuotedAttributeValue;
    } else if(c == "\'") {
        return singleQuotedAttributeValue;
    } else if(c == ">") {

    } else {
        return unQuotedAttributeValue(c);
    } ;
};

function doubleQuotedAttributeValue(c){
    if(c == "\""){
        currentToken[currentAttribute.name] = currentAttribute.value;
    } else if(c == "\U000"){

    } else if(c == EOF){

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    };
};
function singleQuotedAttributeValue(c){
    if(c == "\'"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if(c == "c"){

    } else if(c == EOF){

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    };
};
function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    } else if(c == "/"){
        return selfClosingStartTag
    }  else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == EOF){

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    };
};
function unQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if(c == "/"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag
    }  else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == "\U000"){

    } else if(c == "\"" || c == "<" || c == "'" || c == "="){

    } else if(c == EOF){

    }  else {
        currentAttribute.value += c;
        return unQuotedAttributeValue;
    };
};

function selfClosingStartTag (c) {
    if (c == ">") {
        currentToken.isSelfClosing = true;
        return data;
    } else if (c == "EOF") {
        
    } else {
        
    };
};

module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for(let c of html){
        state = state(c);
    };
    state = state(EOF);
};








