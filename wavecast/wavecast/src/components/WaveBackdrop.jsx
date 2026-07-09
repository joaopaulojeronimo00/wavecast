// Camadas de ondas decorativas do hero, reproduzindo o mockup:
// linhas onduladas sobrepostas, sutis, atrás do conteúdo.
export default function WaveBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-cream"
      viewBox="0 0 1280 700"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M-20 330c53 0 53-38 107-38s53 38 107 38 53-38 107-38 53 38 107 38 53-38 107-38 53 38 107 38 53-38 107-38 53 38 107 38 53-38 107-38 53 38 107 38 53-38 107-38"
        stroke="currentColor"
        strokeOpacity="0.07"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M-20 420c53 0 53-32 107-32s53 32 107 32 53-32 107-32 53 32 107 32 53-32 107-32 53 32 107 32 53-32 107-32 53 32 107 32 53-32 107-32 53 32 107 32"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M-20 500c53 0 53-26 107-26s53 26 107 26 53-26 107-26 53 26 107 26 53-26 107-26 53 26 107 26 53-26 107-26 53 26 107 26 53-26 107-26 53 26 107 26"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}
