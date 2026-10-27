export default async function check({ document }) {
  const table = document.querySelector("body table");
  const headRows = table ? table.querySelectorAll("thead > tr") : [];
  const headings = headRows[0] ? headRows[0].querySelectorAll("th").length : 0;
  const bodyRows = table ? [...table.querySelectorAll("tbody > tr")] : [];
  const shortRow = bodyRows.findIndex((row) => row.querySelectorAll("td").length !== headings);

  return [
    {
      id: "header-row",
      title: "A thead with one row of three th cells",
      pass: headRows.length === 1 && headings === 3,
      hint: table
        ? `thead has ${headRows.length} row(s) with ${headings} th cell(s) in the first; it should be one row with Day, Time, and Topic.`
        : "Add a <table> with a <thead> inside the schedule section."
    },
    {
      id: "body-rows",
      title: "A tbody with three rows of meetings",
      pass: bodyRows.length === 3,
      hint: `tbody has ${bodyRows.length} row(s); it should have one <tr> per meeting, three in all.`
    },
    {
      id: "cells-match-columns",
      title: "Every body row has as many cells as there are headings",
      pass: headings > 0 && bodyRows.length > 0 && shortRow === -1,
      hint:
        shortRow === -1
          ? "Add the head and body first; this check compares them."
          : `Row ${shortRow + 1} of the body has ${bodyRows[shortRow].querySelectorAll("td").length} td cell(s) instead of ${headings}.`
    }
  ];
}
