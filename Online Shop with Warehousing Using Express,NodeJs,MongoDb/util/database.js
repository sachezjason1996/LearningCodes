// const { MongoClient } = require('mongodb');

// let _db;

// const mongoConnect = (callback) => {
//     MongoClient.connect(
//         'mongodb+srv://kinoha321:gonzoldik123@cluster0.afz9hau.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0',
//         {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         }
//     )
//     .then(client => {
//         console.log('Connected to MongoDB Atlas!');
//         _db = client.db();
//         callback();
//     })
//     .catch(err => {
//         console.error('MongoDB Connection Failed!', err);
//         throw err;
//     });
// };

// const getDb = () => {
//     if (_db) {
//         return _db;
//     }
//     throw 'No database found!';
// };

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
