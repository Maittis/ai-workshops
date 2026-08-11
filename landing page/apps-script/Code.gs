/**
 * AI-Preneur Workshops — Google Sheets signup collector
 *
 * SETUP (see README.md for full steps):
 *   1. Create a Google Sheet for signups.
 *   2. Extensions > Apps Script, paste this file into Code.gs, and save.
 *   3. Deploy as a NEW "Web app":
 *        - Execute as:      Me
 *        - Who has access:  Anyone
 *   4. Copy the /exec URL into assets/script.js as APPS_SCRIPT_URL.
 *
 * The script appends every signup from the landing page as a new row
 * in the sheet and creates the header row automatically on first use.
 */

var SHEET_NAME = "Signups"; // tab inside your spreadsheet

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && Object.keys(e.parameter).length) {
      data = e.parameter;
    }

    var sheet = getOrCreateSheet_(SHEET_NAME);
    var headers = [
      "Full Name", "Email", "Phone Number", "Profession",
      "Class Time", "Level", "Message", "Submitted At"
    ];

    prepareHeaders_(sheet, headers);

    var row = headers.map(function (h) {
      return (data[h] !== undefined && data[h] !== null) ? String(data[h]) : "";
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", row: row }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function prepareHeaders_(sheet, headers) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
}