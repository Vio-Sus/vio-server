const { Pool } = require('pg');

const {
  sqlValues,
  sourceSqlValues,
  transformTotalWeightsData,
  keysToCamel,
} = require('./databaseHelpers');

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  port: process.env.PG_PORT,
  password: process.env.PG_PWD,
  database: process.env.PG_DATABASE,
});

module.exports = async function () {
  const client = await pool.connect();

  const auth = 'auth0|62070daf94fb2700687ca3b3';

  async function testQuery() {
    console.log('called testQuery');
    // need to update this if we change database for user account id

    let sqlQuery = 'SELECT * FROM things';
    let result = await client
      .query(sqlQuery)
      .catch((err) => console.log('ERRROROROOROR', err));
    // return result.rows;
    return 'hellloooo';
  }

  async function findAccount(authId) {
    console.log('looking for auth0 user!!!!!');
    let result = await client.query(
      'SELECT * FROM account where auth0_id = $1',
      [authId]
    );
    if (result.rows[0]) {
      // user has been found, return user info from postgres
      // console.log('the user: ', result.rows[0]);
      return result.rows[0];
    } else {
      console.log('cannot find user');
      return false;
    }
  }

  async function addAccount(claims) {
    const { nickname, email, sub } = claims;

    // add info from auth0 to posgresql
    await client.query(
      'INSERT INTO account (nickname, email, auth0_id, account_type_id) VALUES ($1, $2, $3, $4)',
      [nickname, email, sub, 1]
    );

    // check that the auth0 info was added properly
    let result = await client.query(
      'SELECT * FROM account where auth0_id = $1',
      [sub]
    );
    return result.rows[0];
  }

  //Update Account Type
  async function updateAccountType(postData, accountId) {
    let sqlQuery =  `UPDATE account SET account_type_id = $1
    WHERE account_id = $2`;
    let params = [     
      postData,
      accountId.account_id       
    ];    
    console.log('params postdata: ' + params)
    const result = await client.query(sqlQuery, params);   
    console.log("PARAMS: " + params);
    console.log("UPDATED ACCOUNT TYPE: " + result);
    return result;
  }

  async function updateSource(sourceId, postData) {
    let sqlQuery = `UPDATE source SET name = $1, address = $2, phone_number = $3, email = $4
      WHERE source_id = $5`;
    let params = [
      postData.name,
      postData.address,
      postData.phoneNumber,
      postData.email,
      sourceId,
    ];

    const result = await client.query(sqlQuery, params);

    return result.rows;
  }


  async function updateEntryById(entryId, postData, callback) {
    const editDate = new Date();
    let sqlQuery = `UPDATE entry SET item_id = $1, source_id = $2, weight = $3, created = $4, last_edit = $5
    WHERE entry_id = $6`;
    let params = [
      postData.itemId,
      postData.sourceId,
      postData.weight,
      postData.date,
      editDate,
      entryId,
    ];

    await client.query(sqlQuery, params, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        console.log('---------SUCCESSFUL UPDATE---------------');
        callback(null, result);
      }
    });
  }
  

  // get list of cx connected sources
  async function getSources(authId) {
    console.log('AAAAAUTH ', authId);
    const sqlQuery = `SELECT cx_source.source_id, name, address, phone_number, source.email FROM cx_source
    JOIN source ON cx_source.source_id = source.source_id
    JOIN account ON cx_source.cx_account_id = account.account_id
    WHERE account.auth0_id = $1;`;
    const result = await client.query(sqlQuery, [authId]);

    return result.rows;
  }

  // add new source for logged in user
  async function addSource(newSource, accountId) {
    const valuesData = sourceSqlValues(newSource);
    const sqlQuery = `WITH new_source AS (
      INSERT INTO source(${valuesData.columnNames})
      VALUES (${valuesData.numString})
      RETURNING source_id)
      INSERT INTO cx_source (source_id, cx_account_id)
      SELECT source_id, $1
      FROM new_source;`;
    const result = await client.query(sqlQuery, [
      accountId,
      ...valuesData.values,
    ]);

    return result.rows;
  }

  async function updateSource(sourceId, postData) {
    let sqlQuery = `UPDATE source SET name = $1, address = $2, phone_number = $3, email = $4
      WHERE source_id = $5`;
    let params = [
      postData.name,
      postData.address,
      postData.phoneNumber,
      postData.email,
      sourceId,
    ];

    const result = await client.query(sqlQuery, params);

    return result.rows;
  }

  async function getItems(authId) {
    let sqlQuery = `SELECT name, item_id FROM item
      JOIN account ON item.account_id = account.account_id
      WHERE account.auth0_id = $1;`;
    //   WHERE account_item.account_id = $1;`;
    // client.query(sqlQuery, [accountId], (err, result) => {
    const result = await client.query(sqlQuery, [authId]);
    return result.rows;
  }

  async function updateItem(itemId, postData) {
    let sqlQuery = `UPDATE item SET name = $1
      WHERE item_id = $2`;
    let params = [postData.name, itemId];

    const result = await client.query(sqlQuery, params);

    return result.rows;
  }

  async function addItem(newItem, accountId) {
    const sqlQuery = `INSERT INTO item (name, account_id)
    VALUES ($1, $2);`;
    const result = await client.query(sqlQuery, [newItem.name, accountId]);
    return result.rows;
  }

  async function getListOfEntries(authId) {
    let sqlQuery = `SELECT item.name AS item_name, item.item_id,
    source.name AS source_name, source.source_id, entry_id,
    TO_CHAR(created :: DATE, 'yyyy-mm-dd') AS entry_date, weight AS entry_weight
    FROM entry
    JOIN item ON entry.item_id = item.item_id
    JOIN source ON entry.source_id = source.source_id
    JOIN account ON entry.account_id = account.account_id
    WHERE account.auth0_id = $1
    ORDER by CREATED desc, entry_id desc;`;
    const result = await client.query(sqlQuery, [authId]);

    return result.rows;
  }

  async function getEntriesByDateRange(startDate, endDate, authId) {
    let sqlQuery = `SELECT item.name AS item_name, item.item_id,
    source.name AS source_name, source.source_id, entry_id,
    TO_CHAR(created :: DATE, 'yyyy-mm-dd') AS entry_date, weight AS entry_weight
    FROM entry
    JOIN item ON entry.item_id = item.item_id
    JOIN source ON entry.source_id = source.source_id
    JOIN account ON entry.account_id = account.account_id
    WHERE account.auth0_id = $1
	  AND entry.created BETWEEN $2 AND $3
    ORDER by CREATED desc, entry_id desc;`;
    const result = await client.query(sqlQuery, [authId, startDate, endDate]);

    return result.rows;
  }

  async function getTotalWeights(startDate, endDate, authId) {
    let sqlQuery = `SELECT source.name AS "sourceName", item.name AS "itemName", SUM(entry.weight) AS "totalWeight"
    FROM entry
    JOIN item ON entry.item_id = item.item_id
    JOIN source ON entry.source_id = source.source_id
    JOIN account ON entry.account_id = account.account_id
    WHERE account.auth0_id = $1
    AND created BETWEEN $2 AND $3
    GROUP BY source.name, item.name;`;

    //   let sqlQuery = `SELECT source.name AS source_name, json_object_agg(item.name, entry.weight) AS totals
    //   FROM entry
    //   JOIN item ON entry.item_id = item.item_id
    //   JOIN source ON entry.source_id = source.source_id
    //   JOIN account ON entry.account_id = account.account_id
    //   WHERE account.auth0_id = $1
    //   AND created BETWEEN $2 AND $3
    // GROUP BY source.name;`;
    const result = await client.query(sqlQuery, [authId, startDate, endDate]);

    const newJson = transformTotalWeightsData(result.rows);

    return newJson;
  }

  async function getGraphDataset(startDate, endDate, authId) {
    let sqlQuery = `SELECT item.name AS item_name,
    source.name AS source_name,
    TO_CHAR(created :: DATE, 'yyyy-mm-dd') AS date, SUM(weight) AS total_weight
    FROM entry
    JOIN item ON entry.item_id = item.item_id
    JOIN source ON entry.source_id = source.source_id
    JOIN account ON entry.account_id = account.account_id
    WHERE account.auth0_id = $1
	AND entry.created BETWEEN $2 AND $3
	GROUP BY source.source_id, source.name, item.item_id, item.name, date
    ORDER by date asc;`;

    const result = await client.query(sqlQuery, [authId, startDate, endDate]);

    const camelResult = result.rows.map((row) => keysToCamel(row));

    return camelResult;
  }

  async function getEntryById(entryId) {
    let sqlQuery = `SELECT item.name AS item_name, item.item_id,
    source.name AS source_name, source.source_id, entry_id,
    TO_CHAR(created :: DATE, 'yyyy-mm-dd') AS entry_date, weight AS entry_weight
    FROM entry
    JOIN item ON entry.item_id = item.item_id
    JOIN source ON entry.source_id = source.source_id
    JOIN account ON entry.account_id = account.account_id
    WHERE entry.entry_id = $1;`;
    console.log('entrybyid $1 is ', entryId);

    const result = await client.query(sqlQuery, [entryId]);

    return result.rows;
  }

  async function deleteEntry(entryId) {
    let sqlQuery = `DELETE FROM entry WHERE entry_id = $1;`;
    console.log(sqlQuery, '$1 is ', entryId);
    const result = await client.query(sqlQuery, [entryId]);

    return result;
  }

  const addEntries = async (entries, accountId) => {
    // change to receiving auth0
    function arrayFromEntry(entry) {
      // (account_id, source_id, item_id, weight, created, last_edit)
      return [
        accountId,
        entry.source_id,
        entry.item_id,
        entry.weight,
        entry.created,
        entry.created,
      ];
    }
    const inputValues = entries.map(arrayFromEntry);

    const valuesData = sqlValues(inputValues);
    console.log('VALUES DATA: ', valuesData);

    const sqlQuery = `INSERT into entry
    (account_id, source_id, item_id, weight, created, last_edit)
    ${valuesData.sql}`;

    let result = await client.query(sqlQuery, valuesData.values);
    return result;
  };

  return {
    testQuery,
    getEntryById,
    getSources,
    addSource,
    getItems,
    getEntriesByDateRange,
    getListOfEntries,
    deleteEntry,
    updateEntryById,
    addEntries,
    findAccount,
    addAccount,
    updateAccountType,
    updateSource,
    updateItem,
    addItem,
    getTotalWeights,
    getGraphDataset,
  };
};
