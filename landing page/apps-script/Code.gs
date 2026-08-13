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
  var data = {};
  if (e && e.postData && e.postData.contents) {
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = {}; }
  }
  if (data && data.action === "delete") {
    var okD = checkKey_(data.key);
    if (okD !== true) return okD;
    return deleteRow_(data.row);
  }
  if (data && data.action === "update") {
    var okU = checkKey_(data.key);
    if (okU !== true) return okU;
    return updateRow_(data.row, data.fields);
  }
  return handleRequest(e);
}

function checkKey_(key) {
  if (key !== ADMIN_KEY) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: "Unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return true;
}

function jsonResult_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteRow_(rowNum) {
  try {
    if (!rowNum || rowNum < 2) return jsonResult_({ result: "error", message: "Invalid row number." });
    var sheet = getOrCreateSheet_(SHEET_NAME);
    var lastRow = sheet.getLastRow();
    if (rowNum > lastRow) return jsonResult_({ result: "error", message: "Row out of range." });
    sheet.deleteRow(rowNum);
    CacheService.getScriptCache().remove("signup_rows");
    return jsonResult_({ result: "success", deleted: rowNum });
  } catch (err) {
    return jsonResult_({ result: "error", message: String(err) });
  }
}

function updateRow_(rowNum, fields) {
  try {
    if (!rowNum || rowNum < 2) return jsonResult_({ result: "error", message: "Invalid row number." });
    var sheet = getOrCreateSheet_(SHEET_NAME);
    var lastRow = sheet.getLastRow();
    if (rowNum > lastRow) return jsonResult_({ result: "error", message: "Row out of range." });
    var headers = [
      "Full Name", "Email", "Phone Number", "Profession",
      "Class Time", "Level", "Message", "Submitted At"
    ];
    var colMap = {};
    headers.forEach(function (h, idx) { colMap[h] = idx + 1; });

    var updates = [];
    for (var h in fields) {
      if (colMap[h]) {
        updates.push([rowNum, colMap[h], String(fields[h] == null ? "" : fields[h])]);
      }
    }
    if (updates.length === 0) return jsonResult_({ result: "error", message: "No valid fields to update." });
    updates.forEach(function (u) { sheet.getRange(u[0], u[1]).setValue(u[2]); });
    CacheService.getScriptCache().remove("signup_rows");
    var updated = sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
    return jsonResult_({ result: "success", updated: rowNum, row: updated });
  } catch (err) {
    return jsonResult_({ result: "error", message: String(err) });
  }
}

function handleRequest(e) {

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
    // Serve from cache when possible so the admin panel loads fast.
    var cache = CacheService.getScriptCache();
    var cached = cache.get("signup_rows");
    if (cached) {
      return ContentService
        .createTextOutput(cached)
        .setMimeType(ContentService.MimeType.JSON);
    }
    var sheet = getOrCreateSheet_(SHEET_NAME);
    var lastRow = sheet.getLastRow();
    var rows = [];
    if (lastRow > 0) {
      rows = sheet.getRange(1, 1, lastRow, 8).getValues();
    }
    var out = JSON.stringify({ result: "success", rows: rows });
    cache.put("signup_rows", out, 60);
    return ContentService
      .createTextOutput(out)
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
  // Keep phone numbers as plain text (column 3) so Google Sheets
  // doesn't turn them into numbers / formulas.
  sheet.getRange(1, 3, Math.max(500, sheet.getMaxRows()), 1).setNumberFormat("@");
}