// Store all directories here
//TODO: Does it make sense this file located in the "models" folder? > perhaps "config"?

const dblocal = "mongodb://localhost:27017/dsdb"; // Only for the initial stage...use the one below now
const dbremote = "mongodb://admin:vlladmin01@ds011472.mlab.com:11472/heroku_m8ckh683"

const css = "/stylesheets/";
const js = "/javascripts/";

const img = "/images/";
const avtimg = "/images/avatar/";
const dtimg = "/images/data/";

//TODO: the directory for the datasets has to be moved to secure database!
const dt = "/datasets/";

exports.dblocal = dblocal;
exports.dbremote = dbremote;

//TODO: for the static files (css, js and images) also needs a separate server?
exports.css = css;
exports.js = js;

exports.img = img;
exports.avtimg = avtimg;
exports.dtimg = dtimg;

//TODO: As above
exports.dt = dt;