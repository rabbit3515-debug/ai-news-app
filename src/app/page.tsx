import { redirect } from "next/navigation";

// 메인 화면은 /dashboard 이다. 로그인 여부 확인은 proxy.ts 가 처리한다.
export default function Home() {
  redirect("/dashboard");
}
