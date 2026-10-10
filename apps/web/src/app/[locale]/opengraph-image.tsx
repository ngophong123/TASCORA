import { ImageResponse } from "next/og"

export const alt = "TASCORA — Independent talent. Shared ambition."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#faf9f6",
        color: "#202329",
        padding: "64px 72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            background: "#5046a5",
            color: "#fff",
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          T
        </div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: "-1px" }}>
          TASCORA
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            lineHeight: 1.05,
            letterSpacing: "-3px",
            fontWeight: 600,
          }}
        >
          Good work starts
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            lineHeight: 1.05,
            letterSpacing: "-3px",
            fontWeight: 600,
            color: "#5046a5",
          }}
        >
          with the right people.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #deded7",
          paddingTop: 24,
          fontSize: 20,
          color: "#52565f",
        }}
      >
        <div style={{ display: "flex" }}>Independent talent. Shared ambition.</div>
        <div style={{ display: "flex" }}>Explore · Connect · Create</div>
      </div>
    </div>,
    size
  )
}
