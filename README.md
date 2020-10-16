# Vitality Living Lab Data System(DS)
The DS is a platform to share vitality data among stakeholders from Vitality Living Lab project and also citizens. 

## Directories

The below is the initial directory structures for the DS project.
*Please confirm and advise if they are not logical and/or inefficient.

```
root/
  ├ app.js
  │
  ├ bin/
  │  └ www *default file with Express Please check this and see how it works  
  │ 
  ├ config/
  │  └ db.js *mongoDB connection by mongoose
  │ 
  ├ middleware/
  │  └ auth.js *authentication by jsonwebtoken (token is stored in cookie)
  │ 
  ├ models/ *need check if the files underneath are appropriate
  │  ├ airboxes.js *fetching air quality data and restructuring for D3 use
  │  ├ directories.js *paths for files such as css and js (client side)
  │  ├ metadata.js *mongoose schema for metadata of data uploaded on the DS
  │  ├ users.js *mongoose schema for users on the DS
  │
  ├ node_modules/ node modules
  │  └ ...
  │
  ├ package-lock.json *check if we can integrate this file to package.json
  │  
  ├ package.json
  │
  ├ public/ *all static files on client side
  │  ├ datasets/ *store raw data...need to be moved to a secure server later
  │  │  └ ...
  │  │
  │  ├ images/
  │  │  ├ avatar/ *avatar images of users
  │  │  └ data/ *placeholder image for data when users voluntary upload
  │  │
  │  ├ javascripts/ *placeholder image for data when users voluntary upload
  │  │  ├ main.js *client side some general javascript
  │  │  └ visualization.js client side javascript related to visualizations
  │  │ 
  │  ├ libraries/
  │  │  └ moment.js *need to check if this is in use
  │  │  
  │  └ stylesheets/
  │     ├ dataviz.css *style related to visualizations
  │     ├ leaflet.css *stylesheet for leaflet library
  │     └ style.css *general styles
  │  
  ├ routes/ *not very sure how routing works...need advice!
  │  ├ index.js *routing for js and also some other pages?
  │  ├ upload.js.css *routing for upload data page?
  │  └ user.js *routing for login and signup page?
  │  
  └  views/ *contains all ejs files
     ├ comments/ *no files yet
     ├ partials/ *ejs templates used all pages
     │  ├ footer.ejs
     │  └ header.ejs
     │   
     ├ user/ *pages related users under user/
     │  ├ login.ejs
     │  ├ me.ejs *data upload page for now
     │  └ success.ejs *page after successfully upload data
     │  
     ├ visualizations/ *individual data visualization pages
     │  ├ commons/
     │  │   └ visContainer.ejs common template for vis page
     │  └ ... *ejs file for each (map-based) data vis page
     ├ error.ejs 
     └ index.ejs 
```
