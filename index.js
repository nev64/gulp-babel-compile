'use strict';
var through = require('through2'),
    util    = require('gulp-util'),
    _       = require('lodash'),
    path    = require('path'),
    babel   = require('babel-core'),
    File    = require('vinyl');

var pluginName = 'gulp-babel-compile';

module.exports = function(options) {
    options = options || {};

    return through.obj(function(file, encoding, callback){
        if(file.isNull()){
            callback(null, file);
            return;
        }

        if (file.isStream()) {
            callback(new util.PluginError(pluginName, 'Streaming is not supported.'));
            return;
        }

        try {
            var pathOptions = path.parse(file.path);

            var transformOptions = _.chain({})
                .extend(options)
                .extend({
                    filename: file.path,
                    filenameRelative: file.relative,
                    sourceFileName: file.relative,
                    sourceMapTarget: pathOptions.base
                })
                .value();

            if (options.sourceRoot) {
                transformOptions.sourceRoot = path.join(path.relative(file.path, file.base), options.sourceRoot);
            }

            var res = babel.transform(file.contents.toString(), transformOptions);

            if (options.sourceMap) {
                res.code  += '\n//# sourceMappingURL=' + path.basename(file.path)+'.map\n';
            }

            if (!res.ignored) {
                file.contents = new Buffer(res.code);
            }

            file.babel = res.metadata;

            if(res.map && res.map.sourcesContent){
                delete res.map.sourcesContent;
            }

            if (options.sourceMap) {
                var sourceMap = new File({
                    cwd: file.cwd,
                    base: file.base,
                    relative: file.relative + '.map',
                    path: file.path + '.map',
                    contents: new Buffer(JSON.stringify(res.map)),
                    stat: {
                        isFile: function () { return true; },
                        isDirectory: function () { return false; },
                        isBlockDevice: function () { return false; },
                        isCharacterDevice: function () { return false; },
                        isSymbolicLink: function () { return false; },
                        isFIFO: function () { return false; },
                        isSocket: function () { return false; }
                    }
                });
                this.push(sourceMap);
            }

            this.push(file);
        } catch (err) {
            callback(new util.PluginError(pluginName, err, {
                fileName: file.path,
                showProperties: false
            }));
        }

        callback();
    });
};