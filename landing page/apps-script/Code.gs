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

// Secret used by the online admin panel (panel/index.html) to read signups.
// Change this to any word/phrase only you know.
var ADMIN_KEY = "Solar-Mango-426";

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  // Online admin panel: GET ?action=list&key=ADMIN_KEY  ->  JSON of all rows
  if (e && e.parameter && e.parameter.action === "list") {
    return listRows(e.parameter.key);
  }
  return handleRequest(e);
}

function listRows(key) {
  try {
    if (key !== ADMIN_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var sheet = getOrCreateSheet_(SHEET_NAME);
    var lastRow = sheet.getLastRow();
    var rows = [];
    if (lastRow > 0) {
      rows = sheet.getRange(1, 1, lastRow, 8).getValues();
    }
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", rows: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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