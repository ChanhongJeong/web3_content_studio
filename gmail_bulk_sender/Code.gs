/**
 * 구글 시트 → Gmail 개별 발송 도구
 * 시트 1행은 헤더. "이메일" 열은 필수, 나머지 열은 본문에서 {{열이름}}으로 사용.
 */
const STATUS_HEADER = '발송상태';
const TIME_LIMIT_MS = 5 * 60 * 1000; // Apps Script 6분 제한 전에 멈춤

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📧 메일 발송')
    .addItem('발송 창 열기', 'openDialog')
    .addToUi();
}

function openDialog() {
  const html = HtmlService.createHtmlOutputFromFile('Dialog').setWidth(800).setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, '메일 개별 발송');
}

function getSheetInfo_() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map(h => String(h).trim());
  // 헤더 이름과 상관없이, 실제로 메일 주소(@)가 들어 있는 열을 찾음
  const data = values.slice(1);
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
  const emailCol = headers.findIndex((h, c) => data.some(r => isEmail(r[c])));
  if (emailCol < 0) throw new Error('메일 주소가 들어 있는 열을 찾지 못했어요. 2행부터 메일 주소를 넣어 주세요.');
  let statusCol = headers.indexOf(STATUS_HEADER);
  if (statusCol < 0) {
    statusCol = headers.length;
    sheet.getRange(1, statusCol + 1).setValue(STATUS_HEADER).setFontWeight('bold');
    headers.push(STATUS_HEADER);
  }
  return { sheet, values, headers, emailCol, statusCol };
}

function fill_(tpl, headers, row, html) {
  return tpl.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m, key) => {
    const i = headers.indexOf(key.replace(/&nbsp;/g, ' ').trim());
    if (i < 0) return m;
    const v = String(row[i] || '');
    return html ? v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : v;
  });
}

/** 서식 있는 본문(HTML) → 서식 없는 메일 앱용 텍스트 */
function toText_(html) {
  return html
    .replace(/<a [^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '· ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** 다이얼로그 초기 정보 */
function getInfo() {
  const { values, headers, emailCol, statusCol } = getSheetInfo_();
  const rows = values.slice(1).filter(r => r[emailCol]);
  const pending = rows.filter(r => r[statusCol] !== '완료').length;
  return {
    headers: headers.filter(h => h && h !== STATUS_HEADER),
    total: rows.length,
    pending,
    quota: MailApp.getRemainingDailyQuota(),
    me: Session.getActiveUser().getEmail()
  };
}

/** 첫 번째 명단 값으로 채워서 나에게 테스트 발송 */
function sendTest(form) {
  const { values, headers, emailCol } = getSheetInfo_();
  const row = values.slice(1).find(r => r[emailCol]);
  if (!row) throw new Error('명단이 비어 있어요.');
  const me = Session.getActiveUser().getEmail();
  send_(me, '[테스트] ' + fill_(form.subject, headers, row), fill_(form.body, headers, row, true), form);
  return me;
}

/** 실제 발송: 발송상태가 '완료'가 아닌 행만, 한 명씩 따로 */
function sendAll(form) {
  const start = Date.now();
  const { sheet, values, headers, emailCol, statusCol } = getSheetInfo_();
  let sent = 0, failed = 0, stopped = false;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const to = String(row[emailCol] || '').trim();
    if (!to || row[statusCol] === '완료') continue;
    if (Date.now() - start > TIME_LIMIT_MS || MailApp.getRemainingDailyQuota() < 1) { stopped = true; break; }

    const cell = sheet.getRange(i + 1, statusCol + 1);
    try {
      send_(to, fill_(form.subject, headers, row), fill_(form.body, headers, row, true), form);
      cell.setValue('완료');
      sent++;
    } catch (e) {
      cell.setValue('실패: ' + e.message);
      failed++;
    }
    SpreadsheetApp.flush();
  }
  const remaining = getInfo().pending;
  return { sent, failed, stopped, remaining };
}

function send_(to, subject, html, form) {
  const opts = { htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">' + html + '</div>' };
  if (form.senderName) opts.name = form.senderName;
  if (form.replyTo) opts.replyTo = form.replyTo;
  GmailApp.sendEmail(to, subject, toText_(html), opts);
}
