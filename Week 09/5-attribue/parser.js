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