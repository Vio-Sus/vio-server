const path = require('path');
const express = require('express');
const inputValidation = require('./middleware/inputValidation');
const { requiresAuth } = require('express-openid-connect');
const checkAuth = require('./middleware/authentication');
const { auth } = require('express-openid-connect');
const jwt_decode = require('jwt-decode');

const authConfig = require('./auth');
const { generateDataset, filterEntriesBySource, filterEntriesByCollector } = require('./chartHelpers');
const { json } = require('body-parser');

module.exports = function (database) {
  const app = express();

  app.use(express.json());

  // const authId = 'auth0|62070daf94fb2700687ca3b3';
  // TODO: add to each api-> authId =req.oidc?.user?.sub;

  // after login
  authConfig.afterCallback = async (req, res, session) => {
    const claims = jwt_decode(session.id_token);

    console.log('This is what we get from auth0: ', claims);
    const { sub } = claims;
    // select * from users where auth0_id = sub
    // if no user is returned then
    // insert into users (auth0_id) values (sub)
    // now you have a user in the database
    try {
      let existsInDb = await database.findAccount(sub); // returns row or false
      if (!existsInDb) {
        console.log('-------- authId does not exist in db', existsInDb);
        database.addAccount(claims);
      } else {
        console.log('-------- authId does exist in db', existsInDb);
      }
      return session;
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  };

  app.use(auth(authConfig));

  // serve the react app if request to /
  app.use(express.static(path.join(__dirname, 'build')));

  /** Test Route **/
  const authId = 'auth';
  app.get('/api/test', checkAuth, async (req, res) => {
    // const userStatus = req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out';
    const result = await database.testQuery();
    res.send({
      // userStatus: userStatus,
      message: 'Teapot Test',
      result: result,
    });
  });

  /** Auth Route **/

  app.get('/api/profile', checkAuth, async (req, res) => {
    const authId = req.oidc?.user?.sub;
    if (authId) {
      // user is logged in with auth0
      res.send({ user: { ...req.oidc?.user } });
    } else {
      res.status(500).send({ error });
    }
  });

  /** Change account type **/
  app.put('/api/profile/', async (req, res) => {             
    const theData = req.body.data;
    const authId = req.oidc?.user?.sub;
    const user = await database.findAccount(authId);    
    let s = JSON.stringify(theData);   
    let postData = parseInt(s[30])          
    try {
      await database.updateAccountType(postData, user);
      res.send({
        msg: 'account_type_id has been updated',
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  //Update Account Details
  app.put('/api/profileCollector', async (req, res) => {
    const theData = req.body.data;
    const nickname = theData.nickname;   
    const email = theData.email;
    const company = theData.company;   
    const authId = req.oidc?.user?.sub;
    const user = await database.findAccount(authId);    
    //res.send(JSON.stringify(req.body))
    console.log('POST DATA: '+ nickname, email, company);
    try {
      await database.updateAccountDetails(
      nickname,
      email,
      company,
      user
      );
      res.send({
        msg: 'account_details has been updated',
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  /** Source Routes **/
  // getting all the sources associated with the logged in user
  app.get('/api/sources', checkAuth, async (req, res) => {
    //change 1 to account id after we can log in
    const authId = req.oidc?.user?.sub;
    try {
      const result = await database.getSources(authId);
      // await database.addEntries(entries, accountId);
      console.log('result - ', result);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });


  // get collectors from source
  app.get('/api/sourceCollectors', checkAuth, async (req, res) => {

    const authId = req.oidc?.user?.sub;

    try {
      let result = await database.getSource(authId);
      console.log(result)
      if(result && result.account_type_id === 2) { //needs to be changed to 2 after migrating
        const data = await database.getSourceIdFromEmail(result.email)
        console.log(data)
        const sourceCollectors = await database.getSourceCollectors(data.source_id)
        // console.log("collectors " + sourceCollectors)
        res.send(sourceCollectors);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  // get collectors from source
  app.get('/api/sourceCollectors/:startDate/:endDate',checkAuth, async (req, res) => {
    //change 1 to account id after we can log in

    const authId = req.oidc?.user?.sub;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    try {
      let result = await database.getSource(authId);
      console.log(result)
      const data = await database.getSourceIdFromEmail(result.email)
      console.log(data.source_id)
      if(result && result.account_type_id === 2) { //needs to be changed to 2 after migrating
        let result = await database.getSourceCollectorsByDateRange(
          startDate,
          endDate,
          data.source_id
        );
        console.log('resuuuuuuult entires dates ', result);
        res.send(result);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  // Check for duplicate phone numbers
  app.post('/api/sources/check-phone', async (req, res) => {
    try {
      const sqlObj = await database.checkSourcePhone(req.body.phoneNumber);
      res.send(sqlObj);
    } catch (err) {
      console.log(err);
    }
  });

  // Check for duplicate emails
  app.post('/api/sources/check-email', async (req, res) => {
    try {
      const sqlObj = await database.checkSourceEmail(req.body.email);
      res.send(sqlObj);
    } catch (err) {
      console.log(err);
    }
  });


  // post request to add a new source to this Cx account
   // post request to add a new source to this Cx account
   app.post('/api/sources', checkAuth, async (req, res) => {
    const authId = req.oidc?.user?.sub;
    const newSource = req.body.data;
    console.log('newSource: ', newSource);
    try {
      const account = await database.findAccount(authId);
      let sources = await database.getAllSources();
      let foundSource = sources.find((item) => item.email == newSource.email);
      console.log(sources);
      console.log(foundSource);
      // check the source in the source table
      if (foundSource) {
        // check the source in the cx_source table
        let sourcesOfCollectors = await database.getSources(authId);
        let foundSourceOfCollectors = sourcesOfCollectors.find(
          (item) => item.source_id == foundSource.source_id
        );
        if (foundSourceOfCollectors) {
          res.send({error: "Source already exists; Try again"});
        } else {
          let test = await database.addSourceOfCollector(
            foundSource.source_id,
            account.account_id
          );
          console.log(test);
          res.send({
            msg: 'New source of this collector added successfully',
          });
        }
      } else {
        let source = await database.addNewSource(newSource);
        //  console.log('sourceTest: '+ JSON.stringify(sourceTest));
        await database.addSourceOfCollector(
          source.source_id,
          account.account_id
        );
        res.send({
          msg: 'New source of this collector added successfully',
        });
      }
    } catch (error) {
      console.error('error.detail: ' + error.detail);
      res.status(500).send(error.detail);
    }
  });

  app.put('/api/sources/:id', async (req, res) => {
    const sourceId = req.params.id;
    const sourceEdit = req.body.data;
    try {
      await database.updateSource(sourceId, sourceEdit);
      res.send({
        msg: 'source has been updated',
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  /** Item Routes **/
  // get the list of items associated with this account
  app.get('/api/items', checkAuth, async (req, res) => {
    const authId = req.oidc?.user?.sub;
    try {
      let result = await database.getItems(authId);
      console.log('resuuuuuuult items ', result);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  app.put('/api/items/:id', async (req, res) => {
    const itemId = req.params.id;
    const itemEdit = req.body.data;
    try {
      await database.updateItem(itemId, itemEdit);
      res.send({
        msg: 'item has been updated',
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  // TODO: post request to input data. Just validates for now
  app.post('/api/items', checkAuth, async (req, res) => {
    const authId = req.oidc?.user?.sub;
    const newItem = req.body.data;
    console.log('newItem: ', newItem);
    console.log('authId: ', authId);
    try {
      const account = await database.findAccount(authId);
      console.log('ACCCOCUNT ID', account);
      await database.addItem(newItem, account.account_id);
      res.send({
        msg: 'New Item added successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  /** Entry Routes **/
  // get the list of entries made by that account
  app.get('/api/entries', checkAuth, async (req, res) => {
    //change 1 to account id after we can log in
    const authId = req.oidc?.user?.sub;

    try {
      let result = await database.getListOfEntries(authId);
      console.log('resuuuuuuult entries ', result);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  // get a single entry for displaying that entry's info
  app.get('/api/entries/:id', checkAuth, async (req, res) => {
    const entryId = req.params.id;
    // check user id
    try {
      let result = await database.getEntryById(entryId);
      console.log('resuuuuuuult entry by Id ', result);
      res.send(result[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  app.get('/api/entries/:startDate/:endDate', checkAuth, async (req, res) => {
    const authId = req.oidc?.user?.sub;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    try {
      let result = await database.getEntriesByDateRange(
        startDate,
        endDate,
        authId
      );
      console.log('resuuuuuuult entires dates ', result);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  /** Totals Routes **/
  // get the total
  app.get('/api/totals/:startDate/:endDate', checkAuth, async (req, res) => {
    const authId = req.oidc?.user?.sub;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    try {
      let result = await database.getTotalWeights(startDate, endDate, authId);
      console.log('resuuuuuuult totals by source: ', result);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  //updates an entry with new data
  app.put('/api/entries/:id', checkAuth, async (req, res) => {
    const entryId = req.params.id;
    const updatedEntry = req.body.data;
    console.log('updatedEntry', updatedEntry);

    await database.updateEntryById(entryId, updatedEntry, (err, result) => {
      if (err) {
        console.log('Something went wrong :(', err);
        res.json({ message: 'Error updating' });
      } else {
        console.log(`updating worked!`);
        // send back confirmation
        res.json({ message: 'Update successful' });
      }
    });
  });

  app.delete('/api/entries/:id', checkAuth, async (req, res) => {
    const entryId = req.params.id;
    try {
      let result = await database.deleteEntry(entryId);
      res.send({ message: `entry ${entryId} was deleted` });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  app.post('/api/entries', checkAuth, async (req, res) => {
    const authId = req.oidc?.user?.sub;
    const { entries } = req.body.data;
    console.log('entries: ', entries);
    try {
      const user = await database.findAccount(authId);
      console.log('ACCCOCUNT ID', user);
      await database.addEntries(entries, user.account_id);
      // await database.addEntries(entries, accountId);
      res.send({});
    } catch (error) {
      console.error(error);
      res.status(500).send({ error });
    }
  });

  /** Graph routes **/
  app.get(
    '/api/graph/line/:startDate/:endDate',
    checkAuth, async (req, res) => {
      console.log('get graph routes is called :)');
      const authId = req.oidc?.user?.sub;
      // const authId = 'auth0|62070daf94fb2700687ca3b3'; // pinky
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;

      let dataset = {};
      try {
        let result = await database.getGraphDataset(startDate, endDate, authId);
        let sorted = filterEntriesBySource(result);
        console.log('SORTED RESULTS: ', sorted);
        // for each sorted key value
        for (const source in sorted) {
          let something = generateDataset(sorted[source], startDate, endDate);
          dataset[source] = something;
        }
        // call generate dataset and save it to an master array
        // let dataset = generateDataset(sorted, startDate, endDate);
        res.send(dataset);
        console.log('dataset is???', dataset);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error });
      }
    }
  );

  app.get('/api/sourceGraph/line/:startDate/:endDate', checkAuth, async (req, res) => {
    const authId = req.oidc?.user?.sub;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    let dataset = {};
    try {
      let user = await database.getSource(authId);
      console.log('User: ', user);
      const { source_id } = await database.getSourceIdFromEmail(user.email);
      if(user && user.account_type_id === 2) {
        let result = await database.getSourceGraphDataset(startDate, endDate, source_id);
        let sorted = filterEntriesByCollector(result)

        // for each sorted key value
        for (const collector in sorted) {
          let structuredData = generateDataset(sorted[collector], startDate, endDate);
          dataset[collector] = structuredData;
        }
        console.log('dataset from sourcegraph API call: ', dataset)
        res.send(dataset);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ error })
    }
  });

  /** Render pages **/
  // anything that hasn't been serverd through a route should be served by the react app
  // /idk/someroute/longroute
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'));
  });

  ///////////////////////// Just realized that we might not use routes ----> We can refactor later, added header comments for now
  //   //Routes
  //   const entriesRouter = require('./routes/entries');

  //   app.use('/api/entries', entriesRouter);
  ////////////////////////////////
  return app;
};
