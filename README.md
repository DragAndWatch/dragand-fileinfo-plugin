# dragand-fileinfo-plugin
Simple JS library to get information about a movie or a TV show with cache integration.

We use it on the Dragand Application download at http://www.dragand.watch.

## Getting Started

### Import
  - ES6

    ```javascript

      import DragandFileInfo  from 'dragand-fileinfo-plugin';

      const FileInfo = new DragandFileInfo('THEMOVIEDB_API_KEY'); // optional

    ```

## API

### New instance
```javascript

  const Fileinfo = new DragandFileInfo('THEMOVIEDB_API_KEY'); // optional

```

### Get TV show informations
```javascript
/** Example
*
* Get TV SHOW informations
*
* @param {string} type
* @param {string} TV show name
* @param {string} Movie db api key (Optional if set in the constructor)
*/
Fileinfo.getInfo('show','game of thrones', 'THEMOVIEDB_API_KEY')
  .then( data => {
    res.send(data);
  });

// Data equals to
{ title: 'Game of Thrones',
  years: '2011',
  poster: '/jIhL6mlT7AblhbHJgEoiBIOUVl1.jpg',
  largePoster: '/mUkuc2wyV9dHLG0D0Loaw5pO2s8.jpg',
  overview: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night\'s Watch, is all that stands between the realms of men and icy horrors beyond.\n\n',
  imdb_id: 'tt0944947'
}
```

### Get Movie informations
```javascript
/** Example
*
* Get movie informations
*
* @param {string} type
* @param {string} Movie name
* @param {string} Movie db api key (Optional if set in the constructor)
*/
Fileinfo.getInfo('movie', 'deadpool', 'THEMOVIEDB_API_KEY')
  .then( data => {
    res.send(data);
  });

// Data equals to
{ title: 'Deadpool',
  years: '2016',
  poster: '/inVq3FRqcYIRl2la8iZikYYxFNR.jpg',
  largePoster: '/n1y094tVDFATSzkTnFxoGZ1qNsG.jpg',
  overview: 'Based upon Marvel Comics’ most unconventional anti-hero, DEADPOOL tells the origin story of former Special Forces operative turned mercenary Wade Wilson, who after being subjected to a rogue experiment that leaves him with accelerated healing powers, adopts the alter ego Deadpool. Armed with his new abilities and a dark, twisted sense of humor, Deadpool hunts down the man who nearly destroyed his life.',
  imdb_id: 'tt1431045' }
```

### How to use cache ?

This library use cache to avoid too many calls to TheMovieDB.
You can simply choose your cache folder (default current script directory + /cache).

```javascript
FileInfo.changeCacheDir('my_own_cache_folder');
```

You can simply avoid cache with every request by using .noCache()

```javascript
// Example
Fileinfo.noCache().getInfo('movie', 'deadpool', 'THEMOVIEDB_API_KEY')
  .then( data => {
    res.send(data);
  });
```


### Guessit

We use guess it to find some informations about a filepath
```javascript
// This is a static function
DragandFileInfo.guessitInformation('filepath')
  .then( infos => {
    console.log(infos);
  })
  .catch(err => {
    console.log(err);
  })

```
