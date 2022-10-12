
export default class Logger {
    _info:any;
    _warn:any;
    _error:any;
    _debug:any;

    constructor(props) {
  
      this._info = require('debug')(props.component+":info");
      this._warn = require('debug')(props.component+":warn");
      this._error = require('debug')(props.component+":error");
      this._debug = require('debug')(props.component+":debug");
  
      this._info.enabled = true;
      this._warn.enabled = true;
      this._error.enabled = true;
  
      [
        'info',
        'warn',
        'error',
        'debug',
        '_log'
      ].forEach(fn=>this[fn]=this[fn].bind(this));
    }
  
    _log(level, args) {
      let msg = "";
      args.forEach((a,i)=>{
        msg += (i>0?" ":"");
        if(typeof a === 'string') {
          msg += "%s";
        } else if(a instanceof Error) {
          msg += "%s",
          args[i] = a.toString();
        } else if(typeof a === 'object') {
          msg += "%O";
        } else if(!isNaN(a)) {
          msg += "%d";
        }
      });
      level(msg, ...args);
    }
  
    info(...args:any) {
      this._log(this._info, [...args]);
    }
  
    warn(...args:any) {
      this._log(this._warn, [...args]);
    }
  
    error(...args:any) {
      this._log(this._error, [...args]);
    }
  
    debug(...args:any) {
      this._log(this._debug, [...args]);
    }
  }