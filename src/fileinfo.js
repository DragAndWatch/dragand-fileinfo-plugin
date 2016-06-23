import guessit from 'guessit-wrapper';
import theMovieDb from 'moviedb';
import fs from 'fs';
import mkdirp from 'mkdirp';
import Q from 'q';

export default class DragAndFileInfo {
  constructor({
    theMovieDbKey=null
  } = {}) {
    // Set theMovieDb Instance
    this.setMovieDbInstance(theMovieDbKey);

    // Cache config
    this.cache = {
      base: require('path').dirname(require.main.filename) + '/cache',
      get show() { return this.base + '/shows'; },
      get movie() { return this.base + '/movies'; },
      use: true
    }
  }

  /**
   * Set theMovieDB instance
   *
   *  @param {string} api key
   *
   *  @return {void}
   */
  setMovieDbInstance(apiKey) {
    if (apiKey && !this.MovieDB) {
      this.MovieDB = new theMovieDb(apiKey);
    }
  }

  /**
   * Change Cache base directory
   *
   *  @param {string} cache path
   *
   *  @return {void}
   */
  changeCacheDir(path) {
    this.cache.base = path;
  }

  /**
   * Do not use cache
   *
   *  @return {void}
   */
  noCache() {
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
  getCache(path, cb) {
    if (fs.existsSync(path)){
      fs.stat(path, cb);
    }else {
      cb({err: true});
    }
  }


  /**
   * Write a new file cache
   *
   *  @param {string} type of (movie OR serie)
   *  @param {string} filname
   *  @param {Object} data
   */
  writeCache(type, filename, data) {
    if (data) {
      mkdirp(this.cache[type], () => {
        fs.writeFile(this.cache[type] + '/' + filename, JSON.stringify(data));
      })
    }
  }

  /**
   * Get informations about a tv show
   *
   *  @param {string} show nae
   *  @param {string} themovieDB api key
   */
  getInfo(type, name, theMovieDbKey=null) {
    let deferred = Q.defer();

    if (typeof name != 'string' ) {
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
    const callApi = (cb) => {
      if (type == 'show') {
        this.infoSerie(name, (err, media) => {
          if (err) { return deferred.reject(err); }
          deferred.resolve(media);
          cb(media);
        });
      }else {
        this.infoMovie(name, (err, media) => {
          if (err) { return deferred.reject(err); }
          deferred.resolve(media);
          cb(media);
        });
      }
    }

    // Checking MovieDB instance
    this.setMovieDbInstance(theMovieDbKey);

    if (this.cache.use) {
      const cacheFilePath = this.cache[type];
      const filename = this.escapeName(name) + '.json';
      const fullPath = cacheFilePath + '/' + filename;

      this.getCache(fullPath, (err, stats) => {
        if (err) {
          callApi( media => this.writeCache(type, filename, media) );
        }else {
          deferred.resolve(JSON.parse(fs.readFileSync(fullPath, 'utf8')));
        }
      });
    }else {
      callApi(() => {});
    }

    return deferred.promise;
  }


  /**
   * Get movie info from imDB
   *
   *  @param {string} movie name
   *  @param {function} callback
   */
  infoMovie(name, cb) {
    let media = {};

    this.MovieDB.searchMovie({query: name}, (err, results) => {
      if(err) { return cb(err); }

      const data = results.results;

      if (!data[0]) {
        return cb(err);
      }

      media = {
        title       : data[0].original_title,
        years       : data[0].release_date.split('-')[0],
        poster      : data[0].poster_path,
        largePoster : data[0].backdrop_path
      };

      this.MovieDB.movieInfo({id:data[0].id}, (err, movie) => {
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
  infoSerie(showName, cb) {
    let media = {};
    this.MovieDB.searchTv({query: showName}, (err, results) => {
      if(err) { return cb(err); }

      const data = results.results;

      if (!data[0]) {
        return cb(err);
      }

      media = {
        title       : data[0].name,
        years       : data[0].first_air_date.split('-')[0],
        poster      : data[0].poster_path,
        largePoster : data[0].backdrop_path
      };

      this.MovieDB.tvInfo({id:data[0].id}, (err, movie) => {
        media.overview = movie.overview;
        media.imdb_id = movie.imdb_id;
        this.MovieDB.tvExternalIds({id:data[0].id}, (err, externals_id) => {
          media.imdb_id = externals_id.imdb_id;
          cb(null, media);
        })

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
  escapeName(name) {
    return name.toLowerCase().split(' ').join('_');
  }


  /**
   * Guess It information from a filepath
   *
   *  @param {string} file path
   *
   *  @return {Promise}
   */
  static guessitInformation(filePath) {
    return guessit.parseName(filePath)
  }
}
