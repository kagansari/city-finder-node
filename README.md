# Autocomplete service to search cities of world
I used major cities of the world data from [data.okfn.org](http://data.okfn.org/data/core/world-cities), which has the simplest form and most accurate writing of cities. It contains more than 20000 rows. I imported into local mongodb for simplicity, using database `city-finder`. For testing purposes, I also imported a 3000000 rows dataset fetched from [maxmind.com](https://www.maxmind.com/en/free-world-cities-database) which is not maintained or supported anymore.

Example document:
```json
{
  "name":"İstanbul",
  "slug": "istanbul",
  "country":"Turkey"
}
```

Then I implemented a simple API with one endpoint, created index on `slug` field, used basic mongodb regex search to fetch results. I was planning to use radix tree structure, but it would be overengineering since prefix regex search is lightning fast with index even when querying 3 million documents. (Do not mind [the demo](http://54.77.168.95), it is the weakest machine on AWS)

### `/search`

* **Method:** `GET`
* **URL Params:**
  * `q=String` required query parameter, should be at least 3 characters
  * `dataset=(small|large)` which data source is used (default: small)
* **Success:**
  * **200:**
    ```json
    [{
      "name":"İstanbul",
      "slug": "istanbul",
      "country":"Turkey"
    }]
    ```
* **Error:**
  * **400:** `{ message: "Enter at least 3 letters" }`
  * **429:** `{ message: "You can only do 5 searches in 3 seconds`}`

# Rate Limiter

Designing the rate limiter, I decided to use a different approach instead of well-known methods like token-bucket/leaky-bucket algorithms, which are already widely used by 3rd party solutions([*](https://github.com/ded/express-limiter)[*](https://github.com/AdamPflug/express-brute)). Alternative solution consists of a standalone service which takes parameters  time window `timeWindow` and request numbers `reqNum`, returns a middleware function. The function holds an object where each user's IP is associated with a queue. I slightly modified a [simple queue implementation](http://code.stephenmorley.org/javascript/queues/) for that purpose. Queues hold timestamps of each request. When a queue reaches maximum size `reqNum`, timestamp of incoming request and timestamp in the front of the queue are checked. If the difference is less then `timeWindow`, it means that user is trying to exceed limits and gets `429`. Blocked requests are ignored, since responding to postponed requests in an autocomplete service is obviously our last concern.

#### Middleware
```javascript
/*
 * return middleware checking each user can send at most {newReqNum} requests in {newTimeWindow} ms
 *
 * newTimeWindow - time interval (ms)
 * newReqNum     - max request number available in time interval
 */
export default function(newTimeWindow=2000, newReqNum=3) {/* return middleware */}
```

#### Logic
```javascript
/*
 * return whether user is allowed to process request
 *
 * req - express.Request
 */
function isAllowed (req) {
  const ip = req.connection.remoteAddress;
  const currentTime = (new Date()).getTime();

  if (!userMap[ip]) {
    // new user
    userMap[ip] = new Queue();
  }

  if (userMap[ip].getLength() < reqNum) {
    // user has only few request, it is OK
    userMap[ip].enqueue(currentTime);
    return true;
  }

  const initialTime = userMap[ip].peek();
  const diff = currentTime - initialTime;
  if (diff < timeWindow) {
    // user can make the next search in {timeWindow - diff} ms
    return false;
  }

  // user did not exceed limit
  userMap[ip].dequeue();
  userMap[ip].enqueue(currentTime);
  return true;
}
```

##### Demo: http://54.77.168.95/
##### DB: mongodb://54.77.168.95/city-finder (No authentication)
