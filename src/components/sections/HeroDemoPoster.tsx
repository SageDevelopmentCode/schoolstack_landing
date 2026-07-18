import Image from "next/image";

const STUDENT_THUMBS = [
  {
    name: "Emma",
    src: "/images/people/students/cristina-anne-costello-i8n-TbgzSUE-unsplash-thumb.webp",
  },
  {
    name: "Jake",
    src: "/images/people/students/ibrahim-guetar-NUkjka_RqUE-unsplash-thumb.webp",
  },
  {
    name: "Liam",
    src: "/images/people/students/vitaly-gariev-_z2Ii760I38-unsplash-thumb.webp",
  },
] as const;

export default function HeroDemoPoster() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white font-secondary">
      <header className="flex shrink-0 items-center border-b border-gray-100 px-6 py-3">
        <Image
          src="/images/Logo.webp"
          alt=""
          aria-hidden="true"
          width={28}
          height={28}
          className="h-7 w-auto object-contain"
        />
      </header>
      <div className="flex-1 overflow-hidden px-6 py-8">
        <div className="relative mb-8 h-48 overflow-hidden rounded-2xl shadow-sm">
          <Image
            src="/images/stock/ImageOne.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1100px) 100vw, 1100px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-6">
            <p className="text-sm text-white/75">Good morning,</p>
            <p className="text-3xl font-bold leading-tight text-white">Sarah.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {STUDENT_THUMBS.map((child) => (
            <div
              key={child.name}
              className="flex flex-col items-center gap-3 p-4"
            >
              <Image
                src={child.src}
                alt=""
                aria-hidden="true"
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <p className="text-sm font-semibold text-gray-800">{child.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
