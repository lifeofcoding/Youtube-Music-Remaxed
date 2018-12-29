const yas = require('youtube-audio-server')
process.env.KEY = 'AIzaSyC3_5fN3lbGKuTWCC0Dwhd0hJ_X6wh8kXw';

const _ = require('lodash')

new class Youtube {
    constructor() {
      // Start listener (REST API).
      yas.listen(7331, () => {
          console.log(`Listening on port http://localhost:7331`)
      })
      
      this.yas = yas;
    }

    search(keywords, mType) {
        var streamUrl = 'http://127.0.0.1:7331';
        return new Promise((resolve, reject)  => {
            yas.search({
              query: keywords,
              page: null
            },
            (err, data) => {
              console.log('RESULTS:', data || err)

              var results = _.map(data.items, (item) => {
                  console.log(item);
                  return {
                      title: item.snippet.title,
                      url: streamUrl + '/' + item.id.videoId
                  };
              });

              resolve(results);
            })
        });
    }
}
