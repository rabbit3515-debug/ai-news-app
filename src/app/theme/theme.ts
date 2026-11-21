// 다크/라이트 테마 상태. <html> 의 `dark` 클래스가 Tailwind `dark:` 변형을 켠다
// (globals.css 의 @custom-variant). 사용자가 고른 값은 localStorage 에 저장하고,
// 고른 적이 없으면 OS 설정(prefers-color-scheme)을 따른다.

export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

// 첫 페인트 전에 <head> 에서 동기 실행되는 스크립트. 서버는 사용자 설정을 모르므로
// 이 스크립트가 HTML 파싱 중에 `dark` 클래스를 붙여 화면 깜빡임을 막는다.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage 를 쓸 수 없으면 OS 설정을 따른다.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}
