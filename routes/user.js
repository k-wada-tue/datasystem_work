// For signup and login page

//modules
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
//remove validation for now
//const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const Users = require("../models/users");
const moment = require('moment');
const directory = require("../models/directories");

// directories
const css = directory.css;
const js = directory.js;
const img = directory.img;
const avtimg = directory.avtimg;
const dtimg = directory.dtimg;
const dt =  directory.dt;


const app = express();
const router = express.Router();


// Middleware
app.use(cookieParser());
app.use(bodyParser.json());


// Post signup and login info
router.post(
    "/signup",
    //remove validation for now
    // [
    //     check("name", "Please Enter a Valid Username")
    //     .not()
    //     .isEmpty(),
    //     check("email", "Please enter a valid email").isEmail(),
    //     check("password", "Please enter a valid password").isLength({
    //         min: 6
    //     })
    // ],
    async (req, res) => {
      //remove validation for now
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({
        //         errors: errors.array()
        //     });
        // }

        const {
            name,
            email,
            password
        } = req.body;

        try {
            let user = await Users.findOne({
                email
            });
            user = await Users.findOne({
              name
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }
            if (user) {
              return res.status(400).json({
                  msg: "User Already Exists"
              });
            }

            user = new Users({
                name,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "randomString", {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );

            res.redirect('/user/login');

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");           
        }
    }
);

router.post(
  "/login",
  //remove validation for now
  // [
  //   check("email", "Please enter a valid email").isEmail(),
  //   check("password", "Please enter a valid password").isLength({
  //     min: 6
  //   })
  // ],
  async (req, res) => {
    //remove validation for now
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   // return res.status(400).json({
    //   //   errors: errors.array()
    //   // });
    //   res.render('user/login',{
    //        messageUser :"", messagePassword : '', messageError: "", css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined
    //   });
    // }

    const { email, password } = req.body;
    try {
      let user = await Users.findOne({
        email
      });
      if (!user) {
        res.render('user/login',{
           messageUser :"User Not Exist", messagePassword : '', messageError: "", css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined
        });
      }
        // return res.status(400).json({
        //   message: "User Not Exist"
        // });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.render('user/login',{
           messageUser :"", messagePassword : 'Incorrect Password', messageError: "", css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined
        });
      }
        // return res.status(400).json({
        //   message: "Incorrect Password !"
        // });

      const payload = {
        user: {
          id: user.id
        }
      };

      let token = jwt.sign(payload, 'secret', {
        expiresIn: 3600
      });

      res.cookie('jwt', token, {
          maxAge: 3600000,
          secure: false, // set to true if your using https
          httpOnly: true,
      });

      res.redirect('/user/me');

      // TODO:Set the expiration of token later

      // jwt.sign(
      //   payload,
      //   "secret",
      //   {
      //     expiresIn: 3600
      //   },
      //   (err, token) => {
      //     if (err) throw err;
      //     res.status(200).json({
      //       token
      //     });
      //   }
      // );

    } catch (e) {
      console.error(e);
      // res.status(500).json({
      //   message: "Server Error"
      // });
      res.render('user/login',{
           messageUser :"", messagePassword : '', messageError: "Error. Please try again.", css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt
      });
    }
  }
);


module.exports = router;

// user page: only upload data for now
//TODO: make it to general user page (dashboard)
router.get("/me", auth, async (req, res) => {
  try {
    //request.user is getting fetched from Middleware after token authentication
    const user = await Users.findById(req.user.id);
    const username = user.name;
    console.log(user.name);
    //res.json(user);
    res.render('user/me', {
           css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: username
      });
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});


//TODO: Add logout later

// router.post('/me/logout', auth, async (req, res) => {
//     // Log user out of the application
//     try {
//         req.user.tokens = req.user.tokens.filter((token) => {
//             return token.token != req.token
//         })
//         await req.user.save()
//         res.send()
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

