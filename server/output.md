## File Structure 
        server
        |   .env
        |   .gitignore
        |   app.js
        |   db.js
        |   package-lock.json
        |   package.json
        |   
        +---models
        |   hearttrack.js
        |   
        +---node_modules
        |   |  (ommitted)
        |
        +---public
        |   |   account.html
        |   |   devices.html
        |   |   index.html
        |   |   login.html
        |   |   reference.html
        |   |   update-password.html
        |   |   
        |   +---javascripts
        |   |   account.js
        |   |   auth.js
        |   |   chart_utils.js
        |   |   dataDisplay.js
        |   |   deviceFetching.js
        |   |   login.js
        |   |   logout.js
        |   |       
        |   +---res
        |   |   AlexPhoto.png
        |   |   DasolPhoto.png
        |   |   MasonPhoto.jpg
        |   |       
        |   \---stylesheets
        |       site.css
        |       style.css
        |           
        +---routes
        |   devices.js
        |   index.js
        |   users.js
        |       
        \---views/
        └── error.pug