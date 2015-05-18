var _ = require('lodash');
var core = require('./core');
var globalVar = require('./variable');
var io = require('./io');
var gulp = require('./gulp');

module.exports =  _.merge({}, core, globalVar, io, gulp);
