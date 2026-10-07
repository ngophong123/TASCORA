import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "TASCORA — Connect. Work. Deliver. | Modern Freelance Marketplace"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        padding: "60px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Stripe Diagonal Multi-Color Sweep Band */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          right: "-180px",
          width: "600px",
          height: "920px",
          background: "linear-gradient(135deg, #635BFF 0%, #DF1B41 38%, #FF8A00 72%, #FFC700 100%)",
          transform: "rotate(-16deg)",
          borderRadius: "56px",
          opacity: 0.98,
          boxShadow: "0 30px 80px rgba(99, 91, 255, 0.4)",
          display: "flex",
        }}
      />

      {/* Floating Mockup Card on the right */}
      <div
        style={{
          position: "absolute",
          top: "135px",
          right: "55px",
          width: "430px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "26px",
          boxShadow: "0 24px 60px rgba(10, 10, 35, 0.25), 0 4px 16px rgba(99, 91, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          zIndex: 10,
        }}
      >
        {/* Card Top Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              backgroundColor: "#F4F3FF",
              borderRadius: "999px",
              border: "1px solid rgba(99, 91, 255, 0.2)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: "#635BFF",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#4F46E5",
                letterSpacing: "0.06em",
              }}
            >
              MILESTONE ESCROW
            </span>
          </div>
          <span
            style={{ fontSize: "14px", fontWeight: 800, color: "#0A0A23", fontFamily: "monospace" }}
          >
            $1,450.00
          </span>
        </div>

        {/* Project Title */}
        <div style={{ fontSize: "16px", fontWeight: 800, color: "#0A0A23", lineHeight: 1.3 }}>
          Full-Stack Next.js 15 & AI Production Architecture
        </div>

        {/* Specialist Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #635BFF 0%, #DF1B41 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "16px",
            }}
          >
            AM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0A0A23" }}>
              Alexandre Moreau
            </span>
            <span style={{ fontSize: "12px", color: "#4B4B5C" }}>
              Senior Systems Architect · 5.0 (128 reviews)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#EAEAF0",
              borderRadius: "999px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                width: "75%",
                height: "100%",
                background: "linear-gradient(90deg, #635BFF 0%, #DF1B41 50%, #FF8A00 100%)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "#6B6B7B",
            }}
          >
            <span>Phase 2 of 3 Completed</span>
            <span style={{ fontWeight: 800, color: "#0A0A23" }}>75%</span>
          </div>
        </div>
      </div>

      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", zIndex: 10 }}>
        {/* Logo Glyph */}
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "16px",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(10, 10, 35, 0.12)",
            boxShadow: "0 4px 16px rgba(99, 91, 255, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #635BFF 0%, #DF1B41 50%, #FF8A00 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 900,
              fontSize: "22px",
            }}
          >
            T
          </div>
        </div>

        {/* Logo Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: "34px",
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          <span style={{ color: "#0A0A23" }}>TASCOR</span>
          <span style={{ color: "#635BFF" }}>A</span>
        </div>

        <div
          style={{
            marginLeft: "12px",
            padding: "5px 12px",
            backgroundColor: "#F4F3FF",
            borderRadius: "999px",
            border: "1px solid rgba(99, 91, 255, 0.25)",
            fontSize: "11px",
            fontWeight: 800,
            color: "#4F46E5",
            letterSpacing: "0.08em",
          }}
        >
          FREELANCE INFRASTRUCTURE
        </div>
      </div>

      {/* Center Content Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxWidth: "560px",
          zIndex: 10,
        }}
      >
        {/* Main Headline */}
        <div
          style={{
            fontSize: "62px",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#0A0A23",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", gap: "14px" }}>
            <span style={{ color: "#635BFF" }}>Connect.</span>
            <span>Work.</span>
          </div>
          <span>Deliver.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "21px",
            fontWeight: 450,
            lineHeight: 1.45,
            color: "#4B4B5C",
          }}
        >
          Hire vetted independent specialists and ship production engineering, design, and AI
          automation with guaranteed milestone escrow.
        </div>
      </div>

      {/* Bottom Feature Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", zIndex: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#0A0A23",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              backgroundColor: "#635BFF",
            }}
          />
          100% Escrow Protection
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#0A0A23",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              backgroundColor: "#DF1B41",
            }}
          />
          Vetted Top 1% Specialists
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#0A0A23",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              backgroundColor: "#FF8A00",
            }}
          />
          0% Hidden Fees
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
