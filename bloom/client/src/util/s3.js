const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// export let getPictures = async(prefixPassed) => {
// module.exports.getPictures = async function(prefixPassed) {
//   await getPictures(prefixPassed);
// }
// var getPictures = async function(prefixPassed) {

// getting an export error, going to leave it for now

function defaultStorePictures() {
  return [
    {
      url: "/salon.jpg",
      key: "/salon.jpg"
    }
  ]
}

function defaultServicePictures() {
  return [
    {
      url: "/hair.jpg",
      key: "/hair.jpg"
    },
    {
      url: "/nails.jpg",
      key: "/nails.jpg"
    }
  ]
}

async function getPictures(prefixPassed) {
  const response = await fetch(fetchDomain + '/getImages', {
      method: "POST",
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({prefix: prefixPassed})
    })
  const pictures = await response.json()

  return pictures
}

async function getProfilePicture(userId, prefixPassed) {
  const response = await fetch(fetchDomain + '/profiles/' + userId, {
      method: "POST",
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({prefix: prefixPassed})
    })
  const picture = await response.json()

  console.log("!!!!picture is: ", picture)

  return picture
}

// function for uploading all selected files to s3
async function uploadHandler(prefix, selectedFiles) {
  // upload each image to s3
  // have to get presigned url from server before uploading directly
  for(let i = 0; i < selectedFiles.length; i++){
    var tempDate = new Date();
    var date = '_' + tempDate.getFullYear() + '-' + (tempDate.getMonth()+1) + '-' + tempDate.getDate() +' '+ tempDate.getHours()+':'+ tempDate.getMinutes()+':'+ tempDate.getSeconds();

    let values = {
      fileName: prefix + selectedFiles[i].name + date, // add the current time so its unique..
      fileType: selectedFiles[i].type
    }

    const response = await fetch(fetchDomain + '/getPresignedUrl/', {
      method: "POST",
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    const url = await response.json()

    await fetch(url, {
        method: "PUT",
        headers: {
            'Content-type': selectedFiles[i].type
        },
        body: selectedFiles[i]
      })

    // if(responseS3.status!==200){
    //   // throw an error alert
    //   store.dispatch(addAlert(response))
    // }
  }
}

// function for uploading all selected files to s3
async function deleteHandler(keysPassed) {
  // remove each image from s3
  await fetch(fetchDomain + '/deleteImages/', {
    method: "POST",
    headers: {
        'Content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({keys: keysPassed})
  })
}

export { getPictures, uploadHandler, deleteHandler, defaultStorePictures, defaultServicePictures, getProfilePicture}
