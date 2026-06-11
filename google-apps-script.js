const SHEET_NAME = "RSVP";

function doPost(e) {
  try {
    const sheet = getSheet();
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    sheet.appendRow([
      new Date(),
      data.language || "",
      data.fullName || "",
      data.fullNameLatin || "",
      data.presence || "",
      data.email || "",
      data.phone || "",
      Array.isArray(data.food) ? data.food.join(", ") : "",
      data.restrictions || "",
      data.comment || "",
      data.createdAt || "",
      data.partnerNameLatin || ""
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Привяжите Apps Script к Google Таблице через Extensions → Apps Script.");
  }

  let sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    "Server time",
    "Language",
    "Full name",
    "Latin name",
    "Presence",
    "Email",
    "Phone",
    "Food",
    "Restrictions",
    "Comment",
    "Client time",
    "Partner name (Latin)"
  ];

  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
  } else {
    const currentHeaders = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), headers.length)).getValues()[0];
    headers.forEach((header, index) => {
      if (!currentHeaders[index]) {
        sh.getRange(1, index + 1).setValue(header);
      }
    });
  }

  return sh;
}
