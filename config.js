// =====================================================================
// 여기에 앱스크립트 '웹 앱' 배포 URL을 붙여넣으세요.
// 예: https://script.google.com/macros/s/AKfycb.......길게.../exec
// =====================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbw_FqqolLDkyqOqervaVn8F9rHKSAOK1qP5ZR-5-xlOHq_QvhcvrZNlRrBdIJq0PYQOhg/exec";
// =====================================================================

async function apiGet(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${API_URL}?${qs}`);
  return res.json();
}

async function apiPost(action, body = {}) {
  // Apps Script는 application/json 헤더를 쓰면 브라우저가 preflight(OPTIONS) 요청을
  // 먼저 보내는데 이걸 처리 못 해서 실패해요. text/plain으로 보내고 서버에서
  // 문자열을 JSON.parse 하는 방식으로 우회합니다.
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...body })
  });
  return res.json();
}

// 사이트 전역 배경색 적용 (관리자 페이지에서 설정한 값)
function setBgVars(settings) {
  if (!settings) return;
  const root = document.documentElement.style;
  if (settings.bgColor1) root.setProperty("--bg-page-1", settings.bgColor1);
  if (settings.bgColor2) root.setProperty("--bg-page-2", settings.bgColor2);
  if (settings.buttonColor) root.setProperty("--btn-accent", settings.buttonColor);
}

async function applyBackgroundColors() {
  // 1) 캐시된 값이 있으면 먼저 즉시 적용 (깜빡임 방지 + 오프라인 대비)
  try {
    const cached = localStorage.getItem("quiz_bgColors");
    if (cached) setBgVars(JSON.parse(cached));
  } catch (e) {}

  // 2) 서버에서 최신값 받아와서 갱신
  try {
    const res = await apiGet("settings");
    if (res.ok) {
      setBgVars(res.settings);
      localStorage.setItem("quiz_bgColors", JSON.stringify(res.settings));
    }
  } catch (e) {
    // 네트워크 실패시 캐시된 값 그대로 유지 (조용히 무시)
  }
}

// 파일(이미지)을 base64 문자열로 변환
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
