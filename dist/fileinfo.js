'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _guessitWrapper = require('guessit-wrapper');

var _guessitWrapper2 = _interopRequireDefault(_guessitWrapper);

var _moviedb = require('moviedb');

var _moviedb2 = _interopRequireDefault(_moviedb);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DragAndFileInfo = function () {
  function DragAndFileInfo() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$theMovieDbKey = _ref.theMovieDbKey;
    var theMovieDbKey = _ref$theMovieDbKey === undefined ? null : _ref$theMovieDbKey;

    _classCallCheck(this, DragAndFileInfo);

    // Set theMovieDb Instance
    this.setMovieDbInstance(theMovieDbKey);

    // Cache config
    this.cache = {
      base: require('path').dirname(require.main.filename) + '/cache',
      get show() {
        return this.base + '/shows';
      },
      get movie() {
        return this.base + '/movies';
      },
      use: true
    };
  }

  /**
   * Set theMovieDB instance
   *
   *  @param {string} api key
   *
   *  @return {void}
   */


  _createClass(DragAndFileInfo, [{
    key: 'setMovieDbInstance',
    value: function setMovieDbInstance(apiKey) {
      if (apiKey && !this.MovieDB) {
        this.MovieDB = new _moviedb2.default(apiKey);
      }
    }

    /**
     * Change Cache base directory
     *
     *  @param {string} cache path
     *
     *  @return {void}
     */

  }, {
    key: 'changeCacheDir',
    value: function changeCacheDir(path) {
      this.cache.base = path;
    }

    /**
     * Do not use cache
     *
     *  @return {void}
     */

  }, {
    key: 'noCache',
    value: function noCache() {
      this.cache.use = false;
      return this;
    }

    /**
     * Get cache data
     *
     *  @param {string} cache file
     *  @param {function} callback
     *
     *  @return {void}
     */

  }, {
    key: 'getCache',
    value: function getCache(path, cb) {
      if (_fs2.default.existsSync(path)) {
        _fs2.default.stat(path, cb);
      } else {
        cb({ err: true });
      }
    }

    /**
     * Write a new file cache
     *
     *  @param {string} type of (movie OR serie)
     *  @param {string} filname
     *  @param {Object} data
     */

  }, {
    key: 'writeCache',
    value: function writeCache(type, filename, data) {
      var _this = this;

      if (data) {
        (0, _mkdirp2.default)(this.cache[type], function () {
          _fs2.default.writeFile(_this.cache[type] + '/' + filename, JSON.stringify(data));
        });
      }
    }

    /**
     * Get informations about a tv show
     *
     *  @param {string} show nae
     *  @param {string} themovieDB api key
     */

  }, {
    key: 'getInfo',
    value: function getInfo(type, name) {
      var _this2 = this;

      var theMovieDbKey = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var deferred = _q2.default.defer();

      if (typeof name != 'string') {
        throw 'name should be a string';
      }

      // Checking type
      if (['movie', 'show'].indexOf(type) == -1) {
        throw 'You have set type with "movies" or "shows"';
      }

      // Checking cache
      if (!theMovieDbKey && !this.MovieDB) {
        throw 'You have to set a MovieDB api Key';
      }

      /**
       * Calling TheMovieDB API
       */
      var callApi = function callApi(cb) {
        if (type == 'show') {
          _this2.infoSerie(name, function (err, media) {
            if (err) {
              return deferred.reject(err);
            }
            deferred.resolve(media);
            cb(media);
          });
        } else {
          _this2.infoMovie(name, function (err, media) {
            if (err) {
              return deferred.reject(err);
            }
            deferred.resolve(media);
            cb(media);
          });
        }
      };

      // Checking MovieDB instance
      this.setMovieDbInstance(theMovieDbKey);

      if (this.cache.use) {
        (function () {
          var cacheFilePath = _this2.cache[type];
          var filename = _this2.escapeName(name) + '.json';
          var fullPath = cacheFilePath + '/' + filename;

          _this2.getCache(fullPath, function (err, stats) {
            if (err) {
              callApi(function (media) {
                return _this2.writeCache(type, filename, media);
              });
            } else {
              deferred.resolve(JSON.parse(_fs2.default.readFileSync(fullPath, 'utf8')));
            }
          });
        })();
      } else {
        callApi(function () {});
      }

      return deferred.promise;
    }

    /**
     * Get movie info from imDB
     *
     *  @param {string} movie name
     *  @param {function} callback
     */

  }, {
    key: 'infoMovie',
    value: function infoMovie(name, cb) {
      var _this3 = this;

      var media = {};

      this.MovieDB.searchMovie({ query: name }, function (err, results) {
        if (err) {
          return cb(err);
        }

        var data = results.results;

        if (!data[0]) {
          return cb(err);
        }

        media = {
          title: data[0].original_title,
          years: data[0].release_date.split('-')[0],
          poster: data[0].poster_path,
          largePoster: data[0].backdrop_path
        };

        _this3.MovieDB.movieInfo({ id: data[0].id }, function (err, movie) {
          media.overview = movie.overview;
          media.imdb_id = movie.imdb_id;

          cb(null, media);
        });
      });
    }

    /**
     * Get tvShow information
     *
     *  @param {string} show name
     *  @param {function} callback
     */

  }, {
    key: 'infoSerie',
    value: function infoSerie(showName, cb) {
      var _this4 = this;

      var media = {};
      this.MovieDB.searchTv({ query: showName }, function (err, results) {
        if (err) {
          return cb(err);
        }

        var data = results.results;

        if (!data[0]) {
          return cb(err);
        }

        media = {
          title: data[0].name,
          years: data[0].first_air_date.split('-')[0],
          poster: data[0].poster_path,
          largePoster: data[0].backdrop_path
        };

        _this4.MovieDB.tvInfo({ id: data[0].id }, function (err, movie) {
          media.overview = movie.overview;
          media.imdb_id = movie.imdb_id;
          _this4.MovieDB.tvExternalIds({ id: data[0].id }, function (err, externals_id) {
            media.imdb_id = externals_id.imdb_id;
            cb(null, media);
          });
        });
      });
    }

    /**
     * Replace ' ' by '_' on a string
     *
     *  @param {string} base name
     *
     *  @return {string} no space name
     */

  }, {
    key: 'escapeName',
    value: function escapeName(name) {
      return name.toLowerCase().split(' ').join('_');
    }

    /**
     * Guess It information from a filepath
     *
     *  @param {string} file path
     *
     *  @return {Promise}
     */

  }], [{
    key: 'guessitInformation',
    value: function guessitInformation(filePath) {
      return _guessitWrapper2.default.parseName(filePath);
    }
  }]);

  return DragAndFileInfo;
}();

exports.default = DragAndFileInfo;