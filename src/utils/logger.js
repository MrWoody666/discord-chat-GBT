/* eslint-disable no-console */
const colors = require('colors/safe');

class color {
  static info(message) {
    console.log(` ${colors.gray((new Date()).toLocaleString())} ${colors.bgCyan(' INFO ')}: ${message}`);
  }

  static success(message) {
    console.log(` ${colors.gray((new Date()).toLocaleString())} ${colors.bgGreen(' SUCCESS ')}: ${message}`);
  }

  static warn(message) {
    console.warn(` ${colors.gray((new Date()).toLocaleString())} ${colors.bgYellow(' WARN ')}: ${message}`);
  }

  static error(message) {
    console.error(` ${colors.gray((new Date()).toLocaleString())} ${colors.bgRed(' ERROR ')}: ${message}`);
  }
}

module.exports = color;