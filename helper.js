const crypto = require('crypto');
const path = require('path');
var uuid = require('uuid');
// var apn = require('apn');
const fileExtension = require('file-extension');
const util = require('util');
const fs = require('fs-extra');
const sharp = require('sharp'); //for image thumbnail
const bcrypt = require('bcrypt');

module.exports = {
  checkauth: async function (authhash) {
    try {
      let checkvalid = await Users.findOne({ where: { authKey: authhash } });
      if (checkvalid) {
        return checkvalid.toJSON();
      } else {
        return 0;
      }
    } catch (err) {
      throw err;
    }
  },

  fileUpload: (file, folder) => {
    try {
      if (file.name) {
        let extention = file.mimetype.split('/')[1];
        image = `${uuid()}.${extention}`;

        let imagePath = `/uploads/${folder}/${image}`;

        file.mv(process.cwd() + `/uploads/${folder}/` + image, function (err) {
          if (err) return err;
        });

        return imagePath;
      } else {
        return '';
      }
    } catch (err) {
      console.log(err);
    }
  },
  // validObject: async function (required, non_required, res) {
  //     let message ='';
  //     let empty = [];
  //     let table_name = (required.hasOwnProperty('table_name')) ? required.table_name : 'users';

  //     for (let key in required) {
  //         if (required.hasOwnProperty(key)) {
  //             if (required[key] == undefined || required[key] == '') {
  //                 empty.push(key);
  //             }
  //         }
  //     }

  //     if (empty.length != 0) {
  //         message = empty.toString();
  //         if (empty.length > 1) {
  //             message += " fields are required"
  //         } else {
  //             message += " field is required"
  //         }
  //         res.status(400).json({
  //             'success': false,
  //             'message': message,
  //             'code': 400,
  //             'data': {}
  //         });
  //         return;
  //     } else {
  //         if (required.hasOwnProperty('security_key')) {
  //             if (required.security_key != "love2fy") {
  //                 message = "Invalid security key";
  //                 res.status(403).json({
  //                     'success': false,
  //                     'message': message,
  //                     'code': 403,
  //                     'data': {}
  //                 });
  //                 res.end();
  //                 return false;
  //             }
  //         }
  //         if (required.hasOwnProperty('password')) {
  //             // const saltRounds = 10;
  //             // var myPromise = await new Promise(function (resolve, reject) {
  //             //     bcrypt.hash(required.password, saltRounds, function (err, hash) {
  //             //         if (!err) {

  //             //             resolve(hash);
  //             //         } else {
  //             //             reject('0');
  //             //         }
  //             //     });
  //             // });
  //             // // required.password= crypto.createHash('sha1').update(required.password).digest('hex');
  //             // required.password = myPromise;
  //             // required.password = await this.getBcryptHash(required.password);
  //         }

  //         if(required.hasOwnProperty('access_token')) {
  //             let findUser = await users.findOne({
  //                 where: {
  //                     access_token: required.access_token
  //                 }
  //             });

  //             if(findUser) {
  //                 findUser = findUser.toJSON();
  //                 required.user_id = findUser.id;
  //             } else {
  //                 let message = "Invalid auth key";

  //                 res.status(401).json({
  //                     'success': false,
  //                     'message': message,
  //                     'code': 401,
  //                     'data': {}
  //                 });
  //                 res.end();
  //                 return false;
  //             }
  //         }

  //         /* if (required.hasOwnProperty('checkexit')) {
  //             if (required.checkexit === 1) {
  //                 if (required.hasOwnProperty('email')) {
  //                     required.email = required.email.toLowerCase();

  //                     if (await this.checking_availability(required.email, 'email', table_name)) {
  //                         message = "this email is already register kindly use another";
  //                         res.status(403).json({
  //                             'success': false,
  //                             'message': message,
  //                             'code': 403,
  //                             'body': []
  //                         });
  //                         res.end();
  //                         return false;
  //                     }
  //                 }
  //                 if (required.hasOwnProperty('name') && required.name != undefined) {
  //                     required.name = required.name.toLowerCase();

  //                     if (await this.checking_availability(required.name, 'name', table_name)) {
  //                         message = "name is already in use";
  //                         res.status(403).json({
  //                             'success': false,
  //                             'message': message,
  //                             'code': 403,
  //                             'body': []
  //                         });
  //                         return false;
  //                     }
  //                 }

  //             }
  //         }

  //         if (non_required.hasOwnProperty('name') && non_required.name != undefined) {
  //             non_required.name = non_required.name.toLowerCase();

  //             if (await this.checking_availability(non_required.name, 'name', table_name)) {
  //                 message = "name is already in use";
  //                 res.status(403).json({
  //                     'success': false,
  //                     'message': message,
  //                     'code': 403,
  //                     'body': []
  //                 });
  //                 return false;
  //             }
  //         } */

  //         const marge_object = Object.assign(required, non_required);
  //         delete marge_object.checkexit;

  //         for(let data in marge_object){
  //             if(marge_object[data]==undefined){
  //                 delete marge_object[data];
  //             }else{
  //                 if(typeof marge_object[data]=='string'){
  //                     marge_object[data]=marge_object[data].trim();
  //                 }
  //             }
  //         }

  //         return marge_object;
  //     }
  // },

  validObject: async function (required, nonRequired) {
    let message = '';
    let empty = [];

    let model =
      required.hasOwnProperty('model') && models.hasOwnProperty(required.model)
        ? models[required.model]
        : models.user;

    for (let key in required) {
      if (required.hasOwnProperty(key)) {
        if (
          required[key] == undefined ||
          (required[key] === '' &&
            (required[key] !== '0' || required[key] !== 0))
        ) {
          empty.push(key);
        }
      }
    }

    if (empty.length != 0) {
      message = empty.toString();
      if (empty.length > 1) {
        message += ' fields are required';
      } else {
        message += ' field is required';
      }
      throw {
        code: 400,
        message: message,
      };
    } else {
      if (required.hasOwnProperty('securitykey')) {
        if (required.securitykey != securityKey) {
          message = 'Invalid security key';
          throw {
            code: 400,
            message: message,
          };
        }
      }

      if (required.hasOwnProperty('checkExists') && required.checkExists == 1) {
        const checkData = {
          email: 'Email already exists, kindly use another.',
          phone: 'Phone already exists, kindly use another',
          // phone: 'Phone number already exists, kindly use another',
        };

        for (let key in checkData) {
          if (required.hasOwnProperty(key)) {
            const checkExists = await model.findOne({
              where: {
                [key]: required[key].trim(),
                ...(key == 'phone' && required.hasOwnProperty('countryCode')
                  ? {
                      countryCode: required.countryCode,
                    }
                  : {}),
              },
            });
            if (checkExists) {
              throw {
                code: 400,
                message: checkData[key],
              };
            }
          }
        }
      }

      const mergeObject = Object.assign(required, nonRequired);
      delete mergeObject.checkexit;
      delete mergeObject.securitykey;

      if (
        mergeObject.hasOwnProperty('password') &&
        mergeObject.password == ''
      ) {
        delete mergeObject.password;
      }

      for (let data in mergeObject) {
        if (mergeObject[data] == undefined) {
          delete mergeObject[data];
        } else {
          if (typeof mergeObject[data] == 'string') {
            mergeObject[data] = mergeObject[data].trim();
          }
        }
      }

      if (mergeObject.hasOwnProperty('req')) {
        const req = mergeObject.req;
        delete mergeObject.req;
        mergeObject.user = req.user;
        // global.req = req;
      }

      // if (debugMode)
      console.log(mergeObject, '=====================> requestData');

      return mergeObject;
    }
  },

  error: function (res, err) {
    console.log(err);
    console.log('error');
    // console.log(JSON.stringify(ReferenceError));
    // console.log(ReferenceError);
    // return false;
    let code =
      typeof err === 'object'
        ? err.statusCode
          ? err.statusCode
          : err.code
          ? err.code
          : 403
        : 403;
    let message = typeof err === 'object' ? err.message : err;
    // console.log(code);
    // console.log(message);
    // return false;
    res.status(code).json({
      success: false,
      error_message: message,
      code: code,
      body: [],
    });
  },

  getBcryptHash: async (keyword) => {
    const saltRounds = 10;
    var myPromise = await new Promise(function (resolve, reject) {
      bcrypt.hash(keyword, saltRounds, function (err, hash) {
        if (!err) {
          resolve(hash);
        } else {
          reject('0');
        }
      });
    });
    // required.password= crypto.createHash('sha1').update(required.password).digest('hex');
    keyword = myPromise;
    return keyword;
  },

  comparePass: async (requestPass, dbPass) => {
    const match = await bcrypt.compare(requestPass, dbPass);
    return match;
  },

  sendMail: function (object) {
    const nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport('gmail', contant.mail_auth);

    var mailOptions = object;
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        //console.log(info);
        console.log('Email sent: ' + info.messageId);
      }
    });
  },
  Notification: function (object) {
    var FCM = require('fcm-node');
    var serverKey = 'YOURSERVERKEYHERE'; //put your server key here
    var fcm = new FCM(serverKey);

    var message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: '',
      /* collapse_key: 'your_collapse_key', */

      notification: {
        title: 'Title of your push notification',
        body: 'Body of your push notification',
      },

      data: {
        //you can send only notification or only data(or include both)
        my_key: 'my value',
        my_another_key: 'my another value',
      },
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.log('Something has gone wrong!');
      } else {
        console.log('Successfully sent with response: ', response);
      }
    });
  },

  create_auth() {
    try {
      let current_date = new Date().valueOf().toString();
      let random = Math.random().toString();
      return crypto
        .createHash('sha1')
        .update(current_date + random)
        .digest('hex');
    } catch (err) {
      throw err;
    }
  },
  send_emails: function (email, otp) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'edna.schmidt53@ethereal.email',
          pass: 'tPvm3FbTDHPzwb9Gex',
        },
      });
      var mailOptions = {
        from: 'entree@gmail.com',
        to: email,
        subject: 'Entree: Forgot Password ',
        html: 'Here is your OTP for forgot password ' + otp,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log(info);
          res.send('Email send');
        }
      });
      return;
    } catch (err) {
      throw err;
    }
  },

  createSHA1: function () {
    let key = 'abc' + new Date().getTime();
    return crypto.createHash('sha1').update(key).digest('hex');
  },
  image_upload: async function (image) {
    if (image) {
      var extension = path.extname(image.name);
      var filename = uuid() + extension;
      var sampleFile = image;
      sampleFile.mv(process.cwd() + '/uploads' + filename, (err) => {
        if (err) throw err;
      });

      return filename;
    }
  },
  new_image_Upload(image) {
    if (image) {
      var extension = path.extname(image.name);

      var filename = uuid() + extension;
      var sampleFile = image;
      //console.log(filename, "==========filename");

      sampleFile.mv(process.cwd() + '/uploads' + filename, (err) => {
        if (err) throw err;
      });

      return filename;
    }
  },

  async getDbData(auth_key, column, res) {
    let check_auth = await Users.findOne({
      where: {
        authKey: auth_key,
      },
    });

    if (check_auth) {
    } else {
      let message = 'Invalid auth key';

      res.status(401).json({
        success: false,
        message: message,
        code: 401,
        data: {},
      });
      res.end();
      return false;
    }
  },

  async p8(deviceTokens, message, notification_type, data_to_send) {
    var options = {
      cert: __dirname + '/abc.pem',
      key: __dirname + '/abc.pem',
      passphrase: '',
      production: false,
    };

    var apnProvider = new apn.Provider(options);

    var note = new apn.Notification();

    // note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    // note.badge = 3;
    note.sound = 'ping.aiff';
    note.alert = message;
    // note.payload = {};
    note.payload = {
      notification_type: notification_type,
      data: data_to_send,
    };
    note.topic = 'com.thecodetycoon.Cab';
    // note.body = {
    //     notification_type: notification_type,
    //     message: message
    // };

    console.log(note);
    // return

    apnProvider.send(note, deviceTokens).then((result) => {
      // see documentation for an explanation of result
      console.log(result);
    });
  },

  fcm: function (
    device_tokens,
    message,
    notification_type,
    data_to_send,
    isGroup = 0
  ) {
    try {
      // var serverKey = 'AAAA4gy4ZKk:APA91bGroj0p7gRpa8rqyiETOi558zfD_n9uAz6Uhu8lNRhrb5RPrhKCR4zCrXNGEsAAVExDQYtXu45UifVGxiMvEtgSsKhJG0M05PgvkufUQcZ6QJCiTSrB8dU-ZRqDM66CX6B9fb11';
      var serverKey =
        'AAAAoKGA3aY:APA91bHR9Qi-6N3eIt59LY0jI7jeoUz1Cf6wtNgWZxyIeBcKBJRiUIqCFSplD6uOYClOcPRnE0AqS4U7HHFyvTtQZrs9XKwlIzqCsEwJtMqSVzV6xIwKbElMdJ1FIZCUyrMU-2tF7u3s';
      const FCM = require('fcm-node');
      var fcm = new FCM(serverKey);

      if (typeof device_tokens == 'string') {
        var message = {
          //this may vary according to the message type (single recipient, multicast, topic, et cetera)
          to: device_tokens,

          data: {
            //you can send only notification or only data(or include both)
            title: 'GROUPTEXT',
            message: message,
            notification_type: notification_type,
            msgData: data_to_send,
            isGroup: isGroup,
          },
        };
      } else {
        var message = {
          //this may vary according to the message type (single recipient, multicast, topic, et cetera)
          // to: notification_data.device_token,
          registration_ids: device_tokens, // for multiple device_tokens use "registration_ids" instead of "to"

          // notification: {
          //     title: "testing grouptext notification",
          //     body: message,
          // },

          data: {
            //you can send only notification or only data(or include both)
            title: 'GROUPTEXT',
            message: message,
            notification_type: notification_type,
            msgData: data_to_send,
            isGroup: isGroup,
          },
        };
      }

      console.log(message);
      // return false;

      fcm.send(message, function (err, response) {
        if (err) {
          console.log('sendPushNotificationTifiFunction');
          console.log('Something has gone wrong!', err);
        } else {
          console.log('Successfully sent with response: ', response);
        }
      });
    } catch (err) {
      throw err;
    }
  },

  distance: function (lat1, lon1, lat2, lon2, unit) {
    //:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
    //:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
    //:::    unit = the unit you desire for results                               :::
    //:::           where: 'M' is statute miles (default)                         :::
    //:::                  'K' is kilometers                                      :::
    //:::                  'N' is nautical miles                                  :::

    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      var radlat1 = (Math.PI * lat1) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = lon1 - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == 'K') {
        dist = dist * 1.609344;
      }
      if (unit == 'N') {
        dist = dist * 0.8684;
      }
      return dist;
    }
  },

  success: function (res, message = '', body = {}) {
    return res.status(200).json({
      success: true,
      code: 200,
      message: message,
      body: body,
    });
  },

  failed: function (res, message = '', data = {}) {
    message =
      typeof message === 'object'
        ? message.message
          ? message.message
          : ''
        : message;
    return res.status(400).json({
      success: '0',
      code: 400,
      message: message,
      body: data,
    });
  },

  bcryptHash: (password, saltRounds) => {
    const bcrypt = require('bcrypt');
    const salt = bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
  },

  unixTimestamp: function () {
    var time = Date.now();
    var n = time / 1000;
    return (time = Math.floor(n));
  },

  fileUploadMultiparty: async function (FILE, FOLDER, FILE_TYPE) {
    try {
      var FILENAME = FILE.name; // actual filename of file
      var FILEPATH = FILE.tempFilePath; // will be put into a temp directory

      THUMBNAIL_IMAGE_SIZE = 300;
      THUMBNAIL_IMAGE_QUALITY = 100;

      let EXT = fileExtension(FILENAME); //get extension
      EXT = EXT ? EXT : 'jpg';
      FOLDER_PATH = FOLDER ? FOLDER + '/' : ''; // if folder name then add following "/"
      var ORIGINAL_FILE_UPLOAD_PATH = '/public/images/' + FOLDER_PATH;
      var THUMBNAIL_FILE_UPLOAD_PATH = '/public/images/' + FOLDER_PATH;
      var NEW_FILE_NAME = new Date().getTime() + '-' + 'file.' + EXT;
      var NEW_THUMBNAIL_NAME =
        new Date().getTime() +
        '-' +
        'thumbnail' +
        '-' +
        'file.' +
        (FILE_TYPE == 'video' ? 'jpg' : EXT);

      let NEWPATH = path.join(
        __dirname,
        '../',
        ORIGINAL_FILE_UPLOAD_PATH,
        NEW_FILE_NAME
      );
      let THUMBNAIL_PATH = path.join(
        __dirname,
        '../',
        ORIGINAL_FILE_UPLOAD_PATH,
        NEW_THUMBNAIL_NAME
      );

      let FILE_OBJECT = {
        image: '',
        thumbnail: '',
        fileName: FILENAME,
        folder: FOLDER,
        file_type: FILE_TYPE,
      };

      let BUFFER = await this.readFile(FILEPATH); //read file from temp path
      await this.writeFile(NEWPATH, BUFFER); //write file to destination

      FILE_OBJECT.image = THUMBNAIL_FILE_UPLOAD_PATH + NEW_FILE_NAME;

      let THUMB_BUFFER = '';

      if (FILE_TYPE == 'image') {
        // image thumbnail code
        var THUMB_IMAGE_TYPE = EXT == 'png' ? 'png' : 'jpeg';
        THUMB_BUFFER = await sharp(BUFFER)
          .resize(THUMBNAIL_IMAGE_SIZE)
          .toFormat(THUMB_IMAGE_TYPE, {
            quality: THUMBNAIL_IMAGE_QUALITY,
          })
          .toBuffer();

        FILE_OBJECT.thumbnail = THUMBNAIL_FILE_UPLOAD_PATH + NEW_THUMBNAIL_NAME;
        await this.writeFile(THUMBNAIL_PATH, THUMB_BUFFER);
      } else if (FILE_TYPE == 'video') {
        // video thumbnail code
        await this.createVideoThumb(
          NEWPATH,
          THUMBNAIL_PATH,
          NEW_THUMBNAIL_NAME
        );
        FILE_OBJECT.thumbnail = THUMBNAIL_FILE_UPLOAD_PATH + NEW_THUMBNAIL_NAME;
      } else {
        FILE_OBJECT.thumbnail = '';
      }
      return FILE_OBJECT;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  readFile: async (path) => {
    console.log('  ************ readFile *******************');
    console.log(path, '  ************ pathreadFile *******************');
    return new Promise((resolve, reject) => {
      const readFile = util.promisify(fs.readFile);
      readFile(path)
        .then((buffer) => {
          resolve(buffer);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  writeFile: async (path, buffer) => {
    console.log('  ************ write file *******************');
    return new Promise((resolve, reject) => {
      const writeFile1 = util.promisify(fs.writeFile);
      writeFile1(path, buffer)
        .then((buffer) => {
          resolve(buffer);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  createVideoThumb: async (fileData, thumbnailPath) => {
    var VIDEO_THUMBNAIL_TIME = '00:00:02';
    var VIDEO_THUMBNAIL_SIZE = '300x200';
    var VIDEO_THUMBNAIL_TYPE = 'video';
    return new Promise(async (resolve, reject) => {
      Thumbler(
        {
          type: VIDEO_THUMBNAIL_TYPE,
          input: fileData,
          output: thumbnailPath,
          time: VIDEO_THUMBNAIL_TIME,
          size: VIDEO_THUMBNAIL_SIZE, // this optional if null will use the desimention of the video
        },
        function (err, path) {
          if (err) reject(err);
          resolve(path);
        }
      );
    });
  },

  comparePass: async (requestPass, dbPass) => {
    dbPass = dbPass.replace('$2y$', '$2b$');
    const match = await bcrypt.compare(requestPass, dbPass);
    return match;
  },

  vaildObject: async function (required, non_required, res) {
    let msg = '';
    let empty = [];
    let table_name = required.hasOwnProperty('table_name')
      ? required.table_name
      : 'users';

    for (let key in required) {
      if (required.hasOwnProperty(key)) {
        if (required[key] == undefined || required[key] == '') {
          empty.push(key);
        }
      }
    }

    if (empty.length != 0) {
      msg = empty.toString();
      if (empty.length > 1) {
        msg += ' fields are required';
      } else {
        msg += ' field is required';
      }
      res.status(400).json({
        success: false,
        msg: msg,
        code: 400,
        body: {},
      });
      return;
    } else {
      if (required.hasOwnProperty('security_key')) {
        if (required.security_key != '') {
          msg = 'Invalid security key';
          res.status(403).json({
            success: false,
            msg: msg,
            code: 403,
            body: [],
          });
          res.end();
          return false;
        }
      }
      if (required.hasOwnProperty('password')) {
      }
      const marge_object = Object.assign(required, non_required);
      delete marge_object.checkexit;

      for (let data in marge_object) {
        if (marge_object[data] == undefined) {
          delete marge_object[data];
        } else {
          if (typeof marge_object[data] == 'string') {
            marge_object[data] = marge_object[data].trim();
          }
        }
      }

      return marge_object;
    }
  },
};
