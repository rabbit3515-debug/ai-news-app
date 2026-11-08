import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold">AI 뉴스</h1>
        <div className="flex items-center gap-4">
          <Link href="/categories" className="text-sm hover:underline">
            카테고리 관리
          </Link>
          <UserButton />
        </div>
      </header>
      <main className="flex-1 p-6">
        <p className="text-zinc-500">로그인되었습니다.</p>
      </main>
    </div>
  );
}
