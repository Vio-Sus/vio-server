import { generateDataset, filterEntriesBySource } from './chartHelpers';
import { graphApi } from './mockData';

   let datesArray = [
     '2022-01-28',
     '2022-01-29',
     '2022-01-30',
     '2022-01-31',
     '2022-02-01',
   ];

describe('make chart dataset', () => {
  test('empty array returns empty', () => {
    // define the input
    let input = [];


    // define the expected output
    const expected = [];

    // test it
    expect(generateDataset(input, datesArray)).toEqual(expected);
  });

  test('given 1 entry', () => {
    // define the input
    let input = [
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.55',
      },
    ];

    // define the expected output
    const expected = [
      {
        label: 'Paper Cups', // item name
        data: [5.55], // weights
      },
    ];

    // test it
    expect(
      generateDataset(input, datesArray).map((a) => ({
        label: a.label,
        data: a.data,
      }))
    ).toEqual(expected);
  });

  test('given 2 entries', () => {
    // define the input
    let input = [
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-29',
        totalWeight: '15.55',
      },
    ];

    // define the expected output
    const expected = [
      {
        label: 'Paper Cups', // item name
        data: [5.55, 15.55], // weights
      },
    ];

    // test it
    expect(
      generateDataset(input, datesArray).map((a) => ({
        label: a.label,
        data: a.data,
      }))
    ).toEqual(expected);
  });

  test('given 2 entries with 2 different items', () => {
    // define the input
    let input = [
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.55',
      },
      {
        itemName: 'Coffee Chaff',
        sourceName: 'Cafe 1',
        date: '2022-01-29',
        totalWeight: '15.55',
      },
    ];

    // define the expected output
    const expected = [
      {
        label: 'Paper Cups', // item name
        data: [5.55], // weights
      },
      {
        label: 'Coffee Chaff', // item name
        data: [, 15.55], // weights
      },
    ];

    // test it
    expect(
      generateDataset(input, datesArray).map((a) => ({
        label: a.label,
        data: a.data,
      }))
    ).toEqual(expected);
  });

  test('given entries with many items and many weights', () => {
    // define the input
    let input = [
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.00',
      },
      {
        itemName: 'Coffee Pods',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.00',
      },
      {
        itemName: 'Coffee Chaffs',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.00',
      },
      {
        itemName: 'Coffee Pods',
        sourceName: 'Cafe 1',
        date: '2022-01-29',
        totalWeight: '5.00',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-29',
        totalWeight: '20.00',
      },
    ];

    // define the expected output
    const expected = [
      {
        label: 'Paper Cups', // item name
        data: [5.0, 20.0], // weights
      },
      {
        label: 'Coffee Pods', // item name
        data: [5.0, 5.0], // weights
      },
      {
        label: 'Coffee Chaffs', // item name
        data: [5.0], // weights
      },
    ];

    // test it
    expect(
      generateDataset(input, datesArray).map((a) => ({
        label: a.label,
        data: a.data,
      }))
    ).toEqual(expected);
  });

  test('given xAxis labels, add empty array items', () => {
    // define the input
    let input = [
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-29',
        totalWeight: '15.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-30',
        totalWeight: '5.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-02-01',
        totalWeight: '15.55',
      },
    ];

    let datesArray = [
      '2022-01-28',
      '2022-01-29',
      '2022-01-30',
      '2022-01-31',
      '2022-02-01',
    ];

    // define the expected output
    const expected = [
      {
        label: 'Paper Cups', // item name
        data: [5.55, 15.55, 5.55, , 15.55], // weights
      },
    ];

    // test it
    expect(
      generateDataset(input, datesArray).map((a) => ({
        label: a.label,
        data: a.data,
      }))
    ).toEqual(expected);
  });

  test('given xAxis labels, multiple sources skipping dates', () => {
    // define the input
    let input = [
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-29',
        totalWeight: '15.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-30',
        totalWeight: '5.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-02-01',
        totalWeight: '15.55',
      },
      {
        itemName: 'Paper Poop',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '15.55',
      },
      {
        itemName: 'Paper Poop',
        sourceName: 'Cafe 1',
        date: '2022-01-30',
        totalWeight: '5.55',
      },
      {
        itemName: 'Paper Poop',
        sourceName: 'Cafe 1',
        date: '2022-01-31',
        totalWeight: '15.55',
      },
    ];

    // define the expected output
    const expected = [
      {
        label: 'Paper Cups', // item name
        data: [5.55, 15.55, 5.55, , 15.55], // weights
      },
      {
        label: 'Paper Poop', // item name
        data: [15.55, , 5.55, 15.55], // weights
      },
    ];

    // test it
    expect(
      generateDataset(input, datesArray).map((a) => ({
        label: a.label,
        data: a.data,
      }))
    ).toEqual(expected);
  });
});

describe('filter data by source', () => {
  test('given 3 sources return 3 objects', () => {
    // define the input
    let input = [
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 1',
        date: '2022-01-28',
        totalWeight: '5.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 2',
        date: '2022-01-29',
        totalWeight: '15.55',
      },
      {
        itemName: 'Paper Cups',
        sourceName: 'Cafe 3',
        date: '2022-01-30',
        totalWeight: '5.55',
      },
      {
        itemName: 'Coffee Chaff',
        sourceName: 'Cafe 1',
        date: '2022-02-01',
        totalWeight: '15.55',
      },
    ];

    let expectedThing = [];
    input.forEach((item) => {
      //get array of source names
      // loop though input to find same source name
      //// if input sourcename == array sourcename push input stuff into expectedThing
    });

    // define the expected output
    const expectedArray = [
      {
        source: 'Cafe 1',
        entries: [
          {
            itemName: 'Paper Cups',
            date: '2022-01-28',
            totalWeight: '5.55',
          },
          {
            itemName: 'Coffee Chaff',
            date: '2022-02-01',
            totalWeight: '15.55',
          },
        ],
      },
      {
        source: 'Cafe 2',
        entries: [
          {
            itemName: 'Paper Cups',
            date: '2022-01-29',
            totalWeight: '15.55',
          },
        ],
        // dataset: generateDataset(this.entries)
      },
      {
        source: 'Cafe 3',
        entries: [
          {
            itemName: 'Paper Cups',
            date: '2022-01-29',
            totalWeight: '15.55',
          },
        ],
      },
    ];

    const expectedObj = {
      'Cafe 1': [
        {
          itemName: 'Paper Cups',
          date: '2022-01-28',
          totalWeight: '5.55',
        },
        {
          itemName: 'Coffee Chaff',
          date: '2022-02-01',
          totalWeight: '15.55',
        },
      ],
      'Cafe 2': [
        {
          itemName: 'Paper Cups',
          date: '2022-01-29',
          totalWeight: '15.55',
        },
      ],
      'Cafe 3': [
        {
          itemName: 'Paper Cups',
          date: '2022-01-30',
          totalWeight: '5.55',
        },
      ],
    };

    // test it
    expect(filterEntriesBySource(input)).toEqual(expectedObj);
  });
});
