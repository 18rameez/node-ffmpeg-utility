var fs = require("fs"),
  path = require("path"),
  when = require("when");

var errors = require("./errors"),
  presets = require("./presets"),
  utils = require("./utils"),
  config = require("./configs")

const Image = function (fileName) {

  this.fileName = fileName;

  var commands = new Array(),
    inputs = new Array(),
    filtersComlpex = new Array(),
    output = null;

  this.convertImage = function (outputName, settings, callback) {
    const defaultSettings = {
      quality: null,
      resize: null,
      pixelFormat: null,
      alphaMode: null,
    };

    if (settings !== null) utils.mergeObject(defaultSettings, settings);

    if (defaultSettings.quality) {
      this.addCommand("-quality", settings.quality);
    }

    if (defaultSettings.resize) {
      this.addCommand("-resize", settings.resize);
    }

    if (defaultSettings.pixelFormat) {
      this.addCommand("-pix_fmt", settings.pixelFormat);
    }

    if (defaultSettings.alphaMode) {
      this.addCommand("-alpha_mode", settings.resize);
    }

    setOutput(outputName)
    this.addInput(this.fileName)
    console.log(commands);
    execCommand(callback);
  };

  var execCommand = function (callback) {
    var deferred =
      typeof callback != "function" ? when.defer() : { promise: null };
    var finalCommands = ["ffmpeg -i"]
      .concat(inputs.map(utils.addQuotes).join(" -i "))
      .concat(commands.join(" "))
      .concat([output]);

    resetCommands(this);

    utils.exec(finalCommands, new config(), function (error, stdout, stderr) {
      var result = stdout;
      if (!error) {
        if (typeof callback == "function") {
          callback(error, "sucess");
        } else {
          deferred.resolve(result);
        }
      } else {
        if (typeof callback == "function") {
          callback(error, result);
        } else {
          deferred.reject(error);
        }
      }
    });

    return deferred.promise;
  };

  var resetCommands = function (self) {
    commands = new Array();
    inputs = [self.file_path];
    filtersComlpex = new Array();
    output = null;
    options = new Object();
  };

  this.addInput = function (argument) {
    inputs.push(argument);
  };

  this.addFilterComplex = function (argument) {
    filtersComlpex.push(argument);
  };

  var setOutput = function (path) {
    output = path;
  };

  this.addCommand = function (command, argument) {
    if (utils.in_array(command, commands) === false) {
      commands.push(command);
      if (argument != undefined) commands.push(argument);
    } else throw errors.renderError("command_already_exists", command);
  };
};

module.exports = Image;
