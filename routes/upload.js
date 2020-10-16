// For upload page

//modules
const express = require("express");
const metadata = require("../models/metadata");
const Users = require("../models/users");
//remove validation for now
//const { check, validationResult} = require("express-validator/check"); 
const directory = require("../models/directories");
const jwt = require("jsonwebtoken");

//directories
const css = directory.css;
const js = directory.js;
const img = directory.img;
const avtimg = directory.avtimg;
const dtimg = directory.dtimg;
const dt =  directory.dt;


const app = express();
const router = express.Router();


let userId;

router.get('/', async (req, res) => {
  try {

    const token = req.cookies.jwt || "";
    const decoded = jwt.verify(token, "secret");
    req.user = decoded.user;
    userId = await Users.findById(req.user.id);

    console.log(userId);
    
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
})


// Post metadate from the form
router.post(
    "/",
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
        // remove validation for now
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({
        //         errors: errors.array()
        //     });
        // }

        // const {
        //     name,
        //     email,
        //     password
        // } = req.body;

        const dataTitle = req.body.dataTitle;
        const dataYear = req.body.dataYear;
        const dataDesc = req.body.dataDesc;
        const dataAgeGroup = req.body.dataAgeGroup;
        const dataCateg = req.body.dataCateg;
        const dataType = req.body.dataType;
        const dataFormat = req.body.dataFormat;
        const dataSource = req.body.dataSource;
        const dataLink = req.body.dataLink;
        const dataAccess = req.body.dataAccess;
        //const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

        try {
            
            meta = new metadata({
                'title': dataTitle,
                'year': dataYear,
                'description': dataDesc,
                'age_group': dataAgeGroup,
                'contributor': userId,
                'category': dataCateg,
                'type': dataType,
                'format' : dataFormat,
                'source': dataSource,
                'link': dataLink,
                'access': dataAccess,
                'image': "",
                'file': ""
                //'created > default'
            });

            
            await meta.save();

            console.log(userId);

            // the page after successfully updated metadata *Only for teh demo purpose and removed later
            // TODO: Will be removed
            res.redirect('/user/success');

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);


module.exports = router;
