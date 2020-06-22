const helper = require('../helper.js')
const db = require('../db.js');


async function addReview(req, res) {
  if (req.body.store_id && req.body.email && 'comment' in req.body && req.body.rating) {
    console.log("adding review")
    let query = 'INSERT INTO store_reviews(rating, comment, email, store_id) VALUES ($1, $2, $3, $4) RETURNING *'
    let values = [req.body.rating, req.body.comment, req.body.email, req.body.store_id]

    console.log("query is", query, "values is", values)
    await db.client.connect(async (err, client, done) => {
      // try to add user to user table
      await db.client.query(query, values, async (err, result) => {
        if (err) {
          helper.queryError(res, err);
        }

        // if we were able to add the user successfuly
        if (result && result.rows.length == 1) {
          query = 'UPDATE stores SET rating_count = rating_count + 1, rating_total = rating_total + $1 where id = $2 RETURNING *'
          values = [req.body.rating, req.body.store_id]
          console.log("second query is:", query, values)
          await db.client.query(query, values, async (errTwo, resultTwo) => {
            done()
            if (errTwo) {
              helper.queryError(res, errTwo);
            }
  
            // if we were able to add the user successfuly
            if (resultTwo && resultTwo.rows.length == 1) {
              helper.querySuccess(res,result.rows[0], "Successfully Created Review!");
            }
            else{
              helper.queryError(res, "Could not Update Store Reviews!");
            }
          });
        }
        else{
          helper.queryError(res, "Could not Create Review!");
        }
      });
      if (err) {
        helper.dbConnError(res, err);
      }
    });
  }
  else {
    res.send('Missing a Parameter');
    res.status(400);
  }
}

async function getReviews(req, res) {
  db.client.connect((err, client, done) => {
    let query = 'SELECT * FROM store_reviews WHERE store_id=' + req.params.store_id

    db.client.query(query, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to retrieve the appointments
        if (result && result.rows.length > 0) {
          helper.querySuccess(res,result.rows[0], "Successfully got store reviews!");
        }
        else {
          helper.queryError(res, "Could not retrieve reviews!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
};

async function getUsersStoreReviewInternal(email, store_id) {
  try{
    let query = 'SELECT * FROM store_reviews WHERE store_id=$1 and email=$2'
    console.log("query is:", query)
    let values = [store_id, email]
    console.log("values are", values)
    
    return new Promise(function(resolve, reject) {
      db.client.connect((err, client, done) => {
        let query = 'SELECT * FROM store_reviews WHERE store_id=$1 and email=$2'
        console.log("query is:", query)
        let values = [store_id, email]
        console.log("values are", values)
        db.client.query(query, values, (err, result) => {
          console.log("2,")
          done()
          if (err) {
            console.log("3 error,", err)
            reject(err)
          }
    
          console.log("results,", result.rows)
          resolve(result.rows)
        });
    
        if (err) {
          console.log("4 error,", err)
          reject(err)
        }
      });
    })
  }
  catch(err){
    console.log("Some sort of error!", err);
    reject(err)
  }
};


module.exports = {
  addReview: addReview,
  getReviews: getReviews,
  getUsersStoreReviewInternal: getUsersStoreReviewInternal
};
