# Filtered HiPS Viewer

A webapp for viewing filtered HiPS catalogs.

The full app consists of two parts:
- A react webapp using Aladin to view multiple hips files
- A python webserver for serving HATS catalogs to be overlayed on top of the Aladin view

## Installation

To run the webapp with the default rubin FITS files, the following should be run on USDF. 
To make sure you can access the website, ssh tunneling should be used. To do this, run the following ssh 
command and run the rest of the installation in its terminal.

```commandline
ssh -L 3000:localhost:3000 <your-slac-ssh>
```

### Prerequisites: Node.js

To run the app, Node.js must first be installed if you do not already have it. To install, run the following commands:

```commandline
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.15.0".
nvm current # Should print "v22.15.0".

# Verify npm version:
npm -v # Should print "10.9.2".
```

For the most up to date instructions, see https://nodejs.org/en/download

### Running the webapp

To run the webapp, the Node.js server must be running to serve the website.

```commandline
# Clone the code from github
git clone https://github.com/lincc-frameworks/filtered-hips-viewer.git
cd filtered-hips-viewer/webapp

# install the webapp and its requirements
npm install .

# start the server
npm start

```
Once the server is running, going to http://localhost:3000/ in your browser should run the app.
The HiPS viewer should work, but to get the catalog and light curve views working, the python HATS server also 
needs to be running, as explained below.

### Running the python HATS server

To run the HATS server, a new command line on a different port must be run.

```commandline
ssh -L 5000:localhost:5000 <your-slac-ssh>
```

This environment needs to have python installed.
Then, in this new tunneled terminal, run the python app.

```commandline
cd filtered-hips-viewer/hats-webserver

pip install -r requirements.txt

python main.py
```

Now when the `Show Catalog` button in the bottom left is clicked, the table should populate and the red markers should appear  
