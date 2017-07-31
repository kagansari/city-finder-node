import Queue from './queue';

// { ip: Queue }
const userMap = {};
// time interval (ms), max request number
let timeWindow, reqNum;

/*
 * return whether user is allowed to process request
 *
 * req - express.Request
 */
function isAllowed (req) {
  const ip = req.connection.remoteAddress;
  const currentTime = (new Date()).getTime();

  if (!userMap[ip]) {
    // console.log(`new user ${ip}`);
    userMap[ip] = new Queue();
  }

  if (userMap[ip].getLength() < reqNum) {
    // console.log(`user ${ip} has only few request, it is OK`);
    userMap[ip].enqueue(currentTime);
    return true;
  }

  const initialTime = userMap[ip].peek();
  const diff = currentTime - initialTime;
  if (diff < timeWindow) {
    // console.log(`user ${ip} can make the next search in ${timeWindow - diff} ms`);
    return false;
  }

  // console.log(`user ${ip} did not exceed limit`);
  userMap[ip].dequeue();
  userMap[ip].enqueue(currentTime);
  return true;
}

// remove out of date queues
function refresh() {
  const currTime = (new Date()).getTime();
  Object.keys(userMap).forEach((ip) => {
    const initTime = userMap[ip].peek();
    const threshold = (currTime - initTime) * 2;
    // difference between front and back of the queue can be at most {timeWindow}
    if (currTime - initTime > timeWindow*2) {
      delete userMap[ip];
      // console.log(`user ${ip} has not visited for a long time, deleting`);
    }
  })
}

/*
 * return middleware checking each user can send at most {newReqNum} requests in {newTimeWindow} ms
 *
 * newTimeWindow - time interval (ms)
 * newReqNum     - max request number available in time interval
 */
export default function(newTimeWindow=2000, newReqNum=3) {
  reqNum = newReqNum;
  timeWindow = newTimeWindow;
  setInterval(refresh, 10000);

  return (req, res, next) => {
    if (isAllowed(req)) {
      next();
    } else {
      res.status(429).send({ message: `You can only do ${reqNum} searches in ${timeWindow/1000} seconds`});
    }
  }
}
