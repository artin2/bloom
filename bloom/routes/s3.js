//CITATION: https://medium.com/@khelif96/uploading-files-from-a-react-app-to-aws-s3-the-right-way-541dd6be689
var aws = require('aws-sdk');
// var fs = require('fs');
const helper = require('../helper.js')
require('dotenv').config();

async function getPresignedUploadUrl(req, res) {
  try {
    const s3 = new aws.S3({
      region: process.env.AWSRegion,
      accessKeyId: process.env.AWSAccessKey,
      secretAccessKey: process.env.AWSSecretKey
    });  // Create a new instance of S3
    const fileName = req.body.fileName;
    const fileType = req.body.fileType;

    await s3.getSignedUrl('putObject', {
      Bucket: process.env.AWSBucket,
      Key: fileName,
      Expires: 500,
      ContentType: fileType
    }, (error, url) => {
        if (error) {
          helper.queryError(res, "Unable to get url")
        }
        else{
          helper.querySuccess(res, url, "Successfuly got url")
        }
    });
  } catch (e) {
    helper.queryError(res, "Error getting images")
  }
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
  // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
  var bitmap = new Buffer(base64str, 'base64');
  // write buffer to file
  fs.writeFileSync(file, bitmap);
  console.log('******** File created from base64 encoded string ********');
}

async function getImageObject(req, res) {
  try{
    const s3 = new aws.S3({
      region: process.env.AWSRegion,
      accessKeyId: process.env.AWSAccessKey,
      secretAccessKey: process.env.AWSSecretKey
    });  // Create a new instance of S3
    console.log("key is: ", req.body.prefix)
    let picture = await s3.getObject({
      Bucket: process.env.AWSBucket,
      Key: req.body.prefix
    }).promise()
    helper.querySuccess(res, picture, "Successfuly got profile")
  } catch(e) {
    console.log("errir is: ", e)
    helper.queryError(res, "Error getting images")
  }
}

async function getImages(req, res) {
  try{
    const s3 = new aws.S3({
      region: process.env.AWSRegion,
      accessKeyId: process.env.AWSAccessKey,
      secretAccessKey: process.env.AWSSecretKey
    });  // Create a new instance of S3

    let pictures = await s3.listObjectsV2({
      Bucket: process.env.AWSBucket,
      Prefix: req.body.prefix
    }).promise()

    let signedUrls = []
    for (let i = 0; i < pictures.Contents.length; i++) {
      var params = {
        Bucket: process.env.AWSBucket, // bucket name
        Key: pictures.Contents[i].Key,
        ResponseCacheControl: "no-cache"
      };
      var signedUrl = await getSignedUrl(s3, params)
      signedUrls.push({
        key: pictures.Contents[i].Key,
        url: signedUrl
      })
    }
    console.log("signed urlls is: ")
    console.log(signedUrls)
    helper.querySuccess(res, signedUrls, "Successfuly got pictures")
  } catch (e) {
    console.log("Error getting images", e)
    helper.queryError(res, "Error getting images")
  }
}

async function getImagesLocal(prefix) {
  try {
    const s3 = new aws.S3({
      region: process.env.AWSRegion,
      accessKeyId: process.env.AWSAccessKey,
      secretAccessKey: process.env.AWSSecretKey
    });  // Create a new instance of S3

    let pictures = await s3.listObjectsV2({
      Bucket: process.env.AWSBucket,
      Prefix: prefix
    }).promise()

    let signedUrls = []
    for (let i = 0; i < pictures.Contents.length; i++) {
      var params = {
        Bucket: process.env.AWSBucket, // bucket name
        Key: pictures.Contents[i].Key
      };
      var signedUrl = await getSignedUrl(s3, params)
      signedUrls.push({
        key: pictures.Contents[i].Key,
        url: signedUrl
      })
    }

    return signedUrls
  } catch (e) {
    console.log("Error getting images")
    return defaultStorePictures()
  }
}

async function deleteImages(req, res) {
  try {
    const s3 = new aws.S3({
      region: process.env.AWSRegion,
      accessKeyId: process.env.AWSAccessKey,
      secretAccessKey: process.env.AWSSecretKey
    });  // Create a new instance of S3

    for (let i = 0; i < req.body.keys.length; i++) {
      var params = { Bucket: process.env.AWSBucket, Key: req.body.keys[i] };

      await s3.deleteObject(params, function(err, data) {
        if (err) console.log(err);  // error
        else     console.log("deleted"); // deleted
      });
    }

    // should fix this
    helper.querySuccess(res, {}, "Successfuly deleted from s3!")
  } catch (e) {
    console.log("Error deleting images!")
    helper.queryError(res, "Error deleting images!")
  }
}

async function getSignedUrl(s3, params){
  return new Promise((resolve,reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) reject(err)
      resolve(url);
    })
});
}

function defaultStorePictures() {
  return [
    {
      url: "/salon.jpg",
      key: "/salon.jpg"
    }
  ]
}

module.exports = {
  getPresignedUploadUrl: getPresignedUploadUrl,
  getImages: getImages,
  getImagesLocal: getImagesLocal,
  deleteImages: deleteImages,
  defaultStorePictures: defaultStorePictures,
  getImageObject: getImageObject
};
