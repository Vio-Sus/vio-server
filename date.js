function dateToYMD(date) {
  let yyyy = date.getFullYear();
  let mm = (date.getMonth() + 1).toString().padStart(2, '0');
  let dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = {dateToYMD};