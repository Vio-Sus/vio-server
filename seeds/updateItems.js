/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.seed = function (knex) {
  return knex('account_type')
    .insert([{ account_type: 'cx' }, { account_type: 'sx' }])

    .then(() => {
      return knex('account').insert([
        {
          given_name: 'Pink',
          family_name: 'Ranger',
          company: 'Collector1',
          nickname: 'pinky',
          email: 'pinky@powpow.com',
          account_type_id: 1,
          auth0_id: 'auth0|62070daf94fb2700687ca3b3',
        },
        {
          given_name: 'Black',
          family_name: 'Ranger',
          company: 'Collector2',
          nickname: 'blacky',
          email: 'blacky@powpow.com',
          account_type_id: 1,
          auth0_id: 'auth0|620c57885e503e006996bdd3',
        },
        {
          given_name: 'John',
          family_name: 'Doe',
          company: 'Recyco',
          nickname: 'John',
          email: 'john@recyco.com',
          account_type_id: 1,
          auth0_id: 'auth0|626090881ac86d006aaf2407',
        },
        // {
        //   given_name: 'adrian',
        //   family_name: 'S',
        //   company: 'Collector1',
        //   nickname: 'adrian',
        //   email: 'adrian.sieroslawski@gmail.com',
        //   account_type_id: 1,
        //   auth0_id: 'auth0|62621507813c000069da4c37',
        // },
        {
          given_name: 'Source',
          family_name: 'Ranger',
          company: 'PowPow',
          nickname: 'source',
          email: 'source@powpow.com',
          account_type_id: 2,
          auth0_id: 'auth0|620c57e8cef4230069744708',
        },
        {
          given_name: 'adrian',
          family_name: 'sieroslawski',
          company: 'BCIT',
          nickname: 'adrian',
          email: 'adrian.sieroslawski@gmail.com',
          account_type_id: 2,
          auth0_id: 'auth0|62621507813c000069da4c37',
        },
      ]);
    })
    .then(() => {
      return knex('item').insert([
        {
          name: 'Paper Cups',
          account_id: 1,
        },
        {
          name: 'Coffee Pods',
          account_id: 1,
        },
        {
          name: 'Coffee Chaffs',
          account_id: 1,
        },
        {
          name: 'Paper Cups',
          account_id: 3,
        },
        {
          name: 'Coffee Pods',
          account_id: 3,
        },
        {
          name: 'Coffee Chaffs',
          account_id: 3,
        },
        {
          name: 'Love',
          account_id: 1,
        },
        {
          name: 'Love',
          account_id: 2,
        },
        {
          name: 'Plastic Lids',
          account_id: 3,
        },
        {
          name: 'Garbage',
          account_id: 1,
        },
        {
          name: 'Garbage',
          account_id: 2,
        },
        {
          name: 'Garbage',
          account_id: 3,
        },
      ]);
    })
    .then(() => {
      return knex('source').insert([
        {
          name: 'Cafe 1',
          address: '123 ABC Street, Vancouver, BC',
          phone_number: 6045555655,
          account_id: 1,
          email: 'adrian.sieroslawski@gmail.com'
        },
        {
          name: 'Cafe 2',
          address: '222 EFG Street, Vancouver, BC',
          phone_number: 6040060000,
          account_id: 1,
          email: 'cafe2@gmail.com'
        },
        {
          name: 'Cafe 3',
          address: '889 whatever street, van, bc',
          phone_number: 1234566666,
          account_id: 1,
          email: 'cafe3@gmail.com'
        },
        {
          name: 'Coffee Shop 1',
          address: '433 ABC Street, Vancouver, BC',
          phone_number: 6045565555,
          account_id: 3,
          email: 'cafe4@gmail.com'
        },
        {
          name: 'Coffee Shop 2',
          address: '456 EFG Street, Vancouver, BC',
          phone_number: 6040005000,
          account_id: 3,
          email: 'cafe5@gmail.com'
        },
        {
          name: 'Coffee Shop 3',
          address: '789 whatever street, van, bc',
          phone_number: 1234567890,
          account_id: 3,
          email: 'cafe6@gmail.com'
        },
      ]);
    })
    .then(() => {
      return knex('cx_source').insert([
        { source_id: 1, cx_account_id: 1 },
        { source_id: 2, cx_account_id: 1 },
        { source_id: 4, cx_account_id: 2 },
        { source_id: 3, cx_account_id: 2 },
        { source_id: 2, cx_account_id: 2 },
        { source_id: 1, cx_account_id: 2 },
        { source_id: 4, cx_account_id: 3 },
        { source_id: 5, cx_account_id: 3 },
      ]);
    })
    .then(() => {
      return knex('sx_source').insert([{ source_id: 1, sx_account_id: 4 }]);
    })
    .then(() => {
      return knex('entry').insert([
        {
          item_id: 1,
          weight: 5.55,
          created: '2020-03-27',
          last_edit: '2022-03-28',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 10,
          weight: 15.23,
          created: '2022-03-27',
          last_edit: '2022-03-28',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 10,
          weight: 24.23,
          created: '2022-02-27',
          last_edit: '2022-03-28',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 10,
          weight: 14.23,
          created: '2022-01-27',
          last_edit: '2022-03-28',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 10,
          weight: 74.63,
          created: '2022-01-27',
          last_edit: '2022-03-28',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 10,
          weight: 54.28,
          created: '2022-04-27',
          last_edit: '2022-03-28',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 10,
          weight: 14.23,
          created: '2022-04-27',
          last_edit: '2022-03-28',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 2,
          weight: 15.55,
          created: '2022-03-28',
          last_edit: '2022-03-29',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 3,
          weight: 34.55,
          created: '2022-03-28',
          last_edit: '2022-03-29',
          source_id: 1,
          account_id: 2,
        },
        {
          item_id: 2,
          weight: 15.55,
          created: '2022-04-28',
          last_edit: '2022-04-29',
          source_id: 1,
          account_id: 1,
        },
        {
          item_id: 3,
          weight: 34.55,
          created: '2022-04-28',
          last_edit: '2022-04-29',
          source_id: 1,
          account_id: 1,
        },
        {
          item_id: 4,
          weight: 50,
          created: '2022-01-31',
          last_edit: '2022-01-31',
          source_id: 2,
          account_id: 1,
        },
        {
          item_id: 5,
          weight: 20,
          created: '2022-02-01',
          last_edit: '2022-02-01',
          source_id: 3,
          account_id: 2,
        },
        {
          item_id: 4,
          weight: 20,
          created: '2022-04-01',
          last_edit: '2022-04-01',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 1,
          weight: 5.55,
          created: '2022-01-28',
          last_edit: '2022-01-29',
          source_id: 1,
          account_id: 1,
        },
        {
          item_id: 2,
          weight: 15.55,
          created: '2022-01-28',
          last_edit: '2022-01-29',
          source_id: 1,
          account_id: 1,
        },
        {
          item_id: 3,
          weight: 34.55,
          created: '2022-01-28',
          last_edit: '2022-01-29',
          source_id: 1,
          account_id: 1,
        },
        {
          item_id: 4,
          weight: 50,
          created: '2022-01-31',
          last_edit: '2022-02-15',
          source_id: 2,
          account_id: 1,
        },
        {
          item_id: 5,
          weight: 20,
          created: '2022-02-01',
          last_edit: '2022-02-01',
          source_id: 3,
          account_id: 2,
        },
        {
          item_id: 4,
          weight: 20,
          created: '2022-04-01',
          last_edit: '2022-04-01',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 5,
          weight: 10,
          created: '2022-04-01',
          last_edit: '2022-04-01',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 6,
          weight: 9,
          created: '2022-04-01',
          last_edit: '2022-04-01',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 4,
          weight: 13,
          created: '2022-04-08',
          last_edit: '2022-04-08',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 5,
          weight: 4,
          created: '2022-04-08',
          last_edit: '2022-04-08',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 6,
          weight: 14,
          created: '2022-04-08',
          last_edit: '2022-04-08',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 4,
          weight: 14,
          created: '2022-04-15',
          last_edit: '2022-04-15',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 5,
          weight: 18,
          created: '2022-04-15',
          last_edit: '2022-04-15',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 6,
          weight: 20,
          created: '2022-04-15',
          last_edit: '2022-04-15',
          source_id: 4,
          account_id: 3,
        },
        {
          item_id: 4,
          weight: 1,
          created: '2022-04-05',
          last_edit: '2022-04-05',
          source_id: 5,
          account_id: 3,
        },
        {
          item_id: 9,
          weight: 3,
          created: '2022-04-05',
          last_edit: '2022-04-05',
          source_id: 5,
          account_id: 3,
        },
        {
          item_id: 6,
          weight: 15,
          created: '2022-04-05',
          last_edit: '2022-04-05',
          source_id: 5,
          account_id: 3,
        },
        {
          item_id: 4,
          weight: 3,
          created: '2022-04-12',
          last_edit: '2022-04-12',
          source_id: 5,
          account_id: 3,
        },
        {
          item_id: 9,
          weight: 23,
          created: '2022-04-12',
          last_edit: '2022-04-12',
          source_id: 5,
          account_id: 3,
        },
        {
          item_id: 6,
          weight: 2,
          created: '2022-04-12',
          last_edit: '2022-04-12',
          source_id: 5,
          account_id: 3,
        },
        {
          item_id: 4,
          weight: 12,
          created: '2022-04-19',
          last_edit: '2022-04-19',
          source_id: 5,
          account_id: 3,
        },
        {
          item_id: 9,
          weight: 4,
          created: '2022-04-19',
          last_edit: '2022-04-19',
          source_id: 5,
          account_id: 3,
        },
        {
          item_id: 6,
          weight: 10,
          created: '2022-04-19',
          last_edit: '2022-04-19',
          source_id: 5,
          account_id: 3,
        },
      ]);
    });
};
