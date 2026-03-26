// ============================================
// Google Apps Script - D'CENT 이벤트 시트 연동
// ============================================
//
// 설정 방법:
// 1. Google Sheets에서 새 스프레드시트 생성
// 2. 첫 번째 행에 헤더 입력: 타임스탬프 | 이메일 | 당첨유형 | 상세 | 쿠폰코드
// 3. 확장 프로그램 > Apps Script 클릭
// 4. 아래 코드를 전체 복사하여 붙여넣기
// 5. 배포 > 새 배포 > 웹 앱 선택
//    - 실행 주체: 나
//    - 액세스 권한: 모든 사용자
// 6. 배포 후 나오는 URL을 event.html의 GOOGLE_SHEET_URL에 붙여넣기
//

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp,
      data.email,
      data.type,
      data.detail,
      data.code
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('D\'CENT Event API is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
