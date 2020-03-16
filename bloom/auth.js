

const argon2 = require('argon2');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

async function generateSalt() {

  try {
    const salt = await crypto.randomBytes(32).toString('base64');
    console.log("Created Salt")
    return salt;
  }
  catch(err) {
    console.log(err);
  }

}


async function generateHash(pw) {

  try {

    const salt = await generateSalt();
    const hash = await argon2.hash(pw, salt);
    console.log('Successfully created Argon2 hash:', hash);
    return hash;

  }
  catch(err) {

    console.log(err);
    return null
  }


  //
  // console.log(hash);
  //
  // crypto.randomBytes(32).toString('base64').then(salt => {
  //
  //   console.log(salt);
  //
  //   await argon2.hash(pw, salt).then(hash => {
  //     console.log('Successfully created Argon2 hash:', hash);
  //     console.log(hash);
  //     return hash;
  //   });
  //
  //   // return null;
  // })
  //
  // .catch((err) => {
  //   console.log(err)
  // });

}

async function verifyHash(dbPw, userPw) {

  try {
    
    const verified = await argon2.verify(dbPw, userPw);

    if(verified) {
      console.log('Successful Password Supplied!');
      return true;
    }
    else {
      console.log('Invalid Password Supplied!');
      return false;
    }

  }
  catch(err) {

    console.log('Invalid password supplied!');
    return false;
  };

}


const generateToken = (res, id, first_name, last_name) => {
  const expiration = process.env.DB_ENV === 'dev' ? 100 : 604800000;
  const token = jwt.sign({ id, first_name, last_name }, process.env.JWT_SECRET, {
    expiresIn: process.env.DB_ENV === 'dev' ? '1d' : '7d',
  });
  return res.cookie('token', token, {
    expires: new Date(Date.now() + expiration),
    secure: false, // set to true if your using https
    httpOnly: false,
  });
};

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || '';
  try {
    if (!token) {
      return res.status(401).json('You need to Login')
    }
    const decrypt = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decrypt.id,
      first_name: decrypt.first_name,
      last_name: decrypt.last_name
    };
    next();
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};

module.exports = {
    generateHash: generateHash,
    verifyHash: verifyHash,
    generateToken: generateToken,
    verifyToken: verifyToken,
};
