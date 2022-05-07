const { exportSPKI } = require('jose');
const { dateToYMD } = require('./date');

const generateXAxis = (startDate, endDate) => {
  let start = new Date(`"${startDate}"`);
  let end = new Date(`"${endDate}"`);
  let XAxisArray = [dateToYMD(start)];
  do {
    start = new Date(start.setDate(start.getDate() + 1));
    XAxisArray.push(dateToYMD(start));
  } while (dateToYMD(start) != dateToYMD(end));
  console.log('xaxisarray is', XAxisArray);
  return XAxisArray;
};

function compare(a, b) {
  if (a.item_name < b.item_name) {
    return -1;
  }
  if (a.item_name > b.item_name) {
    return 1;
  }
  return 0;
}

const colours = [
  'rgba(255, 99, 132, 0.7)',
  'rgba(54, 162, 235, 0.7)',
  'rgba(255, 206, 86, 0.7)',
  'rgba(75, 192, 192, 0.7)',
  'rgba(153, 102, 255, 0.7)',
  'rgba(255, 159, 64, 0.7)',
];

/******
// Things to do to make a dataset that looks like this for EVERY SOURCE:
[
  {
    label: 'PAper Cups', // item name
    data: [5.55, 5.00, 20.00], // weights
    borderColor: 'rgba(255, 99, 132, 0.5)',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
  },
  {
    label: 'Coffee Chafs',
    data: [1, 2, 3, 4, 5, 6, 7, 8],
    borderColor: 'rgb(53, 162, 235)',
    backgroundColor: 'rgba(53, 162, 235, 0.5)',
  },
];

Graph component needs: label, data, rgba colour.

1. Filter api result so info is separated by source name
2. Filter result by itemName
3. Set label as itemName
4. Make an array of weights for each item

****/
const generateDataset = (input, startDate, endDate) => {
  let datesArray = generateXAxis(startDate, endDate);

  if (input.length === 0) {
    return [];
  }

  let items = [];

  input.forEach((entry) => {
    let item = items.find((item) => item.itemName === entry.itemName);
    if (item) {
      item.data.push(Number(entry.totalWeight));
      item.date.push(entry.date);
    } else {
      items.push({
        itemName: entry.itemName,
        data: [Number(entry.totalWeight)],
        date: [entry.date],
      });
    }
  });

  let structure = [];

  items.forEach((item) => {
    console.log(
      `i am the end product of the ugly for loop. items: ${item.data}`
    );
    let structureData = [];
    let structureDate = [];
    datesArray.forEach((date, i) => {
      // // let found = item.find((item) => item.date === date);
      // console.log('item.date', item.date[i]);
      // console.log('comared to date', date);
      // let found = item.date.find((item) => item.date === date);
      item.date.forEach((d, j) => {
        if (d == date) {
          // structureData.push(item.data[i])
          structureData[i] = item.data[j];
          structureDate[i] = item.date[j];
        }
      });
    });
    item.data = structureData;
  });

  items.forEach((item, index) => {
    structure.push({
      label: item.itemName, // item name
      data: item.data, // weights
      borderColor: colours[index],
      backgroundColor: colours[index],
    });
  });

  // input.forEach((item) => {
  //   if (item.nam) {
  //   }

  //   data.push(Number(item.totalWeight));
  // });

  return structure;
};

// function that returns an array of objects for a given source
const filterEntriesBySource = (input) => {
  let sources = {}; // ['cafe 1', 'cafe2']
  // for (const entry of input) {
  //   let source = Object.keys(sources);

  //   let found = source.find((key) => key === entry.sourceName);

  //   if (found) {
  //     sources[entry.sourceName] = [
  //       ...sources[entry.sourceName],
  //       {
  //         itemName: entry.itemName,
  //         date: entry.date,
  //         totalWeight: entry.totalWeight,
  //       },
  //     ];
  //   } else {
  //     // else items.push({ itemName: '', data: [] })
  //     // then set item[i].data.push(entry.totalWeight)
  //     sources[entry.sourceName] = [
  //       {
  //         itemName: entry.itemName,
  //         date: entry.date,
  //         totalWeight: entry.totalWeight,
  //       },
  //     ];
  //   }
  // }
  input.forEach((entry) => {
    // let source = sources.find(
    //   (source) => source.sourceName === entry.sourceName
    // );
    let source = Object.keys(sources);

    let found = source.find((key) => key === entry.sourceName);

    if (found) {
      sources[entry.sourceName] = [
        ...sources[entry.sourceName],
        {
          itemName: entry.itemName,
          date: entry.date,
          totalWeight: entry.totalWeight,
        },
      ];
    } else {
      // else items.push({ itemName: '', data: [] })
      // then set item[i].data.push(entry.totalWeight)
      sources[entry.sourceName] = [
        {
          itemName: entry.itemName,
          date: entry.date,
          totalWeight: entry.totalWeight,
        },
      ];
    }
  });
  console.log('SOURCES: ', sources);
  return sources;
};

module.exports = { generateDataset, filterEntriesBySource };
