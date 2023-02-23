// ** this is not the best practise to work with redis in nestjs ** //

const Redis = require("redis")
const redisClient = Redis.createClient({url : ""}) //  url for production instance of redis // or ()
redisClient.connect();

module.exports.getOrSetCache =  (key, cb) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key)
                    .then (async (data, error) => {
                        if (error){
                            console.log(error)
                            return reject(error)
                        }
                        if (data){
                            console.log("cache hit")
                            return resolve(JSON.parse(data));
                        }
                        console.log("cache miss");
                        const new_data = await cb();
                        console.log(new_data)
                        console.log(key)
                        redisClient.setEx(key, 3600, JSON.stringify(new_data));
                        resolve(new_data);
                    })

    })
}

module.exports.clearCache = (key) => {
    return redisClient.del(key)
                        .then(() => {})
}